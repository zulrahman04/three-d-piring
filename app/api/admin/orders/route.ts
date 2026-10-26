import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            customization: true,
          },
        },
        logs: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { orderId, orderStatus, paymentStatus, trackingNumber, note } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID wajib disertakan' }, { status: 400 });
    }

    const updateData: any = {};
    if (orderStatus) updateData.orderStatus = orderStatus as OrderStatus;
    if (paymentStatus) updateData.paymentStatus = paymentStatus as PaymentStatus;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        ...updateData,
        logs: orderStatus
          ? {
              create: {
                operatorId: session.id,
                operatorName: `${session.fullName} (${session.role})`,
                stage: orderStatus as OrderStatus,
                title: `Status diubah ke ${orderStatus}`,
                description: note || `Status pesanan diperbarui oleh ${session.fullName}`,
              },
            }
          : undefined,
      },
      include: {
        items: true,
        logs: true,
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
