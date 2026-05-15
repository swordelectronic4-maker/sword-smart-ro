// @ts-nocheck
// v22.1 - OpenCart-style admin panel
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import AdminDashboard from './admin/Dashboard';
import AdminProducts from './admin/Products';
import AdminOrders from './admin/Orders';
import AdminCustomers from './admin/Customers';
import AdminCatalog from './admin/Catalog';
import AdminCoupons from './admin/Coupons';
import AdminMarketing from './admin/Marketing';
import AdminSettings from './admin/Settings';
import AdminReports from './admin/Reports';
import AdminLeads from './admin/Leads';
import {
  LayoutDashboard, Package, Folder, Filter, ChevronRight, ChevronDown,
  SlidersHorizontal, Building2, Star, FileText, ShoppingBag, Repeat,
  RotateCcw, Users, UsersRound, FormInput, Tag, Mail, Settings,
  UserCog, BarChart3, Search, Bell, LogOut, Menu, X, Store, User
} from 'lucide-react';

/* Section title lookup */
const sectionTitles = {
  dashboard: 'Dashboard',
  categories: 'Categories',
  products: 'Products',
  'recurring-profiles': 'Recurring Profiles',
  filters: 'Filters',
  attributes: 'Attributes',
  'attribute-groups': 'Attribute Groups',
  options: 'Options',
  manufacturers: 'Manufacturers',
  reviews: 'Reviews',
  information: 'Information',
  orders: 'Orders',
  'recurring-orders': 'Recurring Orders',
  returns: 'Returns',
  customers: 'Customers',
  'customer-groups': 'Customer Groups',
  'custom-fields': 'Custom Fields',
  coupons: 'Coupons',
  mail: 'Mail',
  settings: 'Settings',
  users: 'Users',
  localisation: 'Localisation',
  languages: 'Languages',
  currencies: 'Currencies',
  'stock-statuses': 'Stock Statuses',
  'order-statuses': 'Order Statuses',
  countries: 'Countries',
  taxes: 'Taxes',
  'reports-sales': 'Sales Report',
  'reports-products': 'Products Report',
  'reports-customers': 'Customers Report',
  'leads': 'Leads',
};

/* Breadcrumb trails for every section */
const breadcrumbMap = {
  dashboard: ['Home', 'Dashboard'],
  categories: ['Home', 'Catalog', 'Categories'],
  products: ['Home', 'Catalog', 'Products'],
  'recurring-profiles': ['Home', 'Catalog', 'Recurring Profiles'],
  filters: ['Home', 'Catalog', 'Filters'],
  attributes: ['Home', 'Catalog', 'Attributes'],
  'attribute-groups': ['Home', 'Catalog', 'Attributes', 'Attribute Groups'],
  options: ['Home', 'Catalog', 'Options'],
  manufacturers: ['Home', 'Catalog', 'Manufacturers'],
  reviews: ['Home', 'Catalog', 'Reviews'],
  information: ['Home', 'Catalog', 'Information'],
  orders: ['Home', 'Sales', 'Orders'],
  'recurring-orders': ['Home', 'Sales', 'Recurring Orders'],
  returns: ['Home', 'Sales', 'Returns'],
  customers: ['Home', 'Customers', 'Customers'],
  'customer-groups': ['Home', 'Customers', 'Customer Groups'],
  'custom-fields': ['Home', 'Customers', 'Custom Fields'],
  coupons: ['Home', 'Marketing', 'Coupons'],
  mail: ['Home', 'Marketing', 'Mail'],
  settings: ['Home', 'System', 'Settings'],
  users: ['Home', 'System', 'Users'],
  localisation: ['Home', 'System', 'Localisation'],
  languages: ['Home', 'System', 'Localisation', 'Languages'],
  currencies: ['Home', 'System', 'Localisation', 'Currencies'],
  'stock-statuses': ['Home', 'System', 'Localisation', 'Stock Statuses'],
  'order-statuses': ['Home', 'System', 'Localisation', 'Order Statuses'],
  countries: ['Home', 'System', 'Localisation', 'Countries'],
  taxes: ['Home', 'System', 'Localisation', 'Taxes'],
  'reports-sales': ['Home', 'Reports', 'Sales'],
  'reports-products': ['Home', 'Reports', 'Products'],
  'reports-customers': ['Home', 'Reports', 'Customers'],
  'leads': ['Home', 'Customers', 'Leads'],
};

