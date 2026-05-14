import { useParams, Link } from 'react-router-dom';
import { mockOrders } from '@/data/orders';
import { Package, Truck, Home, CheckCircle2, Clock, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusSteps = [
  { key: 'placed', label: 'Order Placed', icon: Package, desc: 'Your order has been received' },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2, desc: 'Payment confirmed, preparing shipment' },
  { key: 'shipped', label: 'Shipped', icon: Truck, desc: 'Your order is on the way' },
  { key: 'delivered', label: 'Delivered', icon: Home, desc: 'Package delivered successfully' },
];

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();
  const order = mockOrders.find(
    (o) => o.id === id || o.trackingId === id
  ) || mockOrders[0];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-[100dvh] pt-[72px] bg-[#0A0A0A]">
      <div className="container-sword py-12 max-w-[800px]">
        <Link to="/account" className="flex items-center gap-2 text-[#A0A0A0] hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} />
          Back to Account
        </Link>

        <div className="glass-panel p-6 md:p-8 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-label text-[#A0A0A0] mb-1">TRACKING NUMBER</p>
              <p className="text-data-sm font-mono text-[#D4AF37]">{order.trackingId}</p>
            </div>
            <div className="text-right">
              <p className="text-label text-[#A0A0A0] mb-1">ORDER DATE</p>
              <p className="text-[0.875rem] text-white">{new Date(order.placedAt).toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="relative">
            <div className="absolute top-6 left-0 right-0 h-[2px] bg-[#1A1A1A]" />
            <div
              className="absolute top-6 left-0 h-[2px] bg-[#D4AF37] transition-all duration-500"
              style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
            />
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => {
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;
                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-12 h-12 flex items-center justify-center border-2 z-10 bg-[#0A0A0A] transition-colors',
                        isActive
                          ? 'border-[#D4AF37] text-[#D4AF37]'
                          : 'border-[#333333] text-[#666666]',
                        isCurrent && 'ring-2 ring-[#D4AF37] ring-offset-2 ring-offset-[#0A0A0A]'
                      )}
                    >
                      <step.icon size={20} />
                    </div>
                    <p className={cn(
                      'text-[0.75rem] font-medium mt-2 uppercase tracking-[0.03em]',
                      isActive ? 'text-white' : 'text-[#666666]'
                    )}>
                      {step.label}
                    </p>
                    <p className="text-[0.65rem] text-[#666666] mt-0.5 max-w-[80px] text-center hidden sm:block">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="glass-panel p-6">
          <h3 className="text-label text-white mb-4">ORDER DETAILS</h3>
          <div className="space-y-3 mb-6">
            {order.items.map((item) => (
              <div key={item.productId} className="flex justify-between text-[0.875rem]">
                <span className="text-white">{item.productName} x{item.quantity}</span>
                <span className="text-[#A0A0A0] font-mono">₹{item.price.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[rgba(255,255,255,0.06)] pt-4 space-y-2">
            <div className="flex justify-between text-[0.875rem]">
              <span className="text-[#A0A0A0]">Subtotal</span>
              <span className="text-white font-mono">₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-[0.875rem]">
              <span className="text-[#A0A0A0]">GST (18%)</span>
              <span className="text-white font-mono">₹{(order.cgst + order.sgst).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[1rem] font-medium pt-2">
              <span className="text-white">Grand Total</span>
              <span className="text-[#D4AF37] font-mono">₹{order.grandTotal.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-6 flex items-center gap-2 text-[0.75rem] text-[#A0A0A0]">
            <Clock size={14} />
            <span>Estimated delivery by {new Date(order.estimatedDelivery).toLocaleDateString('en-IN')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
