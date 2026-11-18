'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  X,
  Plus,
  Minus,
  CheckCircle2,
  Send,
  Loader2,
  Copy,
  ExternalLink,
  ShoppingBag,
  CreditCard,
  MapPin,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Trash2,
  Tag,
  PackageSearch,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePlateStore } from '@/store/usePlateStore';
import { CustomerOrderData } from '@/types/plate';
import { RIM_PATTERNS } from '@/constants/presets';
import { calculatePlatePricing, getWholesaleDiscountPercent } from '@/lib/pricing';

const STORE_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_STORE_WHATSAPP || '6281100001111';

export default function OrderModal() {
  const {
    isOrderModalOpen,
    setOrderModalOpen,
    capturedSnapshot,
    orderQuantity,
    setOrderQuantity,
    calculateTotalPrice,
    selectedSize,
    plateColor,
    plateFinish,
    rimTrim,
    rimTrimCustomColor,
    rimPattern,
    customRimPatternUrl,
    customRimPatternName,
    customRimPatternRepeat,
    customRimPatternMode,
    logoPlacement,
    printCoverage,
    designUrl,
    designName,
    designScale,
    designRotation,
    designOffsetX,
    designOffsetY,
    designOpacity,
    cart,
    updateCartItemQuantity,
    removeCartItem,
    clearCart,
  } = usePlateStore();

  const [formData, setFormData] = useState<CustomerOrderData>({
    fullName: '',
    email: '',
    phone: '',
    shippingAddress: '',
    city: '',
    postalCode: '',
    specialNotes: '',
    paymentMethod: 'qris',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [confirmedSummary, setConfirmedSummary] = useState<{ total: number; quantity: number } | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  if (!isOrderModalOpen) return null;

  const isCartCheckout = cart.length > 0;
  const singlePricing = calculateTotalPrice();

  // Compute cart totals if checking out multi-item cart
  const cartBreakdown = isCartCheckout
    ? (() => {
        let totalQty = 0;
        let subtotalBeforeDiscount = 0;
        const itemPricings = cart.map((item) => {
          const p = calculatePlatePricing({
            unitBasePrice: item.selectedSize.basePrice,
            hasDesign: Boolean(item.designUrl),
            rimTrim: item.rimTrim,
            rimPattern: item.rimPattern,
            quantity: item.quantity,
          });
          totalQty += item.quantity;
          subtotalBeforeDiscount += p.unitTotal * item.quantity;
          return { item, p };
        });
        const discountPercent = getWholesaleDiscountPercent(totalQty);
        const discountAmount = Math.round((subtotalBeforeDiscount * discountPercent) / 100);
        const grandTotal = Math.max(0, subtotalBeforeDiscount - discountAmount);
        return { itemPricings, totalQty, subtotalBeforeDiscount, discountPercent, discountAmount, grandTotal };
      })()
    : null;

  const activeGrandTotal = cartBreakdown ? cartBreakdown.grandTotal : singlePricing.grandTotal;
  const activeTotalQty = cartBreakdown ? cartBreakdown.totalQty : singlePricing.quantity;
  const activeDiscountPercent = cartBreakdown ? cartBreakdown.discountPercent : singlePricing.discountPercent;
  const activeDiscountAmount = cartBreakdown ? cartBreakdown.discountAmount : singlePricing.discountAmount;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const fullAddress = `${formData.shippingAddress}, ${formData.city} ${formData.postalCode}`.trim();

    const buildCustomizationPayload = (src: {
      selectedSize: typeof selectedSize;
      plateColor: string;
      plateFinish: string;
      rimTrim: string;
      rimTrimCustomColor: string;
      rimPattern: string;
      customRimPatternUrl: string | null;
      customRimPatternName: string | null;
      customRimPatternRepeat: number;
      customRimPatternMode: 'repeat' | 'full';
      printCoverage: string;
      logoPlacement: string;
      designUrl: string | null;
      designName: string | null;
      designScale: number;
      designRotation: number;
      designOffsetX: number;
      designOffsetY: number;
      designOpacity: number;
      snapshotUrl: string | null;
    }) => ({
      plateSize: src.selectedSize.id,
      plateSizeName: src.selectedSize.name,
      diameterCm: src.selectedSize.diameterCm,
      outerRadius: src.selectedSize.outerRadius,
      wellRatio: src.selectedSize.wellRatio,
      wellDepth: src.selectedSize.wellDepth,
      rimHeight: src.selectedSize.rimHeight,
      rimAngleDeg: src.selectedSize.rimAngleDeg,
      thickness: src.selectedSize.thickness,
      footRingRadiusRatio: src.selectedSize.footRingRadiusRatio,
      plateColor: src.plateColor,
      finish: src.plateFinish,
      rimTrim: src.rimTrim,
      rimTrimCustomColor: src.rimTrimCustomColor,
      rimPattern: src.rimPattern,
      customRimPatternUrl: src.customRimPatternUrl || null,
      customRimPatternName: src.customRimPatternName || null,
      customRimPatternRepeat: src.customRimPatternRepeat,
      customRimPatternMode: src.customRimPatternMode,
      printCoverage: src.printCoverage,
      logoPlacement: src.logoPlacement,
      designImageUrl: src.designUrl || null,
      designName: src.designName || 'Custom Artwork',
      designScale: src.designScale,
      designRotation: src.designRotation,
      designOffsetX: src.designOffsetX,
      designOffsetY: src.designOffsetY,
      designOpacity: src.designOpacity,
      snapshotUrl: src.snapshotUrl || null,
    });

    const payload = isCartCheckout
      ? {
          customer: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: fullAddress,
            city: formData.city,
            postalCode: formData.postalCode,
            notes: formData.specialNotes,
          },
          items: cart.map((item) => ({
            quantity: item.quantity,
            customization: buildCustomizationPayload(item),
          })),
          paymentMethod: formData.paymentMethod,
        }
      : {
          customer: {
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: fullAddress,
            city: formData.city,
            postalCode: formData.postalCode,
            notes: formData.specialNotes,
          },
          customization: buildCustomizationPayload({
            selectedSize,
            plateColor,
            plateFinish,
            rimTrim,
            rimTrimCustomColor,
            rimPattern,
            customRimPatternUrl,
            customRimPatternName,
            customRimPatternRepeat,
            customRimPatternMode,
            printCoverage,
            logoPlacement,
            designUrl,
            designName,
            designScale,
            designRotation,
            designOffsetX,
            designOffsetY,
            designOpacity,
            snapshotUrl: capturedSnapshot,
          }),
          pricing: {
            unitBasePrice: singlePricing.unitBasePrice,
            printFee: singlePricing.printFee,
            rimTrimFee: singlePricing.rimTrimFee,
            rimPatternFee: singlePricing.rimPatternFee,
            unitTotal: singlePricing.unitTotal,
            quantity: singlePricing.quantity,
            discountAmount: singlePricing.discountAmount,
            grandTotal: singlePricing.grandTotal,
          },
          paymentMethod: formData.paymentMethod,
        };

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setIsSubmitting(false);
        setOrderId(result.orderId);
        setConfirmedSummary({
          total: Number(result.totalPrice ?? activeGrandTotal),
          quantity: activeTotalQty,
        });
        if (isCartCheckout) {
          clearCart();
        }
        setOrderCompleted(true);

        // Trigger celebratory confetti effect
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#1C1917', '#78716C', '#D4AF37', '#7D9678'],
          });
        } catch {
          // safe fallback
        }
      } else {
        alert(`Gagal membuat pesanan: ${result.error || 'Terjadi kesalahan sistem'}`);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      console.error('Failed to submit order:', err);
      alert(`Terjadi kesalahan jaringan: ${err.message || 'Gagal menghubungi server'}`);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setOrderModalOpen(false);
    // Reset state after modal closes
    setTimeout(() => {
      setOrderCompleted(false);
      setOrderId('');
    }, 300);
  };

  const handleCopyOrderId = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-stone-950/35 backdrop-blur-sm transition-all">
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl shadow-[0_20px_50px_rgb(0,0,0,0.08)] border border-stone-200/80 overflow-hidden my-auto text-[#1C1917]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200/80 bg-[#FBFBFA]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F4F3F0] border border-stone-200/80 text-[#1C1917] flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-semibold text-[#1C1917] tracking-wide">
                {orderCompleted ? 'Pesanan Berhasil Diterima!' : 'Ringkasan & Konfirmasi Pesanan'}
              </h2>
              <p className="text-xs text-stone-500">
                {orderCompleted
                  ? 'Nomor referensi pesanan telah dibuat'
                  : 'Pastikan detail piring custom dan alamat pengiriman Anda sesuai'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-modal"
            onClick={handleClose}
            className="p-2 text-stone-400 hover:text-[#1C1917] rounded-full hover:bg-stone-100 transition-colors duration-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {orderCompleted ? (
          /* Order Confirmation View */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#F4F3F0] border border-stone-200/80 text-[#4A5D4E] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="max-w-md mx-auto">
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#1C1917] tracking-wide">
                Terima Kasih, {formData.fullName || 'Pelanggan'}!
              </h3>
              <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                Pesanan piring kustom Anda sedang diproses oleh tim studio keramik kami.
                Konfirmasi dan instruksi pembayaran telah dikirim ke{' '}
                <strong className="text-[#1C1917]">{formData.email || 'email Anda'}</strong>.
              </p>
            </div>

            {/* Order Details Badge Card */}
            <div className="max-w-md mx-auto p-4 rounded-xl bg-[#FBFBFA] border border-stone-200/80 text-left space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">ID Pesanan:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-semibold text-[#1C1917]">
                    {orderId}
                  </span>
                  <button
                    onClick={handleCopyOrderId}
                    className="p-1 hover:bg-stone-200/70 rounded transition-colors text-stone-500 cursor-pointer"
                    title="Salin ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {copiedId && <span className="text-[10px] text-[#4A5D4E] font-medium">Disalin!</span>}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-stone-200/70 pt-2">
                <span className="text-stone-500">Total Pembayaran:</span>
                <span className="font-semibold text-[#1C1917]">
                  Rp {(confirmedSummary?.total ?? activeGrandTotal).toLocaleString('id-ID')} ({confirmedSummary?.quantity ?? activeTotalQty} pcs)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-stone-200/70 pt-2">
                <span className="text-stone-500">Metode Bayar:</span>
                <span className="font-semibold uppercase text-[#1C1917]">
                  {formData.paymentMethod}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-lg mx-auto pt-2">
              <a
                href={`https://wa.me/${STORE_WHATSAPP_NUMBER}?text=${encodeURIComponent(
                  `Halo Admin Ceramix, saya ingin konfirmasi pesanan piring custom dengan ID: ${orderId} atas nama ${formData.fullName} (Total: Rp ${(confirmedSummary?.total ?? activeGrandTotal).toLocaleString('id-ID')})`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#4A5D4E] hover:bg-[#3B4C3F] text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200"
              >
                <ExternalLink className="w-4 h-4" />
                Konfirmasi WA
              </a>

              <Link
                href={`/track?order=${encodeURIComponent(orderId)}`}
                onClick={handleClose}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-white font-medium text-sm flex items-center justify-center gap-2 transition-all duration-200"
              >
                <PackageSearch className="w-4 h-4" />
                Lacak &amp; Upload Bukti
              </Link>

              <button
                onClick={handleClose}
                className="w-full sm:w-auto py-3 px-4 rounded-xl border border-stone-200/80 hover:bg-[#F4F3F0] text-stone-700 font-medium text-sm transition-colors duration-200 cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        ) : (
          /* Normal Order Form View (2-Column Grid) */
          <form onSubmit={handleSubmitOrder} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Cart List OR Single 3D Snapshot & Spec Summary (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                {isCartCheckout && cartBreakdown ? (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
                        Keranjang Pesanan ({cart.length} Varian)
                      </span>
                      <button
                        type="button"
                        onClick={clearCart}
                        className="text-[11px] font-medium text-stone-500 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        Kosongkan Keranjang
                      </button>
                    </div>

                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                      {cartBreakdown.itemPricings.map(({ item, p }) => (
                        <div
                          key={item.id}
                          className="p-2.5 rounded-xl bg-[#FBFBFA] border border-stone-200/80 flex items-center gap-3"
                        >
                          <div className="w-14 h-14 rounded-lg bg-[#F4F3F0] border border-stone-200/70 overflow-hidden shrink-0 flex items-center justify-center">
                            {item.snapshotUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.snapshotUrl}
                                alt={item.selectedSize.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <ShoppingBag className="w-5 h-5 text-stone-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-[#1C1917] truncate">
                              {item.selectedSize.name} ({item.selectedSize.diameterCm} cm)
                            </p>
                            <p className="text-[11px] text-stone-500 truncate capitalize">
                              {item.plateFinish} • {item.designName || 'Polos'}
                            </p>
                            <p className="text-[11px] font-semibold text-[#57534E] mt-0.5">
                              Rp {(p.unitTotal * item.quantity).toLocaleString('id-ID')}
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => removeCartItem(item.id)}
                              className="text-stone-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Hapus varian"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                                className="w-5 h-5 rounded bg-white border border-stone-200/90 flex items-center justify-center text-xs hover:bg-stone-100 cursor-pointer"
                              >
                                -
                              </button>
                              <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                                className="w-5 h-5 rounded bg-white border border-stone-200/90 flex items-center justify-center text-xs hover:bg-stone-100 cursor-pointer"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cart Wholesale Total Card */}
                    <div className="p-4 rounded-xl bg-[#F4F3F0] border border-stone-200/80 space-y-2 text-xs">
                      <div className="flex justify-between text-stone-600">
                        <span>Total Piring ({activeTotalQty} pcs):</span>
                        <span>Rp {cartBreakdown.subtotalBeforeDiscount.toLocaleString('id-ID')}</span>
                      </div>
                      {activeDiscountPercent > 0 ? (
                        <div className="flex justify-between text-[#4A5D4E] font-semibold">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3.5 h-3.5" />
                            Diskon Grosir ({activeDiscountPercent}%):
                          </span>
                          <span>-Rp {activeDiscountAmount.toLocaleString('id-ID')}</span>
                        </div>
                      ) : (
                        <p className="text-[11px] text-stone-500">
                          Pesan total ≥ 12 pcs untuk otomatis mendapat diskon grosir hingga 35%.
                        </p>
                      )}
                      <div className="flex justify-between items-baseline font-semibold text-sm text-[#1C1917] pt-2 border-t border-stone-200/80">
                        <span>Total Estimasi:</span>
                        <span className="text-base font-semibold text-[#1C1917]">
                          Rp {activeGrandTotal.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#F4F3F0] border border-stone-200/80 flex items-center justify-center group">
                      {capturedSnapshot ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={capturedSnapshot}
                          alt="Hasil Custom Piring 3D"
                          className="w-full h-full object-contain p-3"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <ShoppingBag className="w-10 h-10 text-stone-400 mx-auto mb-2 opacity-60" />
                          <p className="text-xs text-stone-500">Snapshot piring sedang diproses...</p>
                        </div>
                      )}
                      <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/85 backdrop-blur-md border border-stone-200/80 text-[#1C1917] text-[10px] font-semibold tracking-wider uppercase">
                        3D Render Snapshot
                      </div>
                    </div>

                    {/* Specs Pill List */}
                    <div className="p-3.5 rounded-xl bg-[#FBFBFA] border border-stone-200/80 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-stone-500">Tipe Piring:</span>
                        <span className="font-medium text-[#1C1917]">
                          {selectedSize.name} ({selectedSize.diameterCm} cm)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">Finishing Glasir:</span>
                        <span className="font-medium text-[#1C1917] capitalize">
                          {plateFinish}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-stone-500">Aksen Pinggiran:</span>
                        {rimTrim === 'custom' ? (
                          <span className="flex items-center gap-1.5 font-medium text-[#1C1917] text-xs">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-black/15"
                              style={{ backgroundColor: rimTrimCustomColor }}
                            />
                            Custom ({rimTrimCustomColor.toUpperCase()})
                          </span>
                        ) : (
                          <span className="font-medium text-[#1C1917] capitalize">
                            {rimTrim}
                          </span>
                        )}
                      </div>
                      {rimPattern && rimPattern !== 'none' && (
                        <div className="flex justify-between">
                          <span className="text-stone-500">Motif Lis Bibir:</span>
                          <span className="font-medium text-[#1C1917] truncate max-w-[150px]">
                            {rimPattern === 'custom'
                              ? customRimPatternName
                                ? `${customRimPatternName} (${customRimPatternMode === 'repeat' ? `${customRimPatternRepeat}x` : 'Cincin'})`
                                : 'Motif Kustom Pelanggan'
                              : RIM_PATTERNS.find((p) => p.id === rimPattern)?.name || rimPattern}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-stone-500">Motif Cetak:</span>
                        <span className="font-medium text-[#1C1917] truncate max-w-[150px]">
                          {designName || 'Kustom Pelanggan'}
                        </span>
                      </div>
                      {designUrl && (
                        <div className="flex justify-between">
                          <span className="text-stone-500">Posisi Logo:</span>
                          <span className="font-medium text-[#1C1917] capitalize">
                            {logoPlacement === 'top-rim'
                              ? 'Bibir Jam 12'
                              : logoPlacement === 'center'
                              ? 'Di Tengah'
                              : 'Bebas'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quantity Controls & Total Calculation */}
                    <div className="p-4 rounded-xl bg-[#F4F3F0] border border-stone-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#1C1917]">
                          Jumlah Piring:
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setOrderQuantity(orderQuantity - 1)}
                            className="w-7 h-7 rounded-lg bg-white border border-stone-200/90 flex items-center justify-center text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <input
                            type="number"
                            min={1}
                            value={orderQuantity}
                            onChange={(e) => setOrderQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                            className="w-12 text-center font-semibold text-sm bg-white border border-stone-200/90 rounded-lg py-0.5 text-[#1C1917]"
                          />
                          <button
                            type="button"
                            onClick={() => setOrderQuantity(orderQuantity + 1)}
                            className="w-7 h-7 rounded-lg bg-white border border-stone-200/90 flex items-center justify-center text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-stone-200/80 pt-2 space-y-1 text-xs">
                        <div className="flex justify-between text-stone-600">
                          <span>Harga Piring ({orderQuantity}x):</span>
                          <span>Rp {(singlePricing.unitBasePrice * orderQuantity).toLocaleString('id-ID')}</span>
                        </div>
                        {singlePricing.printFee > 0 && (
                          <div className="flex justify-between text-stone-600">
                            <span>Biaya Cetak Keramik:</span>
                            <span>Rp {(singlePricing.printFee * orderQuantity).toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        {singlePricing.rimTrimFee > 0 && (
                          <div className="flex justify-between text-stone-600">
                            <span>Aksen Rim Metalik:</span>
                            <span>Rp {(singlePricing.rimTrimFee * orderQuantity).toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        {singlePricing.rimPatternFee > 0 && (
                          <div className="flex justify-between text-stone-600">
                            <span>Motif Lis Bibir:</span>
                            <span>Rp {(singlePricing.rimPatternFee * orderQuantity).toLocaleString('id-ID')}</span>
                          </div>
                        )}
                        {singlePricing.discountPercent > 0 ? (
                          <div className="flex justify-between text-[#4A5D4E] font-semibold">
                            <span>Diskon Grosir ({singlePricing.discountPercent}%):</span>
                            <span>-Rp {singlePricing.discountAmount.toLocaleString('id-ID')}</span>
                          </div>
                        ) : (
                          <p className="text-[10px] text-stone-500 pt-1">
                            Beli ≥12 pcs diskon 10% • ≥50 pcs diskon 20% • ≥100 pcs diskon 35%
                          </p>
                        )}
                        <div className="flex justify-between items-baseline font-semibold text-sm text-[#1C1917] pt-2 border-t border-stone-200/80">
                          <span>Total Estimasi:</span>
                          <span className="text-base font-semibold text-[#1C1917]">
                            Rp {singlePricing.grandTotal.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Right Column: Customer Details Form (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="border-b border-stone-200/80 pb-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-500 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-stone-600" />
                    Informasi Pemesan &amp; Pengiriman
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Nama Lengkap *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        id="input-fullname"
                        type="text"
                        name="fullName"
                        required
                        placeholder="Contoh: Budi Santoso"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200/90 bg-white text-[#1C1917] focus:border-stone-500 focus:ring-1 focus:ring-stone-400/40 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Nomor WhatsApp / Telp *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                      <input
                        id="input-phone"
                        type="tel"
                        name="phone"
                        required
                        placeholder="0812-3456-7890"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200/90 bg-white text-[#1C1917] focus:border-stone-500 focus:ring-1 focus:ring-stone-400/40 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Alamat Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      id="input-email"
                      type="email"
                      name="email"
                      required
                      placeholder="nama@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200/90 bg-white text-[#1C1917] focus:border-stone-500 focus:ring-1 focus:ring-stone-400/40 outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1">
                    Alamat Lengkap Pengiriman *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <textarea
                      id="input-address"
                      name="shippingAddress"
                      required
                      rows={2}
                      placeholder="Jalan, No Rumah/Kantor, RT/RW, Kelurahan, Kecamatan"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200/90 bg-white text-[#1C1917] focus:border-stone-500 focus:ring-1 focus:ring-stone-400/40 outline-none resize-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Kota / Kabupaten *
                    </label>
                    <input
                      id="input-city"
                      type="text"
                      name="city"
                      required
                      placeholder="Jakarta Selatan"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200/90 bg-white text-[#1C1917] focus:border-stone-500 focus:ring-1 focus:ring-stone-400/40 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1">
                      Kode Pos
                    </label>
                    <input
                      id="input-postal"
                      type="text"
                      name="postalCode"
                      placeholder="12345"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200/90 bg-white text-[#1C1917] focus:border-stone-500 focus:ring-1 focus:ring-stone-400/40 outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-medium text-stone-700 mb-1.5 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-stone-600" />
                    Pilihan Pembayaran
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'qris', label: 'QRIS' },
                      { id: 'bca', label: 'BCA VA' },
                      { id: 'mandiri', label: 'Mandiri' },
                      { id: 'gopay', label: 'GoPay' },
                    ].map((method) => {
                      const isSelected = formData.paymentMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              paymentMethod: method.id as CustomerOrderData['paymentMethod'],
                            }))
                          }
                          className={`py-2 px-2 rounded-xl border text-center text-xs font-medium transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'border-[#57534E] bg-[#F4F3F0] text-[#1C1917] font-semibold'
                              : 'border-stone-200/80 text-stone-600 hover:border-stone-300 bg-white'
                          }`}
                        >
                          {method.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Safety Guarantee Badge */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#FBFBFA] border border-stone-200/80 text-[11px] text-stone-600">
                  <ShieldCheck className="w-4 h-4 text-[#6B7F6E] flex-shrink-0" />
                  <span>Garansi keramik food-grade, aman microwave &amp; dishwasher. Packing kayu &amp; asuransi pengiriman.</span>
                </div>

                {/* Submit CTA */}
                <button
                  id="btn-submit-order"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-white font-medium text-sm tracking-wide shadow-[0_4px_14px_rgba(28,25,23,0.12)] flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses Pesanan Kustom...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Konfirmasi &amp; Buat Pesanan (Rp {activeGrandTotal.toLocaleString('id-ID')})</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
