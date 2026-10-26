'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Sparkles, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Autentikasi gagal. Silakan periksa kembali email & password Anda.');
        setLoading(false);
        return;
      }

      // Redirect to Admin Dashboard
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Gagal menghubungi server');
      setLoading(false);
    }
  };

  const handleQuickFill = (role: 'admin' | 'artisan') => {
    if (role === 'admin') {
      setEmail('admin@ceramix3d.com');
      setPassword('CeramixAdmin2026!');
    } else {
      setEmail('artisan@ceramix3d.com');
      setPassword('ArtisanCraft2026!');
    }
    setError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#0d0f12] text-zinc-100 flex flex-col justify-center items-center p-4 relative overflow-hidden select-none font-sans">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-amber-600/15 via-indigo-600/10 to-transparent rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Discreet Security Badge */}
      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-amber-500/30 text-amber-300 text-xs tracking-wider uppercase font-medium shadow-lg backdrop-blur-md mb-4">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Restricted Studio Access</span>
          </div>
          
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2.5">
            <span className="bg-gradient-to-r from-white via-zinc-200 to-amber-200 bg-clip-text text-transparent">
              Ceramix 3D
            </span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-semibold">
              PORTAL
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-2">
            Pusat Kontrol Produksi & Manajemen Pesanan Keramik Eksklusif
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-zinc-900/90 border border-zinc-800/90 rounded-3xl p-7 shadow-2xl backdrop-blur-2xl relative">
          {/* Subtle Golden Accent line on top of card */}
          <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Email Operator / Admin
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ceramix3d.com"
                  required
                  className="w-full bg-zinc-950/70 border border-zinc-700/80 rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Kata Sandi
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-zinc-950/70 border border-zinc-700/80 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-zinc-950 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-[0.99] transition-all duration-200 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                  <span>Memverifikasi Akses...</span>
                </>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Credential Test Helper (Bisa disembunyikan/diklik kapan saja) */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 mb-2.5">
              <span className="font-medium text-zinc-300">Akses Cepat (Seeded):</span>
              <span className="text-[10px] text-amber-400/80">Klik untuk isi otomatis</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800/70 hover:bg-zinc-800 text-[11px] text-zinc-300 hover:text-amber-300 border border-zinc-700/60 hover:border-amber-500/40 text-left transition-all"
              >
                <div className="font-semibold text-white">Super Admin</div>
                <div className="text-[10px] text-zinc-400 truncate">admin@ceramix3d.com</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('artisan')}
                className="px-2.5 py-1.5 rounded-lg bg-zinc-800/70 hover:bg-zinc-800 text-[11px] text-zinc-300 hover:text-amber-300 border border-zinc-700/60 hover:border-amber-500/40 text-left transition-all"
              >
                <div className="font-semibold text-white">Artisan / QC</div>
                <div className="text-[10px] text-zinc-400 truncate">artisan@ceramix3d.com</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info & Security notes */}
        <div className="mt-6 text-center">
          <p className="text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Terhubung ke PostgreSQL Ceramix 3D (Port 5433)</span>
          </p>
        </div>
      </div>
    </div>
  );
}
