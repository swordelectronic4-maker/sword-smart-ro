// ============================================================
// SWORD Smart Water — Global Currency & Tax Configuration
// Currency: INR (Indian Rupee)
// GST: Configurable rate (default 18% = 9% CGST + 9% SGST)
// ============================================================

export const CURRENCY = {
  code: 'INR',
  symbol: '\u20B9',
  name: 'Indian Rupee',
  locale: 'en-IN',
  decimalPlaces: 2,
};

// Global GST settings (admin configurable)
export const GST_CONFIG = {
  rate: 0.18,           // 18% total (9% CGST + 9% SGST)
  cgstRate: 0.09,
  sgstRate: 0.09,
  igstRate: 0.18,       // For interstate
  defaultInclusive: true, // Default: prices include GST
  hsnCode: '8421',      // Water purifier HSN code
  gstin: '',            // Filled from admin settings
};

// ============================================================
// Price Formatting
// ============================================================

/** Format number as INR currency: ₹12,499.00 */
export function formatINR(amount: number | string | undefined | null): string {
  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (isNaN(num)) return `${CURRENCY.symbol}0.00`;
    return `${CURRENCY.symbol}${num.toLocaleString('en-IN', {
      minimumFractionDigits: CURRENCY.decimalPlaces,
      maximumFractionDigits: CURRENCY.decimalPlaces,
    })}`;
  } catch {
    return `${CURRENCY.symbol}0.00`;
  }
}

/** Format short (no decimals): ₹12,499 */
export function formatINRShort(amount: number | string | undefined | null): string {
  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (isNaN(num)) return `${CURRENCY.symbol}0`;
    return `${CURRENCY.symbol}${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  } catch {
    return `${CURRENCY.symbol}0`;
  }
}

/** Format compact (K, L, Cr): ₹1.5L */
export function formatCompactINR(amount: number | string | undefined | null): string {
  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (isNaN(num)) return `${CURRENCY.symbol}0`;
    if (num >= 1_00_00_000) return `${CURRENCY.symbol}${(num / 1_00_00_000).toFixed(1)}Cr`;
    if (num >= 1_00_000) return `${CURRENCY.symbol}${(num / 1_00_000).toFixed(1)}L`;
    if (num >= 1_000) return `${CURRENCY.symbol}${(num / 1_000).toFixed(1)}K`;
    return `${CURRENCY.symbol}${num.toLocaleString('en-IN')}`;
  } catch {
    return `${CURRENCY.symbol}0`;
  }
}

/** Format MRP with strikethrough context: ₹2,999 */
export function formatMRP(amount: number | string | undefined | null): string {
  return formatINRShort(amount);
}

/** Calculate discount percentage: ((mrp - selling) / mrp) * 100 */
export function calculateDiscountPercent(mrp: number, selling: number): number {
  if (!mrp || mrp <= 0 || selling >= mrp) return 0;
  return Math.round(((mrp - selling) / mrp) * 100);
}

/** Format discount badge: 50% OFF */
export function formatDiscount(mrp: number, selling: number): string {
  const pct = calculateDiscountPercent(mrp, selling);
  return pct > 0 ? `${pct}% OFF` : '';
}

// ============================================================
// GST Calculation Engine
// ============================================================

/**
 * Calculate GST breakdown for a product
 * @param sellingPrice - The price customer pays
 * @param gstRate - GST rate (default 18%)
 * @param isInclusive - Whether sellingPrice already includes GST
 * @returns GST breakdown + base price + final price
 */
export function calculateProductGST(
  sellingPrice: number,
  gstRate: number = GST_CONFIG.rate,
  isInclusive: boolean = GST_CONFIG.defaultInclusive
) {
  if (!sellingPrice || sellingPrice <= 0) {
    return { basePrice: 0, gstAmount: 0, cgst: 0, sgst: 0, finalPrice: 0, rate: gstRate };
  }

  if (isInclusive) {
    // Selling price INCLUDES GST
    // basePrice = sellingPrice / (1 + gstRate)
    const basePrice = sellingPrice / (1 + gstRate);
    const gstAmount = sellingPrice - basePrice;
    return {
      basePrice: Math.round(basePrice * 100) / 100,
      gstAmount: Math.round(gstAmount * 100) / 100,
      cgst: Math.round((gstAmount / 2) * 100) / 100,
      sgst: Math.round((gstAmount / 2) * 100) / 100,
      finalPrice: sellingPrice, // Same as selling price
      rate: gstRate,
      isInclusive: true,
    };
  } else {
    // Selling price EXCLUDES GST
    // GST added at checkout
    const gstAmount = sellingPrice * gstRate;
    return {
      basePrice: sellingPrice,
      gstAmount: Math.round(gstAmount * 100) / 100,
      cgst: Math.round((gstAmount / 2) * 100) / 100,
      sgst: Math.round((gstAmount / 2) * 100) / 100,
      finalPrice: sellingPrice + Math.round(gstAmount * 100) / 100,
      rate: gstRate,
      isInclusive: false,
    };
  }
}

/**
 * Calculate cart totals with per-product GST handling
 * Each product can be GST inclusive OR exclusive
 */
export function calculateCartTotals(
  items: Array<{
    productId: string;
    productName: string;
    price: number;  // This is the selling price
    quantity: number;
    gstInclusive?: boolean;
    gstRate?: number;
  }>,
  shippingCost: number = 0,
  discount: number = 0
) {
  let subtotal = 0;       // Sum of base prices
  let totalGST = 0;       // Sum of GST amounts
  let totalCGST = 0;
  let totalSGST = 0;

  for (const item of items) {
    const lineSelling = item.price * item.quantity;
    const gstBreakdown = calculateProductGST(
      lineSelling,
      item.gstRate ?? GST_CONFIG.rate,
      item.gstInclusive ?? GST_CONFIG.defaultInclusive
    );

    subtotal += gstBreakdown.basePrice * item.quantity;
    totalGST += gstBreakdown.gstAmount * item.quantity;
    totalCGST += gstBreakdown.cgst * item.quantity;
    totalSGST += gstBreakdown.sgst * item.quantity;
  }

  const totalAfterDiscount = subtotal + totalGST - discount;
  const finalTotal = totalAfterDiscount + shippingCost;

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    gstAmount: Math.round(totalGST * 100) / 100,
    cgst: Math.round(totalCGST * 100) / 100,
    sgst: Math.round(totalSGST * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    shipping: Math.round(shippingCost * 100) / 100,
    grandTotal: Math.round(finalTotal * 100) / 100,
  };
}

// ============================================================
// EMI Calculation
// ============================================================

export function calculateEMI(
  principal: number,
  months: number,
  annualRate: number = 14
): number {
  if (!principal || !months || months <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(emi * 100) / 100;
}

// ============================================================
// Price Parsing
// ============================================================

export function parsePrice(input: string | number | undefined): number {
  if (typeof input === 'number') return input;
  if (!input) return 0;
  const clean = String(input).replace(/[^0-9.]/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}
