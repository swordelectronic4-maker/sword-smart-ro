import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Zap, Star, ChevronRight, Minus, Plus, Check, Shield, Truck, RotateCcw, Award, MapPin, BadgeCheck } from 'lucide-react';
import { getProductById, products as getProductList } from '@/data/products';
import { reviews } from '@/data/reviews';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

function calculateEMI(principal: number, months: number, annualRate: number = 15) {
  const r = annualRate / 12 / 100;
  const emi = (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  const total = emi * months;
  return { emi: Math.round(emi), total: Math.round(total), interest: Math.round(total - principal) };
}

const emiOptions = [3, 6, 9, 12];

const tabs = ['Description', 'Specifications', 'Reviews'] as const;

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const product = getProductById(id || '');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Description');
  const [showEMI, setShowEMI] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [imageError, setImageError] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] pt-[72px] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-['Playfair_Display'] text-3xl text-white mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/shop')} className="bg-[#D4AF37] text-[#0A0A0A]">
            Browse Products
          </Button>
        </div>
      </div>
    );
  }

  const wishlisted = isInWishlist(product.id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const allProducts = getProductList();
  const related = allProducts.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3);

  const productImages = [product.image];

  const productReviews = reviews.slice(0, 4);

  const stock = product.stock ?? 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-[72px]">
      {/* Breadcrumb */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-[#666]">
          <span className="cursor-pointer hover:text-[#D4AF37]" onClick={() => navigate('/')}>Home</span>
          <ChevronRight size={14} />
          <span className="cursor-pointer hover:text-[#D4AF37]" onClick={() => navigate('/shop')}>Shop</span>
          <ChevronRight size={14} />
          <span className="text-[#A0A0A0]">{product.category}</span>
          <ChevronRight size={14} />
          <span className="text-[#D4AF37]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-square bg-[#111] border border-white/[0.06] mb-4 overflow-hidden">
              <AnimatePresence mode="wait">
                {imageError ? (
                  <motion.div
                    key="placeholder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full h-full flex items-center justify-center bg-[#1A1A1A]"
                  >
                    <div className="w-32 h-32 rounded-full bg-[#D4AF37]/20 flex items-center justify-center">
                      <span className="text-5xl font-bold text-[#D4AF37] font-['Playfair_Display']">
                        {product.name.charAt(0)}
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.img
                    key={selectedImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-contain p-8"
                    onError={() => setImageError(true)}
                  />
                )}
              </AnimatePresence>
            </div>
            <div className="flex gap-3">
              {productImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 border-2 overflow-hidden transition-all duration-300 ${
                    selectedImage === i ? 'border-[#D4AF37]' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" onError={() => setImageError(true)} />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <p className="text-[0.75rem] text-[#D4AF37] uppercase tracking-[0.1em] font-medium mb-2">
              {product.category}
            </p>
            <h1 className="font-['Playfair_Display'] text-3xl md:text-4xl text-white mb-3">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={i < Math.floor(product.rating) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-white/20'}
                  />
                ))}
              </div>
              <span className="text-sm text-[#A0A0A0]">{product.rating} ({product.reviews} reviews)</span>
            </div>

            {/* Price Section */}
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-3xl font-semibold text-[#D4AF37] font-['JetBrains_Mono']">
                {formatPrice(product.price)}
              </span>
              <span className="text-lg text-[#666] line-through">{formatPrice(product.originalPrice)}</span>
              {discount > 0 && (
                <span className="text-sm bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-1">Save {discount}%</span>
              )}
            </div>

            {/* GST Note */}
            <p className="text-xs text-[#666] mb-3">Inclusive of all taxes (9% CGST + 9% SGST)</p>

            {/* Stock Display */}
            <div className="mb-4">
              {product.inStock ? (
                stock > 20 ? (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-[#2EC4B6]">
                    <Check size={16} /> In Stock &mdash; Ships within 24 hours
                  </span>
                ) : stock >= 5 ? (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-[#FF9F1C]">
                    <Check size={16} /> Only {stock} left &mdash; Order soon!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-sm font-medium text-[#E63946]">
                    <Check size={16} /> Almost gone! Only {stock} remaining
                  </span>
                )
              ) : (
                <span className="flex items-center gap-1 text-sm text-[#E63946] font-medium">
                  Out of Stock
                </span>
              )}
            </div>

            <p className="text-[#A0A0A0] leading-relaxed mb-6">{product.description}</p>

            {/* EMI Section - Enhanced */}
            <div className="bg-gradient-to-br from-[#D4AF37]/[0.06] to-transparent border border-[#D4AF37]/30 p-4 mb-6 rounded-sm">
              <button
                onClick={() => setShowEMI(!showEMI)}
                className="flex items-center justify-between w-full text-left"
              >
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-[#D4AF37]" />
                  <span className="text-sm text-white">
                    No Cost EMI starting at{' '}
                    <span className="text-[#D4AF37] font-['JetBrains_Mono'] font-semibold">
                      {formatPrice(calculateEMI(product.price, 12).emi)}/month
                    </span>
                  </span>
                </div>
                <span className="text-[#D4AF37] text-sm font-medium">{showEMI ? 'Hide' : 'View Plans'}</span>
              </button>

              <AnimatePresence>
                {showEMI && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-[#D4AF37]/20">
                      <p className="text-xs text-[#888] mb-3">EMI options at 15% p.a. | Choose a plan that works for you</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {emiOptions.map((months) => {
                          const { emi, total } = calculateEMI(product.price, months);
                          return (
                            <div
                              key={months}
                              className="bg-white/5 border border-[#D4AF37]/20 p-3 text-center hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/5 transition-all cursor-pointer rounded-sm"
                            >
                              <p className="text-[#D4AF37] font-['JetBrains_Mono'] font-semibold text-sm">
                                {formatPrice(emi)}
                              </p>
                              <p className="text-[0.6875rem] text-[#A0A0A0]">{months} months</p>
                              <p className="text-[0.625rem] text-[#666]">Total: {formatPrice(total)}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quantity + Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex items-center border border-white/20 h-14">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-14 h-full flex items-center justify-center text-white hover:text-[#D4AF37] transition-colors"
                >
                  <Minus size={18} />
                </button>
                <span className="w-16 text-center text-white font-['JetBrains_Mono'] text-lg">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-14 h-full flex items-center justify-center text-white hover:text-[#D4AF37] transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>

              <Button
                onClick={() =>
                  addToCart({
                    productId: product.id,
                    productName: product.name,
                    price: product.price,
                    image: product.image,
                    quantity,
                  })
                }
                disabled={!product.inStock}
                className="flex-1 h-14 bg-gradient-to-r from-[#D4AF37] via-[#E8D44D] to-[#D4AF37] text-[#0A0A0A] font-semibold uppercase tracking-[0.05em] rounded-none hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-40 text-sm"
              >
                <ShoppingCart size={18} className="mr-2" />
                Add to Cart &mdash; {formatPrice(product.price * quantity)}
              </Button>

              <Button
                onClick={() => {
                  addToCart({
                    productId: product.id,
                    productName: product.name,
                    price: product.price,
                    image: product.image,
                    quantity,
                  });
                  navigate('/checkout');
                }}
                disabled={!product.inStock}
                variant="outline"
                className="h-14 px-8 border-[#D4AF37] text-[#D4AF37] rounded-none hover:bg-[#D4AF37]/10 transition-all disabled:opacity-40"
              >
                <Zap size={18} className="mr-2" />
                Buy Now
              </Button>
            </div>

            {/* Wishlist */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`flex items-center gap-2 px-5 py-3 border text-sm transition-all ${
                  wishlisted
                    ? 'border-red-500/50 text-red-400 bg-red-500/10'
                    : 'border-white/20 text-[#A0A0A0] hover:border-white/40 hover:text-white'
                }`}
              >
                <Heart size={16} className={wishlisted ? 'fill-current' : ''} />
                {wishlisted ? 'Wishlisted' : 'Add to Wishlist'}
              </button>
            </div>

            {/* Trust Badges - Horizontal Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white/[0.02] border border-white/[0.06] p-4 mb-10 rounded-sm">
              {[
                { icon: Award, label: '2 Year Warranty' },
                { icon: Truck, label: 'Free Shipping' },
                { icon: MapPin, label: 'Made in India' },
                { icon: BadgeCheck, label: 'BIS Certified' },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-2">
                  <badge.icon size={18} className="text-[#D4AF37] shrink-0" />
                  <span className="text-[0.8125rem] text-[#A0A0A0] whitespace-nowrap">{badge.label}</span>
                </div>
              ))}
            </div>

            {/* Service Badges */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { icon: Truck, label: 'Free Shipping', sub: 'Orders above ₹20,000' },
                { icon: Shield, label: '2 Year Warranty', sub: 'Comprehensive cover' },
                { icon: RotateCcw, label: '10-Day Returns', sub: 'Easy replacement' },
              ].map((badge) => (
                <div key={badge.label} className="text-center">
                  <badge.icon size={24} className="mx-auto text-[#D4AF37] mb-2" />
                  <p className="text-[0.75rem] text-white font-medium">{badge.label}</p>
                  <p className="text-[0.625rem] text-[#666]">{badge.sub}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="border-b border-white/10 mb-6">
              <div className="flex gap-0">
                {tabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
                      activeTab === tab
                        ? 'border-[#D4AF37] text-[#D4AF37]'
                        : 'border-transparent text-[#A0A0A0] hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                {activeTab === 'Description' && (
                  <div className="text-[#A0A0A0] leading-relaxed space-y-4">
                    <p>{product.description}</p>
                    <p>
                      The SWORD Smart RO Purifier represents a breakthrough in water purification technology,
                      combining dual-membrane filtration with AI-powered intelligence to deliver the purest,
                      healthiest drinking water while conserving up to 60% more water than traditional RO systems.
                    </p>
                    <ul className="space-y-2">
                      {[
                        '14-stage purification with NF+RO dual membrane',
                        'AI-powered auto-switching based on water quality',
                        'Retains 40% of essential Ca\u00b2\u207a and Mg\u00b2\u207a minerals',
                        'Customizable TDS output (80-300 ppm)',
                        'IoT connectivity with mobile app control',
                        '2.4" TFT touchscreen display',
                        'Up to 2x longer filter life (24+ months)',
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <Check size={16} className="text-[#D4AF37] mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeTab === 'Specifications' && (
                  <div className="overflow-hidden border border-white/[0.08]">
                    {Object.entries(product.specs).map(([key, value], i) => (
                      <div
                        key={key}
                        className={`flex justify-between px-5 py-3 ${
                          i % 2 === 0 ? 'bg-white/[0.02]' : 'bg-transparent'
                        }`}
                      >
                        <span className="text-sm text-[#A0A0A0]">{key}</span>
                        <span className="text-sm text-white font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'Reviews' && (
                  <div className="space-y-4">
                    {productReviews.map((review) => (
                      <div key={review.id} className="bg-white/[0.03] border border-white/[0.08] p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#AA8C2C] flex items-center justify-center text-[#0A0A0A] font-semibold text-sm">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm text-white font-medium">{review.name}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={12}
                                    className={i < review.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-white/20'}
                                  />
                                ))}
                              </div>
                              <span className="text-[0.625rem] text-[#666]">{review.date}</span>
                            </div>
                          </div>
                          {review.verified && (
                            <span className="ml-auto flex items-center gap-1 text-[0.625rem] text-[#2EC4B6]">
                              <Check size={12} /> Verified
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#A0A0A0]">{review.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div className="mt-20">
            <h2 className="font-['Playfair_Display'] text-2xl text-white mb-8">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((p) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white/[0.03] border border-white/[0.08] p-5 cursor-pointer hover:border-[#D4AF37]/30 transition-all"
                  onClick={() => { navigate(`/product/${p.id}`); window.scrollTo(0, 0); }}
                >
                  <img src={p.image} alt={p.name} className="w-full h-40 object-contain mb-4" />
                  <p className="text-[0.6875rem] text-[#A0A0A0] uppercase tracking-wider mb-1">{p.category}</p>
                  <h3 className="font-['Playfair_Display'] text-base text-white mb-2">{p.name}</h3>
                  <p className="text-[#D4AF37] font-['JetBrains_Mono'] font-semibold">{formatPrice(p.price)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
