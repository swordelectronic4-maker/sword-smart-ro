// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Phone,
  Tag,
  BarChart3,
  Settings,
  Search,
  LogOut,
  Menu,
  X,
  Pencil,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  IndianRupee,
  TrendingUp,
  TrendingDown,
  Eye,
  Ban,
  CheckCircle,
  XCircle,
  Filter,
  Star,
  AlertTriangle,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { formatINR, formatINRShort, formatCompactINR } from '@/lib/currency';

// ═══════════════════════════════════════════════════════════════
// DATA LAYER - Safe localStorage helpers
// ═══════════════════════════════════════════════════════════════

function safeParse(str, fallback) {
  try {
    if (!str || str === 'undefined' || str === 'null') return fallback;
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function safeNum(val) {
  try {
    const n = Number(val);
    return isNaN(n) ? 0 : n;
  } catch {
    return 0;
  }
}

function safeString(val) {
  try {
    if (val === null || val === undefined) return '';
    return String(val);
  } catch {
    return '';
  }
}

function safeDate(dateStr) {
  try {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d?.getTime?.())) return safeString(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '-';
  }
}

function generateId(prefix) {
  return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

function loadFromStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem('sword_settings') || '{}');
  } catch {
    return {};
  }
}

// ═══════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'leads', label: 'Leads', icon: Phone },
  { key: 'coupons', label: 'Coupons', icon: Tag },
  { key: 'reports', label: 'Reports', icon: BarChart3 },
  { key: 'settings', label: 'Settings', icon: Settings },
];

// ═══════════════════════════════════════════════════════════════
// STATUS / BADGE helpers
// ═══════════════════════════════════════════════════════════════

function OrderStatusBadge({ status }) {
  const s = safeString(status).toLowerCase();
  const styles = {
    pending: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
    processing: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    shipped: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
    delivered: 'bg-green-500/15 text-green-400 border border-green-500/20',
    cancelled: 'bg-red-500/15 text-red-400 border border-red-500/20',
    refunded: 'bg-gray-500/15 text-gray-400 border border-gray-500/20',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[s] || styles.pending}`}>
      {s || 'pending'}
    </span>
  );
}

function ProductStatusBadge({ status }) {
  const s = safeString(status).toLowerCase();
  const styles = {
    active: 'bg-green-500/15 text-green-400 border border-green-500/20',
    draft: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
    archived: 'bg-gray-500/15 text-gray-400 border border-gray-500/20',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[s] || styles.draft}`}>
      {s || 'draft'}
    </span>
  );
}

function UserRoleBadge({ role }) {
  const r = safeString(role).toLowerCase();
  const styles = {
    admin: 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20',
    manager: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    staff: 'bg-gray-500/15 text-gray-400 border border-gray-500/20',
    customer: 'bg-green-500/15 text-green-400 border border-green-500/20',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[r] || styles.customer}`}>
      {r || 'customer'}
    </span>
  );
}

function UserStatusBadge({ status }) {
  const s = safeString(status).toLowerCase();
  const styles = {
    active: 'bg-green-500/15 text-green-400 border border-green-500/20',
    inactive: 'bg-gray-500/15 text-gray-400 border border-gray-500/20',
    banned: 'bg-red-500/15 text-red-400 border border-red-500/20',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[s] || styles.inactive}`}>
      {s || 'inactive'}
    </span>
  );
}

function LeadStatusBadge({ status }) {
  const s = safeString(status).toLowerCase();
  const styles = {
    new: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    contacted: 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
    qualified: 'bg-green-500/15 text-green-400 border border-green-500/20',
    converted: 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20',
    lost: 'bg-gray-500/15 text-gray-400 border border-gray-500/20',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[s] || styles.new}`}>
      {s || 'new'}
    </span>
  );
}

function LeadSourceBadge({ source }) {
  const s = safeString(source).toLowerCase();
  const styles = {
    website: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    chatbot: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
    referral: 'bg-green-500/15 text-green-400 border border-green-500/20',
    social: 'bg-pink-500/15 text-pink-400 border border-pink-500/20',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[s] || styles.website}`}>
      {s || 'website'}
    </span>
  );
}

