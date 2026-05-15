import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { mockOrders } from '@/data/orders';
import { products as getProductList, type Product } from '@/data/products';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, MapPin, Heart, Wifi, Gift, User,
  LogOut, Copy, Check, X, Truck, Star, ChevronRight, Plus,
  Pencil, Trash2, CheckCircle2, Clock, Package, Droplet, Calendar,
  Phone, Mail, ArrowRight, Shield, Zap, Settings, Headphones,
  Download, RefreshCw, Search, Share2, AlertTriangle, Camera,
  Smartphone, MessageCircle, Send, Bell, Lock, Eye, EyeOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';

/* ───────── data ───────── */
const tdsData = [
  { day: 'Mon', input: 410, output: 145 },
  { day: 'Tue', input: 425, output: 152 },
  { day: 'Wed', input: 398, output: 138 },
  { day: 'Thu', input: 420, output: 150 },
  { day: 'Fri', input: 435, output: 155 },
  { day: 'Sat', input: 415, output: 148 },
  { day: 'Sun', input: 420, output: 150 },
];

const consumptionData = [
  { day: 'Mon', liters: 45 },
  { day: 'Tue', liters: 52 },
  { day: 'Wed', liters: 38 },
  { day: 'Thu', liters: 48 },
  { day: 'Fri', liters: 55 },
  { day: 'Sat', liters: 62 },
  { day: 'Sun', liters: 50 },
];

const filtersData = [
  { name: 'Sediment', life: 72 },
  { name: 'Carbon', life: 85 },
  { name: 'RO Membrane', life: 92 },
  { name: 'NF Membrane', life: 93 },
  { name: 'UF Membrane', life: 98 },
];

const savedAddresses = [
  {
    id: 'addr-1',
    type: 'HOME' as const,
    name: 'Priyank Joshi',
    address: '42 Lake View Apartments, Koramangala, Bangalore, Karnataka - 560034',
    phone: '+91 98765 43210',
    isDefault: true,
  },
  {
    id: 'addr-2',
    type: 'WORK' as const,
    name: 'Priyank Joshi',
    address: 'SWORD Office, 12th Main Road, Indiranagar, Bangalore, Karnataka - 560038',
    phone: '+91 98765 43210',
    isDefault: false,
  },
];

const referralHistory = [
  { friend: 'Priya V.', date: 'Jan 10, 2025', status: 'Completed' as const, reward: 500 },
  { friend: 'Amit K.', date: 'Jan 18, 2025', status: 'Pending' as const, reward: 0 },
  { friend: 'Sneha R.', date: 'Jan 25, 2025', status: 'Completed' as const, reward: 500 },
];

const faqData = [
  { q: 'How do I know when to replace my filters?', a: 'Your SWORD purifier\'s TFT display shows real-time filter life percentage. Additionally, our mobile app sends push notifications when any filter reaches 20% life remaining.' },
  { q: 'Can I change or cancel my subscription?', a: 'Yes, you can modify, pause, or cancel your subscription anytime from your account dashboard. There are no lock-in periods or cancellation fees.' },
  { q: 'What\'s included in the filter kit?', a: 'The complete 14-stage filter kit includes: PP Cotton Sediment Filter, Activated Carbon Block, TDS Sensors, Y Divider service, RO Membrane, NF Membrane, UF Membrane, Active Mineral Cartridge, and all O-rings and fittings.' },
  { q: 'Do I need a technician for filter replacement?', a: 'Most filter replacements are designed for easy DIY with our guided tutorial videos. However, AMC subscribers get complimentary technician visits for hassle-free service.' },
  { q: 'Is shipping really free?', a: 'Yes, all subscription plans include free doorstep delivery anywhere in India. No minimum order value.' },
];

/* ───────── status helpers ───────── */
const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  placed: { color: 'text-[#E8A838]', bg: 'bg-[#E8A838]/10', label: 'Placed' },
  confirmed: { color: 'text-[#00B4D8]', bg: 'bg-[#00B4D8]/10', label: 'Processing' },
  shipped: { color: 'text-[#7B61FF]', bg: 'bg-[#7B61FF]/10', label: 'Shipped' },
  delivered: { color: 'text-[#2EC4B6]', bg: 'bg-[#2EC4B6]/10', label: 'Delivered' },
  cancelled: { color: 'text-[#E63946]', bg: 'bg-[#E63946]/10', label: 'Cancelled' },
};

const statusColors: Record<string, string> = {
  placed: 'text-[#E8A838]',
  confirmed: 'text-[#00B4D8]',
  shipped: 'text-[#7B61FF]',
  delivered: 'text-[#2EC4B6]',
  cancelled: 'text-[#E63946]',
};

/* ───────── animation variants ───────── */
const tabContentVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

const sidebarNavItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'orders', label: 'My Orders', icon: ShoppingBag, badge: 3 },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'wishlist', label: 'Wishlist', icon: Heart, badge: 0 },
  { id: 'iot', label: 'IoT Dashboard', icon: Wifi, tag: 'NEW' },
  { id: 'refer', label: 'Refer & Earn', icon: Gift },
  { id: 'settings', label: 'Profile Settings', icon: User },
];

