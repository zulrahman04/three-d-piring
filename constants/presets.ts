import { DesignPreset, PlateColor, PlateSize, RimPattern, LogoPlacement } from '@/types/plate';

export const PLATE_SIZES: PlateSize[] = [
  {
    id: 'dinner',
    name: 'Dinner Plate',
    diameterCm: 27,
    basePrice: 125000,
    outerRadius: 1.35,
    wellRatio: 0.64,
    wellDepth: 0.11,
    rimHeight: 0.06,
    rimAngleDeg: 14,
    thickness: 0.038,
    footRingRadiusRatio: 0.56,
  },
  {
    id: 'salad',
    name: 'Dessert Plate',
    diameterCm: 20,
    basePrice: 95000,
    outerRadius: 1.00,
    wellRatio: 0.65,
    wellDepth: 0.085,
    rimHeight: 0.05,
    rimAngleDeg: 13,
    thickness: 0.035,
    footRingRadiusRatio: 0.56,
  },
  {
    id: 'dessert',
    name: 'Side / Bread Plate',
    diameterCm: 16,
    basePrice: 75000,
    outerRadius: 0.80,
    wellRatio: 0.66,
    wellDepth: 0.070,
    rimHeight: 0.04,
    rimAngleDeg: 12,
    thickness: 0.035,
    footRingRadiusRatio: 0.56,
  },
  {
    id: 'soup',
    name: 'Soup Plate',
    diameterCm: 22,
    basePrice: 110000,
    outerRadius: 1.10,
    wellRatio: 0.58,
    wellDepth: 0.20,
    rimHeight: 0.07,
    rimAngleDeg: 18,
    thickness: 0.040,
    footRingRadiusRatio: 0.50,
  },
];

export const PLATE_COLORS: PlateColor[] = [
  { id: 'porcelain-white', name: 'Porcelain White', hex: '#FAF7F2', description: 'Putih gading porselen klasik berkilau' },
  { id: 'matte-black', name: 'Matte Obsidian', hex: '#232326', description: 'Hitam arang doff modern dan eksklusif' },
  { id: 'warm-cream', name: 'Warm Cream', hex: '#E8CCA4', description: 'Krem vanila hangat bernuansa rustic' },
  { id: 'sage-green', name: 'Sage Green', hex: '#7D9678', description: 'Hijau sage pastel lembut bernuansa alam' },
  { id: 'dusty-terracotta', name: 'Terracotta', hex: '#B86851', description: 'Tanah liat panggang hangat bernuansa bohemian' },
  { id: 'blush-pink', name: 'Blush Pastel', hex: '#DE9F9D', description: 'Merah muda pastel feminin & elegan' },
  { id: 'deep-navy', name: 'Midnight Navy', hex: '#1C2938', description: 'Biru dongker pekat bernuansa royal' },
];

export const RIM_TRIMS = [
  { id: 'none', name: 'Polos (Tanpa Trim)', hex: 'transparent', price: 0 },
  { id: 'gold', name: '24K Gold Luster Rim', hex: '#D4AF37', price: 35000 },
  { id: 'silver', name: 'Platinum Silver Rim', hex: '#C0C0C0', price: 30000 },
  { id: 'rose-gold', name: 'Rose Gold Rim', hex: '#B76E79', price: 35000 },
  { id: 'custom', name: 'Warna Kustom (Hex)', hex: '#4F46E5', price: 35000 },
] as const;

export interface RimPatternItem {
  id: RimPattern;
  name: string;
  category: 'Garis Logam' | 'Batik Nusantara' | 'Klasik & Mewah' | 'Polos' | 'Kustom';
  description: string;
  badge?: string;
  price: number;
}

