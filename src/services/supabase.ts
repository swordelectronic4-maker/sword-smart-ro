/**
 * Supabase Client — SWORD Smart Water
 * 
 * Uses ANON KEY only in the browser.
 * Service role key has been REMOVED for security.
 * Admin operations go through Supabase REST API or Edge Functions.
 * 
 * To enable write operations, set up Supabase Edge Functions
 * or Row Level Security policies in the Supabase dashboard.
 */

import { createClient } from '@supabase/supabase-js';

// ─── Supabase Config (public-safe) ────────────────────────
const SUPABASE_URL = 'https://feqqdftjmsgdmxjlexzw.supabase.co';

// Anon key (safe for browser — read-only by default)
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlcXFkZnRqbXNnZG14amxleHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3ODg0MDAsImV4cCI6MjA5NDM2NDQwMH0.8wawfVcJO3LchDaTvBgKdyil65l3XLsf4WZhQ0oPKaA';

// ─── IMPORTANT: Service Role Key Removed ──────────────────
// The service_role key was here previously — it has been removed
// because it gives FULL DATABASE ACCESS and bypasses RLS.
// 
// For admin CRUD operations, use one of:
//   1. Supabase Edge Functions (server-side)
//   2. Supabase Auth + RLS policies
//   3. Vercel serverless functions
//
// Service role key location: Supabase Dashboard → Project Settings → API

export const supabase = createClient(SUPABASE_URL, ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  db: {
    schema: 'public',
  },
});

// ═════════════════════════════════════════════════════════════
// PRODUCTS (read-only via anon key)
// ═════════════════════════════════════════════════════════════
export async function fetchProducts() {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('[Supabase] fetchProducts error:', e);
    return [];
  }
}

// ═════════════════════════════════════════════════════════════
// ORDERS (read-only via anon key)
// ═════════════════════════════════════════════════════════════
export async function fetchOrders() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('[Supabase] fetchOrders error:', e);
    return [];
  }
}

// ═════════════════════════════════════════════════════════════
// USERS (read-only via anon key)
// ═════════════════════════════════════════════════════════════
export async function fetchUsers() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('[Supabase] fetchUsers error:', e);
    return [];
  }
}

// ═════════════════════════════════════════════════════════════
// LEADS (write allowed via RLS policy or Edge Function)
// ═════════════════════════════════════════════════════════════
export async function insertLead(lead: Record<string, any>) {
  try {
    const { data, error } = await supabase.from('leads').insert([lead]).select();
    if (error) throw error;
    return data;
  } catch (e) {
    console.warn('[Supabase] insertLead failed (may need RLS policy):', e);
    // Fallback: store in localStorage
    const leads = JSON.parse(localStorage.getItem('sword_interested_customers') || '[]');
    leads.push({ ...lead, id: `lead_${Date.now()}`, timestamp: new Date().toISOString() });
    localStorage.setItem('sword_interested_customers', JSON.stringify(leads));
    return [lead];
  }
}

// ═════════════════════════════════════════════════════════════
// COUPONS (read-only)
// ═════════════════════════════════════════════════════════════
export async function fetchCoupons() {
  try {
    const { data, error } = await supabase.from('coupons').select('*');
    if (error) throw error;
    return data || [];
  } catch (e) {
    console.error('[Supabase] fetchCoupons error:', e);
    return [];
  }
}

// ═════════════════════════════════════════════════════════════
// CONNECTION CHECK
// ═════════════════════════════════════════════════════════════
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('products').select('id').limit(1);
    return !error;
  } catch { return false; }
}

console.log('[Supabase] Client initialized (anon key only)');
