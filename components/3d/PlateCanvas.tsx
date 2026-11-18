'use client';

import React, { Suspense, useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment, Lightformer, AdaptiveDpr } from '@react-three/drei';
import * as THREE from 'three';
import PlateModel from './PlateModel';
import { usePlateStore } from '@/store/usePlateStore';

// Module-level singleton texture cache for the Scandinavian Japandi warm ivory studio cyclorama
let cachedBackdropTexture: THREE.Texture | null = null;

function getJapandiBackdropTexture(): THREE.Texture | null {
  if (cachedBackdropTexture) return cachedBackdropTexture;
  if (typeof document === 'undefined') return null;

  const width = 1024;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // Base warm ivory studio background (#F4F3F0)
  ctx.fillStyle = '#F4F3F0';
  ctx.fillRect(0, 0, width, height);

  // Soft overhead warm white gallery glow (#FBFBFA) gently fading to warm ivory (#F4F3F0) and subtle perimeter (#EDEBE6)
  const radGrad = ctx.createRadialGradient(
    width * 0.5,
    height * 0.44,
    width * 0.06,
    width * 0.5,
    height * 0.48,
    width * 0.72
  );
  radGrad.addColorStop(0, '#FBFBFA');
  radGrad.addColorStop(0.45, '#F6F5F2');
  radGrad.addColorStop(0.78, '#F2F0EC');
  radGrad.addColorStop(1, '#EBE9E3');

  ctx.fillStyle = radGrad;
  ctx.fillRect(0, 0, width, height);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  cachedBackdropTexture = tex;
  return tex;
}

