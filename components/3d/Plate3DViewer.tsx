'use client';

import React, { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
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
      className={`relative w-full h-full min-h-[440px] flex flex-col items-center select-none rounded-2xl overflow-hidden border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-[#F4F3F0] ${className}`}
    >
      {/* Floating Status Badge Top Left */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
        <div className="px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-2 text-xs font-medium text-[#1C1917]">
          <div className="w-2 h-2 rounded-full bg-[#6B7F6E]" />
          <span>Studio 3D Kalibrasi Porselen (1:1)</span>
        </div>
      </div>

      {/* Camera Angle & Control Bar Bottom Center */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1.5 rounded-2xl bg-white/85 backdrop-blur-xl border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-x-auto max-w-[95%]">
        <button
          type="button"
          onClick={() => {
            setCameraPreset('perspective');
            setAutoRotate(false);
          }}
          className={`py-1.5 px-3.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            cameraPreset === 'perspective' && !autoRotate
              ? 'bg-[#1C1917] text-white shadow-xs'
              : 'text-stone-600 hover:text-[#1C1917] hover:bg-stone-100/80'
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
          className={`py-1.5 px-3.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            cameraPreset === 'top' && !autoRotate
              ? 'bg-[#1C1917] text-white shadow-xs'
              : 'text-stone-600 hover:text-[#1C1917] hover:bg-stone-100/80'
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
          className={`py-1.5 px-3.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            cameraPreset === 'bottom' && !autoRotate
              ? 'bg-[#1C1917] text-white shadow-xs'
              : 'text-stone-600 hover:text-[#1C1917] hover:bg-stone-100/80'
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
          className={`py-1.5 px-3.5 rounded-xl text-xs font-medium transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            cameraPreset === 'close-up' && !autoRotate
              ? 'bg-[#1C1917] text-white shadow-xs'
              : 'text-stone-600 hover:text-[#1C1917] hover:bg-stone-100/80'
          }`}
        >
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Detail Bibir</span>
        </button>

        <div className="w-[1px] h-4 bg-stone-200 mx-1 shrink-0" />

        <button
          type="button"
          onClick={() => setAutoRotate((prev) => !prev)}
          className={`p-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
            autoRotate
              ? 'bg-stone-200/80 text-[#1C1917] border border-stone-300/80'
              : 'text-stone-500 hover:text-[#1C1917] hover:bg-stone-100/80'
          }`}
          title={autoRotate ? 'Hentikan Putar Otomatis' : 'Putar Otomatis 360°'}
        >
          <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} />
        </button>

        <button
          type="button"
          onClick={handleCapture}
          className="p-1.5 rounded-xl text-stone-500 hover:text-[#1C1917] hover:bg-stone-100/80 transition-all duration-200 cursor-pointer"
          title="Ambil Foto 3D Studio Ultra HD (2048×2048 px)"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Top Right Guidance */}
      <div className="absolute top-4 right-4 z-20 pointer-events-none hidden sm:block">
        <div className="px-3.5 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-stone-600 text-[11px] font-medium tracking-wide">
          Geser untuk Memutar • Scroll untuk Zoom
        </div>
      </div>

      {/* Main 3D Canvas with EXACT same studio lighting and shadows as real-time studio */}
      <div className="relative w-full h-full flex-1">
        <Canvas
          shadows="percentage"
          camera={{ position: [0, 0, 5], fov: 42 }}
          gl={{
            preserveDrawingBuffer: false,
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: false,
          }}
          dpr={[1, 1.5]}
        >
          <color attach="background" args={['#F4F3F0']} />
          <AdaptiveDpr pixelated={false} />
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
