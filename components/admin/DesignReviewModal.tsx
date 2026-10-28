'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  X,
  Printer,
  Download,
  Eye,
  RotateCcw,
  Sparkles,
  Palette,
  Layers,
  Sliders,
  CheckCircle2,
  Maximize2,
  FileText,
  Compass,
  Ruler,
  Flame,
  Shield,
  ExternalLink,
  Info,
  CircleDot,
  Check,
  User,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Truck,
  Copy,
} from 'lucide-react';
import { RimPattern, LogoPlacement, PlateSize } from '@/types/plate';
import { RIM_PATTERNS } from '@/constants/presets';
import PlatePreview from './PlatePreview';
import { printSpkJobSheet, downloadPlateMockupAsPng } from '@/lib/spkPrint';

// Dynamically import Three.js Plate3DViewer with ssr: false
const Plate3DViewer = dynamic(() => import('@/components/3d/Plate3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[440px] flex items-center justify-center bg-zinc-950/70 rounded-2xl border border-zinc-800 text-zinc-400 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span>Memuat Studio 3D Resolusi Tinggi (1:1)...</span>
      </div>
    </div>
  ),
});

export interface ReviewOrderItem {
  id: string;
  plateSizeName: string;
  diameterCm: string | number;
  plateColorName: string;
  plateColorHex: string;
  plateFinish: string;
  rimTrimName: string;
  rimTrimCustomHex?: string | null;
  printCoverage: string;
  designImageUrl: string | null;
  snapshotRenderUrl: string;
  unitTotalPrice: string;
  quantity: number;
  subtotalPrice: string;
  customization?: {
    id?: string;
    designImageUrl?: string | null;
    designName?: string | null;
    designScale?: number | string;
    designRotation?: number | string;
    designOffsetX?: number | string;
    designOffsetY?: number | string;
    designOpacity?: number | string;
    previewSnapshotUrl?: string | null;
    metadata?: {
      rimPattern?: RimPattern;
      customRimPatternUrl?: string | null;
      customRimPatternName?: string | null;
      customRimPatternRepeat?: number;
      customRimPatternMode?: 'repeat' | 'full';
      logoPlacement?: LogoPlacement;
      diameterCm?: number;
    };
    plateSize?: {
      id?: string;
      name?: string;
      diameterCm?: number | string;
      outerRadius?: number | string;
      wellRatio?: number | string;
      wellDepth?: number | string;
      rimHeight?: number | string;
      rimAngleDeg?: number | string;
      thickness?: number | string;
      footRingRadiusRatio?: number | string;
    };
  };
}

export interface ReviewOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  specialNotes: string | null;
  grandTotal: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  trackingNumber: string | null;
  createdAt: string;
  items: ReviewOrderItem[];
  logs?: Array<{
    id: string;
    stage: string;
    title: string;
    description: string;
    operatorName: string | null;
    createdAt: string;
  }>;
}

interface DesignReviewModalProps {
  order: ReviewOrder | null;
  onClose: () => void;
  onUpdateStatus?: (orderId: string, status: string, note?: string) => Promise<void>;
  updatingStatus?: boolean;
}

