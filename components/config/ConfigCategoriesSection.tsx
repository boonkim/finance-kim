'use client';

import { useCallback, useEffect, useState } from 'react';

export interface CategoryItem {
  _id: string;
  name: string;
  type: string;
}

export default function ConfigCategoriesSection() {
  const [list, setList] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<'income' | 'expense'>('expense');

  const fetchList = useCallback(async () => {
    const res = await fetch('/api/categories');
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
    setFormType('expense');
    setShowForm(true);
  };

  const openEdit = (c: CategoryItem) => {
    setEditingId(c._id);
    setFormName(c.name);
    setFormType(c.type as 'income' | 'expense');
    setShowForm(true);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: formName.trim(), type: formType };
    if (editingId) {
      const res = await fetch(`/api/categories/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowForm(false);
        load();
      }
    } else {
      const res = await fetch('/api/categories', {
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

  const deleteCategory = async (id: string) => {
    if (!confirm('ลบหมวดหมู่นี้?')) return;
    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (res.ok) load();
  };

  const incomeCategories = list.filter((c) => c.type === 'income');
  const expenseCategories = list.filter((c) => c.type === 'expense');

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          หมวดหมู่การใช้จ่าย
        </h2>
        <button
          type="button"
          onClick={openAdd}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
        >
          เพิ่มหมวดหมู่
        </button>
      </div>
      {showForm && (
        <form
          onSubmit={submitForm}
          className="border-b border-slate-100 bg-slate-50/50 p-4"
        >
          <p className="mb-3 text-sm font-medium text-slate-700">
            {editingId ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่'}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="ชื่อหมวดหมู่"
              className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
              required
            />
            <select
              value={formType}
              onChange={(e) => setFormType(e.target.value as 'income' | 'expense')}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="income">รายรับ</option>
              <option value="expense">รายจ่าย</option>
            </select>
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
      <div className="divide-y divide-slate-100 p-4">
        {loading && list.length === 0 ? (
          <div className="py-4 text-center text-sm text-slate-400">กำลังโหลด...</div>
        ) : list.length === 0 ? (
          <div className="py-4 text-center text-sm text-slate-500">ยังไม่มีหมวดหมู่</div>
        ) : (
          <>
            <div className="mb-3">
              <p className="mb-2 text-xs font-medium uppercase text-emerald-600">รายรับ</p>
              <ul className="space-y-1">
                {incomeCategories.map((c) => (
                  <li
                    key={c._id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <span className="text-sm text-slate-800">{c.name}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCategory(c._id)}
                        className="text-xs text-rose-500 hover:text-rose-700"
                      >
                        ลบ
                      </button>
                    </div>
                  </li>
                ))}
                {incomeCategories.length === 0 && (
                  <li className="text-sm text-slate-400">— ยังไม่มี</li>
                )}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-xs font-medium uppercase text-rose-600">รายจ่าย</p>
              <ul className="space-y-1">
                {expenseCategories.map((c) => (
                  <li
                    key={c._id}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2"
                  >
                    <span className="text-sm text-slate-800">{c.name}</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        className="text-xs text-slate-500 hover:text-slate-700"
                      >
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCategory(c._id)}
                        className="text-xs text-rose-500 hover:text-rose-700"
                      >
                        ลบ
                      </button>
                    </div>
                  </li>
                ))}
                {expenseCategories.length === 0 && (
                  <li className="text-sm text-slate-400">— ยังไม่มี</li>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
