'use client';

import React, { Suspense, useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';
import PlateModel from './PlateModel';
import { usePlateStore } from '@/store/usePlateStore';

// Studio Backdrop with 3D perspective plane: zooms with camera and stays stationary when plate is rotated
export function StudioBackdrop() {
  const { scene } = useThree();
  const [backdropTex, setBackdropTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let active = true;
    const loader = new THREE.TextureLoader();
    loader.load('/studio-dark-backdrop.jpg', (texture) => {
      if (!active) {
        texture.dispose();
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      scene.background = texture;
      setBackdropTex(texture);
    });

    return () => {
      active = false;
      if (scene.background && (scene.background as THREE.Texture).dispose) {
        (scene.background as THREE.Texture).dispose();
      }
      scene.background = null;
    };
  }, [scene]);

  if (!backdropTex) return null;

  return (
    <mesh position={[0, 0, -3.5]} renderOrder={-100}>
      <planeGeometry args={[28, 18]} />
      <meshBasicMaterial
        map={backdropTex}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

// Studio Lighting calibrated for glossy porcelain, metallic trims, and photorealistic depth
export function StudioLighting() {
  return (
    <>
      {/* 1. Cahaya Lingkungan Netral (Menjaga warna putih porselen tetap bersih) */}
      <ambientLight intensity={0.65} color="#ffffff" />

      {/* 2. Spotlight Utama — Menyudut dari atas-kanan & WAJIB castShadow */}
      <spotLight
        position={[3.5, 6.5, 1.8]}
        angle={0.55}
        penumbra={0.9}
        intensity={3.2}
        color="#ffffff"
        castShadow
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
        shadow-radius={2}
        shadow-mapSize={[1024, 1024]}
      />

      {/* 3. Key Light Samping Kanan (Menonjolkan garis punggung lekukan / ridge) */}
      <directionalLight position={[5.0, 3.0, 1.0]} intensity={1.2} color="#ffffff" />

      {/* 4. Fill Light Kiri Bawah (Melembutkan area bayangan) */}
      <directionalLight position={[-4.0, -2.0, 1.5]} intensity={0.4} color="#f1f5f9" />

      {/* 5. Rim Light Atas (Garis lengkung bibir piring) */}
      <pointLight position={[0, 4.5, 1.2]} intensity={0.65} color="#ffffff" />

      {/* 6. Under-Light Bawah (Detail cincin kaki piring / foot ring) */}
      <directionalLight position={[0, -4.0, 2.0]} intensity={0.35} color="#94a3b8" />

      {/* HDR Environment reflections with calibrated angle and intensity */}
      <Environment
        preset="studio"
        environmentIntensity={0.35}
        environmentRotation={[0.4, Math.PI / 3, 0]}
      />
    </>
  );
}

// Studio Floor Shadow positioned safely on the studio floor below the subject (never overlaps the plate)
export function StudioFloorShadow({
  shadowMeshRef,
  outerRadius = 1.35,
}: {
  shadowMeshRef: React.RefObject<THREE.Mesh | null>;
  outerRadius?: number;
}) {
  const shadowTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const center = size / 2;
    // Multi-stop radial gradient for soft, realistic studio spotlight shadow
    const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
    grad.addColorStop(0, 'rgba(0, 0, 0, 0.88)');
    grad.addColorStop(0.25, 'rgba(0, 0, 0, 0.65)');
    grad.addColorStop(0.52, 'rgba(0, 0, 0, 0.28)');
    grad.addColorStop(0.78, 'rgba(0, 0, 0, 0.06)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  if (!shadowTexture) return null;

  // Proporsional dengan radius fisik piring (default dinner plate 27cm = 1.35)
  const shadowScale = outerRadius / 1.35;

  return (
    <mesh
      ref={shadowMeshRef}
      position={[0, -1.40, -0.35]}
      rotation={[-Math.PI / 2, 0, 0]}
      scale={[2.3 * shadowScale, 1.4 * shadowScale, 1]}
      renderOrder={-1}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={shadowTexture}
        transparent={true}
        opacity={0.80}
        depthWrite={false}
        depthTest={true}
      />
    </mesh>
  );
}

// Interactive Plate Rotator: Only the plate rotates when dragged, while Zoom scales the entire camera/studio
export function PlateSubjectRotator({
  children,
  cameraPreset,
  autoRotate,
  diameterCm,
  outerRadius = 1.35,
  onCaptureReady,
}: {
  children: React.ReactNode;
  cameraPreset: 'perspective' | 'top' | 'bottom' | 'close-up';
  autoRotate: boolean;
  diameterCm: number;
  outerRadius?: number;
  onCaptureReady?: (captureFn: (width?: number, height?: number) => string) => void;
}) {
  const { gl, camera, scene } = useThree();
  const groupRef = useRef<THREE.Group>(null);
  const shadowMeshRef = useRef<THREE.Mesh>(null);
  const isDragging = useRef(false);
  const prevPointer = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });

  // Current rotation and target rotation for smooth damping
  // Default perspective: tilted at ~66 degrees (1.15 radians) facing camera with slight Y tilt
  const targetRot = useRef({ x: 1.15, y: 0.15 });
  const currentRot = useRef({ x: 1.15, y: 0.15 });
  const targetZoom = useRef(1.0);
  const currentZoom = useRef(1.0);

  // Expose high-resolution snapshot capture function
  useEffect(() => {
    const captureScreenshot = (targetWidth = 2048, targetHeight = 2048) => {
      const originalSize = new THREE.Vector2();
      gl.getSize(originalSize);
      const originalPixelRatio = gl.getPixelRatio();
      const persCamera = camera as THREE.PerspectiveCamera;
      const originalAspect = persCamera.aspect;

      // Preserve current user rotation
      const hadGroup = Boolean(groupRef.current);
      const prevRotX = groupRef.current ? groupRef.current.rotation.x : currentRot.current.x;
      const prevRotY = groupRef.current ? groupRef.current.rotation.y : currentRot.current.y;

      try {
        // If plate is tilted too edge-on (< 0.5 rad) or upside down, temporarily set to signature 3D presentation angle
        if (groupRef.current && (prevRotX < 0.55 || Math.abs(prevRotX) < 0.3)) {
          groupRef.current.rotation.x = 1.15;
          groupRef.current.rotation.y = 0.15;
        }

        gl.setPixelRatio(1);
        gl.setSize(targetWidth, targetHeight, false);
        if (persCamera.isPerspectiveCamera) {
          persCamera.aspect = targetWidth / targetHeight;
          persCamera.updateProjectionMatrix();
        }

        gl.render(scene, camera);
        return gl.domElement.toDataURL('image/png', 1.0);
      } catch (err) {
        console.warn('Canvas high-res capture note:', err);
        return gl.domElement.toDataURL('image/png', 0.95);
      } finally {
        if (hadGroup && groupRef.current) {
          groupRef.current.rotation.x = prevRotX;
          groupRef.current.rotation.y = prevRotY;
        }
        gl.setPixelRatio(originalPixelRatio);
        gl.setSize(originalSize.x, originalSize.y, false);
        if (persCamera.isPerspectiveCamera) {
          persCamera.aspect = originalAspect;
          persCamera.updateProjectionMatrix();
        }
        gl.render(scene, camera);
      }
    };
    if (onCaptureReady) {
      onCaptureReady(captureScreenshot);
    }
  }, [gl, camera, scene, onCaptureReady]);

  // Respond to camera angle preset button clicks
  useEffect(() => {
    if (cameraPreset === 'top') {
      // Tampak Atas: pitch 1.42 (~81°) dan yaw 0.05 agar dinding miring cekungan tetap berdimensi
      targetRot.current = { x: 1.42, y: 0.05 };
      targetZoom.current = 1.0;
    } else if (cameraPreset === 'bottom') {
      // Direct underside & foot ring (1:1 Tampak Bawah)
      targetRot.current = { x: -Math.PI / 2, y: 0 };
      targetZoom.current = 1.0;
    } else if (cameraPreset === 'close-up') {
      // Zoomed in detail view: zooms camera in for high-res inspection
      targetRot.current = { x: 1.12, y: 0.2 };
      targetZoom.current = 1.45;
    } else {
      // Default signature Sudut 3D showcase
      targetRot.current = { x: 1.15, y: 0.15 };
      targetZoom.current = 1.0;
    }
  }, [cameraPreset]);

  // Drag and Wheel Event Listeners on the WebGL Canvas element
  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = 'none';

    let lastMoveTime = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      isDragging.current = true;
      prevPointer.current = { x: e.clientX, y: e.clientY };
      velocity.current = { x: 0, y: 0 };
      lastMoveTime = performance.now();
      try {
        el.setPointerCapture(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      const dx = e.clientX - prevPointer.current.x;
      const dy = e.clientY - prevPointer.current.y;
      prevPointer.current = { x: e.clientX, y: e.clientY };
      lastMoveTime = performance.now();

      // Sensitivitas seimbang dan mantap: kontrol terasa presisi & stabil (tidak licin/gampang terbang)
      const SENSITIVITY = 0.0048;
      targetRot.current.y += dx * SENSITIVITY;
      targetRot.current.x += dy * SENSITIVITY;

      // Batasi kemiringan vertikal (Pitch Clamping) agar piring TIDAK BISA jungkir balik / salto
      // Rentang aman dari hampir tegak lurus bawah (-86°) hingga hampir tegak lurus atas (+86°)
      const MIN_PITCH = -Math.PI / 2 + 0.08;
      const MAX_PITCH = Math.PI / 2 - 0.08;
      targetRot.current.x = Math.max(MIN_PITCH, Math.min(MAX_PITCH, targetRot.current.x));

      // Batasi kecepatan lempar inersia maksimum agar saat mouse dilepas cepat, piring tidak terlempar liar
      const MAX_VEL = 0.025;
      const vx = Math.max(-MAX_VEL, Math.min(MAX_VEL, dy * SENSITIVITY * 0.4));
      const vy = Math.max(-MAX_VEL, Math.min(MAX_VEL, dx * SENSITIVITY * 0.4));
      velocity.current = { x: vx, y: vy };
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging.current = false;
      // Jika kursor sempat berhenti sesaat sebelum tombol mouse dilepas (> 60ms), hilangkan inersia agar piring langsung diam
      if (performance.now() - lastMoveTime > 60) {
        velocity.current = { x: 0, y: 0 };
      }
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      // Zooming scales camera optical zoom so studio room and plate zoom in harmony
      const zoomDelta = e.deltaY * -0.0012;
      targetZoom.current = Math.min(1.85, Math.max(0.70, targetZoom.current + zoomDelta));
    };

    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      el.removeEventListener('wheel', onWheel);
    };
  }, [gl]);

  // Frame update: smooth inertia damping, auto-rotation, and unified camera optical zoom
  useFrame(({ camera: activeCamera }, delta) => {
    if (!groupRef.current) return;

    if (autoRotate && !isDragging.current) {
      targetRot.current.y += delta * 0.85;
      currentRot.current.y += (targetRot.current.y - currentRot.current.y) * 0.15;
    } else if (isDragging.current) {
      // Immediate, responsive tracking while actively dragging - ZERO DELAY
      currentRot.current.x += (targetRot.current.x - currentRot.current.x) * 0.60;
      currentRot.current.y += (targetRot.current.y - currentRot.current.y) * 0.60;
    } else {
      // Smooth inertial coasting upon release dengan redaman berbobot
      targetRot.current.x += velocity.current.x;
      targetRot.current.y += velocity.current.y;
      velocity.current.x *= 0.82; // Redam lebih cepat agar piring stabil dan tidak meluncur jauh
      velocity.current.y *= 0.82;

      // Jaga pitch tetap dalam batas aman saat inersia berhenti
      const MIN_PITCH = -Math.PI / 2 + 0.08;
      const MAX_PITCH = Math.PI / 2 - 0.08;
      targetRot.current.x = Math.max(MIN_PITCH, Math.min(MAX_PITCH, targetRot.current.x));

      currentRot.current.x += (targetRot.current.x - currentRot.current.x) * 0.20;
      currentRot.current.y += (targetRot.current.y - currentRot.current.y) * 0.20;
    }

    currentZoom.current += (targetZoom.current - currentZoom.current) * 0.16;

    groupRef.current.rotation.x = currentRot.current.x;
    groupRef.current.rotation.y = currentRot.current.y;

    // Piring tidak di-scale di mesh group agar ketebalan porselen dan list emas tetap proporsional & murni
    groupRef.current.scale.set(1, 1, 1);

    // Zoom the CAMERA: this optical zoom naturally scales the plate, floor shadow, and 3D studio backdrop together
    const persCamera = activeCamera as THREE.PerspectiveCamera;
    if (persCamera.isPerspectiveCamera) {
      if (Math.abs(persCamera.zoom - currentZoom.current) > 0.0005) {
        persCamera.zoom = currentZoom.current;
        persCamera.updateProjectionMatrix();
      }
    }

    // Direct mesh update on floor shadow: skala proporsional outerRadius / 1.35
    if (shadowMeshRef.current) {
      const tiltFactor = Math.abs(Math.sin(currentRot.current.x));
      const shadowScale = (outerRadius || 1.35) / 1.35;
      const scaleZ = (1.4 - tiltFactor * 0.45) * shadowScale;
      const scaleX = 2.3 * shadowScale;
      shadowMeshRef.current.scale.set(scaleX, scaleZ, 1);
    }
  });

  return (
    <>
      {/* Floor Shadow on the studio floor rendered safely below the plate with renderOrder={-1} */}
      <StudioFloorShadow
        shadowMeshRef={shadowMeshRef}
        outerRadius={outerRadius}
      />

      {/* 3D Subject Plate centered in the middle of the studio */}
      <group ref={groupRef} position={[0, -0.10, 0]}>
        {children}
      </group>
    </>
  );
}

