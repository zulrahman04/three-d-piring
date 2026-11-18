import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const presets = await prisma.designPreset.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = presets.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      thumbnailSvg: p.thumbnailSvgUrl || '',
      dataUrl: p.dataUrl,
    }));

    return NextResponse.json({ success: true, presets: formatted });
  } catch (error: any) {
    console.error('Failed to fetch public design presets:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
