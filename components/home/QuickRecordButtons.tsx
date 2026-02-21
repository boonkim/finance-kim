'use client';

import { useCallback, useEffect, useState } from 'react';
import AccountPicker, { type AccountOption } from '@/components/home/AccountPicker';

interface CategoryItem {
  _id: string;
  name: string;
  type: string;
}

type RecordType = 'income' | 'expense' | 'transfer';

interface QuickRecordButtonsProps {
  onRecorded?: () => void;
}

export default function QuickRecordButtons({ onRecorded }: QuickRecordButtonsProps) {
  const [open, setOpen] = useState<RecordType | null>(null);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [fromAccountId, setFromAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    Promise.all([
      fetch('/api/accounts').then((r) => (r.ok ? r.json() : [])),
      fetch('/api/categories').then((r) => (r.ok ? r.json() : [])),
    ]).then(([acc, cat]) => {
      setAccounts(Array.isArray(acc) ? acc : []);
      setCategories(Array.isArray(cat) ? cat : []);
    });
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const start = (type: RecordType) => {
    setOpen(type);
    setAmount('');
    setNote('');
    setFromAccountId('');
    setToAccountId('');
    setCategoryId('');
  };

  const submit = async () => {
    const amt = parseFloat(amount.replace(/,/g, ''));
    if (!Number.isFinite(amt) || amt <= 0) return;
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        type: open,
        amount: amt,
        note: note.trim() || undefined,
        transactionDate: new Date().toISOString(),
      };
      if (open === 'income') {
        body.toAccountId = toAccountId || undefined;
        body.categoryId = categoryId || undefined;
      } else if (open === 'expense') {
        body.fromAccountId = fromAccountId || undefined;
        body.categoryId = categoryId || undefined;
      } else {
        body.fromAccountId = fromAccountId || undefined;
        body.toAccountId = toAccountId || undefined;
      }
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setOpen(null);
        onRecorded?.();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const incomeCats = categories.filter((c) => c.type === 'income');
  const expenseCats = categories.filter((c) => c.type === 'expense');

  return (
    <>
      <section className="mt-6">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          บันทึกรวดเร็ว
        </h2>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => start('income')}
            className="flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-6 text-slate-500 transition-colors hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-600"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </span>
            <span className="text-sm font-medium">รายรับ</span>
          </button>
          <button
            type="button"
            onClick={() => start('expense')}
            className="flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-6 text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50/50 hover:text-rose-600"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
            </span>
            <span className="text-sm font-medium">รายจ่าย</span>
          </button>
          <button
            type="button"
            onClick={() => start('transfer')}
            className="flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-6 text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-slate-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </span>
            <span className="text-sm font-medium">โอนเงิน</span>
          </button>
        </div>
      </section>

      {open && (
        <div
          className="fixed inset-0 z-20 flex items-end justify-center bg-black/40 sm:items-center"
          onClick={() => !submitting && setOpen(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-md rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-semibold text-slate-800">
              {open === 'income' && 'บันทึกรายรับ'}
              {open === 'expense' && 'บันทึกรายจ่าย'}
              {open === 'transfer' && 'โอนเงิน'}
            </h3>
            <div className="space-y-3">
              {open === 'income' && (
                <>
                  <AccountPicker
                    accounts={accounts}
                    value={toAccountId}
                    onChange={setToAccountId}
                    label="เข้าบัญชี"
                    placeholder="— เลือกบัญชี —"
                    required
                  />
                  <div>
                    <label className="block text-xs text-slate-500">หมวดหมู่ (ถ้ามี)</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="">— ไม่ระบุ —</option>
                      {incomeCats.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              {open === 'expense' && (
                <>
                  <AccountPicker
                    accounts={accounts}
                    value={fromAccountId}
                    onChange={setFromAccountId}
                    label="จากบัญชี"
                    placeholder="— เลือกบัญชี —"
                    required
                  />
                  <div>
                    <label className="block text-xs text-slate-500">หมวดหมู่ (ถ้ามี)</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                    >
                      <option value="">— ไม่ระบุ —</option>
                      {expenseCats.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              {open === 'transfer' && (
                <>
                  <AccountPicker
                    accounts={accounts}
                    value={fromAccountId}
                    onChange={setFromAccountId}
                    label="จากบัญชี"
                    placeholder="— เลือก —"
                    required
                  />
                  <AccountPicker
                    accounts={accounts}
                    value={toAccountId}
                    onChange={setToAccountId}
                    label="ไปบัญชี"
                    placeholder="— เลือก —"
                    required
                  />
                </>
              )}
              <div>
                <label className="block text-xs text-slate-500">จำนวนเงิน (฿)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm tabular-nums"
                  placeholder="0"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500">หมายเหตุ</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  placeholder="ไม่บังคับ"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={submit}
                disabled={submitting}
                className="flex-1 rounded-xl bg-brand-600 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
              >
                {submitting ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
              <button
                type="button"
                onClick={() => !submitting && setOpen(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
