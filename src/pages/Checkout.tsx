import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { ChevronRight, CreditCard, Truck, Check, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const steps = ['Address', 'Payment', 'Review'];

export default function Checkout() {
  const { items, subtotal, cgst, sgst, shipping, grandTotal } = useCart();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  const handlePlaceOrder = () => {
    const id = `ORD-2025-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
    setOrderId(id);
    setOrderPlaced(true);
  };

  if (items.length === 0 && !orderPlaced) {
    navigate('/cart');
    return null;
  }

  if (orderPlaced) {
    return (
      <div className="min-h-[100dvh] pt-[72px] bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="w-16 h-16 bg-[#2EC4B6] rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={32} className="text-[#0A0A0A]" />
          </div>
          <h1 className="text-display-md font-display text-white mb-2">Order Confirmed!</h1>
          <p className="text-[#A0A0A0] mb-2">Thank you for your purchase.</p>
          <p className="text-data-sm text-[#D4AF37] font-mono mb-6">{orderId}</p>
          <div className="glass-panel p-6 mb-6 text-left">
            <p className="text-[0.875rem] text-[#A0A0A0] mb-1">Estimated Delivery</p>
            <p className="text-[1.125rem] text-white mb-4">
              {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
                weekday: 'long', day: 'numeric', month: 'long',
              })}
            </p>
            <Link
              to={`/track/${orderId}`}
              className="text-[#D4AF37] text-[0.875rem] hover:underline"
            >
              Track your order
            </Link>
          </div>
          <Link to="/shop" className="btn-primary inline-block">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] pt-[72px] bg-[#0A0A0A]">
      <div className="container-sword py-12">
        <h1 className="text-display-lg font-display text-white mb-8">Checkout</h1>

        {/* Stepper */}
        <div className="flex items-center gap-4 mb-10">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 flex items-center justify-center text-[0.875rem] font-medium transition-colors',
                  index <= currentStep
                    ? 'bg-[#D4AF37] text-[#0A0A0A]'
                    : 'bg-[#1A1A1A] text-[#666666]'
                )}
              >
                {index < currentStep ? <Check size={16} /> : index + 1}
              </div>
              <span
                className={cn(
                  'text-[0.75rem] font-medium uppercase tracking-[0.05em] hidden sm:block',
                  index <= currentStep ? 'text-white' : 'text-[#666666]'
                )}
              >
                {step}
              </span>
              {index < steps.length - 1 && (
                <ChevronRight size={14} className="text-[#666666] ml-2" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 0 && (
              <div className="glass-panel p-6">
                <h2 className="text-label text-white mb-6 flex items-center gap-2">
                  <Truck size={16} /> SHIPPING ADDRESS
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {['Full Name', 'Phone Number', 'Address Line 1', 'Address Line 2', 'City', 'Pincode', 'State'].map((field) => (
                    <div key={field} className={field === 'Address Line 1' || field === 'Address Line 2' ? 'sm:col-span-2' : ''}>
                      <label className="text-[0.75rem] text-[#A0A0A0] mb-1.5 block uppercase tracking-[0.05em]">{field}</label>
                      <input
                        type="text"
                        placeholder={field}
                        className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white px-4 py-3 text-[0.875rem] placeholder-[#666666] focus:border-[#D4AF37] focus:shadow-[0_0_0_2px_rgba(212,175,55,0.15)] outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
                <button onClick={() => setCurrentStep(1)} className="btn-primary mt-6">
                  Continue to Payment
                </button>
              </div>
            )}

            {currentStep === 1 && (
              <div className="glass-panel p-6">
                <h2 className="text-label text-white mb-6 flex items-center gap-2">
                  <CreditCard size={16} /> PAYMENT METHOD
                </h2>
                <div className="space-y-3 mb-6">
                  {[
                    { id: 'card', label: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay' },
                    { id: 'upi', label: 'UPI Payment', sub: 'Google Pay, PhonePe, Paytm' },
                    { id: 'cod', label: 'Cash on Delivery', sub: 'Pay when you receive' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id as typeof paymentMethod)}
                      className={cn(
                        'w-full p-4 border text-left transition-all flex items-center gap-4',
                        paymentMethod === method.id
                          ? 'border-[#D4AF37] bg-[rgba(212,175,55,0.05)]'
                          : 'border-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.2)]'
                      )}
                    >
                      <div
                        className={cn(
                          'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                          paymentMethod === method.id ? 'border-[#D4AF37]' : 'border-[#666666]'
                        )}
                      >
                        {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />}
                      </div>
                      <div>
                        <p className="text-[0.875rem] text-white">{method.label}</p>
                        <p className="text-[0.75rem] text-[#666666]">{method.sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setCurrentStep(0)} className="btn-secondary">
                    Back
                  </button>
                  <button onClick={() => setCurrentStep(2)} className="btn-primary">
                    Review Order
                  </button>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="glass-panel p-6">
                <h2 className="text-label text-white mb-6">ORDER REVIEW</h2>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-4">
                      <img src={item.image} alt={item.productName} className="w-16 h-16 object-contain bg-[#1A1A1A]" />
                      <div className="flex-1">
                        <p className="text-[0.875rem] text-white">{item.productName}</p>
                        <p className="text-[0.75rem] text-[#A0A0A0]">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-[0.875rem] text-[#D4AF37] font-mono">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setCurrentStep(1)} className="btn-secondary">
                    Back
                  </button>
                  <button onClick={handlePlaceOrder} className="btn-primary">
                    Place Order
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Summary Sidebar */}
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
            <div className="flex justify-between text-[1.125rem] font-medium pt-4 border-t border-[rgba(255,255,255,0.06)]">
              <span className="text-white">Grand Total</span>
              <span className="text-[#D4AF37] font-mono">₹{grandTotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 mt-4 text-[0.75rem] text-[#2EC4B6]">
              <Shield size={14} />
              <span>Secure SSL Encrypted Transaction</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
