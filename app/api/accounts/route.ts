import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import { getSessionUserId } from '@/lib/auth';
import Account from '@/models/Account';

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectMongo();
    const list = await Account.find({ userId })
      .sort({ type: 1, name: 1 })
      .lean();
    return NextResponse.json(
      list.map((a) => ({
        ...a,
        nickname: (a as { nickname?: string }).nickname ?? '',
        accountNumber: (a as { accountNumber?: string }).accountNumber ?? '',
      }))
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    if (!name || !type) {
      return NextResponse.json(
        { error: 'name and type are required' },
        { status: 400 }
      );
    }
    if (!['bank', 'cash', 'credit_card'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    await connectMongo();
    const doc = await Account.create({
      userId,
      name: String(name).trim(),
      type,
      balance: 0,
      ...(type === 'credit_card' && {
        statementClosingDay:
          statementClosingDay != null
            ? Math.min(31, Math.max(1, Number(statementClosingDay)))
            : undefined,
        paymentDueOffsetDays:
          paymentDueOffsetDays != null
            ? Math.min(31, Math.max(1, Number(paymentDueOffsetDays)))
            : undefined,
      }),
      ...(type === 'bank' && bankSymbol != null && { bankSymbol: String(bankSymbol).trim() }),
      ...(nickname != null && { nickname: String(nickname).trim() || undefined }),
      ...(accountNumber != null && { accountNumber: String(accountNumber).trim() || undefined }),
    });
    return NextResponse.json(doc.toObject());
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
