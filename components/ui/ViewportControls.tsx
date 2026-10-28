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
        <div className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-[#161a22]/80 backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-2 text-xs font-semibold text-white">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
          <span>Studio 3D Real-Time</span>
        </div>

        <div className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-[#161a22]/80 backdrop-blur-md border border-white/10 shadow-lg text-xs text-zinc-300 font-medium">
          {selectedSize.name} • {selectedSize.diameterCm} cm
        </div>
      </div>

      {/* Bottom Center Camera Angle Bar */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#161a22]/85 backdrop-blur-xl border border-white/10 shadow-2xl overflow-x-auto max-w-[95%]">
        <button
          onClick={() => setCameraPreset('perspective')}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            cameraPreset === 'perspective'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Sudut 3D</span>
        </button>

        <button
          onClick={() => setCameraPreset('top')}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            cameraPreset === 'top'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Tampak Atas</span>
        </button>

        <button
          onClick={() => setCameraPreset('bottom')}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            cameraPreset === 'bottom'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <FlipVertical className="w-3.5 h-3.5" />
          <span>Tampak Bawah</span>
        </button>

        <button
          onClick={() => setCameraPreset('close-up')}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            cameraPreset === 'close-up'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
              : 'text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Detail</span>
        </button>

        <div className="w-[1px] h-4 bg-zinc-700 mx-1 shrink-0" />

        <button
          onClick={toggleAutoRotate}
          title={autoRotate ? 'Matikan Rotasi Otomatis' : 'Aktifkan Rotasi Otomatis'}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            autoRotate
              ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
              : 'text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
        >
          <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
        </button>

        {onTakeSnapshot && (
          <button
            onClick={() => onTakeSnapshot(2048, 2048, '2K-UltraHD')}
            title="Ambil Foto 3D Ultra HD (2048×2048 px)"
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Floating Guidance Footnote */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none hidden md:block">
        <div className="px-3.5 py-1.5 rounded-full bg-[#161a22]/80 backdrop-blur-md border border-white/10 shadow-lg text-zinc-300 text-[11px] font-medium tracking-wide">
          🖱️ Tahan &amp; Geser untuk Memutar • Scroll untuk Zoom
        </div>
      </div>
    </>
  );
}
