/**
 * Supabase Client — SWORD Smart Water
 * FULL ACCESS — Uses service_role key for complete CRUD
 * 
 * Tables: products, orders, users, coupons, leads, settings,
 *         subscriptions, cms_pages, banners, order_items, activity_logs
 */

import { createClient } from '@supabase/supabase-js';

// ─── Supabase Config ────────────────────────────────────────
const SUPABASE_URL = 'https://feqqdftjmsgdmxjlexzw.supabase.co';

// Service role key — full database access (bypasses RLS)
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcXFkZnRqbXNnZG14amxleHp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODc4ODQwMCwiZXhwIjoyMDk0MzY0NDAwfQ.rH9V52pvulccqgFytrM6vt9lNE1NtqJTGCzE63vy8wE';

// Anon key for public reads (fallback)
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcXFkZnRqbXNnZG14amxleHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3ODg0MDAsImV4cCI6MjA5NDM2NDQwMH0.8wawfVcJO3LchDaTvBgKdyil65l3XLsf4WZhQ0oPKaA';

// Use service_role for full access
export const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' },
  global: { headers: { 'X-Client-Info': 'sword-admin' } },
});

// Public client for anon reads (if needed)
export const supabasePublic = createClient(SUPABASE_URL, ANON_KEY, {
  auth: { autoRefreshToken: true, persistSession: true },
  db: { schema: 'public' },
});

// ═════════════════════════════════════════════════════════════
// PRODUCTS
// ═════════════════════════════════════════════════════════════
export async function fetchProducts() {
  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) { console.error('[Supabase] fetchProducts error:', error); return []; }
  return data || [];
}

export async function insertProduct(product: Record<string, any>) {
  const { data, error } = await supabase.from('products').insert([product]).select();
  if (error) throw error;
  return data;
}

export async function updateProductDB(id: string, updates: Record<string, any>) {
  const { error } = await supabase.from('products').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteProductDB(id: string) {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// ═════════════════════════════════════════════════════════════
// ORDERS
// ═════════════════════════════════════════════════════════════
export async function fetchOrders() {
  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (error) { console.error('[Supabase] fetchOrders error:', error); return []; }
  return data || [];
}

export async function insertOrder(order: Record<string, any>) {
  const { data, error } = await supabase.from('orders').insert([order]).select();
  if (error) throw error;
  return data;
}

export async function updateOrderDB(id: string, updates: Record<string, any>) {
  const { error } = await supabase.from('orders').update(updates).eq('id', id);
  if (error) throw error;
}

// ═════════════════════════════════════════════════════════════
// USERS
// ═════════════════════════════════════════════════════════════
export async function fetchUsers() {
  const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
  if (error) { console.error('[Supabase] fetchUsers error:', error); return []; }
  return data || [];
}

export async function insertUser(user: Record<string, any>) {
  const { data, error } = await supabase.from('users').insert([user]).select();
  if (error) throw error;
  return data;
}

// ═════════════════════════════════════════════════════════════
// LEADS
// ═════════════════════════════════════════════════════════════
export async function fetchLeads() {
  const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
  if (error) { console.error('[Supabase] fetchLeads error:', error); return []; }
  return data || [];
}

export async function insertLead(lead: Record<string, any>) {
  const { data, error } = await supabase.from('leads').insert([lead]).select();
  if (error) throw error;
  return data;
}

// ═════════════════════════════════════════════════════════════
// COUPONS
// ═════════════════════════════════════════════════════════════
export async function fetchCoupons() {
  const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  if (error) { console.error('[Supabase] fetchCoupons error:', error); return []; }
  return data || [];
}

export async function upsertCoupon(coupon: Record<string, any>) {
  const { data, error } = await supabase.from('coupons').upsert([coupon]).select();
  if (error) throw error;
  return data;
}

// ═════════════════════════════════════════════════════════════
// SETTINGS
// ═════════════════════════════════════════════════════════════
export async function fetchSettings() {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) { console.error('[Supabase] fetchSettings error:', error); return []; }
  return data || [];
}

export async function upsertSetting(key: string, value: string) {
  const { error } = await supabase.from('settings').upsert({ key, value });
  if (error) throw error;
}

// ═════════════════════════════════════════════════════════════
// HELPERS
// ═════════════════════════════════════════════════════════════
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').select('id').limit(1);
    return !error;
  } catch { return false; }
}

// Check write access
export async function checkSupabaseWrite(): Promise<boolean> {
  try {
    const testId = 'test_' + Date.now();
    const { error: insertErr } = await supabase.from('leads').insert([{
      id: testId, name: 'Test', email: 'test@test.com', phone: '0000000000',
      source: 'test', status: 'new', created_at: new Date().toISOString(),
    }]);
    if (insertErr) return false;
    await supabase.from('leads').delete().eq('id', testId);
    return true;
  } catch { return false; }
}

console.log('[Supabase] Client initialized with service_role');
