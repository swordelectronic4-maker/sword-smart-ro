import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingCart, Star, SlidersHorizontal, Search, X, Eye } from 'lucide-react';
import { products as getProductList, type Product } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const categories = ['All', 'Purifiers', 'Filters', 'Membranes', 'Kits', 'Accessories', 'Services'];
const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Rating', value: 'rating' },
  { label: 'Name', value: 'name' },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

function getStockBadge(stock: number, inStock: boolean) {
  if (!inStock || stock === 0) {
    return { label: 'Out of Stock', className: 'bg-red-500/20 text-red-400 border-red-500/30' };
  }
  if (stock <= 20) {
    return { label: 'Low Stock', className: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
  }
  return { label: 'In Stock', className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
}

function ProductCard({ product, index }: { product: Product; index: number }) {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const wishlisted = isInWishlist(product.id);
  const discount = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
  const stockBadge = getStockBadge(product.stock, product.inStock);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.4, 0, 0.2, 1] }}
      className="group relative bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.06] overflow-hidden transition-all duration-400 hover:border-[#D4AF37]/30 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
    >
      {discount > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-[#D4AF37] text-[#0A0A0A] text-[0.625rem] font-semibold px-2 py-1 uppercase tracking-wider">
          {discount}% OFF
        </span>
      )}

      <button
        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
        className="absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center bg-black/40 backdrop-blur-sm border border-white/10 transition-all duration-300 hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/50"
      >
        <Heart
          size={16}
          className={wishlisted ? 'fill-red-500 text-red-500' : 'text-white/70'}
        />
      </button>

      <div
        className="relative aspect-square overflow-hidden bg-[#111] cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Quick View overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button
            onClick={(e) => { e.stopPropagation(); navigate(`/product/${product.id}`); }}
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/50 rounded-none px-6 py-2.5 text-sm uppercase tracking-wider font-medium transition-all duration-300 transform translate-y-2 group-hover:translate-y-0"
          >
            <Eye size={16} className="mr-2" />
            Quick View
          </Button>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[0.6875rem] text-[#A0A0A0] uppercase tracking-[0.08em] font-medium">
            {product.category}
          </p>
          {/* Stock badge */}
          <span className={`text-[0.625rem] font-medium px-2 py-0.5 border ${stockBadge.className}`}>
            {stockBadge.label}
          </span>
        </div>
        <h3
          className="font-['Playfair_Display'] text-base text-white mb-2 cursor-pointer hover:text-[#D4AF37] transition-colors line-clamp-1"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={12}
                className={i < Math.floor(product.rating) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-white/20'}
              />
            ))}
          </div>
          <span className="text-[0.75rem] text-[#A0A0A0]">({product.reviews})</span>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-lg font-semibold text-[#D4AF37] font-['JetBrains_Mono']">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-[#888] line-through decoration-[#666] decoration-1">
            {formatPrice(product.originalPrice)}
          </span>
        </div>

        {/* Stock quantity display */}
        {product.stock > 0 && product.stock < 20 && (
          <p className="text-[0.75rem] text-orange-400 mb-3">
            Only {product.stock} left
          </p>
        )}
        {product.stock >= 20 && (
          <p className="text-[0.75rem] text-emerald-500/70 mb-3">
            In Stock
          </p>
        )}
        {product.stock === 0 && (
          <p className="text-[0.75rem] text-red-400 mb-3">
            Out of Stock
          </p>
        )}

        <div className="flex gap-2">
          <Button
            onClick={() =>
              addToCart({
                productId: product.id,
                productName: product.name,
                price: product.price,
                image: product.image,
              })
            }
            disabled={!product.inStock || product.stock === 0}
            className="flex-1 bg-gradient-to-r from-[#D4AF37] via-[#E8D44D] to-[#D4AF37] text-[#0A0A0A] font-semibold text-[0.75rem] uppercase tracking-[0.05em] h-10 rounded-none hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-40"
          >
            <ShoppingCart size={14} className="mr-2" />
            Add to Cart
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default function Shop() {
  const products = getProductList();
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 60000]);
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (activeCategory !== 'All') {
      filtered = filtered.filter((p) => p.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    filtered = filtered.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - b.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return filtered;
  }, [activeCategory, sortBy, searchQuery, priceRange]);

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-[72px]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="font-['Playfair_Display'] text-4xl md:text-5xl text-white mb-3">
            Shop
          </h1>
          <p className="text-[#A0A0A0] text-base max-w-xl">
            India's smartest water purification solutions. From our flagship dual-membrane purifier to replacement filters and comprehensive maintenance plans.
          </p>
        </motion.div>

        {/* Search & Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#666]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-[#666] rounded-none focus:border-[#D4AF37] focus:ring-[#D4AF37]/15"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666] hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-12 px-4 bg-white/5 border border-white/10 text-white text-sm rounded-none focus:border-[#D4AF37] outline-none appearance-none cursor-pointer min-w-[160px]"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value} className="bg-[#1A1A1A]">
                  {o.label}
                </option>
              ))}
            </select>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="h-12 px-5 border-white/20 text-white rounded-none hover:border-[#D4AF37] hover:text-[#D4AF37]"
            >
              <SlidersHorizontal size={16} className="mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Price Filter */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden mb-8"
            >
              <div className="bg-white/[0.03] border border-white/[0.08] p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <span className="text-[#A0A0A0] text-sm uppercase tracking-wider">Price Range:</span>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                      className="w-28 h-10 bg-white/5 border-white/10 text-white rounded-none text-sm"
                      placeholder="Min"
                    />
                    <span className="text-[#666]">&ndash;</span>
                    <Input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                      className="w-28 h-10 bg-white/5 border-white/10 text-white rounded-none text-sm"
                      placeholder="Max"
                    />
                    <Button
                      onClick={() => setPriceRange([0, 60000])}
                      variant="ghost"
                      className="h-10 text-[#A0A0A0] hover:text-[#D4AF37]"
                    >
                      Reset
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 text-[0.75rem] uppercase tracking-[0.08em] font-medium border transition-all duration-300 ${
                activeCategory === cat
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-[#D4AF37]/10'
                  : 'border-white/10 text-[#A0A0A0] hover:border-white/30 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <p className="text-[#A0A0A0] text-sm mb-6">
          Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
        </p>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Search size={48} className="mx-auto text-[#333] mb-4" />
            <h3 className="font-['Playfair_Display'] text-xl text-white mb-2">
              No products found
            </h3>
            <p className="text-[#A0A0A0]">
              Try adjusting your filters or search query.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
