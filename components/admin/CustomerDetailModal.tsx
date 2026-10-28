'use client';

import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Truck,
  Calendar,
  CreditCard,
  MessageCircle,
  Eye,
  PackageCheck,
  Printer,
} from 'lucide-react';
import PlatePreview from './PlatePreview';
import { printSpkJobSheet } from '@/lib/spkPrint';

interface OrderItem {
  id: string;
  plateSizeName: string;
  diameterCm: string;
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
  customization?: any;
}

export interface CustomerDetailOrder {
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
  items: OrderItem[];
}

interface CustomerDetailModalProps {
  order: CustomerDetailOrder | null;
  onClose: () => void;
  onOpenDesignReview?: (order: CustomerDetailOrder) => void;
}

export default function CustomerDetailModal({
  order,
  onClose,
  onOpenDesignReview,
}: CustomerDetailModalProps) {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [printingSpk, setPrintingSpk] = useState(false);

  if (!order) return null;

  const handlePrintSpk = async () => {
    try {
      setPrintingSpk(true);
      const firstItem = order.items?.[0];
      const cust = firstItem?.customization;
      const meta = cust?.metadata || {};
      const geo = meta.geometrySnapshot || cust?.plateSize;
      const diameterNum = Number(firstItem?.diameterCm) || Number(geo?.diameterCm) || 27;
      const wellRatioNum = Number(geo?.wellRatio) || 0.64;

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

        plateSizeName: firstItem?.plateSizeName || 'Dinner Plate',
        diameterCm: diameterNum,
        plateColorName: firstItem?.plateColorName || 'Porcelain White',
        plateColorHex: firstItem?.plateColorHex || '#FAF7F2',
        plateFinish: firstItem?.plateFinish || 'glossy',
        rimTrimName: firstItem?.rimTrimName || 'none',
        rimTrimCustomHex: firstItem?.rimTrimCustomHex,
        printCoverage: firstItem?.printCoverage || 'center',
        quantity: firstItem?.quantity || 1,

        wellDiameterCm: (diameterNum * wellRatioNum).toFixed(1),
        wellDiameterMm: (diameterNum * wellRatioNum * 10).toFixed(0),
        rimWidthCm: (((diameterNum - diameterNum * wellRatioNum) / 2)).toFixed(1),
        rimWidthMm: (((diameterNum - diameterNum * wellRatioNum) / 2) * 10).toFixed(0),
        wellDepthMm: ((Number(geo?.wellDepth) || 0.11) * 200).toFixed(0),
        rimHeightMm: ((Number(geo?.rimHeight) || 0.09) * 200).toFixed(0),
        rimAngleDeg: Number(geo?.rimAngleDeg) || 18,
        thicknessMm: ((Number(geo?.thickness) || 0.038) * 100).toFixed(1),
        footRingDiameterCm: (diameterNum * (Number(geo?.footRingRadiusRatio) || 0.54)).toFixed(1),

        artworkUrl: firstItem?.designImageUrl || cust?.designImageUrl || null,
        artworkName: cust?.designName || 'Artwork Kustom',
        scaleVal: cust?.designScale ? Number(cust.designScale) : 1,
        rotationVal: cust?.designRotation ? Number(cust.designRotation) : 0,
        offsetXVal: cust?.designOffsetX ? Number(cust.designOffsetX) : 0,
        offsetYVal: cust?.designOffsetY ? Number(cust.designOffsetY) : 0,
        opacityVal: cust?.designOpacity ? Number(cust.designOpacity) : 1,
        rimPatternVal: meta.rimPattern,
        customRimUrl: meta.customRimPatternUrl,
        customRimName: meta.customRimPatternName,
        customRimRepeat: meta.customRimPatternRepeat,
        snapshotUrl: (() => {
          const raw = firstItem?.snapshotRenderUrl || cust?.previewSnapshotUrl;
          if (!raw || raw.includes('placeholder') || raw.startsWith('data:image/svg+xml')) return null;
          return raw;
        })(),
      });
    } catch (err) {
      console.error('Failed to print SPK', err);
    } finally {
      setPrintingSpk(false);
    }
  };

  // Format WhatsApp number (e.g. 081234 -> 6281234)
  const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
  const waNumber = cleanPhone.startsWith('0') ? `62${cleanPhone.slice(1)}` : cleanPhone;
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
    `Halo kak ${order.customerName}, kami dari tim Ceramix 3D Studio terkait pesanan piring keramik kustom Anda (#${order.orderNumber})...`
  )}`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => {
      setCopiedType(null);
    }, 2000);
  };

  const fullShippingText = `PENERIMA: ${order.customerName}
