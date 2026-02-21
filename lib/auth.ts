import { getServerSession } from 'next-auth';
import type { mongoose } from 'mongoose';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import connectMongo from '@/lib/mongodb';
import User from '@/models/User';

/**
 * ดึง MongoDB User _id ของผู้ใช้ที่ล็อกอินอยู่
 * คืน null ถ้าไม่ได้ล็อกอินหรือหา User ไม่เจอ
 */
export async function getSessionUserId(): Promise<mongoose.Types.ObjectId | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) return null;
  await connectMongo();
  const user = await User.findOne({ email }).select('_id').lean();
  return user?._id ?? null;
}
