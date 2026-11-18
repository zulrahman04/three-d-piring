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
        <div className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-2 text-xs font-medium text-[#1C1917]">
          <div className="w-2 h-2 rounded-full bg-[#6B7F6E]" />
          <span>Studio 3D Real-Time</span>
        </div>

        <div className="pointer-events-auto px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-xs text-stone-600 font-medium">
          {selectedSize.name} • {selectedSize.diameterCm} cm
        </div>
      </div>

      {/* Bottom Center Camera Angle Bar */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 p-1.5 rounded-2xl bg-white/85 backdrop-blur-xl border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-x-auto max-w-[95%]">
        <button
          onClick={() => setCameraPreset('perspective')}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            cameraPreset === 'perspective'
              ? 'bg-[#1C1917] text-white shadow-xs'
              : 'text-stone-600 hover:text-[#1C1917] hover:bg-stone-100/80'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Sudut 3D</span>
        </button>

        <button
          onClick={() => setCameraPreset('top')}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            cameraPreset === 'top'
              ? 'bg-[#1C1917] text-white shadow-xs'
              : 'text-stone-600 hover:text-[#1C1917] hover:bg-stone-100/80'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Tampak Atas</span>
        </button>

        <button
          onClick={() => setCameraPreset('bottom')}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            cameraPreset === 'bottom'
              ? 'bg-[#1C1917] text-white shadow-xs'
              : 'text-stone-600 hover:text-[#1C1917] hover:bg-stone-100/80'
          }`}
        >
          <FlipVertical className="w-3.5 h-3.5" />
          <span>Tampak Bawah</span>
        </button>

        <button
          onClick={() => setCameraPreset('close-up')}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            cameraPreset === 'close-up'
              ? 'bg-[#1C1917] text-white shadow-xs'
              : 'text-stone-600 hover:text-[#1C1917] hover:bg-stone-100/80'
          }`}
        >
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Detail</span>
        </button>

        <div className="w-[1px] h-4 bg-stone-200/90 mx-1 shrink-0" />

        <button
          onClick={toggleAutoRotate}
          title={autoRotate ? 'Matikan Rotasi Otomatis' : 'Aktifkan Rotasi Otomatis'}
          className={`p-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
            autoRotate
              ? 'bg-stone-200/90 text-[#1C1917] border border-stone-300/80'
              : 'text-stone-500 hover:text-[#1C1917] hover:bg-stone-100/80'
          }`}
        >
          <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
        </button>

        {onTakeSnapshot && (
          <button
            onClick={() => onTakeSnapshot(2048, 2048, '2K-UltraHD')}
            title="Ambil Foto 3D Ultra HD (2048×2048 px)"
            className="p-1.5 rounded-xl text-stone-500 hover:text-[#1C1917] hover:bg-stone-100/80 transition-all duration-200 cursor-pointer"
          >
            <Camera className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Floating Guidance Footnote */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none hidden md:block">
        <div className="px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-stone-500 text-[11px] font-medium tracking-wide">
          Tahan &amp; Geser untuk Memutar • Scroll untuk Zoom
        </div>
      </div>
    </>
  );
}