NO. TELP/WA: ${order.customerPhone}
ALAMAT: ${order.shippingAddress}
KOTA/WILAYAH: ${order.city}
KODE POS: ${order.postalCode}
CATATAN PENGIRIMAN: ${order.specialNotes || '-'}
NO. ORDER: #${order.orderNumber}`;

  const formatRupiah = (val: string | number) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-700/80 rounded-3xl shadow-2xl my-auto text-zinc-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-950/85 border-b border-zinc-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-bold text-white text-base sm:text-lg">Detail Pelanggan & Pengiriman</h3>
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-zinc-800 text-amber-400 border border-zinc-700 font-semibold">
                  {order.orderNumber}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                <span>
                  Dipesan pada{' '}
                  {new Date(order.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={printingSpk}
              onClick={handlePrintSpk}
              className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700 hover:border-amber-400 disabled:opacity-50 shadow-xs"
              title="Cetak SPK Produksi (Format A4)"
            >
              {printingSpk ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                  <span className="hidden sm:inline">Mempersiapkan...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Cetak SPK</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Contact Card */}
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4.5 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  Kontak Pelanggan
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                  Verified Buyer
                </span>
              </div>

              <div>
                <div className="text-lg font-bold text-white tracking-tight">{order.customerName}</div>
              </div>

              {/* WhatsApp / Phone Row */}
              <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="font-mono font-medium">{order.customerPhone}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500 text-emerald-300 hover:text-zinc-950 text-[11px] font-semibold transition-all border border-emerald-500/30"
                    title="Buka Chat WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(order.customerPhone, 'phone')}
                    className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Salin No Telp"
                  >
                    {copiedType === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Email Row */}
              <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
                <div className="flex items-center gap-2 text-xs text-zinc-300 truncate max-w-[200px]">
                  <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{order.customerEmail}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`mailto:${order.customerEmail}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium transition-colors"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Email</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopy(order.customerEmail, 'email')}
                    className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Salin Email"
                  >
                    {copiedType === 'email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Shipping Summary Card */}
            <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4.5 space-y-3.5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-wider uppercase text-zinc-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    Alamat Pengiriman
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(fullShippingText, 'full_address')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/15 hover:bg-amber-400 text-amber-300 hover:text-zinc-950 text-[11px] font-semibold transition-all border border-amber-400/30 cursor-pointer"
                  >
                    {copiedType === 'full_address' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Salin Format Resi</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-2.5 space-y-1.5">
                  <p className="text-sm font-medium text-white leading-relaxed">
                    {order.shippingAddress || <span className="text-zinc-500 italic">Alamat belum diisi lengkap</span>}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-zinc-300">
                    <span className="px-2 py-0.5 rounded-md bg-zinc-800 font-semibold text-zinc-200">
                      {order.city}
                    </span>
                    <span className="text-zinc-500">•</span>
                    <span className="text-zinc-400 font-mono">Kode Pos: {order.postalCode}</span>
                  </div>
                </div>
              </div>

              {/* Tracking Number / Ekspedisi */}
              <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-zinc-400" />
                  No. Resi Pengiriman:
                </span>
                <span className="font-mono font-semibold text-zinc-200">
                  {order.trackingNumber || <span className="text-zinc-500 font-normal italic">Belum dibuat</span>}
                </span>
              </div>
            </div>
          </div>

          {/* Special Notes / Instruksi Khusus Pesanan */}
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 mb-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Catatan Khusus Pelanggan (Special Delivery / Production Notes)</span>
            </div>
            {order.specialNotes ? (
              <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/30 text-amber-200 text-xs leading-relaxed whitespace-pre-wrap font-medium">
                &ldquo;{order.specialNotes}&rdquo;
              </div>
            ) : (
              <div className="text-xs text-zinc-500 italic">
                Tidak ada catatan khusus yang ditulis oleh pelanggan untuk pesanan ini.
              </div>
            )}
          </div>

          {/* Items & Financial Overview */}
          <div className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-4.5 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-amber-400" />
                Item Piring Keramik yang Dipesan ({order.items.length} Model)
              </span>
              <div className="text-xs text-zinc-400">
                Total:{' '}
                <span className="font-bold text-white text-sm">
                  {formatRupiah(order.grandTotal)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {order.items.map((item, idx) => {
                const meta = item.customization?.metadata || {};
                return (
                  <div
                    key={item.id || idx}
                    className="p-3 rounded-xl bg-zinc-900 border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <PlatePreview
                        size="sm"
                        plateColorHex={item.plateColorHex}
                        plateFinish={item.plateFinish}
                        rimTrimName={item.rimTrimName}
                        rimTrimCustomHex={item.rimTrimCustomHex}
                        rimPattern={meta.rimPattern || (item.rimTrimName === 'custom' ? 'custom' : 'none')}
                        customRimPatternUrl={meta.customRimPatternUrl}
                        customRimPatternRepeat={meta.customRimPatternRepeat}
                        customRimPatternMode={meta.customRimPatternMode}
                        printCoverage={item.printCoverage}
                        designImageUrl={item.designImageUrl || item.customization?.designImageUrl}
                        snapshotRenderUrl={item.snapshotRenderUrl || item.customization?.previewSnapshotUrl}
                        designScale={item.customization?.designScale ? Number(item.customization.designScale) : 1}
                        designRotation={item.customization?.designRotation ? Number(item.customization.designRotation) : 0}
                        designOffsetX={item.customization?.designOffsetX ? Number(item.customization.designOffsetX) : 0}
                        designOffsetY={item.customization?.designOffsetY ? Number(item.customization.designOffsetY) : 0}
                        designOpacity={item.customization?.designOpacity ? Number(item.customization.designOpacity) : 1}
                        diameterCm={item.diameterCm}
                      />
                      <div>
                        <div className="font-bold text-white text-sm">
                          {item.plateSizeName} ({item.diameterCm} cm)
                        </div>
                        <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-2 mt-0.5">
                          <span>Warna: {item.plateColorName}</span>
                          <span>•</span>
                          <span className="capitalize">Finishing: {item.plateFinish}</span>
                          {item.rimTrimName && item.rimTrimName !== 'none' && (
                            <>
                              <span>•</span>
                              <span className="text-amber-400">Trim: {item.rimTrimName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-zinc-800 sm:pl-4">
                      <div className="text-xs text-zinc-400">
                        {item.quantity} pcs × {formatRupiah(item.unitTotalPrice)}
                      </div>
                      <div className="font-bold text-amber-400 text-sm mt-0.5">
                        {formatRupiah(item.subtotalPrice)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment & Status Summary */}
            <div className="pt-3 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                <span>Metode Pembayaran:</span>
                <span className="font-semibold text-zinc-200 uppercase font-mono">{order.paymentMethod}</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-[11px] font-medium text-zinc-300">
                  {order.paymentStatus}
                </span>
              </div>
              <div>
                Status Pesanan:{' '}
                <span className="font-semibold text-white uppercase font-mono">
                  {order.orderStatus.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-6 py-4 bg-zinc-950/85 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopy(fullShippingText, 'full_address_bottom')}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              {copiedType === 'full_address_bottom' ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-zinc-400" />
              )}
              <span>Salin Label Alamat Lengkap</span>
            </button>

            <button
              type="button"
              disabled={printingSpk}
              onClick={handlePrintSpk}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-zinc-700 hover:border-amber-400 disabled:opacity-50"
              title="Cetak SPK Produksi Format A4"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Cetak SPK</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {onOpenDesignReview && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenDesignReview(order);
                }}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/10"
              >
                <Eye className="w-4 h-4" />
                <span>Buka Review Desain & Geo 3D</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
