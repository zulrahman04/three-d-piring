'use client';

import React, { Suspense, useRef, useEffect, useCallback, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Float,
} from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import PlateModel from './PlateModel';
import { usePlateStore } from '@/store/usePlateStore';

// Helper component inside Canvas to handle camera animations and snapshot capture
function SceneController({
  onCaptureReady,
}: {
  onCaptureReady: (captureFn: (width?: number, height?: number) => string) => void;
}) {
  const { gl, camera, scene } = useThree();
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const cameraPreset = usePlateStore((state) => state.cameraPreset);
  const autoRotate = usePlateStore((state) => state.autoRotate);

  // Expose high-resolution capture function to parent
  useEffect(() => {
    const captureScreenshot = (targetWidth = 2048, targetHeight = 2048) => {
      const originalSize = new THREE.Vector2();
      gl.getSize(originalSize);
      const originalPixelRatio = gl.getPixelRatio();
      const persCamera = camera as THREE.PerspectiveCamera;
      const originalAspect = persCamera.aspect;

      try {
        // Temporarily upscale renderer buffer to target high resolution (e.g. 2048x2048 Ultra HD)
        gl.setPixelRatio(1);
        gl.setSize(targetWidth, targetHeight, false); // false = do not alter CSS canvas styling
        if (persCamera.isPerspectiveCamera) {
          persCamera.aspect = targetWidth / targetHeight;
          persCamera.updateProjectionMatrix();
        }

        // Render crisp studio shot
        gl.render(scene, camera);
        return gl.domElement.toDataURL('image/png', 1.0);
      } catch (err) {
        console.warn('Canvas high-res capture note:', err);
        return gl.domElement.toDataURL('image/png', 0.95);
      } finally {
        // Instantly restore interactive viewport parameters without visual glitches
        gl.setPixelRatio(originalPixelRatio);
        gl.setSize(originalSize.x, originalSize.y, false);
        if (persCamera.isPerspectiveCamera) {
          persCamera.aspect = originalAspect;
          persCamera.updateProjectionMatrix();
        }
        gl.render(scene, camera);
      }
    };
    onCaptureReady(captureScreenshot);
  }, [gl, camera, scene, onCaptureReady]);

  // Adjust camera when preset changes
  useEffect(() => {
    if (!controlsRef.current) return;

    if (cameraPreset === 'top') {
      camera.position.set(0, 4.8, 0.01);
      controlsRef.current.target.set(0, 0, 0);
    } else if (cameraPreset === 'bottom') {
      // Direct view from underneath looking up at the bottom and foot ring
      camera.position.set(0, -4.5, 0.01);
      controlsRef.current.target.set(0, 0.05, 0);
    } else if (cameraPreset === 'close-up') {
      camera.position.set(0, 1.5, 2.2);
      controlsRef.current.target.set(0, 0.1, 0);
    } else {
      // Default perspective
      camera.position.set(0, 2.8, 3.6);
      controlsRef.current.target.set(0, 0.05, 0);
    }
    controlsRef.current.update();
  }, [cameraPreset, camera]);

  return (
    <>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.06}
        autoRotate={autoRotate}
        autoRotateSpeed={1.8}
        // Allows full 360 vertical rotation to inspect the underside and footing of the plate
        maxPolarAngle={Math.PI * 0.96}
        minPolarAngle={0.05}
        minDistance={1.8}
        maxDistance={6.5}
      />
    </>
  );
}

// Studio Lighting and Atmosphere - balanced so pastel/tinted glazes don't wash out to white
function StudioLighting() {
  return (
    <>
      {/* Soft ambient lighting preserving true glaze pigments */}
      <ambientLight intensity={0.35} />
      {/* Key Studio Light */}
      <directionalLight position={[4, 6, 3]} intensity={0.9} />
      {/* Soft Fill Light */}
      <directionalLight position={[-4, 3, -2]} intensity={0.35} />
      {/* Rim Light for Ceramic Specular Highlights */}
      <pointLight position={[0, 3, -3.5]} intensity={0.4} color="#ffffff" />
      {/* Bottom Under-light for plate base & foot ring illumination */}
      <directionalLight position={[0, -5, 2]} intensity={0.45} />

      {/* HDR Environment reflections for rich ceramic gloss */}
      <Environment preset="studio" />
    </>
  );
}

export default function PlateCanvas({
  onRegisterCapture,
}: {
  onRegisterCapture?: (captureFn: (width?: number, height?: number) => string) => void;
}) {
  const captureFnRef = useRef<((width?: number, height?: number) => string) | null>(null);
  const selectedSizeId = usePlateStore((state) => state.selectedSize.id);
  const [contextLost, setContextLost] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);

  const handleCaptureReady = useCallback(
    (captureFn: (width?: number, height?: number) => string) => {
      captureFnRef.current = captureFn;
      if (onRegisterCapture) {
        onRegisterCapture(captureFn);
      }
    },
    [onRegisterCapture]
  );

  // Clean up WebGL resources when component unmounts
  useEffect(() => {
    return () => {
      if (glRef.current) {
        try {
          glRef.current.dispose();
          glRef.current.forceContextLoss();
        } catch {
          // ignore cleanup errors on browser shutdown
        }
        glRef.current = null;
      }
    };
  }, []);

  const handleReloadCanvas = () => {
    setContextLost(false);
    setCanvasKey((k) => k + 1);
  };

  return (
    <div className="relative w-full h-full min-h-[340px] select-none">
      {/* Fallback overlay if mobile OS forcibly reclaimed WebGL memory */}
      {contextLost && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 mb-3 text-xl">
            ⚡
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
            Studio 3D Siap Dimuat Ulang
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4 max-w-xs leading-relaxed">
            Browser ponsel Anda sempat menghemat memori grafis (WebGL). Ketuk tombol di bawah untuk menyegarkan tampilan 3D.
          </p>
          <button
            onClick={handleReloadCanvas}
            className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
          >
            Segarkan Studio 3D
          </button>
        </div>
      )}

      <Canvas
        key={canvasKey}
        camera={{ position: [0, 2.8, 3.6], fov: 42 }}
        onCreated={({ gl }) => {
          glRef.current = gl;
          const canvasEl = gl.domElement;

          // Crucial for mobile browsers: prevents Chrome from permanently blocking WebGL
          canvasEl.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            console.warn('[WebGL] Context lost intercepted, preventing browser block.');
            setContextLost(true);
          });

          canvasEl.addEventListener('webglcontextrestored', () => {
            console.log('[WebGL] Context restored successfully.');
            setContextLost(false);
          });
        }}
        gl={{
          preserveDrawingBuffer: true, // Allows canvas.toDataURL() screenshotting
          antialias: true,
          alpha: true,
          powerPreference: 'default', // 'default' avoids mobile thermal/battery GPU refusal
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <StudioLighting />

          {/* Table Surface Contact Shadows - Baked 1 frame on load/size change for buttery smooth 60+ FPS */}
          <ContactShadows
            key={selectedSizeId}
            frames={1}
            position={[0, -0.001, 0]}
            opacity={0.65}
            scale={5.5}
            blur={2.0}
            far={1.8}
            resolution={384}
            color="#141416"
          />

          {/* 3D Plate */}
          <PlateModel />

          <SceneController onCaptureReady={handleCaptureReady} />
        </Suspense>
      </Canvas>
    </div>
  );
}
