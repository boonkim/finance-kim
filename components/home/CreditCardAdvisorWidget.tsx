'use client';

import { useEffect, useState } from 'react';

interface Recommended {
  account: { _id: string; name: string; type: string };
  daysUntilPaymentDue: number;
  nextClosingDate: string;
}

export default function CreditCardAdvisorWidget() {
  const [data, setData] = useState<{ recommended: Recommended | null } | null>(null);

  useEffect(() => {
    fetch('/api/advisor/best-card')
      .then((res) => res.ok ? res.json() : { recommended: null })
      .then(setData)
      .catch(() => setData({ recommended: null }));
  }, []);

  if (data == null) return null;
  if (data.recommended == null) return null;

  const { account, daysUntilPaymentDue } = data.recommended;

  return (
    <section className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 shadow-sm">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        แนะนำบัตรที่ควรใช้วันนี้
      </h2>
      <p className="font-medium text-slate-800">{account.name}</p>
      <p className="text-sm text-slate-600">
        ใช้บัตรนี้จะชำระเงินได้อีกประมาณ <strong>{daysUntilPaymentDue}</strong> วัน
      </p>
    </section>
  );
}
