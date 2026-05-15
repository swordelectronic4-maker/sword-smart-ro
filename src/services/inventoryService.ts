// @ts-nocheck
/**
 * SWORD Inventory Management System
 * 
 * Features:
 * - Stock tracking per product and per variant
 * - Low stock alerts with configurable threshold
 * - Auto-disable out-of-stock products
 * - Backorder support
 * - SKU auto-generation
 * - Barcode support
 * - Stock history log
 */

import { getProducts } from './dataStore';

const STORAGE_KEY = 'sword_inventory';
const STOCK_LOG_KEY = 'sword_stock_log';

export interface InventoryItem {
  productId: string;
  sku: string;
  barcode?: string;
  stock: number;
  reserved: number;      // Stock reserved in pending orders
  lowStockThreshold: number;
  allowBackorder: boolean;
  reorderPoint?: number; // When to reorder
  reorderQty?: number;   // How much to reorder
  warehouseLocation?: string;
  lastRestocked?: string;
  updatedAt: string;
}

export interface StockLogEntry {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment' | 'restock' | 'reserve' | 'release';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason?: string;
  orderId?: string;
  userId?: string;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════
// LOAD / SAVE
// ═══════════════════════════════════════════════════════════

function loadInventory(): Record<string, InventoryItem> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveInventory(inv: Record<string, InventoryItem>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(inv)); } catch {}
}

