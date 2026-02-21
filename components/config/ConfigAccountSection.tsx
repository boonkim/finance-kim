'use client';

import Image from 'next/image';
import { signOut } from 'next-auth/react';

type Props = {
  name: string | null;
  email: string | null;
  image: string | null;
};

export default function ConfigAccountSection({ name, email, image }: Props) {
  return (
    <div className="divide-y divide-slate-100">
      <div className="flex items-center gap-4 px-4 py-4">
        {image ? (
          <Image
            src={image}
            alt=""
            width={48}
            height={48}
            className="rounded-full border-2 border-slate-200"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-lg font-medium text-brand-700">
            {(name ?? email ?? '?').charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-slate-800">{name ?? 'ผู้ใช้'}</p>
          <p className="truncate text-sm text-slate-500">{email ?? '—'}</p>
        </div>
      </div>
      <div className="px-4 py-3">
        <button
          type="button"
          onClick={() =>
            signOut({
              callbackUrl: process.env.NEXT_PUBLIC_REDIRECT_URI ?? '/',
            })
          }
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100"
        >
          ออกจากระบบ
        </button>
      </div>
    </div>
  );
}
