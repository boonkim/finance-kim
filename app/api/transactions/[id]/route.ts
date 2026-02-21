import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectMongo from '@/lib/mongodb';
import { getSessionUserId } from '@/lib/auth';
import { updateBalancesForTransaction } from '@/lib/balance';
import Transaction from '@/models/Transaction';

async function getDoc(id: string, userId: mongoose.Types.ObjectId) {
  await connectMongo();
  return Transaction.findOne({ _id: id, userId });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const body = await request.json();
    const doc = await getDoc(id, userId);
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const oldFrom = doc.fromAccountId;
    const oldTo = doc.toAccountId;
    if (body.type != null) doc.type = body.type;
    if (body.fromAccountId != null)
      doc.fromAccountId = new mongoose.Types.ObjectId(body.fromAccountId);
    if (body.toAccountId != null)
      doc.toAccountId = new mongoose.Types.ObjectId(body.toAccountId);
    if (body.amount != null) doc.amount = Math.max(0, Number(body.amount));
    if (body.categoryId !== undefined)
      doc.categoryId = body.categoryId ? new mongoose.Types.ObjectId(body.categoryId) : undefined;
    if (body.note !== undefined) doc.note = body.note ? String(body.note).trim() : undefined;
    if (body.transactionDate != null) doc.transactionDate = new Date(body.transactionDate);
    await doc.save();
    await updateBalancesForTransaction(oldFrom ?? undefined, oldTo ?? undefined);
    await updateBalancesForTransaction(
      doc.fromAccountId ?? undefined,
      doc.toAccountId ?? undefined
    );
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

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
    }
    const doc = await getDoc(id, userId);
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const fromId = doc.fromAccountId;
    const toId = doc.toAccountId;
    await doc.deleteOne();
    await updateBalancesForTransaction(fromId ?? undefined, toId ?? undefined);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