export const RIM_PATTERNS: RimPatternItem[] = [
  {
    id: 'none',
    name: 'Polos (Tanpa List)',
    category: 'Polos',
    description: 'Bibir piring bersih polos tanpa motif list',
    price: 0,
  },
  {
    id: 'custom',
    name: 'Upload Motif Sendiri (Kustom)',
    category: 'Kustom',
    description: 'Unggah potongan motif/batik sendiri berulang 360° atau ring melingkar',
    badge: 'Kustom',
    price: 35000,
  },
  {
    id: 'gold-double',
    name: 'Double 24K Gold Line',
    category: 'Garis Logam',
    description: 'Dua garis emas murni melingkar elegan standar hotel berbintang',
    badge: 'Favorit',
    price: 25000,
  },
  {
    id: 'gold-single',
    name: 'Classic Single Gold',
    category: 'Garis Logam',
    description: 'Garis emas tunggal tebal minimalis nan mewah',
    price: 20000,
  },
  {
    id: 'silver-double',
    name: 'Platinum Silver Double',
    category: 'Garis Logam',
    description: 'Garis ganda platina perak berkilau kontemporer',
    price: 20000,
  },
  {
    id: 'black-modern',
    name: 'Modern Obsidian Dark',
    category: 'Garis Logam',
    description: 'Garis hitam tegas bergaya modern cafe & bistro',
    price: 15000,
  },
  {
    id: 'batik-kawung',
    name: 'Batik Kawung Keraton',
    category: 'Batik Nusantara',
    description: 'Motif empat kelopak geometris Jawa klasik berpadu emas & indigo',
    badge: 'Nusantara',
    price: 35000,
  },
  {
    id: 'batik-megamendung',
    name: 'Batik Mega Mendung',
    category: 'Batik Nusantara',
    description: 'Aksen awan bergelombang khas Cirebon mengalir di bibir piring',
    badge: 'Nusantara',
    price: 35000,
  },
  {
    id: 'greek-key',
    name: 'Greek Key Meander',
    category: 'Klasik & Mewah',
    description: 'Motif geometris labirin Yunani kuno keemasan yang abadi',
    price: 30000,
  },
  {
    id: 'pearl-dots',
    name: 'Pearl Beaded Rim',
    category: 'Klasik & Mewah',
    description: 'Untaian bintik mutiara emas timbul 3D diapit garis ganda',
    badge: 'Luxury',
    price: 30000,
  },
];

