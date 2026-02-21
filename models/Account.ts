import mongoose, { Schema, model, models } from 'mongoose';

export type AccountType = 'bank' | 'cash' | 'credit_card';

export interface IAccount {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  type: AccountType;
  /** ยอดคงเหลือ (cache) — อัปเดตจาก Transaction เสมอ */
  balance: number;
  /** บัตรเครดิต: วันตัดรอบในเดือน (1–31) */
  statementClosingDay?: number;
  /** บัตรเครดิต: ช่วงวันหลังตัดรอบจนถึงวันครบชำระ (เช่น 10 = ชำระภายใน 10 วันหลังตัดรอบ) */
  paymentDueOffsetDays?: number;
  /** สัญลักษณ์ธนาคารจาก thai-banks-logo (เช่น KBANK, SCB) — ใช้แสดงโลโก้เมื่อ type=bank */
  bankSymbol?: string;
  /** ชื่อเล่นบัญชี (optional) เช่น บัญชีเงินเดือน */
  nickname?: string;
  /** เลขบัญชี (optional) */
  accountNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ['bank', 'cash', 'credit_card'],
    },
    balance: { type: Number, default: 0 },
    statementClosingDay: { type: Number, min: 1, max: 31 },
    paymentDueOffsetDays: { type: Number, min: 1, max: 31 },
    bankSymbol: { type: String, trim: true },
    nickname: { type: String, trim: true },
    accountNumber: { type: String, trim: true },
  },
  { timestamps: true }
);

AccountSchema.index({ userId: 1, type: 1 });

const Account = models.Account ?? model<IAccount>('Account', AccountSchema);
export default Account;
