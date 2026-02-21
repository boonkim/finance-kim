import mongoose, { Schema, model, models } from 'mongoose';

export type TransactionType = 'income' | 'expense' | 'transfer';

export interface ITransaction {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: TransactionType;
  /** บัญชีต้นทาง (บังคับสำหรับ expense, transfer) */
  fromAccountId?: mongoose.Types.ObjectId;
  /** บัญชีปลายทาง (บังคับสำหรับ income, transfer) */
  toAccountId?: mongoose.Types.ObjectId;
  amount: number;
  categoryId?: mongoose.Types.ObjectId;
  note?: string;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['income', 'expense', 'transfer'],
    },
    fromAccountId: { type: Schema.Types.ObjectId, ref: 'Account' },
    toAccountId: { type: Schema.Types.ObjectId, ref: 'Account' },
    amount: { type: Number, required: true, min: 0 },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    note: { type: String, trim: true },
    transactionDate: { type: Date, required: true, default: () => new Date() },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, transactionDate: -1 });
TransactionSchema.index({ userId: 1, fromAccountId: 1, transactionDate: -1 });
TransactionSchema.index({ userId: 1, toAccountId: 1, transactionDate: -1 });

TransactionSchema.pre('save', function (next) {
  if (this.amount < 0) {
    next(new Error('amount must be non-negative'));
    return;
  }
  if (this.type === 'expense' && !this.fromAccountId) {
    next(new Error('expense requires fromAccountId'));
    return;
  }
  if (this.type === 'income' && !this.toAccountId) {
    next(new Error('income requires toAccountId'));
    return;
  }
  if (this.type === 'transfer' && (!this.fromAccountId || !this.toAccountId)) {
    next(new Error('transfer requires both fromAccountId and toAccountId'));
    return;
  }
  next();
});

const Transaction = models.Transaction ?? model<ITransaction>('Transaction', TransactionSchema);
export default Transaction;
