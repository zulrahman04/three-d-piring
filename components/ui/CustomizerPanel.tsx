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
  Pipette,
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

export default function CustomizerPanel({
  onCheckout,
}: {
  onCheckout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'design' | 'plate' | 'adjust'>('design');
  const [isDragging, setIsDragging] = useState(false);
  const [rimPatternCategory, setRimPatternCategory] = useState<'Semua' | 'Garis Logam' | 'Batik Nusantara' | 'Klasik & Mewah' | 'Kustom'>('Semua');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rimPatternFileInputRef = useRef<HTMLInputElement>(null);

  const {
    availableSizes,
    loadMasterSizes,
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
    calculateTotalPrice,
  } = usePlateStore();

  const pricing = calculateTotalPrice();

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
    loadMasterSizes();
  }, [loadMasterSizes]);

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

  // Handle file upload from user device as persistent Data URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (PNG, JPEG, WEBP, atau SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDesignImage(reader.result, file.name);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCustomRimPatternUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar yang valid (PNG, JPEG, WEBP, atau SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomRimPatternUrl(reader.result, file.name);
      }
    };
    reader.readAsDataURL(file);
    // Reset file input so re-selecting same file triggers onChange
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setDesignImage(reader.result, file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/95 backdrop-blur-xl border border-zinc-200/80 rounded-3xl shadow-xl overflow-hidden transition-all">
      {/* Panel Navigation Tabs */}
      <div className="flex items-center p-2 bg-zinc-100/80 border-b border-zinc-200 m-3 rounded-2xl gap-1">
        <button
          onClick={() => setActiveTab('design')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'design'
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Desain</span>
        </button>

        <button
          onClick={() => setActiveTab('plate')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'plate'
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Palette className="w-4 h-4 text-blue-500" />
          <span>Piring</span>
        </button>

        <button
          onClick={() => setActiveTab('adjust')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'adjust'
              ? 'bg-white text-zinc-900 shadow-sm'
              : 'text-zinc-500 hover:text-zinc-800'
          }`}
        >
          <Sliders className="w-4 h-4 text-emerald-500" />
          <span>Atur Posisi</span>
        </button>
      </div>

      {/* Tab Contents (Scrollable) */}
      <div className="flex-1 overflow-y-auto px-5 py-2 space-y-6 text-zinc-800 dark:text-zinc-200 custom-scrollbar">
        {/* ==================== TAB 1: DESAIN & GAMBAR ==================== */}
        {activeTab === 'design' && (
          <div className="space-y-6">
            {/* Upload Box */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5">
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
                className={`relative flex flex-col items-center justify-center p-5 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600 bg-zinc-50/50 dark:bg-zinc-800/40'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-2 shadow-inner">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 text-center">
                  Klik untuk unggah atau seret gambar ke sini
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                  Mendukung PNG transparan, JPG, WebP, SVG (Maks 10MB)
                </p>
              </div>

              {/* Uploaded File Pill & Clear */}
              {designUrl && (
                <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/70 border border-zinc-200/80 dark:border-zinc-700/60">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={designUrl}
                        alt="Preview Desain"
                        className="w-full h-full object-contain p-0.5"
                      />
                    </div>
                    <span className="text-xs font-medium truncate max-w-[180px]">
                      {designName || 'Desain Aktif'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearDesign();
                    }}
                    title="Hapus Desain"
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Presets Gallery */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Pilihan Template Desain
                </label>
                <span className="text-[11px] text-zinc-400 dark:text-zinc-500">
                  Siap Pakai
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {DESIGN_PRESETS.map((preset) => {
                  const isSelected = designName === preset.name;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => setDesignImage(preset.dataUrl, preset.name)}
                      className={`relative flex items-center gap-2.5 p-2 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 ring-2 ring-indigo-500/20'
                          : 'border-zinc-200 dark:border-zinc-700/80 hover:border-zinc-300 dark:hover:border-zinc-600 bg-white dark:bg-zinc-800/40'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-700/50 flex-shrink-0 overflow-hidden flex items-center justify-center p-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preset.dataUrl}
                          alt={preset.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                          {preset.name}
                        </p>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                          {preset.category}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0">
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
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2">
                Cakupan Area Cetak
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPrintCoverage('center')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    printCoverage === 'center'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Cekungan Tengah (Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setPrintCoverage('full')}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    printCoverage === 'full'
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Seluruh Permukaan
                </button>
              </div>
            </div>

            {/* Logo Placement Selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Posisi Penempatan Logo / Motif
                </label>
                {logoPlacement === 'top-rim' && (
                  <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300/80 dark:border-amber-700">
                    Gaya Hotel Bintang 5
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setLogoPlacement('center')}
                  className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                    logoPlacement === 'center'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                      : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                  }`}
                >
                  <p className="text-xs font-bold">Di Tengah</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Dasar Piring</p>
                </button>

                <button
                  type="button"
                  onClick={() => setLogoPlacement('top-rim')}
                  className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                    logoPlacement === 'top-rim'
                      ? 'border-amber-500 bg-amber-50/70 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 ring-2 ring-amber-500/20'
                      : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                  }`}
                >
                  <p className="text-xs font-bold">Bibir Jam 12</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Bibir Atas Piring</p>
                </button>

                <button
                  type="button"
                  onClick={() => setLogoPlacement('free')}
                  className={`py-2.5 px-2 rounded-xl border text-center transition-all cursor-pointer ${
                    logoPlacement === 'free'
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 ring-2 ring-indigo-500/20'
                      : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300'
                  }`}
                >
                  <p className="text-xs font-bold">Bebas Geser</p>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Atur Posisi Bebas</p>
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
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5">
                Ukuran Piring Keramik
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(availableSizes && availableSizes.length > 0 ? availableSizes : PLATE_SIZES).map((size) => {
                  const isSelected = selectedSize.id === size.id;
                  return (
                    <button
                      key={size.id}
                      onClick={() => setSize(size)}
                      className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">
                          {size.name}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 ml-1" />
                        )}
                      </div>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Ø {size.diameterCm} cm
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
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
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Warna Piring Keramik
                </label>
                <span className="text-xs text-zinc-500 font-medium">
                  {PLATE_COLORS.find((c) => c.hex.toLowerCase() === plateColor.toLowerCase())?.name || 'Warna Kustom'}
                </span>
              </div>

              {/* Preset Color Swatches */}
              <div className="grid grid-cols-7 gap-2">
                {PLATE_COLORS.map((color) => {
                  const isSelected = plateColor.toLowerCase() === color.hex.toLowerCase();
                  return (
                    <button
                      key={color.id}
                      onClick={() => setPlateColor(color.hex)}
                      title={`${color.name}: ${color.description}`}
                      className={`group relative w-full aspect-square rounded-xl transition-transform hover:scale-110 flex items-center justify-center border ${
                        isSelected
                          ? 'border-indigo-600 ring-2 ring-indigo-500/50 scale-105'
                          : 'border-zinc-300/80 dark:border-zinc-600'
                      }`}
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && (
                        <Check
                          className={`w-3.5 h-3.5 stroke-[3] ${
                            ['#FAF7F2', '#E8CCA4'].includes(color.hex)
                              ? 'text-zinc-800'
                              : 'text-white'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Flexible Color Picker & Direct Hex Input for Base Plate */}
              <div className="mt-3 flex items-center gap-2.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
                <div className="relative flex-shrink-0 w-8 h-8 rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-600 shadow-xs cursor-pointer group">
                  <input
                    type="color"
                    value={plateColor.startsWith('#') ? plateColor : '#FDFBF7'}
                    onChange={handlePlateColorPicker}
                    className="absolute -inset-2 w-12 h-12 cursor-pointer opacity-0"
                    title="Buka Palet Warna Bebas"
                  />
                  <div
                    className="w-full h-full flex items-center justify-center transition-transform group-hover:scale-105"
                    style={{ backgroundColor: plateColor }}
                  >
                    <Pipette className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-200 mix-blend-difference drop-shadow" />
                  </div>
                </div>

                <div className="flex-1 flex items-center gap-1.5 min-w-0">
                  <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                    HEX:
                  </span>
                  <input
                    type="text"
                    value={customPlateHex}
                    onChange={(e) => handlePlateHexChange(e.target.value)}
                    placeholder="#FDFBF7"
                    maxLength={7}
                    className="w-full py-1 px-2.5 text-xs font-mono font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-medium px-1 flex-shrink-0">
                  Input Bebas
                </span>
              </div>
            </div>

            {/* Finish Texture Selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2.5">
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
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className="text-[10px] text-zinc-400 mt-0.5">{item.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rim Trim Selection */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Aksen Pinggiran (Metallic Rim Trim)
                </label>
                {rimTrim === 'custom' && (
                  <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
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
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-1 ring-amber-500/40'
                          : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {displayHex !== 'transparent' ? (
                          <div
                            className="w-3.5 h-3.5 rounded-full border border-black/20 shadow-xs"
                            style={{ backgroundColor: displayHex }}
                          />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-dashed border-zinc-400" />
                        )}
                        <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate">
                          {trim.name.split(' (')[0]}
                        </span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-semibold flex-shrink-0">
                        {trim.price > 0 ? `+Rp ${(trim.price / 1000).toFixed(0)}k` : 'Gratis'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Flexible Custom Color Input & Palette Chips for Rim Trim */}
              {rimTrim === 'custom' && (
                <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/60 via-indigo-50/30 to-purple-50/40 dark:from-amber-950/20 dark:via-zinc-800/60 dark:to-indigo-950/30 border border-amber-300/60 dark:border-amber-800/50 space-y-3 transition-all animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Pilih Warna Aksen Bebas
                    </span>
                    <span className="text-[10px] font-semibold text-zinc-500">
                      Bisa Input Kode HEX
                    </span>
                  </div>

                  {/* Color Picker & Hex Input for Rim Trim */}
                  <div className="flex items-center gap-2.5">
                    <div className="relative flex-shrink-0 w-9 h-9 rounded-xl overflow-hidden border-2 border-white dark:border-zinc-700 shadow-md cursor-pointer group">
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
                      <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 tracking-wider">
                        HEX:
                      </span>
                      <input
                        type="text"
                        value={customRimHex}
                        onChange={(e) => handleRimHexChange(e.target.value)}
                        placeholder="#D4AF37"
                        maxLength={7}
                        className="w-full py-1.5 px-2.5 text-xs font-mono font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Quick Color Palette Shortcuts for Rim */}
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
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
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-medium transition-all ${
                            rimTrimCustomColor.toLowerCase() === preset.hex.toLowerCase()
                              ? 'border-amber-500 bg-white dark:bg-zinc-800 font-bold shadow-xs'
                              : 'border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-800/40 hover:bg-white'
                          }`}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span className="text-zinc-700 dark:text-zinc-300">{preset.name}</span>
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
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  Motif & List Bibir Piring (Rim Pattern)
                </label>
                <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
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
                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                      rimPatternCategory === cat
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold shadow-xs'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 hover:bg-zinc-200'
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
                        className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 ring-2 ring-indigo-500/20'
                            : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/40 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                              {pattern.name}
                            </span>
                            {pattern.badge && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                                {pattern.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                            {pattern.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                            {pattern.price > 0 ? `+Rp ${(pattern.price / 1000).toFixed(0)}k` : 'Gratis'}
                          </span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </button>

                      {/* Custom Rim Pattern Upload & Controls Panel - Expands directly below Custom button */}
                      {isCustom && isSelected && (
                        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/40 to-amber-50/30 dark:from-indigo-950/30 dark:via-zinc-800/60 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800/50 space-y-3.5 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                              Pengaturan Motif Kustom Bibir
                            </span>
                            <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
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
                                className="p-4 border-2 border-dashed border-indigo-300 dark:border-indigo-700/70 rounded-xl bg-white/70 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800 transition-all cursor-pointer text-center group"
                              >
                                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center mb-2 group-hover:scale-105 transition-transform">
                                  <Upload className="w-5 h-5" />
                                </div>
                                <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                                  Klik / Seret Gambar Motif (PNG / SVG)
                                </p>
                                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                  Unggah 1 potongan batik/ornamen. Sistem akan mengulang 360° mengelilingi bibir piring.
                                </p>
                              </div>

                              {/* Quick Sample Presets */}
                              <div className="pt-1">
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                                  Atau Coba Contoh Motif Siap Pakai:
                                </span>
                                <div className="grid grid-cols-3 gap-1.5">
                                  {SAMPLE_RIM_MOTIFS.map((sample) => (
                                    <button
                                      key={sample.id}
                                      type="button"
                                      onClick={() => setCustomRimPatternUrl(sample.dataUrl, sample.name)}
                                      className="p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-800/80 hover:border-indigo-400 hover:bg-white dark:hover:bg-zinc-800 transition-all text-center group cursor-pointer shadow-2xs"
                                    >
                                      <div className="w-8 h-8 mx-auto mb-1 rounded-lg bg-zinc-50 dark:bg-zinc-700/50 p-1 flex items-center justify-center">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                          src={sample.dataUrl}
                                          alt={sample.name}
                                          className="w-full h-full object-contain group-hover:scale-110 transition-transform"
                                        />
                                      </div>
                                      <p className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300 truncate">
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
                              <div className="flex items-center justify-between gap-2 p-2 bg-white/90 dark:bg-zinc-800/90 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-700 overflow-hidden flex-shrink-0 border border-zinc-300 dark:border-zinc-600 flex items-center justify-center p-1">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={customRimPatternUrl}
                                      alt="Motif Kustom"
                                      className="w-full h-full object-contain"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                                      {customRimPatternName || 'Motif Bibir Kustom'}
                                    </p>
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                      Aktif pada Bibir 360°
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => rimPatternFileInputRef.current?.click()}
                                    className="px-2 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors cursor-pointer"
                                  >
                                    Ganti
                                  </button>
                                  <button
                                    type="button"
                                    onClick={clearCustomRimPattern}
                                    title="Hapus motif kustom"
                                    className="p-1.5 text-zinc-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Mode Selector */}
                              <div>
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-1.5">
                                  Metode Penempatan Motif:
                                </span>
                                <div className="grid grid-cols-2 gap-1.5 p-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700">
                                  <button
                                    type="button"
                                    onClick={() => setCustomRimPatternMode('repeat')}
                                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                      customRimPatternMode === 'repeat'
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                                    }`}
                                  >
                                    Ulang Melingkar (Repeat)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setCustomRimPatternMode('full')}
                                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                      customRimPatternMode === 'full'
                                        ? 'bg-indigo-600 text-white shadow-xs'
                                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                                    }`}
                                  >
                                    Cincin Utuh (Full Ring)
                                  </button>
                                </div>
                              </div>

                              {/* Repeat Count Slider & Quick Presets (When Mode is 'repeat') */}
                              {customRimPatternMode === 'repeat' ? (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                      Kerapatan / Jumlah Pengulangan:
                                    </span>
                                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-700">
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
                                    className="w-full accent-indigo-600 cursor-pointer"
                                  />

                                  {/* Quick Repeat Presets */}
                                  <div className="flex items-center gap-1.5 pt-1">
                                    <span className="text-[10px] text-zinc-400 font-semibold mr-1">Preset:</span>
                                    {[12, 18, 24, 32, 40, 48].map((count) => (
                                      <button
                                        key={count}
                                        type="button"
                                        onClick={() => setCustomRimPatternRepeat(count)}
                                        className={`flex-1 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                                          customRimPatternRepeat === count
                                            ? 'bg-indigo-600 border-indigo-600 text-white'
                                            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-indigo-400'
                                        }`}
                                      >
                                        {count}x
                                      </button>
                                    ))}
                                  </div>
                                  <p className="text-[10px] text-zinc-400 dark:text-zinc-500 pt-0.5">
                                    Tip: 24x ideal untuk motif proporsional. 36x-48x untuk motif rapat/halus.
                                  </p>
                                </div>
                              ) : (
                                <div className="p-2.5 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-700 text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
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
                <ImageIcon className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                  Belum ada motif yang dipilih
                </p>
                <p className="text-xs text-zinc-400 mt-1 mb-4">
                  Unggah gambar atau pilih template di tab Desain untuk mengatur posisi.
                </p>
                <button
                  onClick={() => setActiveTab('design')}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors"
                >
                  Pilih Desain Sekarang
                </button>
              </div>
            ) : (
              <>
                {/* Active Placement Notice */}
                {logoPlacement === 'top-rim' && (
                  <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300/70 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      Posisi Aktif: Bibir Atas (Jam 12)
                    </span>
                    <button
                      type="button"
                      onClick={() => setLogoPlacement('center')}
                      className="text-[11px] underline font-bold text-amber-700 dark:text-amber-300 cursor-pointer"
                    >
                      Pindah ke Tengah
                    </button>
                  </div>
                )}

                {/* Scale Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                      <ZoomIn className="w-3.5 h-3.5 text-indigo-500" />
                      Skala Cetakan (Zoom)
                    </span>
                    <span className="font-mono text-zinc-500">
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
                    className="w-full accent-indigo-600 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Rotation Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                      <RotateCw className="w-3.5 h-3.5 text-indigo-500" />
                      Rotasi Sudut
                    </span>
                    <span className="font-mono text-zinc-500">
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
                    className="w-full accent-indigo-600 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Offset X Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                      <Move className="w-3.5 h-3.5 text-indigo-500" />
                      Geser Horizontal (X)
                    </span>
                    <span className="font-mono text-zinc-500">
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
                    className="w-full accent-indigo-600 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Offset Y Slider */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="flex items-center gap-1.5 font-semibold text-zinc-700 dark:text-zinc-300">
                      <Move className="w-3.5 h-3.5 text-indigo-500" />
                      Geser Vertikal (Y)
                    </span>
                    <span className="font-mono text-zinc-500">
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
                    className="w-full accent-indigo-600 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Reset Transforms */}
                <button
                  onClick={resetDesignTransforms}
                  className="w-full py-2 px-3 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center gap-2 transition-colors mt-2"
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
      <div className="p-4 bg-zinc-50/90 border-t border-zinc-200 flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <div>
            <p className="text-zinc-500 font-medium">Estimasi Harga Satuan</p>
            <p className="text-xl font-black text-zinc-900 tracking-tight">
              Rp {pricing.unitTotal.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="text-right text-[11px] text-zinc-400">
            <span>{selectedSize.name}</span>
            {rimTrim !== 'none' && <span> • Rim Trim</span>}
          </div>
        </div>

        <button
          id="btn-checkout"
          onClick={onCheckout}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer z-10"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Pesan Sekarang / Checkout</span>
        </button>
      </div>
    </div>
  );
}
