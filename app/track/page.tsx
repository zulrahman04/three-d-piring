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
    <div className="min-h-screen bg-slate-50 text-zinc-900">
      {/* Header */}
      <header className="w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Studio 3D</span>
          </Link>

          <div className="flex items-center gap-2">
            <PackageSearch className="w-4 h-4 text-indigo-600" />
            <span className="font-extrabold text-sm tracking-tight text-zinc-900">
              CERAMIX 3D • Lacak Pesanan
            </span>
          </div>

          <Link
            href="/landing"
            className="text-xs font-semibold text-indigo-600 hover:underline hidden sm:inline"
          >
            Tentang Studio
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        {/* Search Hero Card */}
        <section className="bg-white rounded-3xl border border-zinc-200/80 shadow-xl p-6 sm:p-8 text-center space-y-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto border border-indigo-100">
            <PackageSearch className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900">
              Lacak Status Produksi & Pengiriman
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 max-w-lg mx-auto">
              Masukkan Nomor Pesanan Anda (contoh: <span className="font-mono font-semibold text-zinc-700">CRX-...</span>) untuk memantau proses cetak kiln, nomor resi, atau mengunggah bukti pembayaran.
            </p>
          </div>

          <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value)}
                placeholder="Masukkan ID Pesanan (CRX-...)"
                required
                className="w-full pl-10 pr-4 py-2.5 text-sm font-mono rounded-xl border border-zinc-300 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md shadow-indigo-500/20 disabled:opacity-50 cursor-pointer flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Lacak</span>}
            </button>
          </form>

          {error && (
            <div className="max-w-md mx-auto p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </section>

        {/* Order Result Section */}
        {order && (
          <div className="space-y-6">
            {/* Status Stepper Card */}
            <section className="bg-white rounded-3xl border border-zinc-200/80 shadow-lg p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                    Nomor Pesanan
                  </p>
                  <h2 className="text-xl font-black font-mono text-indigo-600">
                    {order.orderNumber}
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Pemesan: <strong className="text-zinc-800">{order.customerName}</strong> • {order.city}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      order.paymentStatus === 'PAID'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    Pembayaran: {order.paymentStatus === 'PAID' ? 'Lunas' : 'Belum Dibayar'}
                  </span>
                  {order.trackingNumber && (
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                      Resi: {order.trackingNumber}
                    </span>
                  )}
                </div>
              </div>

              {/* Cancelled Banner or 6-Stage Progress */}
              {order.orderStatus === 'CANCELLED' ? (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold text-center">
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
                        className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all ${
                          current
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm ring-2 ring-indigo-500/20'
                            : done
                            ? 'border-emerald-200 bg-emerald-50/60 text-emerald-700'
                            : 'border-zinc-200 bg-zinc-50/50 text-zinc-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-[11px] font-bold leading-tight">{stage.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Payment Proof Upload + Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Items & Totals (7 cols) */}
              <section className="md:col-span-7 bg-white rounded-3xl border border-zinc-200/80 shadow-lg p-6 space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-600" />
                  Rincian Piring Kustom ({order.items.length} Varian)
                </h3>

                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center gap-3.5"
                    >
                      <div className="w-16 h-16 rounded-xl bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center">
                        {item.snapshotRenderUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.snapshotRenderUrl}
                            alt={item.plateSizeName}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-full border-2 border-white/30"
                            style={{ backgroundColor: item.plateColorHex }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-900">
                          {item.plateSizeName} ({item.diameterCm} cm) × {item.quantity} pcs
                        </p>
                        <p className="text-[11px] text-zinc-500 capitalize">
                          {item.plateColorName} • {item.plateFinish}
                          {item.designName ? ` • ${item.designName}` : ''}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-indigo-600">
                          Rp {item.subtotalPrice.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-zinc-200 space-y-1.5 text-xs">
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Diskon Grosir:</span>
                      <span>-Rp {order.discountAmount.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-zinc-900">
                    <span>Total Tagihan ({order.paymentMethod}):</span>
                    <span className="text-indigo-600">
                      Rp {order.grandTotal.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </section>

              {/* Upload Payment Proof (5 cols) */}
              <section className="md:col-span-5 bg-white rounded-3xl border border-zinc-200/80 shadow-lg p-6 space-y-4">
                <h3 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-indigo-600" />
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
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={order.paymentProofUrl}
                        alt="Bukti Pembayaran"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {uploadSuccess && (
                      <p className="text-xs font-semibold text-emerald-600">
                        ✓ Bukti transfer berhasil diunggah dan diteruskan ke Admin!
                      </p>
                    )}
                    {order.paymentStatus !== 'PAID' && (
                      <button
                        type="button"
                        disabled={uploadingProof}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-2.5 px-4 rounded-xl border border-zinc-300 hover:bg-zinc-50 text-xs font-bold text-zinc-700 cursor-pointer"
                      >
                        {uploadingProof ? 'Mengunggah...' : 'Ganti Bukti Pembayaran'}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Sudah melakukan pembayaran via <strong className="uppercase">{order.paymentMethod}</strong>? Unggah tangkapan layar/foto struk agar tim kami segera memproses pesanan ke tahap desain & kiln.
                    </p>
                    <button
                      type="button"
                      disabled={uploadingProof}
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
            <section className="bg-white rounded-3xl border border-zinc-200/80 shadow-lg p-6 space-y-4">
              <h3 className="text-sm font-bold text-zinc-900">Riwayat Log Produksi</h3>
              <div className="space-y-3">
                {order.logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-zinc-50 border border-zinc-200/60"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold text-zinc-900">{log.title}</p>
                        <span className="text-[10px] font-mono text-zinc-400">
                          {new Date(log.createdAt).toLocaleString('id-ID')}
                        </span>
                      </div>
                      {log.description && (
                        <p className="text-xs text-zinc-600 mt-0.5">{log.description}</p>
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
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-zinc-500 text-sm">
          Memuat pelacakan pesanan...
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
