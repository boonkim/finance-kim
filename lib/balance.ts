import mongoose from 'mongoose';
import Account from '@/models/Account';
import Transaction from '@/models/Transaction';

/**
 * คำนวณยอดคงเหลือจริงจาก Transaction (Double-entry)
 * - รายรับเข้า toAccount => เพิ่มยอด
 * - รายจ่ายจาก fromAccount => ลดยอด
 * - โอนจาก fromAccount ไป toAccount => ลด from, เพิ่ม to
 */
export async function recomputeAccountBalance(
  accountId: mongoose.Types.ObjectId
): Promise<number> {
  const id = accountId;
  const incoming = await Transaction.aggregate<{ total: number }>([
    { $match: { toAccountId: id } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const outgoing = await Transaction.aggregate<{ total: number }>([
    { $match: { fromAccountId: id } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const inSum = incoming[0]?.total ?? 0;
  const outSum = outgoing[0]?.total ?? 0;
  const balance = inSum - outSum;
  await Account.updateOne({ _id: id }, { $set: { balance } });
  return balance;
}

/**
 * อัปเดตยอดทั้งสองบัญชีที่เกี่ยวกับ Transaction นี้
 * เรียกหลัง create/update/delete Transaction
 */
export async function updateBalancesForTransaction(
  fromAccountId: mongoose.Types.ObjectId | null | undefined,
  toAccountId: mongoose.Types.ObjectId | null | undefined
): Promise<void> {
  const ids = new Set<mongoose.Types.ObjectId>();
  if (fromAccountId) ids.add(fromAccountId);
  if (toAccountId) ids.add(toAccountId);
  await Promise.all([...ids].map((id) => recomputeAccountBalance(id)));
}