export default function Account() {
  const { user, login, logout, googleLogin } = useAuth();
  const { wishlist, toggleWishlist, addToCart } = useCart();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orderFilter, setOrderFilter] = useState('all');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [addresses, setAddresses] = useState(savedAddresses);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<typeof savedAddresses[0] | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, sms: true, marketing: false });
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const allProducts = getProductList();

  const handleCopyCode = useCallback(() => {
    navigator.clipboard.writeText('SWORD-PRIYANK-500');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  }, []);

  const handleDeleteAddress = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === id }))
    );
  };

  const filteredOrders = orderFilter === 'all'
    ? mockOrders
    : mockOrders.filter((o) => o.status === orderFilter);

  const selectedOrder = mockOrders.find((o) => o.id === selectedOrderId);

  const wishlistProducts = allProducts.filter((p: Product) => wishlist.includes(p.id));

  // Login/Register form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginMode, setLoginMode] = useState<'login' | 'register'>('login');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Please enter email and password');
      return;
    }
    if (loginPassword.length < 6) {
      setLoginError('Password must be at least 6 characters');
      return;
    }
    try {
      const success = await login(loginEmail, loginPassword);
      if (!success) {
        setLoginError('Invalid credentials');
      }
    } catch {
      setLoginError('Login failed. Please try again.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword.trim()) {
      setRegError('Please fill all fields');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters');
      return;
    }
    try {
      const success = await login(regEmail, regPassword);
      if (success) {
        setLoginMode('login');
      } else {
        setRegError('Registration failed');
      }
    } catch {
      setRegError('Registration failed. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-[100dvh] pt-[72px] bg-[#0A0A0A] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[420px]"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <img src="/assets/logo.png" alt="SWORD" className="h-12 mx-auto mb-4" />
            <h1 className="font-display text-2xl text-white mb-1">
              {loginMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-[#A0A0A0] text-sm">
              {loginMode === 'login'
                ? 'Sign in to access your account'
                : 'Register to get started with SWORD'}
            </p>
          </div>

          {/* Login Form */}
          {loginMode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="glass-panel p-6 space-y-4">
                <div>
                  <label className="text-label mb-1.5 block">Username or Email</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                    <input
                      type="text"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="Enter username or email"
                      className="input-sword pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-label mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="input-sword pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {loginError && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-2">{loginError}</p>
                )}

                <button type="submit" className="btn-primary w-full">
                  Sign In
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-white/10" />
                  <span className="text-[#666] text-xs uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Google Sign In */}
                <button
                  type="button"
                  onClick={() => {
                    googleLogin();
                  }}
                  className="btn-google w-full"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.583-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                    <path d="M3.964 10.71c-.18-.54-.282-1.116-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
              </div>

              {/* Password hint */}
              <div className="bg-white/5 border border-white/10 p-3 text-center">
                <p className="text-[#A0A0A0] text-xs">Password must be at least 6 characters</p>
              </div>

              <p className="text-center text-[#A0A0A0] text-sm">
                Don't have an account?{' '}
                <button type="button" onClick={() => { setLoginMode('register'); setLoginError(''); }} className="text-[#D4AF37] hover:underline">
                  Register
                </button>
              </p>
            </form>
          ) : (
            /* Register Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="glass-panel p-6 space-y-4">
                <div>
                  <label className="text-label mb-1.5 block">Full Name</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                    <input
                      type="text"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Your full name"
                      className="input-sword pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-label mb-1.5 block">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="input-sword pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-label mb-1.5 block">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="input-sword pl-10"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-label mb-1.5 block">Password</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      className="input-sword pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                </div>

                {regError && (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-2">{regError}</p>
                )}

                <button type="submit" className="btn-primary w-full">
                  Create Account
                </button>
              </div>

              <p className="text-center text-[#A0A0A0] text-sm">
                Already have an account?{' '}
                <button type="button" onClick={() => { setLoginMode('login'); setRegError(''); }} className="text-[#D4AF37] hover:underline">
                  Sign In
                </button>
              </p>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pt-[72px] bg-[#0A0A0A]">
      <div className="container-sword py-8 md:py-12">
        <h1 className="text-display-lg font-display text-white mb-8">My Account</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* ─────── Sidebar ─────── */}
          <div className="lg:col-span-1">
            <div className="glass-panel p-5 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 border-2 border-[#D4AF37] flex items-center justify-center text-[#D4AF37] font-bold text-[1.125rem]">
                  {user.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div className="min-w-0">
                  <p className="text-[0.875rem] font-semibold text-white truncate">{user.name}</p>
                  <p className="text-[0.75rem] text-[#A0A0A0] truncate">{user.email}</p>
                  <p className="text-[0.7rem] text-[#666666] mt-0.5">Member since Jan 2025</p>
                </div>
              </div>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block space-y-0.5">
              {sidebarNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-5 py-3 text-[0.875rem] font-medium transition-all text-left relative',
                    activeTab === item.id
                      ? 'bg-[rgba(212,175,55,0.1)] text-[#D4AF37] border-l-[3px] border-[#D4AF37]'
                      : 'text-[#A0A0A0] hover:text-white hover:bg-[rgba(255,255,255,0.03)] border-l-[3px] border-transparent'
                  )}
                >
                  <item.icon size={18} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge ? (
                    <span className="text-[0.7rem] text-[#666666]">{item.badge}</span>
                  ) : null}
                  {item.tag ? (
                    <span className="px-1.5 py-0.5 bg-[#D4AF37] text-[#0A0A0A] text-[0.6rem] font-bold uppercase">{item.tag}</span>
                  ) : null}
                </button>
              ))}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="w-full flex items-center gap-3 px-5 py-3 text-[0.875rem] text-[#E63946] hover:bg-[rgba(230,57,70,0.1)] transition-colors text-left border-l-[3px] border-transparent mt-4"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {/* Mobile Tabs */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
              {sidebarNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2 text-[0.75rem] font-medium whitespace-nowrap transition-all border flex-shrink-0',
                    activeTab === item.id
                      ? 'border-[#D4AF37] text-[#D4AF37] bg-[rgba(212,175,55,0.1)]'
                      : 'border-[rgba(255,255,255,0.1)] text-[#A0A0A0]'
                  )}
                >
                  <item.icon size={14} />
                  {item.label}
                  {item.tag && <span className="text-[0.6rem] bg-[#D4AF37] text-[#0A0A0A] px-1">{item.tag}</span>}
                </button>
              ))}
            </div>
          </div>

          {/* ─────── Content ─────── */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                variants={tabContentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >

                {/* ═══════════════════ DASHBOARD ═══════════════════ */}
                {activeTab === 'dashboard' && (
                  <div className="space-y-6">
                    {/* Welcome */}
                    <div className="glass-panel p-6 md:p-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-3xl" />
                      <h2 className="text-display-md font-display text-white relative z-10">
                        Welcome back, {user.name.split(' ')[0]}
                      </h2>
                      <p className="text-[0.875rem] text-[#A0A0A0] relative z-10 mt-1">
                        Here&apos;s what&apos;s happening with your SWORD
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { icon: ShoppingBag, iconColor: 'text-[#D4AF37]', value: '12', label: 'Orders Placed' },
                        { icon: Calendar, iconColor: 'text-[#2EC4B6]', value: '2', label: 'Active Plans' },
                        { icon: Droplet, iconColor: 'text-[#00B4D8]', value: '14,280 L', label: 'Water Saved this Year' },
                        { icon: Star, iconColor: 'text-[#FFD700]', value: '2,450', label: 'SWORD Points', sub: '₹2,450 value', subColor: 'text-[#D4AF37]' },
                      ].map((stat) => (
                        <div key={stat.label} className="glass-panel p-5">
                          <stat.icon size={20} className={stat.iconColor} />
                          <p className="text-data-lg font-mono text-white mt-2">{stat.value}</p>
                          <p className="text-[0.75rem] text-[#A0A0A0]">{stat.label}</p>
                          {'sub' in stat && <p className={cn('text-[0.7rem] mt-0.5', stat.subColor)}>{stat.sub}</p>}
                        </div>
                      ))}
                    </div>

                    {/* Recent Orders */}
                    <div className="glass-panel p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-display-md font-display text-white">Recent Orders</h3>
                        <button onClick={() => setActiveTab('orders')} className="text-[0.75rem] text-[#D4AF37] hover:underline flex items-center gap-1">
                          View All <ChevronRight size={14} />
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-[rgba(255,255,255,0.06)]">
                              {['Order ID', 'Date', 'Items', 'Status', 'Total'].map((h) => (
                                <th key={h} className="text-label text-[#666666] pb-3 pr-4">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {[...mockOrders].sort((a, b) => new Date(b.placedAt).getTime() - new Date(a.placedAt).getTime()).slice(0, 3).map((order) => {
                              const s = statusConfig[order.status] || statusConfig.placed;
                              return (
                                <tr key={order.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)] cursor-pointer transition-colors"
                                  onClick={() => { setSelectedOrderId(order.id); setActiveTab('orders'); setShowOrderDetail(true); }}>
                                  <td className="py-3 pr-4 text-[0.75rem] font-mono text-[#D4AF37]">{order.id}</td>
                                  <td className="py-3 pr-4 text-[0.75rem] text-[#A0A0A0]">{new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                  <td className="py-3 pr-4 text-[0.75rem] text-white">{order.items.reduce((a, i) => a + i.quantity, 0)} items</td>
                                  <td className="py-3 pr-4">
                                    <span className={cn('text-[0.65rem] font-medium uppercase tracking-[0.05em] px-2 py-0.5', s.bg, s.color)}>{s.label}</span>
                                  </td>
                                  <td className="py-3 text-[0.75rem] font-mono text-[#D4AF37]">₹{order.grandTotal.toFixed(2)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-4">
                      <Link to="/shop" className="btn-primary inline-flex items-center gap-2 text-[0.75rem]">
                        <ShoppingBag size={14} /> Shop Now
                      </Link>
                      <button onClick={() => setActiveTab('orders')} className="btn-secondary inline-flex items-center gap-2 text-[0.75rem]">
                        <Truck size={14} /> Track Latest Order
                      </button>
                      <button onClick={() => setActiveTab('refer')} className="btn-secondary inline-flex items-center gap-2 text-[0.75rem]">
                        <Gift size={14} /> Refer a Friend
                      </button>
                    </div>

                    {/* Promo Banner */}
                    <div className="glass-panel p-5 border border-[#D4AF37]/30 relative">
                      <button onClick={() => {}} className="absolute top-3 right-3 text-[#666666] hover:text-white">
                        <X size={14} />
                      </button>
                      <p className="text-[0.875rem] text-white font-medium">
                        Get 20% off your next filter replacement!{' '}
                        <span className="text-[#D4AF37]">Use code: FILTER20</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* ═══════════════════ MY ORDERS ═══════════════════ */}
                {activeTab === 'orders' && (
                  <div className="space-y-6">
                    <h2 className="text-display-lg font-display text-white">My Orders</h2>

                    {/* Filter tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {['all', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setOrderFilter(f)}
                          className={cn(
                            'px-4 py-2 text-[0.75rem] font-medium uppercase tracking-[0.05em] transition-all border',
                            orderFilter === f
                              ? 'border-[#D4AF37] text-[#D4AF37] bg-[rgba(212,175,55,0.1)]'
                              : 'border-[rgba(255,255,255,0.1)] text-[#A0A0A0] hover:border-[rgba(255,255,255,0.3)]'
                          )}
                        >
                          {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}{' '}
                          <span className="text-[#666666]">
                            {f === 'all' ? mockOrders.length : mockOrders.filter((o) => o.status === f).length}
                          </span>
                        </button>
                      ))}
                    </div>

                    {!showOrderDetail ? (
                      <div className="space-y-4">
                        {filteredOrders.map((order) => {
                          const s = statusConfig[order.status] || statusConfig.placed;
                          return (
                            <div key={order.id} className="glass-panel p-5 md:p-6">
                              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                                <div>
                                  <div className="flex items-center gap-3 mb-1">
                                    <p className="text-[0.875rem] font-mono text-[#D4AF37]">{order.id}</p>
                                    <span className={cn('text-[0.65rem] font-medium uppercase tracking-[0.05em] px-2 py-0.5', s.bg, s.color)}>{s.label}</span>
                                  </div>
                                  <p className="text-[0.7rem] text-[#666666]">
                                    Placed on {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </p>
                                </div>
                                <p className="text-[0.875rem] font-mono text-white">₹{order.grandTotal.toFixed(2)}</p>
                              </div>

                              {/* Thumbnail strip */}
                              <div className="flex gap-2 mb-4">
                                {order.items.slice(0, 3).map((item) => {
                                  const prod = allProducts.find((p: Product) => p.id === item.productId);
                                  return (
                                    <div key={item.productId} className="flex items-center gap-2 bg-[rgba(255,255,255,0.03)] px-3 py-2 border border-[rgba(255,255,255,0.06)]">
                                      <Package size={14} className="text-[#666666]" />
                                      <span className="text-[0.7rem] text-white">{item.productName.length > 20 ? item.productName.slice(0, 20) + '...' : item.productName} x{item.quantity}</span>
                                    </div>
                                  );
                                })}
                                {order.items.length > 3 && (
                                  <span className="text-[0.7rem] text-[#666666] self-center">+{order.items.length - 3} more</span>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex flex-wrap gap-3">
                                <Link to={`/track/${order.id}`} className="text-[0.75rem] text-[#D4AF37] hover:underline flex items-center gap-1">
                                  <Truck size={12} /> Track Order
                                </Link>
                                <button onClick={() => { setSelectedOrderId(order.id); setShowOrderDetail(true); }} className="text-[0.75rem] text-[#A0A0A0] hover:text-white flex items-center gap-1">
                                  <Eye size={12} /> View Details
                                </button>
                                {order.status === 'delivered' && (
                                  <button className="text-[0.75rem] text-[#A0A0A0] hover:text-white flex items-center gap-1">
                                    <Download size={12} /> Invoice
                                  </button>
                                )}
                                <button onClick={() => {
                                  order.items.forEach((item) => {
                                    const prod = allProducts.find((p: Product) => p.id === item.productId);
                                    if (prod) addToCart({ productId: prod.id, productName: prod.name, price: prod.price, image: prod.image });
                                  });
                                }} className="text-[0.75rem] text-[#A0A0A0] hover:text-[#D4AF37] flex items-center gap-1">
                                  <RefreshCw size={12} /> Buy Again
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <button onClick={() => setShowOrderDetail(false)} className="text-[0.75rem] text-[#A0A0A0] hover:text-white flex items-center gap-1">
                          <ChevronRight size={14} className="rotate-180" /> Back to Orders
                        </button>
                        {selectedOrder && (
                          <div className="glass-panel p-6">
                            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                              <div>
                                <p className="text-data-md font-mono text-[#D4AF37]">{selectedOrder.id}</p>
                                <p className="text-[0.75rem] text-[#666666] mt-1">
                                  Placed on {new Date(selectedOrder.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} at {new Date(selectedOrder.placedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <span className={cn('text-[0.75rem] font-medium uppercase tracking-[0.05em] px-3 py-1', statusConfig[selectedOrder.status]?.bg, statusConfig[selectedOrder.status]?.color)}>
                                {statusConfig[selectedOrder.status]?.label}
                              </span>
                            </div>

                            {/* Timeline */}
                            <div className="relative pl-6 mb-6">
                              <div className="absolute left-[11px] top-0 bottom-0 w-[2px] bg-[#1A1A1A]" />
                              {[
                                { label: 'Order Placed', desc: 'Your order has been confirmed', time: new Date(selectedOrder.placedAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), done: true },
                                { label: 'Payment Confirmed', desc: `Payment of ₹${selectedOrder.grandTotal.toFixed(2)} received via UPI`, time: new Date(new Date(selectedOrder.placedAt).getTime() + 60000).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }), done: ['confirmed', 'shipped', 'delivered'].includes(selectedOrder.status) },
                                { label: 'Packed & Dispatched', desc: 'Items packed and ready for dispatch', time: 'Jan 16, 10:00 AM', done: ['shipped', 'delivered'].includes(selectedOrder.status) },
                                { label: 'In Transit', desc: `Blue Dart AWB #${selectedOrder.trackingId.split('-')[2]}`, time: 'Jan 17, 8:30 AM', done: selectedOrder.status === 'delivered' },
                                { label: 'Out for Delivery', desc: 'Courier is on the way', time: selectedOrder.status === 'delivered' ? 'Jan 18, 9:15 AM' : 'Expected soon', done: selectedOrder.status === 'delivered' },
                                { label: 'Delivered', desc: `Package delivered to ${user.name}`, time: 'Jan 18, 2:45 PM', done: selectedOrder.status === 'delivered' },
                              ].map((step, i) => (
                                <div key={step.label} className="relative mb-5 last:mb-0">
                                  <div className={cn(
                                    'absolute -left-6 w-6 h-6 flex items-center justify-center z-10',
                                    step.done ? 'text-[#D4AF37]' : 'text-[#666666]'
                                  )}>
                                    {step.done ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                                  </div>
                                  <div className={cn('absolute -left-[10px] top-6 w-[2px] h-full', step.done ? 'bg-[#D4AF37]' : 'bg-[#1A1A1A]')} />
                                  <div className="pl-2">
                                    <p className={cn('text-[0.8rem] font-medium', step.done ? 'text-white' : 'text-[#666666]')}>{step.label}</p>
                                    <p className={cn('text-[0.7rem]', step.done ? 'text-[#A0A0A0]' : 'text-[#444444]')}>{step.desc}</p>
                                    <p className="text-[0.65rem] text-[#666666] mt-0.5">{step.time}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Items */}
                            <div className="border-t border-[rgba(255,255,255,0.06)] pt-4 mb-4">
                              <h4 className="text-label text-white mb-3">Order Items</h4>
                              {selectedOrder.items.map((item) => (
                                <div key={item.productId} className="flex justify-between py-2 border-b border-[rgba(255,255,255,0.04)]">
                                  <div className="flex items-center gap-3">
                                    <Package size={16} className="text-[#666666]" />
                                    <span className="text-[0.8rem] text-white">{item.productName}</span>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[0.7rem] text-[#666666]">x{item.quantity}</p>
                                    <p className="text-[0.75rem] font-mono text-[#A0A0A0]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Totals */}
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-[0.8rem]">
                                <span className="text-[#A0A0A0]">Subtotal</span>
                                <span className="text-white font-mono">₹{selectedOrder.subtotal.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between text-[0.8rem]">
                                <span className="text-[#A0A0A0]">CGST (9%)</span>
                                <span className="text-white font-mono">₹{selectedOrder.cgst.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-[0.8rem]">
                                <span className="text-[#A0A0A0]">SGST (9%)</span>
                                <span className="text-white font-mono">₹{selectedOrder.sgst.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-[0.8rem]">
                                <span className="text-[#A0A0A0]">Shipping</span>
                                <span className={selectedOrder.shipping === 0 ? 'text-[#2EC4B6]' : 'text-white font-mono'}>
                                  {selectedOrder.shipping === 0 ? 'FREE' : `₹${selectedOrder.shipping}`}
                                </span>
                              </div>
                              <div className="flex justify-between text-[0.9rem] font-medium pt-2 border-t border-[rgba(255,255,255,0.06)]">
                                <span className="text-white">Grand Total</span>
                                <span className="text-[#D4AF37] font-mono">₹{selectedOrder.grandTotal.toFixed(2)}</span>
                              </div>
                            </div>

                            {/* Shipping Address */}
                            <div className="border-t border-[rgba(255,255,255,0.06)] pt-4 mb-4">
                              <h4 className="text-label text-white mb-2">Shipping Address</h4>
                              <p className="text-[0.8rem] text-white">{user.name}</p>
                              <p className="text-[0.8rem] text-[#A0A0A0]">{selectedOrder.address}</p>
                              <p className="text-[0.8rem] text-[#A0A0A0]">PIN: {selectedOrder.pincode}</p>
                              <p className="text-[0.8rem] text-[#A0A0A0]">Phone: {user.phone}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                              <button onClick={() => {
                                selectedOrder.items.forEach((item) => {
                                  const prod = allProducts.find((p: Product) => p.id === item.productId);
                                  if (prod) addToCart({ productId: prod.id, productName: prod.name, price: prod.price, image: prod.image });
                                });
                              }} className="btn-primary text-[0.75rem] inline-flex items-center gap-2">
                                <RefreshCw size={12} /> Reorder
                              </button>
                              <Link to={`/track/${selectedOrder.id}`} className="btn-secondary text-[0.75rem] inline-flex items-center gap-2">
                                <Truck size={12} /> Track Order
                              </Link>
                              <button className="text-[0.75rem] text-[#A0A0A0] hover:text-[#D4AF37] flex items-center gap-1">
                                <Headphones size={12} /> Need Help?
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ═══════════════════ ADDRESSES ═══════════════════ */}
                {activeTab === 'addresses' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-display-lg font-display text-white">My Addresses</h2>
                      <button onClick={() => { setEditingAddress(null); setShowAddressModal(true); }} className="btn-primary text-[0.75rem] inline-flex items-center gap-2">
                        <Plus size={14} /> Add New Address
                      </button>
                    </div>

                    <div className="space-y-4">
                      {addresses.map((addr) => (
                        <div key={addr.id} className="glass-panel p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-[#D4AF37] text-[#0A0A0A] text-[0.6rem] font-bold uppercase tracking-[0.05em]">{addr.type}</span>
                              {addr.isDefault && (
                                <span className="px-2 py-0.5 bg-[#2EC4B6]/20 text-[#2EC4B6] text-[0.6rem] font-bold uppercase tracking-[0.05em]">Default</span>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingAddress(addr); setShowAddressModal(true); }} className="p-1.5 text-[#A0A0A0] hover:text-[#D4AF37] transition-colors">
                                <Pencil size={14} />
                              </button>
                              <button onClick={() => handleDeleteAddress(addr.id)} className="p-1.5 text-[#A0A0A0] hover:text-[#E63946] transition-colors">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <p className="text-[0.875rem] text-white font-medium">{addr.name}</p>
                          <p className="text-[0.8rem] text-[#A0A0A0] mt-1">{addr.address}</p>
                          <p className="text-[0.8rem] text-[#A0A0A0]">Phone: {addr.phone}</p>
                          {!addr.isDefault && (
                            <button onClick={() => handleSetDefault(addr.id)} className="text-[0.7rem] text-[#D4AF37] hover:underline mt-3 flex items-center gap-1">
                              <Star size={10} /> Set as Default
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Address Modal */}
                    {showAddressModal && (
                      <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.8)] flex items-center justify-center p-4" onClick={() => setShowAddressModal(false)}>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="glass-panel p-6 w-full max-w-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-display-md font-display text-white">{editingAddress ? 'Edit Address' : 'Add New Address'}</h3>
                            <button onClick={() => setShowAddressModal(false)} className="text-[#666666] hover:text-white">
                              <X size={18} />
                            </button>
                          </div>
                          <form onSubmit={(e) => { e.preventDefault(); setShowAddressModal(false); }} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-label text-[#666666] mb-1 block">Type</label>
                                <select defaultValue={editingAddress?.type || 'HOME'} className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-[0.8rem] p-3 focus:border-[#D4AF37] focus:outline-none">
                                  <option value="HOME">Home</option>
                                  <option value="WORK">Work</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-label text-[#666666] mb-1 block">PIN Code</label>
                                <input type="text" defaultValue="560034" placeholder="PIN Code" className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-[0.8rem] p-3 placeholder-[#666666] focus:border-[#D4AF37] focus:outline-none" />
                              </div>
                            </div>
                            <div>
                              <label className="text-label text-[#666666] mb-1 block">Full Address</label>
                              <textarea defaultValue={editingAddress?.address.split(',')[0] || ''} placeholder="Full address" rows={3} className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-[0.8rem] p-3 placeholder-[#666666] focus:border-[#D4AF37] focus:outline-none resize-none" />
                            </div>
                            <div className="flex items-center gap-2">
                              <input type="checkbox" id="default" defaultChecked={editingAddress?.isDefault} className="accent-[#D4AF37]" />
                              <label htmlFor="default" className="text-[0.8rem] text-[#A0A0A0]">Set as default address</label>
                            </div>
                            <button type="submit" className="btn-primary w-full text-[0.8rem]">
                              {editingAddress ? 'Update Address' : 'Save Address'}
                            </button>
                          </form>
                        </motion.div>
                      </div>
                    )}
                  </div>
                )}

                {/* ═══════════════════ WISHLIST ═══════════════════ */}
                {activeTab === 'wishlist' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-display-lg font-display text-white">My Wishlist</h2>
                      <p className="text-[0.8rem] text-[#A0A0A0]">{wishlistProducts.length} items</p>
                    </div>

                    {wishlistProducts.length > 0 ? (
                      <>
                        <button
                          onClick={() => {
                            wishlistProducts.forEach((p) => addToCart({ productId: p.id, productName: p.name, price: p.price, image: p.image }));
                          }}
                          className="btn-secondary text-[0.75rem] inline-flex items-center gap-2 mb-4"
                        >
                          <ShoppingBag size={14} /> Move All to Cart
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {wishlistProducts.map((product) => (
                            <div key={product.id} className="glass-card overflow-hidden group">
                              <div className="relative aspect-square bg-[#111111] overflow-hidden">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400" />
                                <button
                                  onClick={() => toggleWishlist(product.id)}
                                  className="absolute top-3 right-3 p-2 bg-[rgba(10,10,10,0.8)] text-[#E63946] hover:bg-[#E63946] hover:text-white transition-all"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                              <div className="p-4">
                                <p className="text-[0.8rem] text-[#A0A0A0] mb-1">{product.category}</p>
                                <h3 className="text-[0.875rem] text-white font-medium mb-1">{product.name}</h3>
                                <p className="text-[0.875rem] font-mono text-[#D4AF37] mb-3">₹{product.price.toLocaleString('en-IN')}</p>
                                <button
                                  onClick={() => addToCart({ productId: product.id, productName: product.name, price: product.price, image: product.image })}
                                  className="w-full btn-primary text-[0.7rem] py-2.5"
                                >
                                  Add to Cart
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-16 glass-panel">
                        <Heart size={48} className="text-[#333333] mx-auto mb-4" />
                        <p className="text-[#A0A0A0] mb-4">Your wishlist is empty</p>
                        <Link to="/shop" className="btn-primary inline-flex items-center gap-2 text-[0.8rem]">
                          <ShoppingBag size={14} /> Browse Products
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {/* ═══════════════════ IOT DASHBOARD ═══════════════════ */}
                {activeTab === 'iot' && (
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-display-lg font-display text-white">IoT Dashboard</h2>
                        <p className="text-[0.75rem] font-mono text-[#A0A0A0] mt-1">Device: SWORD-SRO-2025-X7K9</p>
                      </div>
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2EC4B6]/10 border border-[#2EC4B6]/30">
                        <span className="w-2 h-2 bg-[#2EC4B6] rounded-full animate-pulse" />
                        <span className="text-[0.75rem] text-[#2EC4B6] font-medium">Online</span>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { label: 'Input TDS', value: '420', unit: 'ppm', icon: Droplet, color: 'text-[#E63946]', trend: '→ Stable' },
                        { label: 'Output TDS', value: '150', unit: 'ppm', icon: Droplet, color: 'text-[#2EC4B6]', trend: '✓ Optimal' },
                        { label: 'Filter Life', value: '87', unit: '%', icon: Shield, color: 'text-[#FFD700]', trend: '↓ 6 months' },
                        { label: 'Water Today', value: '12.5', unit: 'L', icon: Droplet, color: 'text-[#00B4D8]', trend: '↑ +2L vs yest.' },
                      ].map((stat) => (
                        <div key={stat.label} className="glass-panel p-4">
                          <div className="flex items-center justify-between mb-2">
                            <stat.icon size={16} className={stat.color} />
                            <span className="text-[0.65rem] text-[#666666]">{stat.trend}</span>
                          </div>
                          <div className="flex items-baseline gap-1">
                            <p className="text-data-md font-mono text-white">{stat.value}</p>
                            <p className="text-[0.65rem] text-[#666666]">{stat.unit}</p>
                          </div>
                          <p className="text-[0.7rem] text-[#A0A0A0]">{stat.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* TDS Chart */}
                    <div className="glass-panel p-5">
                      <h3 className="text-[0.875rem] text-white font-medium mb-4">7-Day TDS Trend</h3>
                      <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={tdsData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="day" tick={{ fill: '#666666', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <YAxis tick={{ fill: '#666666', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF' }}
                              itemStyle={{ fontSize: '0.75rem' }}
                            />
                            <Line type="monotone" dataKey="input" name="Input TDS" stroke="#E63946" strokeWidth={2} dot={{ fill: '#E63946', r: 3 }} />
                            <Line type="monotone" dataKey="output" name="Output TDS" stroke="#2EC4B6" strokeWidth={2} dot={{ fill: '#2EC4B6', r: 3 }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="flex items-center justify-center gap-6 mt-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-[2px] bg-[#E63946]" />
                          <span className="text-[0.7rem] text-[#A0A0A0]">Input TDS</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-[2px] bg-[#2EC4B6]" />
                          <span className="text-[0.7rem] text-[#A0A0A0]">Output TDS</span>
                        </div>
                      </div>
                    </div>

                    {/* Filter Life */}
                    <div className="glass-panel p-5">
                      <h3 className="text-[0.875rem] text-white font-medium mb-4">Filter Life Status</h3>
                      <div className="space-y-4">
                        {filtersData.map((filter) => {
                          const colorClass = filter.life > 70 ? 'bg-[#2EC4B6]' : filter.life > 30 ? 'bg-[#E8A838]' : 'bg-[#E63946]';
                          return (
                            <div key={filter.name}>
                              <div className="flex justify-between mb-1.5">
                                <span className="text-[0.8rem] text-white">{filter.name}</span>
                                <span className="text-[0.75rem] font-mono text-[#A0A0A0]">{filter.life}%</span>
                              </div>
                              <div className="w-full h-2 bg-[#1A1A1A] overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${filter.life}%` }}
                                  transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                                  className={cn('h-full', colorClass)}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <button className="btn-secondary w-full mt-5 text-[0.75rem] inline-flex items-center justify-center gap-2">
                        <ShoppingBag size={12} /> Order Replacement Filters
                      </button>
                    </div>

                    {/* Consumption Chart */}
                    <div className="glass-panel p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-[0.875rem] text-white font-medium">Water Consumption</h3>
                        <div className="text-right">
                          <p className="text-[0.8rem] font-mono text-white">This Week: 350 L</p>
                          <p className="text-[0.65rem] text-[#2EC4B6]">+12.6% vs last week</p>
                        </div>
                      </div>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={consumptionData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="day" tick={{ fill: '#666666', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <YAxis tick={{ fill: '#666666', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF' }}
                              itemStyle={{ fontSize: '0.75rem' }}
                            />
                            <Bar dataKey="liters" name="Liters" fill="#00B4D8" radius={[2, 2, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Health & Alerts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="glass-panel p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-[#2EC4B6]/10 flex items-center justify-center">
                            <Shield size={16} className="text-[#2EC4B6]" />
                          </div>
                          <div>
                            <p className="text-[0.8rem] text-white font-medium">System Health</p>
                            <p className="text-[0.7rem] text-[#2EC4B6]">All systems operational</p>
                          </div>
                        </div>
                        <p className="text-[0.7rem] text-[#666666]">Last purification: 2 mins ago</p>
                      </div>
                      <div className="glass-panel p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-8 h-8 bg-[#E8A838]/10 flex items-center justify-center">
                            <Bell size={16} className="text-[#E8A838]" />
                          </div>
                          <div>
                            <p className="text-[0.8rem] text-white font-medium">Alerts</p>
                            <p className="text-[0.7rem] text-[#E8A838]">1 reminder</p>
                          </div>
                        </div>
                        <p className="text-[0.7rem] text-[#A0A0A0]">Sediment filter replacement due in 2 months</p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-3">
                      <button className="btn-secondary text-[0.75rem] inline-flex items-center gap-2">
                        <Settings size={12} /> Adjust TDS Setting
                      </button>
                      <button className="btn-secondary text-[0.75rem] inline-flex items-center gap-2">
                        <Zap size={12} /> Run Self-Diagnostic
                      </button>
                      <button className="btn-secondary text-[0.75rem] inline-flex items-center gap-2">
                        <Headphones size={12} /> Contact Support
                      </button>
                    </div>
                  </div>
                )}

                {/* ═══════════════════ REFER & EARN ═══════════════════ */}
                {activeTab === 'refer' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-display-lg font-display text-white">Refer & Earn</h2>
                      <p className="text-[0.875rem] text-[#A0A0A0] mt-1">Share SWORD with friends and earn rewards</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="glass-panel p-5 text-center">
                        <p className="text-data-md font-mono text-white">3</p>
                        <p className="text-[0.7rem] text-[#A0A0A0]">Referrals Made</p>
                      </div>
                      <div className="glass-panel p-5 text-center">
                        <p className="text-data-md font-mono text-[#D4AF37]">₹1,500</p>
                        <p className="text-[0.7rem] text-[#A0A0A0]">Rewards Earned</p>
                      </div>
                      <div className="glass-panel p-5 text-center">
                        <p className="text-data-md font-mono text-white">₹500</p>
                        <p className="text-[0.7rem] text-[#A0A0A0]">Pending</p>
                      </div>
                    </div>

                    {/* How It Works */}
                    <div className="glass-panel p-6">
                      <h3 className="text-label text-white mb-5">How It Works</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { step: '1', title: 'Share Your Code', desc: 'Send your unique referral code to friends and family' },
                          { step: '2', title: 'Friend Gets ₹500 Off', desc: 'They get ₹500 off their first SWORD purchase' },
                          { step: '3', title: 'You Earn ₹500', desc: 'When they complete their purchase, you earn ₹500' },
                        ].map((s) => (
                          <div key={s.step} className="text-center">
                            <div className="w-10 h-10 mx-auto mb-3 bg-[#D4AF37] text-[#0A0A0A] font-bold text-[0.875rem] flex items-center justify-center">
                              {s.step}
                            </div>
                            <p className="text-[0.8rem] text-white font-medium mb-1">{s.title}</p>
                            <p className="text-[0.7rem] text-[#A0A0A0]">{s.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Referral Code */}
                    <div className="glass-panel p-6 border border-[#D4AF37]/30">
                      <p className="text-label text-[#666666] mb-2">Your Referral Code</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="px-5 py-3 bg-[rgba(212,175,55,0.1)] border border-dashed border-[#D4AF37]">
                          <p className="text-data-sm font-mono text-[#D4AF37]">SWORD-PRIYANK-500</p>
                        </div>
                        <button
                          onClick={handleCopyCode}
                          className={cn(
                            'flex items-center gap-2 px-4 py-3 text-[0.75rem] font-medium transition-all',
                            copiedCode
                              ? 'bg-[#2EC4B6]/20 text-[#2EC4B6]'
                              : 'btn-secondary'
                          )}
                        >
                          {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                          {copiedCode ? 'Copied!' : 'Copy Code'}
                        </button>
                      </div>
                    </div>

                    {/* Share Options */}
                    <div className="flex flex-wrap gap-3">
                      <button className="btn-secondary text-[0.75rem] inline-flex items-center gap-2">
                        <Smartphone size={14} /> WhatsApp
                      </button>
                      <button className="btn-secondary text-[0.75rem] inline-flex items-center gap-2">
                        <Mail size={14} /> Email
                      </button>
                      <button onClick={handleCopyCode} className="btn-secondary text-[0.75rem] inline-flex items-center gap-2">
                        <LinkIcon size={14} /> Copy Link
                      </button>
                      <button className="btn-secondary text-[0.75rem] inline-flex items-center gap-2">
                        <Share2 size={14} /> Share
                      </button>
                    </div>

                    {/* Referral History */}
                    <div className="glass-panel p-6">
                      <h3 className="text-label text-white mb-4">Referral History</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-[rgba(255,255,255,0.06)]">
                              {['Friend', 'Date', 'Status', 'Reward'].map((h) => (
                                <th key={h} className="text-label text-[#666666] pb-3 pr-4">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {referralHistory.map((ref) => (
                              <tr key={ref.friend} className="border-b border-[rgba(255,255,255,0.04)]">
                                <td className="py-3 pr-4 text-[0.8rem] text-white">{ref.friend}</td>
                                <td className="py-3 pr-4 text-[0.75rem] text-[#A0A0A0]">{ref.date}</td>
                                <td className="py-3 pr-4">
                                  <span className={cn(
                                    'text-[0.65rem] font-medium uppercase tracking-[0.05em] px-2 py-0.5',
                                    ref.status === 'Completed' ? 'bg-[#2EC4B6]/10 text-[#2EC4B6]' : 'bg-[#E8A838]/10 text-[#E8A838]'
                                  )}>{ref.status}</span>
                                </td>
                                <td className="py-3 text-[0.75rem] font-mono text-[#D4AF37]">
                                  {ref.reward > 0 ? `₹${ref.reward}` : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* ═══════════════════ PROFILE SETTINGS ═══════════════════ */}
                {activeTab === 'settings' && (
                  <div className="space-y-8">
                    <h2 className="text-display-lg font-display text-white">Profile Settings</h2>

                    {/* Personal Info */}
                    <div className="glass-panel p-6">
                      <h3 className="text-label text-white mb-5">Personal Information</h3>
                      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-label text-[#666666] mb-1 block">First Name</label>
                            <input type="text" defaultValue="Priyank" className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-[0.8rem] p-3 focus:border-[#D4AF37] focus:outline-none" />
                          </div>
                          <div>
                            <label className="text-label text-[#666666] mb-1 block">Last Name</label>
                            <input type="text" defaultValue="Joshi" className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-[0.8rem] p-3 focus:border-[#D4AF37] focus:outline-none" />
                          </div>
                        </div>
                        <div>
                          <label className="text-label text-[#666666] mb-1 block">Email</label>
                          <input type="email" defaultValue={user.email} readOnly className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] text-[#666666] text-[0.8rem] p-3 cursor-not-allowed" />
                          <p className="text-[0.65rem] text-[#666666] mt-1">Email cannot be changed</p>
                        </div>
                        <div>
                          <label className="text-label text-[#666666] mb-1 block">Phone Number</label>
                          <input type="tel" defaultValue={user.phone} className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-[0.8rem] p-3 focus:border-[#D4AF37] focus:outline-none" />
                        </div>
                        <div>
                          <label className="text-label text-[#666666] mb-1 block">Date of Birth (Optional)</label>
                          <input type="date" className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-[0.8rem] p-3 focus:border-[#D4AF37] focus:outline-none" />
                        </div>
                        <button type="submit" className="btn-primary text-[0.8rem]">Save Changes</button>
                      </form>
                    </div>

                    {/* Password */}
                    <div className="glass-panel p-6">
                      <h3 className="text-label text-white mb-5">Change Password</h3>
                      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                        {[
                          { key: 'current' as const, label: 'Current Password' },
                          { key: 'new' as const, label: 'New Password' },
                          { key: 'confirm' as const, label: 'Confirm New Password' },
                        ].map((field) => (
                          <div key={field.key}>
                            <label className="text-label text-[#666666] mb-1 block">{field.label}</label>
                            <div className="relative">
                              <input
                                type={showPasswords[field.key] ? 'text' : 'password'}
                                value={passwordForm[field.key]}
                                onChange={(e) => setPasswordForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-[0.8rem] p-3 pr-10 focus:border-[#D4AF37] focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords((prev) => ({ ...prev, [field.key]: !prev[field.key] }))}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-white"
                              >
                                {showPasswords[field.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                            </div>
                          </div>
                        ))}
                        <button type="submit" className="btn-primary text-[0.8rem]">Update Password</button>
                      </form>
                    </div>

                    {/* Notification Preferences */}
                    <div className="glass-panel p-6">
                      <h3 className="text-label text-white mb-5">Notification Preferences</h3>
                      <div className="space-y-4">
                        {[
                          { key: 'email' as const, label: 'Email Notifications', desc: 'Order updates, promotions, and newsletters' },
                          { key: 'sms' as const, label: 'SMS Notifications', desc: 'Delivery updates and OTPs' },
                          { key: 'marketing' as const, label: 'Marketing Emails', desc: 'Special offers and new product announcements' },
                        ].map((pref) => (
                          <div key={pref.key} className="flex items-start justify-between">
                            <div>
                              <p className="text-[0.8rem] text-white font-medium">{pref.label}</p>
                              <p className="text-[0.7rem] text-[#666666]">{pref.desc}</p>
                            </div>
                            <button
                              onClick={() => setNotifications((prev) => ({ ...prev, [pref.key]: !prev[pref.key] }))}
                              className={cn(
                                'w-11 h-6 rounded-full transition-colors relative flex-shrink-0',
                                notifications[pref.key] ? 'bg-[#D4AF37]' : 'bg-[#333333]'
                              )}
                            >
                              <div className={cn(
                                'w-4 h-4 bg-white rounded-full absolute top-1 transition-all',
                                notifications[pref.key] ? 'left-6' : 'left-1'
                              )} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="glass-panel p-6 border border-[#E63946]/30">
                      <h3 className="text-label text-[#E63946] mb-3">Danger Zone</h3>
                      <p className="text-[0.8rem] text-[#A0A0A0] mb-4">
                        Once you delete your account, there is no going back. All your data will be permanently removed.
                      </p>
                      <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 text-[0.75rem] text-[#E63946] border border-[#E63946] hover:bg-[#E63946]/10 transition-all">
                        Delete Account
                      </button>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ─────── Logout Confirmation Modal ─────── */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.8)] flex items-center justify-center p-4" onClick={() => setShowLogoutConfirm(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-display-md font-display text-white mb-2">Log Out?</h3>
            <p className="text-[0.8rem] text-[#A0A0A0] mb-6">Are you sure you want to log out of your account?</p>
            <div className="flex gap-3">
              <button onClick={() => { logout(); navigate('/'); }} className="flex-1 btn-primary text-[0.75rem] bg-[#E63946] hover:bg-[#E63946]/90">Log Out</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 btn-secondary text-[0.75rem]">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─────── Delete Account Modal ─────── */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-[rgba(0,0,0,0.8)] flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-panel p-6 max-w-sm w-full border border-[#E63946]/30"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} className="text-[#E63946]" />
              <h3 className="text-display-md font-display text-[#E63946]">Delete Account</h3>
            </div>
            <p className="text-[0.8rem] text-[#A0A0A0] mb-4">
              This cannot be undone. All your data, orders, and subscriptions will be permanently deleted.
            </p>
            <div className="mb-4">
              <label className="text-label text-[#666666] mb-1 block">Enter password to confirm</label>
              <input type="password" placeholder="Current password" className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-[0.8rem] p-3 placeholder-[#666666] focus:border-[#D4AF37] focus:outline-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 btn-primary text-[0.75rem] bg-[#E63946] hover:bg-[#E63946]/90">Delete Account</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 btn-secondary text-[0.75rem]">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

/* ───────── helper component for link icon ───────── */
function LinkIcon({ size, className }: { size?: number; className?: string }) {
  return (
    <svg width={size || 16} height={size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
