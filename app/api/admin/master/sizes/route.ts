import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const sizes = await prisma.plateSize.findMany({
      orderBy: { diameterCm: 'desc' },
    });
    return NextResponse.json({ success: true, sizes });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const {
      id,
      name,
      diameterCm,
      basePrice,
      outerRadius,
      wellRatio,
      wellDepth,
      rimHeight,
      rimAngleDeg,
      thickness,
      footRingRadiusRatio,
      isActive,
    } = await req.json();

    if (!id || !name || !diameterCm || !basePrice) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });
    }

    const diam = Number(diameterCm);
    const autoOuterRadius = Number((diam / 20).toFixed(3));

    const created = await prisma.plateSize.create({
      data: {
        id: id.trim().toLowerCase(),
        name: name.trim(),
        diameterCm: diam,
        basePrice: Number(basePrice),
        outerRadius: outerRadius !== undefined ? Number(outerRadius) : autoOuterRadius,
        wellRatio: wellRatio !== undefined ? Number(wellRatio) : 0.64,
        wellDepth: wellDepth !== undefined ? Number(wellDepth) : 0.11,
        rimHeight: rimHeight !== undefined ? Number(rimHeight) : 0.0,
        rimAngleDeg: rimAngleDeg !== undefined ? Number(rimAngleDeg) : 0.0,
        thickness: thickness !== undefined ? Number(thickness) : 0.038,
        footRingRadiusRatio: footRingRadiusRatio !== undefined ? Number(footRingRadiusRatio) : 0.56,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, size: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const {
      id,
      name,
      diameterCm,
      basePrice,
      outerRadius,
      wellRatio,
      wellDepth,
      rimHeight,
      rimAngleDeg,
      thickness,
      footRingRadiusRatio,
      isActive,
    } = await req.json();

    if (!id) return NextResponse.json({ error: 'ID wajib disertakan' }, { status: 400 });

    const updated = await prisma.plateSize.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        diameterCm: diameterCm !== undefined ? Number(diameterCm) : undefined,
        basePrice: basePrice !== undefined ? Number(basePrice) : undefined,
        outerRadius: outerRadius !== undefined ? Number(outerRadius) : (diameterCm !== undefined ? Number((Number(diameterCm) / 20).toFixed(3)) : undefined),
        wellRatio: wellRatio !== undefined ? Number(wellRatio) : undefined,
        wellDepth: wellDepth !== undefined ? Number(wellDepth) : undefined,
        thickness: thickness !== undefined ? Number(thickness) : undefined,
        footRingRadiusRatio: footRingRadiusRatio !== undefined ? Number(footRingRadiusRatio) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return NextResponse.json({ success: true, size: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID diperlukan' }, { status: 400 });

    await prisma.plateSize.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Ukuran piring berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
