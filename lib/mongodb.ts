import mongoose from 'mongoose';

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error(
      'กรุณาตั้งค่า MONGODB_URI ใน .env (ชี้ไปที่ shared-mongodb หรือ instance ของคุณ)'
    );
  }
  return uri;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var -- global cache for singleton
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * การเชื่อมต่อ MongoDB แบบ Singleton
 * ป้องกันการสร้าง Connection ซ้ำซ้อนตอน Hot Reload บน Next.js / Pi 5
 */
async function connectMongo(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(getMongoUri()).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectMongo;
