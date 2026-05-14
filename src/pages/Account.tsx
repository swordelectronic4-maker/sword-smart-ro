import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { mockOrders } from '@/data/orders';
import { User, Package, Heart, MapPin, LogOut, ChevronRight, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
];

const statusColors: Record<string, string> = {
  placed: 'text-[#E8A838]',
  confirmed: 'text-[#00B4D8]',
  shipped: 'text-[#7B61FF]',
  delivered: 'text-[#2EC4B6]',
};

export default function Account() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    return (
      <div className="min-h-[100dvh] pt-[72px] bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#A0A0A0] mb-4">Please log in to view your account</p>
          <button
            onClick={() => { /* Demo login */ }}
            className="btn-primary"
          >
            Log In (Demo)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pt-[72px] bg-[#0A0A0A]">
      <div className="container-sword py-12">
        <h1 className="text-display-lg font-display text-white mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-panel p-6 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-[#D4AF37] flex items-center justify-center text-[#0A0A0A] font-bold text-[1.125rem]">
                  {user.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-[0.875rem] font-medium text-white">{user.name}</p>
                  <p className="text-[0.75rem] text-[#A0A0A0]">{user.email}</p>
                </div>
              </div>
              {user.role === 'admin' && (
                <span className="inline-block mt-2 px-2 py-0.5 bg-[#D4AF37] text-[#0A0A0A] text-[0.65rem] font-medium uppercase">
                  Admin
                </span>
              )}
            </div>

            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-[0.875rem] transition-colors text-left',
                    activeTab === tab.id
                      ? 'bg-[rgba(212,175,55,0.1)] text-[#D4AF37]'
                      : 'text-[#A0A0A0] hover:text-white hover:bg-[rgba(255,255,255,0.03)]'
                  )}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 text-[0.875rem] text-[#E63946] hover:bg-[rgba(230,57,70,0.1)] transition-colors text-left"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'profile' && (
              <div className="glass-panel p-6">
                <h2 className="text-label text-white mb-6">PROFILE INFORMATION</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    { label: 'Full Name', value: user.name },
                    { label: 'Email', value: user.email },
                    { label: 'Phone', value: user.phone },
                    { label: 'Role', value: user.role === 'admin' ? 'Administrator' : 'Customer' },
                  ].map((field) => (
                    <div key={field.label}>
                      <p className="text-[0.75rem] text-[#666666] uppercase tracking-[0.05em] mb-1">{field.label}</p>
                      <p className="text-[0.875rem] text-white">{field.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h2 className="text-label text-white mb-2">MY ORDERS</h2>
                {mockOrders.map((order) => (
                  <div key={order.id} className="glass-panel p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                      <div>
                        <p className="text-data-sm font-mono text-[#D4AF37]">{order.id}</p>
                        <p className="text-[0.75rem] text-[#666666]">
                          Placed on {new Date(order.placedAt).toLocaleDateString('en-IN')}
                        </p>
                      </div>
                      <span className={cn('text-[0.75rem] font-medium uppercase tracking-[0.05em]', statusColors[order.status])}>
                        {order.status}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      {order.items.map((item) => (
                        <div key={item.productId} className="flex justify-between text-[0.875rem]">
                          <span className="text-white">{item.productName} x{item.quantity}</span>
                          <span className="text-[#A0A0A0] font-mono">₹{item.price.toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.06)]">
                      <p className="text-[0.875rem] text-white font-medium">
                        Total: <span className="text-[#D4AF37] font-mono">₹{order.grandTotal.toFixed(2)}</span>
                      </p>
                      <Link
                        to={`/track/${order.trackingId}`}
                        className="flex items-center gap-1 text-[0.75rem] text-[#D4AF37] hover:underline"
                      >
                        Track Order <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div className="text-center py-16">
                <Heart size={48} className="text-[#333333] mx-auto mb-4" />
                <p className="text-[#A0A0A0]">Your wishlist is empty</p>
                <Link to="/shop" className="btn-primary inline-block mt-4">
                  Browse Products
                </Link>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div className="glass-panel p-6">
                <h2 className="text-label text-white mb-6">SAVED ADDRESSES</h2>
                <div className="border border-[rgba(255,255,255,0.1)] p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-[#D4AF37] text-[#0A0A0A] text-[0.65rem] font-medium uppercase">Default</span>
                  </div>
                  <p className="text-[0.875rem] text-white">{user.name}</p>
                  <p className="text-[0.875rem] text-[#A0A0A0]">42 Lake View Apartments, Koramangala</p>
                  <p className="text-[0.875rem] text-[#A0A0A0]">Bangalore, Karnataka - 560034</p>
                  <p className="text-[0.875rem] text-[#A0A0A0]">Phone: {user.phone}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
