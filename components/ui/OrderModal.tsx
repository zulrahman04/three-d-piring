'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { usePlateStore } from '@/store/usePlateStore';
import { CustomerOrderData } from '@/types/plate';
import { RIM_PATTERNS } from '@/constants/presets';

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
  const [copiedId, setCopiedId] = useState(false);

  if (!isOrderModalOpen) return null;

  const pricing = calculateTotalPrice();

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

    const payload = {
      customer: {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: fullAddress,
        notes: formData.specialNotes,
      },
      customization: {
        plateSize: selectedSize.id,
        plateSizeName: selectedSize.name,
        diameterCm: selectedSize.diameterCm,
        outerRadius: selectedSize.outerRadius,
        wellRatio: selectedSize.wellRatio,
        wellDepth: selectedSize.wellDepth,
        rimHeight: selectedSize.rimHeight,
        rimAngleDeg: selectedSize.rimAngleDeg,
        thickness: selectedSize.thickness,
        footRingRadiusRatio: selectedSize.footRingRadiusRatio,
        plateColor: plateColor,
        finish: plateFinish,
        rimTrim: rimTrim,
        rimTrimCustomColor: rimTrimCustomColor,
        rimPattern: rimPattern,
        customRimPatternUrl: customRimPatternUrl || null,
        customRimPatternName: customRimPatternName || null,
        customRimPatternRepeat: customRimPatternRepeat,
        customRimPatternMode: customRimPatternMode,
        printCoverage: printCoverage,
        designImageUrl: designUrl || null,
        designName: designName || 'Custom Artwork',
        designScale: designScale,
        designRotation: designRotation,
        designOffsetX: designOffsetX,
        designOffsetY: designOffsetY,
        designOpacity: designOpacity,
        snapshotUrl: capturedSnapshot || null,
      },
      pricing: {
        unitBasePrice: pricing.unitBasePrice,
        printFee: pricing.printFee,
        rimTrimFee: pricing.rimTrimFee,
        unitTotal: pricing.unitTotal,
        quantity: pricing.quantity,
        grandTotal: pricing.grandTotal,
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
        setOrderCompleted(true);

        // Trigger celebratory confetti effect
        try {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#4f46e5', '#a855f7', '#d97706', '#10b981'],
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-md transition-all">
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white">
                {orderCompleted ? 'Pesanan Berhasil Diterima!' : 'Ringkasan & Konfirmasi Pesanan'}
              </h2>
              <p className="text-xs text-zinc-500">
                {orderCompleted
                  ? 'Nomor referensi pesanan telah dibuat'
                  : 'Pastikan detail piring custom dan alamat pengiriman Anda sesuai'}
              </p>
            </div>
          </div>

          <button
            id="btn-close-modal"
            onClick={handleClose}
            className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {orderCompleted ? (
          /* Order Confirmation View */
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="max-w-md mx-auto">
              <h3 className="text-2xl font-black text-zinc-900 dark:text-white">
                Terima Kasih, {formData.fullName || 'Pelanggan'}!
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 mt-2">
                Pesanan piring kustom Anda sedang diproses oleh tim studio keramik kami.
                Konfirmasi dan instruksi pembayaran telah dikirim ke{' '}
                <strong className="text-zinc-900 dark:text-white">{formData.email || 'email Anda'}</strong>.
              </p>
            </div>

            {/* Order Details Badge Card */}
            <div className="max-w-md mx-auto p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-left space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">ID Pesanan:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {orderId}
                  </span>
                  <button
                    onClick={handleCopyOrderId}
                    className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded transition-colors text-zinc-500"
                    title="Salin ID"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {copiedId && <span className="text-[10px] text-emerald-600">Disalin!</span>}
                </div>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-zinc-200 dark:border-zinc-700/50 pt-2">
                <span className="text-zinc-500">Total Pembayaran:</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  Rp {pricing.grandTotal.toLocaleString('id-ID')} ({pricing.quantity} pcs)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs border-t border-zinc-200 dark:border-zinc-700/50 pt-2">
                <span className="text-zinc-500">Metode Bayar:</span>
                <span className="font-semibold uppercase text-zinc-800 dark:text-zinc-200">
                  {formData.paymentMethod}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto pt-2">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Halo Admin Ceramix, saya ingin konfirmasi pesanan piring custom dengan ID: ${orderId} atas nama ${formData.fullName}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                Konfirmasi via WhatsApp
              </a>

              <button
                onClick={handleClose}
                className="w-full sm:flex-1 py-3 px-4 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-sm transition-colors"
              >
                Buat Desain Lain
              </button>
            </div>
          </div>
        ) : (
          /* Normal Order Form View (2-Column Grid) */
          <form onSubmit={handleSubmitOrder} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: 3D Snapshot & Spec Summary (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-b from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 border border-zinc-200 dark:border-zinc-700/70 flex items-center justify-center group shadow-inner">
                  {capturedSnapshot ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={capturedSnapshot}
                      alt="Hasil Custom Piring 3D"
                      className="w-full h-full object-contain p-4 drop-shadow-2xl"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <ShoppingBag className="w-12 h-12 text-zinc-400 mx-auto mb-2 opacity-50" />
                      <p className="text-xs text-zinc-400">Snapshot piring sedang diproses...</p>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase">
                    3D Render Snapshot
                  </div>
                </div>

                {/* Specs Pill List */}
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-800 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Tipe Piring:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {selectedSize.name} ({selectedSize.diameterCm} cm)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Finishing Glasir:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
                      {plateFinish}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">Aksen Pinggiran:</span>
                    {rimTrim === 'custom' ? (
                      <span className="flex items-center gap-1.5 font-semibold text-zinc-800 dark:text-zinc-200 text-xs">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-black/20"
                          style={{ backgroundColor: rimTrimCustomColor }}
                        />
                        Custom ({rimTrimCustomColor.toUpperCase()})
                      </span>
                    ) : (
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
                        {rimTrim}
                      </span>
                    )}
                  </div>
                  {rimPattern && rimPattern !== 'none' && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Motif Lis Bibir:</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[150px]">
                        {rimPattern === 'custom'
                          ? customRimPatternName
                            ? `${customRimPatternName} (${customRimPatternMode === 'repeat' ? `${customRimPatternRepeat}x` : 'Cincin'})`
                            : 'Motif Kustom Pelanggan'
                          : RIM_PATTERNS.find((p) => p.id === rimPattern)?.name || rimPattern}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Motif Cetak:</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[150px]">
                      {designName || 'Kustom Pelanggan'}
                    </span>
                  </div>
                  {designUrl && (
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Posisi Logo:</span>
                      <span className="font-semibold text-zinc-800 dark:text-zinc-200 capitalize">
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
                <div className="p-4 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                      Jumlah Piring:
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setOrderQuantity(orderQuantity - 1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">
                        {orderQuantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOrderQuantity(orderQuantity + 1)}
                        className="w-7 h-7 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-indigo-200/50 dark:border-indigo-900/50 pt-2 space-y-1 text-xs">
                    <div className="flex justify-between text-zinc-500">
                      <span>Harga Piring ({orderQuantity}x):</span>
                      <span>Rp {(pricing.unitBasePrice * orderQuantity).toLocaleString('id-ID')}</span>
                    </div>
                    {pricing.printFee > 0 && (
                      <div className="flex justify-between text-zinc-500">
                        <span>Biaya Cetak Keramik:</span>
                        <span>Rp {(pricing.printFee * orderQuantity).toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {pricing.rimTrimFee > 0 && (
                      <div className="flex justify-between text-zinc-500">
                        <span>Aksen Rim Metalik:</span>
                        <span>Rp {(pricing.rimTrimFee * orderQuantity).toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    {pricing.rimPatternFee && pricing.rimPatternFee > 0 && (
                      <div className="flex justify-between text-zinc-500">
                        <span>Motif Lis Bibir:</span>
                        <span>Rp {(pricing.rimPatternFee * orderQuantity).toLocaleString('id-ID')}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline font-bold text-sm text-zinc-900 dark:text-white pt-2 border-t border-indigo-200/70 dark:border-indigo-900/70">
                      <span>Total Estimasi:</span>
                      <span className="text-base text-indigo-600 dark:text-indigo-400">
                        Rp {pricing.grandTotal.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Customer Details Form (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <User className="w-4 h-4 text-indigo-500" />
                    Informasi Pemesan & Pengiriman
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Nama Lengkap *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                      <input
                        id="input-fullname"
                        type="text"
                        name="fullName"
                        required
                        placeholder="Contoh: Dzul KEce-Bur"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Nomor WhatsApp / Telp *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                      <input
                        id="input-phone"
                        type="tel"
                        name="phone"
                        required
                        placeholder="0812-3456-7890"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Alamat Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                    <input
                      id="input-email"
                      type="email"
                      name="email"
                      required
                      placeholder="nama@email.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Alamat Lengkap Pengiriman *
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
                    <textarea
                      id="input-address"
                      name="shippingAddress"
                      required
                      rows={2}
                      placeholder="Jalan, No Rumah/Kantor, RT/RW, Kelurahan, Kecamatan"
                      value={formData.shippingAddress}
                      onChange={handleInputChange}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
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
                      className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Kode Pos
                    </label>
                    <input
                      id="input-postal"
                      type="text"
                      name="postalCode"
                      placeholder="12345"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800/80 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
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
                          className={`py-2 px-2 rounded-xl border text-center text-xs font-bold transition-all ${isSelected
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                              : 'border-zinc-300 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                            }`}
                        >
                          {method.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Safety Guarantee Badge */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/40 text-[11px] text-zinc-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Garansi keramik food-grade, aman microwave & dishwasher. Packing kayu & asuransi pengiriman.</span>
                </div>

                {/* Submit CTA */}
                <button
                  id="btn-submit-order"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Memproses Pesanan Kustom...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Konfirmasi & Buat Pesanan (Rp {pricing.grandTotal.toLocaleString('id-ID')})</span>
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
