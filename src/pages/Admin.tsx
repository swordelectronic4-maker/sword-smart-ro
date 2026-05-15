// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard, ShoppingBag, Users, Package, Settings,
  LogOut, Search, IndianRupee, TrendingUp, TrendingDown,
  Eye, Pencil, Trash2, Plus, X, ChevronLeft, Menu, Phone, Mail, MapPin
} from 'lucide-react';
import { getProducts, getOrders, getUsers, getInterestedCustomers, saveProducts, type LiveProduct, type LiveOrder, type LiveUser } from '@/services/dataStore';

const INR = (n: number) => `\u20B9${n?.toLocaleString('en-IN') || '0'}`;

const STATUS_COLOR: Record<string, string> = {
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

const NAV = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'leads', label: 'Leads', icon: Phone },
  { key: 'settings', label: 'Settings', icon: Settings },
];

/* ===== KPI CARDS ===== */
function KPICards({ orders, products }: { orders: LiveOrder[]; products: LiveProduct[] }) {
  const totalRevenue = orders.reduce((s, o) => s + (o.grandTotal || 0), 0);
  const totalOrders = orders.length;
  const totalProducts = products.length;
  const lowStock = products.filter(p => (p.stock || 0) < 10).length;
  const delivered = orders.filter(o => o.status === 'delivered').length;

  const cards = [
    { label: 'Total Revenue', value: INR(totalRevenue), icon: IndianRupee, color: 'text-[#D4AF37]' },
    { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: 'text-[#00B4D8]' },
    { label: 'Products', value: totalProducts, icon: Package, color: 'text-[#2EC4B6]' },
    { label: 'Low Stock', value: lowStock, icon: TrendingDown, color: lowStock > 0 ? 'text-[#E63946]' : 'text-[#2EC4B6]' },
    { label: 'Delivered', value: delivered, icon: TrendingUp, color: 'text-[#2EC4B6]' },
    { label: 'Pending', value: totalOrders - delivered, icon: TrendingDown, color: 'text-[#E8A838]' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      {cards.map(c => (
        <div key={c.label} className="glass-panel p-4">
          <c.icon size={18} className={`${c.color} mb-2`} />
          <p className="text-xl font-bold text-white font-['Playfair_Display']">{c.value}</p>
          <p className="text-xs text-[#A0A0A0] mt-1">{c.label}</p>
        </div>
      ))}
    </div>
  );
}

/* ===== ORDERS MODULE ===== */
function OrdersModule({ orders }: { orders: LiveOrder[] }) {
  const [filter, setFilter] = useState('');
  const filtered = orders.filter(o =>
    (o.customerName || o.customer || '').toLowerCase().includes(filter.toLowerCase()) ||
    (o.id || '').toLowerCase().includes(filter.toLowerCase()) ||
    (o.status || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search orders..." className="input-sword pl-9 text-sm" />
        </div>
        <span className="text-[#A0A0A0] text-sm">{filtered.length} orders</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date'].map(h => (
                <th key={h} className="pb-3 text-[#A0A0A0] font-medium px-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3 text-white font-mono text-xs">{o.id?.slice(0, 12)}...</td>
                <td className="py-3 px-3 text-white">{o.customerName || o.customer || 'N/A'}</td>
                <td className="py-3 px-3 text-[#A0A0A0]">{o.items?.length || 0} items</td>
                <td className="py-3 px-3 text-[#D4AF37] font-medium">{INR(o.grandTotal || 0)}</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLOR[o.status || 'pending'] || STATUS_COLOR.pending}`}>
                    {o.status || 'pending'}
                  </span>
                </td>
                <td className="py-3 px-3 text-[#A0A0A0] text-xs">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-[#A0A0A0] py-12">No orders found</p>}
      </div>
    </div>
  );
}

/* ===== PRODUCTS MODULE ===== */
function ProductsModule({ products, onChange }: { products: LiveProduct[]; onChange: () => void }) {
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState<LiveProduct | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = products.filter(p =>
    (p.name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(filter.toLowerCase())
  );

  function handleSave(formData: Partial<LiveProduct>) {
    const all = getProducts();
    if (editing) {
      const idx = all.findIndex(p => p.id === editing.id);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...formData };
        saveProducts(all);
      }
    } else {
      const newProduct: LiveProduct = {
        id: `p_${Date.now()}`,
        name: formData.name || 'New Product',
        price: Number(formData.price) || 0,
        originalPrice: Number(formData.price) * 1.3 || 0,
        category: formData.category || 'Uncategorized',
        rating: 4.5,
        reviews: 0,
        image: '/assets/product-hero.png',
        description: formData.description || '',
        specs: {},
        inStock: true,
        stock: Number(formData.stock) || 0,
        visible: true,
        slug: (formData.name || 'product').toLowerCase().replace(/\s+/g, '-'),
        sku: `SWORD-${Date.now()}`,
        featured: false,
      };
      saveProducts([...all, newProduct]);
    }
    setEditing(null);
    setShowAdd(false);
    onChange();
  }

  function handleDelete(id: string) {
    if (confirm('Delete this product?')) {
      saveProducts(getProducts().filter(p => p.id !== id));
      onChange();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search products..." className="input-sword pl-9 text-sm" />
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary text-xs py-2 px-4 flex items-center gap-2">
          <Plus size={14} /> Add Product
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              {['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                <th key={h} className="pb-3 text-[#A0A0A0] font-medium px-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                <td className="py-3 px-3">
                  <div className="flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-10 h-10 object-contain bg-[#111] rounded" />
                    <div>
                      <p className="text-white text-sm">{p.name}</p>
                      <p className="text-[#666] text-xs">{p.sku || p.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-[#A0A0A0]">{p.category}</td>
                <td className="py-3 px-3 text-[#D4AF37] font-medium">{INR(p.price)}</td>
                <td className="py-3 px-3 text-white">{p.stock || 0}</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${(p.stock || 0) > 0 ? STATUS_COLOR.active : STATUS_COLOR.inactive}`}>
                    {(p.stock || 0) > 0 ? 'Active' : 'Out of Stock'}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(p)} className="p-1.5 hover:bg-white/10 rounded text-[#A0A0A0] hover:text-[#D4AF37] transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-white/10 rounded text-[#A0A0A0] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-[#A0A0A0] py-12">No products found</p>}
      </div>

      {/* Edit/Add Modal */}
      {(editing || showAdd) && (
        <ProductModal product={editing} onSave={handleSave} onClose={() => { setEditing(null); setShowAdd(false); }} />
      )}
    </div>
  );
}

