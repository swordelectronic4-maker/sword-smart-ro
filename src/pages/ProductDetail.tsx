import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '@/data/products';
import { reviews } from '@/data/reviews';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Heart, Star, Shield, Calendar, Truck, ChevronRight, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');
  const [selectedEmi, setSelectedEmi] = useState(12);

  const product = products.find((p) => p.id === id) || products[0];

  const emiOptions = [
    { months: 3, amount: 15847 },
    { months: 6, amount: 8050 },
    { months: 9, amount: 5444 },
    { months: 12, amount: 4278 },
  ];

  return (
    <div className="min-h-[100dvh] pt-[72px] bg-[#0A0A0A]">
      <div className="container-sword py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[0.75rem] text-[#666666] mb-8">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-white transition-colors">Shop</Link>
          <ChevronRight size={12} />
          <span className="text-[#A0A0A0]">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Image */}
          <div className="bg-[#111111] flex items-center justify-center p-12 min-h-[400px] lg:min-h-[500px]">
            <img
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-[400px] object-contain animate-float"
            />
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star size={16} className="fill-[#D4AF37] text-[#D4AF37]" />
              <span className="text-[0.875rem] text-white">{product.rating}</span>
              <span className="text-[0.875rem] text-[#666666]">({product.reviews} reviews)</span>
            </div>
            <h1 className="text-display-md font-display text-white mb-3">{product.name}</h1>
            <p className="text-[#A0A0A0] mb-6 leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-4 mb-6">
              <span className="text-data-lg font-mono text-[#D4AF37]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              <span className="text-[1rem] text-[#666666] line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <p className="text-[0.75rem] text-[#666666] mb-6">Inclusive of all taxes (GST 18%)</p>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-label text-[#A0A0A0]">Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center border border-[rgba(255,255,255,0.2)] text-[#A0A0A0] hover:text-white transition-colors"
                >
                  <Minus size={14} />
                </button>
                <span className="text-white w-6 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center border border-[rgba(255,255,255,0.2)] text-[#A0A0A0] hover:text-white transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() =>
                  addToCart({
                    productId: product.id,
                    productName: product.name,
                    price: product.price,
                    image: product.image,
                    quantity,
                  })
                }
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                Add to Cart
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={cn(
                  'w-[52px] h-[52px] flex items-center justify-center border transition-colors',
                  isInWishlist(product.id)
                    ? 'border-[#E63946] text-[#E63946]'
                    : 'border-[rgba(255,255,255,0.2)] text-[#A0A0A0] hover:text-white'
                )}
              >
                <Heart size={20} className={isInWishlist(product.id) ? 'fill-current' : ''} />
              </button>
            </div>

            {/* EMI Calculator */}
            <div className="glass-panel p-5 mb-6">
              <p className="text-[0.875rem] text-[#A0A0A0] mb-1">Easy EMIs starting at</p>
              <p className="text-data-md font-mono text-white mb-1">
                ₹{emiOptions.find((e) => e.months === selectedEmi)?.amount.toLocaleString('en-IN')}/month
              </p>
              <p className="text-[0.75rem] text-[#A0A0A0] mb-3">for {selectedEmi} months</p>
              <div className="flex gap-2">
                {emiOptions.map((emi) => (
                  <button
                    key={emi.months}
                    onClick={() => setSelectedEmi(emi.months)}
                    className={cn(
                      'px-3 py-1.5 text-[0.75rem] border transition-all rounded-full',
                      selectedEmi === emi.months
                        ? 'border-[#D4AF37] text-[#D4AF37]'
                        : 'border-[rgba(255,255,255,0.15)] text-[#A0A0A0] hover:border-[#D4AF37]'
                    )}
                  >
                    {emi.months}M
                  </button>
                ))}
              </div>
              <p className="text-[0.7rem] text-[#666666] mt-2">Powered by Razorpay</p>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-4">
              {[
                { icon: Shield, text: 'BIS Certified' },
                { icon: Calendar, text: '2-Year Warranty' },
                { icon: Truck, text: 'Free Installation' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-[0.75rem] text-[#A0A0A0]">
                  <Icon size={16} className="text-[#D4AF37]" />
                  {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[rgba(255,255,255,0.06)] mb-8">
          <div className="flex gap-8">
            {(['specs', 'reviews'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'pb-3 text-[0.875rem] font-medium uppercase tracking-[0.05em] transition-colors border-b-2',
                  activeTab === tab
                    ? 'text-[#D4AF37] border-[#D4AF37]'
                    : 'text-[#A0A0A0] border-transparent hover:text-white'
                )}
              >
                {tab === 'specs' ? 'Specifications' : 'Reviews'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'specs' && (
          <div className="glass-panel p-6 max-w-[800px]">
            <div className="divide-y divide-[rgba(255,255,255,0.06)]">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex py-3">
                  <span className="w-1/2 text-[0.875rem] font-medium text-[#A0A0A0]">{key}</span>
                  <span className="w-1/2 text-[0.875rem] text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((review) => (
              <div key={review.id} className="glass-panel p-6">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={i < review.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-[#333333]'}
                    />
                  ))}
                </div>
                <p className="text-[0.875rem] text-white mb-4 leading-relaxed">&ldquo;{review.text}&rdquo;</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.875rem] font-medium text-white">{review.name}</p>
                    <p className="text-data-sm text-[#666666]">{review.location}</p>
                  </div>
                  {review.verified && (
                    <span className="text-[0.65rem] text-[#2EC4B6] border border-[#2EC4B6] px-2 py-0.5">
                      VERIFIED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
