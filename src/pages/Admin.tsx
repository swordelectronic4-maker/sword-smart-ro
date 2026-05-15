// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Package, Users, Phone, Tag,
  BarChart3, Settings, Search, LogOut, Menu, X, Pencil, Trash2,
  Plus, IndianRupee, Eye, Ban, CheckCircle, XCircle, Star, AlertTriangle,
  ChevronDown, Truck, CreditCard, Percent, Bell, Archive, Download, Upload, Copy, Filter
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatINR, formatINRShort, formatCompactINR, calculateDiscountPercent } from '@/lib/currency';
import { getProducts, saveProducts, getOrders, saveOrders, getUsers } from '@/services/dataStore';
import { getCoupons, addCoupon, updateCoupon, deleteCoupon, getCouponAnalytics } from '@/services/couponEngine';
import { getLeads, addLead, updateLeadStatus, updateLead, assignLead, addLeadNote, deleteLead, getLeadAnalytics, searchLeads, exportLeadsCSV } from '@/services/leadCRM';
import { syncInventoryWithProducts, getLowStockItems, getOutOfStockItems, getAvailableStock, generateSKU } from '@/services/inventoryService';
import { getAllOrders as getPaymentOrders, getPaymentStatusCounts, isRazorpayConfigured } from '@/services/razorpayService';
import { getAllShipments, getShipmentAnalytics, createShipment, getShipmentByOrder } from '@/services/shiprocketService';

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function safeParse(str, fallback) {
  try { if (!str || str === 'undefined' || str === 'null') return fallback; const p = JSON.parse(str); return Array.isArray(p) ? p : fallback; } catch { return fallback; }
}

function safe(fn, fallback) { try { return fn(); } catch { return fallback; } }

function todayStr() { return new Date().toISOString().split('T')[0]; }

function nowISO() { return new Date().toISOString(); }

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getStatusColor(s) {
  const c = { pending: 'bg-yellow-500/20 text-yellow-400', processing: 'bg-blue-500/20 text-blue-400', shipped: 'bg-purple-500/20 text-purple-400', delivered: 'bg-green-500/20 text-green-400', cancelled: 'bg-red-500/20 text-red-400', active: 'bg-green-500/20 text-green-400', inactive: 'bg-gray-500/20 text-gray-400', draft: 'bg-gray-500/20 text-gray-400', banned: 'bg-red-500/20 text-red-400' };
  return c[s] || 'bg-gray-500/20 text-gray-400';
}

function getLeadSourceColor(s) {
  const c = { website: 'bg-gray-500/20 text-gray-400', chatbot: 'bg-blue-500/20 text-blue-400', contact_form: 'bg-purple-500/20 text-purple-400', whatsapp: 'bg-green-500/20 text-green-400', callback: 'bg-yellow-500/20 text-yellow-400' };
  return c[s] || 'bg-gray-500/20 text-gray-400';
}

function getLeadStatusColor(s) {
  const c = { new: 'bg-blue-500/20 text-blue-400', contacted: 'bg-yellow-500/20 text-yellow-400', qualified: 'bg-green-500/20 text-green-400', converted: 'bg-[#D4AF37]/20 text-[#D4AF37]', lost: 'bg-red-500/20 text-red-400' };
  return c[s] || 'bg-gray-500/20 text-gray-400';
}

function getScoreColor(v) { if (v >= 70) return 'text-green-400'; if (v >= 40) return 'text-yellow-400'; return 'text-red-400'; }

