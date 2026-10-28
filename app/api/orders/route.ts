import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PlateFinish, RimTrim, PrintCoverage, PaymentMethod, PaymentStatus, OrderStatus, UserRole } from '@prisma/client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer, customization, pricing, paymentMethod, orderNumber } = body;

    if (!customer?.email || !customer?.name) {
      return NextResponse.json(
        { error: 'Nama dan email pemesan wajib diisi' },
        { status: 400 }
      );
    }

    // 1. Find or create customer user
    const user = await prisma.user.upsert({
      where: { email: customer.email.trim().toLowerCase() },
      update: {
        fullName: customer.name.trim(),
        phone: customer.phone || null,
      },
      create: {
        email: customer.email.trim().toLowerCase(),
        fullName: customer.name.trim(),
        phone: customer.phone || null,
        role: UserRole.CUSTOMER,
      },
    });

    // Format enums safely
    const finishMap: Record<string, PlateFinish> = {
      glossy: PlateFinish.GLOSSY,
      matte: PlateFinish.MATTE,
      satin: PlateFinish.SATIN,
    };

    const rimMap: Record<string, RimTrim> = {
      none: RimTrim.NONE,
      gold: RimTrim.GOLD,
      silver: RimTrim.SILVER,
      rose_gold: RimTrim.ROSE_GOLD,
      custom: RimTrim.CUSTOM,
    };

    const coverageMap: Record<string, PrintCoverage> = {
      center: PrintCoverage.CENTER,
      full: PrintCoverage.FULL,
    };

    const paymentMap: Record<string, PaymentMethod> = {
      bca: PaymentMethod.BCA,
      mandiri: PaymentMethod.MANDIRI,
      qris: PaymentMethod.QRIS,
      gopay: PaymentMethod.GOPAY,
    };

    // 2. Fetch Master Plate Size & Color from database as authoritative source of truth
    let masterPlateSize = await prisma.plateSize.findUnique({
      where: { id: customization.plateSize || 'dinner' },
    });

    // Fallback to active master plate size in DB if id not found
    if (!masterPlateSize) {
      masterPlateSize = await prisma.plateSize.findFirst({
        where: { isActive: true },
      });
    }

    if (!masterPlateSize) {
      return NextResponse.json(
        { error: 'Master ukuran piring tidak ditemukan di database' },
        { status: 400 }
      );
    }

    const masterPlateColor = customization.plateColor
      ? await prisma.plateColor.findFirst({
          where: { hexCode: { equals: customization.plateColor, mode: 'insensitive' } },
        })
      : null;

    const plateSizeName = masterPlateSize.name;
    const diameterCm = Number(masterPlateSize.diameterCm);
    const plateColorName = masterPlateColor?.name || customization.plateColorName || 'Porcelain White';
    const plateColorHex = customization.plateColor || masterPlateColor?.hexCode || '#FAF7F2';

    // Construct immutable CAD geometry snapshot directly from the Master table (100% Dynamic from Master)
    const geometrySnapshot = {
      outerRadius: Number(masterPlateSize.outerRadius),
      wellRatio: Number(masterPlateSize.wellRatio),
      wellDepth: Number(masterPlateSize.wellDepth),
      rimHeight: Number(masterPlateSize.rimHeight),
      rimAngleDeg: Number(masterPlateSize.rimAngleDeg),
      thickness: Number(masterPlateSize.thickness),
      footRingRadiusRatio: Number(masterPlateSize.footRingRadiusRatio),
    };

    // 3. Insert Customization with Master Snapshot
    const savedCustomization = await prisma.plateCustomization.create({
      data: {
        userId: user.id,
        plateSizeId: masterPlateSize?.id || customization.plateSize || 'dinner',
        plateColorHex: plateColorHex,
        plateFinish: finishMap[customization.finish] || PlateFinish.GLOSSY,
        rimTrim: rimMap[customization.rimTrim] || RimTrim.NONE,
        rimTrimCustomColor: customization.rimTrimCustomColor || null,
        printCoverage: coverageMap[customization.printCoverage] || PrintCoverage.CENTER,
        designImageUrl: customization.designImageUrl || null,
        designName: customization.designName || 'Custom Artwork',
        designScale: customization.designScale || 1.0,
        designRotation: customization.designRotation || 0.0,
        designOffsetX: customization.designOffsetX || 0.0,
        designOffsetY: customization.designOffsetY || 0.0,
        designOpacity: customization.designOpacity || 1.0,
        previewSnapshotUrl: customization.snapshotUrl || null,
        metadata: {
          rimPattern: customization.rimPattern || 'none',
          customRimPatternUrl: customization.customRimPatternUrl || null,
          customRimPatternName: customization.customRimPatternName || null,
          customRimPatternRepeat: customization.customRimPatternRepeat || 24,
          customRimPatternMode: customization.customRimPatternMode || 'repeat',
          logoPlacement: customization.logoPlacement || 'center',
          diameterCm: diameterCm,
          plateSizeName: plateSizeName,
          geometrySnapshot: geometrySnapshot,
        },
      },
    });

    // 4. Create Order, Order Item & Initial Production Log
    const finalOrderNumber = orderNumber || `CRX-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    const order = await prisma.order.create({
      data: {
        orderNumber: finalOrderNumber,
        userId: user.id,
        customerName: customer.name.trim(),
        customerEmail: customer.email.trim().toLowerCase(),
        customerPhone: customer.phone || '-',
        shippingAddress: customer.address || '-',
        city: customer.city || 'Kota Tujuan',
        postalCode: customer.postalCode || '12345',
        specialNotes: customer.notes || null,

        totalBasePrice: (pricing.unitBasePrice || 125000) * (pricing.quantity || 1),
        totalPrintFee: (pricing.printFee || 0) * (pricing.quantity || 1),
        totalRimTrimFee: (pricing.rimTrimFee || 0) * (pricing.quantity || 1),
        shippingCost: 0,
        discountAmount: 0,
        grandTotal: pricing.grandTotal,

        paymentMethod: paymentMap[paymentMethod] || PaymentMethod.QRIS,
        paymentStatus: PaymentStatus.UNPAID,
        orderStatus: OrderStatus.PENDING_PAYMENT,

        items: {
          create: {
            customizationId: savedCustomization.id,
            plateSizeName: plateSizeName,
            diameterCm: diameterCm,
            plateColorName: plateColorName,
            plateColorHex: plateColorHex,
            plateFinish: finishMap[customization.finish] || PlateFinish.GLOSSY,
            rimTrimName: customization.rimTrim || 'none',
            rimTrimCustomHex: customization.rimTrimCustomColor || null,
            printCoverage: coverageMap[customization.printCoverage] || PrintCoverage.CENTER,
            designImageUrl: customization.designImageUrl || null,
            snapshotRenderUrl: customization.snapshotUrl || '',

            unitBasePrice: pricing.unitBasePrice || 125000,
            unitPrintFee: pricing.printFee || 0,
            unitRimTrimFee: pricing.rimTrimFee || 0,
            unitTotalPrice: pricing.unitTotal,
            quantity: pricing.quantity || 1,
            subtotalPrice: pricing.grandTotal,
          },
        },
        logs: {
          create: {
            stage: OrderStatus.PENDING_PAYMENT,
            title: 'Pesanan Baru Diterima',
            description: 'Pesanan berhasil dibuat oleh customer dan menunggu pembayaran.',
          },
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.orderNumber,
      orderUuid: order.id,
      customer: {
        name: user.fullName,
        email: user.email,
      },
      totalPrice: order.grandTotal,
      status: order.orderStatus,
    });
  } catch (error: any) {
    console.error('Error creating order in PostgreSQL:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Gagal menyimpan pesanan ke database',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
          },
        },
        items: {
          include: {
            customization: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
