// @ts-nocheck
/**
 * SWORD Admin Dashboard — Lightweight, robust, fully functional
 * Handles data shape mismatches from seeded localStorage data
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, ShoppingBag, Users, Package, Settings,
  LogOut, Search, IndianRupee, TrendingUp, TrendingDown,
  Pencil, Trash2, Plus, X, Menu, Phone
} from 'lucide-react';

// ─── Safe helpers ─────────────────────────────────────────
const INR = (n) => {
  const num = Number(n) || 0;
  return `\u20B9${num.toLocaleString('en-IN')}`;
};

const STATUS_STYLE = {
  delivered: 'bg-green-500/20 text-green-400',
  shipped: 'bg-blue-500/20 text-blue-400',
  processing: 'bg-yellow-500/20 text-yellow-400',
  cancelled: 'bg-red-500/20 text-red-400',
  pending: 'bg-gray-500/20 text-gray-400',
  active: 'bg-green-500/20 text-green-400',
  inactive: 'bg-gray-500/20 text-gray-400',
  new: 'bg-blue-500/20 text-blue-400',
  contacted: 'bg-yellow-500/20 text-yellow-400',
  converted: 'bg-green-500/20 text-green-400',
};

const getStatusStyle = (s) => STATUS_STYLE[s] || STATUS_STYLE.pending;

// ─── Safe data loaders (normalize Admin→Live shapes) ─────
function loadProducts() {
  try {
    const raw = JSON.parse(localStorage.getItem('sword_products') || '[]');
    return Array.isArray(raw) ? raw : [];
  } catch { return []; }
}

function loadOrders() {
  try {
    const raw = JSON.parse(localStorage.getItem('sword_orders') || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.map(o => ({
      id: o?.id || '',
      customer: o?.customer || 'Unknown',
      customerName: o?.customerName || o?.customer,
      email: o?.email || '',
      phone: o?.phone || '',
      items: (o?.items || []).map(it => ({
        productId: it?.productId || '',
        productName: it?.productName || it?.name || 'Product',
        image: it?.image || '/assets/product-hero.png',
        price: Number(it?.price) || 0,
        quantity: Number(it?.quantity || it?.qty) || 1,
      })),
      status: o?.status || 'pending',
      paymentMethod: o?.paymentMethod || 'UPI',
      grandTotal: Number(o?.grandTotal || o?.grand_total || o?.subtotal) || 0,
      createdAt: o?.createdAt || o?.placedAt || new Date().toISOString(),
      trackingNumber: o?.trackingNumber || o?.trackingId || '',
      carrier: o?.carrier || '',
    }));
  } catch { return []; }
}

function loadUsers() {
  try {
    const raw = JSON.parse(localStorage.getItem('sword_users') || '[]');
    if (!Array.isArray(raw)) return [];
    return raw.map(u => ({
      id: u?.id || '',
      name: u?.name || 'Unknown',
      email: u?.email || '',
      phone: u?.phone || '',
      role: u?.role || 'customer',
      status: u?.status || 'active',
      joinDate: u?.joinDate || u?.joined || new Date().toISOString(),
      avatar: u?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u?.name || 'User')}&background=1a365d&color=fff`,
    }));
  } catch { return []; }
}

function loadLeads() {
  try {
    return JSON.parse(localStorage.getItem('sword_interested_customers') || '[]');
  } catch { return []; }
}

function saveProducts(products) {
  localStorage.setItem('sword_products', JSON.stringify(products));
}

// ─── Navigation ───────────────────────────────────────────
const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'leads', label: 'Leads', icon: Phone },
  { key: 'settings', label: 'Settings', icon: Settings },
];

// ─── KPI Cards ────────────────────────────────────────────
function KPICards({ orders, products }) {
  const revenue = orders.reduce((s, o) => s + (Number(o?.grandTotal) || 0), 0);
  const delivered = orders.filter(o => o?.status === 'delivered').length;
  const lowStock = products.filter(p => (Number(p?.stock) || 0) < 10).length;

  const cards = [
    { label: 'Revenue', value: INR(revenue), icon: IndianRupee, col: 'text-[#D4AF37]' },
    { label: 'Orders', value: orders.length, icon: ShoppingBag, col: 'text-[#00B4D8]' },
    { label: 'Products', value: products.length, icon: Package, col: 'text-[#2EC4B6]' },
    { label: 'Delivered', value: delivered, icon: TrendingUp, col: 'text-[#2EC4B6]' },
    { label: 'Pending', value: orders.length - delivered, icon: TrendingDown, col: 'text-[#E8A838]' },
    { label: 'Low Stock', value: lowStock, icon: TrendingDown, col: lowStock > 0 ? 'text-[#E63946]' : 'text-[#2EC4B6]' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {cards.map(c => (
        <div key={c.label} className="bg-white/[0.03] border border-white/10 p-4">
          <c.icon size={18} className={`${c.col} mb-2`} />
          <p className="text-xl font-bold text-white">{c.value}</p>
          <p className="text-xs text-[#A0A0A0] mt-1">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Orders Table ─────────────────────────────────────────
function OrdersTable({ orders }) {
  const [filter, setFilter] = useState('');
  const list = (orders || []).filter(o =>
    !filter || (o?.customer || '').toLowerCase().includes(filter.toLowerCase()) || (o?.id || '').includes(filter)
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search orders..."
            className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm pl-9 pr-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
        </div>
        <span className="text-[#A0A0A0] text-sm">{list.length} orders</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-left">
            {['ID', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => <th key={h} className="pb-3 text-[#A0A0A0] font-medium px-3">{h}</th>)}
          </tr></thead>
          <tbody>
            {list.map((o, i) => (
              <tr key={o?.id || i} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-3 text-white font-mono text-xs">{(o?.id || '').slice(0, 10)}</td>
                <td className="py-3 px-3 text-white">{o?.customer || 'N/A'}</td>
                <td className="py-3 px-3 text-[#A0A0A0]">{o?.items?.length || 0}</td>
                <td className="py-3 px-3 text-[#D4AF37]">{INR(o?.grandTotal)}</td>
                <td className="py-3 px-3"><span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(o?.status)}`}>{o?.status || '-'}</span></td>
                <td className="py-3 px-3 text-[#A0A0A0] text-xs">{o?.createdAt ? new Date(o.createdAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="text-center text-[#A0A0A0] py-12">No orders</p>}
      </div>
    </div>
  );
}

// ─── Products Table ───────────────────────────────────────
function ProductsTable({ products, onChange }) {
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const list = (products || []).filter(p => !filter || (p?.name || '').toLowerCase().includes(filter.toLowerCase()));

  function handleDelete(id) {
    if (confirm('Delete?')) { saveProducts(loadProducts().filter(p => p.id !== id)); onChange(); }
  }
  function handleSave(form) {
    const all = loadProducts();
    if (editing) {
      const idx = all.findIndex(p => p.id === editing.id);
      if (idx >= 0) all[idx] = { ...all[idx], ...form };
    } else {
      all.push({ id: `p_${Date.now()}`, name: form.name || 'New', price: Number(form.price) || 0, stock: Number(form.stock) || 0, category: form.category || 'General', rating: 4.5, reviews: 0, image: '/assets/product-hero.png', description: form.description || '', specs: {}, inStock: true, visible: true });
    }
    saveProducts(all); setEditing(null); setShowAdd(false); onChange();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search products..."
            className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm pl-9 pr-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-[#D4AF37] text-black text-xs font-semibold px-4 py-2.5 flex items-center gap-2 hover:bg-[#E5C158] transition-colors">
          <Plus size={14} /> Add
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-left">
            {['Product', 'Category', 'Price', 'Stock', 'Actions'].map(h => <th key={h} className="pb-3 text-[#A0A0A0] font-medium px-3">{h}</th>)}
          </tr></thead>
          <tbody>
            {list.map((p, i) => (
              <tr key={p?.id || i} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-3 flex items-center gap-3">
                  <img src={p?.image || '/assets/product-hero.png'} className="w-10 h-10 object-contain bg-[#111] rounded" alt="" />
                  <span className="text-white">{p?.name || 'Unnamed'}</span>
                </td>
                <td className="py-3 px-3 text-[#A0A0A0]">{p?.category || '-'}</td>
                <td className="py-3 px-3 text-[#D4AF37]">{INR(p?.price)}</td>
                <td className="py-3 px-3 text-white">{p?.stock ?? 0}</td>
                <td className="py-3 px-3">
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(p)} className="p-1.5 text-[#A0A0A0] hover:text-[#D4AF37]"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(p?.id)} className="p-1.5 text-[#A0A0A0] hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="text-center text-[#A0A0A0] py-12">No products</p>}
      </div>

      {(editing || showAdd) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => { setEditing(null); setShowAdd(false); }}>
          <div className="bg-[#111] border border-white/10 p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between mb-4">
              <h3 className="text-lg font-bold text-white">{editing ? 'Edit' : 'Add'} Product</h3>
              <button onClick={() => { setEditing(null); setShowAdd(false); }} className="text-[#A0A0A0]"><X size={20} /></button>
            </div>
            <ProductForm product={editing} onSave={handleSave} />
          </div>
        </div>
      )}
    </div>
  );
}

function ProductForm({ product, onSave }) {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(String(product?.price || ''));
  const [stock, setStock] = useState(String(product?.stock || ''));
  const [category, setCategory] = useState(product?.category || 'Water Purifiers');
  const [desc, setDesc] = useState(product?.description || '');
  return (
    <div className="space-y-4">
      {[
        { label: 'Name', val: name, set: setName },
        { label: 'Price', val: price, set: setPrice, num: true },
        { label: 'Stock', val: stock, set: setStock, num: true },
        { label: 'Category', val: category, set: setCategory },
      ].map(f => (
        <div key={f.label}>
          <label className="text-xs text-[#A0A0A0] uppercase mb-1 block">{f.label}</label>
          <input type={f.num ? 'number' : 'text'} value={f.val} onChange={e => f.set(e.target.value)}
            className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
        </div>
      ))}
      <div>
        <label className="text-xs text-[#A0A0A0] uppercase mb-1 block">Description</label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)}
          className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] min-h-[60px] placeholder:text-white/30" />
      </div>
      <button onClick={() => onSave({ name, price: Number(price), stock: Number(stock), category, description: desc })}
        className="w-full bg-[#D4AF37] text-black text-sm font-semibold py-2.5 hover:bg-[#E5C158] transition-colors">
        {product ? 'Update' : 'Add'} Product
      </button>
    </div>
  );
}

// ─── Users Table ──────────────────────────────────────────
function UsersTable({ users }) {
  const [filter, setFilter] = useState('');
  const list = (users || []).filter(u => !filter || (u?.name || '').toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <div className="relative max-w-xs mb-4">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search users..."
          className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm pl-9 pr-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-left">
            {['User', 'Email', 'Phone', 'Role', 'Status'].map(h => <th key={h} className="pb-3 text-[#A0A0A0] font-medium px-3">{h}</th>)}
          </tr></thead>
          <tbody>
            {list.map((u, i) => (
              <tr key={u?.id || i} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-3 flex items-center gap-3">
                  <img src={u?.avatar || ''} className="w-8 h-8 rounded-full bg-[#222]" alt="" />
                  <span className="text-white">{u?.name || 'Unknown'}</span>
                </td>
                <td className="py-3 px-3 text-[#A0A0A0]">{u?.email || '-'}</td>
                <td className="py-3 px-3 text-[#A0A0A0]">{u?.phone || '-'}</td>
                <td className="py-3 px-3"><span className={`px-2 py-1 text-xs rounded-full ${u?.role === 'admin' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : getStatusStyle('active')}`}>{u?.role || '-'}</span></td>
                <td className="py-3 px-3"><span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(u?.status)}`}>{u?.status || '-'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="text-center text-[#A0A0A0] py-12">No users</p>}
      </div>
    </div>
  );
}

// ─── Leads Table ──────────────────────────────────────────
function LeadsTable() {
  const [filter, setFilter] = useState('');
  const leads = loadLeads();
  const list = leads.filter((l) => !filter || (l?.name || '').toLowerCase().includes(filter.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search leads..."
            className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm pl-9 pr-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" />
        </div>
        <span className="text-[#A0A0A0] text-sm">{list.length} leads</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10 text-left">
            {['Name', 'Email', 'Phone', 'Source', 'Status', 'Date'].map(h => <th key={h} className="pb-3 text-[#A0A0A0] font-medium px-3">{h}</th>)}
          </tr></thead>
          <tbody>
            {list.map((l, i) => (
              <tr key={l?.id || i} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-3 text-white font-medium">{l?.name || '-'}</td>
                <td className="py-3 px-3 text-[#A0A0A0]">{l?.email || '-'}</td>
                <td className="py-3 px-3 text-[#A0A0A0]">{l?.phone || '-'}</td>
                <td className="py-3 px-3 text-[#A0A0A0] capitalize">{l?.source || '-'}</td>
                <td className="py-3 px-3"><span className={`px-2 py-1 text-xs rounded-full ${getStatusStyle(l?.status)}`}>{l?.status || 'new'}</span></td>
                <td className="py-3 px-3 text-[#A0A0A0] text-xs">{l?.timestamp ? new Date(l.timestamp).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.length === 0 && <p className="text-center text-[#A0A0A0] py-12">No leads yet. Chatbot captures will appear here.</p>}
      </div>
    </div>
  );
}

// ─── Settings ─────────────────────────────────────────────
function SettingsPage() {
  const [saved, setSaved] = useState(false);
  return (
    <div className="max-w-xl">
      <h3 className="text-lg font-bold text-white mb-6">Store Settings</h3>
      <div className="space-y-4">
        {['Store Name', 'Support Phone', 'Support Email', 'Free Shipping Threshold'].map(label => (
          <div key={label}>
            <label className="text-xs text-[#A0A0A0] uppercase mb-1 block">{label}</label>
            <input className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2.5 outline-none focus:border-[#D4AF37] placeholder:text-white/30" placeholder={label} />
          </div>
        ))}
        <button onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
          className="bg-[#D4AF37] text-black text-sm font-semibold py-2.5 px-8 hover:bg-[#E5C158] transition-colors">
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ─── MAIN ADMIN ───────────────────────────────────────────
export default function Admin() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tick, setTick] = useState(0);

  // Auth guard
  useEffect(() => {
    if (!isAdmin) {
      const t = setTimeout(() => navigate('/account'), 600);
      return () => clearTimeout(t);
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#A0A0A0] text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const refresh = () => setTick(t => t + 1);

  // Load data fresh on each tick
  const products = loadProducts();
  const orders = loadOrders();
  const users = loadUsers();

  const renderSection = () => {
    switch (section) {
      case 'dashboard': return <><KPICards orders={orders} products={products} /><OrdersTable orders={orders} /></>;
      case 'orders': return <OrdersTable orders={orders} />;
      case 'products': return <ProductsTable products={products} onChange={refresh} />;
      case 'users': return <UsersTable users={users} />;
      case 'leads': return <LeadsTable />;
      case 'settings': return <SettingsPage />;
      default: return <KPICards orders={orders} products={products} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-[72px] bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10 px-4 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 text-white hover:bg-white/10 rounded">
            <Menu size={20} />
          </button>
          <span className="text-[#D4AF37] font-bold text-lg tracking-wider">SWORD</span>
          <span className="text-white/30">|</span>
          <span className="text-[#A0A0A0] text-sm">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-white text-sm hidden sm:inline">{user?.name}</span>
          <button onClick={() => { logout(); navigate('/'); }} className="text-[#E63946] text-sm hover:bg-[#E63946]/10 px-3 py-1.5 rounded transition-colors">
            <LogOut size={16} className="inline mr-1" />Exit
          </button>
        </div>
      </div>

      <div className="flex pt-[72px]">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-[72px] left-0 z-40 w-[240px] h-[calc(100vh-72px)] bg-[#0E0E0E] border-r border-white/10 overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img src={user?.avatar || ''} className="w-9 h-9 rounded-full bg-[#222]" alt="" />
              <div>
                <p className="text-white text-sm font-medium">{user?.name}</p>
                <p className="text-[#666] text-xs">{user?.email}</p>
              </div>
            </div>
          </div>
          <nav className="p-3 space-y-1">
            {NAV.map(item => {
              const Icon = item.icon;
              const active = section === item.key;
              return (
                <button key={item.key} onClick={() => { setSection(item.key); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${active ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30' : 'text-[#A0A0A0] hover:text-white hover:bg-white/5'}`}>
                  <Icon size={18} /> {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main */}
        <main className="flex-1 p-4 lg:p-8 min-h-[calc(100vh-72px)] overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-white">{NAV.find(n => n.key === section)?.label || 'Dashboard'}</h1>
            <span className="text-[#A0A0A0] text-sm">{new Date().toLocaleDateString('en-IN')}</span>
          </div>
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