function CouponTypeBadge({ type }) {
  const t = safeString(type).toLowerCase();
  const styles = {
    percentage: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
    flat: 'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    free_shipping: 'bg-green-500/15 text-green-400 border border-green-500/20',
  };
  const label = t === 'percentage' ? '%' : t === 'free_shipping' ? 'Free Ship' : t;
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${styles[t] || styles.flat}`}>
      {label || 'flat'}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// KPI Card
// ═══════════════════════════════════════════════════════════════

function KpiCard({ icon: Icon, label, value, subtext, colorClass }) {
  return (
    <div className="rounded-xl p-5 bg-[#1a1a1a] border border-white/5">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
          <Icon size={22} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-400 text-sm">{label}</p>
          <p className="text-2xl font-bold mt-0.5 truncate">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Pagination
// ═══════════════════════════════════════════════════════════════

function Pagination({ page, setPage, pageCount, totalLabel }) {
  return (
    <div className="flex items-center justify-between mt-4 px-1">
      <p className="text-sm text-gray-400">{totalLabel}</p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
          className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm text-gray-400 min-w-[80px] text-center">
          {page} / {pageCount}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
          disabled={page >= pageCount}
          className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function Admin() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Data states ──────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [coupons, setCoupons] = useState([]);

  // ── Search states ────────────────────────────────────────
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productStatusFilter, setProductStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [leadSearch, setLeadSearch] = useState('');
  const [couponSearch, setCouponSearch] = useState('');

  // ── Modal states ─────────────────────────────────────────
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({});

  const [orderDetailOpen, setOrderDetailOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);

  const [userOrdersOpen, setUserOrdersOpen] = useState(false);
  const [viewingUserOrders, setViewingUserOrders] = useState(null);

  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponForm, setCouponForm] = useState({});

  // ── Settings form ────────────────────────────────────────
  const [settingsForm, setSettingsForm] = useState({
    storeName: 'SWORD',
    currency: 'INR',
    gstRate: '18',
    logoUrl: '',
    favicon: '',
    contactEmail: 'admin@sword.com',
    contactPhone: '+91 95377 97597',
    address: '',
    razorpayMode: 'test',
    codEnabled: true,
    freeShippingThreshold: '500',
  });

  // ── Pagination states ────────────────────────────────────
  const [orderPage, setOrderPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [leadPage, setLeadPage] = useState(1);
  const [couponPage, setCouponPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // ═════════════════════════════════════════════════════════
  // LOAD DATA
  // ═════════════════════════════════════════════════════════

  useEffect(() => {
    setProducts(loadFromStorage('sword_products'));
    setOrders(loadFromStorage('sword_orders'));
    setUsers(loadFromStorage('sword_users'));
    setLeads(loadFromStorage('sword_leads').length > 0 ? loadFromStorage('sword_leads') : loadFromStorage('sword_interested_customers'));
    setCoupons(loadFromStorage('sword_coupons'));

    const s = loadSettings();
    if (s?.storeName) {
      setSettingsForm((prev) => ({ ...prev, ...s }));
    }
  }, []);

  // ═════════════════════════════════════════════════════════
  // DERIVED DATA (KPIs)
  // ═════════════════════════════════════════════════════════

  const kpis = useMemo(() => {
    try {
      const revenue = orders.reduce((sum, o) => sum + safeNum(o?.grandTotal), 0);
      const delivered = orders.filter((o) => safeString(o?.status).toLowerCase() === 'delivered').length;
      const pending = orders.filter((o) => {
        const s = safeString(o?.status).toLowerCase();
        return s === 'pending' || s === 'processing';
      }).length;
      const lowStock = products.filter((p) => safeNum(p?.stock) > 0 && safeNum(p?.stock) <= 5).length;
      const outOfStock = products.filter((p) => safeNum(p?.stock) === 0).length;

      return { revenue, totalOrders: orders.length, totalProducts: products.length, delivered, pending, lowStock, outOfStock };
    } catch {
      return { revenue: 0, totalOrders: 0, totalProducts: 0, delivered: 0, pending: 0, lowStock: 0, outOfStock: 0 };
    }
  }, [orders, products]);

  // Monthly revenue data for chart
  const monthlyData = useMemo(() => {
    try {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const data = months.map((m) => ({ month: m, revenue: 0, orders: 0 }));
      orders.forEach((o) => {
        try {
          const d = new Date(o?.createdAt);
          if (!isNaN(d?.getTime?.())) {
            const idx = d.getMonth();
            data[idx].revenue += safeNum(o?.grandTotal);
            data[idx].orders += 1;
          }
        } catch { /* noop */ }
      });
      const maxRev = Math.max(...data.map((d) => d.revenue), 1);
      return { data, maxRev };
    } catch {
      return { data: [], maxRev: 1 };
    }
  }, [orders]);

  // Top products
  const topProducts = useMemo(() => {
    try {
      const productSales = {};
      orders.forEach((o) => {
        (o?.items || o?.orderItems || []).forEach((item) => {
          const pid = item?.productId || item?.id;
          if (pid) {
            productSales[pid] = (productSales[pid] || 0) + safeNum(item?.quantity);
          }
        });
      });
      return products
        .map((p) => ({ ...p, sold: productSales[p?.id] || 0 }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 5);
    } catch {
      return products.slice(0, 5);
    }
  }, [products, orders]);

  // Recent orders
  const recentOrders = useMemo(() => {
    try {
      return [...orders]
        .sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0))
        .slice(0, 5);
    } catch {
      return orders.slice(0, 5);
    }
  }, [orders]);

  // Activity log
  const activityLog = useMemo(() => {
    try {
      const activities = [];
      orders.slice(0, 5).forEach((o) => {
        activities.push({
          text: `Order #${String(o?.id).slice(-6)} placed`,
          date: o?.createdAt,
          type: 'order',
        });
      });
      return activities.sort((a, b) => new Date(b?.date || 0) - new Date(a?.date || 0));
    } catch {
      return [];
    }
  }, [orders]);

  // ═════════════════════════════════════════════════════════
  // FILTERED & PAGINATED DATA
  // ═════════════════════════════════════════════════════════

  const filteredOrders = useMemo(() => {
    try {
      const s = orderSearch.toLowerCase().trim();
      return orders.filter((o) => {
        if (!s) return true;
        const id = safeString(o?.id).toLowerCase();
        const customer = safeString(o?.customerName || o?.customer?.name).toLowerCase();
        return id.includes(s) || customer.includes(s);
      });
    } catch { return []; }
  }, [orders, orderSearch]);

  const pagedOrders = useMemo(() => {
    try {
      const start = (orderPage - 1) * ITEMS_PER_PAGE;
      return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
    } catch { return []; }
  }, [filteredOrders, orderPage]);

  const filteredProducts = useMemo(() => {
    try {
      const s = productSearch.toLowerCase().trim();
      const list = products.filter((p) => {
        if (!s) return true;
        const name = safeString(p?.name).toLowerCase();
        const sku = safeString(p?.sku).toLowerCase();
        return name.includes(s) || sku.includes(s);
      });
      if (productStatusFilter === 'all') return list;
      return list.filter((p) => safeString(p?.status).toLowerCase() === productStatusFilter);
    } catch { return []; }
  }, [products, productSearch, productStatusFilter]);

  const pagedProducts = useMemo(() => {
    try {
      const start = (productPage - 1) * ITEMS_PER_PAGE;
      return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
    } catch { return []; }
  }, [filteredProducts, productPage]);

  const filteredUsers = useMemo(() => {
    try {
      const s = userSearch.toLowerCase().trim();
      return users.filter((u) => {
        if (!s) return true;
        const name = safeString(u?.name || u?.displayName).toLowerCase();
        const email = safeString(u?.email).toLowerCase();
        const phone = safeString(u?.phone).toLowerCase();
        return name.includes(s) || email.includes(s) || phone.includes(s);
      });
    } catch { return []; }
  }, [users, userSearch]);

  const pagedUsers = useMemo(() => {
    try {
      const start = (userPage - 1) * ITEMS_PER_PAGE;
      return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
    } catch { return []; }
  }, [filteredUsers, userPage]);

  const filteredLeads = useMemo(() => {
    try {
      const s = leadSearch.toLowerCase().trim();
      return leads.filter((l) => {
        if (!s) return true;
        const name = safeString(l?.name).toLowerCase();
        const email = safeString(l?.email).toLowerCase();
        const phone = safeString(l?.phone).toLowerCase();
        const source = safeString(l?.source).toLowerCase();
        return name.includes(s) || email.includes(s) || phone.includes(s) || source.includes(s);
      });
    } catch { return []; }
  }, [leads, leadSearch]);

  const pagedLeads = useMemo(() => {
    try {
      const start = (leadPage - 1) * ITEMS_PER_PAGE;
      return filteredLeads.slice(start, start + ITEMS_PER_PAGE);
    } catch { return []; }
  }, [filteredLeads, leadPage]);

  const filteredCoupons = useMemo(() => {
    try {
      const s = couponSearch.toLowerCase().trim();
      return coupons.filter((c) => {
        if (!s) return true;
        const code = safeString(c?.code).toLowerCase();
        return code.includes(s);
      });
    } catch { return []; }
  }, [coupons, couponSearch]);

  const pagedCoupons = useMemo(() => {
    try {
      const start = (couponPage - 1) * ITEMS_PER_PAGE;
      return filteredCoupons.slice(start, start + ITEMS_PER_PAGE);
    } catch { return []; }
  }, [filteredCoupons, couponPage]);

  const pageCounts = {
    orders: Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE)),
    products: Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)),
    users: Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE)),
    leads: Math.max(1, Math.ceil(filteredLeads.length / ITEMS_PER_PAGE)),
    coupons: Math.max(1, Math.ceil(filteredCoupons.length / ITEMS_PER_PAGE)),
  };

  // ═════════════════════════════════════════════════════════
  // HANDLERS
  // ═════════════════════════════════════════════════════════

  function handleLogout() {
    try { logout(); } catch { /* noop */ }
    navigate('/');
  }

  function getInitials(name) {
    try {
      const s = safeString(name);
      if (!s) return 'A';
      return s.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
    } catch { return 'A'; }
  }

  // ── Product Handlers ─────────────────────────────────────

  function openAddProduct() {
    setEditingProduct(null);
    setProductForm({
      name: '', slug: '', description: '', short_description: '',
      price: '', compare_price: '', cost_price: '', sku: '', stock: '',
      category: '', brand: '', is_active: true, is_featured: false,
      tags: '', seo_title: '', seo_description: '', status: 'active',
    });
    setProductModalOpen(true);
  }

  function openEditProduct(product) {
    try {
      setEditingProduct(product);
      setProductForm({
        name: safeString(product?.name),
        slug: safeString(product?.slug),
        description: safeString(product?.description),
        short_description: safeString(product?.short_description),
        price: safeString(product?.price),
        compare_price: safeString(product?.compare_price),
        cost_price: safeString(product?.cost_price),
        sku: safeString(product?.sku),
        stock: safeString(product?.stock),
        category: safeString(product?.category),
        brand: safeString(product?.brand),
        is_active: product?.is_active !== false,
        is_featured: product?.is_featured === true,
        tags: Array.isArray(product?.tags) ? product.tags.join(', ') : safeString(product?.tags),
        seo_title: safeString(product?.seo_title),
        seo_description: safeString(product?.seo_description),
        status: safeString(product?.status) || 'active',
      });
      setProductModalOpen(true);
    } catch { /* noop */ }
  }

  function closeProductModal() {
    setProductModalOpen(false);
    setEditingProduct(null);
    setProductForm({});
  }

  function saveProduct() {
    try {
      const name = safeString(productForm?.name).trim();
      if (!name) return;

      const price = safeNum(productForm?.price);
      const stock = safeNum(productForm?.stock);
      const compare_price = safeNum(productForm?.compare_price);
      const cost_price = safeNum(productForm?.cost_price);

      if (editingProduct) {
        // ═══════════════════════════════════════════════
        // CRITICAL FIX: Product matching uses ONLY id field
        // NEVER use _id or fallback checks
        // ═══════════════════════════════════════════════
        const targetId = editingProduct?.id;
        if (!targetId) return; // Guard: reject mass update without ID

        setProducts((prev) => {
          try {
            const updated = prev.map((p) => {
              if (p?.id === targetId) {
                // ONLY match by id - spread to avoid shared references
                return {
                  ...p,
                  name,
                  slug: safeString(productForm?.slug) || name.toLowerCase().replace(/\s+/g, '-'),
                  description: safeString(productForm?.description),
                  short_description: safeString(productForm?.short_description),
                  price,
                  compare_price,
                  cost_price,
                  sku: safeString(productForm?.sku),
                  stock,
                  category: safeString(productForm?.category),
                  brand: safeString(productForm?.brand),
                  is_active: productForm?.is_active !== false,
                  is_featured: productForm?.is_featured === true,
                  tags: safeString(productForm?.tags),
                  seo_title: safeString(productForm?.seo_title),
                  seo_description: safeString(productForm?.seo_description),
                  status: safeString(productForm?.status) || 'active',
                  updatedAt: new Date().toISOString(),
                };
              }
              return p; // Unchanged product
            });
            saveToStorage('sword_products', updated);
            return updated;
          } catch {
            return prev;
          }
        });
      } else {
        // Create new product
        const newProduct = {
          id: generateId('prod'),
          name,
          slug: safeString(productForm?.slug) || name.toLowerCase().replace(/\s+/g, '-'),
          description: safeString(productForm?.description),
          short_description: safeString(productForm?.short_description),
          price,
          compare_price,
          cost_price,
          sku: safeString(productForm?.sku) || generateId('SKU'),
          stock,
          category: safeString(productForm?.category),
          brand: safeString(productForm?.brand),
          is_active: productForm?.is_active !== false,
          is_featured: productForm?.is_featured === true,
          tags: safeString(productForm?.tags),
          seo_title: safeString(productForm?.seo_title),
          seo_description: safeString(productForm?.seo_description),
          status: safeString(productForm?.status) || 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setProducts((prev) => {
          const updated = [...prev, newProduct];
          saveToStorage('sword_products', updated);
          return updated;
        });
      }
      closeProductModal();
    } catch { /* noop */ }
  }

  function deleteProduct(product) {
    try {
      const targetId = product?.id;
      if (!targetId) return;
      const ok = window.confirm(`Delete "${safeString(product?.name)}"? This cannot be undone.`);
      if (!ok) return;
      setProducts((prev) => {
        try {
          const updated = prev.filter((p) => p?.id !== targetId);
          saveToStorage('sword_products', updated);
          return updated;
        } catch {
          return prev;
        }
      });
    } catch { /* noop */ }
  }

  function toggleFeatured(product) {
    try {
      const targetId = product?.id;
      if (!targetId) return;
      setProducts((prev) => {
        try {
          const updated = prev.map((p) => {
            if (p?.id === targetId) {
              return { ...p, is_featured: !p?.is_featured, updatedAt: new Date().toISOString() };
            }
            return p;
          });
          saveToStorage('sword_products', updated);
          return updated;
        } catch {
          return prev;
        }
      });
    } catch { /* noop */ }
  }

  // ── Order Handlers ───────────────────────────────────────

  function updateOrderStatus(orderId, newStatus) {
    try {
      if (!orderId || !newStatus) return;
      setOrders((prev) => {
        try {
          const updated = prev.map((o) => {
            if (o?.id === orderId) {
              return { ...o, status: newStatus, updatedAt: new Date().toISOString() };
            }
            return o;
          });
          saveToStorage('sword_orders', updated);
          return updated;
        } catch {
          return prev;
        }
      });
      // Update viewing order if open
      if (viewingOrder?.id === orderId) {
        setViewingOrder((prev) => prev ? { ...prev, status: newStatus } : prev);
      }
    } catch { /* noop */ }
  }

  function openOrderDetail(order) {
    setViewingOrder(order);
    setOrderDetailOpen(true);
  }

  // ── User Handlers ────────────────────────────────────────

  function toggleBanUser(userId) {
    try {
      if (!userId) return;
      setUsers((prev) => {
        try {
          const updated = prev.map((u) => {
            if (u?.id === userId) {
              const newStatus = safeString(u?.status).toLowerCase() === 'banned' ? 'active' : 'banned';
              return { ...u, status: newStatus };
            }
            return u;
          });
          saveToStorage('sword_users', updated);
          return updated;
        } catch {
          return prev;
        }
      });
    } catch { /* noop */ }
  }

  function viewUserOrders(userData) {
    setViewingUserOrders(userData);
    setUserOrdersOpen(true);
  }

  // ── Coupon Handlers ──────────────────────────────────────

  function openAddCoupon() {
    setEditingCoupon(null);
    setCouponForm({
      code: '', type: 'percentage', value: '', min_order: '',
      max_discount: '', usage_limit: '', expiry_date: '', auto_apply: false, is_active: true,
    });
    setCouponModalOpen(true);
  }

  function openEditCoupon(coupon) {
    try {
      setEditingCoupon(coupon);
      setCouponForm({
        code: safeString(coupon?.code),
        type: safeString(coupon?.type) || 'percentage',
        value: safeString(coupon?.value),
        min_order: safeString(coupon?.min_order),
        max_discount: safeString(coupon?.max_discount),
        usage_limit: safeString(coupon?.usage_limit),
        expiry_date: safeString(coupon?.expiry_date),
        auto_apply: coupon?.auto_apply === true,
        is_active: coupon?.is_active !== false,
      });
      setCouponModalOpen(true);
    } catch { /* noop */ }
  }

  function closeCouponModal() {
    setCouponModalOpen(false);
    setEditingCoupon(null);
    setCouponForm({});
  }

  function saveCoupon() {
    try {
      const code = safeString(couponForm?.code).trim().toUpperCase();
      if (!code) return;
      const value = safeNum(couponForm?.value);

      if (editingCoupon) {
        const targetId = editingCoupon?.id;
        if (!targetId) return;
        setCoupons((prev) => {
          try {
            const updated = prev.map((c) => {
              if (c?.id === targetId) {
                return {
                  ...c,
                  code,
                  type: safeString(couponForm?.type) || 'percentage',
                  value,
                  min_order: safeNum(couponForm?.min_order),
                  max_discount: safeNum(couponForm?.max_discount),
                  usage_limit: safeNum(couponForm?.usage_limit),
                  expiry_date: safeString(couponForm?.expiry_date),
                  auto_apply: couponForm?.auto_apply === true,
                  is_active: couponForm?.is_active !== false,
                  updatedAt: new Date().toISOString(),
                };
              }
              return c;
            });
            saveToStorage('sword_coupons', updated);
            return updated;
          } catch {
            return prev;
          }
        });
      } else {
        const newCoupon = {
          id: generateId('coup'),
          code,
          type: safeString(couponForm?.type) || 'percentage',
          value,
          min_order: safeNum(couponForm?.min_order),
          max_discount: safeNum(couponForm?.max_discount),
          usage_limit: safeNum(couponForm?.usage_limit),
          expiry_date: safeString(couponForm?.expiry_date),
          auto_apply: couponForm?.auto_apply === true,
          is_active: true,
          usage_count: 0,
          createdAt: new Date().toISOString(),
        };
        setCoupons((prev) => {
          const updated = [...prev, newCoupon];
          saveToStorage('sword_coupons', updated);
          return updated;
        });
      }
      closeCouponModal();
    } catch { /* noop */ }
  }

  function deleteCoupon(coupon) {
    try {
      const targetId = coupon?.id;
      if (!targetId) return;
      const ok = window.confirm(`Delete coupon "${safeString(coupon?.code)}"?`);
      if (!ok) return;
      setCoupons((prev) => {
        try {
          const updated = prev.filter((c) => c?.id !== targetId);
          saveToStorage('sword_coupons', updated);
          return updated;
        } catch {
          return prev;
        }
      });
    } catch { /* noop */ }
  }

  // ── Settings Handler ─────────────────────────────────────

  function saveSettings() {
    try {
      saveToStorage('sword_settings', settingsForm);
      alert('Settings saved successfully!');
    } catch {
      alert('Failed to save settings.');
    }
  }

  // ═════════════════════════════════════════════════════════
  // VIEWS
  // ═════════════════════════════════════════════════════════

  function DashboardView() {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <KpiCard icon={IndianRupee} label="Total Revenue" value={formatINR(kpis.revenue)}
            subtext={`${kpis.delivered} delivered orders`} colorClass="bg-emerald-500/15 text-emerald-400" />
          <KpiCard icon={ShoppingBag} label="Total Orders" value={kpis.totalOrders}
            subtext={`${kpis.pending} pending`} colorClass="bg-blue-500/15 text-blue-400" />
          <KpiCard icon={Package} label="Products" value={kpis.totalProducts}
            subtext={`${kpis.lowStock} low stock`} colorClass="bg-purple-500/15 text-purple-400" />
          <KpiCard icon={CheckCircle} label="Delivered" value={kpis.delivered}
            subtext="Completed orders" colorClass="bg-green-500/15 text-green-400" />
          <KpiCard icon={AlertTriangle} label="Pending" value={kpis.pending}
            subtext="Awaiting action" colorClass="bg-yellow-500/15 text-yellow-400" />
          <KpiCard icon={TrendingDown} label="Low Stock" value={kpis.lowStock}
            subtext={`${kpis.outOfStock} out of stock`} colorClass="bg-red-500/15 text-red-400" />
        </div>

        {/* Revenue Chart + Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Revenue Chart */}
          <div className="lg:col-span-2 rounded-xl p-5 bg-[#1a1a1a] border border-white/5">
            <h3 className="text-lg font-semibold mb-4">Monthly Revenue</h3>
            <div className="flex items-end gap-2 h-48">
              {monthlyData.data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center">
                    <span className="text-[10px] text-gray-500 mb-1">{formatCompactINR(d.revenue)}</span>
                    <div
                      className="w-full max-w-[32px] rounded-t-md bg-gradient-to-t from-[#D4AF37] to-[#D4AF37]/60 min-h-[4px]"
                      style={{ height: `${Math.max(4, (d.revenue / monthlyData.maxRev) * 140)}px` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500">{d.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="rounded-xl p-5 bg-[#1a1a1a] border border-white/5">
            <h3 className="text-lg font-semibold mb-4">Top Products</h3>
            {topProducts.length === 0 ? (
              <p className="text-sm text-gray-500">No sales data yet.</p>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p?.id || i} className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 w-4">{i + 1}</span>
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                      {p?.image ? (
                        <img src={p.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Package size={14} className="text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{safeString(p?.name) || 'Unnamed'}</p>
                      <p className="text-xs text-gray-500">{formatINR(p?.price)}</p>
                    </div>
                    <span className="text-xs text-[#D4AF37]">{safeNum(p?.sold)} sold</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="rounded-xl p-5 bg-[#1a1a1a] border border-white/5">
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-left">
                    <th className="pb-3 font-medium pr-4">Order #</th>
                    <th className="pb-3 font-medium pr-4">Customer</th>
                    <th className="pb-3 font-medium pr-4">Total</th>
                    <th className="pb-3 font-medium pr-4">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o, idx) => (
                    <tr key={o?.id || idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 pr-4 font-mono text-xs text-gray-400">#{String(o?.id).slice(-6)}</td>
                      <td className="py-3 pr-4">{safeString(o?.customerName || o?.customer?.name) || 'Guest'}</td>
                      <td className="py-3 pr-4 font-medium">{formatINR(o?.grandTotal)}</td>
                      <td className="py-3 pr-4"><OrderStatusBadge status={o?.status} /></td>
                      <td className="py-3 text-gray-400">{safeDate(o?.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  function OrdersView() {
    return (
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Orders</h2>
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={orderSearch}
              onChange={(e) => { setOrderSearch(e.target.value); setOrderPage(1); }}
              placeholder="Search by order # or customer..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
            />
          </div>
        </div>

        <div className="rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/5">
          {pagedOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {orderSearch ? 'No matching orders.' : 'No orders found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-left">
                    <th className="py-3 px-4 font-medium">Order #</th>
                    <th className="py-3 px-4 font-medium">Customer</th>
                    <th className="py-3 px-4 font-medium">Items</th>
                    <th className="py-3 px-4 font-medium">Total</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Date</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedOrders.map((o) => (
                    <tr key={o?.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-mono text-xs text-gray-400">#{String(o?.id).slice(-6)}</td>
                      <td className="py-3 px-4">{safeString(o?.customerName || o?.customer?.name) || 'Guest'}</td>
                      <td className="py-3 px-4">{(() => {
                        try { const items = o?.items || o?.orderItems || []; return Array.isArray(items) ? items.length : 0; }
                        catch { return 0; }
                      })()}</td>
                      <td className="py-3 px-4 font-medium">{formatINR(o?.grandTotal)}</td>
                      <td className="py-3 px-4"><OrderStatusBadge status={o?.status} /></td>
                      <td className="py-3 px-4 text-gray-400">{safeDate(o?.createdAt)}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => openOrderDetail(o)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-blue-400 transition-colors"
                          title="View details"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Pagination page={orderPage} setPage={setOrderPage} pageCount={pageCounts.orders}
          totalLabel={`${filteredOrders.length} order(s)`} />
      </div>
    );
  }

  function ProductsView() {
    return (
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Products</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-56">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
                placeholder="Search by name or SKU..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
              />
            </div>
            <select
              value={productStatusFilter}
              onChange={(e) => { setProductStatusFilter(e.target.value); setProductPage(1); }}
              className="px-3 py-2.5 rounded-lg text-sm border border-white/[0.12] bg-white/[0.06] text-white outline-none focus:border-[#D4AF37]/50"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
            <button
              onClick={openAddProduct}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#D4AF37] text-black text-sm font-semibold hover:bg-[#C4A030] transition-colors"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/5">
          {pagedProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {productSearch || productStatusFilter !== 'all' ? 'No matching products.' : 'No products found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-left">
                    <th className="py-3 px-4 font-medium">Image</th>
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">SKU</th>
                    <th className="py-3 px-4 font-medium">Price</th>
                    <th className="py-3 px-4 font-medium">Stock</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedProducts.map((p) => (
                    <tr key={p?.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 px-4">
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden">
                          {p?.image ? (
                            <img src={p.image} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <Package size={16} className="text-gray-500" />
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{safeString(p?.name) || 'Unnamed'}</span>
                          {p?.is_featured && <Star size={14} className="text-[#D4AF37] fill-[#D4AF37]" />}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-400">{safeString(p?.sku) || '-'}</td>
                      <td className="py-3 px-4 font-medium">{formatINR(p?.price)}</td>
                      <td className="py-3 px-4">
                        <span className={safeNum(p?.stock) <= 5 ? 'text-red-400 font-medium' : 'text-green-400'}>
                          {safeNum(p?.stock)}
                        </span>
                      </td>
                      <td className="py-3 px-4"><ProductStatusBadge status={p?.status || (p?.is_active !== false ? 'active' : 'draft')} /></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleFeatured(p)}
                            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${p?.is_featured ? 'text-[#D4AF37]' : 'text-gray-500'}`}
                            title={p?.is_featured ? 'Unfeature' : 'Feature'}
                          >
                            <Star size={16} className={p?.is_featured ? 'fill-[#D4AF37]' : ''} />
                          </button>
                          <button
                            onClick={() => openEditProduct(p)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-blue-400 transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteProduct(p)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Pagination page={productPage} setPage={setProductPage} pageCount={pageCounts.products}
          totalLabel={`${filteredProducts.length} product(s)`} />
      </div>
    );
  }

  function UsersView() {
    const userOrders = (userId) => {
      if (!userId) return [];
      return orders.filter((o) => (o?.customerId || o?.userId) === userId);
    };

    return (
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Users</h2>
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => { setUserSearch(e.target.value); setUserPage(1); }}
              placeholder="Search by name, email or phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
            />
          </div>
        </div>

        <div className="rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/5">
          {pagedUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{userSearch ? 'No matching users.' : 'No users found.'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-left">
                    <th className="py-3 px-4 font-medium">User</th>
                    <th className="py-3 px-4 font-medium">Email</th>
                    <th className="py-3 px-4 font-medium">Phone</th>
                    <th className="py-3 px-4 font-medium">Role</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedUsers.map((u) => (
                    <tr key={u?.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {u?.avatar ? (
                            <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium">
                              {getInitials(u?.name || u?.displayName)}
                            </div>
                          )}
                          <span className="font-medium">{safeString(u?.name || u?.displayName) || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{safeString(u?.email) || '-'}</td>
                      <td className="py-3 px-4 text-gray-400">{safeString(u?.phone) || '-'}</td>
                      <td className="py-3 px-4"><UserRoleBadge role={u?.role} /></td>
                      <td className="py-3 px-4"><UserStatusBadge status={u?.status || 'active'} /></td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => viewUserOrders(u)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-blue-400 transition-colors"
                            title="View orders"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => toggleBanUser(u?.id)}
                            className={`p-1.5 rounded-lg hover:bg-white/10 transition-colors ${safeString(u?.status).toLowerCase() === 'banned' ? 'text-green-400' : 'text-red-400'}`}
                            title={safeString(u?.status).toLowerCase() === 'banned' ? 'Unban' : 'Ban'}
                          >
                            {safeString(u?.status).toLowerCase() === 'banned' ? <CheckCircle size={16} /> : <Ban size={16} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Pagination page={userPage} setPage={setUserPage} pageCount={pageCounts.users}
          totalLabel={`${filteredUsers.length} user(s)`} />

        {/* User Orders Modal */}
        {userOrdersOpen && viewingUserOrders && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="w-full max-w-2xl max-h-[80vh] rounded-xl p-6 border border-white/10 bg-[#1a1a1a] overflow-y-auto">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold">
                  Orders: {safeString(viewingUserOrders?.name || viewingUserOrders?.displayName)}
                </h3>
                <button onClick={() => { setUserOrdersOpen(false); setViewingUserOrders(null); }}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
                  <X size={20} />
                </button>
              </div>
              {userOrders(viewingUserOrders?.id).length === 0 ? (
                <p className="text-gray-500">No orders for this user.</p>
              ) : (
                <div className="space-y-2">
                  {userOrders(viewingUserOrders?.id).map((o) => (
                    <div key={o?.id} className="p-3 rounded-lg bg-white/[0.04] border border-white/5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-gray-400">#{String(o?.id).slice(-6)}</span>
                        <OrderStatusBadge status={o?.status} />
                      </div>
                      <p className="text-sm font-medium mt-1">{formatINR(o?.grandTotal)}</p>
                      <p className="text-xs text-gray-500">{safeDate(o?.createdAt)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  function LeadsView() {
    return (
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Leads</h2>
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={leadSearch}
              onChange={(e) => { setLeadSearch(e.target.value); setLeadPage(1); }}
              placeholder="Search leads..."
              className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
            />
          </div>
        </div>

        <div className="rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/5">
          {pagedLeads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{leadSearch ? 'No matching leads.' : 'No leads found.'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-left">
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">Email</th>
                    <th className="py-3 px-4 font-medium">Phone</th>
                    <th className="py-3 px-4 font-medium">Source</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedLeads.map((l) => (
                    <tr key={l?.id || JSON.stringify(l)} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-medium">{safeString(l?.name) || 'Unknown'}</td>
                      <td className="py-3 px-4 text-gray-400">{safeString(l?.email) || '-'}</td>
                      <td className="py-3 px-4 text-gray-400">{safeString(l?.phone) || '-'}</td>
                      <td className="py-3 px-4"><LeadSourceBadge source={l?.source} /></td>
                      <td className="py-3 px-4"><LeadStatusBadge status={l?.status || 'new'} /></td>
                      <td className="py-3 px-4 text-gray-400">{safeDate(l?.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Pagination page={leadPage} setPage={setLeadPage} pageCount={pageCounts.leads}
          totalLabel={`${filteredLeads.length} lead(s)`} />
      </div>
    );
  }

  function CouponsView() {
    return (
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Coupons</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-56">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={couponSearch}
                onChange={(e) => { setCouponSearch(e.target.value); setCouponPage(1); }}
                placeholder="Search coupon code..."
                className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
              />
            </div>
            <button
              onClick={openAddCoupon}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#D4AF37] text-black text-sm font-semibold hover:bg-[#C4A030] transition-colors"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/5">
          {pagedCoupons.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{couponSearch ? 'No matching coupons.' : 'No coupons found.'}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-left">
                    <th className="py-3 px-4 font-medium">Code</th>
                    <th className="py-3 px-4 font-medium">Type</th>
                    <th className="py-3 px-4 font-medium">Value</th>
                    <th className="py-3 px-4 font-medium">Min Order</th>
                    <th className="py-3 px-4 font-medium">Usage</th>
                    <th className="py-3 px-4 font-medium">Expiry</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedCoupons.map((c) => (
                    <tr key={c?.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 px-4 font-mono font-medium">{safeString(c?.code)}</td>
                      <td className="py-3 px-4"><CouponTypeBadge type={c?.type} /></td>
                      <td className="py-3 px-4">
                        {safeString(c?.type) === 'percentage' ? `${safeNum(c?.value)}%` : safeString(c?.type) === 'free_shipping' ? 'Free' : formatINR(c?.value)}
                      </td>
                      <td className="py-3 px-4 text-gray-400">{safeNum(c?.min_order) > 0 ? formatINR(c?.min_order) : '-'}</td>
                      <td className="py-3 px-4 text-gray-400">{safeNum(c?.usage_count)} / {safeNum(c?.usage_limit) || '∞'}</td>
                      <td className="py-3 px-4 text-gray-400">{safeDate(c?.expiry_date)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${c?.is_active !== false ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-400'}`}>
                          {c?.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditCoupon(c)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-blue-400 transition-colors" title="Edit">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => deleteCoupon(c)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-red-400 transition-colors" title="Delete">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Pagination page={couponPage} setPage={setCouponPage} pageCount={pageCounts.coupons}
          totalLabel={`${filteredCoupons.length} coupon(s)`} />
      </div>
    );
  }

  function ReportsView() {
    const totalSales = kpis.revenue;
    const avgOrderValue = kpis.totalOrders > 0 ? totalSales / kpis.totalOrders : 0;
    const totalCustomers = users.filter((u) => safeString(u?.role).toLowerCase() === 'customer').length;

    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Reports</h2>

        {/* Sales Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <KpiCard icon={IndianRupee} label="Total Sales" value={formatINR(totalSales)}
            subtext="Lifetime revenue" colorClass="bg-emerald-500/15 text-emerald-400" />
          <KpiCard icon={ShoppingBag} label="Total Orders" value={kpis.totalOrders}
            subtext="All time orders" colorClass="bg-blue-500/15 text-blue-400" />
          <KpiCard icon={TrendingUp} label="Avg Order Value" value={formatINR(avgOrderValue)}
            subtext="Per order" colorClass="bg-purple-500/15 text-purple-400" />
          <KpiCard icon={Users} label="Total Customers" value={totalCustomers}
            subtext="Registered users" colorClass="bg-[#D4AF37]/15 text-[#D4AF37]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Sales Chart */}
          <div className="lg:col-span-2 rounded-xl p-5 bg-[#1a1a1a] border border-white/5">
            <h3 className="text-lg font-semibold mb-4">Monthly Sales</h3>
            <div className="flex items-end gap-2 h-48">
              {monthlyData.data.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center">
                    <span className="text-[10px] text-gray-500 mb-1">{formatCompactINR(d.revenue)}</span>
                    <div className="w-full max-w-[32px] rounded-t-md bg-gradient-to-t from-[#D4AF37] to-[#D4AF37]/60 min-h-[4px]"
                      style={{ height: `${Math.max(4, (d.revenue / monthlyData.maxRev) * 140)}px` }} />
                  </div>
                  <span className="text-[10px] text-gray-500">{d.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Log */}
          <div className="rounded-xl p-5 bg-[#1a1a1a] border border-white/5">
            <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
            {activityLog.length === 0 ? (
              <p className="text-sm text-gray-500">No recent activity.</p>
            ) : (
              <div className="space-y-3">
                {activityLog.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#D4AF37] mt-1.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm">{safeString(a?.text)}</p>
                      <p className="text-xs text-gray-500">{safeDate(a?.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-xl p-5 bg-[#1a1a1a] border border-white/5">
          <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-gray-500">No sales data yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-left">
                    <th className="pb-3 font-medium pr-4">Product</th>
                    <th className="pb-3 font-medium pr-4">Price</th>
                    <th className="pb-3 font-medium pr-4">Stock</th>
                    <th className="pb-3 font-medium">Units Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((p) => (
                    <tr key={p?.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 pr-4 font-medium">{safeString(p?.name)}</td>
                      <td className="py-3 pr-4 text-gray-400">{formatINR(p?.price)}</td>
                      <td className="py-3 pr-4">
                        <span className={safeNum(p?.stock) <= 5 ? 'text-red-400' : 'text-green-400'}>
                          {safeNum(p?.stock)}
                        </span>
                      </td>
                      <td className="py-3 font-medium text-[#D4AF37]">{safeNum(p?.sold)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  function SettingsView() {
    return (
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        <div className="space-y-6">
          {/* General */}
          <div className="rounded-xl p-6 bg-[#1a1a1a] border border-white/5">
            <h3 className="text-lg font-semibold mb-4">General</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Store Name</label>
                <input
                  type="text"
                  value={settingsForm?.storeName || ''}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, storeName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Currency</label>
                <input
                  type="text"
                  value="INR (₹)"
                  disabled
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-gray-500 outline-none border border-white/[0.12] bg-white/[0.03] cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">GST Rate (%)</label>
                <input
                  type="number"
                  value={settingsForm?.gstRate || ''}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, gstRate: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
                />
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="rounded-xl p-6 bg-[#1a1a1a] border border-white/5">
            <h3 className="text-lg font-semibold mb-4">Branding</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Logo URL</label>
                <input
                  type="text"
                  value={settingsForm?.logoUrl || ''}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, logoUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Favicon URL</label>
                <input
                  type="text"
                  value={settingsForm?.favicon || ''}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, favicon: e.target.value }))}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
                />
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-xl p-6 bg-[#1a1a1a] border border-white/5">
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={settingsForm?.contactEmail || ''}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Phone</label>
                <input
                  type="text"
                  value={settingsForm?.contactPhone || ''}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, contactPhone: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-gray-400 mb-2">Address</label>
                <textarea
                  value={settingsForm?.address || ''}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06] resize-none"
                />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-xl p-6 bg-[#1a1a1a] border border-white/5">
            <h3 className="text-lg font-semibold mb-4">Payment</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Razorpay Mode</label>
                <select
                  value={settingsForm?.razorpayMode || 'test'}
                  onChange={(e) => setSettingsForm((prev) => ({ ...prev, razorpayMode: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg text-sm border border-white/[0.12] bg-white/[0.06] text-white outline-none focus:border-[#D4AF37]/50"
                >
                  <option value="test">Test</option>
                  <option value="live">Live</option>
                </select>
              </div>
              <div className="flex items-center gap-3 pt-7">
                <button
                  onClick={() => setSettingsForm((prev) => ({ ...prev, codEnabled: !prev?.codEnabled }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${settingsForm?.codEnabled ? 'bg-[#D4AF37]' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settingsForm?.codEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-sm">Cash on Delivery (COD)</span>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-xl p-6 bg-[#1a1a1a] border border-white/5">
            <h3 className="text-lg font-semibold mb-4">Shipping</h3>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Free Shipping Threshold (₹)</label>
              <input
                type="number"
                value={settingsForm?.freeShippingThreshold || ''}
                onChange={(e) => setSettingsForm((prev) => ({ ...prev, freeShippingThreshold: e.target.value }))}
                className="w-full sm:w-64 px-4 py-2.5 rounded-lg text-sm text-white outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
              />
            </div>
          </div>

          {/* Save */}
          <div className="pt-2">
            <button
              onClick={saveSettings}
              className="px-8 py-2.5 rounded-lg bg-[#D4AF37] text-black text-sm font-semibold hover:bg-[#C4A030] transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════
  // MODALS
  // ═════════════════════════════════════════════════════════

  function ProductModal() {
    if (!productModalOpen) return null;
    const isEdit = !!editingProduct;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
        <div className="w-full max-w-2xl max-h-[85vh] rounded-xl p-6 border border-white/10 bg-[#1a1a1a] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold">{isEdit ? 'Edit Product' : 'Add Product'}</h3>
            <button onClick={closeProductModal} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Product Name *</label>
              <input
                type="text"
                value={productForm?.name || ''}
                onChange={(e) => setProductForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Product name"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Slug</label>
              <input
                type="text"
                value={productForm?.slug || ''}
                onChange={(e) => setProductForm((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="product-slug"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">SKU</label>
              <input
                type="text"
                value={productForm?.sku || ''}
                onChange={(e) => setProductForm((prev) => ({ ...prev, sku: e.target.value }))}
                placeholder="SKU-001"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Description</label>
              <textarea
                value={productForm?.description || ''}
                onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Full description"
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06] resize-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">Short Description</label>
              <input
                type="text"
                value={productForm?.short_description || ''}
                onChange={(e) => setProductForm((prev) => ({ ...prev, short_description: e.target.value }))}
                placeholder="Brief product summary"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Price (₹) *</label>
              <input
                type="number"
                value={productForm?.price || ''}
                onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Compare Price (₹)</label>
              <input
                type="number"
                value={productForm?.compare_price || ''}
                onChange={(e) => setProductForm((prev) => ({ ...prev, compare_price: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Cost Price (₹)</label>
              <input
                type="number"
                value={productForm?.cost_price || ''}
                onChange={(e) => setProductForm((prev) => ({ ...prev, cost_price: e.target.value }))}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Stock *</label>
              <input
                type="number"
                value={productForm?.stock || ''}
                onChange={(e) => setProductForm((prev) => ({ ...prev, stock: e.target.value }))}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Category</label>
              <input
                type="text"
                value={productForm?.category || ''}
                onChange={(e) => setProductForm((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="Category"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Brand</label>
              <input
                type="text"
                value={productForm?.brand || ''}
                onChange={(e) => setProductForm((prev) => ({ ...prev, brand: e.target.value }))}
                placeholder="Brand"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <select
                value={productForm?.status || 'active'}
                onChange={(e) => setProductForm((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg text-sm border border-white/[0.12] bg-white/[0.06] text-white outline-none focus:border-[#D4AF37]/50"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Tags (comma separated)</label>
              <input
                type="text"
                value={productForm?.tags || ''}
                onChange={(e) => setProductForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="tag1, tag2, tag3"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">SEO Title</label>
              <input
                type="text"
                value={productForm?.seo_title || ''}
                onChange={(e) => setProductForm((prev) => ({ ...prev, seo_title: e.target.value }))}
                placeholder="SEO title"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-400 mb-2">SEO Description</label>
              <textarea
                value={productForm?.seo_description || ''}
                onChange={(e) => setProductForm((prev) => ({ ...prev, seo_description: e.target.value }))}
                placeholder="Meta description for SEO"
                rows={2}
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06] resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setProductForm((prev) => ({ ...prev, is_active: !prev?.is_active }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${productForm?.is_active !== false ? 'bg-[#D4AF37]' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${productForm?.is_active !== false ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-sm">Active</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setProductForm((prev) => ({ ...prev, is_featured: !prev?.is_featured }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${productForm?.is_featured ? 'bg-[#D4AF37]' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${productForm?.is_featured ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-sm">Featured</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={closeProductModal}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm border border-white/10 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveProduct}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm bg-[#D4AF37] text-black font-semibold hover:bg-[#C4A030] transition-colors"
            >
              {isEdit ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  function OrderDetailModal() {
    if (!orderDetailOpen || !viewingOrder) return null;
    const o = viewingOrder;
    const items = (o?.items || o?.orderItems || []);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
        <div className="w-full max-w-2xl max-h-[80vh] rounded-xl p-6 border border-white/10 bg-[#1a1a1a] overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold">Order #{String(o?.id).slice(-6)}</h3>
            <button onClick={() => { setOrderDetailOpen(false); setViewingOrder(null); }}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Status + Update */}
          <div className="flex items-center gap-4 mb-5 p-3 rounded-lg bg-white/[0.04]">
            <span className="text-sm text-gray-400">Status:</span>
            <OrderStatusBadge status={o?.status} />
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-400">Update:</span>
              <select
                value={safeString(o?.status).toLowerCase()}
                onChange={(e) => updateOrderStatus(o?.id, e.target.value)}
                className="px-3 py-1.5 rounded-lg text-sm border border-white/[0.12] bg-white/[0.06] text-white outline-none focus:border-[#D4AF37]/50"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
          </div>

          {/* Customer */}
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Customer</h4>
            <p className="text-sm">{safeString(o?.customerName || o?.customer?.name) || 'Guest'}</p>
            <p className="text-sm text-gray-400">{safeString(o?.customerEmail || o?.customer?.email) || '-'}</p>
            <p className="text-sm text-gray-400">{safeString(o?.customerPhone || o?.customer?.phone) || '-'}</p>
          </div>

          {/* Items */}
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Items</h4>
            <div className="space-y-2">
              {Array.isArray(items) && items.length > 0 ? items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.04]">
                  <div>
                    <p className="text-sm font-medium">{safeString(item?.name || item?.productName)}</p>
                    <p className="text-xs text-gray-500">Qty: {safeNum(item?.quantity)}</p>
                  </div>
                  <span className="text-sm">{formatINR(item?.price)}</span>
                </div>
              )) : <p className="text-sm text-gray-500">No items</p>}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-white/10 pt-4 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span>{formatINR(o?.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Shipping</span>
              <span>{formatINR(o?.shipping)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Tax (GST)</span>
              <span>{formatINR(o?.tax)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold pt-2 border-t border-white/10">
              <span>Grand Total</span>
              <span className="text-[#D4AF37]">{formatINR(o?.grandTotal)}</span>
            </div>
          </div>

          {/* Shipping Address */}
          {o?.shippingAddress && (
            <div className="mt-5 pt-4 border-t border-white/10">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">Shipping Address</h4>
              <p className="text-sm text-gray-300">{safeString(o?.shippingAddress)}</p>
            </div>
          )}

          {/* Timeline */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Timeline</h4>
            <div className="space-y-2">
              {o?.createdAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm">Order placed - {safeDate(o?.createdAt)}</span>
                </div>
              )}
              {o?.updatedAt && o?.updatedAt !== o?.createdAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm">Last updated - {safeDate(o?.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function CouponModal() {
    if (!couponModalOpen) return null;
    const isEdit = !!editingCoupon;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
        <div className="w-full max-w-md rounded-xl p-6 border border-white/10 bg-[#1a1a1a]">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold">{isEdit ? 'Edit Coupon' : 'Add Coupon'}</h3>
            <button onClick={closeCouponModal} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Coupon Code *</label>
              <input
                type="text"
                value={couponForm?.code || ''}
                onChange={(e) => setCouponForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="SAVE20"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Type</label>
              <select
                value={couponForm?.type || 'percentage'}
                onChange={(e) => setCouponForm((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg text-sm border border-white/[0.12] bg-white/[0.06] text-white outline-none focus:border-[#D4AF37]/50"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
                <option value="free_shipping">Free Shipping</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Value {safeString(couponForm?.type) === 'percentage' ? '(%)' : safeString(couponForm?.type) === 'flat' ? '(₹)' : ''}
              </label>
              <input
                type="number"
                value={couponForm?.value || ''}
                onChange={(e) => setCouponForm((prev) => ({ ...prev, value: e.target.value }))}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Min Order (₹)</label>
                <input
                  type="number"
                  value={couponForm?.min_order || ''}
                  onChange={(e) => setCouponForm((prev) => ({ ...prev, min_order: e.target.value }))}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Max Discount (₹)</label>
                <input
                  type="number"
                  value={couponForm?.max_discount || ''}
                  onChange={(e) => setCouponForm((prev) => ({ ...prev, max_discount: e.target.value }))}
                  placeholder="0"
                  min="0"
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Usage Limit</label>
                <input
                  type="number"
                  value={couponForm?.usage_limit || ''}
                  onChange={(e) => setCouponForm((prev) => ({ ...prev, usage_limit: e.target.value }))}
                  placeholder="Unlimited"
                  min="0"
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Expiry Date</label>
                <input
                  type="date"
                  value={couponForm?.expiry_date || ''}
                  onChange={(e) => setCouponForm((prev) => ({ ...prev, expiry_date: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg text-sm text-white outline-none border border-white/[0.12] focus:border-[#D4AF37]/50 bg-white/[0.06]"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCouponForm((prev) => ({ ...prev, auto_apply: !prev?.auto_apply }))}
                className={`relative w-12 h-6 rounded-full transition-colors ${couponForm?.auto_apply ? 'bg-[#D4AF37]' : 'bg-gray-600'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${couponForm?.auto_apply ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
              <span className="text-sm">Auto Apply</span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={closeCouponModal}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm border border-white/10 hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveCoupon}
              className="flex-1 px-4 py-2.5 rounded-lg text-sm bg-[#D4AF37] text-black font-semibold hover:bg-[#C4A030] transition-colors"
            >
              {isEdit ? 'Save Changes' : 'Add Coupon'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Read-only banner for non-admins */}
      {!isAdmin && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-yellow-600/20 border-b border-yellow-600/40 px-4 py-2 text-center text-sm text-yellow-400">
          Read-only mode. Login as admin to make changes.
        </div>
      )}

      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#0A0A0A] border-b border-white/10 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center">
              <TrendingUp size={18} className="text-black" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight">SWORD</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 text-gray-400">Admin</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-gray-400">
            {safeString(user?.name) || 'Admin'}
          </span>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium overflow-hidden">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full object-cover" />
            ) : (
              getInitials(user?.name || user?.email)
            )}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-16 left-0 bottom-0 w-64 bg-[#111] border-r border-white/10 z-30 transform transition-transform duration-200 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { setActiveView(item.key); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                getInitials(user?.name || user?.email)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{safeString(user?.name) || 'Admin'}</p>
              <p className="text-xs text-gray-500 truncate">{safeString(user?.email) || 'admin@sword.com'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`pt-16 min-h-screen transition-all lg:ml-64 ${!isAdmin ? 'mt-8' : ''}`}>
        <div className="p-4 sm:p-6 lg:p-8">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'orders' && <OrdersView />}
          {activeView === 'products' && <ProductsView />}
          {activeView === 'users' && <UsersView />}
          {activeView === 'leads' && <LeadsView />}
          {activeView === 'coupons' && <CouponsView />}
          {activeView === 'reports' && <ReportsView />}
          {activeView === 'settings' && <SettingsView />}
        </div>
      </main>

      {/* Modals */}
      <ProductModal />
      <OrderDetailModal />
      <CouponModal />
    </div>
  );
}
