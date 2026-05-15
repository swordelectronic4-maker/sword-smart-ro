/**
 * Visitor & Customer Analytics Service
 * Tracks page views, user actions, and interested customers
 * Stores data in localStorage for now — connect to Firebase for production
 */

export interface VisitorEvent {
  id: string;
  timestamp: string;
  type: 'page_view' | 'product_view' | 'add_to_cart' | 'checkout_start' | 'purchase' | 'contact_submit' | 'chat_lead';
  page?: string;
  productId?: string;
  productName?: string;
  metadata?: Record<string, string>;
  sessionId: string;
}

export interface InterestedCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'chatbot' | 'contact_form' | 'callback_request';
  message?: string;
  timestamp: string;
  pageViewed?: string;
  status: 'new' | 'contacted' | 'converted' | 'lost';
}

const STORAGE_KEY = 'sword_analytics_events';
const CUSTOMERS_KEY = 'sword_interested_customers';
const SESSION_KEY = 'sword_session_id';

// ═══════════════════════════════════════════════
// Session Management
// ═══════════════════════════════════════════════
function getSessionId(): string {
  let sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
}

// ═══════════════════════════════════════════════
// Event Tracking
// ═══════════════════════════════════════════════
export function trackEvent(
  type: VisitorEvent['type'],
  details: Omit<Partial<VisitorEvent>, 'id' | 'timestamp' | 'type' | 'sessionId'>
): void {
  try {
    const event: VisitorEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      type,
      sessionId: getSessionId(),
      ...details,
    };

    const existing = getEvents();
    existing.push(event);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing.slice(-500))); // Keep last 500

    // Also log to console for debugging
    console.log('[Analytics]', type, details);
  } catch {
    // Silently fail if storage is full
  }
}

export function trackPageView(page: string): void {
  trackEvent('page_view', { page });
}

export function trackProductView(productId: string, productName: string): void {
  trackEvent('product_view', { productId, productName });
}

export function trackAddToCart(productId: string, productName: string): void {
  trackEvent('add_to_cart', { productId, productName });
}

export function trackCheckoutStart(): void {
  trackEvent('checkout_start', {});
}

export function trackPurchase(orderId: string, total: number): void {
  trackEvent('purchase', { metadata: { orderId, total: total.toString() } });
}

