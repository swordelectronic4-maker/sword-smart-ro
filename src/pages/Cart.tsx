import { Link } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, subtotal, cgst, sgst, shipping, grandTotal } = useCart();

  return (
    <div className="min-h-[100dvh] pt-[72px] bg-[#0A0A0A]">
      <div className="container-sword py-12">
        <h1 className="text-display-lg font-display text-white mb-8">Your Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={64} className="text-[#333333] mx-auto mb-4" />
            <p className="text-[#A0A0A0] mb-4">Your cart is empty</p>
            <Link to="/shop" className="btn-primary inline-block">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-6">
              {items.map((item) => (
                <div key={item.productId} className="glass-panel p-4 flex gap-4">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-24 h-24 object-contain bg-[#1A1A1A]"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <Link
                        to={`/product/${item.productId}`}
                        className="text-[0.875rem] font-medium text-white hover:text-[#D4AF37] transition-colors"
                      >
                        {item.productName}
                      </Link>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-[#666666] hover:text-[#E63946] transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-[0.875rem] text-[#D4AF37] font-mono mb-3">
                      ₹{item.price.toLocaleString('en-IN')}
                    </p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center border border-[rgba(255,255,255,0.2)] text-[#A0A0A0] hover:text-white"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-white w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center border border-[rgba(255,255,255,0.2)] text-[#A0A0A0] hover:text-white"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="glass-panel p-6 h-fit">
              <h2 className="text-label text-white mb-6">ORDER SUMMARY</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[0.875rem]">
                  <span className="text-[#A0A0A0]">Subtotal</span>
                  <span className="text-white font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[0.875rem]">
                  <span className="text-[#A0A0A0]">CGST (9%)</span>
                  <span className="text-white font-mono">₹{cgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[0.875rem]">
                  <span className="text-[#A0A0A0]">SGST (9%)</span>
                  <span className="text-white font-mono">₹{sgst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[0.875rem]">
                  <span className="text-[#A0A0A0]">Shipping</span>
                  <span className={shipping === 0 ? 'text-[#2EC4B6]' : 'text-white font-mono'}>
                    {shipping === 0 ? 'FREE' : `₹${shipping}`}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-[1.125rem] font-medium pt-4 border-t border-[rgba(255,255,255,0.06)] mb-6">
                <span className="text-white">Grand Total</span>
                <span className="text-[#D4AF37] font-mono">₹{grandTotal.toFixed(2)}</span>
              </div>
              <Link to="/checkout" className="btn-primary w-full text-center flex items-center justify-center gap-2">
                Proceed to Checkout
                <ArrowRight size={16} />
              </Link>
              <Link to="/shop" className="btn-secondary w-full text-center block mt-3">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
