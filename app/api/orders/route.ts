import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/auth';
import { calculatePlatePricing, getWholesaleDiscountPercent } from '@/lib/pricing';
import {
  PlateFinish,
  RimTrim,
  PrintCoverage,
  PaymentMethod,
  PaymentStatus,
  OrderStatus,
  UserRole,
} from '@prisma/client';

const finishMap: Record<string, PlateFinish> = {
  glossy: PlateFinish.GLOSSY,
  matte: PlateFinish.MATTE,
  satin: PlateFinish.SATIN,
};

const rimMap: Record<string, RimTrim> = {
  none: RimTrim.NONE,
  gold: RimTrim.GOLD,
  silver: RimTrim.SILVER,
  'rose-gold': RimTrim.ROSE_GOLD,
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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customer, customization, pricing, items: rawItems, paymentMethod, orderNumber } = body;

    if (!customer?.email || !customer?.name) {
      return NextResponse.json(
        { error: 'Nama dan email pemesan wajib diisi' },
        { status: 400 }
      );
    }

    // Normalize single-item legacy payload or multi-item cart payload into a unified list
    const incomingItems: Array<{ customization: any; quantity: number }> =
      Array.isArray(rawItems) && rawItems.length > 0
        ? rawItems.map((it: any) => ({
            customization: it.customization || it,
            quantity: Math.max(1, Math.floor(Number(it.quantity) || 1)),
          }))
        : customization
        ? [
            {
              customization,
              quantity: Math.max(1, Math.floor(Number(pricing?.quantity) || 1)),
            },
          ]
        : [];

    if (incomingItems.length === 0) {
      return NextResponse.json(
        { error: 'Minimal 1 item piring harus disertakan dalam pesanan' },
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

    // 2. Resolve each item against authoritative DB Master data and compute server-side pricing
    const totalQtyAcrossOrder = incomingItems.reduce((sum, it) => sum + it.quantity, 0);
    const wholesaleDiscountPct = getWholesaleDiscountPercent(totalQtyAcrossOrder);

    let totalBasePriceSum = 0;
    let totalPrintFeeSum = 0;
    let totalRimTrimFeeSum = 0;
    let subtotalBeforeDiscountSum = 0;

    const preparedOrderItems: any[] = [];

    for (const entry of incomingItems) {
      const custInput = entry.customization;
      const qty = entry.quantity;

      let masterPlateSize = await prisma.plateSize.findUnique({
        where: { id: custInput.plateSize || 'dinner' },
      });

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

      const masterPlateColor = custInput.plateColor
        ? await prisma.plateColor.findFirst({
            where: { hexCode: { equals: custInput.plateColor, mode: 'insensitive' } },
          })
        : null;

      const plateSizeName = masterPlateSize.name;
      const diameterCm = Number(masterPlateSize.diameterCm);
      const plateColorName =
        masterPlateColor?.name || custInput.plateColorName || 'Porcelain White';
      const plateColorHex = custInput.plateColor || masterPlateColor?.hexCode || '#FAF7F2';

      // Authoritative Server-Side Pricing Calculation
      const itemPricing = calculatePlatePricing({
        unitBasePrice: Number(masterPlateSize.basePrice),
        hasDesign: Boolean(custInput.designImageUrl),
        rimTrim: custInput.rimTrim || 'none',
        rimPattern: custInput.rimPattern || 'none',
        quantity: qty,
      });

      const lineSubtotalBeforeDiscount = itemPricing.unitTotal * qty;
      totalBasePriceSum += itemPricing.unitBasePrice * qty;
      totalPrintFeeSum += itemPricing.printFee * qty;
      // Store combined rim trim + rim pattern fee in totalRimTrimFee for accurate accounting
      totalRimTrimFeeSum += (itemPricing.rimTrimFee + itemPricing.rimPatternFee) * qty;
      subtotalBeforeDiscountSum += lineSubtotalBeforeDiscount;

      const geometrySnapshot = {
        outerRadius: Number(masterPlateSize.outerRadius),
        wellRatio: Number(masterPlateSize.wellRatio),
        wellDepth: Number(masterPlateSize.wellDepth),
        rimHeight: Number(masterPlateSize.rimHeight),
        rimAngleDeg: Number(masterPlateSize.rimAngleDeg),
        thickness: Number(masterPlateSize.thickness),
        footRingRadiusRatio: Number(masterPlateSize.footRingRadiusRatio),
      };

      const savedCustomization = await prisma.plateCustomization.create({
        data: {
          userId: user.id,
          plateSizeId: masterPlateSize.id,
          plateColorHex,
          plateFinish: finishMap[custInput.finish] || PlateFinish.GLOSSY,
          rimTrim: rimMap[custInput.rimTrim] || RimTrim.NONE,
          rimTrimCustomColor: custInput.rimTrimCustomColor || null,
          printCoverage: coverageMap[custInput.printCoverage] || PrintCoverage.CENTER,
          designImageUrl: custInput.designImageUrl || null,
          designName: custInput.designName || 'Custom Artwork',
          designScale: custInput.designScale ?? 1.0,
          designRotation: custInput.designRotation ?? 0.0,
          designOffsetX: custInput.designOffsetX ?? 0.0,
          designOffsetY: custInput.designOffsetY ?? 0.0,
          designOpacity: custInput.designOpacity ?? 1.0,
          previewSnapshotUrl: custInput.snapshotUrl || null,
          metadata: {
            rimPattern: custInput.rimPattern || 'none',
            rimPatternFee: itemPricing.rimPatternFee,
            customRimPatternUrl: custInput.customRimPatternUrl || null,
            customRimPatternName: custInput.customRimPatternName || null,
            customRimPatternRepeat: custInput.customRimPatternRepeat || 24,
            customRimPatternMode: custInput.customRimPatternMode || 'repeat',
            logoPlacement: custInput.logoPlacement || 'center',
            diameterCm,
            plateSizeName,
            geometrySnapshot,
          },
        },
      });

      const lineDiscount = Math.round(
        (lineSubtotalBeforeDiscount * wholesaleDiscountPct) / 100
      );

      preparedOrderItems.push({
        customizationId: savedCustomization.id,
        plateSizeName,
        diameterCm,
        plateColorName,
        plateColorHex,
        plateFinish: finishMap[custInput.finish] || PlateFinish.GLOSSY,
        rimTrimName: custInput.rimTrim || 'none',
        rimTrimCustomHex: custInput.rimTrimCustomColor || null,
        printCoverage: coverageMap[custInput.printCoverage] || PrintCoverage.CENTER,
        designImageUrl: custInput.designImageUrl || null,
        snapshotRenderUrl: custInput.snapshotUrl || '',
        unitBasePrice: itemPricing.unitBasePrice,
        unitPrintFee: itemPricing.printFee,
        unitRimTrimFee: itemPricing.rimTrimFee + itemPricing.rimPatternFee,
        unitTotalPrice: itemPricing.unitTotal,
        quantity: qty,
        subtotalPrice: Math.max(0, lineSubtotalBeforeDiscount - lineDiscount),
      });
    }

    const totalDiscountAmount = Math.round(
      (subtotalBeforeDiscountSum * wholesaleDiscountPct) / 100
    );
    const serverGrandTotal = Math.max(0, subtotalBeforeDiscountSum - totalDiscountAmount);

    // 3. Create Order, Order Items & Initial Production Log
    const finalOrderNumber =
      orderNumber ||
      `CRX-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

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

        totalBasePrice: totalBasePriceSum,
        totalPrintFee: totalPrintFeeSum,
        totalRimTrimFee: totalRimTrimFeeSum,
        shippingCost: 0,
        discountAmount: totalDiscountAmount,
        grandTotal: serverGrandTotal,

        paymentMethod: paymentMap[paymentMethod] || PaymentMethod.QRIS,
        paymentStatus: PaymentStatus.UNPAID,
        orderStatus: OrderStatus.PENDING_PAYMENT,

        items: {
          create: preparedOrderItems,
        },
        logs: {
          create: {
            stage: OrderStatus.PENDING_PAYMENT,
            title: 'Pesanan Baru Diterima',
            description:
              wholesaleDiscountPct > 0
                ? `Pesanan dibuat (${totalQtyAcrossOrder} pcs, diskon grosir ${wholesaleDiscountPct}%) dan menunggu pembayaran.`
                : 'Pesanan berhasil dibuat oleh customer dan menunggu pembayaran.',
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
      totalPrice: Number(order.grandTotal),
      discountPercent: wholesaleDiscountPct,
      discountAmount: totalDiscountAmount,
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
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
