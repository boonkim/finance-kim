'use client';

import Image from 'next/image';
import { getBankBySymbol } from '@/lib/thaiBanks';

interface BankLogoProps {
  bankSymbol: string | null | undefined;
  accountName: string;
  /** ขนาดโลโก้ (px) */
  size?: number;
  className?: string;
}

export default function BankLogo({
  bankSymbol,
  accountName,
  size = 40,
  className = '',
}: BankLogoProps) {
  const bank = getBankBySymbol(bankSymbol);

  if (bank?.icon) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-200/60 ${className}`}
        style={{ width: size, height: size }}
      >
        <Image
          src={bank.icon}
          alt={bank.fullname}
          width={size}
          height={size}
          className="object-contain p-1"
          unoptimized
        />
      </span>
    );
  }

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-600 ring-1 ring-slate-200/60 ${className}`}
      style={{ width: size, height: size }}
      title={accountName}
    >
      {accountName.charAt(0)}
    </span>
  );
}
