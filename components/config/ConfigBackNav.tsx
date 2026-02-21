import Link from 'next/link';

export default function ConfigBackNav() {
  return (
    <div className="mb-6 flex items-center gap-3">
      <Link
        href="/"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-white hover:text-slate-700"
        aria-label="กลับหน้าหลัก"
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Link>
      <h1 className="text-xl font-semibold text-slate-800">ตั้งค่า</h1>
    </div>
  );
}