// Inline SVG Presets converted to Data URLs
const createSvgDataUrl = (svgContent: string): string => {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent.trim())}`;
};

// 1. Royal Delft Blue Floral Porcelain Mandala
const svgRoyalDelft = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <radialGradient id="delftGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#0a2a5e" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="#00183b" stop-opacity="1"/>
    </radialGradient>
  </defs>
  <g fill="none" stroke="#103b79" stroke-width="2.5">
    <circle cx="250" cy="250" r="236" stroke="#103b79" stroke-width="3.5"/>
    <circle cx="250" cy="250" r="228" stroke="#103b79" stroke-width="1.5" stroke-dasharray="4,4"/>
    <circle cx="250" cy="250" r="175" stroke="#103b79" stroke-width="2"/>
    <circle cx="250" cy="250" r="110" stroke="#103b79" stroke-width="1.8"/>
    <circle cx="250" cy="250" r="48" fill="#103b79"/>
    <circle cx="250" cy="250" r="22" fill="#ffffff"/>
    
    <!-- 8 Main Radial Rays & Flowing Royal Delft Arabesque Vines -->
    <g transform="translate(250, 250)">
      ${[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => `
        <g transform="rotate(${angle})">
          <!-- Main Center Flower Petal (Lebih megah & proporsional, menjangkau radius 152) -->
          <path d="M 0 0 C -30 -48, -44 -110, 0 -152 C 44 -110, 30 -48, 0 0 Z" fill="#1b4d99" fill-opacity="0.92" stroke="#0a2550" stroke-width="2.2"/>
          <path d="M 0 -26 C -18 -62, -20 -105, 0 -138 C 20 -105, 18 -62, 0 -26 Z" fill="#ffffff" fill-opacity="0.94"/>
          <path d="M 0 -48 C -8 -78, -8 -110, 0 -124 C 8 -110, 8 -78, 0 -48 Z" fill="#103b79" fill-opacity="0.88"/>
          
          <!-- Continuous Stem & Side Leaves to Mid-Ring -->
          <path d="M 0 -150 L 0 -166" stroke="#103b79" stroke-width="3.5" stroke-linecap="round"/>
          <path d="M 0 -154 Q -16 -158 -14 -166 Q -6 -164 0 -160" fill="#1b4d99" stroke="#0a2550" stroke-width="1.2"/>
          <path d="M 0 -154 Q 16 -158 14 -166 Q 6 -164 0 -160" fill="#1b4d99" stroke="#0a2550" stroke-width="1.2"/>

          <!-- Mid-Ring Connector Accent -->
          <circle cx="0" cy="-166" r="6.5" fill="#103b79"/>
          <circle cx="0" cy="-166" r="2.8" fill="#ffffff"/>
          <path d="M -16 -162 Q 0 -180 16 -162" stroke="#103b79" stroke-width="2.5" fill="none"/>

          <!-- Continuous Flowing Stem Connecting Mid-Ring to Outer Palmette -->
          <path d="M 0 -166 L 0 -182" stroke="#103b79" stroke-width="3.5" stroke-linecap="round"/>
          <path d="M 0 -172 C -18 -174, -26 -184, -14 -190 C -6 -186, -2 -180, 0 -176 Z" fill="#1b4d99" fill-opacity="0.92" stroke="#0a2550" stroke-width="1.4"/>
          <path d="M 0 -172 C 18 -174, 26 -184, 14 -190 C 6 -186, 2 -180, 0 -176 Z" fill="#1b4d99" fill-opacity="0.92" stroke="#0a2550" stroke-width="1.4"/>

          <!-- Complete Royal Delft Outer Palmette / Lotus Floret (Utuh, Rapat & Menyatu) -->
          <path d="M 0 -182 C -20 -188, -34 -198, -26 -216 C -20 -206, -10 -196, 0 -192 Z" fill="#1b4d99" fill-opacity="0.95" stroke="#0a2550" stroke-width="1.5"/>
          <path d="M 0 -182 C 20 -188, 34 -198, 26 -216 C 20 -206, 10 -196, 0 -192 Z" fill="#1b4d99" fill-opacity="0.95" stroke="#0a2550" stroke-width="1.5"/>
          
          <!-- Central Solid Tulip Petal -->
          <path d="M 0 -178 C -20 -190, -22 -214, 0 -225 C 22 -214, 20 -190, 0 -178 Z" fill="#103b79" stroke="#0a2550" stroke-width="2"/>
          <path d="M 0 -186 C -12 -196, -12 -210, 0 -219 C 12 -210, 12 -196, 0 -186 Z" fill="#2563eb" fill-opacity="0.9" stroke="#0c2c5c" stroke-width="1.2"/>
          <circle cx="0" cy="-202" r="3.2" fill="#ffffff" fill-opacity="0.9"/>
          <circle cx="0" cy="-225" r="3.5" fill="#103b79"/>
        </g>
      `).join('')}

      <!-- 8 Intermediate Arabesque Foliage Sprays (Mengisi ruang antara mahkota agar tidak renggang) -->
      ${[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle) => `
        <g transform="rotate(${angle})">
          <!-- Radiating arabesque branch from inner circle outward -->
          <path d="M 0 -105 L 0 -175" stroke="#103b79" stroke-width="2"/>
          <path d="M 0 -120 Q -14 -128 -8 -138 Q -2 -135 0 -130" fill="#1b4d99" stroke="#0a2550" stroke-width="1"/>
          <path d="M 0 -120 Q 14 -128 8 -138 Q 2 -135 0 -130" fill="#1b4d99" stroke="#0a2550" stroke-width="1"/>
          
          <path d="M 0 -145 Q -16 -154 0 -162 Q 16 -170 0 -178" stroke="#103b79" stroke-width="2.2" fill="none"/>
          <circle cx="0" cy="-148" r="4" fill="#1b4d99"/>
          <circle cx="0" cy="-175" r="5" fill="#103b79"/>
          
          <!-- Outer Rim Blossom -->
          <path d="M 0 -182 C -10 -192, -12 -208, 0 -218 C 12 -208, 10 -192, 0 -182 Z" fill="#1b4d99" fill-opacity="0.92" stroke="#0a2550" stroke-width="1.5"/>
          <path d="M 0 -190 C -6 -196, -6 -206, 0 -212 C 6 -206, 6 -196, 0 -190 Z" fill="#3b82f6" fill-opacity="0.9"/>
          <circle cx="0" cy="-220" r="2.8" fill="#103b79"/>
        </g>
      `).join('')}
    </g>
  </g>
</svg>
`;

// 2. Botanical Minimalist Olive Wreath
const svgBotanical = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="250" cy="250" r="170" stroke="#c5a059" stroke-width="2.5" stroke-dasharray="8 6"/>
    <circle cx="250" cy="250" r="155" stroke="#4a5d4e" stroke-width="1.5"/>
    <g transform="translate(250, 250)">
      ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => `
        <g transform="rotate(${angle}) translate(0, -155)">
          <path d="M 0 0 C ${i % 2 === 0 ? '-15 -15, -25 5, 0 20' : '15 -15, 25 5, 0 20'}" fill="#3f5442" stroke="#2b3b2d" stroke-width="1.5"/>
          <circle cx="${i % 2 === 0 ? '-8' : '8'}" cy="5" r="3.5" fill="#c5a059"/>
        </g>
      `).join('')}
    </g>
    <!-- Center Typography -->
    <text x="250" y="235" font-family="'Times New Roman', serif" font-size="28" font-style="italic" text-anchor="middle" fill="#2d3d30" letter-spacing="4">Bon Appétit</text>
    <text x="250" y="270" font-family="sans-serif" font-size="11" text-anchor="middle" fill="#c5a059" letter-spacing="6">MAISON DE TABLE</text>
    <path d="M 190 285 L 310 285" stroke="#c5a059" stroke-width="1"/>
    <polygon points="250,282 254,285 250,288 246,285" fill="#c5a059"/>
  </g>
