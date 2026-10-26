'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Package,
  Layers,
  Clock,
  CheckCircle2,
  Truck,
  RotateCcw,
  LogOut,
  ExternalLink,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  X,
  Shield,
  Palette,
  CircleDot,
  Globe
} from 'lucide-react';

import StudioMasterManager from '@/components/admin/StudioMasterManager';
import LandingMasterManager from '@/components/admin/LandingMasterManager';
import PlatePreview from '@/components/admin/PlatePreview';

interface OrderItem {
  id: string;
  plateSizeName: string;
  diameterCm: string;
  plateColorName: string;
  plateColorHex: string;
  plateFinish: string;
  rimTrimName: string;
  printCoverage: string;
  designImageUrl: string | null;
  snapshotRenderUrl: string;
  unitTotalPrice: string;
  quantity: number;
  subtotalPrice: string;
  customization?: any;
}

interface OrderProductionLog {
  id: string;
  stage: string;
  title: string;
  description: string;
  operatorName: string | null;
  createdAt: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  specialNotes: string | null;
  grandTotal: string;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  trackingNumber: string | null;
  createdAt: string;
  items: OrderItem[];
  logs: OrderProductionLog[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeMainTab, setActiveMainTab] = useState<'orders' | 'master_studio' | 'master_landing'>('orders');
  const [currentUser, setCurrentUser] = useState<{ fullName: string; email: string; role: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusNote, setStatusNote] = useState('');

