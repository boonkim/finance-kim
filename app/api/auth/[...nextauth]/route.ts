import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import connectMongo from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: {
        params: {
          redirect_uri: process.env.REDIRECT_URI ?? undefined,
        },
      },
    }),
  ],
  callbacks: {
    redirect({ url, baseUrl }) {
      // พา user ไปที่ NEXT_PUBLIC_REDIRECT_URI หลัง login (รองรับ web vs local ไม่ตรงกัน)
      const redirectTo = process.env.NEXT_PUBLIC_REDIRECT_URI ?? baseUrl;
      return redirectTo.startsWith('http') ? redirectTo : baseUrl;
    },
    async signIn({ user }) {
      if (!user?.email) return false;
      try {
        await connectMongo();
        await User.findOneAndUpdate(
          { email: user.email },
          {
            $set: {
              name: user.name ?? null,
              image: user.image ?? null,
              emailVerified: new Date(),
              updatedAt: new Date(),
            },
          },
          { upsert: true, new: true }
        );
      } catch {
        return false;
      }
      return true;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
      }
      return session;
    },
    jwt({ token }) {
      return token;
    },
  },
  pages: {
    signIn: '/',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