</svg>
`;

// 3. Japanese Wave & Crimson Rising Sun
const svgJapaneseWave = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <clipPath id="circleClip">
      <circle cx="250" cy="250" r="210"/>
    </clipPath>
  </defs>
  <g clip-path="url(#circleClip)">
    <!-- Red Sun -->
    <circle cx="250" cy="190" r="95" fill="#c83838"/>
    <!-- Mt Fuji Silhouette -->
    <polygon points="170,330 250,230 330,330" fill="#203348"/>
    <polygon points="230,255 250,230 270,255 260,265 250,258 240,265" fill="#ffffff"/>
    
    <!-- Stylized Ocean Waves -->
    <path d="M 30,340 Q 90,300 150,340 T 270,340 T 390,340 T 510,340 L 510,500 L 0,500 Z" fill="#132743"/>
    <path d="M 0,370 Q 70,320 140,370 T 280,370 T 420,370 T 560,370 L 560,500 L 0,500 Z" fill="#1d3d63"/>
    <path d="M 20,400 Q 80,360 140,400 T 260,400 T 380,400 T 500,400 L 500,500 L 0,500 Z" fill="#2d5b88"/>
    <path d="M 0,430 Q 90,390 180,430 T 360,430 T 540,430 L 540,500 L 0,500 Z" fill="#ffffff" fill-opacity="0.8"/>
  </g>
  <circle cx="250" cy="250" r="210" fill="none" stroke="#132743" stroke-width="4"/>
  <circle cx="250" cy="250" r="218" fill="none" stroke="#c83838" stroke-width="1.5"/>
</svg>
`;

// 4. Modern Minimalist Face Line Art & Scandinavian Shapes
const svgMinimalistLine = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <!-- Organic Earthy Shapes in Background -->
  <path d="M 120 140 Q 180 80 260 110 T 380 200 Q 350 280 280 270 T 130 220 Z" fill="#d9a785" fill-opacity="0.6"/>
  <circle cx="340" cy="320" r="75" fill="#889c8a" fill-opacity="0.5"/>
  <circle cx="160" cy="330" r="45" fill="#dfc07b" fill-opacity="0.6"/>

  <!-- Minimalist Face Contour -->
  <g fill="none" stroke="#222222" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
    <!-- Forehead down to nose, lips, and chin -->
    <path d="M 230 130 C 270 140 280 180 270 210 L 290 230 L 265 240 C 275 255 260 270 245 265 C 240 280 260 295 245 320 C 230 345 180 340 170 300"/>
    <!-- Closed eye and eyebrow -->
    <path d="M 215 195 Q 235 185 255 195" stroke-width="3"/>
    <path d="M 225 205 Q 235 215 245 205" stroke-width="3.5"/>
    <!-- Ear and earring -->
    <path d="M 195 240 C 180 250 180 275 195 285"/>
    <circle cx="190" cy="300" r="10" stroke="#d4af37" stroke-width="3"/>
  </g>
  <circle cx="250" cy="250" r="220" fill="none" stroke="#222222" stroke-width="2"/>
</svg>
`;

// 5. Artisanal Gold Monogram & Botanical Crest
const svgMonogramCrest = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  <defs>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#bf953f"/>
      <stop offset="25%" stop-color="#fcf6ba"/>
      <stop offset="50%" stop-color="#b38728"/>
      <stop offset="75%" stop-color="#fbf5b7"/>
      <stop offset="100%" stop-color="#aa771c"/>
    </linearGradient>
  </defs>
  <g stroke="url(#goldGradient)" fill="none" stroke-width="2.5">
    <circle cx="250" cy="250" r="230" stroke-width="3"/>
    <circle cx="250" cy="250" r="222" stroke-width="1.5" stroke-dasharray="6,4"/>
    <circle cx="250" cy="250" r="170" stroke-width="2"/>
    <circle cx="250" cy="250" r="162" stroke-width="1"/>
    
    <!-- Stars around outer ring -->
    <polygon points="250,35 253,43 261,43 255,48 257,56 250,51 243,56 245,48 239,43 247,43" fill="url(#goldGradient)"/>
    <polygon points="250,445 253,453 261,453 255,458 257,466 250,461 243,466 245,458 239,453 247,453" fill="url(#goldGradient)"/>
  </g>
  <!-- Center Monogram -->
  <text x="250" y="275" font-family="'Cinzel', 'Times New Roman', serif" font-size="96" font-weight="600" text-anchor="middle" fill="url(#goldGradient)" letter-spacing="2">A&amp;M</text>
  <text x="250" y="315" font-family="sans-serif" font-size="12" text-anchor="middle" fill="url(#goldGradient)" letter-spacing="8">EST. 2026</text>
  <text x="250" y="195" font-family="sans-serif" font-size="11" text-anchor="middle" fill="url(#goldGradient)" letter-spacing="6">ATELIER PRIVÉ</text>
</svg>
`;