function loadStockLog(): StockLogEntry[] {
  try {
    const raw = localStorage.getItem(STOCK_LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function addLogEntry(entry: StockLogEntry) {
  try {
    const log = loadStockLog();
    log.unshift(entry);
    // Keep only last 1000 entries
    if (log.length > 1000) log.length = 1000;
    localStorage.setItem(STOCK_LOG_KEY, JSON.stringify(log));
  } catch {}
}

// ═══════════════════════════════════════════════════════════
// SKU GENERATION
// ═══════════════════════════════════════════════════════════

export function generateSKU(name: string, category?: string): string {
  const prefix = category
    ? category.slice(0, 3).toUpperCase()
    : 'SWR';
  const namePart = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 4);
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${namePart}-${random}`;
}

// ═══════════════════════════════════════════════════════════
// INVENTORY OPERATIONS
// ═══════════════════════════════════════════════════════════

export function getInventory(): Record<string, InventoryItem> {
  return loadInventory();
}

export function getInventoryItem(productId: string): InventoryItem | undefined {
  return loadInventory()[productId];
}

export function initInventory(productId: string, stock: number = 0, sku?: string): InventoryItem {
  const inv = loadInventory();
  if (!inv[productId]) {
    const products = getProducts();
    const product = products.find((p) => p.id === productId);
    const item: InventoryItem = {
      productId,
      sku: sku || product?.sku || generateSKU(product?.name || 'Product'),
      stock: stock,
      reserved: 0,
      lowStockThreshold: 5,
      allowBackorder: false,
      updatedAt: new Date().toISOString(),
    };
    inv[productId] = item;
    saveInventory(inv);
  }
  return inv[productId];
}

export function updateStock(productId: string, newStock: number, reason?: string): boolean {
  const inv = loadInventory();
  if (!inv[productId]) {
    initInventory(productId, newStock);
    return true;
  }

  const previous = inv[productId].stock;
  inv[productId].stock = Math.max(0, newStock);
  inv[productId].updatedAt = new Date().toISOString();
  saveInventory(inv);

  addLogEntry({
    id: `log_${Date.now()}`,
    productId,
    type: 'adjustment',
    quantity: newStock - previous,
    previousStock: previous,
    newStock: inv[productId].stock,
    reason: reason || 'Manual adjustment',
    createdAt: new Date().toISOString(),
  });

  return true;
}

export function addStock(productId: string, quantity: number, reason?: string): boolean {
  const inv = loadInventory();
  if (!inv[productId]) {
    initInventory(productId, quantity);
    return true;
  }

  const previous = inv[productId].stock;
  inv[productId].stock = previous + quantity;
  inv[productId].lastRestocked = new Date().toISOString();
  inv[productId].updatedAt = new Date().toISOString();
  saveInventory(inv);

  addLogEntry({
    id: `log_${Date.now()}`,
    productId,
    type: 'restock',
    quantity,
    previousStock: previous,
    newStock: inv[productId].stock,
    reason: reason || 'Stock restocked',
    createdAt: new Date().toISOString(),
  });

  return true;
}

export function removeStock(productId: string, quantity: number, orderId?: string): boolean {
  const inv = loadInventory();
  if (!inv[productId]) return false;

  const item = inv[productId];
  const available = item.stock - item.reserved;

  if (available < quantity && !item.allowBackorder) {
    return false; // Not enough stock
  }

  const previous = item.stock;
  item.stock = Math.max(0, item.stock - quantity);
  item.updatedAt = new Date().toISOString();
  saveInventory(inv);

  addLogEntry({
    id: `log_${Date.now()}`,
    productId,
    type: 'out',
    quantity: -quantity,
    previousStock: previous,
    newStock: item.stock,
    orderId,
    reason: 'Order fulfillment',
    createdAt: new Date().toISOString(),
  });

  return true;
}

export function reserveStock(productId: string, quantity: number, orderId: string): boolean {
  const inv = loadInventory();
  if (!inv[productId]) return false;

  const item = inv[productId];
  const available = item.stock - item.reserved;

  if (available < quantity && !item.allowBackorder) {
    return false;
  }

  item.reserved += quantity;
  item.updatedAt = new Date().toISOString();
  saveInventory(inv);

  addLogEntry({
    id: `log_${Date.now()}`,
    productId,
    type: 'reserve',
    quantity,
    previousStock: item.stock,
    newStock: item.stock,
    orderId,
    reason: 'Stock reserved for order',
    createdAt: new Date().toISOString(),
  });

  return true;
}

export function releaseReservedStock(productId: string, quantity: number, orderId?: string): boolean {
  const inv = loadInventory();
  if (!inv[productId]) return false;

  const item = inv[productId];
  item.reserved = Math.max(0, item.reserved - quantity);
  item.updatedAt = new Date().toISOString();
  saveInventory(inv);

  addLogEntry({
    id: `log_${Date.now()}`,
    productId,
    type: 'release',
    quantity: -quantity,
    previousStock: item.stock,
    newStock: item.stock,
    orderId,
    reason: 'Released reserved stock',
    createdAt: new Date().toISOString(),
  });

  return true;
}

// ═══════════════════════════════════════════════════════════
// ALERTS & QUERIES
// ═══════════════════════════════════════════════════════════

export function getLowStockItems(): Array<InventoryItem & { productName?: string }> {
  const inv = loadInventory();
  const products = getProducts();
  return Object.values(inv)
    .filter((item) => item.stock <= item.lowStockThreshold)
    .map((item) => ({
      ...item,
      productName: products.find((p) => p.id === item.productId)?.name,
    }));
}

export function getOutOfStockItems(): Array<InventoryItem & { productName?: string }> {
  const inv = loadInventory();
  const products = getProducts();
  return Object.values(inv)
    .filter((item) => item.stock === 0)
    .map((item) => ({
      ...item,
      productName: products.find((p) => p.id === item.productId)?.name,
    }));
}

export function isInStock(productId: string, quantity: number = 1): boolean {
  const item = loadInventory()[productId];
  if (!item) return false;
  return item.allowBackorder || (item.stock - item.reserved) >= quantity;
}

export function getAvailableStock(productId: string): number {
  const item = loadInventory()[productId];
  if (!item) return 0;
  return Math.max(0, item.stock - item.reserved);
}

export function getStockLog(productId?: string): StockLogEntry[] {
  const log = loadStockLog();
  return productId ? log.filter((e) => e.productId === productId) : log;
}

// ═══════════════════════════════════════════════════════════
// SYNC WITH PRODUCTS
// ═══════════════════════════════════════════════════════════

export function syncInventoryWithProducts() {
  const products = getProducts();
  const inv = loadInventory();

  // Initialize inventory for products that don't have it
  for (const product of products) {
    if (!inv[product.id]) {
      inv[product.id] = {
        productId: product.id,
        sku: product.sku || generateSKU(product.name, product.category),
        stock: product.stock || 0,
        reserved: 0,
        lowStockThreshold: 5,
        allowBackorder: false,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  saveInventory(inv);
}
