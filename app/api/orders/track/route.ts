import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = searchParams.get('orderNumber')?.trim();

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Nomor pesanan wajib diisi' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: {
          equals: orderNumber,
          mode: 'insensitive',
        },
      },
      include: {
        items: {
          include: {
            customization: {
              select: {
                id: true,
                designName: true,
                metadata: true,
              },
            },
          },
        },
        logs: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: `Pesanan dengan nomor "${orderNumber}" tidak ditemukan` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        city: order.city,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        paymentProofUrl: order.paymentProofUrl,
        trackingNumber: order.trackingNumber,
        totalBasePrice: Number(order.totalBasePrice),
        totalPrintFee: Number(order.totalPrintFee),
        totalRimTrimFee: Number(order.totalRimTrimFee),
        discountAmount: Number(order.discountAmount),
        grandTotal: Number(order.grandTotal),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: order.items.map((item) => ({
          id: item.id,
          plateSizeName: item.plateSizeName,
          diameterCm: Number(item.diameterCm),
          plateColorName: item.plateColorName,
          plateColorHex: item.plateColorHex,
          plateFinish: item.plateFinish,
          rimTrimName: item.rimTrimName,
          rimTrimCustomHex: item.rimTrimCustomHex,
          printCoverage: item.printCoverage,
          snapshotRenderUrl: item.snapshotRenderUrl,
          quantity: item.quantity,
          unitTotalPrice: Number(item.unitTotalPrice),
          subtotalPrice: Number(item.subtotalPrice),
          designName: item.customization?.designName || null,
          metadata: item.customization?.metadata || null,
        })),
        logs: order.logs.map((log) => ({
          id: log.id,
          stage: log.stage,
          title: log.title,
          description: log.description,
          createdAt: log.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error('Track order error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal melacak pesanan' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { orderNumber, paymentProofUrl, note } = await req.json();

    if (!orderNumber || !paymentProofUrl) {
      return NextResponse.json(
        { error: 'Nomor pesanan dan bukti transfer wajib disertakan' },
        { status: 400 }
      );
    }

    if (
      typeof paymentProofUrl !== 'string' ||
      !paymentProofUrl.startsWith('data:image/')
    ) {
      return NextResponse.json(
        { error: 'Format bukti pembayaran harus berupa gambar yang valid' },
        { status: 400 }
      );
    }

    if (paymentProofUrl.length > 3_500_000) {
      return NextResponse.json(
        { error: 'Ukuran gambar bukti pembayaran terlalu besar (maksimal 2.5 MB)' },
        { status: 400 }
      );
    }

    const existing = await prisma.order.findFirst({
      where: {
        orderNumber: {
          equals: orderNumber.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: 'Nomor pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: existing.id },
      data: {
        paymentProofUrl,
        logs: {
          create: {
            stage: existing.orderStatus,
            title: 'Bukti Pembayaran Diunggah Pelanggan',
            description:
              note?.trim() ||
              'Pelanggan mengunggah bukti pembayaran melalui halaman Lacak Pesanan. Menunggu verifikasi Admin.',
          },
        },
      },
      include: {
        logs: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json({
      success: true,
      paymentProofUrl: updated.paymentProofUrl,
      logs: updated.logs,
    });
  } catch (error: any) {
    console.error('Upload payment proof error:', error);
    return NextResponse.json(
      { error: error.message || 'Gagal mengunggah bukti pembayaran' },
      { status: 500 }
    );
  }
}