export default function DesignReviewModal({
  order,
  onClose,
  onUpdateStatus,
  updatingStatus = false,
}: DesignReviewModalProps) {
  const [activeTab, setActiveTab] = useState<'visual_3d' | 'geo_specs' | 'decal_settings' | 'all_assets' | 'customer_info'>('visual_3d');
  const [visualSubView, setVisualSubView] = useState<'3d' | 'decal_flat' | 'customer_snapshot'>('3d');
  const [selectedItemIndex, setSelectedItemIndex] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [printingSpk, setPrintingSpk] = useState(false);

  if (!order) return null;

  const currentItem = order.items?.[selectedItemIndex] || order.items?.[0];
  const cust = currentItem?.customization;
  const meta = (cust?.metadata as any) || {};
  // Prioritize frozen geometrySnapshot saved with the order, fallback to master plateSize relation
  const plateSizeGeo = meta?.geometrySnapshot || cust?.plateSize;
  const normalizedPlateSize: Partial<PlateSize> | undefined = plateSizeGeo
    ? {
        id: plateSizeGeo.id || 'dinner',
        name: meta?.plateSizeName || currentItem?.plateSizeName || plateSizeGeo.name || 'Dinner Plate',
        diameterCm: Number(plateSizeGeo.diameterCm) || Number(currentItem?.diameterCm) || 27,
        outerRadius: Number(plateSizeGeo.outerRadius) || 1.35,
        wellRatio: Number(plateSizeGeo.wellRatio) || 0.64,
        wellDepth: Number(plateSizeGeo.wellDepth) || 0.11,
        rimHeight: Number(plateSizeGeo.rimHeight) || 0.09,
        rimAngleDeg: Number(plateSizeGeo.rimAngleDeg) || 18,
        thickness: Number(plateSizeGeo.thickness) || 0.038,
        footRingRadiusRatio: Number(plateSizeGeo.footRingRadiusRatio) || 0.54,
      }
    : undefined;

  // Resolved Physical & Geometrical Specs
  const diameterNum = Number(currentItem?.diameterCm) || Number(plateSizeGeo?.diameterCm) || 27;
  const wellRatioNum = Number(plateSizeGeo?.wellRatio) || 0.64;
  const wellDiameterCm = (diameterNum * wellRatioNum).toFixed(1);
  const wellDiameterMm = (diameterNum * wellRatioNum * 10).toFixed(0);
  const rimWidthCm = (((diameterNum - diameterNum * wellRatioNum) / 2)).toFixed(1);
  const rimWidthMm = (((diameterNum - diameterNum * wellRatioNum) / 2) * 10).toFixed(0);
  const wellDepthCm = ((Number(plateSizeGeo?.wellDepth) || 0.11) * 20).toFixed(1);
  const wellDepthMm = ((Number(plateSizeGeo?.wellDepth) || 0.11) * 200).toFixed(0);
  const rimHeightMm = ((Number(plateSizeGeo?.rimHeight) || 0.09) * 200).toFixed(0);
  const rimAngleDeg = Number(plateSizeGeo?.rimAngleDeg) || 18;
  const thicknessMm = ((Number(plateSizeGeo?.thickness) || 0.038) * 100).toFixed(1);
  const footRingDiameterCm = (diameterNum * (Number(plateSizeGeo?.footRingRadiusRatio) || 0.54)).toFixed(1);

  // Decal & Transform settings
  const artworkUrl = currentItem?.designImageUrl || cust?.designImageUrl || null;
  const artworkName = cust?.designName || 'Kustom Pelanggan';
  const scaleVal = cust?.designScale ? Number(cust.designScale) : 1;
  const rotationVal = cust?.designRotation ? Number(cust.designRotation) : 0;
  const offsetXVal = cust?.designOffsetX ? Number(cust.designOffsetX) : 0;
  const offsetYVal = cust?.designOffsetY ? Number(cust.designOffsetY) : 0;
  const opacityVal = cust?.designOpacity ? Number(cust.designOpacity) : 1;

  // Rim Pattern & Custom Rim
  const rimPatternVal: RimPattern = meta.rimPattern || (currentItem?.rimTrimName === 'custom' ? 'custom' : 'none');
  const customRimUrl = meta.customRimPatternUrl || null;
  const customRimName = meta.customRimPatternName || 'Motif Bibir Kustom';
  const customRimRepeat = meta.customRimPatternRepeat || 24;
  const customRimMode = meta.customRimPatternMode || 'repeat';
  const logoPlacementVal: LogoPlacement = meta.logoPlacement || 'center';

  // Snapshot from customer
  const snapshotUrl = currentItem?.snapshotRenderUrl || cust?.previewSnapshotUrl || null;
  const isReal3dSnapshot = Boolean(
    snapshotUrl &&
    (snapshotUrl.startsWith('data:image/png') ||
     snapshotUrl.startsWith('data:image/jpeg') ||
     snapshotUrl.startsWith('data:image/webp') ||
     snapshotUrl.includes('.png') ||
     snapshotUrl.includes('.jpg') ||
     snapshotUrl.includes('.webp')) &&
    !snapshotUrl.startsWith('data:image/svg+xml') &&
    snapshotUrl !== artworkUrl
  );

  // Colors
  const plateColorHex = currentItem?.plateColorHex || '#FAF7F2';
  const rimTrimName = currentItem?.rimTrimName || 'none';
  const rimTrimCustomHex = currentItem?.rimTrimCustomHex || null;

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handlePrintJobSheet = async () => {
    try {
      setPrintingSpk(true);
      await printSpkJobSheet({
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        shippingAddress: order.shippingAddress,
        city: order.city,
        postalCode: order.postalCode,
        specialNotes: order.specialNotes,
        trackingNumber: order.trackingNumber,

        plateSizeName: currentItem?.plateSizeName || normalizedPlateSize?.name || 'Dinner Plate',
        diameterCm: diameterNum,
        plateColorName: currentItem?.plateColorName || 'Porcelain White',
        plateColorHex: plateColorHex,
        plateFinish: currentItem?.plateFinish || 'glossy',
        rimTrimName: rimTrimName,
        rimTrimCustomHex: rimTrimCustomHex,
        printCoverage: currentItem?.printCoverage || 'center',
        quantity: currentItem?.quantity || 1,

        wellDiameterCm: wellDiameterCm,
        wellDiameterMm: wellDiameterMm,
        rimWidthCm: rimWidthCm,
        rimWidthMm: rimWidthMm,
        wellDepthMm: wellDepthMm,
        rimHeightMm: rimHeightMm,
        rimAngleDeg: rimAngleDeg,
        thicknessMm: thicknessMm,
        footRingDiameterCm: footRingDiameterCm,

        artworkUrl: artworkUrl,
        artworkName: artworkName,
        scaleVal: scaleVal,
        rotationVal: rotationVal,
        offsetXVal: offsetXVal,
        offsetYVal: offsetYVal,
        opacityVal: opacityVal,
        rimPatternVal: rimPatternVal,
        customRimUrl: customRimUrl,
        customRimName: customRimName,
        customRimRepeat: customRimRepeat,
        snapshotUrl: isReal3dSnapshot ? snapshotUrl : null,
      });
    } catch (err) {
      console.error('Failed to print SPK', err);
    } finally {
      setPrintingSpk(false);
    }
  };

  const handleDownloadPlateMockup = async () => {
    if (isReal3dSnapshot && snapshotUrl) {
      downloadFile(snapshotUrl, `snapshot-3d-${order.orderNumber}.png`);
      return;
    }

    await downloadPlateMockupAsPng(
      {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        shippingAddress: order.shippingAddress,
        city: order.city,
        postalCode: order.postalCode,
        specialNotes: order.specialNotes,
        trackingNumber: order.trackingNumber,

        plateSizeName: currentItem?.plateSizeName || normalizedPlateSize?.name || 'Dinner Plate',
        diameterCm: diameterNum,
        plateColorName: currentItem?.plateColorName || 'Porcelain White',
        plateColorHex: plateColorHex,
        plateFinish: currentItem?.plateFinish || 'glossy',
        rimTrimName: rimTrimName,
        rimTrimCustomHex: rimTrimCustomHex,
        printCoverage: currentItem?.printCoverage || 'center',
        quantity: currentItem?.quantity || 1,

        wellDiameterCm: wellDiameterCm,
        wellDiameterMm: wellDiameterMm,
        rimWidthCm: rimWidthCm,
        rimWidthMm: rimWidthMm,
        wellDepthMm: wellDepthMm,
        rimHeightMm: rimHeightMm,
        rimAngleDeg: rimAngleDeg,
        thicknessMm: thicknessMm,
        footRingDiameterCm: footRingDiameterCm,

        artworkUrl: artworkUrl,
        artworkName: artworkName,
        scaleVal: scaleVal,
        rotationVal: rotationVal,
        offsetXVal: offsetXVal,
        offsetYVal: offsetYVal,
        opacityVal: opacityVal,
        rimPatternVal: rimPatternVal,
        customRimUrl: customRimUrl,
        customRimName: customRimName,
        customRimRepeat: customRimRepeat,
        snapshotUrl: isReal3dSnapshot ? snapshotUrl : null,
      },
      `mockup-piring-${order.orderNumber}.png`
    );
  };

  // WhatsApp & Shipping Text
  const cleanPhone = (order.customerPhone || '').replace(/[^0-9]/g, '');
  const waNumber = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Halo kak ${order.customerName}, kami dari tim Ceramix 3D Studio terkait pesanan piring keramik kustom Anda (#${order.orderNumber})...`
  )}`;

  const handleCopyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fullShippingText = `PENERIMA: ${order.customerName}
