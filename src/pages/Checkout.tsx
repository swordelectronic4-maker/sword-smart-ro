import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, CreditCard, Wallet, Truck, ShieldCheck, Building2, Smartphone, Banknote } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

const steps = ['Cart', 'Shipping', 'Payment', 'Review'] as const;

const indianStates = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal',
];

const paymentMethods = [
  { id: 'upi', label: 'UPI', icon: Smartphone, desc: 'Pay via GPay, PhonePe, Paytm' },
  { id: 'card', label: 'Credit / Debit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking', label: 'Net Banking', icon: Building2, desc: 'All major banks' },
  { id: 'wallet', label: 'Wallet', icon: Wallet, desc: 'Paytm, PhonePe, Amazon Pay' },
  { id: 'cod', label: 'Cash on Delivery', icon: Banknote, desc: 'Pay when you receive' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, cgst, sgst, shipping, grandTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Shipping form
  const [shippingData, setShippingData] = useState({
    email: user?.email || '',
    fullName: user?.name || '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    pincode: '',
    delivery: 'standard',
  });

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvv: '' });
  const [termsAccepted, setTermsAccepted] = useState(false);

  const totalWithShipping = grandTotal;

  const isShippingValid =
    shippingData.email && shippingData.fullName && shippingData.phone &&
    shippingData.address1 && shippingData.city && shippingData.state && shippingData.pincode;

  const handlePlaceOrder = () => {
    const id = `SWORD-${Math.floor(10000 + Math.random() * 90000)}`;
    setOrderId(id);
    setOrderPlaced(true);
    clearCart();
  };

  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + (shippingData.delivery === 'express' ? 3 : 7));

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] pt-[72px] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E8D44D] flex items-center justify-center mx-auto mb-6"
          >
            <Check size={40} className="text-[#0A0A0A]" />
          </motion.div>
          <h1 className="font-['Playfair_Display'] text-3xl text-white mb-3">Order Placed Successfully</h1>
          <p className="text-[#A0A0A0] mb-2">Thank you for choosing SWORD Smart Water.</p>
          <p className="text-[#D4AF37] font-['JetBrains_Mono'] text-lg font-semibold mb-6">{orderId}</p>

          <div className="bg-white/[0.03] border border-white/[0.08] p-5 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-[#A0A0A0] text-sm">Estimated Delivery</span>
              <span className="text-white text-sm font-medium">
                {deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#A0A0A0] text-sm">Payment Method</span>
              <span className="text-white text-sm font-medium capitalize">{paymentMethod}</span>
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => navigate(`/track/${orderId}`)}
              className="bg-gradient-to-r from-[#D4AF37] to-[#E8D44D] text-[#0A0A0A] font-semibold px-6 h-12 rounded-none"
            >
              Track Order
            </Button>
            <Button
              onClick={() => navigate('/shop')}
              variant="outline"
              className="border-white/20 text-white h-12 px-6 rounded-none hover:border-[#D4AF37]"
            >
              Continue Shopping
            </Button>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-sm text-[#A0A0A0] mb-3">Share ₹500 off with friends</p>
            <div className="flex items-center justify-center gap-2">
              <code className="bg-white/5 border border-white/10 px-4 py-2 text-[#D4AF37] font-['JetBrains_Mono'] text-sm">
                SWORD-REF500
              </code>
              <Button
                variant="ghost"
                size="sm"
                className="text-[#D4AF37] hover:text-[#E8D44D]"
                onClick={() => navigator.clipboard.writeText('SWORD-REF500')}
              >
                Copy
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-[72px]">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, i) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 flex items-center justify-center border-2 text-sm font-semibold transition-all ${
                    i <= currentStep
                      ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                      : 'border-white/20 text-[#666]'
                  }`}
                >
                  {i < currentStep ? <Check size={18} /> : i + 1}
                </div>
                <span className={`text-[0.6875rem] mt-2 ${i <= currentStep ? 'text-[#D4AF37]' : 'text-[#666]'}`}>
                  {step}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-16 sm:w-24 h-[2px] mx-2 ${i < currentStep ? 'bg-[#D4AF37]' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Shipping */}
          {currentStep === 1 && (
            <motion.div
              key="shipping"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="font-['Playfair_Display'] text-2xl text-white mb-6">Shipping Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <Input
                  placeholder="Email Address *"
                  type="email"
                  value={shippingData.email}
                  onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                  className="h-12 bg-white/5 border-white/10 text-white rounded-none focus:border-[#D4AF37]"
                />
                <Input
                  placeholder="Full Name *"
                  value={shippingData.fullName}
                  onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                  className="h-12 bg-white/5 border-white/10 text-white rounded-none focus:border-[#D4AF37]"
                />
                <Input
                  placeholder="Phone Number *"
                  value={shippingData.phone}
                  onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                  className="h-12 bg-white/5 border-white/10 text-white rounded-none focus:border-[#D4AF37]"
                />
                <Input
                  placeholder="Address Line 1 *"
                  value={shippingData.address1}
                  onChange={(e) => setShippingData({ ...shippingData, address1: e.target.value })}
                  className="h-12 bg-white/5 border-white/10 text-white rounded-none focus:border-[#D4AF37]"
                />
                <Input
                  placeholder="Address Line 2"
                  value={shippingData.address2}
                  onChange={(e) => setShippingData({ ...shippingData, address2: e.target.value })}
                  className="h-12 bg-white/5 border-white/10 text-white rounded-none focus:border-[#D4AF37]"
                />
                <Input
                  placeholder="City *"
                  value={shippingData.city}
                  onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                  className="h-12 bg-white/5 border-white/10 text-white rounded-none focus:border-[#D4AF37]"
                />
                <select
                  value={shippingData.state}
                  onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                  className="h-12 px-4 bg-white/5 border border-white/10 text-white rounded-none focus:border-[#D4AF37] outline-none appearance-none cursor-pointer"
                >
                  <option value="" className="bg-[#1A1A1A]">Select State *</option>
                  {indianStates.map((s) => (
                    <option key={s} value={s} className="bg-[#1A1A1A]">{s}</option>
                  ))}
                </select>
                <Input
                  placeholder="PIN Code *"
                  value={shippingData.pincode}
                  onChange={(e) => setShippingData({ ...shippingData, pincode: e.target.value })}
                  className="h-12 bg-white/5 border-white/10 text-white rounded-none focus:border-[#D4AF37]"
                />
              </div>

              <h3 className="text-white font-medium mb-4">Delivery Option</h3>
              <div className="space-y-3 mb-8">
                {[
                  { id: 'standard', label: 'Standard Delivery', desc: '5-7 business days', price: 0 },
                  { id: 'express', label: 'Express Delivery', desc: '2-3 business days', price: 149 },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setShippingData({ ...shippingData, delivery: opt.id })}
                    className={`w-full flex items-center justify-between p-4 border transition-all ${
                      shippingData.delivery === opt.id
                        ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <Truck size={20} className={shippingData.delivery === opt.id ? 'text-[#D4AF37]' : 'text-[#666]'} />
                      <div className="text-left">
                        <p className="text-sm text-white font-medium">{opt.label}</p>
                        <p className="text-xs text-[#A0A0A0]">{opt.desc}</p>
                      </div>
                    </div>
                    <span className="text-sm font-['JetBrains_Mono'] text-[#D4AF37]">
                      {opt.price === 0 ? 'FREE' : formatPrice(opt.price)}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!isShippingValid}
                  className="h-12 bg-gradient-to-r from-[#D4AF37] to-[#E8D44D] text-[#0A0A0A] font-semibold px-8 rounded-none hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] disabled:opacity-40"
                >
                  Continue to Payment
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Payment */}
          {currentStep === 2 && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="font-['Playfair_Display'] text-2xl text-white mb-6">Payment Method</h2>

              <div className="space-y-3 mb-8">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full flex items-center gap-4 p-4 border transition-all ${
                      paymentMethod === method.id
                        ? 'border-[#D4AF37] bg-[#D4AF37]/5'
                        : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <method.icon
                      size={22}
                      className={paymentMethod === method.id ? 'text-[#D4AF37]' : 'text-[#666]'}
                    />
                    <div className="text-left flex-1">
                      <p className="text-sm text-white font-medium">{method.label}</p>
                      <p className="text-xs text-[#A0A0A0]">{method.desc}</p>
                    </div>
                    <div
                      className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                        paymentMethod === method.id ? 'border-[#D4AF37]' : 'border-white/30'
                      }`}
                    >
                      {paymentMethod === method.id && <div className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>

              {paymentMethod === 'card' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-white/[0.03] border border-white/[0.08] p-5 mb-8 space-y-4"
                >
                  <Input
                    placeholder="Card Number"
                    value={cardData.number}
                    onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                    className="h-12 bg-white/5 border-white/10 text-white rounded-none focus:border-[#D4AF37]"
                    maxLength={16}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="MM / YY"
                      value={cardData.expiry}
                      onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                      className="h-12 bg-white/5 border-white/10 text-white rounded-none focus:border-[#D4AF37]"
                      maxLength={5}
                    />
                    <Input
                      placeholder="CVV"
                      type="password"
                      value={cardData.cvv}
                      onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                      className="h-12 bg-white/5 border-white/10 text-white rounded-none focus:border-[#D4AF37]"
                      maxLength={3}
                    />
                  </div>
                </motion.div>
              )}

              <div className="flex items-center justify-between">
                <button onClick={() => setCurrentStep(1)} className="text-[#A0A0A0] hover:text-[#D4AF37] text-sm">
                  ← Back to Shipping
                </button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  className="h-12 bg-gradient-to-r from-[#D4AF37] to-[#E8D44D] text-[#0A0A0A] font-semibold px-8 rounded-none hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                >
                  Review Order
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="font-['Playfair_Display'] text-2xl text-white mb-6">Review Your Order</h2>

              {/* Items */}
              <div className="bg-white/[0.03] border border-white/[0.08] p-5 mb-6">
                <h3 className="text-white font-medium mb-4">Items</h3>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-4">
                      <img src={item.image} alt={item.productName} className="w-16 h-16 object-contain bg-[#111]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{item.productName}</p>
                        <p className="text-xs text-[#A0A0A0]">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm text-[#D4AF37] font-['JetBrains_Mono']">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white/[0.03] border border-white/[0.08] p-5 mb-6">
                <h3 className="text-white font-medium mb-3">Shipping Address</h3>
                <p className="text-sm text-[#A0A0A0]">
                  {shippingData.fullName}<br />
                  {shippingData.address1}<br />
                  {shippingData.address2 && <>{shippingData.address2}<br /></>}
                  {shippingData.city}, {shippingData.state} — {shippingData.pincode}<br />
                  Phone: {shippingData.phone}
                </p>
              </div>

              {/* Payment */}
              <div className="bg-white/[0.03] border border-white/[0.08] p-5 mb-6">
                <h3 className="text-white font-medium mb-3">Payment Method</h3>
                <p className="text-sm text-[#A0A0A0] capitalize">
                  {paymentMethods.find((m) => m.id === paymentMethod)?.label}
                </p>
              </div>

              {/* Totals */}
              <div className="bg-white/[0.03] border border-white/[0.08] p-5 mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[#A0A0A0]">
                    <span>Subtotal</span>
                    <span className="text-white font-['JetBrains_Mono']">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#A0A0A0]">
                    <span>Shipping</span>
                    <span className="text-white font-['JetBrains_Mono']">
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
                  <div className="border-t border-white/10 pt-2 flex justify-between">
                    <span className="text-white font-semibold">Grand Total</span>
                    <span className="text-[#D4AF37] font-['JetBrains_Mono'] text-lg font-bold">
                      {formatPrice(totalWithShipping)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3 mb-8">
                <Checkbox
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  className="mt-0.5 border-white/30 data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                />
                <label className="text-sm text-[#A0A0A0] cursor-pointer">
                  I agree to the{' '}
                  <span className="text-[#D4AF37]">Terms of Service</span> and{' '}
                  <span className="text-[#D4AF37]">Privacy Policy</span>. I understand that this order will be processed with GST invoicing.
                </label>
              </div>

              <div className="flex items-center justify-between">
                <button onClick={() => setCurrentStep(2)} className="text-[#A0A0A0] hover:text-[#D4AF37] text-sm">
                  ← Back to Payment
                </button>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={!termsAccepted}
                  className="h-14 bg-gradient-to-r from-[#D4AF37] to-[#E8D44D] text-[#0A0A0A] font-semibold text-sm uppercase tracking-[0.05em] px-10 rounded-none hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] disabled:opacity-40"
                >
                  <ShieldCheck size={18} className="mr-2" />
                  Place Order — {formatPrice(totalWithShipping)}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 mt-4 text-[#666] text-xs">
                <img src="/assets/logo.png" alt="" className="h-4 opacity-50" />
                <span>Secured by Razorpay</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