function getCouponTypeColor(t) {
  const c = { percentage: 'bg-purple-500/20 text-purple-400', flat: 'bg-blue-500/20 text-blue-400', free_shipping: 'bg-green-500/20 text-green-400' };
  return c[t] || 'bg-gray-500/20 text-gray-400';
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT: KPI Card
// ═══════════════════════════════════════════════════════════════

function KPICard({ label, value, icon: Icon }) {
  return (
    <div className="bg-[#111] border border-white/10 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className="text-[#D4AF37]" />
        <span className="text-gray-400 text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 1: DASHBOARD
// ═══════════════════════════════════════════════════════════════

function DashboardPage({ orders, products, users, leads, onNavigate }) {
  const revenue = safe(() => orders.reduce((s, o) => s + (o?.grandTotal || o?.total || 0), 0), 0);
  const delivered = safe(() => orders.filter(o => o?.status === 'delivered').length, 0);
  const pending = safe(() => orders.filter(o => o?.status === 'pending').length, 0);
  const lowStock = safe(() => products.filter(p => (p?.stock ?? p?.quantity ?? 0) < 5).length, 0);
  const monthly = useMemo(() => {
    const m = Array(6).fill(0);
    orders.forEach(o => { try { const d = new Date(o?.createdAt || o?.date); const i = 5 - ((new Date().getMonth() - d.getMonth() + 12) % 12); if (i >= 0 && i < 6) m[i] += (o?.grandTotal || o?.total || 0); } catch {} });
    return m;
  }, [orders]);
  const maxM = Math.max(...monthly, 1);
  const recent = useMemo(() => [...orders].sort((a, b) => new Date(b?.createdAt || b?.date) - new Date(a?.createdAt || a?.date)).slice(0, 5), [orders]);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <KPICard label="Revenue" value={formatINR(revenue)} icon={IndianRupee} />
        <KPICard label="Orders" value={orders.length} icon={ShoppingBag} />
        <KPICard label="Products" value={products.length} icon={Package} />
        <KPICard label="Delivered" value={delivered} icon={CheckCircle} />
        <KPICard label="Pending" value={pending} icon={AlertTriangle} />
        <KPICard label="Low Stock" value={lowStock} icon={AlertTriangle} />
      </div>
      <div className="bg-[#111] border border-white/10 p-4 mb-6">
        <h3 className="text-white font-bold mb-4">Monthly Revenue</h3>
        <div className="flex items-end gap-3 h-40">
          {monthly.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full bg-[#D4AF37]/80 rounded-t" style={{ height: `${(v / maxM) * 120}px` }} />
              <span className="text-xs text-gray-400">{MONTHS[(new Date().getMonth() - 5 + i + 12) % 12]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-[#111] border border-white/10 p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-bold">Recent Orders</h3>
          <button onClick={() => onNavigate('orders')} className="text-[#D4AF37] text-sm hover:underline">View All</button>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-left"><th className="pb-3 text-gray-400 font-medium px-3">Order</th><th className="pb-3 text-gray-400 font-medium px-3">Customer</th><th className="pb-3 text-gray-400 font-medium px-3">Total</th><th className="pb-3 text-gray-400 font-medium px-3">Status</th><th className="pb-3 text-gray-400 font-medium px-3">Date</th></tr></thead>
          <tbody>
            {recent.map((o, i) => (
              <tr key={o?.id || i} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-3 text-white font-medium">#{o?.id?.toString().slice(-6) || 'N/A'}</td>
                <td className="py-3 px-3 text-gray-300">{o?.customer?.name || o?.user?.name || 'Guest'}</td>
                <td className="py-3 px-3 text-white">{formatINR(o?.grandTotal || o?.total || 0)}</td>
                <td className="py-3 px-3"><span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(o?.status)} capitalize`}>{o?.status || 'N/A'}</span></td>
                <td className="py-3 px-3 text-gray-400 text-xs">{safe(() => new Date(o?.createdAt || o?.date).toLocaleDateString(), '-')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 2: ORDERS
// ═══════════════════════════════════════════════════════════════

function OrdersPage({ orders, refresh }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [detail, setDetail] = useState(null);
  const statuses = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const filtered = useMemo(() => {
    return orders.filter(o => {
      const m = !search || (o?.customer?.name || o?.user?.name || '').toLowerCase().includes(search.toLowerCase()) || (o?.id || '').toString().includes(search);
      const f = filter === 'all' || o?.status === filter;
      return m && f;
    });
  }, [orders, search, filter]);

  const updateStatus = (id, newStatus) => {
    try {
      const updated = orders.map(o => o?.id === id ? { ...o, status: newStatus, updatedAt: nowISO() } : o);
      saveOrders(updated);
      refresh();
      setDetail(null);
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm pl-9 pr-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {statuses.map(s => <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 text-xs rounded-full border ${filter === s ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>)}
      </div>
      <div className="bg-[#111] border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead><tr className="border-b border-white/10 text-left"><th className="pb-3 text-gray-400 font-medium px-3">Order ID</th><th className="pb-3 text-gray-400 font-medium px-3">Customer</th><th className="pb-3 text-gray-400 font-medium px-3">Items</th><th className="pb-3 text-gray-400 font-medium px-3">Total</th><th className="pb-3 text-gray-400 font-medium px-3">Status</th><th className="pb-3 text-gray-400 font-medium px-3">Date</th></tr></thead>
          <tbody>
            {filtered.map((o, i) => (
              <tr key={o?.id || i} className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer" onClick={() => setDetail(o)}>
                <td className="py-3 px-3 text-white font-medium">#{o?.id?.toString().slice(-6) || 'N/A'}</td>
                <td className="py-3 px-3 text-gray-300">{o?.customer?.name || o?.user?.name || 'Guest'}</td>
                <td className="py-3 px-3 text-gray-300">{safe(() => o?.items?.length, 0)}</td>
                <td className="py-3 px-3 text-white">{formatINR(o?.grandTotal || o?.total || 0)}</td>
                <td className="py-3 px-3"><span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(o?.status)}`}>{o?.status || 'N/A'}</span></td>
                <td className="py-3 px-3 text-gray-400 text-xs">{safe(() => new Date(o?.createdAt || o?.date).toLocaleDateString(), '-')}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">No orders found</div>}
      </div>
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-[#111] border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Order #{detail?.id?.toString().slice(-6)}</h3>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-3 mb-4">
              <p className="text-gray-300 text-sm"><span className="text-gray-500">Customer:</span> {detail?.customer?.name || detail?.user?.name || 'Guest'}</p>
              <p className="text-gray-300 text-sm"><span className="text-gray-500">Email:</span> {detail?.customer?.email || detail?.user?.email || 'N/A'}</p>
              <p className="text-gray-300 text-sm"><span className="text-gray-500">Phone:</span> {detail?.customer?.phone || detail?.user?.phone || 'N/A'}</p>
              <p className="text-gray-300 text-sm"><span className="text-gray-500">Address:</span> {detail?.shippingAddress?.fullAddress || detail?.address || 'N/A'}</p>
            </div>
            <div className="border-t border-white/10 pt-4 mb-4">
              <h4 className="text-white font-bold mb-2">Items</h4>
              {safe(() => detail?.items, []).map((it, idx) => (
                <div key={idx} className="flex justify-between py-2 border-b border-white/5 text-sm">
                  <span className="text-gray-300">{it?.name || it?.productName || 'Item'} x{it?.quantity || 1}</span>
                  <span className="text-white">{formatINR((it?.price || 0) * (it?.quantity || 1))}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 text-sm font-bold">
                <span className="text-white">Grand Total</span>
                <span className="text-[#D4AF37]">{formatINR(detail?.grandTotal || detail?.total || 0)}</span>
              </div>
            </div>
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-white font-bold mb-2">Update Status</h4>
              <div className="flex flex-wrap gap-2">
                {statuses.slice(1).map(s => (
                  <button key={s} onClick={() => updateStatus(detail?.id, s)} className={`px-3 py-1.5 text-xs rounded-full border capitalize ${detail?.status === s ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 3: PRODUCTS (MOST IMPORTANT)
// ═══════════════════════════════════════════════════════════════

function ProductsPage({ products, setProducts, refresh }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const filters = ['all', 'active', 'draft', 'low_stock', 'out_of_stock'];
  const filtered = useMemo(() => products.filter(p => {
    const m = !search || (p?.name || '').toLowerCase().includes(search.toLowerCase()) || (p?.sku || '').toLowerCase().includes(search.toLowerCase());
    const stock = p?.stock ?? p?.quantity ?? 0;
    const f = filter === 'all' || (filter === 'active' && p?.isActive) || (filter === 'draft' && !p?.isActive) || (filter === 'low_stock' && stock > 0 && stock < 5) || (filter === 'out_of_stock' && stock <= 0);
    return m && f;
  }), [products, search, filter]);

  const toggleActive = (id) => {
    try { const updated = products.map(p => p?.id === id ? { ...p, isActive: !p?.isActive, updatedAt: nowISO() } : p); saveProducts(updated); setProducts(updated); } catch (e) { console.error(e); }
  };
  const toggleFeatured = (id) => {
    try { const updated = products.map(p => p?.id === id ? { ...p, isFeatured: !p?.isFeatured, updatedAt: nowISO() } : p); saveProducts(updated); setProducts(updated); } catch (e) { console.error(e); }
  };
  const deleteProduct = (id) => {
    try { const updated = products.filter(p => p?.id !== id); saveProducts(updated); setProducts(updated); setConfirmDelete(null); } catch (e) { console.error(e); }
  };
  const saveProduct = (e) => {
    e.preventDefault();
    try {
      const fd = new FormData(e.target);
      const data = Object.fromEntries(fd);
      const name = data.name?.trim();
      const price = parseFloat(data.price) || 0;
      const mrp = parseFloat(data.mrp) || 0;
      const stock = parseInt(data.stock) || 0;
      const costPrice = parseFloat(data.costPrice) || 0;
      const gstRate = parseFloat(data.gstRate) || 18;
      const lowStock = parseInt(data.lowStockThreshold) || 5;
      const base = { name, slug: data.slug || '', sku: data.sku || '', mrp, price, costPrice, stock, quantity: stock, gstRate: gstRate, gstInclusive: data.gstInclusive === 'on', lowStockThreshold: lowStock, category: data.category || '', brand: data.brand || '', tags: (data.tags || '').split(',').map(t => t.trim()).filter(Boolean), description: data.description || '', isActive: data.isActive === 'on', isFeatured: data.isFeatured === 'on', seoTitle: data.seoTitle || '', seoDescription: data.seoDescription || '', updatedAt: nowISO() };
      if (editing) {
        const targetId = editing?.id;
        if (!targetId) { console.error('No target ID'); return; }
        const updated = products.map(p => p?.id === targetId ? { ...p, ...base } : p);
        saveProducts(updated); setProducts(updated); setEditing(null);
      } else {
        const np = { ...base, id: 'prod_' + Date.now(), createdAt: nowISO(), images: [] };
        const updated = [...products, np]; saveProducts(updated); setProducts(updated);
      }
      setModal(null);
    } catch (err) { console.error(err); }
  };

  const openEdit = (p) => { setEditing(p); setModal('edit'); };
  const openAdd = () => { setEditing(null); setModal('add'); };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or SKU..." className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm pl-9 pr-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#D4AF37] text-black px-4 py-2.5 text-sm font-bold hover:bg-[#e5c158] transition-colors"><Plus size={16} /> Add Product</button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {filters.map(f => <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 text-xs rounded-full border ${filter === f ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'}`}>{f.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</button>)}
      </div>
      <div className="bg-[#111] border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead><tr className="border-b border-white/10 text-left"><th className="pb-3 text-gray-400 font-medium px-3">Image</th><th className="pb-3 text-gray-400 font-medium px-3">Name</th><th className="pb-3 text-gray-400 font-medium px-3">SKU</th><th className="pb-3 text-gray-400 font-medium px-3">MRP</th><th className="pb-3 text-gray-400 font-medium px-3">Price</th><th className="pb-3 text-gray-400 font-medium px-3">Stock</th><th className="pb-3 text-gray-400 font-medium px-3">Status</th><th className="pb-3 text-gray-400 font-medium px-3">Actions</th></tr></thead>
          <tbody>
            {filtered.map((p, i) => {
              const stock = p?.stock ?? p?.quantity ?? 0;
              return (
                <tr key={p?.id || i} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="py-3 px-3"><img src={safe(() => p?.images?.[0], 'https://placehold.co/40x40/1a1a1a/666?text=No+Img')} alt="" className="w-10 h-10 object-cover rounded border border-white/10" onError={e => { e.target.src = 'https://placehold.co/40x40/1a1a1a/666?text=No+Img'; }} /></td>
                  <td className="py-3 px-3 text-white font-medium">{p?.name || 'Unnamed'}</td>
                  <td className="py-3 px-3 text-gray-400 text-xs">{p?.sku || 'N/A'}</td>
                  <td className="py-3 px-3 text-gray-400 line-through">{formatINR(p?.mrp || 0)}</td>
                  <td className="py-3 px-3 text-white font-medium">{formatINR(p?.price || 0)}</td>
                  <td className="py-3 px-3"><span className={stock <= 0 ? 'text-red-400' : stock < 5 ? 'text-yellow-400' : 'text-green-400'}>{stock}</span></td>
                  <td className="py-3 px-3">
                    <button onClick={() => toggleActive(p?.id)} className={`text-xs px-2 py-1 rounded-full ${p?.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{p?.isActive ? 'Active' : 'Draft'}</button>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="text-blue-400 hover:text-blue-300 p-1"><Pencil size={14} /></button>
                      <button onClick={() => setConfirmDelete(p)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                      <button onClick={() => toggleFeatured(p?.id)} className={`p-1 ${p?.isFeatured ? 'text-[#D4AF37]' : 'text-gray-500 hover:text-gray-300'}`}><Star size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">No products found</div>}
      </div>
      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-[#111] border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={saveProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-gray-400 text-xs mb-1">Name *</label><input name="name" defaultValue={editing?.name || ''} required className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="Product name" /></div>
                <div><label className="block text-gray-400 text-xs mb-1">Slug</label><input name="slug" defaultValue={editing?.slug || ''} className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="product-slug" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className="block text-gray-400 text-xs mb-1">SKU</label><div className="flex gap-2"><input name="sku" defaultValue={editing?.sku || ''} className="flex-1 bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="SKU" /><button type="button" onClick={() => { const el = document.querySelector('input[name="sku"]'); if (el) el.value = generateSKU(); }} className="px-2 py-1 bg-white/10 text-xs text-gray-300 rounded border border-white/10 hover:bg-white/20">Auto</button></div></div>
                <div><label className="block text-gray-400 text-xs mb-1">MRP (₹)</label><input name="mrp" type="number" defaultValue={editing?.mrp || ''} className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="0" /></div>
                <div><label className="block text-gray-400 text-xs mb-1">Selling Price (₹) *</label><input name="price" type="number" defaultValue={editing?.price || ''} required className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="0" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className="block text-gray-400 text-xs mb-1">Cost Price (₹)</label><input name="costPrice" type="number" defaultValue={editing?.costPrice || ''} className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="0" /></div>
                <div><label className="block text-gray-400 text-xs mb-1">GST Rate (%)</label><input name="gstRate" type="number" defaultValue={editing?.gstRate || 18} className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="18" /></div>
                <div className="flex items-end pb-1"><label className="flex items-center gap-2 cursor-pointer"><input name="gstInclusive" type="checkbox" defaultChecked={editing?.gstInclusive} className="accent-[#D4AF37]" /><span className="text-gray-300 text-sm">GST Inclusive</span></label></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-gray-400 text-xs mb-1">Stock Quantity *</label><input name="stock" type="number" defaultValue={editing?.stock ?? editing?.quantity ?? ''} required className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="0" /></div>
                <div><label className="block text-gray-400 text-xs mb-1">Low Stock Threshold</label><input name="lowStockThreshold" type="number" defaultValue={editing?.lowStockThreshold || 5} className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="5" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className="block text-gray-400 text-xs mb-1">Category</label><input name="category" defaultValue={editing?.category || ''} className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="Category" /></div>
                <div><label className="block text-gray-400 text-xs mb-1">Brand</label><input name="brand" defaultValue={editing?.brand || ''} className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="Brand" /></div>
                <div><label className="block text-gray-400 text-xs mb-1">Tags (comma sep.)</label><input name="tags" defaultValue={safe(() => editing?.tags?.join(', '), '')} className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="tag1, tag2" /></div>
              </div>
              <div><label className="block text-gray-400 text-xs mb-1">Description</label><textarea name="description" rows={3} defaultValue={editing?.description || ''} className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30 resize-none" placeholder="Product description..." /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-gray-400 text-xs mb-1">SEO Title</label><input name="seoTitle" defaultValue={editing?.seoTitle || ''} className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="SEO Title" /></div>
                <div><label className="block text-gray-400 text-xs mb-1">SEO Description</label><input name="seoDescription" defaultValue={editing?.seoDescription || ''} className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="Meta description" /></div>
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input name="isActive" type="checkbox" defaultChecked={editing ? editing?.isActive : true} className="accent-[#D4AF37]" /><span className="text-gray-300 text-sm">Active</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input name="isFeatured" type="checkbox" defaultChecked={editing?.isFeatured || false} className="accent-[#D4AF37]" /><span className="text-gray-300 text-sm">Featured</span></label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-[#D4AF37] text-black py-2.5 font-bold text-sm hover:bg-[#e5c158] transition-colors">{editing ? 'Update Product' : 'Add Product'}</button>
                <button type="button" onClick={() => setModal(null)} className="px-6 py-2.5 border border-white/20 text-gray-300 text-sm hover:bg-white/5 transition-colors">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-[#111] border border-white/10 w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-white mb-2">Delete Product?</h3>
            <p className="text-gray-400 text-sm mb-4">Are you sure you want to delete &quot;{confirmDelete?.name}&quot;? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => deleteProduct(confirmDelete?.id)} className="flex-1 bg-red-500 text-white py-2.5 font-bold text-sm hover:bg-red-600 transition-colors">Delete</button>
              <button onClick={() => setConfirmDelete(null)} className="px-6 py-2.5 border border-white/20 text-gray-300 text-sm hover:bg-white/5 transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 4: USERS
// ═══════════════════════════════════════════════════════════════

function UsersPage({ users, orders }) {
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);
  const roleColors = { admin: 'bg-[#D4AF37]/20 text-[#D4AF37]', manager: 'bg-blue-500/20 text-blue-400', staff: 'bg-gray-500/20 text-gray-400', customer: 'bg-green-500/20 text-green-400' };
  const filtered = useMemo(() => users.filter(u => !search || (u?.name || '').toLowerCase().includes(search.toLowerCase()) || (u?.email || '').toLowerCase().includes(search.toLowerCase())), [users, search]);
  const userOrders = (uid) => safe(() => orders.filter(o => (o?.userId || o?.user?.id) === uid), []);

  return (
    <div>
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="w-full sm:w-80 bg-white/[0.06] border border-white/[0.12] text-white text-sm pl-9 pr-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
      </div>
      <div className="bg-[#111] border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead><tr className="border-b border-white/10 text-left"><th className="pb-3 text-gray-400 font-medium px-3">User</th><th className="pb-3 text-gray-400 font-medium px-3">Email</th><th className="pb-3 text-gray-400 font-medium px-3">Phone</th><th className="pb-3 text-gray-400 font-medium px-3">Role</th><th className="pb-3 text-gray-400 font-medium px-3">Status</th><th className="pb-3 text-gray-400 font-medium px-3">Actions</th></tr></thead>
          <tbody>
            {filtered.map((u, i) => (
              <tr key={u?.id || i} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-3"><div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-xs font-bold">{(u?.name || 'U').charAt(0).toUpperCase()}</div>
                  <span className="text-white font-medium">{u?.name || 'Unnamed'}</span>
                </div></td>
                <td className="py-3 px-3 text-gray-300">{u?.email || 'N/A'}</td>
                <td className="py-3 px-3 text-gray-300">{u?.phone || 'N/A'}</td>
                <td className="py-3 px-3"><span className={`text-xs px-2 py-1 rounded-full ${roleColors[u?.role] || roleColors.customer} capitalize`}>{u?.role || 'customer'}</span></td>
                <td className="py-3 px-3"><span className={`text-xs px-2 py-1 rounded-full capitalize ${u?.status === 'banned' ? 'bg-red-500/20 text-red-400' : u?.isActive !== false ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{u?.status === 'banned' ? 'Banned' : u?.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDetail(u)} className="text-blue-400 hover:text-blue-300 p-1" title="View orders"><Eye size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">No users found</div>}
      </div>
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-[#111] border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">{detail?.name || 'User'}</h3>
              <button onClick={() => setDetail(null)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <p className="text-gray-300"><span className="text-gray-500">Email:</span> {detail?.email || 'N/A'}</p>
              <p className="text-gray-300"><span className="text-gray-500">Phone:</span> {detail?.phone || 'N/A'}</p>
              <p className="text-gray-300"><span className="text-gray-500">Role:</span> <span className={`text-xs px-2 py-0.5 rounded-full ${roleColors[detail?.role] || roleColors.customer}`}>{detail?.role || 'customer'}</span></p>
            </div>
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-white font-bold mb-2">Orders ({userOrders(detail?.id).length})</h4>
              {userOrders(detail?.id).length === 0 ? <p className="text-gray-500 text-sm">No orders</p> : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userOrders(detail?.id).map((o, idx) => (
                    <div key={idx} className="flex justify-between py-2 border-b border-white/5 text-sm">
                      <span className="text-gray-300">#{o?.id?.toString().slice(-6)}</span>
                      <span className="text-white">{formatINR(o?.grandTotal || o?.total || 0)}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(o?.status)}`}>{o?.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 5: LEADS
// ═══════════════════════════════════════════════════════════════

function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => { try { setLeads(getLeads()); setAnalytics(getLeadAnalytics()); } catch (e) { console.error(e); } }, []);
  const refresh = () => { try { setLeads(getLeads()); setAnalytics(getLeadAnalytics()); } catch (e) { console.error(e); } };
  const sources = ['all', 'website', 'chatbot', 'contact_form', 'whatsapp'];
  const lStatuses = ['all', 'new', 'contacted', 'qualified', 'converted', 'lost'];

  const filtered = useMemo(() => leads.filter(l => {
    const m = !search || (l?.name || '').toLowerCase().includes(search.toLowerCase()) || (l?.email || '').toLowerCase().includes(search.toLowerCase()) || (l?.phone || '').includes(search);
    const sf = sourceFilter === 'all' || l?.source === sourceFilter;
    const stf = statusFilter === 'all' || l?.status === statusFilter;
    return m && sf && stf;
  }), [leads, search, sourceFilter, statusFilter]);

  const handleAdd = (e) => {
    e.preventDefault();
    try {
      const fd = new FormData(e.target);
      addLead({ name: fd.get('name'), email: fd.get('email'), phone: fd.get('phone'), source: fd.get('source') || 'website', productInterest: fd.get('productInterest') || '', message: fd.get('message') || '' });
      refresh(); setModal(null);
    } catch (e) { console.error(e); }
  };
  const handleStatus = (id, status) => { try { updateLeadStatus(id, status); refresh(); } catch (e) { console.error(e); } };
  const handleAddNote = (id) => { if (!noteText.trim()) return; try { addLeadNote(id, noteText); setNoteText(''); refresh(); } catch (e) { console.error(e); } };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Leads" value={analytics?.total || leads.length} icon={Users} />
        <KPICard label="New Today" value={safe(() => leads.filter(l => l?.createdAt?.startsWith(todayStr())).length, 0)} icon={Bell} />
        <KPICard label="Conversion Rate" value={`${safe(() => Math.round((leads.filter(l => l?.status === 'converted').length / Math.max(leads.length, 1)) * 100), 0)}%`} icon={TrendingUp} />
        <KPICard label="Avg Score" value={safe(() => Math.round(leads.reduce((s, l) => s + (l?.score || 0), 0) / Math.max(leads.length, 1)), 0)} icon={BarChart3} />
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm pl-9 pr-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
        </div>
        <button onClick={() => setModal('add')} className="flex items-center gap-2 bg-[#D4AF37] text-black px-4 py-2.5 text-sm font-bold hover:bg-[#e5c158] transition-colors"><Plus size={16} /> Add Lead</button>
        <button onClick={() => { try { exportLeadsCSV(); } catch (e) { console.error(e); } }} className="flex items-center gap-2 bg-white/10 text-gray-300 px-4 py-2.5 text-sm border border-white/10 hover:bg-white/20 transition-colors"><Download size={16} /> Export CSV</button>
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {sources.map(s => <button key={s} onClick={() => setSourceFilter(s)} className={`px-3 py-1.5 text-xs rounded-full border ${sourceFilter === s ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>)}
      </div>
      <div className="flex flex-wrap gap-2 mb-4">
        {lStatuses.map(s => <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 text-xs rounded-full border ${statusFilter === s ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>)}
      </div>
      <div className="bg-[#111] border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead><tr className="border-b border-white/10 text-left"><th className="pb-3 text-gray-400 font-medium px-3">Name</th><th className="pb-3 text-gray-400 font-medium px-3">Contact</th><th className="pb-3 text-gray-400 font-medium px-3">Source</th><th className="pb-3 text-gray-400 font-medium px-3">Interest</th><th className="pb-3 text-gray-400 font-medium px-3">Status</th><th className="pb-3 text-gray-400 font-medium px-3">Score</th><th className="pb-3 text-gray-400 font-medium px-3">Date</th><th className="pb-3 text-gray-400 font-medium px-3">Actions</th></tr></thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={l?.id || i} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-3 text-white font-medium">{l?.name || 'Unnamed'}</td>
                <td className="py-3 px-3 text-gray-300 text-xs">{l?.email || ''}<br/>{l?.phone || ''}</td>
                <td className="py-3 px-3"><span className={`text-xs px-2 py-1 rounded-full capitalize ${getLeadSourceColor(l?.source)}`}>{(l?.source || 'website').replace('_', ' ')}</span></td>
                <td className="py-3 px-3 text-gray-300">{l?.productInterest || 'N/A'}</td>
                <td className="py-3 px-3"><span className={`text-xs px-2 py-1 rounded-full capitalize ${getLeadStatusColor(l?.status)}`}>{l?.status || 'new'}</span></td>
                <td className="py-3 px-3"><span className={`font-bold ${getScoreColor(l?.score || 0)}`}>{l?.score || 0}</span></td>
                <td className="py-3 px-3 text-gray-400 text-xs">{safe(() => new Date(l?.createdAt).toLocaleDateString(), '-')}</td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setDetail(l)} className="text-blue-400 hover:text-blue-300 p-1"><Eye size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">No leads found</div>}
      </div>
      {modal === 'add' && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-[#111] border border-white/10 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-white">Add Lead</h3><button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><X size={20} /></button></div>
            <form onSubmit={handleAdd} className="space-y-3">
              <input name="name" required placeholder="Name" className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
              <input name="email" type="email" placeholder="Email" className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
              <input name="phone" placeholder="Phone" className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
              <select name="source" className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37]">
                {['website', 'chatbot', 'contact_form', 'whatsapp'].map(s => <option key={s} value={s} className="bg-[#111]">{(s || '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select>
              <input name="productInterest" placeholder="Product Interest" className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
              <textarea name="message" rows={3} placeholder="Message" className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30 resize-none" />
              <button type="submit" className="w-full bg-[#D4AF37] text-black py-2.5 font-bold text-sm hover:bg-[#e5c158] transition-colors">Add Lead</button>
            </form>
          </div>
        </div>
      )}
      {detail && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setDetail(null)}>
          <div className="bg-[#111] border border-white/10 w-full max-w-lg max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-white">{detail?.name}</h3><button onClick={() => setDetail(null)} className="text-gray-400 hover:text-white"><X size={20} /></button></div>
            <div className="space-y-2 text-sm mb-4">
              <p className="text-gray-300"><span className="text-gray-500">Email:</span> {detail?.email || 'N/A'}</p>
              <p className="text-gray-300"><span className="text-gray-500">Phone:</span> {detail?.phone || 'N/A'}</p>
              <p className="text-gray-300"><span className="text-gray-500">Source:</span> <span className={`text-xs px-2 py-0.5 rounded-full ${getLeadSourceColor(detail?.source)}`}>{(detail?.source || '').replace('_', ' ')}</span></p>
              <p className="text-gray-300"><span className="text-gray-500">Interest:</span> {detail?.productInterest || 'N/A'}</p>
              <p className="text-gray-300"><span className="text-gray-500">Score:</span> <span className={getScoreColor(detail?.score || 0)}>{detail?.score || 0}</span></p>
            </div>
            <div className="border-t border-white/10 pt-4 mb-4">
              <h4 className="text-white font-bold mb-2">Change Status</h4>
              <div className="flex flex-wrap gap-2">
                {lStatuses.slice(1).map(s => (
                  <button key={s} onClick={() => handleStatus(detail?.id, s)} className={`px-3 py-1.5 text-xs rounded-full border capitalize ${detail?.status === s ? 'bg-[#D4AF37] text-black border-[#D4AF37]' : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10'}`}>{s}</button>
                ))}
              </div>
            </div>
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-white font-bold mb-2">Add Note</h4>
              <div className="flex gap-2">
                <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Type a note..." className="flex-1 bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
                <button onClick={() => handleAddNote(detail?.id)} className="px-4 py-2 bg-[#D4AF37] text-black text-sm font-bold hover:bg-[#e5c158]">Add</button>
              </div>
              <div className="mt-3 space-y-2 max-h-40 overflow-y-auto">
                {safe(() => detail?.notes, []).map((n, idx) => (
                  <div key={idx} className="text-xs text-gray-300 bg-white/5 p-2 rounded"><p>{n?.text || n}</p><p className="text-gray-500 mt-1">{safe(() => new Date(n?.timestamp || n?.date).toLocaleString(), '')}</p></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 6: COUPONS
// ═══════════════════════════════════════════════════════════════

function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [modal, setModal] = useState(null);
  useEffect(() => { try { setCoupons(getCoupons()); } catch (e) { console.error(e); } }, []);
  const refresh = () => { try { setCoupons(getCoupons()); } catch (e) { console.error(e); } };

  const handleAdd = (e) => {
    e.preventDefault();
    try {
      const fd = new FormData(e.target);
      addCoupon({ code: fd.get('code'), type: fd.get('type'), value: parseFloat(fd.get('value')) || 0, minOrder: parseFloat(fd.get('minOrder')) || 0, maxDiscount: parseFloat(fd.get('maxDiscount')) || 0, usageLimit: parseInt(fd.get('usageLimit')) || 100, perUserLimit: parseInt(fd.get('perUserLimit')) || 1, expiryDate: fd.get('expiryDate') || '', autoApply: fd.get('autoApply') === 'on', firstTimeOnly: fd.get('firstTimeOnly') === 'on', description: fd.get('description') || '', isActive: true });
      refresh(); setModal(null);
    } catch (e) { console.error(e); }
  };
  const toggle = (id) => { try { const c = coupons.find(x => x?.id === id); if (c) { updateCoupon(id, { ...c, isActive: !c?.isActive }); refresh(); } } catch (e) { console.error(e); } };
  const remove = (id) => { try { deleteCoupon(id); refresh(); } catch (e) { console.error(e); } };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-white font-bold">Coupons</h2>
        <button onClick={() => setModal('add')} className="flex items-center gap-2 bg-[#D4AF37] text-black px-4 py-2.5 text-sm font-bold hover:bg-[#e5c158] transition-colors"><Plus size={16} /> Add Coupon</button>
      </div>
      <div className="bg-[#111] border border-white/10 overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead><tr className="border-b border-white/10 text-left"><th className="pb-3 text-gray-400 font-medium px-3">Code</th><th className="pb-3 text-gray-400 font-medium px-3">Type</th><th className="pb-3 text-gray-400 font-medium px-3">Value</th><th className="pb-3 text-gray-400 font-medium px-3">Min Order</th><th className="pb-3 text-gray-400 font-medium px-3">Usage</th><th className="pb-3 text-gray-400 font-medium px-3">Expiry</th><th className="pb-3 text-gray-400 font-medium px-3">Status</th><th className="pb-3 text-gray-400 font-medium px-3">Actions</th></tr></thead>
          <tbody>
            {coupons.map((c, i) => (
              <tr key={c?.id || i} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-3 text-white font-mono text-xs">{c?.code || 'N/A'}</td>
                <td className="py-3 px-3"><span className={`text-xs px-2 py-1 rounded-full capitalize ${getCouponTypeColor(c?.type)}`}>{c?.type || 'flat'}</span></td>
                <td className="py-3 px-3 text-white">{c?.type === 'percentage' ? `${c?.value}%` : formatINR(c?.value || 0)}</td>
                <td className="py-3 px-3 text-gray-300">{formatINR(c?.minOrder || 0)}</td>
                <td className="py-3 px-3 text-gray-300">{c?.usedCount || 0}/{c?.usageLimit || 0}</td>
                <td className="py-3 px-3 text-gray-400 text-xs">{c?.expiryDate ? safe(() => new Date(c?.expiryDate).toLocaleDateString(), '-') : 'No expiry'}</td>
                <td className="py-3 px-3">
                  <button onClick={() => toggle(c?.id)} className={`text-xs px-2 py-1 rounded-full ${c?.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{c?.isActive ? 'Active' : 'Inactive'}</button>
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => remove(c?.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {coupons.length === 0 && <div className="text-center py-8 text-gray-500 text-sm">No coupons found</div>}
      </div>
      {modal === 'add' && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={() => setModal(null)}>
          <div className="bg-[#111] border border-white/10 w-full max-w-md max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4"><h3 className="text-lg font-bold text-white">Add Coupon</h3><button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><X size={20} /></button></div>
            <form onSubmit={handleAdd} className="space-y-3">
              <input name="code" required placeholder="Coupon code" className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
              <select name="type" className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37]"><option value="flat" className="bg-[#111]">Flat Amount</option><option value="percentage" className="bg-[#111]">Percentage</option><option value="free_shipping" className="bg-[#111]">Free Shipping</option></select>
              <input name="value" type="number" required placeholder="Value" className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
              <input name="minOrder" type="number" placeholder="Min Order Amount" className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
              <input name="maxDiscount" type="number" placeholder="Max Discount" className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
              <input name="usageLimit" type="number" placeholder="Usage Limit" defaultValue="100" className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
              <input name="perUserLimit" type="number" placeholder="Per User Limit" defaultValue="1" className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
              <input name="expiryDate" type="date" className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37]" />
              <input name="description" placeholder="Description" className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input name="autoApply" type="checkbox" className="accent-[#D4AF37]" /><span className="text-gray-300 text-sm">Auto Apply</span></label>
                <label className="flex items-center gap-2 cursor-pointer"><input name="firstTimeOnly" type="checkbox" className="accent-[#D4AF37]" /><span className="text-gray-300 text-sm">First Time Only</span></label>
              </div>
              <button type="submit" className="w-full bg-[#D4AF37] text-black py-2.5 font-bold text-sm hover:bg-[#e5c158] transition-colors">Create Coupon</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 7: REPORTS
// ═══════════════════════════════════════════════════════════════

function ReportsPage({ orders, products, users }) {
  const revenue = safe(() => orders.reduce((s, o) => s + (o?.grandTotal || o?.total || 0), 0), 0);
  const avgOrder = orders.length > 0 ? revenue / orders.length : 0;
  const monthly = useMemo(() => {
    const m = Array(6).fill(0);
    orders.forEach(o => { try { const d = new Date(o?.createdAt || o?.date); const i = 5 - ((new Date().getMonth() - d.getMonth() + 12) % 12); if (i >= 0 && i < 6) m[i] += (o?.grandTotal || o?.total || 0); } catch {} });
    return m;
  }, [orders]);
  const maxM = Math.max(...monthly, 1);
  const paymentCounts = useMemo(() => {
    const c = {};
    orders.forEach(o => { const st = o?.paymentStatus || 'pending'; c[st] = (c[st] || 0) + 1; });
    return c;
  }, [orders]);
  const shippingCounts = useMemo(() => {
    const c = {};
    orders.forEach(o => { const st = o?.shipmentStatus || o?.status || 'pending'; c[st] = (c[st] || 0) + 1; });
    return c;
  }, [orders]);
  const topProducts = useMemo(() => {
    const sales = {};
    orders.forEach(o => { safe(() => o?.items, []).forEach(it => { const pid = it?.productId || it?.id; if (pid) { sales[pid] = (sales[pid] || 0) + (it?.quantity || 1); } }); });
    return Object.entries(sales).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id, qty]) => {
      const prod = products.find(p => p?.id === id);
      return { name: prod?.name || 'Unknown', qty, revenue: qty * (prod?.price || 0) };
    });
  }, [orders, products]);

  const exportCSV = (filename, headers, rows) => {
    try {
      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Sales" value={formatINR(revenue)} icon={IndianRupee} />
        <KPICard label="Total Orders" value={orders.length} icon={ShoppingBag} />
        <KPICard label="Avg Order Value" value={formatINR(avgOrder)} icon={BarChart3} />
        <KPICard label="Customers" value={users.length} icon={Users} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#111] border border-white/10 p-4">
          <h3 className="text-white font-bold mb-4">Monthly Sales</h3>
          <div className="flex items-end gap-3 h-40">
            {monthly.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-[#D4AF37]/80 rounded-t" style={{ height: `${(v / maxM) * 120}px` }} />
                <span className="text-xs text-gray-400">{MONTHS[(new Date().getMonth() - 5 + i + 12) % 12]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#111] border border-white/10 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold">Top Products</h3>
            <button onClick={() => exportCSV('top-products.csv', ['Product', 'Qty Sold', 'Revenue'], topProducts.map(p => [p.name, p.qty, p.revenue]))} className="text-[#D4AF37] text-xs hover:underline flex items-center gap-1"><Download size={12} /> CSV</button>
          </div>
          <div className="space-y-2">
            {topProducts.length === 0 && <p className="text-gray-500 text-sm">No data</p>}
            {topProducts.map((p, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-white/5 text-sm">
                <span className="text-gray-300">{p.name}</span>
                <div className="flex gap-4"><span className="text-gray-400">{p.qty} sold</span><span className="text-white">{formatINR(p.revenue)}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-[#111] border border-white/10 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold">Payment Status</h3>
            <button onClick={() => exportCSV('payment-status.csv', ['Status', 'Count'], Object.entries(paymentCounts))} className="text-[#D4AF37] text-xs hover:underline flex items-center gap-1"><Download size={12} /> CSV</button>
          </div>
          <div className="space-y-2">
            {Object.entries(paymentCounts).map(([s, c], i) => (
              <div key={i} className="flex justify-between py-2 border-b border-white/5 text-sm">
                <span className="text-gray-300 capitalize">{s}</span>
                <span className="text-white font-medium">{c}</span>
              </div>
            ))}
            {Object.keys(paymentCounts).length === 0 && <p className="text-gray-500 text-sm">No data</p>}
          </div>
        </div>
        <div className="bg-[#111] border border-white/10 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-bold">Shipping Status</h3>
            <button onClick={() => exportCSV('shipping-status.csv', ['Status', 'Count'], Object.entries(shippingCounts))} className="text-[#D4AF37] text-xs hover:underline flex items-center gap-1"><Download size={12} /> CSV</button>
          </div>
          <div className="space-y-2">
            {Object.entries(shippingCounts).map(([s, c], i) => (
              <div key={i} className="flex justify-between py-2 border-b border-white/5 text-sm">
                <span className="text-gray-300 capitalize">{s}</span>
                <span className="text-white font-medium">{c}</span>
              </div>
            ))}
            {Object.keys(shippingCounts).length === 0 && <p className="text-gray-500 text-sm">No data</p>}
          </div>
        </div>
      </div>
      <button onClick={() => exportCSV('orders.csv', ['ID', 'Customer', 'Total', 'Status', 'Date'], orders.map(o => [o?.id, o?.customer?.name || o?.user?.name, o?.grandTotal || o?.total, o?.status, o?.createdAt || o?.date]))} className="flex items-center gap-2 bg-[#D4AF37] text-black px-4 py-2.5 text-sm font-bold hover:bg-[#e5c158] transition-colors"><Download size={16} /> Export All Orders</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// PAGE 8: SETTINGS
// ═══════════════════════════════════════════════════════════════

function SettingsPage() {
  const [tab, setTab] = useState('general');
  const tabs = [
    { key: 'general', label: 'General', icon: Settings },
    { key: 'gst', label: 'GST', icon: Percent },
    { key: 'payment', label: 'Payment', icon: CreditCard },
    { key: 'shipping', label: 'Shipping', icon: Truck },
    { key: 'branding', label: 'Branding', icon: Star },
  ];
  const [saved, setSaved] = useState(false);
  const showSaved = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const [settings, setSettings] = useState(() => {
    try {
      const s = localStorage.getItem('app_settings');
      return s ? JSON.parse(s) : {};
    } catch { return {}; }
  });
  const update = (key, value) => { const ns = { ...settings, [key]: value }; setSettings(ns); try { localStorage.setItem('app_settings', JSON.stringify(ns)); } catch {} };

  return (
    <div>
      {saved && <div className="mb-4 bg-green-500/20 text-green-400 text-sm px-4 py-2 rounded">Settings saved successfully</div>}
      <div className="flex gap-1 mb-6 border-b border-white/10 overflow-x-auto">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${tab === t.key ? 'border-[#D4AF37] text-[#D4AF37]' : 'border-transparent text-gray-400 hover:text-white'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>
      {tab === 'general' && (
        <div className="bg-[#111] border border-white/10 p-6 max-w-lg space-y-4">
          <h3 className="text-white font-bold mb-4">General Settings</h3>
          <div><label className="block text-gray-400 text-xs mb-1">Store Name</label><input value={settings.storeName || ''} onChange={e => update('storeName', e.target.value)} className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="Store Name" /></div>
          <div><label className="block text-gray-400 text-xs mb-1">Currency</label><input value="INR" disabled className="w-full bg-white/[0.03] border border-white/[0.08] text-gray-500 text-sm px-3 py-2.5 cursor-not-allowed" /></div>
          <div><label className="block text-gray-400 text-xs mb-1">Support Email</label><input value={settings.supportEmail || ''} onChange={e => update('supportEmail', e.target.value)} type="email" className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="support@example.com" /></div>
          <div><label className="block text-gray-400 text-xs mb-1">Support Phone</label><input value={settings.supportPhone || ''} onChange={e => update('supportPhone', e.target.value)} className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="+91 98765 43210" /></div>
          <button onClick={showSaved} className="bg-[#D4AF37] text-black px-6 py-2.5 text-sm font-bold hover:bg-[#e5c158] transition-colors">Save</button>
        </div>
      )}
      {tab === 'gst' && (
        <div className="bg-[#111] border border-white/10 p-6 max-w-lg space-y-4">
          <h3 className="text-white font-bold mb-4">GST Settings</h3>
          <div><label className="block text-gray-400 text-xs mb-1">GST Number</label><input value={settings.gstNumber || ''} onChange={e => update('gstNumber', e.target.value)} className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="22AAAAA0000A1Z5" /></div>
          <div><label className="block text-gray-400 text-xs mb-1">Default GST Rate (%)</label><input value={settings.defaultGstRate || 18} onChange={e => update('defaultGstRate', e.target.value)} type="number" className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" /></div>
          <div className="flex items-center gap-3"><input id="gstInc" type="checkbox" checked={settings.gstInclusive || false} onChange={e => update('gstInclusive', e.target.checked)} className="accent-[#D4AF37]" /><label htmlFor="gstInc" className="text-gray-300 text-sm">Default GST Inclusive</label></div>
          <div className="pt-2"><h4 className="text-gray-400 text-xs mb-2">Common Tax Slabs</h4><div className="flex gap-2">{[5, 12, 18, 28].map(r => <span key={r} className="px-3 py-1 bg-white/5 text-gray-300 text-xs rounded border border-white/10">{r}%</span>)}</div></div>
          <button onClick={showSaved} className="bg-[#D4AF37] text-black px-6 py-2.5 text-sm font-bold hover:bg-[#e5c158] transition-colors">Save</button>
        </div>
      )}
      {tab === 'payment' && (
        <div className="bg-[#111] border border-white/10 p-6 max-w-lg space-y-4">
          <h3 className="text-white font-bold mb-4">Payment Settings</h3>
          <div className="flex items-center justify-between"><span className="text-gray-300 text-sm">Enable Razorpay</span><button onClick={() => update('razorpayEnabled', !settings.razorpayEnabled)} className={`w-10 h-5 rounded-full transition-colors ${settings.razorpayEnabled ? 'bg-[#D4AF37]' : 'bg-gray-600'}`}><div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.razorpayEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} /></button></div>
          <div><label className="block text-gray-400 text-xs mb-1">Razorpay Mode</label><select value={settings.razorpayMode || 'test'} onChange={e => update('razorpayMode', e.target.value)} className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37]"><option value="test" className="bg-[#111]">Test</option><option value="live" className="bg-[#111]">Live</option></select></div>
          <div><label className="block text-gray-400 text-xs mb-1">Key ID</label><input value={settings.razorpayKeyId || ''} onChange={e => update('razorpayKeyId', e.target.value)} className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="rzp_test_..." /></div>
          <div className="flex items-center justify-between"><span className="text-gray-300 text-sm">Enable COD</span><button onClick={() => update('codEnabled', !settings.codEnabled)} className={`w-10 h-5 rounded-full transition-colors ${settings.codEnabled !== false ? 'bg-[#D4AF37]' : 'bg-gray-600'}`}><div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.codEnabled !== false ? 'translate-x-5' : 'translate-x-0.5'}`} /></button></div>
          <button onClick={showSaved} className="bg-[#D4AF37] text-black px-6 py-2.5 text-sm font-bold hover:bg-[#e5c158] transition-colors">Save</button>
        </div>
      )}
      {tab === 'shipping' && (
        <div className="bg-[#111] border border-white/10 p-6 max-w-lg space-y-4">
          <h3 className="text-white font-bold mb-4">Shipping Settings</h3>
          <div><label className="block text-gray-400 text-xs mb-1">Free Shipping Threshold (₹)</label><input value={settings.freeShippingThreshold || ''} onChange={e => update('freeShippingThreshold', e.target.value)} type="number" className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="500" /></div>
          <div><label className="block text-gray-400 text-xs mb-1">Default Courier</label><select value={settings.defaultCourier || ''} onChange={e => update('defaultCourier', e.target.value)} className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37]"><option value="" className="bg-[#111]">Select Courier</option><option value="shiprocket" className="bg-[#111]">Shiprocket</option><option value="delhivery" className="bg-[#111]">Delhivery</option><option value="blue_dart" className="bg-[#111]">Blue Dart</option></select></div>
          <div className="flex items-center justify-between"><span className="text-gray-300 text-sm">COD Available</span><button onClick={() => update('codAvailable', !settings.codAvailable)} className={`w-10 h-5 rounded-full transition-colors ${settings.codAvailable !== false ? 'bg-[#D4AF37]' : 'bg-gray-600'}`}><div className={`w-4 h-4 rounded-full bg-white transition-transform ${settings.codAvailable !== false ? 'translate-x-5' : 'translate-x-0.5'}`} /></button></div>
          <button onClick={showSaved} className="bg-[#D4AF37] text-black px-6 py-2.5 text-sm font-bold hover:bg-[#e5c158] transition-colors">Save</button>
        </div>
      )}
      {tab === 'branding' && (
        <div className="bg-[#111] border border-white/10 p-6 max-w-lg space-y-4">
          <h3 className="text-white font-bold mb-4">Branding</h3>
          <div><label className="block text-gray-400 text-xs mb-1">Logo URL</label><input value={settings.logoUrl || ''} onChange={e => update('logoUrl', e.target.value)} className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="https://..." /></div>
          <div><label className="block text-gray-400 text-xs mb-1">Favicon URL</label><input value={settings.faviconUrl || ''} onChange={e => update('faviconUrl', e.target.value)} className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder="https://..." /></div>
          {settings.logoUrl && <div className="pt-2"><img src={settings.logoUrl} alt="Logo preview" className="h-16 object-contain border border-white/10 rounded p-2 bg-white/5" onError={e => { e.target.style.display = 'none'; }} /></div>}
          <button onClick={showSaved} className="bg-[#D4AF37] text-black px-6 py-2.5 text-sm font-bold hover:bg-[#e5c158] transition-colors">Save</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN ADMIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);

  const refresh = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    try { syncInventoryWithProducts(); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    try { setProducts(getProducts()); } catch (e) { console.error(e); }
  }, [refreshKey]);

  useEffect(() => {
    try { setOrders(getOrders()); } catch (e) { console.error(e); }
  }, [refreshKey]);

  useEffect(() => {
    try { setUsers(getUsers()); } catch (e) { console.error(e); }
  }, [refreshKey]);

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'orders', label: 'Orders', icon: ShoppingBag },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'leads', label: 'Leads', icon: Phone },
    { key: 'coupons', label: 'Coupons', icon: Tag },
    { key: 'reports', label: 'Reports', icon: BarChart3 },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  const sectionTitles = { dashboard: 'Dashboard', orders: 'Orders', products: 'Products', users: 'Users', leads: 'Leads', coupons: 'Coupons', reports: 'Reports', settings: 'Settings' };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/70 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#111] border-r border-white/10 flex flex-col transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:transform-none lg:translate-x-0`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div><span className="text-[#D4AF37] font-bold text-lg">SWORD</span><span className="text-gray-400 ml-2">Admin</span></div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400"><X size={20} /></button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.key} onClick={() => { setSection(item.key); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors ${section === item.key ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20' : 'text-gray-300 hover:bg-white/5 hover:text-white border border-transparent'}`}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] text-xs font-bold">{(user?.name || 'A').charAt(0).toUpperCase()}</div>
            <div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{user?.name || 'Admin'}</p><p className="text-xs text-gray-400 truncate">{user?.email || ''}</p></div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded transition-colors"><LogOut size={16} /> Logout</button>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 overflow-y-auto min-w-0">
        <header className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur border-b border-white/10 px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white p-1"><Menu size={20} /></button>
            <h1 className="text-lg font-bold text-white">{sectionTitles[section] || 'Admin'}</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm hidden sm:block">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>
        </header>
        <div className="p-4 lg:p-6">
          {section === 'dashboard' && <DashboardPage orders={orders} products={products} users={users} leads={[]} onNavigate={setSection} />}
          {section === 'orders' && <OrdersPage orders={orders} refresh={refresh} />}
          {section === 'products' && <ProductsPage products={products} setProducts={setProducts} refresh={refresh} />}
          {section === 'users' && <UsersPage users={users} orders={orders} />}
          {section === 'leads' && <LeadsPage />}
          {section === 'coupons' && <CouponsPage />}
          {section === 'reports' && <ReportsPage orders={orders} products={products} users={users} />}
          {section === 'settings' && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}
