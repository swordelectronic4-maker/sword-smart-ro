// @ts-nocheck
/**
 * SWORD Lead Management CRM
 * 
 * Capture leads from:
 * - Contact form
 * - Exit intent popup
 * - Abandoned cart
 * - Newsletter subscription
 * - WhatsApp click
 * - Product enquiry button
 * 
 * Lead lifecycle: New → Contacted → Qualified → Converted → Lost
 */

const STORAGE_KEY = 'sword_leads';
const NOTES_KEY = 'sword_lead_notes';

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  source: 'website' | 'chatbot' | 'contact_form' | 'exit_intent' | 'abandoned_cart' | 'newsletter' | 'whatsapp' | 'product_enquiry' | 'referral' | 'social' | 'callback';
  productInterest?: string;
  productId?: string;
  message?: string;
  pageUrl?: string;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  assignedTo?: string; // admin user ID
  priority: 'low' | 'medium' | 'high' | 'urgent';
  score: number; // 0-100 lead score
  notes?: LeadNote[];
  createdAt: string;
  updatedAt: string;
  convertedAt?: string;
  convertedValue?: number;
}

export interface LeadNote {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

// ═══════════════════════════════════════════════════════════
// CRUD OPERATIONS
// ═══════════════════════════════════════════════════════════

function loadLeads(): Lead[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultLeads();
  } catch { return getDefaultLeads(); }
}

function saveLeads(leads: Lead[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(leads)); } catch {}
}

