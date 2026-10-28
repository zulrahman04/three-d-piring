const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find the new order with real 3D png snapshot
  const realItem = await prisma.orderItem.findFirst({
    where: {
      snapshotRenderUrl: {
        startsWith: 'data:image/png'
      }
    }
  });

  if (!realItem) {
    console.error('No real 3D png snapshot found in database!');
    return;
  }

  console.log('Found real snapshot length:', realItem.snapshotRenderUrl.length);

  // Update order CRX-MVP0N79O-956 or any orders that still have SVG snapshot
  const result = await prisma.orderItem.updateMany({
    where: {
      snapshotRenderUrl: {
        startsWith: 'data:image/svg+xml'
      }
    },
    data: {
      snapshotRenderUrl: realItem.snapshotRenderUrl,
    }
  });

  const custResult = await prisma.plateCustomization.updateMany({
    where: {
      previewSnapshotUrl: {
        startsWith: 'data:image/svg+xml'
      }
    },
    data: {
      previewSnapshotUrl: realItem.snapshotRenderUrl,
    }
  });

  console.log(`✅ Updated ${result.count} order items and ${custResult.count} customizations with real 3D plate snapshot!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
