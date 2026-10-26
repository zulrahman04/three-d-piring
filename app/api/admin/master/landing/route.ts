import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      orderBy: { section: 'asc' },
    });
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { key, title, content, metadata, isActive } = await req.json();
    if (!key) return NextResponse.json({ error: 'Key wajib disertakan' }, { status: 400 });

    const updated = await prisma.siteSetting.upsert({
      where: { key },
      update: {
        title: title !== undefined ? title : undefined,
        content: content !== undefined ? content : undefined,
        metadata: metadata !== undefined ? metadata : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
      create: {
        key,
        section: 'custom',
        title,
        content,
        metadata: metadata || {},
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, setting: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
