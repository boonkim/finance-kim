import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import { getSessionUserId } from '@/lib/auth';
import { getBestCreditCard } from '@/lib/creditCardAdvisor';
import Account from '@/models/Account';

export async function GET(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { searchParams } = new URL(request.url);
    const at = searchParams.get('at');
    const atDate = at ? new Date(at) : new Date();
    await connectMongo();
    const creditCards = await Account.find({
      userId,
      type: 'credit_card',
      statementClosingDay: { $gte: 1, $lte: 31 },
    })
      .lean()
      .then((list) => list.map((a) => ({ ...a, _id: a._id })));
    const result = getBestCreditCard(creditCards, atDate);
    if (!result) {
      return NextResponse.json({ recommended: null });
    }
    return NextResponse.json({
      recommended: {
        account: result.account,
        daysUntilPaymentDue: result.daysUntilPaymentDue,
        nextClosingDate: result.nextClosingDate.toISOString(),
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
