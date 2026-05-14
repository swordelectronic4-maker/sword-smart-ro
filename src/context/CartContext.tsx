import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
  variant?: string;
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
  subtotal: number;
  cgst: number;
  sgst: number;
  shipping: number;
  grandTotal: number;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

const GST_RATE = 0.09;
const SHIPPING_THRESHOLD = 20000;
const SHIPPING_COST = 199;

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([
    {
      productId: "sword-smart-ro",
      productName: "SWORD Smart RO Purifier",
      price: 45999,
      quantity: 1,
      image: "/assets/product-front.png",
    },
    {
      productId: "filter-replacement-kit",
      productName: "Filter Replacement Kit",
      price: 7999,
      quantity: 1,
      image: "/filter-cartridge.png",
    },
    {
      productId: "amc-gold",
      productName: "Annual Maintenance Contract - Gold",
      price: 4999,
      quantity: 1,
      image: "/filter-cartridge.png",
    },
  ]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity } : i
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
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

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );
  const cgst = useMemo(() => subtotal * GST_RATE, [subtotal]);
  const sgst = useMemo(() => subtotal * GST_RATE, [subtotal]);
  const shipping = useMemo(
    () => (subtotal > SHIPPING_THRESHOLD ? 0 : items.length > 0 ? SHIPPING_COST : 0),
    [subtotal, items.length]
  );
  const grandTotal = useMemo(
    () => subtotal + cgst + sgst + shipping,
    [subtotal, cgst, sgst, shipping]
  );
  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
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
      cgst,
      sgst,
      shipping,
      grandTotal,
      totalItems,
      isCartOpen,
      setIsCartOpen,
    }),
    [items, wishlist, addToCart, removeFromCart, updateQuantity, clearCart, toggleWishlist, isInWishlist, subtotal, cgst, sgst, shipping, grandTotal, totalItems, isCartOpen]
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
