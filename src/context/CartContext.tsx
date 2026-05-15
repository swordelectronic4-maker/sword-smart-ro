// @ts-nocheck
/**
 * SWORD Cart Context — Enterprise eCommerce Cart
 * 
 * GST Logic (CRITICAL):
 * - Each product has gstInclusive flag (default: true)
 * - If gstInclusive=true: selling price ALREADY includes GST. Show breakdown but don't add extra.
 * - If gstInclusive=false: selling price excludes GST. Add GST at checkout.
 * 
 * MRP + Offer Logic:
 * - Each product has mrp (displayed with strikethrough) and price (selling price)
 * - Discount % auto-calculated from MRP vs selling price
 */

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { calculateCartTotals, GST_CONFIG } from '@/lib/currency';

export interface CartItem {
  productId: string;
  productName: string;
  price: number;          // Selling price (what customer pays)
  mrp?: number;            // MRP (for strikethrough display)
  quantity: number;
  image: string;
  variant?: string;
  gstInclusive?: boolean; // Does price include GST? (default: true)
  gstRate?: number;       // Product-specific GST rate (default: 18%)
  sku?: string;
  weight?: number;
}

interface CartContextType {
  items: CartItem[];
  wishlist: string[];
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  // Pricing
  subtotal: number;       // Sum of base prices (without GST)
  gstAmount: number;      // Total GST amount
  cgst: number;
  sgst: number;
  shipping: number;
  grandTotal: number;     // Final amount customer pays
  totalItems: number;
  totalSavings: number;   // MRP - selling price savings
  // Display
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  // GST config
  isGstInclusive: boolean;
  gstRate: number;
}

const CartContext = createContext<CartContextType | null>(null);

const SHIPPING_THRESHOLD = 20000;
const SHIPPING_COST = 0; // Free shipping above threshold

// Default cart items with proper GST flags
const DEFAULT_CART: CartItem[] = [
  {
    productId: "sword-smart-ro",
    productName: "SWORD Smart RO Purifier",
    price: 27999,
    mrp: 39999,
    quantity: 1,
    image: "/assets/product-hero.png",
    gstInclusive: true,
    gstRate: 0.18,
    sku: "SWORD-RO-2025",
  },
];

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('sword_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Persist cart to localStorage
  const persistCart = useCallback((newItems: CartItem[]) => {
    setItems(newItems);
    try { localStorage.setItem('sword_cart', JSON.stringify(newItems)); } catch {}
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      let next;
      if (existing) {
        next = prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      } else {
        next = [...prev, { ...item, quantity: item.quantity || 1 }];
      }
      try { localStorage.setItem('sword_cart', JSON.stringify(next)); } catch {}
      return next;
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.productId !== productId);
      try { localStorage.setItem('sword_cart', JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) => {
      const next = prev.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      );
      try { localStorage.setItem('sword_cart', JSON.stringify(next)); } catch {}
      return next;
    });
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
    try { localStorage.removeItem('sword_cart'); } catch {}
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => wishlist.includes(productId),
    [wishlist]
  );

  // Calculate totals using the GST engine
  const { subtotal, gstAmount, cgst, sgst, grandTotal } = useMemo(() => {
    return calculateCartTotals(
      items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        price: item.price,
        quantity: item.quantity,
        gstInclusive: item.gstInclusive ?? GST_CONFIG.defaultInclusive,
        gstRate: item.gstRate ?? GST_CONFIG.rate,
      }))
    );
  }, [items]);

  const shipping = useMemo(() => {
    const itemSubtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return itemSubtotal >= SHIPPING_THRESHOLD ? 0 : items.length > 0 ? SHIPPING_COST : 0;
  }, [items]);

  const grandTotalWithShipping = useMemo(
    () => Math.round((grandTotal + shipping) * 100) / 100,
    [grandTotal, shipping]
  );

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  // Calculate total savings (MRP - selling price)
  const totalSavings = useMemo(
    () => items.reduce((sum, item) => {
      const mrp = item.mrp || item.price;
      return sum + (mrp - item.price) * item.quantity;
    }, 0),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      wishlist,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      toggleWishlist,
      isInWishlist,
      subtotal,
      gstAmount,
      cgst,
      sgst,
      shipping,
      grandTotal: grandTotalWithShipping,
      totalItems,
      totalSavings,
      isCartOpen,
      setIsCartOpen,
      isGstInclusive: GST_CONFIG.defaultInclusive,
      gstRate: GST_CONFIG.rate,
    }),
    [items, wishlist, addToCart, removeFromCart, updateQuantity, clearCart, toggleWishlist, isInWishlist, subtotal, gstAmount, cgst, sgst, shipping, grandTotalWithShipping, totalItems, totalSavings, isCartOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