// ═══════════════════════════════════════════════
// Interested Customer Capture
// ═══════════════════════════════════════════════
export function captureLead(
  name: string,
  email: string,
  phone: string,
  source: InterestedCustomer['source'],
  message?: string,
  pageViewed?: string
): boolean {
  try {
    const customer: InterestedCustomer = {
      id: `lead_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      source,
      message: message?.trim(),
      timestamp: new Date().toISOString(),
      pageViewed,
      status: 'new',
    };

    // Validate
    if (!customer.name || !customer.email || !customer.phone) {
      return false;
    }

    const existing = getInterestedCustomers();

    // Check if email already exists
    const duplicate = existing.find(
      (c) => c.email === customer.email && c.source === source
    );
    if (duplicate) {
      // Update existing with new message
      duplicate.message = message || duplicate.message;
      duplicate.status = 'new';
      localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(existing));
      trackEvent('contact_submit', { metadata: { source, type: 'update' } });
      return true;
    }

    existing.push(customer);
    localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(existing));

    trackEvent('contact_submit', {
      metadata: { source, name: customer.name, email: customer.email },
    });

    return true;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════
// Data Retrieval (for Admin Dashboard)
// ═══════════════════════════════════════════════
export function getEvents(): VisitorEvent[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getInterestedCustomers(): InterestedCustomer[] {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function getAnalyticsSummary(): {
  totalPageViews: number;
  uniqueSessions: number;
  totalCartAdds: number;
  totalCheckouts: number;
  totalPurchases: number;
  totalLeads: number;
  newLeads: number;
  topProducts: { name: string; views: number }[];
} {
  const events = getEvents();
  const customers = getInterestedCustomers();

  const sessions = new Set(events.map((e) => e.sessionId));
  const productViews = events.filter((e) => e.type === 'product_view');

  // Count views per product
  const productCount: Record<string, number> = {};
  productViews.forEach((e) => {
    const name = e.productName || e.productId || 'Unknown';
    productCount[name] = (productCount[name] || 0) + 1;
  });

  const topProducts = Object.entries(productCount)
    .map(([name, views]) => ({ name, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  return {
    totalPageViews: events.filter((e) => e.type === 'page_view').length,
    uniqueSessions: sessions.size,
    totalCartAdds: events.filter((e) => e.type === 'add_to_cart').length,
    totalCheckouts: events.filter((e) => e.type === 'checkout_start').length,
    totalPurchases: events.filter((e) => e.type === 'purchase').length,
    totalLeads: customers.length,
    newLeads: customers.filter((c) => c.status === 'new').length,
    topProducts,
  };
}

// ═══════════════════════════════════════════════
// Lead Management (Admin)
// ═══════════════════════════════════════════════
export function updateLeadStatus(
  leadId: string,
  status: InterestedCustomer['status']
): boolean {
  const customers = getInterestedCustomers();
  const lead = customers.find((c) => c.id === leadId);
  if (!lead) return false;
  lead.status = status;
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(customers));
  return true;
}

export function exportLeadsCSV(): string {
  const customers = getInterestedCustomers();
  if (customers.length === 0) return '';

  const headers = ['ID', 'Name', 'Email', 'Phone', 'Source', 'Message', 'Date', 'Status', 'Page Viewed'];
  const rows = customers.map((c) => [
    c.id,
    c.name,
    c.email,
    c.phone,
    c.source,
    c.message || '',
    c.timestamp,
    c.status,
    c.pageViewed || '',
  ]);

  return [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
}

export function exportEventsCSV(): string {
  const events = getEvents();
  if (events.length === 0) return '';

  const headers = ['ID', 'Timestamp', 'Type', 'Page', 'Product', 'Session'];
  const rows = events.map((e) => [
    e.id,
    e.timestamp,
    e.type,
    e.page || '',
    e.productName || '',
    e.sessionId,
  ]);

  return [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
}

// ═══════════════════════════════════════════════
// Seed demo data
// ═══════════════════════════════════════════════
export function seedDemoAnalytics(): void {
  if (getEvents().length > 0) return; // Don't seed if already has data

  const demoEvents: VisitorEvent[] = [
    { id: 'evt_1', timestamp: '2025-05-15T08:00:00Z', type: 'page_view', page: '/', sessionId: 'sess_a' },
    { id: 'evt_2', timestamp: '2025-05-15T08:05:00Z', type: 'product_view', productId: 'sword-smart-ro', productName: 'SWORD Smart RO Purifier', sessionId: 'sess_a' },
    { id: 'evt_3', timestamp: '2025-05-15T08:10:00Z', type: 'add_to_cart', productId: 'sword-smart-ro', productName: 'SWORD Smart RO Purifier', sessionId: 'sess_a' },
    { id: 'evt_4', timestamp: '2025-05-15T08:15:00Z', type: 'checkout_start', sessionId: 'sess_a' },
    { id: 'evt_5', timestamp: '2025-05-15T09:00:00Z', type: 'page_view', page: '/shop', sessionId: 'sess_b' },
    { id: 'evt_6', timestamp: '2025-05-15T09:30:00Z', type: 'product_view', productId: 'filter-replacement-kit', productName: 'Filter Replacement Kit', sessionId: 'sess_b' },
    { id: 'evt_7', timestamp: '2025-05-15T10:00:00Z', type: 'page_view', page: '/', sessionId: 'sess_c' },
    { id: 'evt_8', timestamp: '2025-05-15T10:30:00Z', type: 'contact_submit', sessionId: 'sess_c' },
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(demoEvents));

  const demoLeads: InterestedCustomer[] = [
    { id: 'lead_1', name: 'Rahul Sharma', email: 'rahul.s@gmail.com', phone: '+91 98765 43210', source: 'chatbot', message: 'Interested in SWORD purifier for my home in Mumbai', timestamp: '2025-05-15T09:30:00Z', status: 'new' },
    { id: 'lead_2', name: 'Priya Patel', email: 'priya.p@yahoo.com', phone: '+91 99887 66554', source: 'contact_form', message: 'Need AMC plan details', timestamp: '2025-05-15T10:15:00Z', status: 'contacted' },
    { id: 'lead_3', name: 'Amit Kumar', email: 'amit.k@outlook.com', phone: '+91 97654 32109', source: 'chatbot', message: 'Want to know about mineral retention vs normal RO', timestamp: '2025-05-15T11:00:00Z', status: 'new' },
    { id: 'lead_4', name: 'Sneha Gupta', email: 'sneha.g@gmail.com', phone: '+91 96543 21098', source: 'callback_request', timestamp: '2025-05-15T11:30:00Z', status: 'new' },
    { id: 'lead_5', name: 'Vikram Rao', email: 'vikram.r@rediff.com', phone: '+91 95432 10987', source: 'chatbot', message: 'What is the warranty period and AMC cost?', timestamp: '2025-05-15T12:00:00Z', status: 'converted' },
  ];

  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(demoLeads));
}
