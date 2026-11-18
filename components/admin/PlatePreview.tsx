'use client';

import React, { useState, useId } from 'react';
import dynamic from 'next/dynamic';
import { Download, Maximize2, Sparkles, Palette, Eye } from 'lucide-react';
import { RimPattern } from '@/types/plate';

// Dynamically import Three.js Plate3DViewer with ssr: false for pure 1:1 3D studio experience
const Plate3DViewer = dynamic(() => import('@/components/3d/Plate3DViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex items-center justify-center bg-zinc-950/60 rounded-2xl border border-zinc-800 text-zinc-400 text-xs">
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span>Memuat Studio 3D Resolusi Tinggi (1:1)...</span>
      </div>
    </div>
  ),
});

interface PlatePreviewProps {
  plateColorHex?: string;
  plateFinish?: string;
  rimTrimName?: string;
  rimTrimCustomHex?: string | null;
  rimPattern?: RimPattern;
  customRimPatternUrl?: string | null;
  customRimPatternRepeat?: number;
  customRimPatternMode?: 'repeat' | 'full';
  printCoverage?: string;
  designImageUrl?: string | null;
  designName?: string | null;
  designScale?: number;
  designRotation?: number;
  designOffsetX?: number;
  designOffsetY?: number;
  designOpacity?: number;
  snapshotRenderUrl?: string | null;
  diameterCm?: number | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Helper to resolve metallic rim trim configuration
function getRimTrimConfig(name?: string, customHex?: string | null) {
  if (!name) return null;
  const n = name.toLowerCase().trim();
  if (n === 'none' || n === 'polos' || n === 'tanpa trim' || n === '') return null;

  if (n.includes('gold') && !n.includes('rose')) {
    return {
      type: 'gold',
      label: '24K Gold Luster Rim',
      gradientId: 'gold',
      stops: [
        { offset: '0%', color: '#9e7416' },
        { offset: '25%', color: '#ffd76a' },
        { offset: '50%', color: '#e0b541' },
        { offset: '75%', color: '#fff0a8' },
        { offset: '100%', color: '#a8791c' },
      ],
    };
  }

  if (n.includes('silver') || n.includes('perak') || n.includes('platinum')) {
    return {
      type: 'silver',
      label: 'Platinum Silver Rim',
      gradientId: 'silver',
      stops: [
        { offset: '0%', color: '#888888' },
        { offset: '30%', color: '#ffffff' },
        { offset: '60%', color: '#dcdcdc' },
        { offset: '100%', color: '#999999' },
      ],
    };
  }

  if (n.includes('rose')) {
    return {
      type: 'rose',
      label: 'Rose Gold Rim',
      gradientId: 'rose',
      stops: [
        { offset: '0%', color: '#8f4b56' },
        { offset: '35%', color: '#ffd0d8' },
        { offset: '70%', color: '#d48d7c' },
        { offset: '100%', color: '#87424d' },
      ],
    };
  }

  if (n.includes('custom') || customHex || n.startsWith('#')) {
    const hex = customHex || (n.startsWith('#') ? n : '#4F46E5');
    return {
      type: 'custom',
      label: `Custom (${hex.toUpperCase()})`,
      gradientId: 'custom',
      stops: [
        { offset: '0%', color: hex },
        { offset: '40%', color: '#ffffff' },
        { offset: '70%', color: hex },
        { offset: '100%', color: '#222222' },
      ],
    };
  }

  return null;
}

// 1:1 Vector SVG Metallic Rim Overlay (derived mathematically from 3D Studio Three.js camera projection)
function SvgRimOverlay({
  rimConfig,
  baseId,
  size,
}: {
  rimConfig: NonNullable<ReturnType<typeof getRimTrimConfig>>;
  baseId: string;
  size?: 'sm' | 'md' | 'lg' | 'modal';
}) {
  const isSm = size === 'sm';
  const gradId = `${baseId}-${rimConfig.gradientId}-${size || 'def'}`;

  // Mathematical 1:1 Camera Projection from Three.js:
  // Torus Radius (1.64) / Plate Apex Radius (1.67) = 98.29% of radius -> rMain = 49.15 on 50 radius
  // Torus Tube (0.016 * 2) / Plate Diameter (3.34) = 0.959% of diameter -> strokeWidth = 0.96 on 100 diameter
  const rMain = isSm ? 48.6 : 49.15;
  const strokeWidth = isSm ? 1.6 : 0.96;

  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 w-full h-full pointer-events-none z-10"
    >
      <defs>
        <linearGradient id={gradId} x1="15%" y1="15%" x2="85%" y2="85%">
          {rimConfig.stops.map((stop, i) => (
            <stop key={i} offset={stop.offset} stopColor={stop.color} />
          ))}
        </linearGradient>
      </defs>

      {/* Main Metallic Luster Rim Band - 1:1 exact ratio with Three.js torus */}
      <circle
        cx="50"
        cy="50"
        r={rMain}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
}

export default function PlatePreview({
  plateColorHex = '#FAF7F2',
  plateFinish = 'glossy',
  rimTrimName = 'none',
  rimTrimCustomHex,
  rimPattern = 'none',
  customRimPatternUrl,
  customRimPatternRepeat = 24,
  customRimPatternMode = 'repeat',
  printCoverage = 'center',
  designImageUrl,
  designName,
  designScale = 1,
  designRotation = 0,
  designOffsetX = 0,
  designOffsetY = 0,
  designOpacity = 1,
  snapshotRenderUrl,
  diameterCm = 27,
  size = 'md',
  className = '',
}: PlatePreviewProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [viewMode, setViewMode] = useState<'3d' | 'motif'>('3d');
  const reactId = useId();
  const baseId = reactId.replace(/[^a-zA-Z0-9_-]/g, '_');

  // The artwork image source (either from designImageUrl or snapshotRenderUrl)
  const artworkSrc =
    designImageUrl || (snapshotRenderUrl && !snapshotRenderUrl.includes('placeholder') ? snapshotRenderUrl : null);

  // Resolved Rim Trim Configuration
  const rimConfig = getRimTrimConfig(rimTrimName, rimTrimCustomHex);

  // Determine container dimensions based on size prop
  const dimensions =
    size === 'sm'
      ? 'w-12 h-12 sm:w-14 sm:h-14'
      : size === 'lg'
      ? 'w-64 h-64 sm:w-72 sm:h-72'
      : 'w-24 h-24';

  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  // Safe color fallback
  const safeBgColor = plateColorHex && plateColorHex.startsWith('#') ? plateColorHex : '#FAF7F2';

  return (
    <>
      {/* PLATE CONTAINER (2D Exact Camera Projection) */}
      <div className={`relative group shrink-0 ${dimensions} ${className}`}>
        <div
          className="w-full h-full rounded-full relative flex items-center justify-center shadow-xl transition-all duration-300 group-hover:scale-[1.03] overflow-hidden"
          style={{
            backgroundColor: safeBgColor,
            boxShadow:
              '0 8px 24px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -3px 8px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.12)',
          }}
        >
          {/* 1. Vector Metallic Rim Trim (Exact 0.96% ratio at 98.3% radius) */}
          {rimConfig && <SvgRimOverlay rimConfig={rimConfig} baseId={baseId} size={size} />}

          {/* 2. Recessed Inner Well (Lekukan Cekung Piring Keramik - 62.8% radius) */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: '18.6%',
              boxShadow: 'inset 0 3px 8px rgba(0,0,0,0.16), inset 0 -2px 4px rgba(255,255,255,0.22)',
              border: '1px solid rgba(0,0,0,0.05)',
            }}
          />

          {/* 3. Ceramic Glaze Specular Highlight */}
          {plateFinish === 'glossy' && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at 35% 28%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.08) 35%, transparent 60%)',
              }}
            />
          )}

          {/* 4. Ceramic Glaze Matte Soft Diffusion */}
          {plateFinish === 'matte' && (
            <div
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.2) 100%)',
              }}
            />
          )}

          {/* 5. Custom Artwork / Motif on Glaze */}
          {artworkSrc ? (
            <div
              className="absolute flex items-center justify-center rounded-full pointer-events-none transition-transform"
              style={{
                inset: (printCoverage || '').toLowerCase().trim() === 'full' ? '1.8%' : '18.6%',
                transform: `rotate(${designRotation}deg) scale(${designScale}) translate(${designOffsetX * 100}%, ${-designOffsetY * 100}%)`,
                opacity: designOpacity,
              }}
            >
              <img
                src={artworkSrc}
                alt={designName || 'Custom Artwork'}
                className="w-full h-full object-contain filter drop-shadow-sm pointer-events-none select-none"
              />
            </div>
          ) : (
            <div className="text-[9px] text-zinc-500/60 font-mono select-none">POLOS</div>
          )}

          {/* Hover Overlay with Perbesar Button */}
          {size !== 'sm' && (
            <button
              type="button"
              onClick={() => setIsZoomed(true)}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-1.5 backdrop-blur-[2px] cursor-pointer z-20"
            >
              <Maximize2 className="w-4 h-4 text-amber-400" />
              <span>Buka 3D (1:1)</span>
            </button>
          )}
        </div>
      </div>

      {/* FULLSCREEN REAL 3D THREE.JS STUDIO MODAL (100% 1:1 WITH STUDIO) */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in"
          onClick={() => setIsZoomed(false)}
        >
          <div
            className="relative max-w-2xl w-full bg-zinc-900 border border-zinc-700/80 rounded-3xl p-6 shadow-2xl text-center flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-base">Studio Inspeksi 3D Piring (1:1 Asli)</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/20 text-amber-400 border border-amber-400/30">
                    REAL-TIME 3D
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-zinc-400">
                  <span>Diameter {diameterCm} cm</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-zinc-200">
                    <span
                      className="w-3 h-3 rounded-full border border-zinc-600 inline-block"
                      style={{ backgroundColor: safeBgColor }}
                    />
                    Glasir {safeBgColor} ({plateFinish})
                  </span>
                  <span>•</span>
                  <span className="capitalize text-amber-400 font-medium">
                    {rimConfig ? rimConfig.label : 'Tanpa Rim (Polos)'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsZoomed(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* View Mode Toggle: 3D Studio 1:1 vs Motif Decal Saja */}
            <div className="flex items-center justify-center gap-2 mb-3">
              <button
                type="button"
                onClick={() => setViewMode('3d')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === '3d'
                    ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Piring 3D Asli (1:1 Studio)</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('motif')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'motif'
                    ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>File Motif Cetak Decal Saja</span>
              </button>
            </div>

            {/* Main Stage */}
            <div className={`relative w-full h-[420px] rounded-2xl border overflow-hidden flex items-center justify-center ${viewMode === '3d' ? 'bg-[#F4F3F0] border-stone-200/80' : 'bg-[#111318] border-zinc-700/60'}`}>
              {viewMode !== '3d' && (
                <>
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_70%_at_50%_46%,_#2e3442_0%,_#1c202a_48%,_#111319_80%,_#090a0d_100%)] pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#08090d]/90 via-[#0e1015]/40 to-transparent pointer-events-none" />
                  <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.7)] pointer-events-none" />
                </>
              )}
              {viewMode === '3d' ? (
                /* 1. Real 1:1 Three.js 3D Studio Canvas */
                <Plate3DViewer
                  plateColor={safeBgColor}
                  plateFinish={plateFinish}
                  rimTrim={rimTrimName}
                  rimTrimCustomColor={rimTrimCustomHex}
                  rimPattern={rimPattern}
                  customRimPatternUrl={customRimPatternUrl}
                  customRimPatternRepeat={customRimPatternRepeat}
                  customRimPatternMode={customRimPatternMode}
                  printCoverage={printCoverage}
                  designUrl={artworkSrc}
                  designScale={designScale}
                  designRotation={designRotation}
                  designOffsetX={designOffsetX}
                  designOffsetY={designOffsetY}
                  designOpacity={designOpacity}
                  diameterCm={Number(diameterCm) || 27}
                  initialPreset="top"
                />
              ) : (
                /* 2. Isolated Motif Decal on Checkerboard / Transparent */
                <div className="max-w-[340px] max-h-[340px] flex items-center justify-center p-4">
                  {artworkSrc ? (
                    <img
                      src={artworkSrc}
                      alt="Isolated Decal Motif"
                      className="max-h-[300px] w-auto object-contain filter drop-shadow-xl"
                    />
                  ) : (
                    <div className="text-zinc-500 text-xs">Tidak ada motif khusus (Piring Polos)</div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Action buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              <div className="text-[11px] text-zinc-500 text-left">
                💡 Rendering menggunakan Three.js WebGL yang persis sama dengan Studio Pelanggan
              </div>
              {artworkSrc && (
                <button
                  type="button"
                  onClick={() => downloadImage(artworkSrc, `ceramix-motif-${Date.now()}.png`)}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 ml-auto"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Motif Decal</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
