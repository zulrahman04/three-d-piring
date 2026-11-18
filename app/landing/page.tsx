'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Flame,
  CheckCircle2,
  Box,
  Compass,
  Layers,
  ChevronDown,
  Star,
  Users,
  Award,
  Maximize2,
  Eye,
  Camera,
  Coffee,
  HeartHandshake,
  UtensilsCrossed,
  Gift,
  Building2,
  ChevronRight,
  Palette,
  Check,
} from 'lucide-react';
import { PLATE_COLORS, RIM_TRIMS, PLATE_SIZES } from '@/constants/presets';

export default function LandingPage() {
  const [selectedPreviewColor, setSelectedPreviewColor] = useState(PLATE_COLORS[1]); // Matte Obsidian
  const [selectedPreviewTrim, setSelectedPreviewTrim] = useState<(typeof RIM_TRIMS)[number]>(RIM_TRIMS[1]); // 24K Gold
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [activeUseCase, setActiveUseCase] = useState<'restaurant' | 'wedding' | 'corporate' | 'cafe'>('restaurant');
  const [cmsSettings, setCmsSettings] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch('/api/master/landing')
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.settings) {
          setCmsSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  const heroCms = cmsSettings['hero_section'];
  const promoCms = cmsSettings['promo_banner'];
  const kilnCms = cmsSettings['studio_announcement'];

  const faqs = [
    {
      q: 'Apakah piring hasil kustomisasi aman untuk makanan panas dan microwave?',
      a: '100% Aman. Piring Ceramix dibuat dari porselen food-grade berkualitas tinggi yang dipanggang dalam kiln suhu tinggi 1.250°C. Glasirnya tidak berpori, bebas timbal (lead-free), tahan panas microwave, serta aman dicuci menggunakan dishwasher komersial.',
    },
    {
      q: 'Apakah bisa memesan dalam jumlah satuan atau harus grosir?',
      a: 'Kami melayani pesanan mulai dari 1 piring (satuan) untuk kado personal, wedding gift, maupun prototype sample. Untuk pesanan grosir (restoran, hotel, kafe, event korporat), kami menyediakan diskon bertingkat khusus hingga 35%.',
    },
    {
      q: 'Berapa resolusi gambar atau logo yang disarankan untuk diunggah?',
      a: 'Kami merekomendasikan file PNG dengan latar belakang transparan beresolusi minimal 1000x1000 pixel atau file vektor (SVG). Anda juga dapat langsung menguji posisi, skala, dan rotasi motif di Studio 3D kami.',
    },
    {
      q: 'Berapa lama proses produksi dan pengiriman pesanan?',
      a: 'Setelah desain disetujui, pesanan satuan/sample dikerjakan dalam 3-5 hari kerja. Untuk pesanan grosir (50 - 500+ pcs) membutuhkan waktu 10-18 hari kerja termasuk quality control dan packaging peti kayu anti-pecah bergaransi.',
    },
    {
      q: 'Bagaimana jika piring pecah saat pengiriman kurir?',
      a: 'Setiap pengiriman dilengkapi dengan asuransi dan garansi ganti baru 100% tanpa biaya tambahan jika terjadi kerusakan saat proses pengiriman, cukup sertakan video unboxing.',
    },
  ];

  const useCases = {
    restaurant: {
      title: 'Restoran Bintang & Fine Dining',
      desc: 'Tingkatkan estetika plating hidangan signature Anda dengan piring porselen berpola monogram restoran beraksen 24K gold luster yang memukau tamu.',
      features: ['Food-Grade & Stain Resistant', 'Cocok untuk dishwasher komersial', 'Pilihan ukuran standar 27cm & 21cm'],
      quote: 'Piring Ceramix mengubah persepsi hidangan kami menjadi jauh lebih mewah di mata pelanggan.',
      author: 'Chef Adrian Wijaya — Executive Chef The Heritage Dining',
    },
    wedding: {
      title: 'Souvenir Pernikahan & Gift Eksklusif',
      desc: 'Abadikan momen sakral dengan piring porselen berukir nama inisial pengantin, tanggal pernikahan, atau ornamen floral botanikal bergaya klasik eropa.',
      features: ['Packaging hardbox beludru mewah', 'Bisa cetak custom monogram emas', 'Bisa dipesan satuan atau ratusan pcs'],
      quote: 'Kado pernikahan paling berkesan dan abadi yang pernah kami buat untuk para sahabat.',
      author: 'Clara & Stefan — Pasangan Pengantin Jakarta',
    },
    corporate: {
      title: 'Merchandise & Hampers VIP Korporat',
      desc: 'Kesan eksklusif untuk mitra bisnis dan klien prioritas. Hadirkan piring display porselen berlogo perusahaan dengan kotak hadiah eksklusif.',
      features: ['Dukungan faktur pajak & invoice resmi', 'Diskon volume b2b menarik', 'Pengiriman ke multi-alamat penerima'],
      quote: 'Pilihan hampers akhir tahun terbaik untuk klien VVIP korporasi kami.',
      author: 'Bambang S. — Head of Procurement FinTech Group',
    },
    cafe: {
      title: 'Kafe Estetik & Bakery Specialty',
      desc: 'Lengkapi interior kafe modern Anda dengan piring dessert 16cm dan pasta 21cm bernuansa pastel matte earth-tone yang sangat Instagramable.',
      features: ['Warna pastel matte tahan gores', 'Ketebalan pas dan mantap dipegang', 'Membantu branding visual kafe di media sosial'],
      quote: 'Plating kue dan pastry kami jadi viral di Instagram berkat piring custom ini!',
      author: 'Maya Lin — Founder Bloom Pastry & Cafe',
    },
  };

  return (
    <div className="min-h-screen bg-[#F4F3F0] text-[#1C1917] selection:bg-stone-800/10 selection:text-[#1C1917]">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-xl border-b border-stone-200/80 transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/landing" className="flex items-center gap-3.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#1C1917] flex items-center justify-center shadow-[0_4px_12px_rgba(28,25,23,0.08)] group-hover:scale-105 transition-transform duration-200">
              <div className="w-5 h-5 rounded-full border border-[#FCFBF9]/70 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#FCFBF9]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-[family-name:var(--font-display)] font-semibold text-lg tracking-[0.06em] text-[#1C1917]">
                  CERAMIX 3D
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-[0.12em] bg-[#F4F3F0] text-stone-600 border border-stone-200/80">
                  Artisan Porcelain
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-normal tracking-wide">
                Piring Porselen Kustom &amp; Studio 3D Real-Time
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-medium tracking-wide text-stone-600">
            <a href="#fitur" className="hover:text-[#1C1917] transition-colors">
              Fitur 3D
            </a>
            <a href="#material" className="hover:text-[#1C1917] transition-colors">
              Material &amp; Glasir
            </a>
            <a href="#solusi" className="hover:text-[#1C1917] transition-colors">
              Solusi Bisnis
            </a>
            <a href="#faq" className="hover:text-[#1C1917] transition-colors">
              FAQ
            </a>
          </nav>

          {/* Direct CTA Link to the 3D Studio & Order Tracker */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/track"
              className="hidden sm:inline-flex items-center gap-1.5 py-2.5 px-4 rounded-xl border border-stone-200/80 bg-white hover:bg-[#FBFBFA] text-stone-700 hover:text-[#1C1917] font-medium text-xs shadow-[0_2px_10px_rgb(0,0,0,0.02)] transition-all duration-200"
            >
              Lacak Pesanan
            </Link>
            <Link
              href="/"
              className="relative group py-2.5 px-5 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-white font-medium text-xs sm:text-sm tracking-wide shadow-[0_4px_14px_rgba(28,25,23,0.12)] active:scale-95 transition-all duration-200 flex items-center gap-2"
            >
              <span>Buka Studio 3D</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* Dynamic Kiln & Promo Bar from Admin CMS */}
      {(promoCms || kilnCms) && (
        <div className="bg-[#EFECE6] text-[#1C1917] border-b border-stone-200/80 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-[#4A5D4E] border border-stone-200/80 text-[10px] font-semibold tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-[#6B7F6E]" />
                {kilnCms?.title || 'Studio Kiln Online'}
              </span>
              <span className="text-stone-600 truncate max-w-md">
                {kilnCms?.content || 'Kapasitas pembakaran kiln normal (3-5 hari kerja).'}
              </span>
            </div>
            {promoCms && (
              <div className="flex items-center gap-2 text-[#57534E] font-medium">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{promoCms.title}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <main>
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-[#FBFBFA] via-[#F4F3F0] to-[#F4F3F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Headline & Action */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                {/* Floating Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-xs font-medium text-stone-700 mb-6 tracking-wide">
                  <span className="flex h-2 w-2 rounded-full bg-[#6B7F6E]" />
                  <span>{heroCms?.metadata?.badgeText || 'Atelier Piring Porselen 3D Real-Time'}</span>
                </div>

                <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl lg:text-[54px] font-semibold tracking-tight leading-[1.14] text-[#1C1917] mb-6">
                  {heroCms?.title ? (
                    heroCms.title
                  ) : (
                    <>
                      Wujudkan Piring Porselen Eksklusif dengan{' '}
                      <span className="text-[#57534E] underline decoration-stone-300 decoration-2 underline-offset-8">
                        Visualisasi 3D Nyata
                      </span>
                    </>
                  )}
                </h1>

                <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed mb-8 max-w-2xl">
                  {heroCms?.content ||
                    'Rancang motif kustom, eksplorasi tekstur glasir keramik mewah, dan tambahkan aksen 24K gold rim trim. Putar 360° hingga ke dasar piring sebelum diproduksi. Sempurna untuk fine dining, souvenir pernikahan, dan koleksi prestisius.'}
                </p>

                {/* Primary & Secondary Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-12">
                  <Link
                    href="/"
                    className="py-3.5 px-7 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-white font-medium text-sm sm:text-base tracking-wide shadow-[0_8px_24px_rgba(28,25,23,0.12)] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 group"
                  >
                    <Sparkles className="w-4 h-4 text-stone-300" />
                    <span>{heroCms?.metadata?.ctaText || 'Mulai Kustomisasi 3D'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <a
                    href="#material"
                    className="py-3.5 px-6 rounded-xl bg-white border border-stone-200/80 hover:bg-[#FBFBFA] hover:border-stone-300 text-[#1C1917] font-medium text-sm sm:text-base shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <span>Lihat Bahan &amp; Glasir</span>
                  </a>
                </div>

                {/* Key Metric Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-6 border-t border-stone-200/80">
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#1C1917]">60+ FPS</p>
                    <p className="text-xs text-stone-500 font-normal tracking-wide">Interaktif Real-Time</p>
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#57534E]">2K / 4K</p>
                    <p className="text-xs text-stone-500 font-normal tracking-wide">Ultra HD Snapshot</p>
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#1C1917]">1.250°C</p>
                    <p className="text-xs text-stone-500 font-normal tracking-wide">Kiln-Fired Porcelain</p>
                  </div>
                  <div>
                    <p className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#4A5D4E]">100%</p>
                    <p className="text-xs text-stone-500 font-normal tracking-wide">Food-Grade Safe</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Showcase Visual */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto w-full max-w-lg rounded-2xl p-3 bg-white border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  {/* Photo Visual Preview */}
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#F4F3F0] group">
                    <Image
                      src="/images/hero-plate.jpg"
                      alt="Piring Porselen Mewah dengan 24K Gold Rim Trim dan Motif Delft Blue"
                      fill
                      priority
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/75 via-[#1C1917]/15 to-transparent flex flex-col justify-end p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-stone-200">Koleksi Signature</p>
                          <h3 className="text-lg font-medium text-white mt-0.5">Royal Delft Floral • 24K Gold Rim</h3>
                        </div>
                        <Link
                          href="/"
                          className="p-3 rounded-full bg-white/90 hover:bg-white text-[#1C1917] backdrop-blur-md transition-all duration-200 cursor-pointer"
                          title="Coba di Studio 3D"
                        >
                          <Maximize2 className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Floating Interactive Badge Overlays */}
                  <div className="absolute -top-4 -right-4 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-2 text-xs font-medium text-[#1C1917]">
                    <Compass className="w-4 h-4 text-[#57534E] animate-spin" style={{ animationDuration: '8s' }} />
                    <span>Rotasi Penuh 360°</span>
                  </div>

                  <div className="absolute -bottom-4 -left-4 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center gap-2 text-xs font-medium text-[#1C1917]">
                    <Award className="w-4 h-4 text-[#78716C]" />
                    <span>24K Gold Luster Trim</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Interactive Preview & Customization Showcase */}
        <section id="fitur" className="py-20 lg:py-28 bg-white border-y border-stone-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-600 bg-[#F4F3F0] px-3.5 py-1.5 rounded-full border border-stone-200/80">
                Fitur Unggulan Studio
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-semibold tracking-tight text-[#1C1917] mt-5 mb-4">
                Kontrol Penuh dalam Sentuhan Jari
              </h2>
              <p className="text-base text-stone-500 leading-relaxed">
                Teknologi WebGL &amp; Three.js canggih memungkinkan Anda memvisualisasikan piring dari segala sudut dengan akurasi pencahayaan studio nyata.
              </p>
            </div>

            {/* Grid 3 Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              {/* Feature 1 */}
              <div className="p-8 rounded-2xl bg-[#FBFBFA] border border-stone-200/80 hover:border-stone-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 flex flex-col justify-between group">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-white border border-stone-200/80 text-[#1C1917] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <Compass className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1C1917] mb-3 tracking-wide">
                    Rotasi Bebas &amp; Inspeksi Bawah Piring
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed mb-6">
                    Bukan sekadar gambar statis 2D. Putar piring 360° secara bebas, lihat tampak atas, samping, hingga ring kaki keramik di bagian bawah piring.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#57534E] tracking-wide">
                  <span>Sudut 3D, Top View &amp; Bottom View</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-2xl bg-[#FBFBFA] border border-stone-200/80 hover:border-stone-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 flex flex-col justify-between group">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-white border border-stone-200/80 text-[#1C1917] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <Layers className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1C1917] mb-3 tracking-wide">
                    Cetak Melengkung Menyeluruh
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed mb-6">
                    Geometri decal kami mengikuti lekukan porselen secara presisi. Desain Anda mengalir mulus dari cekungan tengah hingga ke bibir piring tanpa terpotong.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#57534E] tracking-wide">
                  <span>Presisi Geometri Spline Lathe</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-2xl bg-[#FBFBFA] border border-stone-200/80 hover:border-stone-300 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200 flex flex-col justify-between group">
                <div>
                  <div className="w-11 h-11 rounded-xl bg-white border border-stone-200/80 text-[#1C1917] flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                    <Camera className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#1C1917] mb-3 tracking-wide">
                    Ekspor Foto 2K &amp; 4K Ultra HD
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed mb-6">
                    Unduh snapshot beresolusi master hingga 4096x4096 px dengan sekali klik. Siap untuk presentasi proposal klien atau katalog digital bisnis Anda.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-[#57534E] tracking-wide">
                  <span>Unduh PNG Super Tajam Tanpa Lag</span>
                </div>
              </div>
            </div>

            {/* Live Interactive Palette & Rim Playground */}
            <div className="p-8 sm:p-12 rounded-2xl bg-[#F4F3F0] border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-[#1C1917] relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-600 bg-white px-3 py-1 rounded-full border border-stone-200/80">
                    Eksplorasi Kombinasi Warna
                  </span>
                  <h3 className="font-[family-name:var(--font-display)] text-2xl sm:text-3xl font-semibold mt-4 mb-3 text-[#1C1917]">
                    Kombinasikan Glasir &amp; Trim Emas Impian Anda
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed mb-8 max-w-xl">
                    Pilih warna glasir favorit dan padukan dengan aksen metallic rim emas 24K atau platinum silver. Lihat bagaimana kontras warna saling melengkapi secara elegan.
                  </p>

                  {/* Color Selector */}
                  <div className="mb-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500 mb-3">
                      Pilihan Warna Glasir: <span className="text-[#1C1917] font-semibold">{selectedPreviewColor.name}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      {PLATE_COLORS.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedPreviewColor(c)}
                          className={`w-10 h-10 rounded-full border transition-all duration-200 cursor-pointer flex items-center justify-center ${
                            selectedPreviewColor.id === c.id
                              ? 'scale-110 border-[#1C1917] ring-2 ring-stone-400/40'
                              : 'border-stone-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        >
                          {selectedPreviewColor.id === c.id && (
                            <Check className={`w-4 h-4 ${c.id === 'porcelain-white' || c.id === 'warm-cream' ? 'text-[#1C1917]' : 'text-white'}`} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rim Trim Selector */}
                  <div className="mb-8">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500 mb-3">
                      Aksen Metallic Rim Trim: <span className="text-[#1C1917] font-semibold">{selectedPreviewTrim.name}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {RIM_TRIMS.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setSelectedPreviewTrim(r)}
                          className={`py-2 px-3.5 rounded-xl text-xs font-medium transition-all duration-200 cursor-pointer ${
                            selectedPreviewTrim.id === r.id
                              ? 'bg-[#1C1917] text-white shadow-xs'
                              : 'bg-white hover:bg-[#FBFBFA] text-stone-700 border border-stone-200/80'
                          }`}
                        >
                          {r.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/"
                    className="inline-flex items-center gap-2.5 py-3.5 px-6 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-white font-medium text-sm tracking-wide shadow-[0_4px_14px_rgba(28,25,23,0.12)] active:scale-95 transition-all duration-200"
                  >
                    <span>Coba di Studio 3D Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Simulated Plate Card */}
                <div className="lg:col-span-5 flex justify-center">
                  <div
                    className="relative w-72 sm:w-80 aspect-square rounded-full flex items-center justify-center p-4 transition-all duration-500"
                    style={{
                      backgroundColor: selectedPreviewColor.hex,
                      boxShadow: `0 22px 45px -16px rgba(28, 25, 23, 0.25), inset 0 2px 4px rgba(255, 255, 255, 0.5), inset 0 -6px 12px rgba(28, 25, 23, 0.12)`,
                    }}
                  >
                    {/* Metallic Rim Ring */}
                    {selectedPreviewTrim.id !== 'none' && (
                      <div
                        className="absolute inset-2 rounded-full border-4 pointer-events-none transition-all duration-300"
                        style={{
                          borderColor: selectedPreviewTrim.hex,
                          boxShadow: `0 0 12px ${selectedPreviewTrim.hex}40`,
                        }}
                      />
                    )}

                    {/* Inner Basin Specular Highlight */}
                    <div className="w-48 sm:w-56 aspect-square rounded-full border border-black/8 flex items-center justify-center p-6 text-center">
                      <div className="text-center">
                        <Sparkles className="w-7 h-7 mx-auto mb-2 opacity-50" style={{ color: selectedPreviewTrim.hex !== 'transparent' ? selectedPreviewTrim.hex : (selectedPreviewColor.id === 'porcelain-white' || selectedPreviewColor.id === 'warm-cream' ? '#57534E' : '#FFFFFF') }} />
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase opacity-75" style={{ color: selectedPreviewColor.id === 'porcelain-white' || selectedPreviewColor.id === 'warm-cream' ? '#1C1917' : '#ffffff' }}>
                          CERAMIX
                        </p>
                        <p className="text-[10px] opacity-60 font-mono mt-1" style={{ color: selectedPreviewColor.id === 'porcelain-white' || selectedPreviewColor.id === 'warm-cream' ? '#57534E' : '#e7e5e4' }}>
                          {selectedPreviewColor.name}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Craftsmanship & Porcelain Material */}
        <section id="material" className="py-20 lg:py-28 bg-[#F4F3F0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 relative">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-200/80">
                  <Image
                    src="/images/artisan-craft.jpg"
                    alt="Pengerjaan porselen artisan dengan lukisan monogram emas"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/75 via-transparent to-transparent flex items-end p-8">
                    <p className="text-white text-sm font-normal italic leading-relaxed">
                      &ldquo;Setiap piring melewati proses pembakaran kiln 1.250°C dan finishing tangan oleh master keramik.&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 flex flex-col items-start">
                <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-600 bg-white px-3.5 py-1.5 rounded-full border border-stone-200/80 mb-5">
                  Kualitas Material Premium
                </span>
                <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-semibold tracking-tight text-[#1C1917] mb-5">
                  Porselen Asli, Bukan Keramik Biasa
                </h2>
                <p className="text-base text-stone-600 leading-relaxed mb-6">
                  Kami hanya menggunakan lempung kaolin berkualitas tinggi yang dipadatkan dengan tekanan hidrolik presisi dan dibakar dalam kiln suhu tinggi. Hasilnya adalah piring yang padat, berbobot mantap, dan berdenting nyaring khas fine porcelain.
                </p>

                <div className="space-y-4 w-full mb-8">
                  <div className="flex items-start gap-3.5">
                    <div className="p-1.5 rounded-full bg-white border border-stone-200/80 text-[#4A5D4E] mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1C1917]">Glasir Non-Porous &amp; Bebas Noda</h4>
                      <p className="text-xs text-stone-500 mt-0.5">Tidak menyerap minyak kuah gulai, saus tomat, atau kopi sehingga mudah dibersihkan tanpa bau.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-1.5 rounded-full bg-white border border-stone-200/80 text-[#57534E] mt-0.5">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1C1917]">Pembakaran Kiln 1.250°C</h4>
                      <p className="text-xs text-stone-500 mt-0.5">Warna motif menyatu permanen di dalam lapisan glasir, anti pudar dan tahan gesekan pisau steak.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-1.5 rounded-full bg-white border border-stone-200/80 text-[#78716C] mt-0.5">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#1C1917]">Aksen Emas 24 Karat Asli</h4>
                      <p className="text-xs text-stone-500 mt-0.5">Dibalur dengan pasta emas luster cair berkilau tinggi yang diaplikasikan secara teliti.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full p-4 rounded-2xl bg-white border border-stone-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  {PLATE_SIZES.map((size) => (
                    <div key={size.id} className="text-center p-2">
                      <p className="text-xs font-semibold text-[#1C1917]">{size.name}</p>
                      <p className="text-xs text-[#57534E] font-medium mt-0.5">{size.diameterCm} cm</p>
                      <p className="text-[11px] text-stone-400 mt-0.5">Mulai Rp {size.basePrice.toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Business & Use Case Solutions */}
        <section id="solusi" className="py-20 lg:py-28 bg-white border-t border-stone-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-600 bg-[#F4F3F0] px-3.5 py-1.5 rounded-full border border-stone-200/80">
                Solusi Berbagai Kebutuhan
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-semibold tracking-tight text-[#1C1917] mt-5 mb-4">
                Dipercaya oleh Restoran, Pasangan &amp; Korporat
              </h2>
              <p className="text-base text-stone-500 leading-relaxed">
                Pilih kategori kebutuhan Anda dan lihat bagaimana piring kustom Ceramix 3D menghadirkan sentuhan personal yang berkelas.
              </p>
            </div>

            {/* Use Case Tabs */}
            <div className="flex items-center justify-center flex-wrap gap-2.5 mb-12">
              <button
                onClick={() => setActiveUseCase('restaurant')}
                className={`py-2.5 px-5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  activeUseCase === 'restaurant'
                    ? 'bg-[#1C1917] text-white shadow-xs'
                    : 'bg-[#F4F3F0] text-stone-600 hover:text-[#1C1917] border border-stone-200/60'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Restoran &amp; Fine Dining</span>
              </button>

              <button
                onClick={() => setActiveUseCase('wedding')}
                className={`py-2.5 px-5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  activeUseCase === 'wedding'
                    ? 'bg-[#1C1917] text-white shadow-xs'
                    : 'bg-[#F4F3F0] text-stone-600 hover:text-[#1C1917] border border-stone-200/60'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>Pernikahan &amp; Wedding Gift</span>
              </button>

              <button
                onClick={() => setActiveUseCase('corporate')}
                className={`py-2.5 px-5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  activeUseCase === 'corporate'
                    ? 'bg-[#1C1917] text-white shadow-xs'
                    : 'bg-[#F4F3F0] text-stone-600 hover:text-[#1C1917] border border-stone-200/60'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Hampers Korporat &amp; B2B</span>
              </button>

              <button
                onClick={() => setActiveUseCase('cafe')}
                className={`py-2.5 px-5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer ${
                  activeUseCase === 'cafe'
                    ? 'bg-[#1C1917] text-white shadow-xs'
                    : 'bg-[#F4F3F0] text-stone-600 hover:text-[#1C1917] border border-stone-200/60'
                }`}
              >
                <Coffee className="w-4 h-4" />
                <span>Kafe &amp; Bakery</span>
              </button>
            </div>

            {/* Selected Use Case Content Card */}
            <div className="p-8 sm:p-12 rounded-2xl bg-[#FBFBFA] border border-stone-200/80 max-w-4xl mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[#1C1917] mb-3">
                {useCases[activeUseCase].title}
              </h3>
              <p className="text-sm sm:text-base text-stone-600 leading-relaxed mb-6">
                {useCases[activeUseCase].desc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                {useCases[activeUseCase].features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-medium text-stone-700">
                    <CheckCircle2 className="w-4 h-4 text-[#4A5D4E] shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-xl bg-white border border-stone-200/80 italic text-xs text-stone-600 mb-6">
                &ldquo;{useCases[activeUseCase].quote}&rdquo;
                <p className="font-semibold text-[#1C1917] not-italic mt-2">
                  — {useCases[activeUseCase].author}
                </p>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href="/"
                  className="py-3 px-6 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-white font-medium text-xs sm:text-sm tracking-wide shadow-xs active:scale-95 transition-all duration-200 flex items-center gap-2"
                >
                  <span>Buka Studio 3D untuk Kategori Ini</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FAQ Section */}
        <section id="faq" className="py-20 lg:py-28 bg-[#F4F3F0]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-stone-600 bg-white px-3.5 py-1.5 rounded-full border border-stone-200/80">
                Tanya Jawab
              </span>
              <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-semibold tracking-tight text-[#1C1917] mt-5 mb-4">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-base text-stone-500">
                Punya pertanyaan sebelum memesan? Temukan jawaban lengkap mengenai proses produksi, keamanan, dan pengiriman kami.
              </p>
            </div>

            <div className="space-y-3.5">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-stone-200/80 bg-white overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all duration-200"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-[#1C1917] cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-stone-400 shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-[#1C1917]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-sm text-stone-600 leading-relaxed border-t border-stone-200/60 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 7. Final High-Conversion CTA Banner */}
        <section className="py-20 bg-[#1C1917] text-[#FCFBF9] relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-stone-200 text-[11px] font-medium uppercase tracking-[0.1em] mb-6 border border-white/15">
              <Sparkles className="w-3.5 h-3.5" />
              Studio 3D Siap Digunakan Tanpa Registrasi
            </span>

            <h2 className="font-[family-name:var(--font-display)] text-3xl sm:text-5xl font-semibold tracking-tight mb-6 leading-tight">
              Siap Mewujudkan Piring Impian Anda?
            </h2>
            <p className="text-base sm:text-lg text-stone-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Masuk ke Studio 3D sekarang, unggah motif Anda secara langsung, dan lihat hasilnya berputar dalam 360° sebelum melakukan pemesanan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/"
                className="w-full sm:w-auto py-4 px-9 rounded-xl bg-[#FCFBF9] hover:bg-[#F4F3F0] text-[#1C1917] font-semibold text-sm sm:text-base tracking-wide shadow-lg active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 group"
              >
                <span>Buka Studio 3D Ceramix</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Footer */}
      <footer className="bg-white border-t border-stone-200/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#1C1917] flex items-center justify-center text-[#FCFBF9]">
              <div className="w-4 h-4 rounded-full border border-[#FCFBF9]/70 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FCFBF9]" />
              </div>
            </div>
            <div>
              <p className="font-[family-name:var(--font-display)] font-semibold text-sm tracking-[0.06em] text-[#1C1917]">CERAMIX 3D STUDIO</p>
              <p className="text-xs text-stone-500">Custom Porcelain Plates &amp; Bespoke Tableware</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-stone-500 font-medium">
            <Link href="/" className="hover:text-[#1C1917] transition-colors">
              Studio Kustom 3D
            </Link>
            <a href="#fitur" className="hover:text-[#1C1917] transition-colors">
              Fitur
            </a>
            <a href="#material" className="hover:text-[#1C1917] transition-colors">
              Material Glasir
            </a>
            <a href="#faq" className="hover:text-[#1C1917] transition-colors">
              FAQ
            </a>
          </div>

          <p className="text-xs text-stone-400">
            &copy; 2026 Ceramix 3D. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
