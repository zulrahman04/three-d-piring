import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const sizes = await prisma.plateSize.findMany({
      where: { isActive: true },
      orderBy: { diameterCm: 'desc' },
    });

    const formatted = sizes.map((s) => ({
      id: s.id,
      name: s.name,
      diameterCm: Number(s.diameterCm),
      basePrice: Number(s.basePrice),
      outerRadius: Number(s.outerRadius),
      wellRatio: Number(s.wellRatio),
      wellDepth: Number(s.wellDepth),
      rimHeight: Number(s.rimHeight),
      rimAngleDeg: Number(s.rimAngleDeg),
      thickness: Number(s.thickness),
      footRingRadiusRatio: Number(s.footRingRadiusRatio),
      isActive: s.isActive,
    }));

    return NextResponse.json({ success: true, sizes: formatted });
  } catch (error: any) {
    console.error('Failed to fetch public master sizes:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