/* Admin Layout Shell — sidebar, top bar, breadcrumbs, section router */
export default function Admin() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({
    catalog: true,
    sales: false,
    customers: false,
    marketing: false,
    system: false,
    attributes: false,
    localisation: false,
    reports: false,
  });
  const userMenuRef = useRef(null);

  /* ---- Close user dropdown on outside click ---- */
  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ---- Close sidebar after navigation on mobile ---- */
  useEffect(() => {
    setSidebarOpen(false);
  }, [activeSection]);

  const toggleMenu = (key) => setExpandedMenus((p) => ({ ...p, [key]: !p[key] }));
  const navigateTo = (section) => setActiveSection(section);
  const isActive = (s) => activeSection === s;
  const matches = (label) => !searchQuery || label.toLowerCase().includes(searchQuery.toLowerCase());
  const breadcrumbs = breadcrumbMap[activeSection] || ['Home', 'Dashboard'];

  /* ---- Style helpers ---- */
  const itemClass = (s) =>
    [
      'flex items-center gap-3 px-4 py-2 text-sm rounded-lg mx-2 cursor-pointer transition-colors',
      isActive(s)
        ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
        : 'text-gray-400 hover:text-white hover:bg-white/5',
    ].join(' ');

  const subItemClass = (s) =>
    [
      'flex items-center gap-3 px-4 py-1.5 text-sm rounded-lg mx-2 cursor-pointer transition-colors pl-10',
      isActive(s)
        ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30'
        : 'text-gray-400 hover:text-white hover:bg-white/5',
    ].join(' ');

  const headerClass = 'px-4 pt-5 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider';

  /* ---- Section router ---- */
  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'products':
        return <AdminProducts />;
      case 'orders':
      case 'recurring-orders':
      case 'returns':
        return <AdminOrders section={activeSection} />;
      case 'customers':
      case 'customer-groups':
      case 'custom-fields':
        return <AdminCustomers section={activeSection} />;
      case 'leads':
        return <AdminLeads />;
      case 'categories':
      case 'manufacturers':
      case 'reviews':
      case 'information':
      case 'filters':
      case 'options':
      case 'recurring-profiles':
      case 'attributes':
      case 'attribute-groups':
        return <AdminCatalog section={activeSection} />;
      case 'coupons':
        return <AdminCoupons />;
      case 'mail':
        return <AdminMarketing section={activeSection} />;
      case 'settings':
      case 'users':
      case 'localisation':
      case 'languages':
      case 'currencies':
      case 'stock-statuses':
      case 'order-statuses':
      case 'countries':
      case 'taxes':
        return <AdminSettings section={activeSection} />;
      case 'reports-sales':
      case 'reports-products':
      case 'reports-customers':
        return <AdminReports section={activeSection} />;
      default:
        return <AdminDashboard />;
    }
  };

  /* ---- Reusable menu components ---- */
  const MenuItem = ({ section, icon: Icon, label }) =>
    matches(label) ? (
      <button onClick={() => navigateTo(section)} className={itemClass(section)}>
        <Icon size={16} />
        <span>{label}</span>
      </button>
    ) : null;

  const SubItem = ({ section, label }) =>
    matches(label) ? (
      <button onClick={() => navigateTo(section)} className={subItemClass(section)}>
        <span>{label}</span>
      </button>
    ) : null;

  const Expandable = ({ menuKey, icon: Icon, label, children }) => {
    if (!matches(label)) return null;
    const open = expandedMenus[menuKey];
    return (
      <>
        <button onClick={() => toggleMenu(menuKey)} className={itemClass(menuKey)}>
          <Icon size={16} />
          <span className="flex-1 text-left">{label}</span>
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>
        <div
          className={`overflow-hidden transition-all duration-200 ease-in-out ${
            open ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {children}
        </div>
      </>
    );
  };

  /* ===================== RENDER ===================== */
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-[#111] border-r border-white/10 flex flex-col overflow-y-auto transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-wider" style={{ color: '#D4AF37' }}>
              SWORD
            </span>
            <span className="text-xs text-gray-500 font-medium uppercase tracking-wide ml-1">
              Admin
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-white/10 text-gray-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-4 pb-2 flex-shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all"
            />
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-2 space-y-1 text-sm min-w-0">
          {/* Dashboard */}
          <MenuItem section="dashboard" icon={LayoutDashboard} label="Dashboard" />

          {/* Catalog */}
          {(matches('Catalog') ||
            matches('Categories') ||
            matches('Products') ||
            matches('Recurring') ||
            matches('Filters') ||
            matches('Attributes') ||
            matches('Options') ||
            matches('Manufacturers') ||
            matches('Reviews') ||
            matches('Information')) && (
            <>
              <div className={headerClass}>Catalog</div>
              <MenuItem section="categories" icon={Folder} label="Categories" />
              <MenuItem section="products" icon={Package} label="Products" />
              <MenuItem section="recurring-profiles" icon={Repeat} label="Recurring Profiles" />
              <MenuItem section="filters" icon={Filter} label="Filters" />
              <Expandable menuKey="attributes" icon={SlidersHorizontal} label="Attributes">
                <SubItem section="attributes" label="Attributes" />
                <SubItem section="attribute-groups" label="Attribute Groups" />
              </Expandable>
              <MenuItem section="options" icon={SlidersHorizontal} label="Options" />
              <MenuItem section="manufacturers" icon={Building2} label="Manufacturers" />
              <MenuItem section="reviews" icon={Star} label="Reviews" />
              <MenuItem section="information" icon={FileText} label="Information" />
            </>
          )}

          {/* Sales */}
          {(matches('Sales') || matches('Orders') || matches('Returns')) && (
            <>
              <div className={headerClass}>Sales</div>
              <MenuItem section="orders" icon={ShoppingBag} label="Orders" />
              <MenuItem section="recurring-orders" icon={Repeat} label="Recurring Orders" />
              <MenuItem section="returns" icon={RotateCcw} label="Returns" />
            </>
          )}

          {/* Customers */}
          {(matches('Customers') || matches('Customer Groups') || matches('Custom Fields') || matches('Leads')) && (
            <>
              <div className={headerClass}>Customers</div>
              <MenuItem section="customers" icon={Users} label="Customers" />
              <MenuItem section="customer-groups" icon={UsersRound} label="Customer Groups" />
              <MenuItem section="custom-fields" icon={FormInput} label="Custom Fields" />
              <MenuItem section="leads" icon={Mail} label="Leads" />
            </>
          )}

          {/* Marketing */}
          {(matches('Marketing') || matches('Coupons') || matches('Mail')) && (
            <>
              <div className={headerClass}>Marketing</div>
              <MenuItem section="coupons" icon={Tag} label="Coupons" />
              <MenuItem section="mail" icon={Mail} label="Mail" />
            </>
          )}

          {/* System */}
          {(matches('System') ||
            matches('Settings') ||
            matches('Users') ||
            matches('Localisation')) && (
            <>
              <div className={headerClass}>System</div>
              <MenuItem section="settings" icon={Settings} label="Settings" />
              <MenuItem section="users" icon={UserCog} label="Users" />
              <Expandable menuKey="localisation" icon={Settings} label="Localisation">
                {['languages', 'currencies', 'stock-statuses', 'order-statuses', 'countries', 'taxes'].map((k) => (
                  <SubItem
                    key={k}
                    section={k}
                    label={k.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  />
                ))}
              </Expandable>
            </>
          )}

          {/* Reports */}
          {(matches('Reports') || matches('Sales') || matches('Products') || matches('Customers')) && (
            <>
              <div className={headerClass}>Reports</div>
              <MenuItem section="reports-sales" icon={BarChart3} label="Sales" />
              <MenuItem section="reports-products" icon={Package} label="Products" />
              <MenuItem section="reports-customers" icon={Users} label="Customers" />
            </>
          )}
        </nav>

        {/* Sidebar footer */}
        <div className="px-4 py-3 border-t border-white/10 text-xs text-gray-600 flex-shrink-0">
          Sword v1.0.0
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 bg-[#0A0A0A] border-b border-white/10 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 flex-shrink-0">
          {/* Left: hamburger + title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-gray-400 transition-colors"
            >
              <Menu size={18} />
            </button>
            <h1 className="text-base font-semibold text-white truncate">
              {sectionTitles[activeSection] || 'Dashboard'}
            </h1>
          </div>

          {/* Right: notifications + user */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Notification bell */}
            <button className="relative p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>

            {/* User dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                  <User size={14} style={{ color: '#D4AF37' }} />
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  {user?.name || 'Admin'}
                </span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#161616] border border-white/10 rounded-xl shadow-2xl py-1 z-50">
                  <div className="px-4 py-2 border-b border-white/10">
                    <p className="text-sm font-medium text-white">
                      {user?.name || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email || 'admin@sword.com'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      navigateTo('settings');
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <User size={14} />
                    Profile
                  </button>
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      window.open('/', '_blank');
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <Store size={14} />
                    Store
                  </button>
                  <div className="border-t border-white/10 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="h-10 bg-[#0A0A0A] border-b border-white/10 flex items-center px-4 lg:px-6 flex-shrink-0">
          <nav className="flex items-center gap-2 text-xs">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-gray-700">/</span>}
                <span
                  className={
                    i === breadcrumbs.length - 1
                      ? 'text-[#D4AF37] font-medium'
                      : 'text-gray-500 hover:text-gray-300 cursor-pointer transition-colors'
                  }
                >
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
