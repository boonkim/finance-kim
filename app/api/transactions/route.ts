import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectMongo from '@/lib/mongodb';
import { getSessionUserId } from '@/lib/auth';
import { updateBalancesForTransaction } from '@/lib/balance';
import Transaction from '@/models/Transaction';

export async function GET(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '30', 10)));
    const accountId = searchParams.get('accountId');
    await connectMongo();
    const filter: { userId: typeof userId; fromAccountId?: mongoose.Types.ObjectId; toAccountId?: mongoose.Types.ObjectId } = { userId };
    if (accountId && mongoose.isValidObjectId(accountId)) {
      const id = new mongoose.Types.ObjectId(accountId);
      filter.$or = [{ fromAccountId: id }, { toAccountId: id }];
    }
    const list = await Transaction.find(filter)
      .sort({ transactionDate: -1, createdAt: -1 })
      .limit(limit)
      .populate('fromAccountId', 'name type')
      .populate('toAccountId', 'name type')
      .populate('categoryId', 'name type')
      .lean();
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const {
      type,
      fromAccountId,
      toAccountId,
      amount,
      categoryId,
      note,
      transactionDate,
    } = body as {
      type?: string;
      fromAccountId?: string;
      toAccountId?: string;
      amount?: number;
      categoryId?: string;
      note?: string;
      transactionDate?: string;
    };
    if (!type || amount == null || amount < 0) {
      return NextResponse.json(
        { error: 'type and amount (>= 0) are required' },
        { status: 400 }
      );
    }
    if (!['income', 'expense', 'transfer'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    if (type === 'expense' && !fromAccountId) {
      return NextResponse.json({ error: 'expense requires fromAccountId' }, { status: 400 });
    }
    if (type === 'income' && !toAccountId) {
      return NextResponse.json({ error: 'income requires toAccountId' }, { status: 400 });
    }
    if (type === 'transfer' && (!fromAccountId || !toAccountId)) {
      return NextResponse.json(
        { error: 'transfer requires fromAccountId and toAccountId' },
        { status: 400 }
      );
    }
    await connectMongo();
    const doc = await Transaction.create({
      userId,
      type,
      fromAccountId:
        fromAccountId && mongoose.isValidObjectId(fromAccountId)
          ? new mongoose.Types.ObjectId(fromAccountId)
          : undefined,
      toAccountId:
        toAccountId && mongoose.isValidObjectId(toAccountId)
          ? new mongoose.Types.ObjectId(toAccountId)
          : undefined,
      amount: Number(amount),
      categoryId:
        categoryId && mongoose.isValidObjectId(categoryId)
          ? new mongoose.Types.ObjectId(categoryId)
          : undefined,
      note: note != null ? String(note).trim() : undefined,
      transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
    });
    await updateBalancesForTransaction(doc.fromAccountId, doc.toAccountId);
    const populated = await Transaction.findById(doc._id)
      .populate('fromAccountId', 'name type')
      .populate('toAccountId', 'name type')
      .populate('categoryId', 'name type')
      .lean();
    return NextResponse.json(populated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
