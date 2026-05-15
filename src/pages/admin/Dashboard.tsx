// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import {
  ShoppingBag, Users, Package, IndianRupee, TrendingUp,
  TrendingDown, ArrowUpRight, ArrowDownRight, Clock, AlertTriangle,
  BarChart3, Activity, Star, ChevronRight
} from 'lucide-react';

const currency = (n) => {
  if (typeof n !== 'number') return '₹0';
  return '₹' + n.toLocaleString('en-IN');
};

/* ──────────────── Dashboard ──────────────── */
export default function Dashboard() {
  const [stats, setStats] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_dashboard_stats');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  const [recentOrders, setRecentOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('sword_orders');
      if (saved) return JSON.parse(saved).slice(0, 10);
    } catch {}
    return getDefaultOrders();
  });

  const [topProducts, setTopProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('sword_products');
      if (saved) return JSON.parse(saved).slice(0, 5);
    } catch {}
    return getDefaultTopProducts();
  });

  const [activityLog, setActivityLog] = useState(() => {
    try {
      const saved = localStorage.getItem('admin_activity_log');
      if (saved) return JSON.parse(saved);
    } catch {}
    return getDefaultActivity();
  });

  /* Compute stats from real data */
  const computedStats = useMemo(() => {
    try {
      const orders = JSON.parse(localStorage.getItem('sword_orders') || '[]');
      const products = JSON.parse(localStorage.getItem('sword_products') || '[]');
      const customers = JSON.parse(localStorage.getItem('sword_customers') || '[]');

      const totalSales = orders.reduce((s, o) => s + (o.total || 0), 0);
      const totalOrders = orders.length;
      const totalCustomers = customers.length;
      const lowStock = products.filter(p => (p.stock || 0) < 10).length;

      return {
        totalSales,
        totalOrders,
        totalCustomers,
        lowStock,
        salesGrowth: 12.5,
        ordersGrowth: 8.3,
        customersGrowth: 15.2,
        stockAlert: lowStock > 0
      };
    } catch {
      return stats || getDefaultStats();
    }
  }, []);

  useEffect(() => {
    if (!stats) setStats(computedStats);
  }, [computedStats]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Sales"
          value={currency(computedStats?.totalSales || 0)}
          icon={IndianRupee}
          change={computedStats?.salesGrowth || 0}
          changeLabel="vs last month"
          accent="#D4AF37"
        />
        <KPICard
          title="Total Orders"
          value={(computedStats?.totalOrders || 0).toLocaleString('en-IN')}
          icon={ShoppingBag}
          change={computedStats?.ordersGrowth || 0}
          changeLabel="vs last month"
          accent="#10B981"
        />
        <KPICard
          title="Customers"
          value={(computedStats?.totalCustomers || 0).toLocaleString('en-IN')}
          icon={Users}
          change={computedStats?.customersGrowth || 0}
          changeLabel="vs last month"
          accent="#3B82F6"
        />
        <KPICard
          title="Low Stock Alert"
          value={computedStats?.lowStock || 0}
          icon={AlertTriangle}
          change={null}
          changeLabel="products need attention"
          accent="#EF4444"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart (simple bar visualization) */}
        <div className="lg:col-span-2 bg-[#111] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <BarChart3 size={16} style={{ color: '#D4AF37' }} />
              Sales Overview
            </h3>
            <select className="bg-[#1a1a1a] border border-white/10 rounded-lg text-xs text-gray-400 px-3 py-1.5 focus:outline-none">
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>
          <SimpleBarChart />
        </div>

        {/* Recent Activity */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity size={16} style={{ color: '#D4AF37' }} />
              Recent Activity
            </h3>
          </div>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {activityLog.slice(0, 8).map((log, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock size={12} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-300">{log.message}</p>
                  <p className="text-xs text-gray-600">{log.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <ShoppingBag size={16} style={{ color: '#D4AF37' }} />
              Recent Orders
            </h3>
            <button className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1">
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 text-xs border-b border-white/10">
                  <th className="pb-2 font-medium">Order ID</th>
                  <th className="pb-2 font-medium">Customer</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentOrders.slice(0, 6).map((order, i) => (
                  <tr key={order.id || i} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 text-gray-300 font-mono text-xs">
                      #{order.id || (1000 + i)}
                    </td>
                    <td className="py-2.5 text-gray-300">
                      {order.customerName || order.customer || 'Guest'}
                    </td>
                    <td className="py-2.5">
                      <StatusBadge status={order.status || 'Pending'} />
                    </td>
                    <td className="py-2.5 text-right text-gray-300">
                      {currency(order.total || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-[#111] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Star size={16} style={{ color: '#D4AF37' }} />
              Top Products
            </h3>
            <button className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1">
              View All <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {topProducts.map((product, i) => (
              <div key={product.id || i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                  <Package size={16} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">{product.name || `Product ${i + 1}`}</p>
                  <p className="text-xs text-gray-500">
                    Stock: {product.stock || 0} units
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm text-gray-300">{currency(product.price || 0)}</p>
                  <p className="text-xs text-gray-500">
                    {product.sold || Math.floor(Math.random() * 50) + 10} sold
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function KPICard({ title, value, icon: Icon, change, changeLabel, accent }) {
  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-5 hover:border-white/15 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-medium">{title}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent + '15' }}>
          <Icon size={16} style={{ color: accent }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      {change !== null && (
        <div className="flex items-center gap-1.5">
          {change >= 0 ? (
            <ArrowUpRight size={12} className="text-emerald-500" />
          ) : (
            <ArrowDownRight size={12} className="text-red-500" />
          )}
          <span className={change >= 0 ? 'text-xs text-emerald-500' : 'text-xs text-red-500'}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
          <span className="text-xs text-gray-600">{changeLabel}</span>
        </div>
      )}
      {change === null && changeLabel && (
        <p className="text-xs text-gray-600">{changeLabel}</p>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    'Complete': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'Pending': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'Processing': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Shipped': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    'Cancelled': 'bg-red-500/10 text-red-500 border-red-500/20',
    'Refunded': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${colors[status] || colors['Pending']}`}>
      {status}
    </span>
  );
}

function SimpleBarChart() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const values = [28000, 45000, 32000, 58000, 42000, 65000];
  const max = Math.max(...values);

  return (
    <div className="flex items-end gap-3 h-48 pt-4">
      {values.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div className="w-full flex justify-center">
            <div
              className="w-full max-w-[48px] rounded-t-lg transition-all hover:opacity-80 relative group"
              style={{
                height: `${(v / max) * 140}px`,
                background: 'linear-gradient(to top, #D4AF37, #D4AF37aa)'
              }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#222] border border-white/10 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {currency(v)}
              </div>
            </div>
          </div>
          <span className="text-xs text-gray-500">{months[i]}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Default Data ─── */

function getDefaultStats() {
  return {
    totalSales: 266000,
    totalOrders: 48,
    totalCustomers: 124,
    lowStock: 2,
    salesGrowth: 12.5,
    ordersGrowth: 8.3,
    customersGrowth: 15.2,
    stockAlert: true
  };
}

function getDefaultOrders() {
  return [
    { id: 1052, customerName: 'Rahul Sharma', total: 27999, status: 'Complete' },
    { id: 1051, customerName: 'Priya Patel', total: 55998, status: 'Processing' },
    { id: 1050, customerName: 'Amit Kumar', total: 27999, status: 'Shipped' },
    { id: 1049, customerName: 'Sneha Gupta', total: 83997, status: 'Pending' },
    { id: 1048, customerName: 'Vikram Singh', total: 27999, status: 'Complete' },
    { id: 1047, customerName: 'Neha Reddy', total: 55998, status: 'Processing' },
  ];
}

function getDefaultTopProducts() {
  return [
    { id: 1, name: 'SWORD Smart RO - Pearl White', price: 27999, stock: 45, sold: 128 },
    { id: 2, name: 'SWORD Smart RO - Matte Black', price: 27999, stock: 32, sold: 96 },
    { id: 3, name: 'SWORD Filter Cartridge Set', price: 3499, stock: 78, sold: 84 },
    { id: 4, name: 'SWORD Smart RO - Champagne', price: 29999, stock: 18, sold: 52 },
    { id: 5, name: 'SWORD UV Sterilizer Module', price: 1899, stock: 8, sold: 41 },
  ];
}

function getDefaultActivity() {
  return [
    { message: 'New order #1052 received', time: '2 mins ago' },
    { message: 'Order #1051 status changed to Processing', time: '15 mins ago' },
    { message: 'Customer Rahul Sharma registered', time: '32 mins ago' },
    { message: 'Product "Filter Cartridge" stock updated to 78', time: '1 hour ago' },
    { message: 'Coupon "SWORD10" used on order #1050', time: '2 hours ago' },
    { message: 'Order #1049 payment confirmed via Razorpay', time: '3 hours ago' },
    { message: 'New review submitted for Smart RO', time: '4 hours ago' },
    { message: 'Shipping label generated for order #1048', time: '5 hours ago' },
  ];
}
