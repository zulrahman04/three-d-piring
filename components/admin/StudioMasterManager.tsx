'use client';

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Palette,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  RefreshCw,
  Eye,
  AlertCircle,
  Tag
} from 'lucide-react';

interface PlateSize {
  id: string;
  name: string;
  diameterCm: number | string;
  basePrice: number | string;
  isActive: boolean;
}

interface PlateColor {
  id: string;
  name: string;
  hexCode: string;
  description: string | null;
  isActive: boolean;
}

interface DesignPreset {
  id: string;
  name: string;
  category: string;
  dataUrl: string;
  thumbnailSvgUrl: string | null;
  isActive: boolean;
}

export default function StudioMasterManager() {
  const [activeSubTab, setActiveSubTab] = useState<'sizes' | 'colors' | 'presets'>('sizes');
  const [loading, setLoading] = useState(true);

  // Data states
  const [sizes, setSizes] = useState<PlateSize[]>([]);
  const [colors, setColors] = useState<PlateColor[]>([]);
  const [presets, setPresets] = useState<DesignPreset[]>([]);

  // Modal & Form states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'size' | 'color' | 'preset'>('size');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form inputs
  const [formSize, setFormSize] = useState({ id: '', name: '', diameterCm: 25, basePrice: 100000, isActive: true });
  const [formColor, setFormColor] = useState({ id: '', name: '', hexCode: '#FFFFFF', description: '', isActive: true });
  const [formPreset, setFormPreset] = useState({ id: '', name: '', category: 'Artistic', dataUrl: '', thumbnailSvgUrl: '', isActive: true });

  const loadAllMasterData = async () => {
    setLoading(true);
    try {
      const [resSizes, resColors, resPresets] = await Promise.all([
        fetch('/api/admin/master/sizes').then((r) => r.json()),
        fetch('/api/admin/master/colors').then((r) => r.json()),
        fetch('/api/admin/master/presets').then((r) => r.json()),
      ]);

      if (resSizes.sizes) setSizes(resSizes.sizes);
      if (resColors.colors) setColors(resColors.colors);
      if (resPresets.presets) setPresets(resPresets.presets);
    } catch (err) {
      console.error('Error loading master data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllMasterData();
  }, []);

  // Format ID from Name automatically
  const handleGenerateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  };

  // Open Add Modal
  const openAddModal = (type: 'size' | 'color' | 'preset') => {
    setModalType(type);
    setIsEditing(false);
    if (type === 'size') setFormSize({ id: '', name: '', diameterCm: 25, basePrice: 100000, isActive: true });
    if (type === 'color') setFormColor({ id: '', name: '', hexCode: '#FAF7F2', description: '', isActive: true });
    if (type === 'preset') setFormPreset({ id: '', name: '', category: 'Modern Porcelain', dataUrl: '', thumbnailSvgUrl: '', isActive: true });
    setModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (type: 'size' | 'color' | 'preset', item: any) => {
    setModalType(type);
    setIsEditing(true);
    if (type === 'size') {
      setFormSize({
        id: item.id,
        name: item.name,
        diameterCm: Number(item.diameterCm),
        basePrice: Number(item.basePrice),
        isActive: item.isActive,
      });
    }
    if (type === 'color') {
      setFormColor({
        id: item.id,
        name: item.name,
        hexCode: item.hexCode,
        description: item.description || '',
        isActive: item.isActive,
      });
    }
    if (type === 'preset') {
      setFormPreset({
        id: item.id,
        name: item.name,
        category: item.category,
        dataUrl: item.dataUrl,
        thumbnailSvgUrl: item.thumbnailSvgUrl || '',
        isActive: item.isActive,
      });
    }
    setModalOpen(true);
  };

  // Save Size
  const handleSaveSize = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/master/sizes', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formSize),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        loadAllMasterData();
      } else {
        alert(data.error || 'Gagal menyimpan ukuran piring');
      }
    } finally {
      setSaving(false);
    }
  };

  // Save Color
  const handleSaveColor = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/master/colors', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formColor),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        loadAllMasterData();
      } else {
        alert(data.error || 'Gagal menyimpan warna glasir');
      }
    } finally {
      setSaving(false);
    }
  };

  // Save Preset
  const handleSavePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/master/presets', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPreset),
      });
      const data = await res.json();
      if (data.success) {
        setModalOpen(false);
        loadAllMasterData();
      } else {
        alert(data.error || 'Gagal menyimpan motif desain');
      }
    } finally {
      setSaving(false);
    }
  };

  // Delete Item
  const handleDelete = async (type: 'size' | 'color' | 'preset', id: string) => {
    if (!confirm(`Hapus master data ini (${id}) secara permanen dari database?`)) return;
    const url = `/api/admin/master/${type === 'size' ? 'sizes' : type === 'color' ? 'colors' : 'presets'}?id=${id}`;
    const res = await fetch(url, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      loadAllMasterData();
    } else {
      alert(data.error || 'Gagal menghapus data');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/70 border border-zinc-800/90 rounded-2xl p-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('sizes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'sizes'
                ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Master Ukuran Piring ({sizes.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('colors')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'colors'
                ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Master Warna Glasir ({colors.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('presets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeSubTab === 'presets'
                ? 'bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Master Motif Desain ({presets.length})</span>
          </button>
        </div>

        <button
          onClick={() => openAddModal(activeSubTab === 'sizes' ? 'size' : activeSubTab === 'colors' ? 'color' : 'preset')}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>
            Tambah {activeSubTab === 'sizes' ? 'Ukuran' : activeSubTab === 'colors' ? 'Warna' : 'Motif'}
          </span>
        </button>
      </div>

      {/* 1. SIZES TABLE */}
      {activeSubTab === 'sizes' && (
        <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/60 border-b border-zinc-800/80 text-zinc-400 uppercase text-[11px]">
              <tr>
                <th className="px-5 py-3.5">ID / Slug</th>
                <th className="px-5 py-3.5">Nama Ukuran Piring</th>
                <th className="px-5 py-3.5">Diameter</th>
                <th className="px-5 py-3.5">Harga Dasar (Base)</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {sizes.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-amber-300">{s.id}</td>
                  <td className="px-5 py-4 font-medium text-white text-sm">{s.name}</td>
                  <td className="px-5 py-4 text-zinc-300 font-mono">{s.diameterCm} cm</td>
                  <td className="px-5 py-4 text-emerald-400 font-bold font-mono">
                    Rp {Number(s.basePrice).toLocaleString('id-ID')}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        s.isActive ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40' : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {s.isActive ? 'Aktif di Studio' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal('size', s)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete('size', s.id)}
                      className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-400 hover:text-red-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. COLORS GRID */}
      {activeSubTab === 'colors' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {colors.map((c) => (
            <div
              key={c.id}
              className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-5 flex items-center justify-between hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full border-2 border-zinc-700 shadow-md shrink-0"
                  style={{ backgroundColor: c.hexCode }}
                />
                <div>
                  <div className="font-bold text-white text-sm">{c.name}</div>
                  <div className="text-xs font-mono text-amber-300">{c.hexCode}</div>
                  <div className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{c.description || 'Glasir keramik'}</div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    c.isActive ? 'bg-emerald-950/60 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {c.isActive ? 'Aktif' : 'Off'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal('color', c)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete('color', c.id)}
                    className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 3. PRESETS GRID */}
      {activeSubTab === 'presets' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((p) => (
            <div
              key={p.id}
              className="bg-zinc-900/80 border border-zinc-800/90 rounded-2xl p-4 flex flex-col justify-between hover:border-zinc-700 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-14 h-14 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 border border-zinc-700 overflow-hidden shadow-sm">
                  {p.dataUrl ? (
                    <img src={p.dataUrl} alt={p.name} className="w-12 h-12 object-contain" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-zinc-400" />
                  )}
                </div>
                <div>
                  <div className="font-bold text-white text-sm">{p.name}</div>
                  <div className="text-[11px] text-amber-300 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>{p.category}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">ID: {p.id}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-zinc-800/80">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    p.isActive ? 'bg-emerald-950/60 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  {p.isActive ? 'Tampil di Studio' : 'Tersembunyi'}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal('preset', p)}
                    className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete('preset', p.id)}
                    className="p-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL FORM (SIZE / COLOR / PRESET) */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-3xl p-6 shadow-2xl my-auto text-zinc-100">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white">
                {isEditing ? 'Ubah' : 'Tambah'}{' '}
                {modalType === 'size' ? 'Ukuran Piring' : modalType === 'color' ? 'Warna Glasir' : 'Motif Desain'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* FORM: SIZE */}
            {modalType === 'size' && (
              <form onSubmit={handleSaveSize} className="py-4 space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">ID Slug Ukuran (unik)</label>
                  <input
                    type="text"
                    disabled={isEditing}
                    value={formSize.id}
                    onChange={(e) => setFormSize({ ...formSize, id: e.target.value })}
                    placeholder="misal: pasta-bowl"
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white font-mono disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Nama Ukuran Piring</label>
                  <input
                    type="text"
                    value={formSize.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormSize((prev) => ({
                        ...prev,
                        name,
                        id: isEditing ? prev.id : handleGenerateSlug(name),
                      }));
                    }}
                    placeholder="misal: Deep Pasta Bowl"
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Diameter (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formSize.diameterCm}
                      onChange={(e) => setFormSize({ ...formSize, diameterCm: Number(e.target.value) })}
                      required
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-300 font-medium mb-1">Harga Dasar (Rp)</label>
                    <input
                      type="number"
                      value={formSize.basePrice}
                      onChange={(e) => setFormSize({ ...formSize, basePrice: Number(e.target.value) })}
                      required
                      className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="sizeActive"
                    checked={formSize.isActive}
                    onChange={(e) => setFormSize({ ...formSize, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0"
                  />
                  <label htmlFor="sizeActive" className="text-zinc-300 font-medium cursor-pointer">
                    Aktifkan di Studio Kustomisasi 3D
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Ukuran Piring'}
                </button>
              </form>
            )}

            {/* FORM: COLOR */}
            {modalType === 'color' && (
              <form onSubmit={handleSaveColor} className="py-4 space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">ID Slug Warna</label>
                  <input
                    type="text"
                    disabled={isEditing}
                    value={formColor.id}
                    onChange={(e) => setFormColor({ ...formColor, id: e.target.value })}
                    placeholder="misal: royal-emerald"
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white font-mono disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Nama Warna Glasir</label>
                  <input
                    type="text"
                    value={formColor.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormColor((prev) => ({
                        ...prev,
                        name,
                        id: isEditing ? prev.id : handleGenerateSlug(name),
                      }));
                    }}
                    placeholder="misal: Royal Emerald"
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Kode Warna Hex</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={formColor.hexCode}
                      onChange={(e) => setFormColor({ ...formColor, hexCode: e.target.value.toUpperCase() })}
                      className="w-10 h-10 rounded-xl border border-zinc-700 cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={formColor.hexCode}
                      onChange={(e) => setFormColor({ ...formColor, hexCode: e.target.value.toUpperCase() })}
                      required
                      className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Deskripsi Nuansa Keramik</label>
                  <textarea
                    rows={2}
                    value={formColor.description}
                    onChange={(e) => setFormColor({ ...formColor, description: e.target.value })}
                    placeholder="misal: Hijau zamrud pekat bergaya kerajaan eropa klasik"
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="colorActive"
                    checked={formColor.isActive}
                    onChange={(e) => setFormColor({ ...formColor, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0"
                  />
                  <label htmlFor="colorActive" className="text-zinc-300 font-medium cursor-pointer">
                    Aktifkan warna ini di Studio 3D
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Warna Keramik'}
                </button>
              </form>
            )}

            {/* FORM: PRESET */}
            {modalType === 'preset' && (
              <form onSubmit={handleSavePreset} className="py-4 space-y-4 text-xs">
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">ID Slug Motif</label>
                  <input
                    type="text"
                    disabled={isEditing}
                    value={formPreset.id}
                    onChange={(e) => setFormPreset({ ...formPreset, id: e.target.value })}
                    placeholder="misal: batik-parang"
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white font-mono disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Nama Motif Desain</label>
                  <input
                    type="text"
                    value={formPreset.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormPreset((prev) => ({
                        ...prev,
                        name,
                        id: isEditing ? prev.id : handleGenerateSlug(name),
                      }));
                    }}
                    placeholder="misal: Batik Parang Barong"
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Kategori</label>
                  <input
                    type="text"
                    value={formPreset.category}
                    onChange={(e) => setFormPreset({ ...formPreset, category: e.target.value })}
                    placeholder="misal: Nusantara Heritage / Geometric"
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-zinc-300 font-medium mb-1">Data URL / Image URL Gambar</label>
                  <textarea
                    rows={3}
                    value={formPreset.dataUrl}
                    onChange={(e) => setFormPreset({ ...formPreset, dataUrl: e.target.value })}
                    placeholder="data:image/svg+xml;... atau URL gambar PNG transparan"
                    required
                    className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-2.5 text-white font-mono text-[11px]"
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="presetActive"
                    checked={formPreset.isActive}
                    onChange={(e) => setFormPreset({ ...formPreset, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500 focus:ring-0"
                  />
                  <label htmlFor="presetActive" className="text-zinc-300 font-medium cursor-pointer">
                    Tampilkan preset ini di katalog Studio 3D
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 transition-all cursor-pointer"
                >
                  {saving ? 'Menyimpan...' : 'Simpan Motif Desain'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
