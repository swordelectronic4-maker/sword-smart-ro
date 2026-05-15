import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X, User, LogOut, Shield } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'SHOP', href: '/shop' },
  { label: 'TECHNOLOGY', href: '/product/sword-smart-ro' },
  { label: 'SUBSCRIPTIONS', href: '/subscriptions' },
  { label: 'ABOUT', href: '/about' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const location = useLocation();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 100);
      if (currentY > lastScrollY.current && currentY > 200) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center transition-all duration-300',
          scrolled
            ? 'bg-[rgba(10,10,10,0.9)] backdrop-blur-[12px]'
            : 'bg-transparent',
          hidden && !mobileOpen ? '-translate-y-full' : 'translate-y-0'
        )}
      >
        <div className="container-sword flex items-center justify-between w-full">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/assets/logo.png"
              alt="SWORD"
              className="h-[32px] w-auto object-contain"
            />
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-[0.875rem] font-medium tracking-[0.05em] uppercase transition-colors relative group',
                  location.pathname === link.href
                    ? 'text-[#D4AF37]'
                    : 'text-[#A0A0A0] hover:text-white'
                )}
              >
                {link.label}
                <span
                  className={cn(
                    'absolute -bottom-1 left-0 h-[1px] bg-[#D4AF37] transition-all duration-300',
                    location.pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                  )}
                />
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <button
              className="hidden md:flex p-2 text-[#A0A0A0] hover:text-white transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-[#A0A0A0] hover:text-[#D4AF37] transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] bg-[#D4AF37] text-[#0A0A0A] text-[10px] font-bold flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Auth Controls */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="hidden md:flex items-center gap-2 p-2 text-[#A0A0A0] hover:text-[#D4AF37] transition-colors"
                  aria-label="Account"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] flex items-center justify-center">
                    <User size={14} className="text-[#0A0A0A]" />
                  </div>
                  <span className="text-sm max-w-[80px] truncate">{user?.name?.split(' ')[0]}</span>
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1A] border border-white/10 shadow-xl z-50">
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                      <p className="text-[#666] text-xs truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#A0A0A0] hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User size={14} /> My Account
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#D4AF37] hover:text-[#E8D44D] hover:bg-[#D4AF37]/10 transition-colors"
                      >
                        <Shield size={14} /> Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-colors border-t border-white/10"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/account"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-sm font-medium hover:bg-[#D4AF37]/20 transition-colors"
              >
                <User size={16} />
                Sign In
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-[#A0A0A0] hover:text-white transition-colors"
              aria-label="Menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-[#0A0A0A] flex flex-col items-center justify-center gap-6 md:hidden">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-display-md font-display text-white hover:text-[#D4AF37] transition-colors"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {link.label}
            </Link>
          ))}
          {/* Mobile Auth Links */}
          <div className="border-t border-white/10 pt-6 mt-2 flex flex-col items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  onClick={() => setMobileOpen(false)}
                  className="text-body-lg text-[#A0A0A0] hover:text-[#D4AF37] transition-colors flex items-center gap-2"
                >
                  <User size={18} /> My Account
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileOpen(false)}
                    className="text-body-lg text-[#D4AF37] hover:text-[#E8D44D] transition-colors flex items-center gap-2"
                  >
                    <Shield size={18} /> Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => { logout(); setMobileOpen(false); }}
                  className="text-body-lg text-red-400 hover:text-red-300 transition-colors flex items-center gap-2"
                >
                  <LogOut size={18} /> Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/account"
                onClick={() => setMobileOpen(false)}
                className="text-body-lg text-[#D4AF37] hover:text-[#E8D44D] transition-colors flex items-center gap-2"
              >
                <User size={18} /> Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}
