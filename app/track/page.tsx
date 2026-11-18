'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  PackageSearch,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Flame,
  ShieldCheck,
  Truck,
  Sparkles,
  Upload,
  Loader2,
  Search,
  Receipt,
  AlertCircle,
} from 'lucide-react';
import { compressUploadedImage } from '@/lib/imageCompress';

interface TrackedOrder {
  orderNumber: string;
  customerName: string;
  city: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentProofUrl: string | null;
  trackingNumber: string | null;
  totalBasePrice: number;
  totalPrintFee: number;
  totalRimTrimFee: number;
  discountAmount: number;
  grandTotal: number;
  createdAt: string;
  items: Array<{
    id: string;
    plateSizeName: string;
    diameterCm: number;
    plateColorName: string;
    plateColorHex: string;
    plateFinish: string;
    rimTrimName: string;
    snapshotRenderUrl: string;
    quantity: number;
    subtotalPrice: number;
    designName: string | null;
  }>;
  logs: Array<{
    id: string;
    stage: string;
    title: string;
    description: string | null;
    createdAt: string;
  }>;
}

const STAGES = [
  { key: 'PENDING_PAYMENT', label: 'Menunggu Bayar', icon: Clock },
  { key: 'DESIGN_REVIEW', label: 'Review Desain', icon: Sparkles },
  { key: 'IN_PRODUCTION', label: 'Proses Kiln', icon: Flame },
  { key: 'QUALITY_CHECK', label: 'Quality Check', icon: ShieldCheck },
  { key: 'SHIPPED', label: 'Dikirim', icon: Truck },
  { key: 'DELIVERED', label: 'Selesai', icon: CheckCircle2 },
];

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrder = searchParams.get('order') || '';

  const [orderInput, setOrderInput] = useState(initialOrder);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchOrder = async (orderNum: string) => {
    const clean = orderNum.trim();
    if (!clean) return;
    setLoading(true);
    setError(null);
    setUploadSuccess(false);
    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(clean)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setOrder(null);
        setError(data.error || 'Pesanan tidak ditemukan');
      } else {
        setOrder(data.order);
      }
    } catch {
      setError('Gagal menghubungi server. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialOrder) {
      fetchOrder(initialOrder);
    }
  }, [initialOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderInput);
  };

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !order) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon unggah file gambar (PNG, JPG, atau WEBP).');
      return;
    }

    setUploadingProof(true);
    setUploadSuccess(false);
    try {
      const compressed = await compressUploadedImage(file, 1280, 0.85);
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
          paymentProofUrl: compressed,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setOrder((prev) =>
          prev
            ? {
                ...prev,
                paymentProofUrl: data.paymentProofUrl,
                logs: data.logs || prev.logs,
              }
            : null
        );
        setUploadSuccess(true);
      } else {
        alert(data.error || 'Gagal mengunggah bukti pembayaran');
      }
    } catch {
      alert('Terjadi kesalahan saat mengunggah bukti pembayaran.');
    } finally {
      setUploadingProof(false);
      e.target.value = '';
    }
  };

  const activeStageIndex = order
    ? Math.max(
        0,
        STAGES.findIndex((s) => s.key === order.orderStatus)
      )
    : 0;

  return (
    <div className="min-h-screen bg-[#F4F3F0] text-[#1C1917]">
      {/* Header */}
      <header className="w-full border-b border-stone-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-medium text-stone-600 hover:text-[#1C1917] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Studio 3D</span>
          </Link>

          <div className="flex items-center gap-2">
            <PackageSearch className="w-4 h-4 text-stone-700" />
            <span className="font-[family-name:var(--font-display)] font-semibold text-sm tracking-[0.06em] text-[#1C1917]">
              CERAMIX 3D • LACAK PESANAN
            </span>
          </div>

          <Link
            href="/landing"
            className="text-xs font-medium text-stone-600 hover:text-[#1C1917] hover:underline hidden sm:inline transition-colors"
          >
            Tentang Studio
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Search Hero Card */}
        <section className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 sm:p-8 text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-[#F4F3F0] text-[#1C1917] flex items-center justify-center mx-auto border border-stone-200/80">
            <PackageSearch className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-semibold tracking-wide text-[#1C1917]">
              Lacak Status Produksi &amp; Pengiriman
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-2 max-w-lg mx-auto leading-relaxed">
              Masukkan Nomor Pesanan Anda (contoh: <span className="font-mono font-semibold text-[#1C1917]">CRX-...</span>) untuk memantau proses cetak kiln, nomor resi, atau mengunggah bukti pembayaran.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value)}
                placeholder="Masukkan ID Pesanan (CRX-...)"
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm font-mono rounded-xl border border-stone-200/90 bg-[#FBFBFA] focus:bg-white focus:border-stone-500 focus:ring-1 focus:ring-stone-400/40 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-white font-medium text-sm shadow-xs disabled:opacity-50 cursor-pointer flex items-center gap-2 transition-all duration-200"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Lacak</span>}
            </button>
          </form>

          {error && (
            <div className="max-w-md mx-auto p-3 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* Order Result Section */}
        {order && (
          <div className="space-y-6">
            {/* Status Stepper Card */}
            <section className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-200/70">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-400">
                    Nomor Pesanan
                  </p>
                  <h2 className="text-xl font-semibold font-mono text-[#1C1917] mt-0.5">
                    {order.orderNumber}
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Pemesan: <strong className="text-[#1C1917]">{order.customerName}</strong> • {order.city}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      order.paymentStatus === 'PAID'
                        ? 'bg-[#F4F3F0] text-[#4A5D4E] border-stone-200/90'
                        : 'bg-[#FBFBFA] text-stone-700 border-stone-200/90'
                    }`}
                  >
                    Pembayaran: {order.paymentStatus === 'PAID' ? 'Lunas' : 'Belum Dibayar'}
                  </span>
                  {order.trackingNumber && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-[#F4F3F0] text-[#1C1917] border border-stone-200/80">
                      Resi: {order.trackingNumber}
                    </span>
                  )}
                </div>
              </div>

              {/* Cancelled Banner or 6-Stage Progress */}
              {order.orderStatus === 'CANCELLED' ? (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-700 text-sm font-medium text-center">
                  Pesanan ini telah dibatalkan.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  {STAGES.map((stage, idx) => {
                    const Icon = stage.icon;
                    const done = idx <= activeStageIndex;
                    const current = idx === activeStageIndex;
                    return (
                      <div
                        key={stage.key}
                        className={`p-3 rounded-xl border text-center flex flex-col items-center gap-1.5 transition-all duration-200 ${
                          current
                            ? 'border-[#1C1917] bg-[#1C1917] text-white shadow-xs'
                            : done
                            ? 'border-stone-300/80 bg-[#F4F3F0] text-[#1C1917]'
                            : 'border-stone-200/70 bg-[#FBFBFA] text-stone-400'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px] font-medium leading-tight">{stage.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Payment Proof Upload + Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Items & Totals (7 cols) */}
              <section className="md:col-span-7 bg-white rounded-2xl border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-500 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-stone-600" />
                  Rincian Piring Kustom ({order.items.length} Varian)
                </h3>

                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-[#FBFBFA] border border-stone-200/80 flex items-center gap-3.5"
                    >
                      <div className="w-16 h-16 rounded-xl bg-[#F4F3F0] border border-stone-200/70 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.snapshotRenderUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.snapshotRenderUrl}
                            alt={item.plateSizeName}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full border border-stone-300"
                            style={{ backgroundColor: item.plateColorHex }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-[#1C1917]">
                          {item.plateSizeName} ({item.diameterCm} cm) × {item.quantity} pcs
                        </p>
                        <p className="text-[11px] text-stone-500 capitalize">
                          {item.plateColorName} • {item.plateFinish}
                          {item.designName ? ` • ${item.designName}` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-[#1C1917]">
                          Rp {item.subtotalPrice.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-stone-200/80 space-y-1.5 text-xs">
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-[#4A5D4E] font-medium">
                      <span>Diskon Grosir:</span>
                      <span>-Rp {order.discountAmount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-semibold text-[#1C1917]">
                    <span>Total Tagihan ({order.paymentMethod}):</span>
                    <span>
                      Rp {order.grandTotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </section>

              {/* Upload Payment Proof (5 cols) */}
              <section className="md:col-span-5 bg-white rounded-2xl border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-4">
                <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-500 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-stone-600" />
                  Bukti Pembayaran
                </h3>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleUploadProof}
                  className="hidden"
                />

                {order.paymentProofUrl ? (
                  <div className="space-y-3">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden border border-stone-200/80 bg-[#FBFBFA]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={order.paymentProofUrl}
                        alt="Bukti Pembayaran"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {uploadSuccess && (
                      <p className="text-xs font-medium text-[#4A5D4E]">
                        ✓ Bukti transfer berhasil diunggah dan diteruskan ke Admin!
                      </p>
                    )}
                    {order.paymentStatus !== 'PAID' && (
                      <button
                        type="button"
                        disabled={uploadingProof}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 px-4 rounded-xl border border-stone-200/90 hover:bg-[#F4F3F0] text-xs font-medium text-[#1C1917] transition-colors cursor-pointer"
                      >
                        {uploadingProof ? 'Mengunggah...' : 'Ganti Bukti Pembayaran'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Sudah melakukan pembayaran via <strong className="uppercase text-[#1C1917]">{order.paymentMethod}</strong>? Unggah tangkapan layar/foto struk agar tim kami segera memproses pesanan ke tahap desain &amp; kiln.
                    </p>
                    <button
                      type="button"
                      disabled={uploadingProof}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-white font-medium text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all duration-200"
                    >
                      {uploadingProof ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Mengunggah...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Unggah Bukti Transfer</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </section>
            </div>

            {/* Production History Logs */}
            <section className="bg-white rounded-2xl border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-500">Riwayat Log Produksi</h3>
              <div className="space-y-3">
                {order.logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#FBFBFA] border border-stone-200/70"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#57534E] mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-[#1C1917]">{log.title}</p>
                        <span className="text-[10px] font-mono text-stone-400">
                          {new Date(log.createdAt).toLocaleString('id-ID')}
                        </span>
                      </div>
                      {log.description && (
                        <p className="text-xs text-stone-600 mt-0.5">{log.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#F4F3F0] text-stone-500 text-sm">
          Memuat pelacakan pesanan...
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
