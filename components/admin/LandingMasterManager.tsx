'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Sparkles,
  Flame,
  Check,
  RefreshCw,
  Save,
  Tag,
  Megaphone,
  Sliders,
  AlertCircle
} from 'lucide-react';

interface SettingItem {
  key: string;
  section: string;
  title: string | null;
  content: string | null;
  metadata: any;
  isActive: boolean;
}

export default function LandingMasterManager() {
  const [settings, setSettings] = useState<Record<string, SettingItem>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedSuccessKey, setSavedSuccessKey] = useState<string | null>(null);

  const loadLandingSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/master/landing');
      const data = await res.json();
      if (data.settings) {
        const mapped: Record<string, SettingItem> = {};
        data.settings.forEach((s: SettingItem) => {
          mapped[s.key] = s;
        });
        setSettings(mapped);
      }
    } catch (err) {
      console.error('Failed to load landing settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLandingSettings();
  }, []);

  const handleUpdateSetting = async (key: string, payload: Partial<SettingItem>) => {
    setSavingKey(key);
    try {
      const current = settings[key] || { key, section: 'custom', title: '', content: '', metadata: {}, isActive: true };
      const updated = {
        ...current,
        ...payload,
        metadata: {
          ...(current.metadata || {}),
          ...(payload.metadata || {}),
        },
      };

      const res = await fetch('/api/admin/master/landing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      const data = await res.json();
      if (data.success) {
        setSettings((prev) => ({ ...prev, [key]: data.setting }));
        setSavedSuccessKey(key);
        setTimeout(() => setSavedSuccessKey(null), 2500);
      } else {
        alert(data.error || 'Gagal menyimpan perubahan');
      }
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setSavingKey(null);
    }
  };

  const hero = settings['hero_section'] || {
    key: 'hero_section',
    section: 'hero',
    title: 'Kustomisasi Piring Keramik 3D Eksklusif dengan Sentuhan Seni Bernilai Tinggi',
    content: 'Wujudkan piring porselen impian Anda secara interaktif 360 derajat. Kualitas hotel bintang lima dan restoran fine dining, dipanggang di kiln 1.250°C.',
    metadata: { badgeText: '✨ Koleksi Studio Keramik 2026', ctaText: 'Mulai Kustomisasi 3D' },
    isActive: true,
  };

  const promo = settings['promo_banner'] || {
    key: 'promo_banner',
    section: 'promo',
    title: 'Diskon Spesial Grosir Hingga 35% untuk Restoran & Kafe',
    content: 'Pesan sampel mulai dari 1 pcs dengan garansi anti-pecah 100% saat pengiriman kurir bergaransi.',
    metadata: { discountCode: 'CERAMIXVIP', minOrderPcs: 12 },
    isActive: true,
  };

  const kiln = settings['studio_announcement'] || {
    key: 'studio_announcement',
    section: 'announcement',
    title: 'Studio Kiln Online',
    content: 'Kapasitas pembakaran kiln saat ini normal (estimasi pengerjaan 3-5 hari kerja).',
    metadata: { kilnStatus: 'ONLINE', capacityPercent: 68 },
    isActive: true,
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            <span>Master Konten & Tampilan Landing Page</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Setiap perubahan teks atau promo di sini langsung disimpan ke PostgreSQL `site_settings` dan tampil di Landing Page.
          </p>
        </div>
        <button
          onClick={loadLandingSettings}
          className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. HERO SECTION CARD */}
        <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white text-sm">Hero Headline & Tagline</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-300">
                Section: HERO
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Badge Tagline Atas</label>
                <input
                  type="text"
                  value={hero.metadata?.badgeText || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      hero_section: {
                        ...hero,
                        metadata: { ...hero.metadata, badgeText: e.target.value },
                      },
                    }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Judul Utama (Headline)</label>
                <input
                  type="text"
                  value={hero.title || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      hero_section: { ...hero, title: e.target.value },
                    }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Deskripsi / Subtitle</label>
                <textarea
                  rows={3}
                  value={hero.content || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      hero_section: { ...hero, content: e.target.value },
                    }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Teks Tombol Aksi (CTA)</label>
                <input
                  type="text"
                  value={hero.metadata?.ctaText || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      hero_section: {
                        ...hero,
                        metadata: { ...hero.metadata, ctaText: e.target.value },
                      },
                    }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-zinc-800 flex items-center justify-between mt-4">
            {savedSuccessKey === 'hero_section' ? (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Berhasil disimpan ke DB!</span>
              </span>
            ) : (
              <span className="text-[11px] text-zinc-500">Live sync ke `/landing`</span>
            )}
            <button
              onClick={() => handleUpdateSetting('hero_section', hero)}
              disabled={savingKey === 'hero_section'}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingKey === 'hero_section' ? 'Menyimpan...' : 'Simpan Hero'}</span>
            </button>
          </div>
        </div>

        {/* 2. PROMO & ANNOUNCEMENT BANNER */}
        <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-purple-400" />
                <h3 className="font-bold text-white text-sm">Banner Promo Grosir & Event</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-purple-300">
                Section: PROMO
              </span>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Judul Penawaran Promo</label>
                <input
                  type="text"
                  value={promo.title || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      promo_banner: { ...promo, title: e.target.value },
                    }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white font-semibold"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Rincian Penawaran & Garansi</label>
                <textarea
                  rows={3}
                  value={promo.content || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      promo_banner: { ...promo, content: e.target.value },
                    }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Kode Voucher / Kupon</label>
                  <input
                    type="text"
                    value={promo.metadata?.discountCode || ''}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        promo_banner: {
                          ...promo,
                          metadata: { ...promo.metadata, discountCode: e.target.value },
                        },
                      }))
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-amber-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Minimal Order (Pcs)</label>
                  <input
                    type="number"
                    value={promo.metadata?.minOrderPcs || 12}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        promo_banner: {
                          ...promo,
                          metadata: { ...promo.metadata, minOrderPcs: Number(e.target.value) },
                        },
                      }))
                    }
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-zinc-800 flex items-center justify-between mt-4">
            {savedSuccessKey === 'promo_banner' ? (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Berhasil disimpan ke DB!</span>
              </span>
            ) : (
              <span className="text-[11px] text-zinc-500">Live sync ke `/landing`</span>
            )}
            <button
              onClick={() => handleUpdateSetting('promo_banner', promo)}
              disabled={savingKey === 'promo_banner'}
              className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingKey === 'promo_banner' ? 'Menyimpan...' : 'Simpan Promo'}</span>
            </button>
          </div>
        </div>

        {/* 3. STUDIO KILN STATUS (OPERASIONAL) */}
        <div className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-6 shadow-xl flex flex-col justify-between lg:col-span-2">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <h3 className="font-bold text-white text-sm">Status Operasional Studio Kiln (1.250°C)</h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-orange-300">
                Section: KILN_STATUS
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-zinc-300 font-medium mb-1">Status Kiln Pembakaran</label>
                <select
                  value={kiln.metadata?.kilnStatus || 'ONLINE'}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      studio_announcement: {
                        ...kiln,
                        metadata: { ...kiln.metadata, kilnStatus: e.target.value },
                      },
                    }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white font-bold"
                >
                  <option value="ONLINE">🟢 Kiln Online (Normal)</option>
                  <option value="HIGH_LOAD">🟡 Kiln High Load (Antrean Padat)</option>
                  <option value="MAINTENANCE">🔴 Maintenance Berkala</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Kapasitas Tungku (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={kiln.metadata?.capacityPercent || 65}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      studio_announcement: {
                        ...kiln,
                        metadata: { ...kiln.metadata, capacityPercent: Number(e.target.value) },
                      },
                    }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-medium mb-1">Estimasi Waktu Pengerjaan</label>
                <input
                  type="text"
                  value={kiln.content || ''}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      studio_announcement: { ...kiln, content: e.target.value },
                    }))
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white"
                />
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-zinc-800 flex items-center justify-between mt-4">
            {savedSuccessKey === 'studio_announcement' ? (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Status Kiln Berhasil Disimpan!</span>
              </span>
            ) : (
              <span className="text-[11px] text-zinc-500">Live update status studio</span>
            )}
            <button
              onClick={() => handleUpdateSetting('studio_announcement', kiln)}
              disabled={savingKey === 'studio_announcement'}
              className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingKey === 'studio_announcement' ? 'Menyimpan...' : 'Simpan Status Kiln'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
