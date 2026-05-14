import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, X, ShoppingBag, Tag, ArrowRight, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { products } from '@/data/products';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

const COUPONS: Record<string, { type: 'percent' | 'fixed'; value: number; label: string }> = {
  SWORD10: { type: 'percent', value: 10, label: '10% off' },
  FIRSTBUY: { type: 'fixed', value: 500, label: '₹500 off' },
  DIWALI20: { type: 'percent', value: 20, label: '20% off' },
};

export default function Cart() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeFromCart, subtotal, cgst, sgst, shipping, grandTotal } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState('');

  const discount = appliedCoupon
    ? COUPONS[appliedCoupon].type === 'percent'
      ? Math.round((subtotal * COUPONS[appliedCoupon].value) / 100)
      : COUPONS[appliedCoupon].value
    : 0;

  const finalTotal = grandTotal - discount;

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (COUPONS[code]) {
      setAppliedCoupon(code);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const crossSell = products.filter((p) => !items.some((i) => i.productId === p.productId)).slice(0, 3);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] pt-[72px] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-4"
        >
          <ShoppingBag size={64} className="mx-auto text-[#333] mb-6" />
          <h1 className="font-['Playfair_Display'] text-3xl text-white mb-3">Your Cart is Empty</h1>
          <p className="text-[#A0A0A0] mb-8 max-w-md mx-auto">
            Discover our range of smart water purification solutions designed for Indian homes.
          </p>
          <Button
            onClick={() => navigate('/shop')}
            className="bg-gradient-to-r from-[#D4AF37] to-[#E8D44D] text-[#0A0A0A] font-semibold px-8 h-12 rounded-none hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
          >
            Continue Shopping
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-[72px]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-['Playfair_Display'] text-3xl md:text-4xl text-white mb-10"
        >
          Shopping Cart
          <span className="text-[#A0A0A0] text-lg font-normal ml-3">({items.length} item{items.length !== 1 ? 's' : ''})</span>
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.productId}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -100, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-5 bg-white/[0.03] border border-white/[0.08] p-5"
                >
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-24 h-24 object-contain bg-[#111] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-white font-medium truncate pr-4">{item.productName}</h3>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-[#666] hover:text-red-400 transition-colors shrink-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <p className="text-[#D4AF37] font-['JetBrains_Mono'] text-sm font-semibold mb-3">
                      {formatPrice(item.price)}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center border border-white/20 h-9">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-9 h-full flex items-center justify-center text-white hover:text-[#D4AF37]"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-10 text-center text-white text-sm font-['JetBrains_Mono']">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-9 h-full flex items-center justify-center text-white hover:text-[#D4AF37]"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <p className="text-white font-['JetBrains_Mono'] font-semibold">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Cross Sell */}
            {crossSell.length > 0 && (
              <div className="mt-10">
                <h3 className="text-white font-medium mb-4">You might also like</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {crossSell.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white/[0.02] border border-white/[0.06] p-4 cursor-pointer hover:border-[#D4AF37]/30 transition-all"
                      onClick={() => navigate(`/product/${p.id}`)}
                    >
                      <img src={p.image} alt={p.name} className="w-full h-24 object-contain mb-3" />
                      <p className="text-xs text-[#A0A0A0] uppercase tracking-wider mb-1">{p.category}</p>
                      <p className="text-sm text-white truncate">{p.name}</p>
                      <p className="text-[#D4AF37] font-['JetBrains_Mono'] text-sm font-semibold mt-1">
                        {formatPrice(p.price)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/[0.03] border border-white/[0.08] p-6 h-fit lg:sticky lg:top-[96px]"
          >
            <h2 className="font-['Playfair_Display'] text-xl text-white mb-6">Order Summary</h2>

            {/* Coupon */}
            <div className="mb-6">
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter coupon code"
                      className="pl-9 h-11 bg-white/5 border-white/10 text-white text-sm rounded-none focus:border-[#D4AF37] uppercase"
                    />
                  </div>
                  <Button
                    onClick={handleApplyCoupon}
                    variant="outline"
                    className="h-11 border-white/20 text-[#A0A0A0] rounded-none hover:text-[#D4AF37] hover:border-[#D4AF37]"
                  >
                    Apply
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-4 py-3">
                  <div>
                    <p className="text-sm text-[#D4AF37] font-semibold">{appliedCoupon}</p>
                    <p className="text-xs text-[#A0A0A0]">{COUPONS[appliedCoupon].label} applied</p>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-[#666] hover:text-red-400">
                    <X size={16} />
                  </button>
                </div>
              )}
              {couponError && <p className="text-xs text-red-400 mt-2">{couponError}</p>}
              <div className="flex gap-2 mt-2">
                {Object.keys(COUPONS).map((code) => (
                  <button
                    key={code}
                    onClick={() => { setCouponCode(code); handleApplyCoupon(); }}
                    className="text-[0.625rem] text-[#666] border border-white/10 px-2 py-1 hover:border-[#D4AF37]/50 hover:text-[#A0A0A0] transition-colors"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="space-y-3 text-sm border-t border-white/10 pt-4">
              <div className="flex justify-between text-[#A0A0A0]">
                <span>Subtotal</span>
                <span className="text-white font-['JetBrains_Mono']">{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#2EC4B6]">
                  <span>Discount ({appliedCoupon})</span>
                  <span className="font-['JetBrains_Mono']">-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#A0A0A0]">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-[#2EC4B6]' : 'text-white font-["JetBrains_Mono"]'}>
                  {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-[#A0A0A0]">
                <span>CGST (9%)</span>
                <span className="text-white font-['JetBrains_Mono']">{formatPrice(cgst)}</span>
              </div>
              <div className="flex justify-between text-[#A0A0A0]">
                <span>SGST (9%)</span>
                <span className="text-white font-['JetBrains_Mono']">{formatPrice(sgst)}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex justify-between">
                <span className="text-white font-semibold">Grand Total</span>
                <span className="text-[#D4AF37] font-['JetBrains_Mono'] text-xl font-bold">
                  {formatPrice(finalTotal)}
                </span>
              </div>
              <p className="text-[0.625rem] text-[#666]">Including ₹{Math.round(cgst + sgst).toLocaleString('en-IN')} in taxes</p>
            </div>

            <Button
              onClick={() => navigate('/checkout')}
              className="w-full mt-6 h-14 bg-gradient-to-r from-[#D4AF37] to-[#E8D44D] text-[#0A0A0A] font-semibold uppercase tracking-[0.05em] rounded-none hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:scale-[1.02] transition-all text-sm"
            >
              Proceed to Checkout
              <ArrowRight size={16} className="ml-2" />
            </Button>

            <button
              onClick={() => navigate('/shop')}
              className="w-full mt-3 text-sm text-[#A0A0A0] hover:text-[#D4AF37] transition-colors text-center"
            >
              Continue Shopping
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
