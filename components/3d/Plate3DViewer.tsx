'use client';

import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import PlateModel, { PlateModelProps } from './PlateModel';
import { RotateCcw, Eye, Sparkles, Camera, ZoomIn } from 'lucide-react';

interface Plate3DViewerProps extends PlateModelProps {
  className?: string;
  initialPreset?: 'top' | 'perspective' | 'close-up';
}

function StudioLighting() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 3]} intensity={0.9} />
      <directionalLight position={[-4, 3, -2]} intensity={0.35} />
      <pointLight position={[0, 3, -3.5]} intensity={0.4} color="#ffffff" />
      <directionalLight position={[0, -5, 2]} intensity={0.45} />
      <Environment preset="studio" />
    </>
  );
}

function CameraController({
  preset,
  autoRotate,
  controlsRef,
}: {
  preset: 'top' | 'perspective' | 'close-up';
  autoRotate: boolean;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
}) {
  const { camera } = useThree();

  useEffect(() => {
    if (!controlsRef.current) return;

    if (preset === 'top') {
      camera.position.set(0, 4.8, 0.01);
      controlsRef.current.target.set(0, 0, 0);
    } else if (preset === 'close-up') {
      camera.position.set(0, 1.5, 2.2);
      controlsRef.current.target.set(0, 0.1, 0);
    } else {
      // Perspective
      camera.position.set(0, 2.8, 3.6);
      controlsRef.current.target.set(0, 0.05, 0);
    }
    controlsRef.current.update();
  }, [preset, camera, controlsRef]);

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.06}
      autoRotate={autoRotate}
      autoRotateSpeed={1.8}
      maxPolarAngle={Math.PI * 0.96}
      minPolarAngle={0.05}
      minDistance={1.8}
      maxDistance={6.5}
    />
  );
}

export default function Plate3DViewer({
  className = '',
  initialPreset = 'top',
  ...modelProps
}: Plate3DViewerProps) {
  const [preset, setPreset] = useState<'top' | 'perspective' | 'close-up'>(initialPreset);
  const [autoRotate, setAutoRotate] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <div className={`relative w-full h-full min-h-[380px] flex flex-col items-center select-none ${className}`}>
      {/* 3D Camera Controls Floating Bar */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900/90 border border-zinc-700/80 shadow-xl backdrop-blur-md text-xs">
        <button
          type="button"
          onClick={() => {
            setPreset('top');
            setAutoRotate(false);
          }}
          className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            preset === 'top' && !autoRotate
              ? 'bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Tampak Atas (1:1)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setPreset('perspective');
          }}
          className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            preset === 'perspective'
              ? 'bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Sudut 3D (Putar 360°)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setPreset('close-up');
            setAutoRotate(false);
          }}
          className={`px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
            preset === 'close-up'
              ? 'bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
              : 'text-zinc-300 hover:text-white hover:bg-zinc-800'
          }`}
        >
          <ZoomIn className="w-3.5 h-3.5" />
          <span>Detail Rim</span>
        </button>

        <div className="w-[1px] h-4 bg-zinc-700 mx-1" />

        <button
          type="button"
          onClick={() => setAutoRotate((prev) => !prev)}
          className={`px-2.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            autoRotate
              ? 'bg-indigo-600 text-white font-bold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
          }`}
          title="Putar Otomatis 360°"
        >
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Real-time 3D Canvas */}
      <div className="w-full h-full min-h-[380px] flex-1">
        <Canvas
          camera={{ position: [0, 4.8, 0.01], fov: 42 }}
          gl={{
            preserveDrawingBuffer: true,
            antialias: true,
            alpha: true,
            powerPreference: 'default',
          }}
          dpr={[1, 1.5]}
        >
          <Suspense fallback={null}>
            <StudioLighting />

            {/* Table Surface Contact Shadows */}
            <ContactShadows
              position={[0, -0.001, 0]}
              opacity={0.65}
              scale={5.5}
              blur={2.0}
              far={1.8}
              resolution={384}
              color="#141416"
            />

            {/* 3D Plate Model with Order Parameters */}
            <PlateModel {...modelProps} />

            <CameraController
              preset={preset}
              autoRotate={autoRotate}
              controlsRef={controlsRef}
            />
          </Suspense>
        </Canvas>
      </div>

      <div className="text-[11px] text-zinc-500 pb-2 flex items-center gap-2">
        <span>Gunakan kursor mouse untuk memutar, menggeser & zoom in/out</span>
      </div>
    </div>
  );
}
