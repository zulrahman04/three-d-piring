import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const ratio = process.argv[2] ? parseFloat(process.argv[2]) : 0.85;
  const depth = process.argv[3] ? parseFloat(process.argv[3]) : 0.25;
  console.log(`Setting Dinner Plate wellRatio to ${ratio}, wellDepth to ${depth}...`);
  await prisma.plateSize.update({
    where: { id: 'dinner' },
    data: {
      wellRatio: ratio,
      wellDepth: depth,
    },
  });
  console.log('Updated successfully in DB!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