export default function PlateCanvas({
  onRegisterCapture,
}: {
  onRegisterCapture?: (captureFn: (width?: number, height?: number) => string) => void;
}) {
  const captureFnRef = useRef<((width?: number, height?: number) => string) | null>(null);
  const selectedSize = usePlateStore((state) => state.selectedSize);
  const cameraPreset = usePlateStore((state) => state.cameraPreset);
  const autoRotate = usePlateStore((state) => state.autoRotate);
  const diameterCm = selectedSize.diameterCm;
  const outerRadius = selectedSize.outerRadius ?? 1.35;
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
        } catch {}
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
        shadows
        camera={{ position: [0, 0, 5], fov: 42 }}
        onCreated={({ gl }) => {
          glRef.current = gl;
          const canvasEl = gl.domElement;

          // Prevent Chrome from permanently blocking WebGL
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
          preserveDrawingBuffer: true,
          antialias: true,
          alpha: true,
          powerPreference: 'default',
          failIfMajorPerformanceCaveat: false,
        }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          {/* Rock-solid, fixed studio photography backdrop */}
          <StudioBackdrop />

          {/* Balanced studio spotlight & key lighting */}
          <StudioLighting />

          {/* 3D Plate with direct object rotator: ONLY the plate rotates, studio background stays fixed! */}
          <PlateSubjectRotator
            cameraPreset={cameraPreset}
            autoRotate={autoRotate}
            diameterCm={diameterCm}
            outerRadius={outerRadius}
            onCaptureReady={handleCaptureReady}
          >
            <PlateModel />
          </PlateSubjectRotator>
        </Suspense>
      </Canvas>
    </div>
  );
}
