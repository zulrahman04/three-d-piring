'use client';

import React from 'react';
import { Eye, RotateCw, Sparkles, Compass, ZoomIn, Camera, FlipVertical } from 'lucide-react';
import { usePlateStore } from '@/store/usePlateStore';

export default function ViewportControls({
  onTakeSnapshot,
}: {
  onTakeSnapshot?: (width?: number, height?: number, label?: string) => void;
}) {
  const {
    cameraPreset,
    setCameraPreset,
    autoRotate,
    toggleAutoRotate,
    selectedSize,
    plateFinish,
  } = usePlateStore();

  return (
    <>
      {/* Top Left Floating Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="pointer-events-auto px-3 py-1.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Studio 3D Real-Time</span>
        </div>

        <div className="pointer-events-auto px-3 py-1.5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-xs text-zinc-600 dark:text-zinc-400 font-medium">
          {selectedSize.name} • {selectedSize.diameterCm} cm
        </div>
      </div>

      {/* Bottom Center Camera Angle Bar */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 p-1.5 rounded-2xl bg-white/85 dark:bg-zinc-900/85 backdrop-blur-lg border border-zinc-200/80 dark:border-zinc-800 shadow-xl overflow-x-auto max-w-[95%]">
        <button
          onClick={() => setCameraPreset('perspective')}
          className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            cameraPreset === 'perspective'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Sudut 3D</span>
        </button>

        <button
          onClick={() => setCameraPreset('top')}
          className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            cameraPreset === 'top'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Tampak Atas</span>
        </button>

        <button
          onClick={() => setCameraPreset('bottom')}
          className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            cameraPreset === 'bottom'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <FlipVertical className="w-3.5 h-3.5" />
          <span>Tampak Bawah</span>
        </button>

        <button
          onClick={() => setCameraPreset('close-up')}
          className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
            cameraPreset === 'close-up'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Detail</span>
        </button>

        <div className="w-[1px] h-4 bg-zinc-200 dark:bg-zinc-700 mx-0.5 shrink-0" />

        <button
          onClick={toggleAutoRotate}
          title={autoRotate ? 'Matikan Rotasi Otomatis' : 'Aktifkan Rotasi Otomatis'}
          className={`p-1.5 rounded-xl transition-all ${
            autoRotate
              ? 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400'
              : 'text-zinc-500 hover:text-zinc-800 dark:text-zinc-400'
          }`}
        >
          <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
        </button>

        {onTakeSnapshot && (
          <button
            onClick={() => onTakeSnapshot(2048, 2048, '2K-UltraHD')}
            title="Ambil Foto 3D Ultra HD (2048×2048 px)"
            className="p-1.5 rounded-xl text-zinc-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Floating Guidance Footnote */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none hidden md:block">
        <div className="px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-[11px] font-medium tracking-wide">
          🖱️ Tahan & Geser untuk Memutar • Scroll untuk Zoom
        </div>
      </div>
    </>
  );
}