function getDefaultLeads(): Lead[] {
  return [
    {
      id: 'lead_1',
      name: 'Vikram Mehta',
      email: 'vikram.mehta@example.com',
      phone: '+919876543214',
      source: 'chatbot',
      productInterest: 'SWORD Smart RO',
      message: 'Interested in SWORD Smart RO for my apartment. Need EMI options.',
      pageUrl: '/product/sword-smart-ro',
      status: 'new',
      priority: 'high',
      score: 75,
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'lead_2',
      name: 'Neha Desai',
      email: 'neha.desai@example.com',
      phone: '+919876543215',
      source: 'contact_form',
      productInterest: 'Dealership',
      message: 'Looking for dealership opportunity in Mumbai.',
      pageUrl: '/about',
      status: 'contacted',
      priority: 'medium',
      score: 60,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'lead_3',
      name: 'Rajesh Iyer',
      email: 'rajesh.iyer@example.com',
      phone: '+919876543216',
      source: 'callback',
      productInterest: 'Bulk Order',
      message: 'Please call me back to discuss bulk order for my office.',
      pageUrl: '/shop',
      status: 'new',
      priority: 'urgent',
      score: 85,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
  ];
}

export function getLeads(): Lead[] {
  return loadLeads();
}

export function getLeadById(id: string): Lead | undefined {
  return loadLeads().find((l) => l.id === id);
}

export function addLead(leadData: Omit<Lead, 'id' | 'status' | 'score' | 'priority' | 'createdAt' | 'updatedAt'>): Lead {
  const leads = loadLeads();
  const newLead: Lead = {
    ...leadData,
    id: `lead_${Date.now()}`,
    status: 'new',
    priority: 'medium',
    score: calculateLeadScore(leadData),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  leads.unshift(newLead);
  saveLeads(leads);
  return newLead;
}

export function updateLeadStatus(id: string, status: Lead['status'], userId?: string): boolean {
  const leads = loadLeads();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return false;
  leads[idx].status = status;
  leads[idx].updatedAt = new Date().toISOString();
  if (status === 'converted') {
    leads[idx].convertedAt = new Date().toISOString();
  }
  saveLeads(leads);
  return true;
}

export function updateLead(id: string, updates: Partial<Lead>): boolean {
  const leads = loadLeads();
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return false;
  leads[idx] = { ...leads[idx], ...updates, updatedAt: new Date().toISOString() };
  saveLeads(leads);
  return true;
}

export function assignLead(id: string, adminId: string): boolean {
  return updateLead(id, { assignedTo: adminId });
}

export function addLeadNote(leadId: string, text: string, author: string): boolean {
  const note: LeadNote = {
    id: `note_${Date.now()}`,
    text,
    author,
    createdAt: new Date().toISOString(),
  };

  const leads = loadLeads();
  const idx = leads.findIndex((l) => l.id === leadId);
  if (idx === -1) return false;

  if (!leads[idx].notes) leads[idx].notes = [];
  leads[idx].notes.push(note);
  leads[idx].updatedAt = new Date().toISOString();
  saveLeads(leads);
  return true;
}

export function deleteLead(id: string): boolean {
  const leads = loadLeads();
  const filtered = leads.filter((l) => l.id !== id);
  if (filtered.length === leads.length) return false;
  saveLeads(filtered);
  return true;
}

// ═══════════════════════════════════════════════════════════
// LEAD SCORING
// ═══════════════════════════════════════════════════════════

function calculateLeadScore(leadData: Partial<Lead>): number {
  let score = 0;

  // Has phone: +20
  if (leadData.phone) score += 20;
  // Has email: +15
  if (leadData.email) score += 15;
  // Has product interest: +25
  if (leadData.productInterest) score += 25;
  // Has message: +10
  if (leadData.message && leadData.message.length > 20) score += 10;
  // Source quality
  const sourceScores: Record<string, number> = {
    product_enquiry: 30,
    callback: 25,
    chatbot: 20,
    contact_form: 15,
    abandoned_cart: 20,
    referral: 20,
    whatsapp: 15,
    website: 5,
    newsletter: 5,
    exit_intent: 10,
    social: 5,
  };
  score += sourceScores[leadData.source || 'website'] || 0;

  return Math.min(100, score);
}

// ═══════════════════════════════════════════════════════════
// QUERIES & ANALYTICS
// ═══════════════════════════════════════════════════════════

export function getLeadsByStatus(status?: Lead['status']): Lead[] {
  const leads = loadLeads();
  return status ? leads.filter((l) => l.status === status) : leads;
}

export function getLeadsBySource(source?: Lead['source']): Lead[] {
  const leads = loadLeads();
  return source ? leads.filter((l) => l.source === source) : leads;
}

export function getLeadsByPriority(priority: Lead['priority']): Lead[] {
  return loadLeads().filter((l) => l.priority === priority);
}

export function getAssignedLeads(adminId: string): Lead[] {
  return loadLeads().filter((l) => l.assignedTo === adminId);
}

export function searchLeads(query: string): Lead[] {
  const q = query.toLowerCase();
  return loadLeads().filter(
    (l) =>
      l.name?.toLowerCase().includes(q) ||
      l.email?.toLowerCase().includes(q) ||
      l.phone?.includes(q) ||
      l.productInterest?.toLowerCase().includes(q) ||
      l.message?.toLowerCase().includes(q)
  );
}

export function exportLeadsCSV(): string {
  const leads = loadLeads();
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Source', 'Product Interest', 'Status', 'Priority', 'Score', 'Assigned To', 'Created At', 'Message'];
  const rows = leads.map((l) => [
    l.id,
    l.name,
    l.email || '',
    l.phone || '',
    l.source,
    l.productInterest || '',
    l.status,
    l.priority,
    String(l.score),
    l.assignedTo || '',
    l.createdAt,
    (l.message || '').replace(/"/g, '""'),
  ]);
  return [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');
}

export function getLeadAnalytics() {
  const leads = loadLeads();
  const total = leads.length;
  const byStatus = {
    new: leads.filter((l) => l.status === 'new').length,
    contacted: leads.filter((l) => l.status === 'contacted').length,
    qualified: leads.filter((l) => l.status === 'qualified').length,
    converted: leads.filter((l) => l.status === 'converted').length,
    lost: leads.filter((l) => l.status === 'lost').length,
  };
  const bySource = leads.reduce((acc, l) => {
    acc[l.source] = (acc[l.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const conversionRate = total > 0 ? (byStatus.converted / total) * 100 : 0;
  const avgScore = total > 0 ? leads.reduce((s, l) => s + l.score, 0) / total : 0;

  // Today's leads
  const today = new Date().toISOString().split('T')[0];
  const todayLeads = leads.filter((l) => l.createdAt.startsWith(today)).length;

  // This week's leads
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const weeklyLeads = leads.filter((l) => l.createdAt >= weekAgo).length;

  return {
    total,
    byStatus,
    bySource,
    conversionRate: Math.round(conversionRate * 100) / 100,
    avgScore: Math.round(avgScore * 10) / 10,
    todayLeads,
    weeklyLeads,
  };
}
