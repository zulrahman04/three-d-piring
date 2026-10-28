'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  RotateCw,
  Eye,
  Camera,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Download,
} from 'lucide-react';
import { usePlateStore } from '@/store/usePlateStore';

export default function Navbar({
  onTakeSnapshot,
}: {
  onTakeSnapshot?: (width?: number, height?: number, label?: string) => void;
}) {
  const { autoRotate, toggleAutoRotate, setCameraPreset } = usePlateStore();
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
    <header className="w-full border-b border-zinc-200/80 bg-white/85 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <div className="w-6 h-6 rounded-full border-2 border-white/90 border-dashed flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight bg-gradient-to-r from-zinc-900 via-zinc-800 to-indigo-600 bg-clip-text text-transparent">
                CERAMIX 3D
              </span>
              <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200/50 text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                Studio
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 hidden sm:block">
              Kustomisasi Piring Porselen 3D & Pemesanan Satuan / Grosir
            </p>
          </div>
        </div>

        {/* Action Controls in Navbar */}
        <div className="flex items-center gap-2">
          {/* Auto-rotate Toggle */}
          <button
            onClick={toggleAutoRotate}
            title={autoRotate ? 'Hentikan Putaran 3D' : 'Putar 3D Otomatis'}
            className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold border transition-all ${
              autoRotate
                ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <RotateCw
              className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`}
            />
            <span className="hidden md:inline">
              {autoRotate ? 'Putar Aktif' : 'Putar 360°'}
            </span>
          </button>

          {/* Quick Snapshot with Resolution Dropdown */}
          {onTakeSnapshot && (
            <div className="relative" ref={menuRef}>
              <div className="flex items-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
                <button
                  onClick={() => onTakeSnapshot(2048, 2048, '2K-UltraHD')}
                  title="Unduh Foto 3D Ultra HD (2048×2048 px)"
                  className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 transition-all border-r border-zinc-200 dark:border-zinc-800"
                >
                  <Camera className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden sm:inline">Foto 2K Ultra HD</span>
                  <span className="sm:hidden">Foto 2K</span>
                </button>

                <button
                  onClick={() => setIsMenuOpen((prev) => !prev)}
                  title="Pilih Resolusi Snapshot"
                  className="py-1.5 px-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/70 transition-colors"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Resolution Dropdown Popover */}
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl p-1.5 z-50 text-left space-y-1 animate-in fade-in zoom-in-95">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    Pilih Kualitas Snapshot
                  </div>

                  <button
                    onClick={() => {
                      onTakeSnapshot(2048, 2048, '2K-UltraHD');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-xs hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-zinc-800 dark:text-zinc-200 transition-colors"
                  >
                    <div>
                      <p className="font-bold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        Ultra HD 2K (2048×2048)
                      </p>
                      <p className="text-[10px] text-zinc-400">Standar Studio (Rekomendasi)</p>
                    </div>
                    <Download className="w-3.5 h-3.5 text-indigo-600" />
                  </button>

                  <button
                    onClick={() => {
                      onTakeSnapshot(4096, 4096, '4K-Master');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-xs hover:bg-purple-50 dark:hover:bg-purple-950/40 text-zinc-800 dark:text-zinc-200 transition-colors"
                  >
                    <div>
                      <p className="font-bold flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                        <span className="w-2 h-2 rounded-full bg-purple-600" />
                        Master 4K (4096×4096)
                      </p>
                      <p className="text-[10px] text-zinc-400">Resolusi Ekstra Tajam / Cetak</p>
                    </div>
                    <Download className="w-3.5 h-3.5 text-purple-600" />
                  </button>

                  <button
                    onClick={() => {
                      onTakeSnapshot(1080, 1080, 'FullHD');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-xl text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-colors"
                  >
                    <div>
                      <p className="font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-zinc-400" />
                        Full HD (1080×1080)
                      </p>
                      <p className="text-[10px] text-zinc-400">Ukuran File Ringan</p>
                    </div>
                    <Download className="w-3.5 h-3.5 text-zinc-500" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Guarantee Badge */}
          <div className="hidden lg:flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Food-Grade Keramik</span>
          </div>
        </div>
      </div>
    </header>
  );
}
