import { Link } from 'react-router-dom';
import { Linkedin, Instagram, Twitter, Youtube } from 'lucide-react';

const shopLinks = [
  { label: 'Smart RO', href: '/product/sword-smart-ro' },
  { label: 'Filters', href: '/shop?category=Filters' },
  { label: 'Accessories', href: '/shop?category=Accessories' },
  { label: 'Subscription Plans', href: '/subscriptions' },
];

const companyLinks = [
  { label: 'About', href: '/about' },
  { label: 'Technology', href: '/product/sword-smart-ro' },
  { label: 'Contact', href: '/about' },
  { label: 'Careers', href: '/about' },
  { label: 'Press', href: '/about' },
];

const supportLinks = [
  { label: 'Help Center', href: '/about' },
  { label: 'Installation Guide', href: '/about' },
  { label: 'Warranty', href: '/about' },
  { label: 'Returns', href: '/about' },
  { label: 'Track Order', href: '/track/ORD-2025-0042' },
];

export default function Footer() {
  return (
    <footer className="bg-[#0A0A0A] border-t border-[rgba(255,255,255,0.06)]">
      <div className="container-sword py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <img
              src="/assets/logo.png"
              alt="SWORD"
              className="h-[32px] w-auto object-contain mb-4"
            />
            <p className="text-[0.875rem] text-[#A0A0A0] leading-relaxed">
              India&apos;s first AI-powered dual-membrane smart water purifier.
              Engineered for purity, designed for homes.
            </p>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-label text-white mb-4">Shop</h4>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-[0.875rem] text-[#A0A0A0] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-label text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-[0.875rem] text-[#A0A0A0] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-label text-white mb-4">Support</h4>
            <ul className="space-y-3">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.href}
                    className="text-[0.875rem] text-[#A0A0A0] hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[rgba(255,255,255,0.06)]">
        <div className="container-sword py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[0.75rem] text-[#666666] text-center md:text-left">
            <p>&copy; 2025 SWORD Home Appliances Pvt. Ltd. All rights reserved.</p>
            <p className="mt-1">GST Registration: 27AABCS1234C1Z5</p>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[#A0A0A0] hover:text-white transition-colors" aria-label="LinkedIn">
              <Linkedin size={18} />
            </a>
            <a href="#" className="text-[#A0A0A0] hover:text-white transition-colors" aria-label="Instagram">
              <Instagram size={18} />
            </a>
            <a href="#" className="text-[#A0A0A0] hover:text-white transition-colors" aria-label="Twitter">
              <Twitter size={18} />
            </a>
            <a href="#" className="text-[#A0A0A0] hover:text-white transition-colors" aria-label="YouTube">
              <Youtube size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
