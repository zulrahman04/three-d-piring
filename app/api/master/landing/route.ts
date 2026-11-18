import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findMany({
      where: { isActive: true },
      orderBy: { section: 'asc' },
    });

    const mapped: Record<string, any> = {};
    for (const s of settings) {
      mapped[s.key] = {
        key: s.key,
        section: s.section,
        title: s.title,
        content: s.content,
        metadata: s.metadata || {},
      };
    }

    return NextResponse.json({ success: true, settings: mapped });
  } catch (error: any) {
    console.error('Failed to fetch public landing settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