  // Fetch Current Session & Orders
  const loadData = async () => {
    try {
      setLoading(true);
      // Check auth
      const authRes = await fetch('/api/admin/logout'); // reuse me endpoint
      const meRes = await fetch('/api/admin/orders');
      if (meRes.status === 401) {
        router.push('/admin/login');
        return;
      }

      const ordersData = await meRes.json();
      if (ordersData.orders) {
        setOrders(ordersData.orders);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check current session from cookies
    fetch('/api/admin/logout') // check endpoint
      .then(() => {
        // fetch me
        return fetch('/api/admin/orders');
      })
      .then((res) => {
        if (res.status === 401) {
          router.push('/admin/login');
        } else {
          return res.json();
        }
      })
      .then((data) => {
        if (data?.orders) setOrders(data.orders);
        setLoading(false);
      })
      .catch(() => router.push('/admin/login'));
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          orderStatus: newStatus,
          note: statusNote || `Status diubah menjadi ${newStatus}`,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setStatusNote('');
        // Refresh local orders list
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus, logs: data.order.logs } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, orderStatus: newStatus, logs: data.order.logs });
        }
      } else {
        alert(data.error || 'Gagal mengubah status pesanan');
      }
    } catch (err: any) {
      alert('Error updating status: ' + err.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || order.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate Metrics
  const totalRevenue = orders.reduce((acc, curr) => acc + Number(curr.grandTotal || 0), 0);
  const inProductionCount = orders.filter((o) => o.orderStatus === 'IN_PRODUCTION').length;
  const pendingCount = orders.filter((o) => o.orderStatus === 'PENDING_PAYMENT' || o.orderStatus === 'DESIGN_REVIEW').length;
  const completedCount = orders.filter((o) => o.orderStatus === 'DELIVERED').length;

  const formatRupiah = (val: number | string) => {
    return 'Rp ' + Number(val).toLocaleString('id-ID');
  };

  const formatRimTrimName = (name?: string, hex?: string | null) => {
    if (!name || name === 'none') return null;
    const n = name.toLowerCase();
    if (n.includes('gold') && !n.includes('rose')) return '24K Gold Luster';
    if (n.includes('silver') || n.includes('perak') || n.includes('platinum')) return 'Platinum Silver';
    if (n.includes('rose')) return 'Rose Gold';
    if (n.includes('custom') || hex) return `Custom ${hex || ''}`;
    return name;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; color: string; bg: string; border: string }> = {
      PENDING_PAYMENT: { label: 'Menunggu Bayar', color: 'text-amber-400', bg: 'bg-amber-950/40', border: 'border-amber-500/30' },
      DESIGN_REVIEW: { label: 'Review Desain', color: 'text-blue-400', bg: 'bg-blue-950/40', border: 'border-blue-500/30' },
      IN_PRODUCTION: { label: 'Proses Kiln/Cetak', color: 'text-purple-400', bg: 'bg-purple-950/40', border: 'border-purple-500/30' },
      QUALITY_CHECK: { label: 'Quality Control', color: 'text-orange-400', bg: 'bg-orange-950/40', border: 'border-orange-500/30' },
      SHIPPED: { label: 'Dikirim', color: 'text-cyan-400', bg: 'bg-cyan-950/40', border: 'border-cyan-500/30' },
      DELIVERED: { label: 'Selesai / Diterima', color: 'text-emerald-400', bg: 'bg-emerald-950/40', border: 'border-emerald-500/30' },
      CANCELLED: { label: 'Dibatalkan', color: 'text-red-400', bg: 'bg-red-950/40', border: 'border-red-500/30' },
    };
    const b = badges[status] || { label: status, color: 'text-zinc-400', bg: 'bg-zinc-800', border: 'border-zinc-700' };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${b.bg} ${b.color} ${b.border}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        {b.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d0f12] text-zinc-100 font-sans selection:bg-amber-500/30">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#121418]/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-zinc-950 font-bold shadow-md shadow-amber-500/20">
            C3D
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-tight">Ceramix 3D Studio</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                Control Center
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">PostgreSQL ceramix3d (Port 5433)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/landing"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors"
          >
            <span>Landing Page</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </a>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 text-xs text-zinc-300 hover:text-white border border-zinc-700/60 transition-colors"
          >
            <span>3D Studio</span>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
          </a>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/50 text-red-300 border border-red-800/50 text-xs font-medium transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </header>

      {/* Primary Module Navigation Tabs */}
      <div className="bg-[#121418] border-b border-zinc-800/80 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveMainTab('orders')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeMainTab === 'orders'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Pesanan & Alur Produksi</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-zinc-800 text-zinc-300 font-mono">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveMainTab('master_studio')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeMainTab === 'master_studio'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Master Studio (Ukuran, Warna, Motif)</span>
          </button>

          <button
            onClick={() => setActiveMainTab('master_landing')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeMainTab === 'master_landing'
                ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Master Landing Page (Hero, Promo, Kiln)</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {activeMainTab === 'master_studio' && <StudioMasterManager />}

        {activeMainTab === 'master_landing' && <LandingMasterManager />}

        {activeMainTab === 'orders' && (
          <>
            {/* KPI Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
              <span>Total Pesanan Masuk</span>
              <Package className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">{orders.length}</div>
            <div className="text-[11px] text-zinc-400 mt-1">Tersimpan di DB Ceramix 3D</div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
              <span>Total Omset (Gross)</span>
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 truncate">
              {formatRupiah(totalRevenue)}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">Nilai seluruh transaksi</div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
              <span>Sedang Proses Kiln</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">{inProductionCount}</div>
            <div className="text-[11px] text-zinc-400 mt-1">Dalam pembakaran glasir keramik</div>
          </div>

          <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between text-zinc-400 text-xs font-medium mb-2">
              <span>Menunggu Tindakan</span>
              <Clock className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-orange-400">{pendingCount}</div>
            <div className="text-[11px] text-zinc-400 mt-1">Review desain & pembayaran</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl p-4 mb-6 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari ID pesanan, nama customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <Filter className="w-3.5 h-3.5 text-zinc-400 shrink-0 hidden sm:block" />
            {['ALL', 'PENDING_PAYMENT', 'DESIGN_REVIEW', 'IN_PRODUCTION', 'QUALITY_CHECK', 'SHIPPED', 'DELIVERED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === st
                    ? 'bg-amber-400 text-zinc-950 font-semibold'
                    : 'bg-zinc-800/70 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {st === 'ALL' ? 'Semua' : st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-zinc-900/70 border border-zinc-800/90 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/60 border-b border-zinc-800/80 text-zinc-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">ID & Waktu</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Piring 3D Spesifikasi</th>
                  <th className="px-5 py-3.5">Total Harga</th>
                  <th className="px-5 py-3.5">Status Produksi</th>
                  <th className="px-5 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-zinc-400">
                      Tidak ada pesanan yang sesuai filter.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const firstItem = order.items?.[0];
                    return (
                      <tr key={order.id} className="hover:bg-zinc-800/40 transition-colors">
                        <td className="px-5 py-4">
                          <div className="font-mono font-semibold text-white text-sm">{order.orderNumber}</div>
                          <div className="text-[11px] text-zinc-400">
                            {new Date(order.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium text-white">{order.customerName}</div>
                          <div className="text-[11px] text-zinc-400">{order.customerPhone}</div>
                          <div className="text-[11px] text-zinc-400">{order.city}</div>
                        </td>

                        <td className="px-5 py-4">
                          {firstItem ? (
                            <div className="flex items-center gap-3">
                              <PlatePreview
                                size="sm"
                                plateColorHex={firstItem.plateColorHex}
                                plateFinish={firstItem.plateFinish}
                                rimTrimName={firstItem.rimTrimName}
                                rimTrimCustomHex={firstItem.rimTrimCustomHex}
                                printCoverage={firstItem.printCoverage}
                                designImageUrl={firstItem.designImageUrl || firstItem.customization?.designImageUrl}
                                snapshotRenderUrl={firstItem.snapshotRenderUrl || firstItem.customization?.previewSnapshotUrl}
                                designScale={firstItem.customization?.designScale ? Number(firstItem.customization.designScale) : 1}
                                designRotation={firstItem.customization?.designRotation ? Number(firstItem.customization.designRotation) : 0}
                                designOffsetX={firstItem.customization?.designOffsetX ? Number(firstItem.customization.designOffsetX) : 0}
                                designOffsetY={firstItem.customization?.designOffsetY ? Number(firstItem.customization.designOffsetY) : 0}
                                designOpacity={firstItem.customization?.designOpacity ? Number(firstItem.customization.designOpacity) : 1}
                                diameterCm={firstItem.diameterCm}
                              />
                              <div>
                                <div className="font-medium text-zinc-200">
                                  {firstItem.plateSizeName} ({firstItem.diameterCm} cm)
                                </div>
                                <div className="text-[11px] text-zinc-400 flex items-center gap-1.5">
                                  <span>{firstItem.plateColorName}</span>
                                  <span>•</span>
                                  <span className="capitalize">{firstItem.plateFinish}</span>
                                  {firstItem.rimTrimName && firstItem.rimTrimName !== 'none' && (
                                    <>
                                      <span>•</span>
                                      <span className="text-amber-400 font-medium">
                                        Trim {formatRimTrimName(firstItem.rimTrimName, firstItem.rimTrimCustomHex)}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-zinc-500">-</span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-bold text-white text-sm">{formatRupiah(order.grandTotal)}</div>
                          <div className="text-[11px] text-zinc-400 uppercase font-mono">{order.paymentMethod}</div>
                        </td>

                        <td className="px-5 py-4">{getStatusBadge(order.orderStatus)}</td>

                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-zinc-200 font-medium transition-all text-xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detail</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )}
  </main>

      {/* Order Detail & Status Transition Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-700/80 rounded-3xl p-6 shadow-2xl my-auto text-zinc-100">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-bold text-white">{selectedOrder.orderNumber}</span>
                  {getStatusBadge(selectedOrder.orderStatus)}
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Dibuat pada {new Date(selectedOrder.createdAt).toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-5 space-y-6 max-h-[75vh] overflow-y-auto pr-1">
              {/* Customer Info Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Informasi Pemesan
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="font-medium text-white">{selectedOrder.customerName}</div>
                    <div className="text-zinc-400 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{selectedOrder.customerEmail}</span>
                    </div>
                    <div className="text-zinc-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{selectedOrder.customerPhone}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                    Alamat Pengiriman
                  </h4>
                  <div className="text-xs text-zinc-300 leading-relaxed flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-500 mt-0.5 shrink-0" />
                    <div>
                      <div>{selectedOrder.shippingAddress}</div>
                      <div className="text-zinc-400">
                        {selectedOrder.city}, {selectedOrder.postalCode}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Detail */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
                  Detail Kustomisasi Piring 3D
                </h4>
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 flex flex-col sm:flex-row items-center gap-5"
                  >
                    <PlatePreview
                      size="md"
                      plateColorHex={item.plateColorHex}
                      plateFinish={item.plateFinish}
                      rimTrimName={item.rimTrimName}
                      rimTrimCustomHex={item.rimTrimCustomHex}
                      printCoverage={item.printCoverage}
                      designImageUrl={item.designImageUrl || item.customization?.designImageUrl}
                      designName={item.customization?.designName}
                      snapshotRenderUrl={item.snapshotRenderUrl || item.customization?.previewSnapshotUrl}
                      designScale={item.customization?.designScale ? Number(item.customization.designScale) : 1}
                      designRotation={item.customization?.designRotation ? Number(item.customization.designRotation) : 0}
                      designOffsetX={item.customization?.designOffsetX ? Number(item.customization.designOffsetX) : 0}
                      designOffsetY={item.customization?.designOffsetY ? Number(item.customization.designOffsetY) : 0}
                      designOpacity={item.customization?.designOpacity ? Number(item.customization.designOpacity) : 1}
                      diameterCm={item.diameterCm}
                    />

                    <div className="flex-1 text-xs space-y-1 w-full text-center sm:text-left">
                      <div className="font-bold text-sm text-white">
                        {item.plateSizeName} (Diameter {item.diameterCm} cm)
                      </div>
                      <div className="text-zinc-400">
                        Warna Glasir:{' '}
                        <span className="font-medium text-zinc-200">{item.plateColorName}</span> ({item.plateColorHex})
                      </div>
                      <div className="text-zinc-400">
                        Finishing: <span className="font-medium text-zinc-200 capitalize">{item.plateFinish}</span> •
                        Trim Rim: <span className="font-medium text-amber-400">{formatRimTrimName(item.rimTrimName, item.rimTrimCustomHex) || 'Tanpa Rim'}</span>
                      </div>
                      <div className="text-zinc-400">
                        Area Cetak: <span className="font-medium text-zinc-200 capitalize">{item.printCoverage}</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-zinc-400 text-[11px]">Jumlah: {item.quantity} pcs</div>
                      <div className="text-base font-extrabold text-white">{formatRupiah(item.subtotalPrice)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Status Transition Control (Admin Action) */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4" />
                  <span>Update Alur Produksi Studio</span>
                </h4>
                <p className="text-xs text-zinc-400 mb-3">
                  Pilih status berikutnya untuk memperbarui tahapan piring di bengkel produksi keramik:
                </p>

                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'PENDING_PAYMENT', label: 'Menunggu Bayar' },
                    { key: 'DESIGN_REVIEW', label: 'Review Desain' },
                    { key: 'IN_PRODUCTION', label: 'Masuk Kiln / Cetak' },
                    { key: 'QUALITY_CHECK', label: 'Quality Check (QC)' },
                    { key: 'SHIPPED', label: 'Kirim ke Ekspedisi' },
                    { key: 'DELIVERED', label: 'Selesai / Terkirim' },
                    { key: 'CANCELLED', label: 'Batalkan' },
                  ].map((st) => (
                    <button
                      key={st.key}
                      disabled={updatingStatus || selectedOrder.orderStatus === st.key}
                      onClick={() => handleUpdateOrderStatus(selectedOrder.id, st.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        selectedOrder.orderStatus === st.key
                          ? 'bg-amber-400 text-zinc-950 font-bold'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Production Timeline Logs */}
              {selectedOrder.logs && selectedOrder.logs.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
                    Riwayat Produksi (Audit Log)
                  </h4>
                  <div className="space-y-2.5">
                    {selectedOrder.logs.map((log) => (
                      <div
                        key={log.id}
                        className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-800/80 text-xs flex items-start gap-3"
                      >
                        <div className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-white">{log.title}</span>
                            <span className="text-[10px] text-zinc-500">
                              {new Date(log.createdAt).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-zinc-400 text-[11px] mt-0.5">{log.description}</p>
                          {log.operatorName && (
                            <span className="text-[10px] text-zinc-500 font-mono mt-1 inline-block">
                              Operator: {log.operatorName}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
