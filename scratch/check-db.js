const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.orderItem.findMany({
    select: {
      id: true,
      orderId: true,
      snapshotRenderUrl: true,
      designImageUrl: true,
    }
  });
  console.log('ORDER ITEMS:');
  for (const item of items) {
    console.log({
      id: item.id,
      orderId: item.orderId,
      snapshotPrefix: item.snapshotRenderUrl ? item.snapshotRenderUrl.substring(0, 80) : null,
      snapshotIsSvg: item.snapshotRenderUrl?.startsWith('data:image/svg+xml'),
      snapshotIsPng: item.snapshotRenderUrl?.startsWith('data:image/png'),
      designPrefix: item.designImageUrl ? item.designImageUrl.substring(0, 80) : null,
    });
  }

  const custs = await prisma.plateCustomization.findMany({
    select: {
      id: true,
      previewSnapshotUrl: true,
      designImageUrl: true,
    }
  });
  console.log('CUSTOMIZATIONS:');
  for (const c of custs) {
    console.log({
      id: c.id,
      snapshotPrefix: c.previewSnapshotUrl ? c.previewSnapshotUrl.substring(0, 80) : null,
      snapshotIsSvg: c.previewSnapshotUrl?.startsWith('data:image/svg+xml'),
      snapshotIsPng: c.previewSnapshotUrl?.startsWith('data:image/png'),
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
