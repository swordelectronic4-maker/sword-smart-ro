import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { cn } from '@/lib/utils';

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, cgst, sgst, shipping, grandTotal } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-[60] bg-[rgba(0,0,0,0.6)] transition-opacity duration-400',
          isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 right-0 bottom-0 z-[70] w-full max-w-[420px] bg-[#111111] backdrop-blur-[16px] transition-transform duration-400 flex flex-col',
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        )}
        style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[rgba(255,255,255,0.06)]">
          <div>
            <h2 className="text-label text-white tracking-[0.08em]">YOUR CART</h2>
            <p className="text-[0.75rem] text-[#666666] mt-1">{items.length} item(s)</p>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-[#A0A0A0] hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingBag size={48} className="text-[#333333] mb-4" />
              <p className="text-[#A0A0A0] mb-2">Your cart is empty</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-secondary mt-4"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.productId} className="flex gap-4">
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-20 h-20 object-contain bg-[#1A1A1A]"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[0.875rem] font-medium text-white truncate">
                      {item.productName}
                    </h3>
                    {item.variant && (
                      <p className="text-[0.75rem] text-[#666666]">{item.variant}</p>
                    )}
                    <p className="text-[0.875rem] text-[#D4AF37] font-mono mt-1">
                      ₹{item.price.toLocaleString('en-IN')}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center border border-[rgba(255,255,255,0.2)] text-[#A0A0A0] hover:text-white hover:border-[#D4AF37] transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-[0.875rem] text-white w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center border border-[rgba(255,255,255,0.2)] text-[#A0A0A0] hover:text-white hover:border-[#D4AF37] transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 text-[#666666] hover:text-[#E63946] transition-colors self-start"
                    aria-label="Remove item"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-[rgba(255,255,255,0.06)] p-6 space-y-3">
            <div className="flex justify-between text-[0.875rem]">
              <span className="text-[#A0A0A0]">Subtotal</span>
              <span className="text-white font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[0.875rem]">
              <span className="text-[#A0A0A0]">CGST (9%)</span>
              <span className="text-white font-mono">₹{cgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-[0.875rem]">
              <span className="text-[#A0A0A0]">SGST (9%)</span>
              <span className="text-white font-mono">₹{sgst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-[0.875rem]">
              <span className="text-[#A0A0A0]">Shipping</span>
              <span className={shipping === 0 ? 'text-[#2EC4B6]' : 'text-white font-mono'}>
                {shipping === 0 ? 'FREE' : `₹${shipping}`}
              </span>
            </div>
            <div className="flex justify-between text-[1rem] font-medium pt-3 border-t border-[rgba(255,255,255,0.06)]">
              <span className="text-white">Grand Total</span>
              <span className="text-[#D4AF37] font-mono">
                ₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <Link
              to="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="btn-primary w-full text-center block mt-4"
            >
              Proceed to Checkout
            </Link>
            <button
              onClick={() => setIsCartOpen(false)}
              className="btn-secondary w-full mt-2"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
