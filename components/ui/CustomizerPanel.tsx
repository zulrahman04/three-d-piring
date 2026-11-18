'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Upload,
  Image as ImageIcon,
  RotateCw,
  ZoomIn,
  Move,
  Trash2,
  Sparkles,
  Palette,
  Layers,
  Sliders,
  Check,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  Pipette,
  Crosshair,
} from 'lucide-react';
import { usePlateStore } from '@/store/usePlateStore';
import {
  PLATE_COLORS,
  PLATE_SIZES,
  RIM_TRIMS,
  RIM_PATTERNS,
  RimPatternItem,
  DESIGN_PRESETS,
  SAMPLE_RIM_MOTIFS,
} from '@/constants/presets';
import { PlateFinish, RimTrim, RimPattern, LogoPlacement } from '@/types/plate';
import { compressUploadedImage } from '@/lib/imageCompress';

export default function CustomizerPanel({
  onCheckout,
  onAddToCart,
}: {
  onCheckout: () => void;
  onAddToCart?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'design' | 'plate' | 'adjust'>('design');
  const [isDragging, setIsDragging] = useState(false);
  const [addedToCartToast, setAddedToCartToast] = useState(false);
  const [rimPatternCategory, setRimPatternCategory] = useState<'Semua' | 'Garis Logam' | 'Batik Nusantara' | 'Klasik & Mewah' | 'Kustom'>('Semua');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rimPatternFileInputRef = useRef<HTMLInputElement>(null);

  const {
    availableSizes,
    availableColors,
    availablePresets,
    loadMasterCatalog,
    restoreDraft,
    selectedSize,
    setSize,
    plateColor,
    setPlateColor,
    plateFinish,
    setPlateFinish,
    rimTrim,
    setRimTrim,
    rimTrimCustomColor,
    setRimTrimCustomColor,
    rimPattern,
    setRimPattern,
    customRimPatternUrl,
    customRimPatternName,
    customRimPatternRepeat,
    customRimPatternMode,
    setCustomRimPatternUrl,
    setCustomRimPatternRepeat,
    setCustomRimPatternMode,
    clearCustomRimPattern,
    printCoverage,
    setPrintCoverage,
    designUrl,
    designName,
    logoPlacement,
    setLogoPlacement,
    setDesignImage,
    clearDesign,
    designScale,
    setDesignScale,
    designRotation,
    setDesignRotation,
    designOffsetX,
    designOffsetY,
    setDesignOffset,
    resetDesignTransforms,
    showSafeZoneGuides,
    setShowSafeZoneGuides,
    cart,
    calculateTotalPrice,
  } = usePlateStore();

  const pricing = calculateTotalPrice();
  const activeColors = availableColors && availableColors.length > 0 ? availableColors : PLATE_COLORS;
  const activePresets = availablePresets && availablePresets.length > 0 ? availablePresets : DESIGN_PRESETS;

  // Local text states for flexible HEX color inputs
  const [customPlateHex, setCustomPlateHex] = useState(plateColor);
  const [customRimHex, setCustomRimHex] = useState(rimTrimCustomColor);

  useEffect(() => {
    setCustomPlateHex(plateColor);
  }, [plateColor]);

  useEffect(() => {
    setCustomRimHex(rimTrimCustomColor);
  }, [rimTrimCustomColor]);

  useEffect(() => {
    loadMasterCatalog().then(() => {
      restoreDraft();
    });
  }, [loadMasterCatalog, restoreDraft]);

  const handlePlateHexChange = (val: string) => {
    setCustomPlateHex(val);
    const clean = val.startsWith('#') ? val : `#${val}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
      setPlateColor(clean);
    }
  };

  const handlePlateColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPlateHex(e.target.value);
    setPlateColor(e.target.value);
  };

  const handleRimHexChange = (val: string) => {
    setCustomRimHex(val);
    const clean = val.startsWith('#') ? val : `#${val}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
      setRimTrimCustomColor(clean);
    }
  };

  const handleRimColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomRimHex(e.target.value);
    setRimTrimCustomColor(e.target.value);
  };

  // Handle file upload from user device with automatic compression for optimal 3D & DB size
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (PNG, JPEG, WEBP, atau SVG).');
      return;
    }

    try {
      const optimizedUrl = await compressUploadedImage(file, 1600, 0.88);
      setDesignImage(optimizedUrl, file.name);
    } catch {
      alert('Gagal memproses file gambar.');
    }
    e.target.value = '';
  };

  const handleCustomRimPatternUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (PNG, JPEG, WEBP, atau SVG).');
      return;
    }

    try {
      const optimizedUrl = await compressUploadedImage(file, 1200, 0.88);
      setCustomRimPatternUrl(optimizedUrl, file.name);
    } catch {
      alert('Gagal memproses file gambar motif.');
    }
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      try {
        const optimizedUrl = await compressUploadedImage(file, 1600, 0.88);
        setDesignImage(optimizedUrl, file.name);
      } catch {
        alert('Gagal memproses file gambar.');
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-stone-200/80 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all duration-200">
      {/* Panel Navigation Tabs */}
      <div className="flex items-center p-1 bg-[#F4F3F0] border border-stone-200/70 m-4 mb-2 rounded-xl gap-1">
        <button
          onClick={() => setActiveTab('design')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-[13px] font-medium transition-all duration-200 cursor-pointer ${
            activeTab === 'design'
              ? 'bg-white text-[#1C1917] shadow-[0_2px_8px_rgb(0,0,0,0.04)] font-semibold'
              : 'text-stone-500 hover:text-[#1C1917] hover:bg-white/40'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${activeTab === 'design' ? 'text-[#1C1917]' : 'text-stone-400'}`} />
          <span>Desain</span>
        </button>

        <button
          onClick={() => setActiveTab('plate')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-[13px] font-medium transition-all duration-200 cursor-pointer ${
            activeTab === 'plate'
              ? 'bg-white text-[#1C1917] shadow-[0_2px_8px_rgb(0,0,0,0.04)] font-semibold'
              : 'text-stone-500 hover:text-[#1C1917] hover:bg-white/40'
          }`}
        >
          <Palette className={`w-3.5 h-3.5 ${activeTab === 'plate' ? 'text-[#1C1917]' : 'text-stone-400'}`} />
          <span>Piring</span>
        </button>

        <button
          onClick={() => setActiveTab('adjust')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-[13px] font-medium transition-all duration-200 cursor-pointer ${
            activeTab === 'adjust'
              ? 'bg-white text-[#1C1917] shadow-[0_2px_8px_rgb(0,0,0,0.04)] font-semibold'
              : 'text-stone-500 hover:text-[#1C1917] hover:bg-white/40'
          }`}
        >
          <Sliders className={`w-3.5 h-3.5 ${activeTab === 'adjust' ? 'text-[#1C1917]' : 'text-stone-400'}`} />
          <span>Atur Posisi</span>
        </button>
      </div>

      {/* Tab Contents (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-6 text-[#1C1917] custom-scrollbar">
        {/* ==================== TAB 1: DESAIN & GAMBAR ==================== */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            {/* Upload Box */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500 mb-2.5">
                Upload Motif / Logo Kustom
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp, image/svg+xml"
                className="hidden"
                onChange={handleFileChange}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-5 border border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-[#57534E] bg-[#F4F3F0]'
                    : 'border-stone-300 hover:border-stone-500 bg-[#FBFBFA] hover:bg-[#F4F3F0]/60'
                }`}
              >
                <div className="w-11 h-11 rounded-full bg-white border border-stone-200/80 text-stone-700 flex items-center justify-center mb-2.5 shadow-[0_2px_8px_rgb(0,0,0,0.03)]">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#1C1917] text-center">
                  Klik untuk unggah atau seret gambar ke sini
                </p>
                <p className="text-[11px] text-stone-400 mt-1">
                  Mendukung PNG transparan, JPG, WebP, SVG (Maks 10MB)
                </p>
              </div>

              {/* Uploaded File Pill & Clear */}
              {designUrl && (
                <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-[#FBFBFA] border border-stone-200/80">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-[#F4F3F0] border border-stone-200/70 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={designUrl}
                        alt="Preview Desain"
                        className="w-full h-full object-contain p-0.5"
                      />
                    </div>
                    <span className="text-xs font-medium text-[#1C1917] truncate max-w-[180px]">
                      {designName || 'Desain Aktif'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearDesign();
                    }}
                    title="Hapus Desain"
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors duration-200 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Presets Gallery */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
                  Pilihan Template Desain
                </label>
                <span className="text-[11px] text-stone-400 tracking-wide">
                  Siap Pakai
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {activePresets.map((preset) => {
                  const isSelected = designName === preset.name;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setDesignImage(preset.dataUrl, preset.name)}
                      className={`relative flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all duration-200 active:scale-[0.99] cursor-pointer ${
                        isSelected
                          ? 'border-[#57534E] bg-[#F4F3F0]/90 shadow-[0_2px_10px_rgb(0,0,0,0.03)]'
                          : 'border-stone-200/80 hover:border-stone-400/80 bg-white hover:bg-[#FBFBFA]'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#FBFBFA] border border-stone-200/70 flex-shrink-0 overflow-hidden flex items-center justify-center p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preset.dataUrl}
                          alt={preset.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-[#1C1917] truncate">
                          {preset.name}
                        </p>
                        <p className="text-[10px] text-stone-500 truncate">
                          {preset.category}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-[#1C1917] text-white flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Coverage Mode */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500 mb-2.5">
                Cakupan Area Cetak
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPrintCoverage('center')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                    printCoverage === 'center'
                      ? 'border-[#57534E] bg-[#F4F3F0] text-[#1C1917] font-semibold'
                      : 'border-stone-200/80 bg-white hover:border-stone-300 text-stone-600'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Cekungan Tengah
                </button>
                <button
                  type="button"
                  onClick={() => setPrintCoverage('full')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer ${
                    printCoverage === 'full'
                      ? 'border-[#57534E] bg-[#F4F3F0] text-[#1C1917] font-semibold'
                      : 'border-stone-200/80 bg-white hover:border-stone-300 text-stone-600'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Seluruh Permukaan
                </button>
              </div>
            </div>

            {/* Logo Placement Selector */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
                  Posisi Penempatan Logo / Motif
                </label>
                {logoPlacement === 'top-rim' && (
                  <span className="text-[10px] font-medium text-stone-700 bg-[#F4F3F0] px-2.5 py-0.5 rounded-full border border-stone-200/80">
                    Gaya Hotel Bintang 5
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLogoPlacement('center')}
                  className={`py-2.5 px-2 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                    logoPlacement === 'center'
                      ? 'border-[#57534E] bg-[#F4F3F0] text-[#1C1917]'
                      : 'border-stone-200/80 bg-white text-stone-600 hover:border-stone-400/80'
                  }`}
                >
                  <p className="text-xs font-semibold">Di Tengah</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">Dasar Piring</p>
                </button>

                <button
                  type="button"
                  onClick={() => setLogoPlacement('top-rim')}
                  className={`py-2.5 px-2 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                    logoPlacement === 'top-rim'
                      ? 'border-[#57534E] bg-[#F4F3F0] text-[#1C1917]'
                      : 'border-stone-200/80 bg-white text-stone-600 hover:border-stone-400/80'
                  }`}
                >
                  <p className="text-xs font-semibold">Bibir Jam 12</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">Bibir Atas Piring</p>
                </button>

                <button
                  type="button"
                  onClick={() => setLogoPlacement('free')}
                  className={`py-2.5 px-2 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                    logoPlacement === 'free'
                      ? 'border-[#57534E] bg-[#F4F3F0] text-[#1C1917]'
                      : 'border-stone-200/80 bg-white text-stone-600 hover:border-stone-400/80'
                  }`}
                >
                  <p className="text-xs font-semibold">Bebas Geser</p>
                  <p className="text-[10px] text-stone-400 mt-0.5">Atur Posisi Bebas</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 2: WARNA & MATERIAL PIRING ==================== */}
        {activeTab === 'plate' && (
          <div className="space-y-6">
            {/* Plate Size */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500 mb-2.5">
                Ukuran Piring Keramik
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(availableSizes && availableSizes.length > 0 ? availableSizes : PLATE_SIZES).map((size) => {
                  const isSelected = selectedSize.id === size.id;
                  return (
                    <button
                      key={size.id}
                      onClick={() => setSize(size)}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-[#57534E] bg-[#F4F3F0]/90 shadow-[0_2px_10px_rgb(0,0,0,0.03)]'
                          : 'border-stone-200/80 bg-white hover:border-stone-400/80 hover:bg-[#FBFBFA]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#1C1917] truncate">
                          {size.name}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#1C1917] shrink-0 ml-1" />
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500 mt-0.5">
                        Ø {size.diameterCm} cm
                      </span>
                      <span className="text-[11px] font-semibold text-[#57534E] mt-1">
                        Rp {size.basePrice.toLocaleString('id-ID')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Base Color Selection */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
                  Warna Piring Keramik
                </label>
                <span className="text-xs text-stone-600 font-medium">
                  {activeColors.find((c) => c.hex.toLowerCase() === plateColor.toLowerCase())?.name || 'Warna Kustom'}
                </span>
              </div>

              {/* Preset Color Swatches */}
              <div className="grid grid-cols-7 gap-2">
                {activeColors.map((color) => {
                  const isSelected = plateColor.toLowerCase() === color.hex.toLowerCase();
                  return (
                    <button
                      key={color.id}
                      onClick={() => setPlateColor(color.hex)}
                      title={`${color.name}: ${color.description}`}
                      className={`group relative w-full aspect-square rounded-xl transition-all duration-200 hover:scale-105 flex items-center justify-center border cursor-pointer ${
                        isSelected
                          ? 'border-[#1C1917] ring-2 ring-stone-400/40 scale-105'
                          : 'border-stone-300/80'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && (
                        <Check
                          className={`w-3.5 h-3.5 stroke-[2.5] ${
                            ['#FAF7F2', '#FCFBF9', '#E8CCA4'].includes(color.hex.toUpperCase())
                              ? 'text-[#1C1917]'
                              : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Flexible Color Picker & Direct Hex Input for Base Plate */}
              <div className="mt-3 flex items-center gap-2.5 p-2 rounded-xl bg-[#FBFBFA] border border-stone-200/80">
                <div className="relative flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden border border-stone-300/80 shadow-2xs cursor-pointer group">
                  <input
                    type="color"
                    value={plateColor.startsWith('#') ? plateColor : '#FCFBF9'}
                    onChange={handlePlateColorPicker}
                    className="absolute -inset-2 w-12 h-12 cursor-pointer opacity-0"
                    title="Buka Palet Warna Bebas"
                  />
                  <div
                    className="w-full h-full flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ backgroundColor: plateColor }}
                  >
                    <Pipette className="w-3.5 h-3.5 text-stone-700 mix-blend-difference drop-shadow" />
                  </div>
                </div>

                <div className="flex-1 flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-semibold text-stone-400 tracking-wider">
                    HEX:
                  </span>
                  <input
                    type="text"
                    value={customPlateHex}
                    onChange={(e) => handlePlateHexChange(e.target.value)}
                    placeholder="#FCFBF9"
                    maxLength={7}
                    className="w-full py-1 px-2.5 text-xs font-mono font-medium bg-white border border-stone-200/90 rounded-lg text-[#1C1917] focus:outline-none focus:border-stone-500"
                  />
                </div>

                <span className="text-[10px] text-stone-400 font-medium px-1 flex-shrink-0">
                  Input Bebas
                </span>
              </div>
            </div>

            {/* Finish Texture Selection */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500 mb-2.5">
                Tekstur Glasir (Finishing)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'glossy', label: 'Kilap Porselen', desc: 'Pantulan jernih' },
                  { id: 'matte', label: 'Matte Doff', desc: 'Tekstur halus alami' },
                  { id: 'satin', label: 'Semi-Satin', desc: 'Kilau lembut' },
                ].map((item) => {
                  const isSelected = plateFinish === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setPlateFinish(item.id as PlateFinish)}
                      className={`p-2.5 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-[#57534E] bg-[#F4F3F0] text-[#1C1917]'
                          : 'border-stone-200/80 bg-white hover:border-stone-400/80 text-stone-600'
                      }`}
                    >
                      <p className="text-xs font-semibold">{item.label}</p>
                      <p className="text-[10px] text-stone-400 mt-0.5">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rim Trim Selection */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
                  Aksen Pinggiran (Metallic Rim Trim)
                </label>
                {rimTrim === 'custom' && (
                  <span className="text-xs font-mono font-semibold text-stone-700">
                    {rimTrimCustomColor.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {RIM_TRIMS.map((trim) => {
                  const isSelected = rimTrim === trim.id;
                  const displayHex = trim.id === 'custom' ? rimTrimCustomColor : trim.hex;
                  return (
                    <button
                      key={trim.id}
                      onClick={() => setRimTrim(trim.id as RimTrim)}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'border-[#57534E] bg-[#F4F3F0]/90 shadow-[0_2px_10px_rgb(0,0,0,0.03)]'
                          : 'border-stone-200/80 bg-white hover:border-stone-400/80 hover:bg-[#FBFBFA]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {displayHex !== 'transparent' ? (
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-black/15 shadow-2xs"
                            style={{ backgroundColor: displayHex }}
                          />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-dashed border-stone-400" />
                        )}
                        <span className="text-xs font-medium text-[#1C1917] truncate">
                          {trim.name.split(' (')[0]}
                        </span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-medium flex-shrink-0">
                        {trim.price > 0 ? `+Rp ${(trim.price / 1000).toFixed(0)}k` : 'Gratis'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Flexible Custom Color Input & Palette Chips for Rim Trim */}
              {rimTrim === 'custom' && (
                <div className="mt-3 p-3.5 rounded-xl bg-[#FBFBFA] border border-stone-200/80 space-y-3 transition-all animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1C1917] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-stone-600" />
                      Pilih Warna Aksen Bebas
                    </span>
                    <span className="text-[10px] font-medium text-stone-500">
                      Input Kode HEX
                    </span>
                  </div>

                  {/* Color Picker & Hex Input for Rim Trim */}
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex-shrink-0 w-9 h-9 rounded-xl overflow-hidden border border-stone-300 shadow-xs cursor-pointer group">
                      <input
                        type="color"
                        value={rimTrimCustomColor.startsWith('#') ? rimTrimCustomColor : '#D4AF37'}
                        onChange={handleRimColorPicker}
                        className="absolute -inset-2 w-14 h-14 cursor-pointer opacity-0"
                        title="Buka Palet Warna Aksen"
                      />
                      <div
                        className="w-full h-full flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{ backgroundColor: rimTrimCustomColor }}
                      >
                        <Pipette className="w-4 h-4 text-white mix-blend-difference drop-shadow" />
                      </div>
                    </div>

                    <div className="flex-1 flex items-center gap-1.5 min-w-0">
                      <span className="text-[11px] font-semibold text-stone-400 tracking-wider">
                        HEX:
                      </span>
                      <input
                        type="text"
                        value={customRimHex}
                        onChange={(e) => handleRimHexChange(e.target.value)}
                        placeholder="#D4AF37"
                        maxLength={7}
                        className="w-full py-1.5 px-2.5 text-xs font-mono font-medium bg-white border border-stone-200/90 rounded-lg text-[#1C1917] focus:outline-none focus:border-stone-500"
                      />
                    </div>
                  </div>

                  {/* Quick Color Palette Shortcuts for Rim */}
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-400 mb-1.5">
                      Rekomendasi Aksen Metalik:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {[
                        { name: 'Bronze', hex: '#CD7F32' },
                        { name: 'Champagne', hex: '#F7E7CE' },
                        { name: 'Antique Brass', hex: '#C5A059' },
                        { name: 'Emerald Metal', hex: '#1B4D3E' },
                        { name: 'Royal Blue', hex: '#0047AB' },
                        { name: 'Onyx Black', hex: '#1F2421' },
                      ].map((preset) => (
                        <button
                          key={preset.hex}
                          type="button"
                          onClick={() => {
                            setCustomRimHex(preset.hex);
                            setRimTrimCustomColor(preset.hex);
                          }}
                          title={preset.name}
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-medium transition-all duration-200 cursor-pointer ${
                            rimTrimCustomColor.toLowerCase() === preset.hex.toLowerCase()
                              ? 'border-[#1C1917] bg-white font-semibold shadow-2xs'
                              : 'border-stone-200/80 bg-white/80 hover:bg-white'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/15"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span className="text-stone-700">{preset.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Rim Pattern Selection / Motif Lis Bibir Piring */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500">
                  Motif &amp; List Bibir Piring
                </label>
                <span className="text-[10px] font-medium text-stone-600 bg-[#F4F3F0] px-2.5 py-0.5 rounded-full border border-stone-200/80">
                  Cetak 360° Presisi
                </span>
              </div>

              {/* Category Pills Filter */}
              <div className="flex items-center gap-1 mb-2.5 overflow-x-auto pb-1 text-xs">
                {(['Semua', 'Garis Logam', 'Batik Nusantara', 'Klasik & Mewah', 'Kustom'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setRimPatternCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      rimPatternCategory === cat
                        ? 'bg-[#1C1917] text-white shadow-2xs'
                        : 'bg-[#F4F3F0] text-stone-600 hover:bg-stone-200/80 hover:text-[#1C1917]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Hidden file input for custom rim pattern motif */}
              <input
                id="rim-pattern-file-input"
                ref={rimPatternFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleCustomRimPatternUpload}
              />

              {/* Grid of Rim Patterns */}
              <div className="space-y-2">
                {RIM_PATTERNS.filter((pattern) => {
                  if (rimPatternCategory === 'Semua') return true;
                  return pattern.category === rimPatternCategory;
                }).map((pattern) => {
                  const isSelected = rimPattern === pattern.id;
                  const isCustom = pattern.id === 'custom';

                  return (
                    <div key={pattern.id} className="space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRimPattern(pattern.id);
                          if (isCustom && !customRimPatternUrl) {
                            rimPatternFileInputRef.current?.click();
                          }
                        }}
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'border-[#57534E] bg-[#F4F3F0]/90 shadow-[0_2px_10px_rgb(0,0,0,0.03)]'
                            : 'border-stone-200/80 bg-white hover:border-stone-400/80 hover:bg-[#FBFBFA]'
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#1C1917] truncate">
                              {pattern.name}
                            </span>
                            {pattern.badge && (
                              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200/80">
                                {pattern.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                            {pattern.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] font-semibold text-[#57534E]">
                            {pattern.price > 0 ? `+Rp ${(pattern.price / 1000).toFixed(0)}k` : 'Gratis'}
                          </span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-[#1C1917] text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Custom Rim Pattern Upload & Controls Panel - Expands directly below Custom button */}
                      {isCustom && isSelected && (
                        <div className="p-3.5 rounded-xl bg-[#FBFBFA] border border-stone-200/80 space-y-3.5 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-[#1C1917] flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-stone-600" />
                              Pengaturan Motif Kustom Bibir
                            </span>
                            <span className="text-[10px] font-medium text-stone-500">
                              Batik / Ornamen
                            </span>
                          </div>

                          {!customRimPatternUrl ? (
                            <div className="space-y-3">
                              <div
                                onClick={() => rimPatternFileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const file = e.dataTransfer.files?.[0];
                                  if (file && file.type.startsWith('image/')) {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      if (typeof reader.result === 'string') {
                                        setCustomRimPatternUrl(reader.result, file.name);
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="p-4 border border-dashed border-stone-300 hover:border-stone-500 rounded-xl bg-white hover:bg-[#F4F3F0]/50 transition-all duration-200 cursor-pointer text-center group"
                              >
                                <div className="w-10 h-10 rounded-xl bg-[#F4F3F0] border border-stone-200/80 text-stone-700 mx-auto flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                                  <Upload className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-semibold text-[#1C1917]">
                                  Klik / Seret Gambar Motif (PNG / SVG)
                                </p>
                                <p className="text-[11px] text-stone-500 mt-0.5">
                                  Unggah 1 potongan batik/ornamen. Sistem akan mengulang 360° mengelilingi bibir piring.
                                </p>
                              </div>

                              {/* Quick Sample Presets */}
                              <div className="pt-1">
                                <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-400 mb-1.5">
                                  Atau Coba Contoh Motif Siap Pakai:
                                </span>
                                <div className="grid grid-cols-3 gap-1.5">
                                  {SAMPLE_RIM_MOTIFS.map((sample) => (
                                    <button
                                      key={sample.id}
                                      type="button"
                                      onClick={() => setCustomRimPatternUrl(sample.dataUrl, sample.name)}
                                      className="p-1.5 rounded-xl border border-stone-200/80 bg-white hover:border-stone-400 transition-all duration-200 text-center group cursor-pointer"
                                    >
                                      <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-[#FBFBFA] p-1 flex items-center justify-center">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={sample.dataUrl}
                                          alt={sample.name}
                                          className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                                        />
                                      </div>
                                      <p className="text-[10px] font-medium text-stone-700 truncate">
                                        {sample.name.split(' ')[0]}
                                      </p>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <>
                              {/* File Info Bar */}
                              <div className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-stone-200/80">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-10 h-10 rounded-lg bg-[#F4F3F0] overflow-hidden flex-shrink-0 border border-stone-200/80 flex items-center justify-center p-1">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={customRimPatternUrl}
                                      alt="Motif Kustom"
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-[#1C1917] truncate">
                                      {customRimPatternName || 'Motif Bibir Kustom'}
                                    </p>
                                    <span className="text-[10px] text-[#57534E] font-medium flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#6B7F6E]" />
                                      Aktif pada Bibir 360°
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => rimPatternFileInputRef.current?.click()}
                                    className="px-2 py-1 text-[11px] font-medium text-[#1C1917] hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                                  >
                                    Ganti
                                  </button>
                                  <button
                                    type="button"
                                    onClick={clearCustomRimPattern}
                                    title="Hapus motif kustom"
                                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Mode Selector */}
                              <div>
                                <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-stone-400 mb-1.5">
                                  Metode Penempatan Motif:
                                </span>
                                <div className="grid grid-cols-2 gap-1.5 p-1 bg-white rounded-xl border border-stone-200/80">
                                  <button
                                    type="button"
                                    onClick={() => setCustomRimPatternMode('repeat')}
                                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                                      customRimPatternMode === 'repeat'
                                        ? 'bg-[#1C1917] text-white shadow-2xs'
                                        : 'text-stone-600 hover:text-[#1C1917]'
                                    }`}
                                  >
                                    Ulang Melingkar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCustomRimPatternMode('full')}
                                    className={`py-1.5 px-2 rounded-lg text-xs font-medium transition-all duration-200 cursor-pointer ${
                                      customRimPatternMode === 'full'
                                        ? 'bg-[#1C1917] text-white shadow-2xs'
                                        : 'text-stone-600 hover:text-[#1C1917]'
                                    }`}
                                  >
                                    Cincin Utuh
                                  </button>
                                </div>
                              </div>

                              {/* Repeat Count Slider & Quick Presets (When Mode is 'repeat') */}
                              {customRimPatternMode === 'repeat' ? (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-medium text-stone-700">
                                      Kerapatan Pengulangan:
                                    </span>
                                    <span className="font-mono font-semibold text-[#1C1917] bg-white px-2 py-0.5 rounded-md border border-stone-200/80">
                                      {customRimPatternRepeat}x Putaran
                                    </span>
                                  </div>

                                  <input
                                    type="range"
                                    min={8}
                                    max={48}
                                    step={2}
                                    value={customRimPatternRepeat}
                                    onChange={(e) => setCustomRimPatternRepeat(Number(e.target.value))}
                                    className="w-full japandi-slider cursor-pointer"
                                  />

                                  {/* Quick Repeat Presets */}
                                  <div className="flex items-center gap-1.5 pt-1">
                                    <span className="text-[10px] text-stone-400 font-medium mr-1">Preset:</span>
                                    {[12, 18, 24, 32, 40, 48].map((count) => (
                                      <button
                                        key={count}
                                        type="button"
                                        onClick={() => setCustomRimPatternRepeat(count)}
                                        className={`flex-1 py-0.5 rounded-md text-[10px] font-semibold border transition-all duration-200 cursor-pointer ${
                                          customRimPatternRepeat === count
                                            ? 'bg-[#1C1917] border-[#1C1917] text-white'
                                            : 'bg-white border-stone-200/80 text-stone-600 hover:border-stone-400'
                                        }`}
                                      >
                                        {count}x
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-[10px] text-stone-400 pt-0.5">
                                    Tip: 24x ideal untuk motif proporsional. 36x-48x untuk motif rapat/halus.
                                  </p>
                                </div>
                              ) : (
                                <div className="p-2.5 rounded-xl bg-white border border-stone-200/80 text-[11px] text-stone-600 leading-relaxed">
                                  Pastikan gambar yang diunggah berupa lingkaran cincin 1:1 (PNG transparan) agar melingkari bibir piring dengan presisi.
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================== TAB 3: TRANSFORM & ATUR POSISI ==================== */}
        {activeTab === 'adjust' && (
          <div className="space-y-5">
            {!designUrl ? (
              <div className="text-center py-10 px-4">
                <ImageIcon className="w-10 h-10 text-stone-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-stone-600">
                  Belum ada motif yang dipilih
                </p>
                <p className="text-xs text-stone-400 mt-1 mb-4">
                  Unggah gambar atau pilih template di tab Desain untuk mengatur posisi.
                </p>
                <button
                  onClick={() => setActiveTab('design')}
                  className="px-4 py-2 bg-[#1C1917] hover:bg-stone-800 text-white text-xs font-medium rounded-xl transition-all duration-200 cursor-pointer"
                >
                  Pilih Desain Sekarang
                </button>
              </div>
            ) : (
              <>
                {/* Active Placement Notice */}
                {logoPlacement === 'top-rim' && (
                  <div className="p-3 rounded-xl bg-[#FBFBFA] border border-stone-200/80 text-xs text-[#1C1917] flex items-center justify-between">
                    <span className="font-medium flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-stone-600 flex-shrink-0" />
                      Posisi Aktif: Bibir Atas (Jam 12)
                    </span>
                    <button
                      type="button"
                      onClick={() => setLogoPlacement('center')}
                      className="text-[11px] underline font-medium text-stone-600 hover:text-[#1C1917] cursor-pointer"
                    >
                      Pindah ke Tengah
                    </button>
                  </div>
                )}

                {/* Scale Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-[#1C1917]">
                      <ZoomIn className="w-3.5 h-3.5 text-stone-500" />
                      Skala Cetakan (Zoom)
                    </span>
                    <span className="font-mono text-stone-500">
                      {Math.round(designScale * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.3"
                    max="1.8"
                    step="0.05"
                    value={designScale}
                    onChange={(e) => setDesignScale(parseFloat(e.target.value))}
                    className="w-full japandi-slider cursor-pointer"
                  />
                </div>

                {/* Rotation Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-[#1C1917]">
                      <RotateCw className="w-3.5 h-3.5 text-stone-500" />
                      Rotasi Sudut
                    </span>
                    <span className="font-mono text-stone-500">
                      {Math.round(designRotation)}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={designRotation}
                    onChange={(e) => setDesignRotation(parseInt(e.target.value, 10))}
                    className="w-full japandi-slider cursor-pointer"
                  />
                </div>

                {/* Offset X Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-[#1C1917]">
                      <Move className="w-3.5 h-3.5 text-stone-500" />
                      Geser Horizontal (X)
                    </span>
                    <span className="font-mono text-stone-500">
                      {(designOffsetX * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-0.4"
                    max="0.4"
                    step="0.02"
                    value={designOffsetX}
                    onChange={(e) =>
                      setDesignOffset(parseFloat(e.target.value), designOffsetY)
                    }
                    className="w-full japandi-slider cursor-pointer"
                  />
                </div>

                {/* Offset Y Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-[#1C1917]">
                      <Move className="w-3.5 h-3.5 text-stone-500" />
                      Geser Vertikal (Y)
                    </span>
                    <span className="font-mono text-stone-500">
                      {(designOffsetY * 100).toFixed(0)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-0.4"
                    max="0.4"
                    step="0.02"
                    value={designOffsetY}
                    onChange={(e) =>
                      setDesignOffset(designOffsetX, parseFloat(e.target.value))
                    }
                    className="w-full japandi-slider cursor-pointer"
                  />
                </div>

                {/* Safe-Zone Guide Toggle */}
                <button
                  type="button"
                  onClick={() => setShowSafeZoneGuides(!showSafeZoneGuides)}
                  className={`w-full py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-between transition-all duration-200 cursor-pointer ${
                    showSafeZoneGuides
                      ? 'border-[#57534E] bg-[#F4F3F0] text-[#1C1917]'
                      : 'border-stone-200/80 bg-white text-stone-600 hover:bg-[#FBFBFA] hover:border-stone-300'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Crosshair className="w-4 h-4 text-stone-500" />
                    <span>Garis Bantu Area Cetak (Safe Zone 3D)</span>
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
                      showSafeZoneGuides
                        ? 'bg-[#1C1917] text-white'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {showSafeZoneGuides ? 'AKTIF' : 'MATI'}
                  </span>
                </button>

                {/* Reset Transforms */}
                <button
                  onClick={resetDesignTransforms}
                  className="w-full py-2.5 px-3 border border-stone-200/80 bg-white rounded-xl text-xs font-medium text-stone-600 hover:bg-[#F4F3F0] hover:text-[#1C1917] flex items-center justify-center gap-2 transition-all duration-200 mt-2 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Kembalikan ke Posisi Awal
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom Sticky Action / Checkout Bar */}
      <div className="p-4 bg-[#FBFBFA] border-t border-stone-200/80 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="text-stone-500 font-medium tracking-wide">Estimasi Harga Satuan</p>
            <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#1C1917] tracking-tight">
              Rp {pricing.unitTotal.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="text-right text-[11px] text-stone-500">
            <span>{selectedSize.name}</span>
            {rimTrim !== 'none' && <span> • Rim Trim</span>}
            {cart.length > 0 && (
              <p className="text-[#1C1917] font-semibold mt-0.5">
                {cart.length} varian di keranjang
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onAddToCart && (
            <button
              type="button"
              onClick={() => {
                onAddToCart();
                setAddedToCartToast(true);
                setTimeout(() => setAddedToCartToast(false), 1800);
              }}
              title="Tambahkan desain ini ke keranjang untuk pesan multi-varian"
              className="py-3.5 px-3.5 rounded-xl border border-stone-300/90 bg-white hover:bg-[#F4F3F0] text-[#1C1917] font-medium text-xs flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shrink-0"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{addedToCartToast ? 'Ditambah!' : '+ Keranjang'}</span>
            </button>
          )}

          <button
            id="btn-checkout"
            onClick={onCheckout}
            className="flex-1 py-3.5 px-4 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-white font-medium text-sm tracking-wide shadow-[0_4px_14px_rgba(28,25,23,0.12)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer z-10"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>
              {cart.length > 0
                ? `Checkout Keranjang (${cart.length})`
                : 'Pesan Sekarang / Checkout'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
