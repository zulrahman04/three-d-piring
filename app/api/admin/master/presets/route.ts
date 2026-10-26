import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    const presets = await prisma.designPreset.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, presets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, name, category, dataUrl, thumbnailSvgUrl, isActive } = await req.json();
    if (!id || !name || !category || !dataUrl) {
      return NextResponse.json({ error: 'ID, Nama, Kategori, dan Data URL gambar wajib diisi' }, { status: 400 });
    }

    const created = await prisma.designPreset.create({
      data: {
        id: id.trim().toLowerCase(),
        name: name.trim(),
        category: category.trim(),
        dataUrl: dataUrl.trim(),
        thumbnailSvgUrl: thumbnailSvgUrl ? thumbnailSvgUrl.trim() : null,
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      },
    });

    return NextResponse.json({ success: true, preset: created });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, name, category, dataUrl, thumbnailSvgUrl, isActive } = await req.json();
    if (!id) return NextResponse.json({ error: 'ID wajib disertakan' }, { status: 400 });

    const updated = await prisma.designPreset.update({
      where: { id },
      data: {
        name: name ? name.trim() : undefined,
        category: category ? category.trim() : undefined,
        dataUrl: dataUrl ? dataUrl.trim() : undefined,
        thumbnailSvgUrl: thumbnailSvgUrl !== undefined ? thumbnailSvgUrl : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return NextResponse.json({ success: true, preset: updated });
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

    await prisma.designPreset.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'Preset motif berhasil dihapus' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