// Studio Backdrop with 3D perspective plane: warm ivory Scandinavian cyclorama that stays stationary when plate rotates
export function StudioBackdrop() {
  const { scene } = useThree();
  const backdropTex = useMemo(() => getJapandiBackdropTexture(), []);

  useEffect(() => {
    if (backdropTex) {
      scene.background = backdropTex;
    } else {
      scene.background = new THREE.Color('#F4F3F0');
    }

    return () => {
      scene.background = null;
    };
  }, [scene, backdropTex]);

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

// Studio Lighting calibrated for bright Scandinavian Japandi daylight, crisp #FCFBF9 porcelain definition, and warm trims
// Uses 1-Frame GPU-Baked Studio Softbox Lightformers (Zero network latency, 60 FPS, authentic tableware highlights)
export function StudioLighting() {
  return (
    <>
      {/* 1. Cahaya Lingkungan Hangat-Alami (Menjaga porselen putih gading tetap bersih & bervolume) */}
      <ambientLight intensity={0.56} color="#fffefb" />

      {/* 2. Spotlight Utama — Menyudut dari atas-kanan untuk definisi lekukan cekungan */}
      <spotLight
        position={[3.5, 6.5, 2.2]}
        angle={0.55}
        penumbra={0.94}
        intensity={2.95}
        color="#ffffff"
        castShadow
        shadow-bias={-0.0001}
        shadow-normalBias={0.02}
        shadow-radius={2.5}
        shadow-mapSize={[1024, 1024]}
      />

      {/* 3. Key Light Samping Kanan (Menonjolkan garis punggung lekukan / shoulder ridge) */}
      <directionalLight position={[5.2, 3.1, 1.3]} intensity={1.18} color="#fffcf7" />

      {/* 4. Fill Light Kiri Hangat Lembut (Membentuk kontras natural agar piring tetap menonjol dari latar ivory) */}
      <directionalLight position={[-4.4, -1.6, 1.8]} intensity={0.34} color="#f2efe9" />

      {/* 5. Rim Light Atas-Belakang (Garis lengkung bibir piring & kilau emas agar tegas di latar terang) */}
      <pointLight position={[0, 4.8, -0.8]} intensity={0.75} color="#fffaf0" />

      {/* 6. Under-Light Bawah Hangat (Detail cincin kaki piring bisque & bayangan tepi bawah bibir) */}
      <directionalLight position={[0, -4.2, 2.2]} intensity={0.42} color="#e5e0d8" />

      {/* 7. GPU-Baked Studio Softbox Lightformers (frames={1} = dihitung 1x saat muat, 0 beban per-frame) */}
      <Environment resolution={256} frames={1} environmentIntensity={0.44}>
        {/* Overhead Main Curved Softbox — pantulan kaca glasir halus ala butik Nordik */}
        <Lightformer
          form="rect"
          intensity={2.15}
          color="#ffffff"
          scale={[6.5, 3.2, 1]}
          position={[1.2, 5.5, 2.2]}
          rotation={[Math.PI / 2.3, 0.18, -0.12]}
        />
        {/* Left Rim Strip Softbox — mempertegas siluet lengkungan bibir kiri piring */}
        <Lightformer
          form="rect"
          intensity={1.15}
          color="#fafaf9"
          scale={[1.8, 6.0, 1]}
          position={[-5.5, 1.8, 1.8]}
          rotation={[0, Math.PI / 2.4, 0]}
        />
        {/* Right Warm Reflector Strip — memunculkan kilau emas 24K & kedalaman dinding cekungan */}
        <Lightformer
          form="rect"
          intensity={1.4}
          color="#fffbeb"
          scale={[2.2, 5.2, 1]}
          position={[5.5, 1.5, 1.5]}
          rotation={[0, -Math.PI / 2.4, 0]}
        />
        {/* Subtle Warm-Stone Negative Bounce — memberi definisi tepi piring putih di latar terang */}
        <Lightformer
          form="rect"
          intensity={0.22}
          color="#d6d3d1"
          scale={[4.0, 6.0, 1]}
          position={[-6.0, -1.5, -2.5]}
          rotation={[0, Math.PI / 3, 0]}
        />
        {/* Front-Top Diffuser — menjaga permukaan glasir depan tetap hidup tanpa silau berlebih */}
        <Lightformer
          form="ring"
          intensity={0.52}
          color="#ffffff"
          scale={3.5}
          position={[-1.5, 3.2, 4.5]}
          target={[0, 0, 0]}
        />
        {/* Bottom Studio Table Bounce — pantulan lembut pada bagian bawah piring */}
        <Lightformer
          form="ring"
          intensity={0.38}
          color="#e7e5e4"
          scale={7}
          position={[0, -5.0, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      </Environment>
    </>
  );
}

// Studio Floor Shadow: Very soft, thin, diffuse warm-stone contact shadow for bright Scandinavian studio
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
    // Ultra-soft, wide diffuse contact shadow in warm stone charcoal (no harsh dark edges)
    const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
    grad.addColorStop(0, 'rgba(28, 25, 23, 0.22)');
    grad.addColorStop(0.20, 'rgba(41, 37, 36, 0.14)');
    grad.addColorStop(0.45, 'rgba(68, 64, 60, 0.065)');
    grad.addColorStop(0.72, 'rgba(87, 83, 78, 0.02)');
    grad.addColorStop(0.90, 'rgba(87, 83, 78, 0.004)');
    grad.addColorStop(1, 'rgba(87, 83, 78, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
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
      scale={[2.80 * shadowScale, 1.75 * shadowScale, 1]}
      renderOrder={-1}
    >
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        map={shadowTexture}
        transparent={true}
        opacity={0.85}
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

      // Preserve current user rotation & hide safe-zone guides during capture
      const hadGroup = Boolean(groupRef.current);
      const prevRotX = groupRef.current ? groupRef.current.rotation.x : currentRot.current.x;
      const prevRotY = groupRef.current ? groupRef.current.rotation.y : currentRot.current.y;
      const guidesObj = scene.getObjectByName('safe-zone-guides');
      const prevGuidesVisible = guidesObj ? guidesObj.visible : true;

      try {
        if (guidesObj) guidesObj.visible = false;
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
        if (guidesObj) guidesObj.visible = prevGuidesVisible;
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

      // Sensitivitas seimbang dan mantap: kontrol terasa presisi & stabil
      const SENSITIVITY = 0.0048;
      targetRot.current.y += dx * SENSITIVITY;
      targetRot.current.x += dy * SENSITIVITY;

      // Batasi kemiringan vertikal (Pitch Clamping) agar piring TIDAK BISA jungkir balik / salto
      const MIN_PITCH = -Math.PI / 2 + 0.08;
      const MAX_PITCH = Math.PI / 2 - 0.08;
      targetRot.current.x = Math.max(MIN_PITCH, Math.min(MAX_PITCH, targetRot.current.x));

      // Batasi kecepatan lempar inersia maksimum
      const MAX_VEL = 0.025;
      const vx = Math.max(-MAX_VEL, Math.min(MAX_VEL, dy * SENSITIVITY * 0.4));
      const vy = Math.max(-MAX_VEL, Math.min(MAX_VEL, dx * SENSITIVITY * 0.4));
      velocity.current = { x: vx, y: vy };
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging.current = false;
      if (performance.now() - lastMoveTime > 60) {
        velocity.current = { x: 0, y: 0 };
      }
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {}
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
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

  // Frame update: frame-rate independent damping, auto-rotation, and zero-overhead idle check
  useFrame(({ camera: activeCamera }, delta) => {
    if (!groupRef.current) return;

    // Clamp delta to prevent jumps on tab switch
    const dt = Math.min(delta, 0.05);
    const frameFactor = dt * 60;

    if (autoRotate && !isDragging.current) {
      targetRot.current.y += dt * 0.85;
      currentRot.current.y += (targetRot.current.y - currentRot.current.y) * Math.min(1, 0.15 * frameFactor);
      currentRot.current.x += (targetRot.current.x - currentRot.current.x) * Math.min(1, 0.20 * frameFactor);
    } else if (isDragging.current) {
      currentRot.current.x += (targetRot.current.x - currentRot.current.x) * Math.min(1, 0.65 * frameFactor);
      currentRot.current.y += (targetRot.current.y - currentRot.current.y) * Math.min(1, 0.65 * frameFactor);
    } else {
      const hasVelocity = Math.abs(velocity.current.x) > 0.00001 || Math.abs(velocity.current.y) > 0.00001;
      if (hasVelocity) {
        targetRot.current.x += velocity.current.x * frameFactor;
        targetRot.current.y += velocity.current.y * frameFactor;
        const decay = Math.pow(0.82, frameFactor);
        velocity.current.x *= decay;
        velocity.current.y *= decay;

        const MIN_PITCH = -Math.PI / 2 + 0.08;
        const MAX_PITCH = Math.PI / 2 - 0.08;
        targetRot.current.x = Math.max(MIN_PITCH, Math.min(MAX_PITCH, targetRot.current.x));
      } else {
        velocity.current.x = 0;
        velocity.current.y = 0;
      }

      const dx = targetRot.current.x - currentRot.current.x;
      const dy = targetRot.current.y - currentRot.current.y;
      if (Math.abs(dx) > 0.00005 || Math.abs(dy) > 0.00005) {
        const lerpAmt = Math.min(1, 0.22 * frameFactor);
        currentRot.current.x += dx * lerpAmt;
        currentRot.current.y += dy * lerpAmt;
      } else {
        currentRot.current.x = targetRot.current.x;
        currentRot.current.y = targetRot.current.y;
      }
    }

    const dz = targetZoom.current - currentZoom.current;
    if (Math.abs(dz) > 0.0001) {
      currentZoom.current += dz * Math.min(1, 0.18 * frameFactor);
    } else {
      currentZoom.current = targetZoom.current;
    }

    // Apply rotation only when changed
    if (
      Math.abs(groupRef.current.rotation.x - currentRot.current.x) > 0.00005 ||
      Math.abs(groupRef.current.rotation.y - currentRot.current.y) > 0.00005
    ) {
      groupRef.current.rotation.x = currentRot.current.x;
      groupRef.current.rotation.y = currentRot.current.y;

      // Update floor shadow geometry dynamically based on plate pitch & yaw
      if (shadowMeshRef.current) {
        const tiltFactor = Math.abs(Math.sin(currentRot.current.x));
        const shadowScale = (outerRadius || 1.35) / 1.35;
        const scaleZ = (1.75 - tiltFactor * 0.45) * shadowScale;
        const scaleX = 2.80 * shadowScale;
        shadowMeshRef.current.scale.set(scaleX, scaleZ, 1);
      }
    }

    // Zoom the CAMERA: optical zoom naturally scales the plate, floor shadow, and 3D studio backdrop together
    const persCamera = activeCamera as THREE.PerspectiveCamera;
    if (persCamera.isPerspectiveCamera) {
      if (Math.abs(persCamera.zoom - currentZoom.current) > 0.0002) {
        persCamera.zoom = currentZoom.current;
        persCamera.updateProjectionMatrix();
      }
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
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center bg-white/95 backdrop-blur-md rounded-2xl border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200/80 flex items-center justify-center text-stone-700 mb-3 text-xl">
            ⚡
          </div>
          <h3 className="text-sm font-semibold text-[#1C1917] mb-1 tracking-wide">
            Studio 3D Siap Dimuat Ulang
          </h3>
          <p className="text-xs text-stone-500 mb-4 max-w-xs leading-relaxed">
            Browser ponsel Anda sempat menghemat memori grafis (WebGL). Ketuk tombol di bawah untuk menyegarkan tampilan 3D.
          </p>
          <button
            onClick={handleReloadCanvas}
            className="py-2.5 px-5 rounded-xl bg-[#1C1917] hover:bg-stone-800 text-white font-medium text-xs shadow-sm active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Segarkan Studio 3D
          </button>
        </div>
      )}

      <Canvas
        key={canvasKey}
        shadows="percentage"
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
          {/* Rock-solid, fixed studio photography backdrop */}
          <StudioBackdrop />

          {/* Balanced studio spotlight & softbox lighting */}
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
