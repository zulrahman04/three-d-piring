import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const colors = await prisma.plateColor.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });

    const formatted = colors.map((c) => ({
      id: c.id,
      name: c.name,
      hex: c.hexCode,
      description: c.description || 'Glasir keramik eksklusif',
    }));

    return NextResponse.json({ success: true, colors: formatted });
  } catch (error: any) {
    console.error('Failed to fetch public master colors:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
