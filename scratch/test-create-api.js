async function testCreate() {
  const payload = {
    customer: {
      name: "Dzul Master Test",
      email: "dzul.master@example.com",
      phone: "081299998888",
      address: "Jl. Keramik Master No. 1",
      city: "Jakarta",
      postalCode: "12345",
    },
    customization: {
      plateSize: "dinner",
      plateColor: "#FAF7F2",
      finish: "glossy",
      rimTrim: "gold",
      printCoverage: "center",
      designName: "Master Verification Test",
      designScale: 1.2,
      designRotation: 15,
      designOffsetX: 0,
      designOffsetY: 0,
      designOpacity: 1,
    },
    pricing: {
      unitBasePrice: 125000,
      printFee: 35000,
      rimTrimFee: 20000,
      unitTotal: 180000,
      quantity: 1,
      grandTotal: 180000,
    },
    paymentMethod: "qris"
  };

  const res = await fetch('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log('Order created response:', data);

  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const order = await prisma.order.findUnique({
    where: { id: data.orderUuid },
    include: {
      items: {
        include: {
          customization: true
        }
      }
    }
  });

  console.log('Item snapshot from master:', {
    plateSizeName: order.items[0].plateSizeName,
    diameterCm: Number(order.items[0].diameterCm),
    plateColorName: order.items[0].plateColorName,
  });

  console.log('Geometry snapshot from master:', order.items[0].customization.metadata.geometrySnapshot);

  await prisma.$disconnect();
}

testCreate().catch(console.error);
