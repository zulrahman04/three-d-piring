/**
 * Utility for generating and printing official Ceramic Production Work Orders (SPK Produksi).
 * Prints via an isolated, zero-margin printable iframe to ensure 100% reliable output on A4 paper
 * without modal clipping, dark-mode ink loss, or popup blocker interference.
 */

export interface SpkPrintData {
  orderNumber: string;
  createdAt: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  specialNotes?: string | null;
  trackingNumber?: string | null;

  // Plate item specs
  plateSizeName: string;
  diameterCm: number | string;
  plateColorName: string;
  plateColorHex: string;
  plateFinish: string;
  rimTrimName: string;
  rimTrimCustomHex?: string | null;
  printCoverage: string;
  quantity: number;

  // Geometrical CAD specs
  wellDiameterCm?: string | number;
  wellDiameterMm?: string | number;
  rimWidthCm?: string | number;
  rimWidthMm?: string | number;
  wellDepthMm?: string | number;
  rimHeightMm?: string | number;
  rimAngleDeg?: string | number;
  thicknessMm?: string | number;
  footRingDiameterCm?: string | number;

  // Decal & Transform settings
  artworkUrl?: string | null;
  artworkName?: string;
  scaleVal?: number;
  rotationVal?: number;
  offsetXVal?: number;
  offsetYVal?: number;
  opacityVal?: number;
  rimPatternVal?: string;
  customRimUrl?: string | null;
  customRimName?: string;
  customRimRepeat?: number;
  snapshotUrl?: string | null;
}

/**
 * Generates an ultra high-precision vector SVG porcelain plate mockup.
 * Guarantees that the physical plate, porcelain color, glaze specular highlight,
 * metallic rim trim, and decal artwork always display crystal clear in the printed SPK
 * with 0% risk of broken images or missing previews.
 */
