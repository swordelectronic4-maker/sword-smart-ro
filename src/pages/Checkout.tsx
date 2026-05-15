import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  ChevronRight,
  CreditCard,
  Wallet,
  Truck,
  ShieldCheck,
  Building2,
  Smartphone,
  Banknote,
  Loader2,
  Package,
  CalendarClock,
  MapPin,
  ArrowLeft,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { initiatePayment, isRazorpayConfigured, convertToPaise } from '@/services/paymentService';
import { addOrder } from '@/services/dataStore';
import type { LiveOrder } from '@/services/dataStore';
import { trackPurchase } from '@/services/analyticsService';
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

function formatDate(date: Date) {
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
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

const COD_CHARGE = 49;

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, cgst, sgst, shipping, grandTotal, clearCart } = useCart();
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [orderSaved, setOrderSaved] = useState(false);

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [mockPaymentStep, setMockPaymentStep] = useState<'idle' | 'processing' | 'success'>('idle');

  const isCod = paymentMethod === 'cod';
  const finalTotal = grandTotal + (isCod ? COD_CHARGE : 0);

  const isShippingValid =
    shippingData.email && shippingData.fullName && shippingData.phone &&
    shippingData.address1 && shippingData.city && shippingData.state && shippingData.pincode;

  // Delivery date estimate: 5-7 business days from now
  const getDeliveryEstimate = () => {
    const minDays = shippingData.delivery === 'express' ? 3 : 5;
    const maxDays = shippingData.delivery === 'express' ? 5 : 7;
    const minDate = new Date();
    const maxDate = new Date();
    minDate.setDate(minDate.getDate() + minDays);
    maxDate.setDate(maxDate.getDate() + maxDays);
    return { minDate, maxDate, minDays, maxDays };
  };

  const deliveryEstimate = getDeliveryEstimate();

  const generateOrderId = () => `SWORD-${Date.now().toString(36).toUpperCase()}`;

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    setPaymentError('');
    setMockPaymentStep('idle');

    const id = generateOrderId();
    const razorpayConfigured = isRazorpayConfigured();

    try {
      if (!razorpayConfigured) {
        // Show mock payment loader
        setMockPaymentStep('processing');
        await new Promise((resolve) => setTimeout(resolve, 2500));
        setMockPaymentStep('success');
      }

      // Initiate Razorpay payment (or demo mode)
      const result = await initiatePayment({
        amount: convertToPaise(finalTotal),
        currency: 'INR',
        name: 'SWORD Smart RO',
        description: `Order ${id} - SWORD Smart Water`,
        prefill: {
          name: shippingData.fullName,
          email: shippingData.email,
          contact: shippingData.phone,
        },
        notes: {
          order_id: id,
          customer: shippingData.fullName,
          payment_method: paymentMethod,
        },
        theme: {
          color: '#D4AF37',
        },
      });

      if (result.success) {
        // Build and save order to dataStore
        const order: LiveOrder = {
          id,
          orderNumber: id,
          customer: shippingData.fullName,
          customerName: shippingData.fullName,
          customerPhone: shippingData.phone,
          customerEmail: shippingData.email,
          email: shippingData.email,
          phone: shippingData.phone,
          address: [shippingData.address1, shippingData.address2].filter(Boolean).join(', '),
          city: shippingData.city,
          state: shippingData.state,
          pincode: shippingData.pincode,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            image: item.image,
            price: item.price,
            quantity: item.quantity,
          })),
          status: 'Pending',
          paymentStatus: isCod ? 'Pending' : 'Paid',
          paymentMethod: paymentMethod,
          subtotal,
          total: finalTotal,
          cgst,
          sgst,
          shipping,
          grandTotal: finalTotal,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          notes: isCod ? `COD order. COD charge: ${COD_CHARGE}` : undefined,
        };

        try {
          addOrder(order);
          setOrderSaved(true);
        } catch (e) {
          console.error('Failed to save order:', e);
        }

        setOrderId(id);
        setOrderPlaced(true);
        trackPurchase(id, finalTotal);
        clearCart();
      } else {
        setPaymentError(result.error || 'Payment failed. Please try again.');
        setMockPaymentStep('idle');
      }
    } catch (err: any) {
      setPaymentError(err.message || 'An unexpected error occurred.');
      setMockPaymentStep('idle');
    } finally {
      setIsProcessing(false);
    }
  };

  // ═══════════════════════════════════════════════
  // ORDER CONFIRMATION SCREEN
  // ═══════════════════════════════════════════════
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] pt-[72px] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg w-full"
        >
          {/* Success Checkmark */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E8D44D] flex items-center justify-center mx-auto mb-6"
          >
            <Check size={40} className="text-[#0A0A0A]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="font-['Playfair_Display'] text-3xl text-white mb-3"
          >
            Order Placed Successfully
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-[#A0A0A0] mb-2"
          >
            Thank you for choosing SWORD Smart Water.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[#D4AF37] font-['JetBrains_Mono'] text-lg font-semibold mb-6"
          >
            {orderId}
          </motion.p>

          {/* Order Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/[0.03] border border-white/[0.08] p-5 mb-6 text-left space-y-3"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <Package size={18} className="text-[#D4AF37]" />
              <span className="text-white font-medium text-sm">Order Summary</span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#A0A0A0] text-sm">Estimated Delivery</span>
              <span className="text-white text-sm font-medium">
                {formatDate(deliveryEstimate.minDate)} — {formatDate(deliveryEstimate.maxDate)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#A0A0A0] text-sm">Payment Method</span>
              <span className="text-white text-sm font-medium capitalize">
                {paymentMethods.find((m) => m.id === paymentMethod)?.label || paymentMethod}
              </span>
            </div>

            {isCod && (
              <div className="flex justify-between">
                <span className="text-[#A0A0A0] text-sm">COD Charges</span>
                <span className="text-[#D4AF37] text-sm font-medium">{formatPrice(COD_CHARGE)}</span>
              </div>
            )}

            <div className="flex justify-between border-t border-white/10 pt-3">
              <span className="text-white font-semibold text-sm">Grand Total</span>
              <span className="text-[#D4AF37] font-['JetBrains_Mono'] text-lg font-bold">
                {formatPrice(finalTotal)}
              </span>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex gap-3 justify-center"
          >
            <Button
              onClick={() => navigate(`/track/${orderId}`)}
              className="bg-gradient-to-r from-[#D4AF37] to-[#E8D44D] text-[#0A0A0A] font-semibold px-6 h-12 rounded-none hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
            >
              Track Order
            </Button>
            <Button
              onClick={() => navigate('/shop')}
              variant="outline"
              className="border-white/20 text-white h-12 px-6 rounded-none hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              Continue Shopping
            </Button>
          </motion.div>

          {/* Referral Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 pt-6 border-t border-white/10"
          >
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
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // MOCK PAYMENT LOADING SCREEN
  // ═══════════════════════════════════════════════
  if (mockPaymentStep === 'processing') {
    return (
      <div className="min-h-screen bg-[#0A0A0A] pt-[72px] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center max-w-sm"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="w-16 h-16 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full mx-auto mb-6"
          />
          <h2 className="font-['Playfair_Display'] text-xl text-white mb-2">Processing Payment</h2>
          <p className="text-[#A0A0A0] text-sm mb-4">
            Demo Mode — Simulating secure payment gateway...
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-[#666]">
            <ShieldCheck size={14} className="text-[#D4AF37]" />
            <span>Secured by Razorpay (Demo)</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // MAIN CHECKOUT UI
  // ═══════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-[72px]">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, i) => {
            const isCompleted = i < currentStep;
            const isActive = i === currentStep - 1;
            const isUpcoming = i > currentStep - 1;

            return (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  {/* Step circle */}
                  <motion.div
                    initial={false}
                    animate={
                      isCompleted || isActive
                        ? { scale: [1, 1.05, 1] }
                        : {}
                    }
                    transition={{ duration: 0.3 }}
                    className={`w-10 h-10 flex items-center justify-center border-2 text-sm font-semibold transition-all duration-300 ${
                      isCompleted
                        ? 'border-[#D4AF37] bg-[#D4AF37] text-[#0A0A0A]'
                        : isActive
                        ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.25)]'
                        : 'border-white/15 text-[#555] bg-white/[0.02]'
                    }`}
                  >
                    {isCompleted ? <Check size={18} /> : i + 1}
                  </motion.div>
                  {/* Step label */}
                  <span
                    className={`text-[0.6875rem] mt-2 font-medium transition-colors duration-300 ${
                      isCompleted || isActive ? 'text-[#D4AF37]' : 'text-[#555]'
                    }`}
                  >
                    {step}
                  </span>
                </div>

                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div
                    className={`w-16 sm:w-24 h-[2px] mx-2 sm:mx-3 transition-colors duration-500 ${
                      isCompleted ? 'bg-[#D4AF37]' : 'bg-white/10'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {/* ═══════════════════ STEP 1: SHIPPING ═══════════════════ */}
          {currentStep === 1 && (
            <motion.div
              key="shipping"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <MapPin size={24} className="text-[#D4AF37]" />
                <h2 className="font-['Playfair_Display'] text-2xl text-white">Shipping Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                <Input
                  placeholder="Email Address *"
                  type="email"
                  value={shippingData.email}
                  onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                  className="h-12 bg-white/5 border-white/10 text-white rounded-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30"
                />
                <Input
                  placeholder="Full Name *"
                  value={shippingData.fullName}
                  onChange={(e) => setShippingData({ ...shippingData, fullName: e.target.value })}
                  className="h-12 bg-white/5 border-white/10 text-white rounded-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30"
                />
                <Input
                  placeholder="Phone Number *"
                  value={shippingData.phone}
                  onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                  className="h-12 bg-white/5 border-white/10 text-white rounded-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30"
                />
                <Input
                  placeholder="Address Line 1 *"
                  value={shippingData.address1}
                  onChange={(e) => setShippingData({ ...shippingData, address1: e.target.value })}
                  className="h-12 bg-white/5 border-white/10 text-white rounded-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30"
                />
                <Input
                  placeholder="Address Line 2"
                  value={shippingData.address2}
                  onChange={(e) => setShippingData({ ...shippingData, address2: e.target.value })}
                  className="h-12 bg-white/5 border-white/10 text-white rounded-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30"
                />
                <Input
                  placeholder="City *"
                  value={shippingData.city}
                  onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                  className="h-12 bg-white/5 border-white/10 text-white rounded-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30"
                />
                <select
                  value={shippingData.state}
                  onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                  className="h-12 px-4 bg-white/5 border border-white/10 text-white rounded-none focus:border-[#D4AF37] outline-none appearance-none cursor-pointer focus:ring-1 focus:ring-[#D4AF37]/30"
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
                  className="h-12 bg-white/5 border-white/10 text-white rounded-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30"
                />
              </div>

              {/* Delivery estimate notice */}
              <div className="flex items-center gap-2 mb-4 text-sm text-[#A0A0A0]">
                <CalendarClock size={16} className="text-[#D4AF37]" />
                <span>
                  Estimated delivery:{" "}
                  <strong className="text-white">
                    {deliveryEstimate.minDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} — {deliveryEstimate.maxDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                  </strong>{" "}
                  ({deliveryEstimate.minDays}-{deliveryEstimate.maxDays} business days)
                </span>
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
                    className={`w-full flex items-center justify-between p-4 border transition-all duration-200 ${
                      shippingData.delivery === opt.id
                        ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
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
                  className="h-12 bg-gradient-to-r from-[#D4AF37] to-[#E8D44D] text-[#0A0A0A] font-semibold px-8 rounded-none hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] disabled:opacity-40 transition-all"
                >
                  Continue to Payment
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════ STEP 2: PAYMENT ═══════════════════ */}
          {currentStep === 2 && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-['Playfair_Display'] text-2xl text-white mb-6">Payment Method</h2>

              <div className="space-y-3 mb-8">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full flex items-center gap-4 p-4 border transition-all duration-200 ${
                      paymentMethod === method.id
                        ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
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
                      className={`w-5 h-5 border-2 rounded-full flex items-center justify-center transition-colors ${
                        paymentMethod === method.id ? 'border-[#D4AF37]' : 'border-white/30'
                      }`}
                    >
                      {paymentMethod === method.id && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-2.5 h-2.5 bg-[#D4AF37] rounded-full"
                        />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {/* COD Notice */}
              {isCod && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 p-4 mb-8"
                >
                  <p className="text-[#D4AF37] text-sm">
                    <Banknote size={16} className="inline mr-2" />
                    A COD charge of <strong>{formatPrice(COD_CHARGE)}</strong> will be collected at delivery.
                    Your new total is <strong>{formatPrice(finalTotal)}</strong>.
                  </p>
                </motion.div>
              )}

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
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-1 text-[#A0A0A0] hover:text-[#D4AF37] text-sm transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to Shipping
                </button>
                <Button
                  onClick={() => setCurrentStep(3)}
                  className="h-12 bg-gradient-to-r from-[#D4AF37] to-[#E8D44D] text-[#0A0A0A] font-semibold px-8 rounded-none hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all"
                >
                  Review Order
                  <ChevronRight size={16} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* ═══════════════════ STEP 3: REVIEW ═══════════════════ */}
          {currentStep === 3 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
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
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <MapPin size={16} className="text-[#D4AF37]" />
                  Shipping Address
                </h3>
                <p className="text-sm text-[#A0A0A0]">
                  {shippingData.fullName}<br />
                  {shippingData.address1}<br />
                  {shippingData.address2 && <>{shippingData.address2}<br /></>}
                  {shippingData.city}, {shippingData.state} — {shippingData.pincode}<br />
                  Phone: {shippingData.phone}
                </p>
                <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-sm text-[#A0A0A0]">
                  <CalendarClock size={14} className="text-[#D4AF37]" />
                  Estimated delivery:{" "}
                  <span className="text-white">
                    {deliveryEstimate.minDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} — {deliveryEstimate.maxDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })}
                  </span>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white/[0.03] border border-white/[0.08] p-5 mb-6">
                <h3 className="text-white font-medium mb-3">Payment Method</h3>
                <p className="text-sm text-[#A0A0A0] capitalize">
                  {paymentMethods.find((m) => m.id === paymentMethod)?.label}
                </p>
                {isCod && (
                  <p className="text-xs text-[#D4AF37] mt-2">
                    COD charges of {formatPrice(COD_CHARGE)} will be collected at delivery.
                  </p>
                )}
              </div>

              {/* Totals with GST breakdown */}
              <div className="bg-white/[0.03] border border-white/[0.08] p-5 mb-6">
                <h3 className="text-white font-medium mb-4">Order Total</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-[#A0A0A0]">
                    <span>Subtotal (before tax)</span>
                    <span className="text-white font-['JetBrains_Mono']">{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-[#A0A0A0]">
                    <span>CGST (9%)</span>
                    <span className="text-white font-['JetBrains_Mono']">{formatPrice(cgst)}</span>
                  </div>

                  <div className="flex justify-between text-[#A0A0A0]">
                    <span>SGST (9%)</span>
                    <span className="text-white font-['JetBrains_Mono']">{formatPrice(sgst)}</span>
                  </div>

                  <div className="flex justify-between text-[#A0A0A0]">
                    <span>Shipping</span>
                    <span className="text-white font-['JetBrains_Mono']">
                      {shipping === 0 ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>

                  {isCod && (
                    <div className="flex justify-between text-[#A0A0A0]">
                      <span>COD Charges</span>
                      <span className="text-[#D4AF37] font-['JetBrains_Mono']">{formatPrice(COD_CHARGE)}</span>
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="text-white font-semibold">Grand Total</span>
                    <span className="text-[#D4AF37] font-['JetBrains_Mono'] text-xl font-bold">
                      {formatPrice(finalTotal)}
                    </span>
                  </div>

                  <p className="text-xs text-[#555] pt-1">
                    Inclusive of all taxes. GST No: 24ABCPJ1234Z1Z5
                  </p>
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

              {/* Demo Mode Notice */}
              {!isRazorpayConfigured() && (
                <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 p-4 mb-4 text-center">
                  <p className="text-[#D4AF37] text-xs flex items-center justify-center gap-2">
                    <ShieldCheck size={14} />
                    Payment Gateway: Demo Mode — No real charges will be made.
                    Add your Razorpay API keys to go live.
                  </p>
                </div>
              )}

              {paymentError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-500/10 border border-red-500/20 p-3 mb-4 text-center"
                >
                  <p className="text-red-400 text-sm">{paymentError}</p>
                </motion.div>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-1 text-[#A0A0A0] hover:text-[#D4AF37] text-sm transition-colors"
                >
                  <ArrowLeft size={14} />
                  Back to Payment
                </button>
                <Button
                  onClick={handlePlaceOrder}
                  disabled={!termsAccepted || isProcessing}
                  className="h-14 bg-gradient-to-r from-[#D4AF37] to-[#E8D44D] text-[#0A0A0A] font-semibold text-sm uppercase tracking-[0.05em] px-10 rounded-none hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] disabled:opacity-40 transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 size={18} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} className="mr-2" />
                      {isCod ? 'Place Order' : `Pay ${formatPrice(finalTotal)}`}
                    </>
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 mt-4 text-[#666] text-xs">
                <ShieldCheck size={12} />
                <span>Secured by Razorpay</span>
                {!isRazorpayConfigured() && <span className="text-[#D4AF37]">(Demo Mode)</span>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
