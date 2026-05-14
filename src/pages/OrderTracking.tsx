import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockOrders } from '@/data/orders';
import { motion } from 'framer-motion';
import {
  Package, CheckCircle2, CreditCard, Truck, MapPin,
  ArrowLeft, Download, Headphones, Clock, ChevronRight,
  Phone, Mail, Share2, Search, AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* ────── timeline steps (7 total) ────── */
const timelineSteps = [
  { key: 'placed', label: 'Order Placed', desc: 'Your order has been confirmed', icon: Package },
  { key: 'confirmed', label: 'Payment Confirmed', desc: 'Payment received successfully', icon: CreditCard },
  { key: 'processing', label: 'Processing', desc: 'Your order is being prepared', icon: Package },
  { key: 'shipped', label: 'Shipped', desc: 'Handed over to courier', icon: Truck },
  { key: 'in_transit', label: 'In Transit', desc: 'Package is on the way', icon: Truck },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Courier is nearby', icon: MapPin },
  { key: 'delivered', label: 'Delivered', desc: 'Package delivered', icon: CheckCircle2 },
];

/* map order.status to the timeline step index it completes */
const statusToStepIndex: Record<string, number> = {
  placed: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  in_transit: 4,
  out_for_delivery: 5,
  delivered: 6,
};

/* mock timestamps for each step (relative offsets from placedAt) */
function getStepTimestamps(order: typeof mockOrders[0]) {
  const base = new Date(order.placedAt).getTime();
  return [
    { date: new Date(base), completed: true }, // placed
    { date: new Date(base + 60_000), completed: statusToStepIndex[order.status] >= 1 },
    { date: new Date(base + 6 * 60 * 60_000), completed: statusToStepIndex[order.status] >= 2 },
    { date: new Date(base + 24 * 60 * 60_000), completed: statusToStepIndex[order.status] >= 3 },
    { date: new Date(base + 48 * 60 * 60_000), completed: statusToStepIndex[order.status] >= 4 },
    { date: statusToStepIndex[order.status] >= 5 ? new Date(base + 72 * 60 * 60_000) : undefined, completed: statusToStepIndex[order.status] >= 5 },
    { date: order.status === 'delivered' ? new Date(base + 80 * 60 * 60_000) : undefined, completed: order.status === 'delivered' },
  ];
}

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  placed: { color: 'text-[#E8A838]', bg: 'bg-[#E8A838]/10', label: 'Placed' },
  confirmed: { color: 'text-[#00B4D8]', bg: 'bg-[#00B4D8]/10', label: 'Processing' },
  shipped: { color: 'text-[#7B61FF]', bg: 'bg-[#7B61FF]/10', label: 'Shipped' },
  delivered: { color: 'text-[#2EC4B6]', bg: 'bg-[#2EC4B6]/10', label: 'Delivered' },
  cancelled: { color: 'text-[#E63946]', bg: 'bg-[#E63946]/10', label: 'Cancelled' },
};

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');
  const [searchError, setSearchError] = useState('');

  const order = mockOrders.find((o) => o.id === id || o.trackingId === id);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const found = mockOrders.find((o) => o.id.toLowerCase() === searchId.toLowerCase() || o.trackingId.toLowerCase() === searchId.toLowerCase());
    if (found) {
      setSearchError('');
      navigate(`/track/${found.id}`);
    } else {
      setSearchError('We couldn\'t find an order with those details. Please check and try again.');
    }
  };

  /* ───────── Search State (no order found) ───────── */
  if (!order) {
    return (
      <div className="min-h-[100dvh] pt-[72px] bg-[#0A0A0A] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-[480px] w-full text-center"
        >
          <div className="w-16 h-16 mx-auto mb-6 bg-[rgba(212,175,55,0.1)] flex items-center justify-center">
            <Search size={28} className="text-[#D4AF37]" />
          </div>
          <h1 className="text-display-md font-display text-white mb-2">Track Your Order</h1>
          <p className="text-[0.875rem] text-[#A0A0A0] mb-8">
            Enter your order ID to track your shipment status and delivery timeline.
          </p>

          <form onSubmit={handleSearch} className="space-y-4">
            <input
              type="text"
              value={searchId}
              onChange={(e) => { setSearchId(e.target.value); setSearchError(''); }}
              placeholder="ORD-2025-XXXXX"
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-white text-[0.875rem] p-4 placeholder-[#666666] focus:border-[#D4AF37] focus:outline-none text-center"
            />
            {searchError && (
              <div className="flex items-center gap-2 text-[#E63946] text-[0.8rem]">
                <AlertCircle size={14} />
                <span>{searchError}</span>
              </div>
            )}
            <button type="submit" className="btn-primary w-full inline-flex items-center justify-center gap-2">
              <Search size={14} /> Track Order
            </button>
          </form>

          <div className="mt-8 text-[0.75rem] text-[#666666]">
            <p>Try: ORD-2025-0001, ORD-2025-0042, or ORD-2025-0087</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const stepIndex = statusToStepIndex[order.status] ?? 0;
  const timestamps = getStepTimestamps(order);
  const s = statusConfig[order.status] || statusConfig.placed;

  return (
    <div className="min-h-[100dvh] pt-[72px] bg-[#0A0A0A]">
      <div className="container-sword py-8 md:py-12 max-w-[900px]">

        {/* ─────── Breadcrumb + Back ─────── */}
        <div className="mb-6">
          <Link
            to="/account"
            className="flex items-center gap-2 text-[0.75rem] text-[#A0A0A0] hover:text-white transition-colors w-fit mb-4"
          >
            <ArrowLeft size={14} /> Back to Account
          </Link>
          <p className="text-[0.75rem] text-[#666666]">
            <Link to="/" className="hover:text-[#D4AF37]">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-[#A0A0A0]">Track Order</span>
            <span className="mx-2">/</span>
            <span className="text-[#D4AF37]">{order.id}</span>
          </p>
        </div>

        {/* ─────── Order Status Header ─────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel p-5 md:p-6 mb-8"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <p className="text-[0.75rem] text-[#666666] mb-1">ORDER ID</p>
              <p className="text-data-sm font-mono text-[#D4AF37]">{order.id}</p>
              <p className="text-[0.75rem] text-[#A0A0A0] mt-1">
                Placed on {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
            <div className="text-right">
              <span className={cn('text-[0.75rem] font-medium uppercase tracking-[0.05em] px-3 py-1', s.bg, s.color)}>
                {s.label}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[0.75rem]">
            <div className="flex items-center gap-1.5 text-[#A0A0A0]">
              <Clock size={12} />
              <span>Expected by {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="text-[#666666]">|</div>
            <div className="flex items-center gap-1.5 text-[#A0A0A0]">
              <span>Carrier: </span>
              <span className="text-white">Blue Dart</span>
            </div>
            <div className="text-[#666666]">|</div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#A0A0A0]">AWB: </span>
              <span className="font-mono text-[#D4AF37] text-[0.7rem]">AWB{order.trackingId.split('-')[2]}BD</span>
            </div>
          </div>
        </motion.div>

        {/* ─────── Tracking Timeline ─────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-panel p-5 md:p-8 mb-8"
        >
          <h3 className="text-label text-white mb-8">Shipment Progress</h3>

          <div className="relative">
            {timelineSteps.map((step, i) => {
              const ts = timestamps[i];
              const isCompleted = ts?.completed ?? false;
              const isCurrent = i === stepIndex;
              const isUpcoming = i > stepIndex;

              return (
                <div key={step.key} className="relative flex gap-4 md:gap-6 mb-6 last:mb-0">
                  {/* Vertical connecting line */}
                  {i < timelineSteps.length - 1 && (
                    <div className="absolute left-[15px] md:left-[19px] top-[32px] w-[2px] h-[calc(100%+24px)]">
                      <div className={cn('w-full h-full', isCompleted ? 'bg-[#D4AF37]' : 'bg-[#1A1A1A]')} />
                    </div>
                  )}

                  {/* Icon Circle */}
                  <div
                    className={cn(
                      'relative z-10 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center flex-shrink-0 transition-all',
                      isCompleted
                        ? 'bg-[#D4AF37] text-[#0A0A0A]'
                        : isCurrent
                          ? 'bg-[#D4AF37] text-[#0A0A0A] ring-4 ring-[#D4AF37]/20'
                          : 'bg-[#1A1A1A] text-[#666666]'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 size={isCurrent ? 20 : 18} />
                    ) : (
                      <step.icon size={isCurrent ? 20 : 18} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-0.5">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <p className={cn(
                        'text-[0.85rem] md:text-[0.9rem] font-medium',
                        isUpcoming ? 'text-[#666666]' : 'text-white'
                      )}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <motion.span
                          animate={{ opacity: [1, 0.4, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-[0.6rem] text-[#D4AF37] font-medium uppercase tracking-wider"
                        >
                          Current
                        </motion.span>
                      )}
                    </div>
                    <p className={cn(
                      'text-[0.75rem]',
                      isUpcoming ? 'text-[#444444]' : 'text-[#A0A0A0]'
                    )}>
                      {isCurrent && step.key === 'shipped'
                        ? `Handed over to Blue Dart. AWB: AWB${order.trackingId.split('-')[2]}BD`
                        : step.desc}
                    </p>
                    {ts?.date && (
                      <p className="text-[0.7rem] text-[#666666] mt-0.5">
                        {ts.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        {' at '}
                        {ts.date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                    {!ts?.date && !isUpcoming && (
                      <p className="text-[0.7rem] text-[#666666] mt-0.5">
                        Expected {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ─────── Order Items ─────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-panel p-5 md:p-6 mb-6"
        >
          <h3 className="text-label text-white mb-4">Order Items</h3>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center gap-4 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0"
              >
                <div className="w-14 h-14 bg-[#111111] border border-[rgba(255,255,255,0.06)] flex items-center justify-center flex-shrink-0">
                  <Package size={20} className="text-[#666666]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.8rem] text-white font-medium truncate">{item.productName}</p>
                  <p className="text-[0.7rem] text-[#666666]">Qty: {item.quantity}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[0.8rem] font-mono text-white">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Totals */}
          <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)] space-y-2">
            <div className="flex justify-between text-[0.8rem]">
              <span className="text-[#A0A0A0]">Subtotal</span>
              <span className="text-white font-mono">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[0.8rem]">
              <span className="text-[#A0A0A0]">CGST (9%)</span>
              <span className="text-white font-mono">₹{order.cgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[0.8rem]">
              <span className="text-[#A0A0A0]">SGST (9%)</span>
              <span className="text-white font-mono">₹{order.sgst.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[0.8rem]">
              <span className="text-[#A0A0A0]">Shipping</span>
              <span className={order.shipping === 0 ? 'text-[#2EC4B6]' : 'text-white font-mono'}>
                {order.shipping === 0 ? 'FREE' : `₹${order.shipping}`}
              </span>
            </div>
            <div className="flex justify-between text-[0.9rem] font-medium pt-2 border-t border-[rgba(255,255,255,0.06)]">
              <span className="text-white">Grand Total</span>
              <span className="text-[#D4AF37] font-mono">₹{order.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* ─────── Shipping Address ─────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-5 md:p-6 mb-6"
        >
          <h3 className="text-label text-white mb-4">Shipping Address</h3>
          <div className="flex items-start gap-3">
            <MapPin size={16} className="text-[#D4AF37] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[0.85rem] text-white font-medium">Priyank Joshi</p>
              <p className="text-[0.8rem] text-[#A0A0A0] mt-0.5">{order.address}</p>
              <p className="text-[0.8rem] text-[#A0A0A0]">PIN: {order.pincode}</p>
              <p className="text-[0.8rem] text-[#A0A0A0] mt-1">+91 98765 43210</p>
            </div>
          </div>
        </motion.div>

        {/* ─────── Payment Info ─────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-panel p-5 md:p-6 mb-8"
        >
          <h3 className="text-label text-white mb-4">Payment Information</h3>
          <div className="flex items-center gap-3">
            <CreditCard size={16} className="text-[#D4AF37] flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[0.8rem] text-white">UPI</span>
                <span className="text-[0.65rem] px-1.5 py-0.5 bg-[#2EC4B6]/20 text-[#2EC4B6] font-medium">Paid</span>
              </div>
              <p className="text-[0.75rem] text-[#A0A0A0] mt-0.5">Transaction: pay_{order.id.split('-')[2]}XYZ</p>
            </div>
            <div className="ml-auto text-[0.85rem] font-mono text-[#D4AF37]">
              ₹{order.grandTotal.toFixed(2)}
            </div>
          </div>
        </motion.div>

        {/* ─────── Actions ─────── */}
        <div className="flex flex-wrap gap-3 mb-12">
          <button className="btn-secondary text-[0.75rem] inline-flex items-center gap-2">
            <Download size={14} /> Download Invoice
          </button>
          <button className="btn-secondary text-[0.75rem] inline-flex items-center gap-2">
            <Share2 size={14} /> Share Tracking
          </button>
        </div>

        {/* ─────── Support CTA ─────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-panel p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-14 h-14 bg-[rgba(212,175,55,0.1)] flex items-center justify-center flex-shrink-0">
              <Headphones size={24} className="text-[#D4AF37]" />
            </div>
            <div className="flex-1">
              <h3 className="text-display-md font-display text-white mb-1" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)' }}>
                Need Help with Your Order?
              </h3>
              <p className="text-[0.8rem] text-[#A0A0A0]">
                Our support team is available 24/7 to assist with any delivery issues.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/about"
                className="btn-primary text-[0.75rem] inline-flex items-center gap-2"
              >
                Contact Support
              </Link>
              <a href="tel:+919537797597" className="btn-secondary text-[0.75rem] inline-flex items-center gap-2">
                <Phone size={12} /> Call
              </a>
              <a href="mailto:support@swordhome.com" className="btn-secondary text-[0.75rem] inline-flex items-center gap-2">
                <Mail size={12} /> Email
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
