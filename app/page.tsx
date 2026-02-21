import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Header from '@/components/Header';
import HomeLoggedIn from '@/components/HomeLoggedIn';
import HomeLoggedOut from '@/components/HomeLoggedOut';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      <Header />
      <main className="flex flex-1 flex-col px-4 pb-8 pt-4 safe-bottom">
        {session ? <HomeLoggedIn /> : <HomeLoggedOut />}
      </main>
    </div>
  );
}
