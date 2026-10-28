'use client';

import React, { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import PlateModel, { PlateModelProps } from './PlateModel';
import { StudioBackdrop, StudioLighting, PlateSubjectRotator } from './PlateCanvas';
import { Eye, RotateCw, Compass, ZoomIn, FlipVertical, Camera } from 'lucide-react';
import { PlateSize } from '@/types/plate';

export interface Plate3DViewerProps extends PlateModelProps {
  className?: string;
  initialPreset?: 'perspective' | 'top' | 'bottom' | 'close-up';
  plateColorHex?: string;
  rimTrimName?: string;
  rimTrimCustomHex?: string | null;
  designImageUrl?: string | null;
  plateSizeGeo?: Partial<PlateSize>;
  selectedSize?: Partial<PlateSize>;
  onTakeSnapshot?: (dataUrl: string) => void;
}

export default function Plate3DViewer({
  className = '',
  initialPreset = 'perspective',
  onTakeSnapshot,
  ...props
}: Plate3DViewerProps) {
  const [cameraPreset, setCameraPreset] = useState<'perspective' | 'top' | 'bottom' | 'close-up'>(initialPreset);
  const [autoRotate, setAutoRotate] = useState(false);
  const captureFnRef = useRef<((width?: number, height?: number) => string) | null>(null);

  // Map alternative / legacy prop names from admin dashboard & orders
  const plateColor = props.plateColor || props.plateColorHex;
  const rimTrim = props.rimTrim || props.rimTrimName;
  const rimTrimCustomColor = props.rimTrimCustomColor !== undefined ? props.rimTrimCustomColor : props.rimTrimCustomHex;
  const designUrl = props.designUrl !== undefined ? props.designUrl : props.designImageUrl;
  const diameterCm = Number(props.diameterCm) || 27;
  const outerRadius = props.selectedSize?.outerRadius || props.plateSizeGeo?.outerRadius || diameterCm / 20;

  const handleCaptureReady = (captureFn: (width?: number, height?: number) => string) => {
    captureFnRef.current = captureFn;
  };

  const handleCapture = () => {
    if (!captureFnRef.current) return;
    try {
      const dataUrl = captureFnRef.current(2048, 2048);
      if (onTakeSnapshot) {
        onTakeSnapshot(dataUrl);
      } else {
        const link = document.createElement('a');
        link.download = `review-3d-plate-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Error capturing 3D snapshot:', err);
    }
  };

  return (
    <div
      className={`relative w-full h-full min-h-[440px] flex flex-col items-center select-none rounded-2xl overflow-hidden border border-zinc-700/60 shadow-2xl bg-[#0e1015] bg-[url('/studio-dark-backdrop.jpg')] bg-cover bg-center ${className}`}
    >
      {/* Subtle perimeter vignette to frame the 3D studio */}
      <div className="absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.7)] pointer-events-none z-10" />

      {/* Floating Status Badge Top Left */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="px-3.5 py-1.5 rounded-full bg-[#161a22]/85 backdrop-blur-md border border-white/10 shadow-lg flex items-center gap-2 text-xs font-semibold text-white">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
          <span>Studio 3D Kalibrasi Porselen (1:1)</span>
        </div>
      </div>

      {/* Camera Angle & Control Bar Bottom Center (Matching ViewportControls & calibrated for clear depth) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#161a22]/90 backdrop-blur-xl border border-white/10 shadow-2xl overflow-x-auto max-w-[95%]">
        <button
          type="button"
          onClick={() => {
            setCameraPreset('perspective');
            setAutoRotate(false);
          }}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            cameraPreset === 'perspective' && !autoRotate
              ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
              : 'text-zinc-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Sudut 3D</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setCameraPreset('top');
            setAutoRotate(false);
          }}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            cameraPreset === 'top' && !autoRotate
              ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
              : 'text-zinc-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Tampak Atas</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setCameraPreset('bottom');
            setAutoRotate(false);
          }}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            cameraPreset === 'bottom' && !autoRotate
              ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
              : 'text-zinc-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <FlipVertical className="w-3.5 h-3.5" />
          <span>Tampak Bawah</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setCameraPreset('close-up');
            setAutoRotate(false);
          }}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            cameraPreset === 'close-up' && !autoRotate
              ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/20'
              : 'text-zinc-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Detail Bibir</span>
        </button>

        <div className="w-[1px] h-4 bg-zinc-700 mx-1 shrink-0" />

        <button
          type="button"
          onClick={() => setAutoRotate((prev) => !prev)}
          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
            autoRotate
              ? 'bg-amber-400/30 text-amber-300 border border-amber-500/40'
              : 'text-zinc-400 hover:text-white hover:bg-white/10'
          }`}
          title={autoRotate ? 'Hentikan Putar Otomatis' : 'Putar Otomatis 360°'}
        >
          <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
        </button>

        <button
          type="button"
          onClick={handleCapture}
          className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          title="Ambil Foto 3D Studio Ultra HD (2048×2048 px)"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Top Right Guidance */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none hidden sm:block">
        <div className="px-3.5 py-1.5 rounded-full bg-[#161a22]/85 backdrop-blur-md border border-white/10 shadow-lg text-zinc-300 text-[11px] font-medium">
          🖱️ Geser untuk Memutar • Scroll untuk Zoom
        </div>
      </div>

      {/* Main 3D Canvas with EXACT same studio lighting and shadows as real-time studio */}
      <div className="relative w-full h-full flex-1">
        <Canvas
          shadows
          camera={{ position: [0, 0, 5], fov: 42 }}
          gl={{
            preserveDrawingBuffer: true,
            antialias: true,
            alpha: true,
            powerPreference: 'default',
          }}
          dpr={[1, 1.5]}
        >
          <Suspense fallback={null}>
            {/* Same photography backdrop */}
            <StudioBackdrop />

            {/* Same calibrated studio lighting (ZERO FLARE / ZERO GLARE) */}
            <StudioLighting />

            {/* Same smooth PlateSubjectRotator */}
            <PlateSubjectRotator
              cameraPreset={cameraPreset}
              autoRotate={autoRotate}
              diameterCm={diameterCm}
              outerRadius={outerRadius}
              onCaptureReady={handleCaptureReady}
            >
              <PlateModel
                {...props}
                plateColor={plateColor}
                plateFinish={props.plateFinish}
                rimTrim={rimTrim}
                rimTrimCustomColor={rimTrimCustomColor}
                rimPattern={props.rimPattern}
                customRimPatternUrl={props.customRimPatternUrl}
                customRimPatternRepeat={props.customRimPatternRepeat}
                customRimPatternMode={props.customRimPatternMode}
                logoPlacement={props.logoPlacement}
                printCoverage={props.printCoverage}
                designUrl={designUrl}
                designScale={props.designScale}
                designRotation={props.designRotation}
                designOffsetX={props.designOffsetX}
                designOffsetY={props.designOffsetY}
                designOpacity={props.designOpacity}
                selectedSize={props.selectedSize || props.plateSizeGeo}
                diameterCm={diameterCm}
              />
            </PlateSubjectRotator>
          </Suspense>
        </Canvas>
      </div>
    </div>
  );
}
