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
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-indigo-500 selection:text-white">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200/80 dark:border-zinc-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/landing" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-zinc-900 dark:text-white">
                  CERAMIX <span className="text-indigo-600 dark:text-indigo-400">3D</span>
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  Artisan Porcelain
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                Piring Porselen Kustom & Studio 3D Real-Time
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-zinc-600 dark:text-zinc-300">
            <a href="#fitur" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
              Fitur 3D
            </a>
            <a href="#material" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
              Material & Glasir
            </a>
            <a href="#solusi" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
              Solusi Bisnis
            </a>
            <a href="#faq" className="hover:text-indigo-600 dark:hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          {/* Direct CTA Link to the 3D Studio & Order Tracker */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/track"
              className="hidden sm:inline-flex items-center gap-1.5 py-2.5 px-4 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 text-zinc-700 dark:text-zinc-200 font-bold text-xs shadow-xs transition-all"
            >
              Lacak Pesanan
            </Link>
            <Link
              href="/"
              className="relative group py-2.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 active:scale-95 transition-all flex items-center gap-2"
            >
              <span>Buka Studio 3D</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* Dynamic Kiln & Promo Bar from Admin CMS */}
      {(promoCms || kilnCms) && (
        <div className="bg-gradient-to-r from-indigo-950 via-zinc-900 to-indigo-950 text-white border-b border-indigo-500/20 px-4 py-2 text-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {kilnCms?.title || 'Studio Kiln Online'}
              </span>
              <span className="text-zinc-300 truncate max-w-md">
                {kilnCms?.content || 'Kapasitas pembakaran kiln normal (3-5 hari kerja).'}
              </span>
            </div>
            {promoCms && (
              <div className="flex items-center gap-2 text-amber-300 font-semibold">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{promoCms.title}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <main>
        {/* 2. Hero Section */}
        <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50 dark:from-zinc-900/50 dark:via-zinc-950 dark:to-zinc-950">
          {/* Atmospheric background glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Headline & Action */}
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                {/* Floating Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>{heroCms?.metadata?.badgeText || 'Kustomisasi Piring Porselen 3D Real-Time Pertama di Indonesia'}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-zinc-900 dark:text-white mb-6">
                  {heroCms?.title ? (
                    heroCms.title
                  ) : (
                    <>
                      Wujudkan Piring Porselen Eksklusif dengan{' '}
                      <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 bg-clip-text text-transparent">
                        Visualisasi 3D Nyata
                      </span>
                    </>
                  )}
                </h1>

                <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed mb-8 max-w-2xl">
                  {heroCms?.content ||
                    'Rancang motif kustom, eksplorasi tekstur glasir keramik mewah, dan tambahkan aksen 24K gold rim trim. Putar 360° hingga ke dasar piring sebelum diproduksi. Sempurna untuk fine dining, souvenir pernikahan, dan koleksi prestisius.'}
                </p>

                {/* Primary & Secondary Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-12">
                  <Link
                    href="/"
                    className="py-4 px-8 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-base shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/40 active:scale-98 transition-all flex items-center justify-center gap-3 group"
                  >
                    <Sparkles className="w-5 h-5 text-amber-300" />
                    <span>{heroCms?.metadata?.ctaText || 'Mulai Kustomisasi 3D'}</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
                  </Link>

                  <a
                    href="#material"
                    className="py-4 px-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold text-base shadow-sm transition-all flex items-center justify-center gap-2"
                  >
                    <span>Lihat Bahan & Glasir</span>
                  </a>
                </div>

                {/* Key Metric Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80">
                  <div>
                    <p className="text-2xl font-black text-zinc-900 dark:text-white">60+ FPS</p>
                    <p className="text-xs text-zinc-500 font-medium">Interaktif Real-Time</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-amber-600 dark:text-amber-400">2K / 4K</p>
                    <p className="text-xs text-zinc-500 font-medium">Ultra HD Snapshot</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">1.250°C</p>
                    <p className="text-xs text-zinc-500 font-medium">Kiln-Fired Porcelain</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</p>
                    <p className="text-xs text-zinc-500 font-medium">Food-Grade Safe</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Showcase Visual */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto w-full max-w-lg rounded-3xl p-3 bg-gradient-to-tr from-indigo-500/20 via-purple-500/10 to-amber-500/20 backdrop-blur-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-2xl">
                  {/* Photo Visual Preview */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900 shadow-inner group">
                    <Image
                      src="/images/hero-plate.jpg"
                      alt="Piring Porselen Mewah dengan 24K Gold Rim Trim dan Motif Delft Blue"
                      fill
                      priority
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Koleksi Signature</p>
                          <h3 className="text-lg font-bold text-white">Royal Delft Floral • 24K Gold Rim</h3>
                        </div>
                        <Link
                          href="/"
                          className="p-3 rounded-full bg-white/20 hover:bg-white text-white hover:text-indigo-900 backdrop-blur-md transition-all cursor-pointer"
                          title="Coba di Studio 3D"
                        >
                          <Maximize2 className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Floating Interactive Badge Overlays */}
                  <div className="absolute -top-4 -right-4 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl flex items-center gap-2.5 text-xs font-bold text-zinc-900 dark:text-white">
                    <Compass className="w-4 h-4 text-indigo-600 animate-spin" style={{ animationDuration: '6s' }} />
                    <span>Rotasi Penuh 360°</span>
                  </div>

                  <div className="absolute -bottom-4 -left-4 px-4 py-2.5 rounded-2xl bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 shadow-xl flex items-center gap-2.5 text-xs font-bold text-zinc-900 dark:text-white">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>24K Gold Luster Trim</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Interactive Preview & Customization Showcase */}
        <section id="fitur" className="py-20 lg:py-28 bg-white dark:bg-zinc-900 border-y border-zinc-200/80 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                Fitur Unggulan Studio
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-4 mb-4">
                Kontrol Penuh dalam Sentuhan Jari
              </h2>
              <p className="text-base text-zinc-600 dark:text-zinc-400">
                Teknologi WebGL & Three.js canggih memungkinkan Anda memvisualisasikan piring dari segala sudut dengan akurasi pencahayaan studio nyata.
              </p>
            </div>

            {/* Grid 3 Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {/* Feature 1 */}
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-500/50 transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                    Rotasi Bebas & Inspeksi Bawah Piring
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                    Bukan sekadar gambar statis 2D. Putar piring 360° secara bebas, lihat tampak atas, samping, hingga ring kaki keramik di bagian bawah piring.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  <span>Sudut 3D, Top View & Bottom View</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-500/50 transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                    Cetak Melengkung Menyeluruh (Full Surface)
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                    Geometri decal kami mengikuti lekukan porselen secara presisi. Desain Anda mengalir mulus dari cekungan tengah hingga ke bibir piring tanpa terpotong.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-purple-600 dark:text-purple-400">
                  <span>Presisi Geometri Spline Lathe</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-3xl bg-slate-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-indigo-500/50 transition-all flex flex-col justify-between group">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">
                    Ekspor Foto 2K & 4K Ultra HD
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                    Unduh snapshot beresolusi master hingga 4096x4096 px dengan sekali klik. Siap untuk presentasi proposal klien atau katalog digital bisnis Anda.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <span>Unduh PNG Super Tajam Tanpa Lag</span>
                </div>
              </div>
            </div>

            {/* Live Interactive Palette & Rim Playground */}
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-indigo-900 via-zinc-900 to-black text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                    Eksplorasi Kombinasi Warna
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-3 mb-4">
                    Kombinasikan Glasir & Trim Emas Impian Anda
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed mb-8 max-w-xl">
                    Pilih warna glasir favorit dan padukan dengan aksen metallic rim emas 24K atau platinum silver. Lihat bagaimana kontras warna saling melengkapi secara elegan.
                  </p>

                  {/* Color Selector */}
                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                      Pilihan Warna Glasir: <span className="text-white font-semibold">{selectedPreviewColor.name}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-3">
                      {PLATE_COLORS.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedPreviewColor(c)}
                          className={`w-10 h-10 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                            selectedPreviewColor.id === c.id
                              ? 'scale-115 border-white shadow-lg shadow-white/20'
                              : 'border-zinc-700 hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        >
                          {selectedPreviewColor.id === c.id && (
                            <Check className={`w-4 h-4 ${c.id === 'porcelain-white' || c.id === 'warm-cream' ? 'text-zinc-900' : 'text-white'}`} />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rim Trim Selector */}
                  <div className="mb-8">
                    <p className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3">
                      Aksen Metallic Rim Trim: <span className="text-amber-400 font-semibold">{selectedPreviewTrim.name}</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {RIM_TRIMS.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setSelectedPreviewTrim(r)}
                          className={`py-2 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            selectedPreviewTrim.id === r.id
                              ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-400/30'
                              : 'bg-zinc-800/80 hover:bg-zinc-800 text-zinc-300 border border-zinc-700'
                          }`}
                        >
                          {r.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Link
                    href="/"
                    className="inline-flex items-center gap-3 py-3.5 px-6 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-900 font-bold text-sm shadow-xl active:scale-95 transition-all"
                  >
                    <span>Coba di Studio 3D Sekarang</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Simulated Plate Card */}
                <div className="lg:col-span-5 flex justify-center">
                  <div className="relative w-72 sm:w-80 aspect-square rounded-full flex items-center justify-center shadow-2xl p-4 transition-all duration-500"
                    style={{
                      backgroundColor: selectedPreviewColor.hex,
                      boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 2px 4px rgba(255, 255, 255, 0.4), inset 0 -6px 12px rgba(0, 0, 0, 0.5)`,
                    }}
                  >
                    {/* Metallic Rim Ring */}
                    {selectedPreviewTrim.id !== 'none' && (
                      <div
                        className="absolute inset-2 rounded-full border-4 pointer-events-none transition-all duration-300"
                        style={{
                          borderColor: selectedPreviewTrim.hex,
                          boxShadow: `0 0 15px ${selectedPreviewTrim.hex}60`,
                        }}
                      />
                    )}

                    {/* Inner Basin Specular Highlight */}
                    <div className="w-48 sm:w-56 aspect-square rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center p-6 text-center">
                      <div className="text-center">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-60" style={{ color: selectedPreviewTrim.hex !== 'transparent' ? selectedPreviewTrim.hex : '#ffffff' }} />
                        <p className="text-xs font-bold tracking-widest uppercase opacity-75" style={{ color: selectedPreviewColor.id === 'porcelain-white' || selectedPreviewColor.id === 'warm-cream' ? '#18181b' : '#ffffff' }}>
                          CERAMIX
                        </p>
                        <p className="text-[10px] opacity-60 font-mono" style={{ color: selectedPreviewColor.id === 'porcelain-white' || selectedPreviewColor.id === 'warm-cream' ? '#52525b' : '#a1a1aa' }}>
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
        <section id="material" className="py-20 lg:py-28 bg-slate-50 dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 relative">
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-zinc-200 dark:border-zinc-800">
                  <Image
                    src="/images/artisan-craft.jpg"
                    alt="Pengerjaan porselen artisan dengan lukisan monogram emas"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-8">
                    <p className="text-white text-sm font-semibold italic">
                      &ldquo;Setiap piring melewati proses pembakaran kiln 1.250°C dan finishing tangan oleh master keramik.&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 flex flex-col items-start">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 mb-4">
                  Kualitas Material Premium
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-6">
                  Porselen Asli, Bukan Keramik Biasa
                </h2>
                <p className="text-base text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                  Kami hanya menggunakan lempung kaolin berkualitas tinggi yang dipadatkan dengan tekanan hidrolik presisi dan dibakar dalam kiln suhu tinggi. Hasilnya adalah piring yang padat, berbobot mantap, dan berdenting nyaring khas fine porcelain.
                </p>

                <div className="space-y-4 w-full mb-8">
                  <div className="flex items-start gap-3.5">
                    <div className="p-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-1">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Glasir Non-Porous & Bebas Noda</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Tidak menyerap minyak kuah gulai, saus tomat, atau kopi sehingga mudah dibersihkan tanpa bau.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mt-1">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Pembakaran Kiln 1.250°C</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Warna motif menyatu permanen di dalam lapisan glasir, anti pudar dan tahan gesekan pisau steak.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="p-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 mt-1">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Aksen Emas 24 Karat Asli</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">Dibalur dengan pasta emas luster cair berkilau tinggi yang diaplikasikan secara teliti.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 w-full p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                  {PLATE_SIZES.map((size) => (
                    <div key={size.id} className="text-center p-2">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white">{size.name}</p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{size.diameterCm} cm</p>
                      <p className="text-[11px] text-zinc-400">Mulai Rp {size.basePrice.toLocaleString('id-ID')}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Business & Use Case Solutions */}
        <section id="solusi" className="py-20 lg:py-28 bg-white dark:bg-zinc-900 border-t border-zinc-200/80 dark:border-zinc-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                Solusi Berbagai Kebutuhan
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-4 mb-4">
                Dipercaya oleh Restoran, Pasangan & Korporat
              </h2>
              <p className="text-base text-zinc-600 dark:text-zinc-400">
                Pilih kategori kebutuhan Anda dan lihat bagaimana piring kustom Ceramix 3D menghadirkan sentuhan personal yang berkelas.
              </p>
            </div>

            {/* Use Case Tabs */}
            <div className="flex items-center justify-center flex-wrap gap-2.5 mb-12">
              <button
                onClick={() => setActiveUseCase('restaurant')}
                className={`py-2.5 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeUseCase === 'restaurant'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Restoran & Fine Dining</span>
              </button>

              <button
                onClick={() => setActiveUseCase('wedding')}
                className={`py-2.5 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeUseCase === 'wedding'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span>Pernikahan & Wedding Gift</span>
              </button>

              <button
                onClick={() => setActiveUseCase('corporate')}
                className={`py-2.5 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeUseCase === 'corporate'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Hampers Korporat & B2B</span>
              </button>

              <button
                onClick={() => setActiveUseCase('cafe')}
                className={`py-2.5 px-5 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                  activeUseCase === 'cafe'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <Coffee className="w-4 h-4" />
                <span>Kafe & Bakery</span>
              </button>
            </div>

            {/* Selected Use Case Content Card */}
            <div className="p-8 sm:p-12 rounded-3xl bg-slate-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 max-w-4xl mx-auto shadow-xl">
              <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-3">
                {useCases[activeUseCase].title}
              </h3>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed mb-6">
                {useCases[activeUseCase].desc}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                {useCases[activeUseCase].features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 italic text-xs text-zinc-600 dark:text-zinc-400 mb-6">
                &ldquo;{useCases[activeUseCase].quote}&rdquo;
                <p className="font-bold text-zinc-800 dark:text-zinc-200 not-italic mt-2">
                  — {useCases[activeUseCase].author}
                </p>
              </div>

              <div className="flex items-center justify-end">
                <Link
                  href="/"
                  className="py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>Buka Studio 3D untuk Kategori Ini</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FAQ Section */}
        <section id="faq" className="py-20 lg:py-28 bg-slate-50 dark:bg-zinc-950">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
                Tanya Jawab
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mt-4 mb-4">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="text-base text-zinc-600 dark:text-zinc-400">
                Punya pertanyaan sebelum memesan? Temukan jawaban lengkap mengenai proses produksi, keamanan, dan pengiriman kami.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm transition-all"
                  >
                    <button
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-zinc-900 dark:text-white cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-zinc-400 shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-indigo-600' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 pt-3">
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
        <section className="py-20 bg-gradient-to-tr from-indigo-700 via-indigo-800 to-purple-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent pointer-events-none" />

          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold uppercase tracking-wider mb-6 border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              Studio 3D Siap Digunakan Tanpa Registrasi
            </span>

            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6 leading-tight">
              Siap Mewujudkan Piring Impian Anda?
            </h2>
            <p className="text-base sm:text-lg text-indigo-100 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
              Masuk ke Studio 3D sekarang, unggah motif Anda secara langsung, dan lihat hasilnya berputar dalam 360° sebelum melakukan pemesanan.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/"
                className="w-full sm:w-auto py-4 px-9 rounded-2xl bg-white hover:bg-zinc-100 text-indigo-900 font-extrabold text-base shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 group"
              >
                <span>Buka Studio 3D Ceramix</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Footer */}
      <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-zinc-900 dark:text-white">CERAMIX 3D STUDIO</p>
              <p className="text-xs text-zinc-400">Custom Porcelain Plates & Bespoke Tableware</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-zinc-500 font-medium">
            <Link href="/" className="hover:text-indigo-600 transition-colors">
              Studio Kustom 3D
            </Link>
            <a href="#fitur" className="hover:text-indigo-600 transition-colors">
              Fitur
            </a>
            <a href="#material" className="hover:text-indigo-600 transition-colors">
              Material Glasir
            </a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">
              FAQ
            </a>
          </div>

          <p className="text-xs text-zinc-400">
            &copy; 2026 Ceramix 3D. Seluruh hak cipta dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