export function generatePlateSvgMockup(data: SpkPrintData): string {
  const plateHex = data.plateColorHex && data.plateColorHex.startsWith('#') ? data.plateColorHex : '#FAF7F2';
  const rimTrimLower = (data.rimTrimName || '').toLowerCase().trim();
  const hasRimTrim = Boolean(rimTrimLower && rimTrimLower !== 'none' && rimTrimLower !== 'polos' && rimTrimLower !== '');
  const isGlossy = (data.plateFinish || 'glossy').toLowerCase() === 'glossy';

  // Determine metallic rim gradient
  let rimGradientStops = '';
  if (rimTrimLower.includes('gold') && !rimTrimLower.includes('rose')) {
    rimGradientStops = `
      <stop offset="0%" stop-color="#9e7416" />
      <stop offset="25%" stop-color="#ffd76a" />
      <stop offset="50%" stop-color="#e0b541" />
      <stop offset="75%" stop-color="#fff0a8" />
      <stop offset="100%" stop-color="#a8791c" />
    `;
  } else if (rimTrimLower.includes('silver') || rimTrimLower.includes('perak') || rimTrimLower.includes('platinum')) {
    rimGradientStops = `
      <stop offset="0%" stop-color="#888888" />
      <stop offset="30%" stop-color="#ffffff" />
      <stop offset="60%" stop-color="#dcdcdc" />
      <stop offset="100%" stop-color="#999999" />
    `;
  } else if (rimTrimLower.includes('rose')) {
    rimGradientStops = `
      <stop offset="0%" stop-color="#8f4b56" />
      <stop offset="35%" stop-color="#ffd0d8" />
      <stop offset="70%" stop-color="#d48d7c" />
      <stop offset="100%" stop-color="#87424d" />
    `;
  } else if (data.rimTrimCustomHex && data.rimTrimCustomHex.startsWith('#')) {
    rimGradientStops = `
      <stop offset="0%" stop-color="${data.rimTrimCustomHex}" />
      <stop offset="100%" stop-color="${data.rimTrimCustomHex}" />
    `;
  } else if (rimTrimLower.startsWith('#')) {
    rimGradientStops = `
      <stop offset="0%" stop-color="${rimTrimLower}" />
      <stop offset="100%" stop-color="${rimTrimLower}" />
    `;
  } else {
    rimGradientStops = `
      <stop offset="0%" stop-color="#e0b541" />
      <stop offset="100%" stop-color="#ffd76a" />
    `;
  }

  // Artwork decal transformation
  const hasArtwork = Boolean(data.artworkUrl && !data.artworkUrl.includes('placeholder'));
  const safeArtworkHref = hasArtwork ? data.artworkUrl!.replace(/"/g, '&quot;') : '';
  const scale = Number(data.scaleVal) || 1;
  const rotation = Number(data.rotationVal) || 0;
  const offX = Number(data.offsetXVal) || 0;
  const offY = Number(data.offsetYVal) || 0;
  const opacity = data.opacityVal !== undefined ? Number(data.opacityVal) : 1;
  const imgSize = 75 * scale;

  return `
    <svg viewBox="0 0 200 200" width="125" height="125" xmlns="http://www.w3.org/2000/svg" style="display:block; margin:auto; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.18));">
      <defs>
        <!-- Porcelain Plate Shading -->
        <radialGradient id="spkPlateShade" cx="42%" cy="38%" r="65%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.6" />
          <stop offset="50%" stop-color="${plateHex}" />
          <stop offset="85%" stop-color="${plateHex}" />
          <stop offset="97%" stop-color="#000000" stop-opacity="0.14" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.32" />
        </radialGradient>

        <!-- Inner Well Concave Depression -->
        <radialGradient id="spkWellShade" cx="50%" cy="46%" r="52%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25" />
          <stop offset="70%" stop-color="${plateHex}" />
          <stop offset="96%" stop-color="#000000" stop-opacity="0.1" />
          <stop offset="100%" stop-color="#000000" stop-opacity="0.2" />
        </radialGradient>

        ${hasRimTrim ? `
        <!-- Metallic Rim Trim Gradient -->
        <linearGradient id="spkRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          ${rimGradientStops}
        </linearGradient>
        ` : ''}

        <!-- Glaze Specular Highlight -->
        <linearGradient id="spkGlazeReflection" x1="0%" y1="0%" x2="100%" y2="80%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.55" />
          <stop offset="40%" stop-color="#ffffff" stop-opacity="0.12" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </linearGradient>

        <clipPath id="spkPlateClip">
          <circle cx="100" cy="100" r="92" />
        </clipPath>
      </defs>

      <!-- Main Plate Body -->
      <g clip-path="url(#spkPlateClip)">
        <!-- Outer Plate Circle -->
        <circle cx="100" cy="100" r="92" fill="url(#spkPlateShade)" stroke="#cbd5e1" stroke-width="1.5" />

        <!-- Recessed Inner Well (Lekukan Cekung) -->
        <circle cx="100" cy="100" r="58" fill="url(#spkWellShade)" stroke="rgba(0,0,0,0.08)" stroke-width="1" />

        <!-- Decal Artwork Image -->
        ${hasArtwork ? `
        <g transform="translate(100, 100) translate(${offX}, ${offY}) rotate(${rotation})">
          <image
            href="${safeArtworkHref}"
            x="${-imgSize / 2}"
            y="${-imgSize / 2}"
            width="${imgSize}"
            height="${imgSize}"
            opacity="${opacity}"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
        ` : `
        <text x="100" y="103" text-anchor="middle" font-size="8.5" font-weight="700" fill="#9ca3af" font-family="-apple-system, BlinkMacSystemFont, sans-serif" letter-spacing="1">POLOS</text>
        `}

        <!-- Glossy Glaze Arc Reflection -->
        ${isGlossy ? `
        <path d="M 40 40 Q 100 12 160 40 Q 100 24 40 40 Z" fill="url(#spkGlazeReflection)" />
        <ellipse cx="65" cy="58" rx="34" ry="16" transform="rotate(-35 65 58)" fill="url(#spkGlazeReflection)" />
        ` : ''}

        <!-- Metallic Rim Trim Border -->
        ${hasRimTrim ? `
        <circle cx="100" cy="100" r="90" fill="none" stroke="url(#spkRimGrad)" stroke-width="3" />
        ` : ''}
      </g>
      <!-- Outer Edge Crisp Stroke -->
      <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="1.2" />
    </svg>
  `;
}

export function generateSpkHtml(data: SpkPrintData): string {
  const printDate = new Date().toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const orderDate = new Date(data.createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Determine if a real WebGL 3D rendered snapshot exists
  const isRealSnapshot = Boolean(
    data.snapshotUrl &&
    !data.snapshotUrl.includes('placeholder') &&
    !data.snapshotUrl.startsWith('data:image/svg+xml') &&
    (data.snapshotUrl.startsWith('data:image/png') ||
     data.snapshotUrl.startsWith('data:image/jpeg') ||
     data.snapshotUrl.startsWith('data:image/webp') ||
     data.snapshotUrl.startsWith('http://') ||
     data.snapshotUrl.startsWith('https://') ||
     data.snapshotUrl.startsWith('/'))
  );

  const plateMockupSvg = generatePlateSvgMockup(data);

  const previewMockupHtml = isRealSnapshot
    ? `
      <img
        src="${data.snapshotUrl}"
        alt="Mockup 3D Piring"
        style="max-width:100%; max-height:100%; object-fit:contain;"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
      />
      <div style="display:none; width:100%; height:100%; align-items:center; justify-content:center;">
        ${plateMockupSvg}
      </div>
    `
    : plateMockupSvg;

  const hasArtwork = Boolean(data.artworkUrl && !data.artworkUrl.includes('placeholder'));
  const safeMasterArtworkSrc = hasArtwork ? data.artworkUrl!.replace(/"/g, '&quot;') : '';

  const artworkMasterHtml = hasArtwork
    ? `
      <img
        src="${safeMasterArtworkSrc}"
        alt="Artwork Decal"
        style="max-width:100%; max-height:100%; object-fit:contain;"
        onerror="this.parentElement.innerHTML='<div style=\\\'color:#6b7280; font-size:10px; font-weight:600; padding:10px;\\\'>Piring Polos Tanpa Decal</div>';"
      />
    `
    : `
      <div style="color:#6b7280; font-size:10px; font-weight:600; text-align:center; padding:10px; line-height:1.4;">
        Piring Polos Tanpa Decal<br>
        <span style="font-size:9px; color:#9ca3af; font-weight:normal;">(Hanya Warna Dasar ${data.plateColorName} & Glasir ${data.plateFinish.toUpperCase()})</span>
      </div>
    `;

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>SPK Produksi - #${data.orderNumber}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      font-size: 11px;
      line-height: 1.4;
      padding: 0;
    }
    .spk-container {
      width: 100%;
      max-width: 210mm;
      margin: 0 auto;
    }
    /* Header */
    .spk-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #111827;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #000000;
      text-transform: uppercase;
    }
    .brand-sub {
      font-size: 10px;
      color: #4b5563;
      font-weight: 500;
    }
    .doc-badge {
      text-align: right;
    }
    .doc-badge h1 {
      font-size: 15px;
      font-weight: 800;
      color: #000000;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .doc-order-no {
      font-family: monospace;
      font-size: 14px;
      font-weight: 700;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
      margin-top: 3px;
    }

    /* Grid Sections */
    .grid-2 {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 12px;
      margin-bottom: 12px;
    }
    .panel {
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 8px 10px;
      background: #fafafa;
    }
    .panel-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #1f2937;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 4px;
      margin-bottom: 6px;
      display: flex;
      justify-content: space-between;
    }
    .meta-row {
      display: flex;
      margin-bottom: 3px;
      font-size: 10.5px;
    }
    .meta-label {
      width: 110px;
      color: #6b7280;
      font-weight: 500;
      flex-shrink: 0;
    }
    .meta-val {
      font-weight: 600;
      color: #111827;
      word-break: break-word;
    }

    /* Warning / Special Notes Box */
    .special-notes-box {
      border: 1.5px dashed #d97706;
      background: #fffbeb;
      border-radius: 6px;
      padding: 6px 10px;
      margin-bottom: 12px;
    }
    .notes-title {
      font-weight: 700;
      color: #b45309;
      font-size: 10.5px;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .notes-body {
      font-size: 11px;
      font-weight: 600;
      color: #78350f;
    }

    /* Tables */
    .table-section {
      margin-bottom: 12px;
    }
    .section-heading {
      font-size: 12px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #111827;
      color: #ffffff;
      padding: 4px 8px;
      border-radius: 4px 4px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    table.data-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #d1d5db;
      font-size: 10.5px;
    }
    table.data-table th {
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      padding: 5px 6px;
      font-weight: 700;
      text-align: left;
      color: #374151;
    }
    table.data-table td {
      border: 1px solid #e5e7eb;
      padding: 5px 6px;
      color: #1f2937;
    }
    table.data-table tr:nth-child(even) {
      background: #fafafa;
    }
    .highlight-val {
      font-weight: 700;
      color: #111827;
    }

    /* Visual Previews Row */
    .visual-row {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 8px;
      background: #ffffff;
    }
    .visual-box {
      flex: 1;
      text-align: center;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 6px;
      background: #f9fafb;
    }
    .visual-img-wrap {
      width: 100%;
      height: 130px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 4px;
    }
    .visual-img-wrap img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    .visual-caption {
      font-size: 10px;
      font-weight: 600;
      color: #374151;
    }

    /* Production Checklists & Signatures */
    .checklist-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 14px;
    }
    .check-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      margin-bottom: 4px;
      color: #374151;
    }
    .checkbox-square {
      width: 12px;
      height: 12px;
      border: 1.5px solid #4b5563;
      border-radius: 2px;
      display: inline-block;
      flex-shrink: 0;
    }

    /* Signature Table */
    .sig-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #9ca3af;
      margin-top: 6px;
    }
    .sig-table th {
      background: #f3f4f6;
      border: 1px solid #9ca3af;
      padding: 4px;
      font-size: 10px;
      font-weight: 700;
      text-align: center;
    }
    .sig-table td {
      border: 1px solid #9ca3af;
      height: 48px;
      vertical-align: bottom;
      text-align: center;
      font-size: 9.5px;
      padding-bottom: 3px;
      color: #4b5563;
    }

    /* Print Footer */
    .spk-footer {
      border-top: 1px solid #d1d5db;
      padding-top: 6px;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #6b7280;
      margin-top: 10px;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <div class="spk-container">
    <!-- Header -->
    <div class="spk-header">
      <div>
        <div class="brand-title">CERAMIX 3D STUDIO</div>
        <div class="brand-sub">Divisi Manufaktur & Pencetakan Keramik Porselen Kustom</div>
        <div class="brand-sub">Workshop & Kiln Control Center • Standard Industri Keramik</div>
      </div>
      <div class="doc-badge">
        <h1>SURAT PERINTAH KERJA (SPK)</h1>
        <div class="doc-order-no">#${data.orderNumber}</div>
      </div>
    </div>

    <!-- Info Pemesan & Status Pesanan Grid -->
    <div class="grid-2">
      <!-- Data Pemesan & Pengiriman -->
      <div class="panel">
        <div class="panel-title">
          <span>1. Data Pelanggan & Alamat Kirim</span>
          <span>Ekspedisi</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Nama Pemesan:</span>
          <span class="meta-val">${data.customerName}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">No. Telepon / WA:</span>
          <span class="meta-val">${data.customerPhone}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Alamat Lengkap:</span>
          <span class="meta-val">${data.shippingAddress || '-'}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Kota / Kode Pos:</span>
          <span class="meta-val">${data.city} (Kode Pos: ${data.postalCode || '-'})</span>
        </div>
      </div>

      <!-- Info Pesanan & Status -->
      <div class="panel">
        <div class="panel-title">
          <span>2. Status Pesanan</span>
          <span>Target Produksi</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Tanggal Masuk:</span>
          <span class="meta-val">${orderDate}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Jumlah Produksi:</span>
          <span class="meta-val highlight-val">${data.quantity} Pcs Piring</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Status Produksi:</span>
          <span class="meta-val highlight-val">${data.orderStatus}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Pembayaran:</span>
          <span class="meta-val">${data.paymentMethod.toUpperCase()} (${data.paymentStatus})</span>
        </div>
      </div>
    </div>

    <!-- Catatan Khusus Pelanggan -->
    <div class="special-notes-box">
      <div class="notes-title">⚠️ INSTRUKSI KHUSUS PELANGGAN (SPECIAL PRODUCTION / PACKING NOTES):</div>
      <div class="notes-body">${data.specialNotes ? data.specialNotes : 'Tidak ada instruksi khusus dari pelanggan.'}</div>
    </div>

    <!-- Spesifikasi Fisik Piring Keramik (Master CAD Specs) -->
    <div class="table-section">
      <div class="section-heading">
        <span>3. SPESIFIKASI GEOMETRI FISIK PIRING KERAMIK (MASTER CAD)</span>
        <span>Ukuran: ${data.plateSizeName} (${data.diameterCm} cm)</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Parameter Fisik</th>
            <th>Nilai Standar CAD</th>
            <th>Toleransi</th>
            <th>Finishing & Material</th>
            <th>Keterangan</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="highlight-val">Diameter Fisik Piring</td>
            <td class="highlight-val">${data.diameterCm} cm (${Number(data.diameterCm) * 10} mm)</td>
            <td>± 1.5 mm</td>
            <td>Bahan: <strong>Porselen Kaolin</strong></td>
            <td>Sesuai master cetakan</td>
          </tr>
          <tr>
            <td>Diameter Sumur Piring (Well)</td>
            <td>${data.wellDiameterCm || '-'} cm (${data.wellDiameterMm || '-'} mm)</td>
            <td>± 1.0 mm</td>
            <td>Warna Dasar: <strong>${data.plateColorName}</strong></td>
            <td>Area penempatan makanan</td>
          </tr>
          <tr>
            <td>Lebar Bibir Piring (Rim Width)</td>
            <td>${data.rimWidthCm || '-'} cm (${data.rimWidthMm || '-'} mm)</td>
            <td>± 1.0 mm</td>
            <td>Lapisan Glasir: <strong>${data.plateFinish.toUpperCase()}</strong></td>
            <td>Area lengkungan bibir</td>
          </tr>
          <tr>
            <td>Kedalaman Sumur (Well Depth)</td>
            <td>${data.wellDepthMm || '-'} mm</td>
            <td>± 0.8 mm</td>
            <td>Motif Bibir: <strong>${data.rimTrimName || 'None'}</strong></td>
            <td>Kedalaman cekungan tengah</td>
          </tr>
          <tr>
            <td>Tinggi Bibir (Rim Height)</td>
            <td>${data.rimHeightMm || '-'} mm</td>
            <td>± 0.8 mm</td>
            <td>Custom Trim Hex: <strong>${data.rimTrimCustomHex || '-'}</strong></td>
            <td>Ketinggian tepi luar</td>
          </tr>
          <tr>
            <td>Ketebalan Bodi (Thickness)</td>
            <td>${data.thicknessMm || '-'} mm</td>
            <td>± 0.3 mm</td>
            <td>Diameter Ring Kaki: <strong>${data.footRingDiameterCm || '-'} cm</strong></td>
            <td>Kekuatan benturan piring</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Parameter Cetak Decal & Sablon Keramik -->
    <div class="table-section">
      <div class="section-heading">
        <span>4. SETTING APLIKASI DECAL & SABLON KERAMIK</span>
        <span>Area: ${data.printCoverage}</span>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Nama Berkas Artwork</th>
            <th>Skala Cetak</th>
            <th>Rotasi (° Deg)</th>
            <th>Offset X & Y</th>
            <th>Opasitas</th>
            <th>Coverage</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="highlight-val">${data.artworkName || 'Artwork Kustom'}</td>
            <td>${data.scaleVal !== undefined ? (data.scaleVal * 100).toFixed(0) + '%' : '100%'}</td>
            <td>${data.rotationVal !== undefined ? data.rotationVal + '°' : '0°'}</td>
            <td>X: ${data.offsetXVal || 0} mm, Y: ${data.offsetYVal || 0} mm</td>
            <td>${data.opacityVal !== undefined ? (data.opacityVal * 100).toFixed(0) + '%' : '100%'}</td>
            <td class="highlight-val">${data.printCoverage}</td>
          </tr>
          ${data.rimPatternVal && data.rimPatternVal !== 'none' ? `
          <tr>
            <td colspan="6">
              <strong>Motif Bibir (Rim Pattern):</strong> ${data.customRimName || data.rimPatternVal}
              ${data.customRimRepeat ? `• Perulangan (Repeat): ${data.customRimRepeat}x` : ''}
            </td>
          </tr>
          ` : ''}
        </tbody>
      </table>
    </div>

    <!-- Visual Preview Mockup 3D & Decal Artwork -->
    <div class="visual-row">
      <div class="visual-box">
        <div class="visual-img-wrap">
          ${previewMockupHtml}
        </div>
        <div class="visual-caption">Preview Visual Piring 3D (Hasil Akhir)</div>
      </div>
      <div class="visual-box">
        <div class="visual-img-wrap">
          ${artworkMasterHtml}
        </div>
        <div class="visual-caption">Master Gambar Decal / Sablon Keramik</div>
      </div>
    </div>

    <!-- Production Checklist & Signatures -->
    <div class="checklist-row">
      <div>
        <div style="font-weight: 700; font-size: 10.5px; text-transform: uppercase; margin-bottom: 4px;">
          5. Checklist Tahapan Produksi:
        </div>
        <div class="check-item"><span class="checkbox-square"></span> 1. Pemilihan Bisque Piring Sesuai Ukuran CAD (${data.diameterCm} cm)</div>
        <div class="check-item"><span class="checkbox-square"></span> 2. Print Decal Water Slide Sesuai Posisi & Skala (${data.scaleVal !== undefined ? (data.scaleVal * 100).toFixed(0) + '%' : '100%'})</div>
        <div class="check-item"><span class="checkbox-square"></span> 3. Tempel Decal & Trim Bibir (${data.rimTrimName || 'None'})</div>
        <div class="check-item"><span class="checkbox-square"></span> 4. Pembakaran Glasir Kiln (1180°C - 1240°C)</div>
        <div class="check-item"><span class="checkbox-square"></span> 5. Lulus Uji Quality Control (Bebas Pinholes / Retak)</div>
        <div class="check-item"><span class="checkbox-square"></span> 6. Packing Aman Sesuai Instruksi Pelanggan</div>
      </div>

      <div>
        <div style="font-weight: 700; font-size: 10.5px; text-transform: uppercase; margin-bottom: 4px;">
          6. Verifikasi & Tanda Tangan Serah Terima:
        </div>
        <table class="sig-table">
          <thead>
            <tr>
              <th>Operator Decal</th>
              <th>Operator Kiln</th>
              <th>Quality Control</th>
              <th>Supervisor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>( .................... )</td>
              <td>( .................... )</td>
              <td>( .................... )</td>
              <td>( .................... )</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Footer -->
    <div class="spk-footer">
      <span>Dokumen Resmi SPK Produksi Ceramix 3D Studio • ID: ${data.orderNumber}</span>
      <span>Dicetak otomatis pada: ${printDate}</span>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers the browser print dialog for an SPK using a hidden zero-margin iframe.
 * This ensures no window popup blockage and guarantees pure white A4 print formatting.
 */
export function printSpkJobSheet(data: SpkPrintData): Promise<void> {
  return new Promise((resolve) => {
    // Check if an existing spk iframe exists and remove it
    const existingIframe = document.getElementById('spk-print-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'spk-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) {
      console.error('Failed to access print iframe document');
      resolve();
      return;
    }

    const htmlContent = generateSpkHtml(data);

    doc.open();
    doc.write(htmlContent);
    doc.close();

    // Give iframe time to parse and load images before printing
    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
        } catch (e) {
          console.error('Error triggering print', e);
        }
        resolve();
      }, 500);
    };

    // Fallback if onload doesn't fire immediately (e.g. data URLs)
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.error('Error triggering print fallback', e);
      }
      resolve();
    }, 800);
  });
}

/**
 * Downloads a high-resolution PNG image of the porcelain plate mockup.
 * Converts the vector plate SVG into an 800x800 crisp PNG file, guaranteeing
 * that the downloaded file is never blank or empty.
 */
export function downloadPlateMockupAsPng(data: SpkPrintData, filename: string): Promise<void> {
  return new Promise((resolve) => {
    try {
      const svgString = generatePlateSvgMockup(data);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const blobUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 800;
          canvas.height = 800;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, 800, 800);
            const pngDataUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = pngDataUrl;
            a.download = filename.endsWith('.png') ? filename : `${filename}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        } catch (e) {
          console.error('Error drawing SVG to canvas', e);
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = filename.replace(/\.png$/, '.svg');
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } finally {
          URL.revokeObjectURL(blobUrl);
          resolve();
        }
      };
      img.onerror = () => {
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename.replace(/\.png$/, '.svg');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
        resolve();
      };
      img.src = blobUrl;
    } catch (err) {
      console.error('Failed to download plate mockup', err);
      resolve();
    }
  });
}

