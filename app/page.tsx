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
    <div className="w-full h-full min-h-[450px] flex flex-col items-center justify-center bg-[#FBFBFA] border border-stone-200/80 rounded-2xl">
      <Loader2 className="w-8 h-8 text-stone-600 animate-spin mb-3" />
      <p className="text-sm font-medium text-[#1C1917] tracking-wide">
        Menyiapkan Studio 3D Keramik...
      </p>
      <p className="text-xs text-stone-400 mt-1">Memuat pencahayaan &amp; geometri porselen</p>
    </div>
  ),
});

export default function Home() {
  const captureFnRef = useRef<((width?: number, height?: number) => string) | null>(null);
  const { setCapturedSnapshot, setOrderModalOpen, addToCart } = usePlateStore();
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

  // Capture a lightweight preview snapshot and add active plate design to multi-item cart
  const handleAddToCart = () => {
    let snapshot: string | null = null;
    if (captureFnRef.current) {
      try {
        snapshot = captureFnRef.current(640, 640);
      } catch (err) {
        console.error('Error capturing cart thumbnail:', err);
      }
    }
    addToCart(snapshot, 1);
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
    <div className="flex flex-col min-h-screen bg-[#F4F3F0] text-[#1C1917]">
      {/* Top Header Navbar */}
      <Navbar onTakeSnapshot={handleTakeSnapshot} />

      {/* Mobile Sticky Quick Jump Bar */}
      <div className="lg:hidden sticky top-16 z-20 p-2.5 bg-white/85 backdrop-blur-md border-b border-stone-200/80 flex items-center justify-center gap-2">
        <button
          onClick={() => {
            setMobileTab('canvas');
            document.getElementById('studio-canvas')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
            mobileTab === 'canvas'
              ? 'bg-[#1C1917] text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:text-[#1C1917]'
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
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer ${
            mobileTab === 'controls'
              ? 'bg-[#1C1917] text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:text-[#1C1917]'
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Kustomisasi Desain</span>
        </button>
      </div>

      {/* Main Studio Viewport */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[calc(100vh-5rem)]">
        {/* Left Section: 3D Studio Canvas Viewport (7 cols on lg, 8 on xl) - NEVER uses display:none */}
        <section
          id="studio-canvas"
          className="relative lg:col-span-7 xl:col-span-8 flex flex-col rounded-2xl overflow-hidden border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-[#F4F3F0] lg:sticky lg:top-20 lg:h-[calc(100vh-6.5rem)] lg:max-h-[660px] lg:min-h-[480px]"
        >
          {/* Interactive 3D Canvas */}
          <div className="relative flex-1 w-full h-[360px] sm:h-[440px] lg:h-full min-h-[340px]">
            <PlateCanvas onRegisterCapture={handleRegisterCapture} />
            <ViewportControls onTakeSnapshot={handleTakeSnapshot} />
          </div>
        </section>

        {/* Right Section: Customizer Sidebar Panel (5 cols on lg, 4 on xl) */}
        <section
          id="customizer-panel"
          className="lg:col-span-5 xl:col-span-4 flex flex-col h-auto min-h-[550px]"
        >
          <CustomizerPanel onCheckout={handleCheckout} onAddToCart={handleAddToCart} />
        </section>
      </main>

      {/* Order & Checkout Modal */}
      <OrderModal />
    </div>
  );
}
