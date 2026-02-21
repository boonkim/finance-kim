import { NextResponse } from 'next/server';
import connectMongo from '@/lib/mongodb';
import { getSessionUserId } from '@/lib/auth';
import Category from '@/models/Category';

export async function GET(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    await connectMongo();
    const filter: { userId: typeof userId; type?: string } = { userId };
    if (type === 'income' || type === 'expense') filter.type = type;
    const list = await Category.find(filter).sort({ type: 1, name: 1 }).lean();
    return NextResponse.json(list);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { name, type } = body as { name?: string; type?: string };
    if (!name || !type) {
      return NextResponse.json(
        { error: 'name and type are required' },
        { status: 400 }
      );
    }
    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }
    await connectMongo();
    const doc = await Category.create({
      userId,
      name: String(name).trim(),
      type,
    });
    return NextResponse.json(doc.toObject());
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
