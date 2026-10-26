import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const colors = await prisma.plateColor.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ success: true, colors });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, name, hexCode, description, isActive } = await req.json();
    if (!id || !name || !hexCode) {
      return NextResponse.json({ error: 'ID, Nama, dan Kode Hex wajib diisi' }, { status: 400 });
    }

    const created = await prisma.plateColor.create({
      data: {
        id: id.trim().toLowerCase(),
        name: name.trim(),
        hexCode: hexCode.trim().toUpperCase(),
        description: description ? description.trim() : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, color: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, name, hexCode, description, isActive } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID wajib disertakan' }, { status: 400 });

    const updated = await prisma.plateColor.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        hexCode: hexCode ? hexCode.trim().toUpperCase() : undefined,
        description: description !== undefined ? description : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return NextResponse.json({ success: true, color: updated });
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

    await prisma.plateColor.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Warna keramik berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
