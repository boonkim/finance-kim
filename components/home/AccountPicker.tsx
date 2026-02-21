'use client';

import { useRef, useEffect, useState } from 'react';
import BankLogo from '@/components/ui/BankLogo';

export interface AccountOption {
  _id: string;
  name: string;
  type: string;
  bankSymbol?: string;
  nickname?: string;
  accountNumber?: string;
}

interface AccountPickerProps {
  accounts: AccountOption[];
  value: string;
  onChange: (accountId: string) => void;
  label: string;
  placeholder?: string;
  required?: boolean;
}

function AccountDisplay({ account }: { account: AccountOption }) {
  const displayName = (account.nickname && account.nickname.trim()) ? account.nickname.trim() : account.name;
  const num = typeof account.accountNumber === 'string' ? account.accountNumber.trim() : '';
  const accountNumberText = num.length >= 4
    ? `เลข ••••-${num.slice(-4)}`
    : '— ไม่ได้ระบุเลขบัญชี';
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <BankLogo bankSymbol={account.bankSymbol} accountName={account.name} size={36} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{displayName}</p>
        <p className="mt-0.5 text-xs text-slate-400">{accountNumberText}</p>
      </div>
    </div>
  );
}

export default function AccountPicker({
  accounts,
  value,
  onChange,
  label,
  placeholder = '— เลือกบัญชี —',
  required,
}: AccountPickerProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = accounts.find((a) => a._id === value);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-xs text-slate-500">{label}</label>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-1 flex w-full items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left shadow-sm transition-colors hover:bg-slate-50"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        {selected ? (
          <AccountDisplay account={selected} />
        ) : (
          <span className="text-sm text-slate-500">{placeholder}</span>
        )}
        <svg
          className={`ml-auto h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          role="listbox"
        >
          {accounts.map((a) => (
            <li key={a._id} role="option" aria-selected={value === a._id}>
              <button
                type="button"
                onClick={() => {
                  onChange(a._id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
              >
                <AccountDisplay account={a} />
                {value === a._id && (
                  <span className="ml-auto text-brand-600">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
      {required && !value && (
        <p className="mt-1 text-xs text-rose-500" role="alert">
          กรุณาเลือกบัญชี
        </p>
      )}
    </div>
  );
}
