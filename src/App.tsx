import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import Shop from '@/pages/Shop';
import ProductDetail from '@/pages/ProductDetail';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Account from '@/pages/Account';
import Subscriptions from '@/pages/Subscriptions';
import About from '@/pages/About';
import Admin from '@/pages/Admin';
import OrderTracking from '@/pages/OrderTracking';

// Admin route guard - redirects to /account if not admin
function AdminRoute() {
  const { isAdmin, authReady } = useAuth();

  // Show loading while auth hydrates
  if (!authReady) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect non-admins to account page
  if (!isAdmin) {
    return <Navigate to="/account" replace />;
  }

  return <Admin />;
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<Account />} />
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/about" element={<About />} />
            <Route path="/admin" element={<AdminRoute />} />
            <Route path="/track/:id" element={<OrderTracking />} />
          </Routes>
        </Layout>
      </CartProvider>
    </AuthProvider>
  );
}
