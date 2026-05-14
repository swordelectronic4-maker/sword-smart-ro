import { useState } from 'react';
import { Link } from 'react-router-dom';
import { products } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Heart, Star, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

const categories = ['All', 'Purifiers', 'Filters', 'Membranes', 'Accessories', 'Kits', 'Services'];

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('All');
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  const filtered = activeCategory === 'All'
    ? products
    : products.filter((p) => p.category === activeCategory);

  return (
    <div className="min-h-[100dvh] pt-[72px] bg-[#0A0A0A]">
      <div className="container-sword py-12">
        <h1 className="text-display-lg font-display text-white mb-2">Shop</h1>
        <p className="text-[#A0A0A0] mb-8">Premium water purification products and accessories</p>

        {/* Category filters */}
        <div className="flex flex-wrap gap-3 mb-10">
          <Filter size={16} className="text-[#A0A0A0] mr-2 self-center" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-2 text-[0.75rem] font-medium uppercase tracking-[0.05em] border transition-all',
                activeCategory === cat
                  ? 'border-[#D4AF37] text-[#D4AF37] bg-[rgba(212,175,55,0.05)]'
                  : 'border-[rgba(255,255,255,0.15)] text-[#A0A0A0] hover:border-[#D4AF37] hover:text-white'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="glass-card group hover:border-[rgba(212,175,55,0.3)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] transition-all duration-400"
            >
              <Link to={`/product/${product.id}`} className="block">
                <div className="aspect-square bg-[#111111] flex items-center justify-center p-6 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-400"
                  />
                </div>
              </Link>
              <div className="p-5">
                <div className="flex items-center gap-1 mb-2">
                  <Star size={12} className="fill-[#D4AF37] text-[#D4AF37]" />
                  <span className="text-[0.75rem] text-[#A0A0A0]">{product.rating}</span>
                  <span className="text-[0.75rem] text-[#666666]">({product.reviews})</span>
                </div>
                <Link to={`/product/${product.id}`}>
                  <h3 className="text-[0.875rem] font-medium text-white mb-1 hover:text-[#D4AF37] transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[1rem] text-[#D4AF37] font-mono">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[0.75rem] text-[#666666] line-through">
                    ₹{product.originalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      addToCart({
                        productId: product.id,
                        productName: product.name,
                        price: product.price,
                        image: product.image,
                      })
                    }
                    className="flex-1 btn-primary py-2.5 text-[0.75rem] flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={14} />
                    Add to Cart
                  </button>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={cn(
                      'w-10 h-10 flex items-center justify-center border transition-colors',
                      isInWishlist(product.id)
                        ? 'border-[#E63946] text-[#E63946]'
                        : 'border-[rgba(255,255,255,0.2)] text-[#A0A0A0] hover:text-white'
                    )}
                  >
                    <Heart size={16} className={isInWishlist(product.id) ? 'fill-current' : ''} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
