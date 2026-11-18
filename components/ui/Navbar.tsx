'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  RotateCw,
  Eye,
  Camera,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Download,
  PackageSearch,
  ShoppingCart,
} from 'lucide-react';
import { usePlateStore } from '@/store/usePlateStore';

export default function Navbar({
  onTakeSnapshot,
}: {
  onTakeSnapshot?: (width?: number, height?: number, label?: string) => void;
}) {
  const { autoRotate, toggleAutoRotate, cart, setOrderModalOpen } = usePlateStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full border-b border-stone-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-40 transition-colors duration-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-[#1C1917] flex items-center justify-center text-[#FCFBF9] shadow-[0_4px_12px_rgba(28,25,23,0.08)]">
            <div className="w-5 h-5 rounded-full border border-[#FCFBF9]/70 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-[#FCFBF9]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-[family-name:var(--font-display)] font-semibold text-base sm:text-lg tracking-[0.06em] text-[#1C1917]">
                CERAMIX 3D
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#F4F3F0] border border-stone-200/80 text-[10px] font-medium text-stone-600 uppercase tracking-[0.12em]">
                Studio
              </span>
            </div>
            <p className="text-[11px] text-stone-500 hidden sm:block tracking-wide">
              Atelier Porselen Kustom 3D &amp; Pemesanan Satuan / Grosir
            </p>
          </div>
        </div>

        {/* Action Controls in Navbar */}
        <div className="flex items-center gap-2">
          {/* Auto-rotate Toggle */}
          <button
            onClick={toggleAutoRotate}
            title={autoRotate ? 'Hentikan Putaran 3D' : 'Putar 3D Otomatis'}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-medium border transition-all duration-200 cursor-pointer ${
              autoRotate
                ? 'bg-[#1C1917] border-[#1C1917] text-white shadow-xs'
                : 'bg-white border-stone-200/80 text-stone-700 hover:bg-stone-50 hover:text-[#1C1917]'
            }`}
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : 'text-stone-500'}`}
            />
            <span className="hidden md:inline">
              {autoRotate ? 'Putar Aktif' : 'Putar 360°'}
            </span>
          </button>

          {/* Quick Snapshot with Resolution Dropdown */}
          {onTakeSnapshot && (
            <div className="relative" ref={menuRef}>
              <div className="flex items-center rounded-xl bg-white border border-stone-200/80 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
                <button
                  onClick={() => onTakeSnapshot(2048, 2048, '2K-UltraHD')}
                  title="Unduh Foto 3D Ultra HD (2048×2048 px)"
                  className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium text-stone-700 hover:bg-stone-50 hover:text-[#1C1917] transition-all duration-200 border-r border-stone-200/80 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-stone-600" />
                  <span className="hidden sm:inline">Foto 2K Ultra HD</span>
                  <span className="sm:hidden">Foto 2K</span>
                </button>

                <button
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  title="Pilih Resolusi Snapshot"
                  className="py-1.5 px-1.5 text-stone-500 hover:text-[#1C1917] hover:bg-stone-50 transition-colors duration-200 cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Resolution Dropdown Popover */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-1.5 z-50 text-left space-y-1 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1.5 text-[10px] font-semibold text-stone-400 uppercase tracking-[0.1em]">
                    Pilih Kualitas Snapshot
                  </div>

                  <button
                    onClick={() => {
                      onTakeSnapshot(2048, 2048, '2K-UltraHD');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-xs hover:bg-[#F4F3F0]/80 text-[#1C1917] transition-colors duration-150 cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold flex items-center gap-1.5 text-[#1C1917]">
                        <span className="w-2 h-2 rounded-full bg-[#1C1917]" />
                        Ultra HD 2K (2048×2048)
                      </p>
                      <p className="text-[10px] text-stone-500">Standar Studio (Rekomendasi)</p>
                    </div>
                    <Download className="w-3.5 h-3.5 text-stone-600" />
                  </button>

                  <button
                    onClick={() => {
                      onTakeSnapshot(4096, 4096, '4K-Master');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-xs hover:bg-[#F4F3F0]/80 text-[#1C1917] transition-colors duration-150 cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold flex items-center gap-1.5 text-[#1C1917]">
                        <span className="w-2 h-2 rounded-full bg-stone-500" />
                        Master 4K (4096×4096)
                      </p>
                      <p className="text-[10px] text-stone-500">Resolusi Ekstra Tajam / Cetak</p>
                    </div>
                    <Download className="w-3.5 h-3.5 text-stone-600" />
                  </button>

                  <button
                    onClick={() => {
                      onTakeSnapshot(1080, 1080, 'FullHD');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-xs hover:bg-[#F4F3F0]/80 text-[#1C1917] transition-colors duration-150 cursor-pointer"
                  >
                    <div>
                      <p className="font-medium flex items-center gap-1.5 text-stone-700">
                        <span className="w-2 h-2 rounded-full bg-stone-400" />
                        Full HD (1080×1080)
                      </p>
                      <p className="text-[10px] text-stone-500">Ukuran File Ringan</p>
                    </div>
                    <Download className="w-3.5 h-3.5 text-stone-500" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Track Order Link */}
          <Link
            href="/track"
            title="Lacak Status Pesanan & Upload Bukti Bayar"
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-medium border border-stone-200/80 bg-white text-stone-700 hover:bg-stone-50 hover:text-[#1C1917] transition-all duration-200"
          >
            <PackageSearch className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">Lacak Pesanan</span>
          </Link>

          {/* Cart Button when multi-item cart has items */}
          {cart.length > 0 && (
            <button
              onClick={() => setOrderModalOpen(true)}
              title="Buka Keranjang Pesanan"
              className="relative flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-medium bg-[#1C1917] hover:bg-stone-800 text-white shadow-xs transition-all duration-200 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Keranjang</span>
              <span className="px-1.5 py-0.2 rounded-full bg-stone-100 text-[#1C1917] text-[10px] font-semibold">
                {cart.length}
              </span>
            </button>
          )}

          {/* Guarantee Badge */}
          <div className="hidden lg:flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#FBFBFA] border border-stone-200/80 text-[11px] font-medium text-stone-600 tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5 text-[#6B7F6E]" />
            <span>Food-Grade Keramik</span>
          </div>
        </div>
      </div>
    </header>
  );
}
