'use client';

import React, { useRef, useCallback, useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Sparkles, Layers, SlidersHorizontal, Eye } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import CustomizerPanel from '@/components/ui/CustomizerPanel';
import ViewportControls from '@/components/ui/ViewportControls';
import OrderModal from '@/components/ui/OrderModal';
import { usePlateStore } from '@/store/usePlateStore';

// Dynamic import with SSR disabled to prevent Canvas hydration issues
const PlateCanvas = dynamic(() => import('@/components/3d/PlateCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[450px] flex flex-col items-center justify-center bg-zinc-100/50 dark:bg-zinc-900/50 rounded-3xl">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-3" />
      <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
        Menyiapkan Studio 3D Keramik...
      </p>
      <p className="text-xs text-zinc-400 mt-1">Memuat pencahayaan & geometri porselen</p>
    </div>
  ),
});

export default function Home() {
  const captureFnRef = useRef<((width?: number, height?: number) => string) | null>(null);
  const { setCapturedSnapshot, setOrderModalOpen } = usePlateStore();
  const [mobileTab, setMobileTab] = useState<'canvas' | 'controls'>('canvas');

  // Callback to register the screenshot capture function from Canvas
  const handleRegisterCapture = useCallback(
    (captureFn: (width?: number, height?: number) => string) => {
      captureFnRef.current = captureFn;
    },
    []
  );

  // Trigger high-res snapshot (2048x2048 Ultra HD) and open checkout modal
  const handleCheckout = () => {
    if (captureFnRef.current) {
      try {
        const dataUrl = captureFnRef.current(2048, 2048);
        setCapturedSnapshot(dataUrl);
      } catch (err) {
        console.error('Error capturing plate canvas snapshot:', err);
      }
    }
    setOrderModalOpen(true);
  };

  // Direct download snapshot for user with customizable resolution (default 2048x2048 Ultra HD)
  const handleTakeSnapshot = (width = 2048, height = 2048, qualityLabel = '2K-UltraHD') => {
    if (!captureFnRef.current) return;
    try {
      const dataUrl = captureFnRef.current(width, height);
      const link = document.createElement('a');
      link.download = `ceramix-plate-${qualityLabel}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error downloading snapshot:', err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Top Header Navbar */}
      <Navbar onTakeSnapshot={handleTakeSnapshot} />

      {/* Mobile Sticky Quick Jump Bar */}
      <div className="lg:hidden sticky top-16 z-20 p-2.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-2">
        <button
          onClick={() => {
            setMobileTab('canvas');
            document.getElementById('studio-canvas')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'canvas'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          <span>Studio Piring 3D</span>
        </button>

        <button
          onClick={() => {
            setMobileTab('controls');
            document.getElementById('customizer-panel')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
            mobileTab === 'controls'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Kustomisasi Desain</span>
        </button>
      </div>

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-5rem)]">
        {/* Left Section: 3D Studio Canvas Viewport (7 cols on lg, 8 on xl) - NEVER uses display:none */}
        <section
          id="studio-canvas"
          className="relative lg:col-span-7 xl:col-span-8 flex flex-col rounded-3xl overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl bg-gradient-to-b from-slate-100/90 via-slate-200/60 to-slate-100/90 dark:from-zinc-900 dark:via-zinc-900/80 dark:to-zinc-950"
        >
          {/* Subtle Radial Glow Backdrop */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

          {/* Interactive 3D Canvas */}
          <div className="relative flex-1 w-full h-[360px] sm:h-[480px] lg:h-full min-h-[340px]">
            <PlateCanvas onRegisterCapture={handleRegisterCapture} />
            <ViewportControls onTakeSnapshot={handleTakeSnapshot} />
          </div>
        </section>

        {/* Right Section: Customizer Sidebar Panel (5 cols on lg, 4 on xl) */}
        <section
          id="customizer-panel"
          className="lg:col-span-5 xl:col-span-4 flex flex-col h-auto min-h-[550px]"
        >
          <CustomizerPanel onCheckout={handleCheckout} />
        </section>
      </main>

      {/* Order & Checkout Modal */}
      <OrderModal />
    </div>
  );
}
