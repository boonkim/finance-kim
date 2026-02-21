'use client';

import { useCallback, useEffect, useState } from 'react';
import BankLogo from '@/components/ui/BankLogo';
import { thaiBanksList } from '@/lib/thaiBanks';

export interface AccountItem {
  _id: string;
  name: string;
  type: string;
  balance: number;
  statementClosingDay?: number;
  paymentDueOffsetDays?: number;
  bankSymbol?: string;
  nickname?: string;
  accountNumber?: string;
}

export default function ConfigAccountsSection() {
  const [list, setList] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'bank' | 'cash' | 'credit_card'>('bank');
  const [formClosingDay, setFormClosingDay] = useState('');
  const [formDueOffset, setFormDueOffset] = useState('');
  const [formBankSymbol, setFormBankSymbol] = useState('');
  const [formNickname, setFormNickname] = useState('');
  const [formAccountNumber, setFormAccountNumber] = useState('');

  const fetchList = useCallback(async () => {
    const res = await fetch('/api/accounts');
    if (res.ok) {
      const data = await res.json();
      setList(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const load = useCallback(() => {
    setLoading(true);
    fetchList().then(() => setLoading(false));
  }, [fetchList]);

  const openAdd = () => {
    setEditingId(null);
    setFormName('');
    setFormType('bank');
    setFormClosingDay('');
    setFormDueOffset('');
    setFormBankSymbol('');
    setFormNickname('');
    setFormAccountNumber('');
    setShowForm(true);
  };

  const openEdit = (a: AccountItem) => {
    setEditingId(a._id);
    setFormName(a.name);
    setFormType(a.type as 'bank' | 'cash' | 'credit_card');
    setFormClosingDay(a.statementClosingDay != null ? String(a.statementClosingDay) : '');
    setFormDueOffset(a.paymentDueOffsetDays != null ? String(a.paymentDueOffsetDays) : '');
    setFormBankSymbol(a.bankSymbol ?? '');
    setFormNickname(a.nickname ?? '');
    setFormAccountNumber(a.accountNumber ?? '');
    setShowForm(true);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = {
      name: formName.trim(),
      type: formType,
    };
    if (formType === 'credit_card') {
      if (formClosingDay) payload.statementClosingDay = Math.min(31, Math.max(1, parseInt(formClosingDay, 10) || 1));
      if (formDueOffset) payload.paymentDueOffsetDays = Math.min(31, Math.max(1, parseInt(formDueOffset, 10) || 10));
    }
    if (formType === 'bank' && formBankSymbol) payload.bankSymbol = formBankSymbol;
    if (editingId) {
      payload.nickname = formNickname.trim();
      payload.accountNumber = formAccountNumber.trim();
    } else {
      if (formNickname.trim()) payload.nickname = formNickname.trim();
      if (formAccountNumber.trim()) payload.accountNumber = formAccountNumber.trim();
    }
    if (editingId) {
      const res = await fetch(`/api/accounts/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowForm(false);
        load();
      }
    } else {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowForm(false);
        load();
      }
    }
  };

  const deleteAccount = async (id: string) => {
    if (!confirm('ลบบัญชีนี้?')) return;
    const res = await fetch(`/api/accounts/${id}`, { method: 'DELETE' });
    if (res.ok) load();
  };

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          บัญชีและบัตรเครดิต
        </h2>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          เพิ่มบัญชี
        </button>
      </div>
      {showForm && (
        <form
          onSubmit={submitForm}
          className="border-b border-slate-100 bg-slate-50/50 p-4"
        >
          <p className="mb-3 text-sm font-medium text-slate-700">
            {editingId ? 'แก้ไขบัญชี' : 'เพิ่มบัญชี'}
          </p>
          <div className="space-y-3">
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="ชื่อบัญชี"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              required
            />
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as 'bank' | 'cash' | 'credit_card')}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="bank">ธนาคาร</option>
              <option value="cash">เงินสด</option>
              <option value="credit_card">บัตรเครดิต</option>
            </select>
            {formType === 'bank' && (
              <div>
                <label className="block text-xs text-slate-500">เลือกธนาคาร (แสดงโลโก้)</label>
                <select
                  value={formBankSymbol}
                  onChange={(e) => {
                    const sym = e.target.value;
                    setFormBankSymbol(sym);
                    const bank = thaiBanksList.find((b) => b.symbol === sym);
                    if (bank && !formName) setFormName(bank.fullname);
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="">— ไม่ระบุ (ใช้ชื่อเอง) —</option>
                  {thaiBanksList.map((b) => (
                    <option key={b.symbol} value={b.symbol}>
                      {b.name} ({b.symbol})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label className="block text-xs text-slate-500">ชื่อเล่นบัญชี (optional)</label>
              <input
                type="text"
                value={formNickname}
                onChange={(e) => setFormNickname(e.target.value)}
                placeholder="เช่น บัญชีเงินเดือน"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500">เลขบัญชี (optional)</label>
              <input
                type="text"
                value={formAccountNumber}
                onChange={(e) => setFormAccountNumber(e.target.value)}
                placeholder="เช่น xxx-x-xxxxx-x"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              />
            </div>
            {formType === 'credit_card' && (
              <>
                <div>
                  <label className="block text-xs text-slate-500">วันตัดรอบ (1–31)</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={formClosingDay}
                    onChange={(e) => setFormClosingDay(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500">ชำระภายในกี่วันหลังตัดรอบ</label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={formDueOffset}
                    onChange={(e) => setFormDueOffset(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                  />
                </div>
              </>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              บันทึก
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      )}
      <div className="divide-y divide-slate-100">
        {loading && list.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-slate-400">กำลังโหลด...</div>
        ) : list.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-slate-500">ยังไม่มีบัญชี</div>
        ) : (
          list.map((a) => (
            <div
              key={a._id}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:flex-nowrap"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <BankLogo bankSymbol={a.bankSymbol} accountName={a.name} size={44} />
<div className="min-w-0">
                  <p className="font-medium text-slate-800">
                    {a.nickname ? `${a.nickname} (${a.name})` : a.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {a.type === 'credit_card' ? 'บัตรเครดิต' : a.type === 'bank' ? 'ธนาคาร' : 'เงินสด'}
                    {a.accountNumber && ` • เลข ••••-${a.accountNumber.slice(-4)}`}
                    {a.type === 'credit_card' &&
                      a.statementClosingDay != null &&
                      ` • ตัดรอบวันที่ ${a.statementClosingDay}`}
                    {' • '}
                    ยอด ฿{a.balance.toLocaleString('th-TH')}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(a)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
                >
                  แก้ไข
                </button>
                <button
                  type="button"
                  onClick={() => deleteAccount(a._id)}
                  className="rounded-lg border border-rose-200 px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
