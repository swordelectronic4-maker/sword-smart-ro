import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
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
  const lastScrollY = useRef(0);
  const location = useLocation();
  const { totalItems, setIsCartOpen } = useCart();

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
              src="/logo-gold.png"
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
          <div className="flex items-center gap-4">
            <button
              className="hidden md:flex p-2 text-[#A0A0A0] hover:text-white transition-colors"
              aria-label="Search"
            >
              <Search size={20} />
            </button>
            <Link
              to="/account"
              className="hidden md:flex p-2 text-[#A0A0A0] hover:text-[#D4AF37] transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={20} />
            </Link>
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
        <div className="fixed inset-0 z-40 bg-[#0A0A0A] flex flex-col items-center justify-center gap-8 md:hidden">
          {navLinks.map((link, index) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-display-md font-display text-white hover:text-[#D4AF37] transition-colors"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
