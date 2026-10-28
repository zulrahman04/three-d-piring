import { PrismaClient, UserRole } from '@prisma/client';
import { DESIGN_PRESETS, PLATE_SIZES } from '../constants/presets';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Ceramix 3D Master Data Seeding...');

  // 1. Seed Design Presets
  for (const preset of DESIGN_PRESETS) {
    await prisma.designPreset.upsert({
      where: { id: preset.id },
      update: {
        name: preset.name,
        category: preset.category,
        thumbnailSvgUrl: preset.thumbnailSvg || null,
        dataUrl: preset.dataUrl,
        isActive: true,
      },
      create: {
        id: preset.id,
        name: preset.name,
        category: preset.category,
        thumbnailSvgUrl: preset.thumbnailSvg || null,
        dataUrl: preset.dataUrl,
        isActive: true,
      },
    });
    console.log(`  ✓ Design Preset: ${preset.name}`);
  }

  // 2. Seed Default Admin User
  const adminPasswordHash = hashPassword('CeramixAdmin2026!');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ceramix3d.com' },
    update: {
      fullName: 'Super Admin Ceramix',
      role: UserRole.ADMIN,
      phone: '081100001111',
      passwordHash: adminPasswordHash,
    },
    create: {
      email: 'admin@ceramix3d.com',
      fullName: 'Super Admin Ceramix',
      role: UserRole.ADMIN,
      phone: '081100001111',
      passwordHash: adminPasswordHash,
    },
  });
  console.log(`  ✓ Admin User: ${admin.email} (Role: ${admin.role}) - Password: CeramixAdmin2026!`);

  // 3. Seed Default Artisan User
  const artisanPasswordHash = hashPassword('ArtisanCraft2026!');
  const artisan = await prisma.user.upsert({
    where: { email: 'artisan@ceramix3d.com' },
    update: {
      fullName: 'Master Potter & Artisan',
      role: UserRole.ARTISAN,
      phone: '081100002222',
      passwordHash: artisanPasswordHash,
    },
    create: {
      email: 'artisan@ceramix3d.com',
      fullName: 'Master Potter & Artisan',
      role: UserRole.ARTISAN,
      phone: '081100002222',
      passwordHash: artisanPasswordHash,
    },
  });
  // 4. Seed Default Landing & Studio Settings
  await prisma.siteSetting.upsert({
    where: { key: 'hero_section' },
    update: {},
    create: {
      key: 'hero_section',
      section: 'hero',
      title: 'Kustomisasi Piring Keramik 3D Eksklusif dengan Sentuhan Seni Bernilai Tinggi',
      content: 'Wujudkan piring porselen impian Anda secara interaktif 360 derajat. Kualitas hotel bintang lima dan restoran fine dining, dipanggang di kiln 1.250°C.',
      metadata: { badgeText: '✨ Koleksi Studio Keramik 2026', ctaText: 'Mulai Kustomisasi 3D' },
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'promo_banner' },
    update: {},
    create: {
      key: 'promo_banner',
      section: 'promo',
      title: 'Diskon Spesial Grosir Hingga 35% untuk Restoran & Kafe',
      content: 'Pesan sampel mulai dari 1 pcs dengan garansi anti-pecah 100% saat pengiriman kurir bergaransi.',
      metadata: { discountCode: 'CERAMIXVIP', minOrderPcs: 12 },
    },
  });

  await prisma.siteSetting.upsert({
    where: { key: 'studio_announcement' },
    update: {},
    create: {
      key: 'studio_announcement',
      section: 'announcement',
      title: 'Studio Kiln Online',
      content: 'Kapasitas pembakaran kiln saat ini normal (estimasi pengerjaan 3-5 hari kerja).',
      metadata: { kilnStatus: 'ONLINE', capacityPercent: 68 },
    },
  });
  // 5. Seed Master Plate Sizes with 3D Geometric Specifications (Flat Master)
  for (const s of PLATE_SIZES) {
    await prisma.plateSize.upsert({
      where: { id: s.id },
      update: {
        name: s.name,
        diameterCm: s.diameterCm,
        basePrice: s.basePrice,
        outerRadius: s.outerRadius,
        wellRatio: s.wellRatio,
        wellDepth: s.wellDepth,
        rimHeight: s.rimHeight,
        rimAngleDeg: s.rimAngleDeg,
        thickness: s.thickness,
        footRingRadiusRatio: s.footRingRadiusRatio,
        isActive: true,
      },
      create: {
        id: s.id,
        name: s.name,
        diameterCm: s.diameterCm,
        basePrice: s.basePrice,
        outerRadius: s.outerRadius,
        wellRatio: s.wellRatio,
        wellDepth: s.wellDepth,
        rimHeight: s.rimHeight,
        rimAngleDeg: s.rimAngleDeg,
        thickness: s.thickness,
        footRingRadiusRatio: s.footRingRadiusRatio,
        isActive: true,
      },
    });
    console.log(`  ✓ Plate Size (with 3D Geometry): ${s.name} (${s.diameterCm} cm)`);
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
