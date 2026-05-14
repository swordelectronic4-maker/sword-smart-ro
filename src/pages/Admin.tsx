import { useState } from 'react';
import { Link } from 'react-router-dom';
import { mockOrders } from '@/data/orders';
import { products } from '@/data/products';
import { BarChart3, ShoppingBag, Users, DollarSign, TrendingUp, Package, Activity, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const stats = [
  { label: 'Total Revenue', value: '₹2.4Cr', change: '+12%', icon: DollarSign },
  { label: 'Total Orders', value: '1,284', change: '+8%', icon: ShoppingBag },
  { label: 'Active Users', value: '8,432', change: '+15%', icon: Users },
  { label: 'Products Sold', value: '3,156', change: '+10%', icon: Package },
];

const recentOrders = mockOrders;

const topProducts = products.slice(0, 5);

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products'>('overview');

  return (
    <div className="min-h-[100dvh] pt-[72px] bg-[#0A0A0A]">
      <div className="container-sword py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="text-[#A0A0A0] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-display-md font-display text-white">Admin Dashboard</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-panel p-5">
              <div className="flex items-center justify-between mb-3">
                <stat.icon size={20} className="text-[#D4AF37]" />
                <span className="flex items-center gap-1 text-[0.75rem] text-[#2EC4B6]">
                  <TrendingUp size={12} /> {stat.change}
                </span>
              </div>
              <p className="text-data-md font-mono text-white">{stat.value}</p>
              <p className="text-[0.75rem] text-[#A0A0A0] mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[rgba(255,255,255,0.06)]">
          {(['overview', 'orders', 'products'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'pb-3 text-[0.875rem] font-medium uppercase tracking-[0.05em] transition-colors border-b-2',
                activeTab === tab
                  ? 'text-[#D4AF37] border-[#D4AF37]'
                  : 'text-[#A0A0A0] border-transparent hover:text-white'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-6">
              <h3 className="text-label text-white mb-4">RECENT ORDERS</h3>
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.06)] last:border-0">
                    <div>
                      <p className="text-data-sm font-mono text-[#D4AF37]">{order.id}</p>
                      <p className="text-[0.75rem] text-[#666666]">{order.items.length} item(s)</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[0.875rem] text-white font-mono">₹{order.grandTotal.toFixed(0)}</p>
                      <span className={cn(
                        'text-[0.65rem] uppercase px-2 py-0.5',
                        order.status === 'delivered' ? 'text-[#2EC4B6] bg-[rgba(46,196,182,0.1)]' :
                        order.status === 'shipped' ? 'text-[#7B61FF] bg-[rgba(123,97,255,0.1)]' :
                        'text-[#E8A838] bg-[rgba(232,168,56,0.1)]'
                      )}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6">
              <h3 className="text-label text-white mb-4">SALES ACTIVITY</h3>
              <div className="space-y-4">
                {[
                  { label: 'This Week', value: 72, max: 100 },
                  { label: 'This Month', value: 284, max: 400 },
                  { label: 'This Quarter', value: 856, max: 1200 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-[0.875rem] mb-1">
                      <span className="text-[#A0A0A0]">{item.label}</span>
                      <span className="text-white font-mono">{item.value} orders</span>
                    </div>
                    <div className="w-full h-2 bg-[#1A1A1A]">
                      <div
                        className="h-full bg-gradient-gold transition-all duration-500"
                        style={{ width: `${(item.value / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="glass-panel overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  {['Order ID', 'Items', 'Total', 'Status', 'Date'].map((h) => (
                    <th key={h} className="text-left p-4 text-[0.75rem] text-[#A0A0A0] uppercase tracking-[0.05em] font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-[rgba(255,255,255,0.04)]">
                    <td className="p-4 text-data-sm font-mono text-[#D4AF37]">{order.id}</td>
                    <td className="p-4 text-[0.875rem] text-white">{order.items.length} item(s)</td>
                    <td className="p-4 text-[0.875rem] text-white font-mono">₹{order.grandTotal.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={cn(
                        'text-[0.65rem] uppercase px-2 py-0.5',
                        order.status === 'delivered' ? 'text-[#2EC4B6] bg-[rgba(46,196,182,0.1)]' :
                        order.status === 'shipped' ? 'text-[#7B61FF] bg-[rgba(123,97,255,0.1)]' :
                        'text-[#E8A838] bg-[rgba(232,168,56,0.1)]'
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-[0.75rem] text-[#666666]">{new Date(order.placedAt).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="glass-panel overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(255,255,255,0.06)]">
                  {['Product', 'Price', 'Category', 'Stock', 'Rating'].map((h) => (
                    <th key={h} className="text-left p-4 text-[0.75rem] text-[#A0A0A0] uppercase tracking-[0.05em] font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product) => (
                  <tr key={product.id} className="border-b border-[rgba(255,255,255,0.04)]">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt={product.name} className="w-10 h-10 object-contain" />
                        <span className="text-[0.875rem] text-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-[0.875rem] text-[#D4AF37] font-mono">₹{product.price.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-[0.875rem] text-[#A0A0A0]">{product.category}</td>
                    <td className="p-4">
                      <span className="text-[0.75rem] text-[#2EC4B6]">{product.inStock ? 'In Stock' : 'Out of Stock'}</span>
                    </td>
                    <td className="p-4 text-[0.875rem] text-white">{product.rating}</td>
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