/* ===== PRODUCT MODAL ===== */
function ProductModal({ product, onSave, onClose }: { product: LiveProduct | null; onSave: (d: Partial<LiveProduct>) => void; onClose: () => void }) {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(String(product?.price || ''));
  const [stock, setStock] = useState(String(product?.stock || ''));
  const [category, setCategory] = useState(product?.category || 'Water Purifiers');
  const [desc, setDesc] = useState(product?.description || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={onClose}>
      <div className="glass-panel w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white font-['Playfair_Display']">{product ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onClose} className="text-[#A0A0A0] hover:text-white"><X size={20} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-1 block">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input-sword text-sm" placeholder="Product name" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-1 block">Price (INR)</label>
              <input type="number" value={price} onChange={e => setPrice(e.target.value)} className="input-sword text-sm" placeholder="27999" />
            </div>
            <div>
              <label className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-1 block">Stock</label>
              <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="input-sword text-sm" placeholder="50" />
            </div>
          </div>
          <div>
            <label className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-1 block">Category</label>
            <input value={category} onChange={e => setCategory(e.target.value)} className="input-sword text-sm" placeholder="Category" />
          </div>
          <div>
            <label className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-1 block">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} className="input-sword text-sm min-h-[80px]" placeholder="Product description..." />
          </div>
          <button onClick={() => onSave({ name, price: Number(price), stock: Number(stock), category, description: desc })}
            className="btn-primary w-full text-sm py-3">
            {product ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ===== USERS MODULE ===== */
function UsersModule({ users }: { users: LiveUser[] }) {
  const [filter, setFilter] = useState('');
  const filtered = users.filter(u =>
    (u.name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <div className="relative max-w-xs mb-6">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
        <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search users..." className="input-sword pl-9 text-sm" />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              {['User', 'Email', 'Phone', 'Role', 'Status', 'Joined'].map(h => (
                <th key={h} className="pb-3 text-[#A0A0A0] font-medium px-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-3 flex items-center gap-3">
                  <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name)}&background=1a365d&color=fff`} className="w-8 h-8 rounded-full" alt="" />
                  <span className="text-white">{u.name}</span>
                </td>
                <td className="py-3 px-3 text-[#A0A0A0]">{u.email}</td>
                <td className="py-3 px-3 text-[#A0A0A0]">{u.phone || '-'}</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${u.role === 'admin' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : STATUS_COLOR.active}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLOR[u.status || 'active'] || STATUS_COLOR.active}`}>
                    {u.status || 'active'}
                  </span>
                </td>
                <td className="py-3 px-3 text-[#A0A0A0] text-xs">{u.joinDate ? new Date(u.joinDate).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-[#A0A0A0] py-12">No users found</p>}
      </div>
    </div>
  );
}

/* ===== LEADS MODULE ===== */
function LeadsModule() {
  const [filter, setFilter] = useState('');
  const leads = getInterestedCustomers();
  const filtered = leads.filter((l: any) =>
    (l.name || '').toLowerCase().includes(filter.toLowerCase()) ||
    (l.email || '').toLowerCase().includes(filter.toLowerCase()) ||
    (l.phone || '').includes(filter)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Search leads..." className="input-sword pl-9 text-sm" />
        </div>
        <span className="text-[#A0A0A0] text-sm">{filtered.length} leads</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-left">
              {['Name', 'Email', 'Phone', 'Source', 'Status', 'Date'].map(h => (
                <th key={h} className="pb-3 text-[#A0A0A0] font-medium px-3">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((l: any) => (
              <tr key={l.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="py-3 px-3 text-white font-medium">{l.name}</td>
                <td className="py-3 px-3 text-[#A0A0A0]">{l.email}</td>
                <td className="py-3 px-3 text-[#A0A0A0]">{l.phone}</td>
                <td className="py-3 px-3 text-[#A0A0A0] capitalize">{l.source || '-'}</td>
                <td className="py-3 px-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLOR[l.status || 'new'] || STATUS_COLOR.new}`}>
                    {l.status || 'new'}
                  </span>
                </td>
                <td className="py-3 px-3 text-[#A0A0A0] text-xs">{l.timestamp ? new Date(l.timestamp).toLocaleDateString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center text-[#A0A0A0] py-12">No leads yet. Leads captured from chatbot will appear here.</p>}
      </div>
    </div>
  );
}

/* ===== SETTINGS MODULE ===== */
function SettingsModule() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    storeName: 'SWORD Smart Water',
    supportPhone: '+91 95377 97597',
    supportEmail: 'priyank.joshi@swordhome.com',
    freeShipping: '20000',
    razorpayKeyId: '',
    razorpaySecret: '',
    razorpayLive: false,
    shiprocketToken: '',
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-xl">
      <h3 className="text-lg font-bold text-white mb-6 font-['Playfair_Display']">Store Settings</h3>
      <div className="space-y-4">
        {[
          { label: 'Store Name', key: 'storeName' },
          { label: 'Support Phone', key: 'supportPhone' },
          { label: 'Support Email', key: 'supportEmail' },
          { label: 'Free Shipping Threshold (INR)', key: 'freeShipping' },
          { label: 'Razorpay Key ID', key: 'razorpayKeyId' },
          { label: 'Razorpay Secret', key: 'razorpaySecret', type: 'password' },
          { label: 'Shiprocket Token', key: 'shiprocketToken', type: 'password' },
        ].map(field => (
          <div key={field.key}>
            <label className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-1 block">{field.label}</label>
            <input
              type={field.type || 'text'}
              value={form[field.key as keyof typeof form] as string}
              onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
              className="input-sword text-sm"
            />
          </div>
        ))}
        <label className="flex items-center gap-3 py-2">
          <input type="checkbox" checked={form.razorpayLive} onChange={e => setForm(f => ({ ...f, razorpayLive: e.target.checked }))} className="accent-[#D4AF37]" />
          <span className="text-sm text-[#A0A0A0]">Razorpay Live Mode</span>
        </label>
        <button onClick={handleSave} className="btn-primary text-sm py-3 px-8">
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}

/* ===== MAIN ADMIN ===== */
export default function Admin() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Data state
  const [products, setProducts] = useState<LiveProduct[]>([]);
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [users, setUsers] = useState<LiveUser[]>([]);

  // Load data
  useEffect(() => {
    setProducts(getProducts());
    setOrders(getOrders());
    setUsers(getUsers());
  }, [refreshKey]);

  // Auth guard: redirect non-admin
  useEffect(() => {
    if (!isAdmin) {
      const timer = setTimeout(() => navigate('/account'), 500);
      return () => clearTimeout(timer);
    }
  }, [isAdmin, navigate]);

  // If not admin, show redirect message
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#A0A0A0] text-sm">Checking admin access...</p>
          <p className="text-[#666] text-xs mt-2">Redirecting to login</p>
        </div>
      </div>
    );
  }

  function refresh() { setRefreshKey(k => k + 1); }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard': return <><KPICards orders={orders} products={products} /><OrdersModule orders={orders} /></>;
      case 'orders': return <OrdersModule orders={orders} />;
      case 'products': return <ProductsModule products={products} onChange={refresh} />;
      case 'users': return <UsersModule users={users} />;
      case 'leads': return <LeadsModule />;
      case 'settings': return <SettingsModule />;
      default: return <KPICards orders={orders} products={products} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-[72px]">
      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-[72px] left-0 right-0 z-40 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/10 px-4 py-2 flex items-center gap-3">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-white/10 rounded">
          {sidebarOpen ? <X size={20} className="text-white" /> : <Menu size={20} className="text-white" />}
        </button>
        <span className="text-white font-['Playfair_Display'] text-lg">Admin</span>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:sticky top-[72px] lg:top-[72px] left-0 z-30 w-[260px] h-[calc(100vh-72px)] bg-[#0E0E0E] border-r border-white/10 overflow-y-auto transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          {/* Admin profile */}
          <div className="p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Admin')}&background=FFD700&color=000`} className="w-10 h-10 rounded-full" alt="" />
              <div>
                <p className="text-white text-sm font-medium">{user?.name}</p>
                <p className="text-[#666] text-xs">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="p-3 space-y-1">
            {NAV.map(item => {
              const Icon = item.icon;
              const isActive = activeSection === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => { setActiveSection(item.key); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
                      : 'text-[#A0A0A0] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 mt-auto border-t border-white/10">
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-[#E63946] hover:bg-[#E63946]/10 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 min-h-[calc(100vh-72px)] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-white font-['Playfair_Display']">
              {NAV.find(n => n.key === activeSection)?.label || 'Dashboard'}
            </h1>
            <div className="text-[#A0A0A0] text-sm">
              {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>

          {renderSection()}
        </main>
      </div>
    </div>
  );
}
