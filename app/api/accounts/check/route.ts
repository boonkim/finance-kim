import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import { getSessionUserId } from '@/lib/auth';
import Account from '@/models/Account';

/**
 * ใช้เช็คว่า API ส่ง nickname และ accountNumber จาก DB จริงหรือไม่
 * เปิด GET /api/accounts/check ใน browser หรือดูใน Network tab
 */
export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await connectMongo();
    const list = await Account.find({ userId })
      .sort({ type: 1, name: 1 })
      .select('name nickname accountNumber')
      .lean();

    const check = list.map((a) => {
      const raw = a as { name?: string; nickname?: string; accountNumber?: string };
      return {
        name: raw.name,
        nicknameFromDb: raw.nickname,
        accountNumberFromDb: raw.accountNumber,
        hasNickname: typeof raw.nickname === 'string' && raw.nickname.trim().length > 0,
        hasAccountNumber: typeof raw.accountNumber === 'string' && raw.accountNumber.trim().length >= 4,
      };
    });

    return NextResponse.json({
      message: 'ค่าจาก DB ก่อนส่งไป frontend',
      count: list.length,
      accounts: check,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
