// Global Currency Configuration - INR (Indian Rupee)
export const CURRENCY = {
  code: 'INR',
  symbol: '\u20B9',
  name: 'Indian Rupee',
  locale: 'en-IN',
  decimalPlaces: 2,
};

// Format number as INR currency string
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

// Format short (no decimals)
export function formatINRShort(amount: number | string | undefined | null): string {
  try {
    const num = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
    if (isNaN(num)) return `${CURRENCY.symbol}0`;
    return `${CURRENCY.symbol}${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
  } catch {
    return `${CURRENCY.symbol}0`;
  }
}

// Format compact (K, L for lakhs)
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

// Parse input string to number (paise -> rupees conversion)
export function parsePrice(input: string | number | undefined): number {
  if (typeof input === 'number') return input;
  if (!input) return 0;
  const clean = String(input).replace(/[^0-9.]/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num;
}

// Calculate GST (9% CGST + 9% SGST = 18% total)
export function calculateGST(amount: number) {
  const gstRate = 0.18;
  const gstAmount = amount * gstRate;
  return {
    cgst: gstAmount / 2,
    sgst: gstAmount / 2,
    total: gstAmount,
    rate: gstRate,
  };
}

// Calculate EMI
export function calculateEMI(principal: number, months: number, annualRate: number = 14): number {
  if (!principal || !months || months <= 0) return 0;
  const monthlyRate = annualRate / 100 / 12;
  if (monthlyRate === 0) return principal / months;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) /
    (Math.pow(1 + monthlyRate, months) - 1);
  return Math.round(emi * 100) / 100;
}
