// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Phone,
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
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Archive,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

// ─── Safe Helpers ───────────────────────────────────────────────

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

function formatDate(dateStr) {
  try {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return safeString(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return safeString(dateStr) || '-';
  }
}

function formatCurrency(val) {
  try {
    const n = safeNum(val);
    return '$' + n.toFixed(2);
  } catch {
    return '$0.00';
  }
}

// ─── Navigation Config ──────────────────────────────────────────

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'products', label: 'Products', icon: Package },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'leads', label: 'Leads', icon: Phone },
  { key: 'settings', label: 'Settings', icon: Settings },
];

// ─── Main Component ─────────────────────────────────────────────

export default function Admin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data states
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [leads, setLeads] = useState([]);

  // Search states
  const [orderSearch, setOrderSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [leadSearch, setLeadSearch] = useState('');

  // Modal states
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', price: '', stock: '' });

  // Settings form
  const [settingsForm, setSettingsForm] = useState({
    siteName: 'SWORD',
    contactEmail: 'admin@sword.com',
    phone: '+1 (555) 000-0000',
  });

  // Pagination states
  const [orderPage, setOrderPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [leadPage, setLeadPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // ─── Load data from localStorage ──────────────────────────────
  useEffect(() => {
    try {
      const p = localStorage.getItem('sword_products');
      setProducts(safeParse(p, []));
    } catch {
      setProducts([]);
    }
    try {
      const o = localStorage.getItem('sword_orders');
      setOrders(safeParse(o, []));
    } catch {
      setOrders([]);
    }
    try {
      const u = localStorage.getItem('sword_users');
      setUsers(safeParse(u, []));
    } catch {
      setUsers([]);
    }
    try {
      const l = localStorage.getItem('sword_interested_customers');
      setLeads(safeParse(l, []));
    } catch {
      setLeads([]);
    }
  }, []);

  // ─── Derived KPI Data ─────────────────────────────────────────
  const kpis = useMemo(() => {
    try {
      const revenue = orders.reduce((sum, o) => {
        return sum + safeNum(o?.grandTotal);
      }, 0);

      const delivered = orders.filter((o) => {
        return safeString(o?.status).toLowerCase() === 'delivered';
      }).length;

      const pending = orders.filter((o) => {
        return safeString(o?.status).toLowerCase() === 'pending';
      }).length;

      const lowStock = products.filter((p) => {
        return safeNum(p?.stock) <= 5;
      }).length;

      return {
        revenue,
        totalOrders: orders.length,
        totalProducts: products.length,
        delivered,
        pending,
        lowStock,
      };
    } catch {
      return { revenue: 0, totalOrders: 0, totalProducts: 0, delivered: 0, pending: 0, lowStock: 0 };
    }
  }, [orders, products]);

  // ─── Filtered & Paginated Data ────────────────────────────────
  const filteredOrders = useMemo(() => {
    try {
      const s = orderSearch.toLowerCase().trim();
      const list = orders.filter((o) => {
        if (!s) return true;
        const id = safeString(o?.id || o?._id).toLowerCase();
        const customer = safeString(o?.customerName || o?.customer?.name).toLowerCase();
        const status = safeString(o?.status).toLowerCase();
        return id.includes(s) || customer.includes(s) || status.includes(s);
      });
      return list;
    } catch {
      return [];
    }
  }, [orders, orderSearch]);

  const pagedOrders = useMemo(() => {
    try {
      const start = (orderPage - 1) * ITEMS_PER_PAGE;
      return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
    } catch {
      return [];
    }
  }, [filteredOrders, orderPage]);

  const orderPageCount = Math.max(1, Math.ceil(filteredOrders.length / ITEMS_PER_PAGE));

  const filteredProducts = useMemo(() => {
    try {
      const s = productSearch.toLowerCase().trim();
      const list = products.filter((p) => {
        if (!s) return true;
        const name = safeString(p?.name).toLowerCase();
        return name.includes(s);
      });
      return list;
    } catch {
      return [];
    }
  }, [products, productSearch]);

  const pagedProducts = useMemo(() => {
    try {
      const start = (productPage - 1) * ITEMS_PER_PAGE;
      return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
    } catch {
      return [];
    }
  }, [filteredProducts, productPage]);

  const productPageCount = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  const filteredUsers = useMemo(() => {
    try {
      const s = userSearch.toLowerCase().trim();
      const list = users.filter((u) => {
        if (!s) return true;
        const name = safeString(u?.name || u?.displayName).toLowerCase();
        const email = safeString(u?.email).toLowerCase();
        return name.includes(s) || email.includes(s);
      });
      return list;
    } catch {
      return [];
    }
  }, [users, userSearch]);

  const pagedUsers = useMemo(() => {
    try {
      const start = (userPage - 1) * ITEMS_PER_PAGE;
      return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
    } catch {
      return [];
    }
  }, [filteredUsers, userPage]);

  const userPageCount = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));

  const filteredLeads = useMemo(() => {
    try {
      const s = leadSearch.toLowerCase().trim();
      const list = leads.filter((l) => {
        if (!s) return true;
        const name = safeString(l?.name).toLowerCase();
        const email = safeString(l?.email).toLowerCase();
        const phone = safeString(l?.phone).toLowerCase();
        const source = safeString(l?.source).toLowerCase();
        return name.includes(s) || email.includes(s) || phone.includes(s) || source.includes(s);
      });
      return list;
    } catch {
      return [];
    }
  }, [leads, leadSearch]);

  const pagedLeads = useMemo(() => {
    try {
      const start = (leadPage - 1) * ITEMS_PER_PAGE;
      return filteredLeads.slice(start, start + ITEMS_PER_PAGE);
    } catch {
      return [];
    }
  }, [filteredLeads, leadPage]);

  const leadPageCount = Math.max(1, Math.ceil(filteredLeads.length / ITEMS_PER_PAGE));

  // ─── Handlers ─────────────────────────────────────────────────

  function handleLogout() {
    try {
      logout();
    } catch {
      /* noop */
    }
    navigate('/');
  }

  function openAddProduct() {
    setEditingProduct(null);
    setProductForm({ name: '', price: '', stock: '' });
    setProductModalOpen(true);
  }

  function openEditProduct(product) {
    try {
      setEditingProduct(product);
      setProductForm({
        name: safeString(product?.name),
        price: safeString(product?.price),
        stock: safeString(product?.stock),
      });
      setProductModalOpen(true);
    } catch {
      /* noop */
    }
  }

  function closeProductModal() {
    setProductModalOpen(false);
    setEditingProduct(null);
    setProductForm({ name: '', price: '', stock: '' });
  }

  function saveProduct() {
    try {
      const name = productForm.name.trim();
      const price = safeNum(productForm.price);
      const stock = safeNum(productForm.stock);
      if (!name) return;

      if (editingProduct) {
        setProducts((prev) => {
          try {
            const updated = prev.map((p) => {
              if (p?.id === editingProduct?.id || p?._id === editingProduct?._id) {
                return { ...p, name, price, stock };
              }
              return p;
            });
            try {
              localStorage.setItem('sword_products', JSON.stringify(updated));
            } catch {
              /* noop */
            }
            return updated;
          } catch {
            return prev;
          }
        });
      } else {
        const newProduct = {
          id: 'prod_' + Date.now(),
          name,
          price,
          stock,
          createdAt: new Date().toISOString(),
        };
        setProducts((prev) => {
          const updated = [...prev, newProduct];
          try {
            localStorage.setItem('sword_products', JSON.stringify(updated));
          } catch {
            /* noop */
          }
          return updated;
        });
      }
      closeProductModal();
    } catch {
      /* noop */
    }
  }

  function deleteProduct(product) {
    try {
      const id = product?.id || product?._id;
      if (!id) return;
      const ok = window.confirm('Delete this product?');
      if (!ok) return;
      setProducts((prev) => {
        try {
          const updated = prev.filter((p) => {
            return p?.id !== id && p?._id !== id;
          });
          try {
            localStorage.setItem('sword_products', JSON.stringify(updated));
          } catch {
            /* noop */
          }
          return updated;
        } catch {
          return prev;
        }
      });
    } catch {
      /* noop */
    }
  }

  // ─── Render Helpers ───────────────────────────────────────────

  function getInitials(name) {
    try {
      const s = safeString(name);
      if (!s) return 'A';
      return s
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    } catch {
      return 'A';
    }
  }

  // ─── Status Badge ─────────────────────────────────────────────
  function StatusBadge({ status }) {
    const s = safeString(status).toLowerCase();
    let colorClass = 'bg-gray-600 text-gray-200';
    if (s === 'delivered' || s === 'active') colorClass = 'bg-green-600 text-green-100';
    else if (s === 'pending' || s === 'processing') colorClass = 'bg-yellow-600 text-yellow-100';
    else if (s === 'cancelled' || s === 'inactive') colorClass = 'bg-red-600 text-red-100';
    else if (s === 'shipped') colorClass = 'bg-blue-600 text-blue-100';

    return (
      <span className={'px-2 py-1 rounded-full text-xs font-medium capitalize ' + colorClass}>
        {s || 'unknown'}
      </span>
    );
  }

  // ─── KPI Card ─────────────────────────────────────────────────
  function KpiCard({ icon: Icon, label, value, color }) {
    return (
      <div className="rounded-xl p-5" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="flex items-center gap-4">
          <div className={'w-12 h-12 rounded-lg flex items-center justify-center ' + color}>
            <Icon size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Pagination ───────────────────────────────────────────────
  function Pagination({ page, setPage, pageCount, totalLabel }) {
    return (
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-400">{totalLabel}</p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-gray-400">
            Page {page} of {pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page >= pageCount}
            className="p-2 rounded-lg hover:bg-white/10 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  // ─── Views ────────────────────────────────────────────────────

  function DashboardView() {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <KpiCard
            icon={DollarSign}
            label="Total Revenue"
            value={formatCurrency(kpis.revenue)}
            color="bg-emerald-600/20 text-emerald-400"
          />
          <KpiCard
            icon={ShoppingBag}
            label="Total Orders"
            value={kpis.totalOrders}
            color="bg-blue-600/20 text-blue-400"
          />
          <KpiCard
            icon={Archive}
            label="Products"
            value={kpis.totalProducts}
            color="bg-purple-600/20 text-purple-400"
          />
          <KpiCard
            icon={CheckCircle}
            label="Delivered"
            value={kpis.delivered}
            color="bg-green-600/20 text-green-400"
          />
          <KpiCard
            icon={Clock}
            label="Pending"
            value={kpis.pending}
            color="bg-yellow-600/20 text-yellow-400"
          />
          <KpiCard
            icon={AlertTriangle}
            label="Low Stock"
            value={kpis.lowStock}
            color="bg-red-600/20 text-red-400"
          />
        </div>

        {/* Recent Orders Table */}
        <div className="mt-8 rounded-xl p-5" style={{ backgroundColor: '#1A1A1A' }}>
          <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
          {orders.length === 0 ? (
            <p className="text-gray-500">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-left">
                    <th className="pb-3 font-medium">ID</th>
                    <th className="pb-3 font-medium">Customer</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map((o, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 font-mono text-xs text-gray-400">
                        #{safeString(o?.id || o?._id).slice(-6)}
                      </td>
                      <td className="py-3">
                        {safeString(o?.customerName || o?.customer?.name) || 'Guest'}
                      </td>
                      <td className="py-3">{formatCurrency(o?.grandTotal)}</td>
                      <td className="py-3">
                        <StatusBadge status={o?.status} />
                      </td>
                      <td className="py-3 text-gray-400">{formatDate(o?.createdAt)}</td>
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
              onChange={(e) => {
                setOrderSearch(e.target.value);
                setOrderPage(1);
              }}
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/10 focus:border-white/30 transition-colors"
              style={{ backgroundColor: '#1A1A1A' }}
            />
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#1A1A1A' }}>
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {orderSearch ? 'No orders match your search.' : 'No orders found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-left">
                    <th className="py-3 px-4 font-medium">ID</th>
                    <th className="py-3 px-4 font-medium">Customer</th>
                    <th className="py-3 px-4 font-medium">Items</th>
                    <th className="py-3 px-4 font-medium">Total</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedOrders.map((o, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 font-mono text-xs text-gray-400">
                        #{safeString(o?.id || o?._id).slice(-6)}
                      </td>
                      <td className="py-3 px-4">
                        {safeString(o?.customerName || o?.customer?.name) || 'Guest'}
                      </td>
                      <td className="py-3 px-4">
                        {(() => {
                          try {
                            const items = o?.items || o?.orderItems || [];
                            return Array.isArray(items) ? items.length : 0;
                          } catch {
                            return 0;
                          }
                        })()}
                      </td>
                      <td className="py-3 px-4 font-medium">{formatCurrency(o?.grandTotal)}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={o?.status} />
                      </td>
                      <td className="py-3 px-4 text-gray-400">{formatDate(o?.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Pagination
          page={orderPage}
          setPage={setOrderPage}
          pageCount={orderPageCount}
          totalLabel={`${filteredOrders.length} order(s)`}
        />
      </div>
    );
  }

  function ProductsView() {
    return (
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Products</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none sm:w-64">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={productSearch}
                onChange={(e) => {
                  setProductSearch(e.target.value);
                  setProductPage(1);
                }}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/10 focus:border-white/30 transition-colors"
                style={{ backgroundColor: '#1A1A1A' }}
              />
            </div>
            <button
              onClick={openAddProduct}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#1A1A1A' }}>
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {productSearch ? 'No products match your search.' : 'No products found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-left">
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">Price</th>
                    <th className="py-3 px-4 font-medium">Stock</th>
                    <th className="py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedProducts.map((p, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">{safeString(p?.name) || 'Unnamed'}</td>
                      <td className="py-3 px-4 font-medium">{formatCurrency(p?.price)}</td>
                      <td className="py-3 px-4">
                        <span
                          className={
                            safeNum(p?.stock) <= 5
                              ? 'text-red-400 font-medium'
                              : 'text-green-400'
                          }
                        >
                          {safeNum(p?.stock)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditProduct(p)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-blue-400 transition-colors"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => deleteProduct(p)}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-red-400 transition-colors"
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
        <Pagination
          page={productPage}
          setPage={setProductPage}
          pageCount={productPageCount}
          totalLabel={`${filteredProducts.length} product(s)`}
        />
      </div>
    );
  }

  function UsersView() {
    return (
      <div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold">Users</h2>
          <div className="relative w-full sm:w-72">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setUserPage(1);
              }}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/10 focus:border-white/30 transition-colors"
              style={{ backgroundColor: '#1A1A1A' }}
            />
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#1A1A1A' }}>
          {filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {userSearch ? 'No users match your search.' : 'No users found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-left">
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">Email</th>
                    <th className="py-3 px-4 font-medium">Role</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedUsers.map((u, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium">
                            {getInitials(u?.name || u?.displayName)}
                          </div>
                          <span>{safeString(u?.name || u?.displayName) || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{safeString(u?.email) || '-'}</td>
                      <td className="py-3 px-4 capitalize">{safeString(u?.role) || 'user'}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={u?.status || 'active'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Pagination
          page={userPage}
          setPage={setUserPage}
          pageCount={userPageCount}
          totalLabel={`${filteredUsers.length} user(s)`}
        />
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
              onChange={(e) => {
                setLeadSearch(e.target.value);
                setLeadPage(1);
              }}
              placeholder="Search leads..."
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/10 focus:border-white/30 transition-colors"
              style={{ backgroundColor: '#1A1A1A' }}
            />
          </div>
        </div>

        <div className="rounded-xl overflow-hidden" style={{ backgroundColor: '#1A1A1A' }}>
          {filteredLeads.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {leadSearch ? 'No leads match your search.' : 'No leads found.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-left">
                    <th className="py-3 px-4 font-medium">Name</th>
                    <th className="py-3 px-4 font-medium">Email</th>
                    <th className="py-3 px-4 font-medium">Phone</th>
                    <th className="py-3 px-4 font-medium">Source</th>
                    <th className="py-3 px-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedLeads.map((l, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">{safeString(l?.name) || 'Unknown'}</td>
                      <td className="py-3 px-4 text-gray-400">{safeString(l?.email) || '-'}</td>
                      <td className="py-3 px-4 text-gray-400">{safeString(l?.phone) || '-'}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-300">
                          {safeString(l?.source) || 'website'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400">{formatDate(l?.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Pagination
          page={leadPage}
          setPage={setLeadPage}
          pageCount={leadPageCount}
          totalLabel={`${filteredLeads.length} lead(s)`}
        />
      </div>
    );
  }

  function SettingsView() {
    return (
      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        <div className="rounded-xl p-6 space-y-5" style={{ backgroundColor: '#1A1A1A' }}>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Site Name</label>
            <input
              type="text"
              value={settingsForm.siteName}
              onChange={(e) =>
                setSettingsForm((prev) => ({ ...prev, siteName: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/10 focus:border-white/30 transition-colors"
              style={{ backgroundColor: '#111' }}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Contact Email</label>
            <input
              type="email"
              value={settingsForm.contactEmail}
              onChange={(e) =>
                setSettingsForm((prev) => ({ ...prev, contactEmail: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/10 focus:border-white/30 transition-colors"
              style={{ backgroundColor: '#111' }}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
            <input
              type="text"
              value={settingsForm.phone}
              onChange={(e) =>
                setSettingsForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/10 focus:border-white/30 transition-colors"
              style={{ backgroundColor: '#111' }}
            />
          </div>
          <div className="pt-2">
            <button
              onClick={() => {
                try {
                  localStorage.setItem('sword_settings', JSON.stringify(settingsForm));
                  alert('Settings saved!');
                } catch {
                  /* noop */
                }
              }}
              className="px-6 py-2.5 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Product Modal ────────────────────────────────────────────

  function ProductModal() {
    if (!productModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
        <div
          className="w-full max-w-md rounded-xl p-6 border border-white/10"
          style={{ backgroundColor: '#1A1A1A' }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-semibold">
              {editingProduct ? 'Edit Product' : 'Add Product'}
            </h3>
            <button
              onClick={closeProductModal}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Product Name</label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter product name"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/10 focus:border-white/30 transition-colors"
                style={{ backgroundColor: '#111' }}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Price ($)</label>
              <input
                type="number"
                value={productForm.price}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, price: e.target.value }))
                }
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/10 focus:border-white/30 transition-colors"
                style={{ backgroundColor: '#111' }}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Stock Quantity</label>
              <input
                type="number"
                value={productForm.stock}
                onChange={(e) =>
                  setProductForm((prev) => ({ ...prev, stock: e.target.value }))
                }
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 rounded-lg text-sm text-white placeholder-gray-500 outline-none border border-white/10 focus:border-white/30 transition-colors"
                style={{ backgroundColor: '#111' }}
              />
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
              className="flex-1 px-4 py-2.5 rounded-lg text-sm bg-white text-black font-medium hover:bg-gray-200 transition-colors"
            >
              {editingProduct ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────

  const isAdmin = safeString(user?.role).toLowerCase() === 'admin';

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      {/* Admin Banner */}
      {!isAdmin && (
        <div className="fixed top-16 left-0 right-0 z-30 bg-yellow-600/20 border-b border-yellow-600/40 px-4 py-2 text-center text-sm text-yellow-400">
          Login as admin to edit. You are currently viewing in read-only mode.
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
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <TrendingUp size={18} className="text-black" />
            </div>
            <span className="text-lg font-bold tracking-tight">SWORD Admin</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-sm text-gray-400">
            {safeString(user?.name || user?.displayName || user?.email) || 'Admin'}
          </span>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium">
            {getInitials(user?.name || user?.displayName || user?.email)}
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
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={
          'fixed top-16 left-0 bottom-0 w-64 bg-[#111] border-r border-white/10 z-30 transform transition-transform duration-200 lg:translate-x-0 ' +
          (sidebarOpen ? 'translate-x-0' : '-translate-x-full')
        }
      >
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActiveView(item.key);
                  setSidebarOpen(false);
                }}
                className={
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ' +
                  (isActive
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5')
                }
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
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-medium">
              {getInitials(user?.name || user?.displayName || user?.email)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {safeString(user?.name || user?.displayName) || 'Admin User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {safeString(user?.email) || 'admin@sword.com'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={
          'pt-16 min-h-screen transition-all lg:ml-64 ' +
          (!isAdmin ? 'mt-8' : '')
        }
      >
        <div className="p-4 sm:p-6 lg:p-8">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'orders' && <OrdersView />}
          {activeView === 'products' && <ProductsView />}
          {activeView === 'users' && <UsersView />}
          {activeView === 'leads' && <LeadsView />}
          {activeView === 'settings' && <SettingsView />}
        </div>
      </main>

      {/* Product Modal */}
      <ProductModal />
    </div>
  );
}
