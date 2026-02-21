import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import ConfigAccountSection from '@/components/config/ConfigAccountSection';
import ConfigAccountsSection from '@/components/config/ConfigAccountsSection';
import ConfigBackNav from '@/components/config/ConfigBackNav';
import ConfigCategoriesSection from '@/components/config/ConfigCategoriesSection';
import Header from '@/components/Header';

export const metadata = {
  title: 'ตั้งค่า | รายรับรายจ่ายส่วนตัว',
  description: 'ตั้งค่าแอปรายรับรายจ่าย',
};

const APP_VERSION = '0.1.0';

export default async function ConfigPage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />
      <main className="flex flex-1 flex-col px-4 pb-8 pt-6 safe-bottom sm:mx-auto sm:max-w-lg sm:px-6 md:max-w-xl lg:max-w-2xl">
        <ConfigBackNav />

        <div className="space-y-6">
          {/* บัญชี */}
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
            <h2 className="border-b border-slate-100 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              บัญชี
            </h2>
            {session?.user ? (
              <ConfigAccountSection
                name={session.user.name ?? null}
                email={session.user.email ?? null}
                image={session.user.image ?? null}
              />
            ) : (
              <div className="px-4 py-6">
                <p className="mb-4 text-sm text-slate-500">
                  ยังไม่ได้เข้าสู่ระบบ — เข้าสู่ระบบเพื่อบันทึกรายการและซิงค์ข้อมูล
                </p>
                <Link
                  href="/"
                  className="inline-block rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  ไปหน้าหลักเพื่อเข้าสู่ระบบ
                </Link>
              </div>
            )}
          </section>

          {session?.user && (
            <>
              <ConfigAccountsSection />
              <ConfigCategoriesSection />
            </>
          )}

          {/* การแสดงผล */}
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
            <h2 className="border-b border-slate-100 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              การแสดงผล
            </h2>
            <div className="divide-y divide-slate-100">
              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-sm text-slate-700">หน่วยเงิน</span>
                <span className="text-sm font-medium text-slate-900">บาท (฿)</span>
              </div>
              <div className="flex items-center justify-between px-4 py-4">
                <span className="text-sm text-slate-700">ภาษา</span>
                <span className="text-sm font-medium text-slate-900">ไทย</span>
              </div>
            </div>
          </section>

          {/* ข้อมูล & การเก็บข้อมูล */}
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
            <h2 className="border-b border-slate-100 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              ข้อมูล
            </h2>
            <div className="space-y-4 px-4 py-4">
              <p className="text-sm text-slate-600">
                รายการรายรับรายจ่ายเก็บใน MongoDB ตามที่ตั้งค่าใน .env
                ข้อมูลผูกกับบัญชี Google ของคุณ
              </p>
              <p className="text-xs text-slate-400">
                ใช้ Connection แบบ Singleton เพื่อประสิทธิภาพบน Raspberry Pi 5
              </p>
            </div>
          </section>

          {/* เกี่ยวกับ */}
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
            <h2 className="border-b border-slate-100 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              เกี่ยวกับ
            </h2>
            <div className="flex items-center justify-between px-4 py-4">
              <span className="text-sm text-slate-700">รายรับรายจ่ายส่วนตัว</span>
              <span className="text-sm font-medium text-slate-500">v{APP_VERSION}</span>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
