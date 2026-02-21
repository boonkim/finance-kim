import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectMongo from '@/lib/mongodb';
import { getSessionUserId } from '@/lib/auth';
import Account from '@/models/Account';

export async function GET(
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
    await connectMongo();
    const doc = await Account.findOne({ _id: id, userId }).lean();
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(doc);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
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
    const { name, type, statementClosingDay, paymentDueOffsetDays, bankSymbol, nickname, accountNumber } = body as {
      name?: string;
      type?: string;
      statementClosingDay?: number;
      paymentDueOffsetDays?: number;
      bankSymbol?: string;
      nickname?: string;
      accountNumber?: string;
    };
    await connectMongo();
    const doc = await Account.findOne({ _id: id, userId });
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (name != null) doc.name = String(name).trim();
    if (type != null && ['bank', 'cash', 'credit_card'].includes(type)) doc.type = type;
    if (doc.type === 'credit_card') {
      if (statementClosingDay != null)
        doc.statementClosingDay = Math.min(31, Math.max(1, Number(statementClosingDay)));
      if (paymentDueOffsetDays != null)
        doc.paymentDueOffsetDays = Math.min(31, Math.max(1, Number(paymentDueOffsetDays)));
    }
    if (doc.type === 'bank' && bankSymbol !== undefined) {
      doc.bankSymbol = bankSymbol ? String(bankSymbol).trim() : undefined;
    }
    if (nickname !== undefined) doc.nickname = String(nickname).trim() || undefined;
    if (accountNumber !== undefined) doc.accountNumber = String(accountNumber).trim() || undefined;
    await doc.save();
    return NextResponse.json(doc.toObject());
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
    await connectMongo();
    const doc = await Account.findOneAndDelete({ _id: id, userId });
    if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