NO. TELP/WA: ${order.customerPhone}
ALAMAT: ${order.shippingAddress}
KOTA/WILAYAH: ${order.city}
KODE POS: ${order.postalCode}
CATATAN PENGIRIMAN: ${order.specialNotes || '-'}
NO. ORDER: #${order.orderNumber}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      {/* Modal Container */}
      <div className="relative w-full max-w-6xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl my-auto text-zinc-100 overflow-hidden flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-zinc-950/80 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-base sm:text-lg font-bold text-white tracking-wide">
                  {order.orderNumber}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase font-mono">
                  Review Tim Desain Keramik
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-1">
                <span>
                  Pemesan: <span className="text-zinc-200 font-bold">{order.customerName}</span> ({order.city})
                </span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('customer_info')}
                  className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2 cursor-pointer"
                  title="Klik untuk membuka rincian kontak & alamat pengiriman"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Detail Pemesan & Alamat</span>
                </button>
                <span>•</span>
                <span>{new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={printingSpk}
              onClick={handlePrintJobSheet}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700 hover:border-amber-400 disabled:opacity-50 shadow-xs"
              title="Cetak SPK / Lembar Kerja Produksi (Job Ticket) format A4"
            >
              {printingSpk ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span>Mempersiapkan SPK...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Cetak SPK Produksi</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 bg-zinc-950/40 border-b border-zinc-800/80 overflow-x-auto gap-2 py-2 text-xs shrink-0">
          {[
            { id: 'visual_3d', label: '1. Studio 3D & Visual 1:1', icon: Eye },
            { id: 'geo_specs', label: '2. Geometri Fisik Piring (Geo)', icon: Ruler },
            { id: 'decal_settings', label: '3. Setting Decal & Posisi Cetak', icon: Sliders },
            { id: 'all_assets', label: '4. Galeri Semua File & Aset', icon: Layers },
            { id: 'customer_info', label: '5. Detail Pemesan & Alamat', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-2 px-3.5 rounded-xl font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* ================= TAB 1: STUDIO 3D & VISUAL 1:1 ================= */}
          {activeTab === 'visual_3d' && (
            <div className="space-y-4">
              {/* Visual Mode Sub-toggles */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-950/60 p-2 rounded-2xl border border-zinc-800">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setVisualSubView('3d')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      visualSubView === '3d'
                        ? 'bg-zinc-800 text-white font-bold border border-zinc-700 shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Piring 3D Interaktif (WebGL)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisualSubView('decal_flat')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      visualSubView === 'decal_flat'
                        ? 'bg-zinc-800 text-white font-bold border border-zinc-700 shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Lembar Flat Decal 2D</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVisualSubView('customer_snapshot')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      visualSubView === 'customer_snapshot'
                        ? 'bg-zinc-800 text-white font-bold border border-zinc-700 shadow-xs'
                        : 'text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isReal3dSnapshot ? 'Snapshot 3D Customer' : 'Mockup Piring 1:1'}</span>
                  </button>
                </div>

                <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-2">
                  <span>{currentItem.plateSizeName}</span>
                  <span>•</span>
                  <span>{diameterNum} cm</span>
                  <span>•</span>
                  <span>{currentItem.plateColorName}</span>
                </div>
              </div>

              {/* Viewport Frame */}
              <div className="relative w-full h-[460px] bg-[#0c0e12] rounded-3xl border border-zinc-700/80 overflow-hidden flex items-center justify-center shadow-inner">
                {visualSubView === '3d' ? (
                  <Plate3DViewer
                    plateColor={plateColorHex}
                    plateFinish={currentItem.plateFinish}
                    rimTrim={rimTrimName}
                    rimTrimCustomColor={rimTrimCustomHex}
                    rimPattern={rimPatternVal}
                    customRimPatternUrl={customRimUrl}
                    customRimPatternRepeat={customRimRepeat}
                    customRimPatternMode={customRimMode}
                    logoPlacement={logoPlacementVal}
                    printCoverage={currentItem.printCoverage}
                    designUrl={artworkUrl}
                    designScale={scaleVal}
                    designRotation={rotationVal}
                    designOffsetX={offsetXVal}
                    designOffsetY={offsetYVal}
                    designOpacity={opacityVal}
                    diameterCm={diameterNum}
                    selectedSize={normalizedPlateSize}
                    initialPreset="perspective"
                  />
                ) : visualSubView === 'decal_flat' ? (
                  <div className="w-full h-full p-6 flex flex-col items-center justify-center relative bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px]">
                    <div className="relative w-[340px] h-[340px] rounded-full border-2 border-dashed border-zinc-600 flex items-center justify-center bg-zinc-900/60 p-4 shadow-2xl">
                      {/* Crosshairs */}
                      <div className="absolute inset-x-0 top-1/2 h-[1px] bg-red-500/30 pointer-events-none" />
                      <div className="absolute inset-y-0 left-1/2 w-[1px] bg-red-500/30 pointer-events-none" />
                      
                      {/* Inner Well Boundary */}
                      <div
                        className="absolute rounded-full border border-amber-400/40 pointer-events-none"
                        style={{
                          width: `${wellRatioNum * 100}%`,
                          height: `${wellRatioNum * 100}%`,
                        }}
                      >
                        <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono text-amber-400/70 bg-zinc-950 px-1 rounded">
                          Batas Cekungan ({wellDiameterCm} cm)
                        </span>
                      </div>

                      {artworkUrl ? (
                        <div
                          className="relative flex items-center justify-center transition-transform"
                          style={{
                            transform: `translate(${offsetXVal * 100}px, ${offsetYVal * 100}px) rotate(${rotationVal}deg) scale(${scaleVal})`,
                            opacity: opacityVal,
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={artworkUrl}
                            alt="Decal Flat"
                            className="max-w-[200px] max-h-[200px] object-contain drop-shadow-xl"
                          />
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-xs">Piring Polos Tanpa Decal Tengah</span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-3 font-mono">
                      Target Cetak Sablon Water Slide Decal • Diameter Luar: {diameterNum} cm
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full p-4 sm:p-6 flex flex-col items-center justify-center bg-zinc-950 relative">
                    {isReal3dSnapshot ? (
                      /* Real 3D Studio Snapshot from WebGL Canvas */
                      <div className="relative flex flex-col items-center justify-center max-h-full">
                        <div className="relative max-h-[380px] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group bg-zinc-900/80">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={snapshotUrl!}
                            alt="Snapshot 3D Piring Customer"
                            className="max-h-[380px] w-auto object-contain"
                          />
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md text-emerald-400 border border-emerald-500/30 text-[10px] font-bold tracking-wider flex items-center gap-1.5 uppercase font-mono">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span>Snapshot 3D Studio WebGL</span>
                          </div>
                          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => downloadFile(snapshotUrl!, `snapshot-3d-${order.orderNumber}.png`)}
                              className="px-3 py-1.5 rounded-xl bg-black/85 hover:bg-black text-white text-xs font-semibold backdrop-blur-md border border-white/20 flex items-center gap-1.5 shadow-lg cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5 text-amber-400" />
                              <span>Unduh Foto 3D (PNG)</span>
                            </button>
                          </div>
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-2.5 font-mono flex items-center gap-3">
                          <span>Foto Render 3D Konfirmasi Pesanan Customer</span>
                          <span>•</span>
                          <button
                            type="button"
                            onClick={() => downloadFile(snapshotUrl!, `snapshot-3d-${order.orderNumber}.png`)}
                            className="text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3" /> Unduh Resolusi Penuh
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Fallback: Render Complete 1:1 Porcelain Plate Composite when snapshot is SVG or Decal-only */
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-3 rounded-3xl bg-zinc-900/60 border border-zinc-800 shadow-2xl flex flex-col items-center">
                          <PlatePreview
                            plateColorHex={plateColorHex}
                            plateFinish={currentItem.plateFinish}
                            rimTrimName={rimTrimName}
                            rimTrimCustomHex={rimTrimCustomHex}
                            rimPattern={rimPatternVal}
                            customRimPatternUrl={customRimUrl}
                            customRimPatternRepeat={customRimRepeat}
                            customRimPatternMode={customRimMode}
                            printCoverage={currentItem.printCoverage}
                            designImageUrl={artworkUrl}
                            designName={artworkName}
                            designScale={scaleVal}
                            designRotation={rotationVal}
                            designOffsetX={offsetXVal}
                            designOffsetY={offsetYVal}
                            designOpacity={opacityVal}
                            diameterCm={diameterNum}
                            size="lg"
                          />
                        </div>
                        <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                          <Info className="w-3.5 h-3.5 shrink-0" />
                          <span>Mockup Piring Porselen 1:1 (Spesifikasi Master & Glasir Presisi)</span>
                        </div>
                        <div className="mt-2.5 flex items-center gap-3">
                          <button
                            type="button"
                            onClick={handleDownloadPlateMockup}
                            className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh Mockup Piring 1:1 (PNG HD)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setVisualSubView('3d')}
                            className="text-xs text-indigo-400 hover:text-indigo-300 underline font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" /> Buka Studio 3D Interaktif
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Specs Under Visual */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Warna Glasir</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-3.5 h-3.5 rounded-full border border-black/40" style={{ backgroundColor: plateColorHex }} />
                    <span className="font-semibold text-zinc-200">{currentItem.plateColorName}</span>
                    <span className="font-mono text-zinc-400 text-[11px]">({plateColorHex})</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Finishing Glasir</span>
                  <span className="font-semibold text-zinc-200 capitalize mt-1 block">
                    {currentItem.plateFinish === 'glossy' ? 'Kilap Porselen (Glossy)' : currentItem.plateFinish === 'matte' ? 'Matte Doff Alami' : 'Semi-Satin'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Aksen Rim Metalik</span>
                  <span className="font-semibold text-amber-400 mt-1 block">
                    {rimTrimName === 'custom' ? `Custom Hex (${rimTrimCustomHex})` : rimTrimName}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/80">
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Motif Lis Bibir</span>
                  <span className="font-semibold text-zinc-200 mt-1 block truncate">
                    {rimPatternVal === 'custom'
                      ? `${customRimName} (${customRimMode === 'repeat' ? `${customRimRepeat}x Putaran` : 'Cincin Utuh'})`
                      : RIM_PATTERNS.find((p) => p.id === rimPatternVal)?.name || rimPatternVal || 'Polos'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: GEOMETRI FISIK PIRING (GEO SPECS) ================= */}
          {activeTab === 'geo_specs' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-300 leading-relaxed">
                  <span className="font-bold text-amber-300">Spesifikasi Cetakan & Bodi Keramik (Pottery & Mold Making):</span> Data dimensi di bawah ini digunakan oleh pengrajin cetakan gips (*plaster mold*), mesin bubut *jiggering*, dan bengkel pembakaran kiln untuk memastikan presisi bentuk sebelum dan sesudah pembakaran suhu tinggi (1.250°C).
                </div>
              </div>

              {/* Geo Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Profil Dimensi Utama */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Ruler className="w-4 h-4" />
                    <span>Dimensi Luar & Cekungan</span>
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">Diameter Luar (D luar):</span>
                      <span className="font-mono font-bold text-white">{diameterNum} cm ({diameterNum * 10} mm)</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">Rasio Cekungan (Well Ratio):</span>
                      <span className="font-mono font-bold text-white">{(wellRatioNum * 100).toFixed(0)}% ({wellRatioNum})</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">Diameter Area Cekungan:</span>
                      <span className="font-mono font-bold text-emerald-400">{wellDiameterCm} cm ({wellDiameterMm} mm)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Lebar Sayap Bibir (Rim Width):</span>
                      <span className="font-mono font-bold text-indigo-400">{rimWidthCm} cm ({rimWidthMm} mm)</span>
                    </div>
                  </div>
                </div>

                {/* 2. Profil Ketebalan & Kemiringan */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Compass className="w-4 h-4" />
                    <span>Ketebalan & Profil Sudut</span>
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">Kedalaman Cekungan:</span>
                      <span className="font-mono font-bold text-white">{wellDepthCm} cm ({wellDepthMm} mm)</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">Kemiringan Bibir (Flare Angle):</span>
                      <span className="font-mono font-bold text-white">{rimAngleDeg}°</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">Tinggi Lengkung Bibir:</span>
                      <span className="font-mono font-bold text-white">{rimHeightMm} mm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Tebal Bodi Porselen (Wall):</span>
                      <span className="font-mono font-bold text-amber-300">{thicknessMm} mm</span>
                    </div>
                  </div>
                </div>

                {/* 3. Kaki Bawah & Kiln Firing */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-4 h-4" />
                    <span>Cincin Kaki & Kiln Firing</span>
                  </h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">Diameter Cincin Kaki (Foot):</span>
                      <span className="font-mono font-bold text-white">{footRingDiameterCm} cm</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">Suhu Bakar Glaze Kiln:</span>
                      <span className="font-mono font-bold text-red-400">1.250°C (Cone 8-9)</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">Estimasi Penyusutan (*Shrinkage*):</span>
                      <span className="font-mono font-bold text-zinc-300">12% - 14%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Ukuran Master Gips Basah:</span>
                      <span className="font-mono font-bold text-zinc-300">{(diameterNum * 1.13).toFixed(1)} cm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Geometric Blueprint Diagram */}
              <div className="p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                    Diagram Potongan Melintang Geometri Piring (Cross-Section Blueprint)
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">Skala Proporsional 1:1</span>
                </div>

                <div className="w-full h-32 relative bg-zinc-900/60 rounded-xl border border-zinc-800/80 flex items-center justify-center p-4">
                  <svg className="w-full h-full max-w-xl overflow-visible" viewBox="0 0 600 120">
                    {/* Center axis */}
                    <line x1="300" y1="10" x2="300" y2="110" stroke="#52525b" strokeWidth="1" strokeDasharray="4,4" />
                    {/* Plate profile curve */}
                    <path
                      d="M 50,40 Q 140,42 190,82 Q 240,94 300,94 Q 360,94 410,82 Q 460,42 550,40"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="3.5"
                    />
                    {/* Foot ring */}
                    <path d="M 215,94 L 215,104 L 230,104" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                    <path d="M 385,94 L 385,104 L 370,104" fill="none" stroke="#f59e0b" strokeWidth="2.5" />

                    {/* Annotations */}
                    <line x1="50" y1="20" x2="550" y2="20" stroke="#38bdf8" strokeWidth="1.2" />
                    <text x="300" y="16" fill="#38bdf8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                      Diameter Luar {diameterNum} cm ({diameterNum * 10} mm)
                    </text>

                    <line x1="190" y1="110" x2="410" y2="110" stroke="#34d399" strokeWidth="1.2" />
                    <text x="300" y="122" fill="#34d399" fontSize="10" textAnchor="middle" fontFamily="monospace">
                      Area Cekungan {wellDiameterCm} cm ({wellDiameterMm} mm)
                    </text>

                    <text x="120" y="32" fill="#818cf8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                      Sayap Bibir {rimWidthCm} cm
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: SETTING DECAL & POSISI CETAK ================= */}
          {activeTab === 'decal_settings' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Card: Artwork Transform Coordinates */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
                  <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4" />
                    <span>Setting Koordinat & Transformasi Decal</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">Penempatan / Coverage:</span>
                      <span className="font-semibold text-white capitalize">
                        {logoPlacementVal === 'top-rim'
                          ? 'Bibir Jam 12 (Top Rim)'
                          : logoPlacementVal === 'center'
                          ? 'Tengah Cekungan (Center Well)'
                          : currentItem.printCoverage === 'full'
                          ? 'Seluruh Permukaan Piring'
                          : 'Bebas'}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">Skala Ukuran (Scale):</span>
                      <span className="font-mono font-bold text-amber-300">
                        {(scaleVal * 100).toFixed(0)}% ({scaleVal.toFixed(2)}x)
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">Rotasi Sudut (Angle):</span>
                      <span className="font-mono font-bold text-amber-300">
                        {rotationVal.toFixed(1)}°
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">Offset Horizontal (X):</span>
                      <span className="font-mono font-bold text-white">
                        {offsetXVal >= 0 ? `+${(offsetXVal * 100).toFixed(1)}%` : `${(offsetXVal * 100).toFixed(1)}%`}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">Offset Vertikal (Y):</span>
                      <span className="font-mono font-bold text-white">
                        {offsetYVal >= 0 ? `+${(offsetYVal * 100).toFixed(1)}%` : `${(offsetYVal * 100).toFixed(1)}%`}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-zinc-400">Opasitas Tinta Decal:</span>
                      <span className="font-mono font-bold text-white">
                        {(opacityVal * 100).toFixed(0)}% (Solid)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Card: Rim & Glaze Specifications */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-4 h-4" />
                    <span>Spesifikasi Glasir & List Rim</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">Warna Dasar Porselen:</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full border border-black/40" style={{ backgroundColor: plateColorHex }} />
                        <span className="font-semibold text-white">{currentItem.plateColorName}</span>
                        <span className="font-mono text-zinc-400">({plateColorHex})</span>
                      </div>
                    </div>

                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">Tekstur Glasir:</span>
                      <span className="font-semibold text-white capitalize">
                        {currentItem.plateFinish} Porcelain
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">Trim Aksen Metalik:</span>
                      <span className="font-semibold text-amber-400">
                        {rimTrimName === 'custom' ? `Custom Hex (${rimTrimCustomHex})` : rimTrimName}
                      </span>
                    </div>

                    <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                      <span className="text-zinc-400">Motif Lis Bibir Piring:</span>
                      <span className="font-semibold text-white truncate max-w-[200px]">
                        {rimPatternVal === 'custom'
                          ? 'Motif Kustom Pelanggan'
                          : RIM_PATTERNS.find((p) => p.id === rimPatternVal)?.name || rimPatternVal || 'Polos'}
                      </span>
                    </div>

                    {rimPatternVal === 'custom' && (
                      <>
                        <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                          <span className="text-zinc-400">Mode Penempatan Rim:</span>
                          <span className="font-semibold text-indigo-300">
                            {customRimMode === 'repeat' ? 'Ulang Melingkar (Radial Repeat)' : 'Cincin Lingkaran Utuh (Full Ring)'}
                          </span>
                        </div>
                        {customRimMode === 'repeat' && (
                          <div className="flex justify-between">
                            <span className="text-zinc-400">Kerapatan Putaran Rim:</span>
                            <span className="font-mono font-bold text-amber-400">{customRimRepeat}x Putaran 360°</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: GALERI SEMUA FILE & ASET ================= */}
          {activeTab === 'all_assets' && (
            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Semua aset grafis asli yang digunakan pelanggan pada pesanan ini. Tim produksi dapat mengunduh file asli beresolusi tinggi untuk keperluan cetak decal sablon keramik.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 1. Artwork Utama Decal */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                        Artwork Decal Utama
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">PNG / SVG</span>
                    </div>
                    <div className="w-full h-44 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center p-3 overflow-hidden bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:12px_12px]">
                      {artworkUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={artworkUrl}
                          alt="Decal Utama"
                          className="max-h-full max-w-full object-contain filter drop-shadow-md"
                        />
                      ) : (
                        <span className="text-zinc-500 text-xs">Piring Polos Tanpa Artwork</span>
                      )}
                    </div>
                    <p className="text-xs font-medium text-zinc-300 mt-2 truncate">
                      {artworkName}
                    </p>
                  </div>

                  {artworkUrl && (
                    <button
                      type="button"
                      onClick={() => downloadFile(artworkUrl, `artwork-decal-${order.orderNumber}.png`)}
                      className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs mt-3"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download File Asli Decal</span>
                    </button>
                  )}
                </div>

                {/* 2. Custom Rim Pattern Tile (jika ada) */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        Motif Kustom Bibir Piring
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {customRimMode === 'repeat' ? `${customRimRepeat}x Putaran` : 'Full Ring'}
                      </span>
                    </div>
                    <div className="w-full h-44 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center p-3 overflow-hidden bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:12px_12px]">
                      {customRimUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={customRimUrl}
                          alt="Custom Rim Motif"
                          className="max-h-full max-w-full object-contain filter drop-shadow-md"
                        />
                      ) : (
                        <div className="text-center text-zinc-500 text-xs">
                          {rimPatternVal !== 'none'
                            ? `Menggunakan Preset (${RIM_PATTERNS.find((p) => p.id === rimPatternVal)?.name || rimPatternVal})`
                            : 'Bibir Piring Polos'}
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-zinc-300 mt-2 truncate">
                      {customRimName || 'Motif Bibir'}
                    </p>
                  </div>

                  {customRimUrl && (
                    <button
                      type="button"
                      onClick={() => downloadFile(customRimUrl, `rim-motif-${order.orderNumber}.png`)}
                      className="w-full py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs mt-3"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Tile Motif Bibir</span>
                    </button>
                  )}
                </div>

                {/* 3. 3D Snapshot Render Customer */}
                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        Snapshot 3D Konfirmasi
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">Render</span>
                    </div>
                    <div className="w-full h-44 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center p-2 overflow-hidden">
                      {isReal3dSnapshot ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={snapshotUrl!}
                          alt="3D Snapshot"
                          className="max-h-full max-w-full object-contain rounded-lg"
                        />
                      ) : (
                        <PlatePreview
                          plateColorHex={plateColorHex}
                          plateFinish={currentItem.plateFinish}
                          rimTrimName={rimTrimName}
                          rimTrimCustomHex={rimTrimCustomHex}
                          rimPattern={rimPatternVal}
                          customRimPatternUrl={customRimUrl}
                          customRimPatternRepeat={customRimRepeat}
                          customRimPatternMode={customRimMode}
                          printCoverage={currentItem.printCoverage}
                          designImageUrl={artworkUrl}
                          designName={artworkName}
                          designScale={scaleVal}
                          designRotation={rotationVal}
                          designOffsetX={offsetXVal}
                          designOffsetY={offsetYVal}
                          designOpacity={opacityVal}
                          diameterCm={diameterNum}
                          size="sm"
                        />
                      )}
                    </div>
                    <p className="text-xs font-medium text-zinc-300 mt-2">
                      {isReal3dSnapshot ? 'Tampak 3D yang disetujui pemesan' : 'Mockup piring porselen 1:1'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadPlateMockup}
                    className="w-full py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-zinc-700 mt-3 shadow-xs"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>{isReal3dSnapshot ? 'Download Snapshot 3D (PNG)' : 'Download Mockup Piring (PNG HD)'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 5: DETAIL PEMESAN & PENGIRIMAN ================= */}
          {activeTab === 'customer_info' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Kontak Pelanggan */}
                <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-400" />
                      Profil & Kontak Pemesan
                    </span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                      Pelanggan Terverifikasi
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white tracking-tight">{order.customerName}</h3>
                  </div>

                  {/* Phone & WA */}
                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="font-mono font-medium text-sm">{order.customerPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-zinc-950 text-xs font-semibold transition-all border border-emerald-500/30"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Chat WhatsApp</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyText(order.customerPhone, 'phone')}
                        className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Salin No Telp"
                      >
                        {copiedField === 'phone' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-zinc-300 truncate">
                      <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="truncate">{order.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`mailto:${order.customerEmail}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => handleCopyText(order.customerEmail, 'email')}
                        className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Salin Email"
                      >
                        {copiedField === 'email' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Alamat Pengiriman */}
                <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold tracking-wider uppercase text-zinc-400 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-amber-400" />
                        Tujuan Ekspedisi & Pengiriman
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyText(fullShippingText, 'full_address')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/15 hover:bg-amber-400 text-amber-300 hover:text-zinc-950 text-xs font-semibold transition-all border border-amber-400/30 cursor-pointer"
                      >
                        {copiedField === 'full_address' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin Label Resi</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-medium text-white leading-relaxed">
                        {order.shippingAddress || <span className="text-zinc-500 italic">Alamat belum terisi lengkap</span>}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-zinc-300">
                        <span className="px-2.5 py-1 rounded-lg bg-zinc-800 font-semibold text-zinc-200">
                          {order.city}
                        </span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-400 font-mono">Kode Pos: {order.postalCode}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-zinc-400 flex items-center gap-1.5">
                      <Truck className="w-4 h-4 text-zinc-400" />
                      Nomor Resi / Kurir:
                    </span>
                    <span className="font-mono font-semibold text-zinc-200">
                      {order.trackingNumber || <span className="text-zinc-500 font-normal italic">Belum dibuat resi</span>}
                    </span>
                  </div>
                </div>
              </div>

              {/* Catatan Khusus Pelanggan */}
              <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <span>Catatan Khusus Pelanggan untuk Tim Produksi & Packing</span>
                </div>
                {order.specialNotes ? (
                  <div className="p-3.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    &ldquo;{order.specialNotes}&rdquo;
                  </div>
                ) : (
                  <div className="text-xs text-zinc-500 italic">
                    Tidak ada catatan instruksi khusus dari pelanggan untuk pesanan ini.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer: Workflow Actions */}
        <div className="px-6 py-4 bg-zinc-950/90 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-medium">Status Produksi Sekarang:</span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              {order.orderStatus}
            </span>
          </div>

          {onUpdateStatus && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-zinc-400">Update Tahap:</span>
              {[
                { key: 'IN_PRODUCTION', label: 'Masuk Kiln / Cetak' },
                { key: 'QUALITY_CHECK', label: 'Lulus QC' },
                { key: 'SHIPPED', label: 'Kirim Ekspedisi' },
              ].map((st) => (
                <button
                  key={st.key}
                  disabled={updatingStatus || order.orderStatus === st.key}
                  onClick={() => onUpdateStatus(order.id, st.key)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    order.orderStatus === st.key
                      ? 'bg-amber-400 text-zinc-950 font-bold'
                      : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
