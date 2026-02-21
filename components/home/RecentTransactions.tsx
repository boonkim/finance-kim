'use client';

import { useCallback, useEffect, useState } from 'react';

interface PopulatedAccount {
  _id: string;
  name: string;
  type: string;
}

interface Tx {
  _id: string;
  type: string;
  amount: number;
  note?: string;
  transactionDate: string;
  fromAccountId?: PopulatedAccount | null;
  toAccountId?: PopulatedAccount | null;
  categoryId?: { name: string } | null;
}

interface RecentTransactionsProps {
  refreshKey?: number;
}

export default function RecentTransactions({ refreshKey }: RecentTransactionsProps) {
  const [list, setList] = useState<Tx[]>([]);

  const fetchList = useCallback(async () => {
    const res = await fetch('/api/transactions?limit=20');
    if (res.ok) {
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList, refreshKey]);

  if (list.length === 0) {
    return (
      <section className="mt-6 flex-1">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          รายการล่าสุด
        </h2>
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
          <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-400">
            <svg
              className="h-12 w-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-sm">ยังไม่มีรายการ</p>
            <p className="text-xs">กดปุ่มด้านบนเพื่อเพิ่มรายรับหรือรายจ่าย</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 flex-1">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        รายการล่าสุด
      </h2>
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
        <ul className="divide-y divide-slate-100">
          {list.map((tx) => {
            const isIncome = tx.type === 'income';
            const isTransfer = tx.type === 'transfer';
            const label =
              isIncome
                ? `เข้า ${(tx.toAccountId as PopulatedAccount)?.name ?? '—'}`
                : isTransfer
                  ? `${(tx.fromAccountId as PopulatedAccount)?.name ?? '—'} → ${(tx.toAccountId as PopulatedAccount)?.name ?? '—'}`
                  : `จาก ${(tx.fromAccountId as PopulatedAccount)?.name ?? '—'}`;
            return (
              <li key={tx._id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-slate-800">{label}</p>
                  <p className="text-xs text-slate-500">
                    {tx.note || (tx.categoryId as { name: string } | null)?.name || '—'} •{' '}
                    {new Date(tx.transactionDate).toLocaleDateString('th-TH')}
                  </p>
                </div>
                <span
                  className={`tabular-nums font-semibold ${
                    isIncome ? 'text-emerald-600' : isTransfer ? 'text-slate-600' : 'text-rose-600'
                  }`}
                >
                  {isIncome ? '+' : isTransfer ? '' : '-'}฿{tx.amount.toLocaleString('th-TH')}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
