import { PrismaClient } from '@prisma/client';
import { DESIGN_PRESETS } from '../constants/presets';

const prisma = new PrismaClient();

async function main() {
  const preset = DESIGN_PRESETS[0];
  await prisma.orderItem.updateMany({
    data: {
      designImageUrl: preset.dataUrl,
    },
  });
  await prisma.plateCustomization.updateMany({
    data: {
      designImageUrl: preset.dataUrl,
    },
  });
  console.log('✅ Updated test order with Royal Delft motif!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
