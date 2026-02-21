'use client';

import { useCallback, useEffect, useState } from 'react';
import BankLogo from '@/components/ui/BankLogo';

interface AccountItem {
  _id: string;
  name: string;
  type: string;
  balance: number;
  bankSymbol?: string;
  nickname?: string;
  accountNumber?: string;
}

interface AccountBalanceListProps {
  refreshKey?: number;
}

export default function AccountBalanceList({ refreshKey }: AccountBalanceListProps) {
  const [list, setList] = useState<AccountItem[]>([]);

  const fetchList = useCallback(async () => {
    const res = await fetch('/api/accounts');
    if (res.ok) {
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList, refreshKey]);

  const total = list.reduce((s, a) => s + a.balance, 0);

  if (list.length === 0) return null;

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
        ยอดตามบัญชี
      </h2>
      <div className="space-y-2">
        {list.map((a) => (
          <div
            key={a._id}
            className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200/60"
          >
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <div className="flex items-center gap-3">
                <BankLogo bankSymbol={a.bankSymbol} accountName={a.nickname || a.name} size={40} />
                <span className="min-w-0 truncate text-sm font-medium text-slate-800">
                  {a.nickname ? `${a.nickname} (${a.name})` : a.name}
                </span>
              </div>
              {a.accountNumber && (
                <span className="ml-12 text-xs text-slate-500">เลข ••••-{a.accountNumber.slice(-4)}</span>
              )}
            </div>
            <span
              className={`shrink-0 tabular-nums font-semibold ${
                a.balance >= 0 ? 'text-slate-900' : 'text-rose-600'
              }`}
            >
              ฿{a.balance.toLocaleString('th-TH')}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-4 py-3">
          <span className="text-sm font-semibold text-slate-700">ยอดรวม</span>
          <span
            className={`tabular-nums font-bold ${
              total >= 0 ? 'text-slate-900' : 'text-rose-600'
            }`}
          >
            ฿{total.toLocaleString('th-TH')}
          </span>
        </div>
      </div>
    </section>
  );
}
