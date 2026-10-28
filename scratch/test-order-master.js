const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const master = await prisma.plateSize.findUnique({
    where: { id: 'dinner' }
  });
  console.log('Master plateSize in DB:', {
    id: master.id,
    name: master.name,
    diameterCm: Number(master.diameterCm),
    outerRadius: Number(master.outerRadius),
    wellRatio: Number(master.wellRatio),
    wellDepth: Number(master.wellDepth),
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