export const DESIGN_PRESETS: DesignPreset[] = [
  {
    id: 'delft-blue',
    name: 'Royal Delft Floral',
    category: 'Classic Porcelain',
    thumbnailSvg: svgRoyalDelft,
    dataUrl: createSvgDataUrl(svgRoyalDelft),
  },
  {
    id: 'botanical-wreath',
    name: 'Botanical Gold Olive',
    category: 'Modern Rustic',
    thumbnailSvg: svgBotanical,
    dataUrl: createSvgDataUrl(svgBotanical),
  },
  {
    id: 'japanese-wave',
    name: 'Crimson Sun & Wave',
    category: 'Artistic / Oriental',
    thumbnailSvg: svgJapaneseWave,
    dataUrl: createSvgDataUrl(svgJapaneseWave),
  },
  {
    id: 'minimalist-face',
    name: 'Scandinavian Silhouette',
    category: 'Abstract Contemporary',
    thumbnailSvg: svgMinimalistLine,
    dataUrl: createSvgDataUrl(svgMinimalistLine),
  },
  {
    id: 'monogram-crest',
    name: '24K Monogram Crest',
    category: 'Luxury Wedding / Gift',
    thumbnailSvg: svgMonogramCrest,
    dataUrl: createSvgDataUrl(svgMonogramCrest),
  },
];

export interface SampleRimMotif {
  id: string;
  name: string;
  dataUrl: string;
}

export const SAMPLE_RIM_MOTIFS: SampleRimMotif[] = [
  {
    id: 'melati-emas',
    name: 'Kelopak Melati Emas',
    dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <g fill="none" stroke="#D4AF37" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="50" cy="50" r="9" fill="#F5D061" stroke="#B38A24" stroke-width="2"/>
          <path d="M50,14 C58,30 65,40 86,50 C65,60 58,70 50,86 C42,70 35,60 14,50 C35,40 42,30 50,14 Z" fill="#D4AF37" fill-opacity="0.3"/>
          <circle cx="50" cy="14" r="4.5" fill="#D4AF37"/>
          <circle cx="50" cy="86" r="4.5" fill="#D4AF37"/>
          <circle cx="14" cy="50" r="4.5" fill="#D4AF37"/>
          <circle cx="86" cy="50" r="4.5" fill="#D4AF37"/>
        </g>
      </svg>
    `.trim())}`,
  },
  {
    id: 'parang-emas',
    name: 'Batik Parang Gold',
    dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <g fill="none" stroke="#D4AF37" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22,86 C32,60 44,40 78,14" stroke-width="6" stroke="#D4AF37"/>
          <circle cx="78" cy="14" r="7" fill="#F5D061"/>
          <path d="M40,88 C50,74 56,62 72,48" stroke-width="3" stroke="#F5D061"/>
          <circle cx="36" cy="42" r="5" fill="#D4AF37"/>
        </g>
      </svg>
    `.trim())}`,
  },
  {
    id: 'royal-crown',
    name: 'Mahkota Klasik Royal',
    dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <g fill="none" stroke="#D4AF37" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="18,72 28,34 50,56 72,34 82,72" fill="#D4AF37" fill-opacity="0.35" stroke="#D4AF37" stroke-width="3.5"/>
          <circle cx="28" cy="30" r="4.5" fill="#F5D061"/>
          <circle cx="50" cy="52" r="4.5" fill="#F5D061"/>
          <circle cx="72" cy="30" r="4.5" fill="#F5D061"/>
          <line x1="14" y1="78" x2="86" y2="78" stroke="#D4AF37" stroke-width="4.5"/>
        </g>
      </svg>
    `.trim())}`,
  },
];

