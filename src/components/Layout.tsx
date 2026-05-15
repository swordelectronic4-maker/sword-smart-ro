import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import CustomCursor from './CustomCursor';
import ChatBot from './ChatBot';
import { trackPageView, seedDemoAnalytics } from '@/services/analyticsService';
import { seedDatabase, getProductsAsync, getOrdersAsync } from '@/services/dataStore';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  useEffect(() => {
    seedDatabase();
    // Sync Supabase data in background
    getProductsAsync().then(products => {
      console.log('[Layout] Synced', products.length, 'products from Supabase');
    }).catch(() => {});
    getOrdersAsync().then(orders => {
      console.log('[Layout] Synced', orders.length, 'orders from Supabase');
    }).catch(() => {});
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    trackPageView(location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    seedDemoAnalytics();
  }, []);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#0A0A0A]">
      <CustomCursor />
      <Navbar />
      <CartDrawer />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
}
