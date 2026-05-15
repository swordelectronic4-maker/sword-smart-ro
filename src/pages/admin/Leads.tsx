import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Eye,
  Users,
  UserPlus,
  PhoneCall,
  CheckCircle,
  XCircle,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Mail,
  Calendar,
  Hash,
  Bot,
  FileText,
  PhoneIncoming,
  ChevronLeft,
  ChevronRight,
  ChevronFirst,
  ChevronLast,
  RefreshCw,
  MoreHorizontal,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  TYPES                                                              */
/* ------------------------------------------------------------------ */

interface InterestedCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'chatbot' | 'contact_form' | 'callback_request';
  message?: string;
  timestamp: string;
  pageViewed?: string;
  status: 'new' | 'contacted' | 'converted' | 'lost';
  conversationHistory?: ChatMessage[];
}

interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
  timestamp: string;
}

interface StatusChangeRecord {
  from: string;
  to: string;
  timestamp: string;
}

type SourceFilter = 'all' | 'chatbot' | 'contact_form' | 'callback_request';
type StatusFilter = 'all' | 'new' | 'contacted' | 'converted' | 'lost';
type SortField = 'name' | 'email' | 'source' | 'status' | 'timestamp';
type SortDir = 'asc' | 'desc';

/* ------------------------------------------------------------------ */
/*  CONSTANTS                                                          */
/* ------------------------------------------------------------------ */

const LS_KEY = 'sword_interested_customers';

const STATUS_META: Record<
  InterestedCustomer['status'],
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  new: {
    label: 'New',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    icon: <UserPlus size={12} />,
  },
  contacted: {
    label: 'Contacted',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    border: 'border-blue-400/20',
    icon: <PhoneCall size={12} />,
  },
  converted: {
    label: 'Converted',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400/20',
    icon: <CheckCircle size={12} />,
  },
  lost: {
    label: 'Lost',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
    border: 'border-red-400/20',
    icon: <XCircle size={12} />,
  },
};

const SOURCE_META: Record<
  InterestedCustomer['source'],
  { label: string; color: string; bg: string; border: string; icon: React.ReactNode }
> = {
  chatbot: {
    label: 'Chatbot',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    border: 'border-purple-400/20',
    icon: <Bot size={12} />,
  },
  contact_form: {
    label: 'Contact Form',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    border: 'border-cyan-400/20',
    icon: <FileText size={12} />,
  },
  callback_request: {
    label: 'Callback',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
    border: 'border-orange-400/20',
    icon: <PhoneIncoming size={12} />,
  },
};

const DEMO_LEADS: InterestedCustomer[] = [
  {
    id: 'lead_1',
    name: 'Rahul Sharma',
    email: 'rahul.s@gmail.com',
    phone: '+91 98765 43210',
    source: 'chatbot',
    message: 'Interested in SWORD purifier for my home in Mumbai',
    timestamp: '2026-05-10T09:30:00Z',
    status: 'new',
    conversationHistory: [
      { role: 'user', text: 'Hi, I want a water purifier for my home', timestamp: '2026-05-10T09:25:00Z' },
      { role: 'bot', text: 'Hello! We have great options. What is your location?', timestamp: '2026-05-10T09:26:00Z' },
      { role: 'user', text: 'Mumbai, 3BHK', timestamp: '2026-05-10T09:28:00Z' },
      { role: 'bot', text: 'Our SWORD purifier is ideal. May I have your details?', timestamp: '2026-05-10T09:29:00Z' },
    ],
  },
  {
    id: 'lead_2',
    name: 'Priya Patel',
    email: 'priya.p@yahoo.com',
    phone: '+91 99887 66554',
    source: 'contact_form',
    message: 'Need AMC plan details for my existing SWORD purifier',
    timestamp: '2026-05-11T10:15:00Z',
    status: 'contacted',
  },
  {
    id: 'lead_3',
    name: 'Amit Kumar',
    email: 'amit.k@outlook.com',
    phone: '+91 97654 32109',
    source: 'chatbot',
    message: 'Want to know about mineral retention vs normal RO technology',
    timestamp: '2026-05-12T11:00:00Z',
    status: 'new',
    conversationHistory: [
      { role: 'user', text: 'How is SWORD different from Kent or Aquaguard?', timestamp: '2026-05-12T10:55:00Z' },
      { role: 'bot', text: 'SWORD retains essential minerals. Shall I explain more?', timestamp: '2026-05-12T10:56:00Z' },
      { role: 'user', text: 'Yes please', timestamp: '2026-05-12T10:58:00Z' },
    ],
  },
  {
    id: 'lead_4',
    name: 'Sneha Gupta',
    email: 'sneha.g@gmail.com',
    phone: '+91 96543 21098',
    source: 'callback_request',
    message: 'Please call me regarding installation',
    timestamp: '2026-05-13T11:30:00Z',
    status: 'converted',
  },
  {
    id: 'lead_5',
    name: 'Vikram Rao',
    email: 'vikram.r@rediff.com',
    phone: '+91 95432 10987',
    source: 'chatbot',
    message: 'What is the warranty period and AMC cost for SWORD purifier?',
    timestamp: '2026-05-14T12:00:00Z',
    status: 'new',
  },
  {
    id: 'lead_6',
    name: 'Ananya Iyer',
    email: 'ananya.i@hotmail.com',
    phone: '+91 94321 09876',
    source: 'contact_form',
    message: 'Looking for commercial purifier for office use in Bangalore',
    timestamp: '2026-05-14T14:30:00Z',
    status: 'new',
  },
  {
    id: 'lead_7',
    name: 'Deepak Mehta',
    email: 'deepak.m@gmail.com',
    phone: '+91 93210 98765',
    source: 'callback_request',
    message: 'Need callback for water quality test appointment',
    timestamp: '2026-05-15T09:00:00Z',
    status: 'contacted',
  },
  {
    id: 'lead_8',
    name: 'Kavita Reddy',
    email: 'kavita.r@gmail.com',
    phone: '+91 92109 87654',
    source: 'chatbot',
    message: 'Comparing models, need expert advice',
    timestamp: '2026-05-15T16:45:00Z',
    status: 'lost',
    conversationHistory: [
      { role: 'user', text: 'What are the price ranges?', timestamp: '2026-05-15T16:40:00Z' },
      { role: 'bot', text: 'Models range from 12K to 35K. What is your budget?', timestamp: '2026-05-15T16:41:00Z' },
      { role: 'user', text: 'That is too expensive for me', timestamp: '2026-05-15T16:44:00Z' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  HELPER FUNCTIONS                                                   */
/* ------------------------------------------------------------------ */

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function timeAgo(iso: string): string {
  const now = new Date().getTime();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
}

function escapeCSV(val: string): string {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function exportCSV(rows: InterestedCustomer[]) {
  const headers = ['ID', 'Name', 'Email', 'Phone', 'Source', 'Message', 'Status', 'Date Added'];
  const lines = rows.map((r) =>
    [
      escapeCSV(r.id),
      escapeCSV(r.name),
      escapeCSV(r.email),
      escapeCSV(r.phone),
      escapeCSV(r.source),
      escapeCSV(r.message || ''),
      escapeCSV(r.status),
      escapeCSV(formatDate(r.timestamp)),
    ].join(',')
  );
  const csv = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `leads_export_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function loadLeads(): InterestedCustomer[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLeads(leads: InterestedCustomer[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(leads));
}

function seedIfEmpty() {
  const existing = loadLeads();
  if (existing.length === 0) {
    saveLeads(DEMO_LEADS);
    return DEMO_LEADS;
  }
  return existing;
}

/* ------------------------------------------------------------------ */
/*  STATUS DROPDOWN COMPONENT                                          */
/* ------------------------------------------------------------------ */

function StatusDropdown({
  current,
  onChange,
}: {
  current: InterestedCustomer['status'];
  onChange: (s: InterestedCustomer['status']) => void;
}) {
  const [open, setOpen] = useState(false);
  const meta = STATUS_META[current];

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${meta.bg} ${meta.color} ${meta.border} hover:opacity-80 transition-opacity`}
      >
        {meta.icon}
        {meta.label}
        <ChevronDown size={10} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1 right-0 bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl overflow-hidden min-w-[130px]">
            {(Object.keys(STATUS_META) as InterestedCustomer['status'][]).map((s) => {
              const m = STATUS_META[s];
              return (
                <button
                  key={s}
                  onClick={() => {
                    onChange(s);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium hover:bg-[#2a2a2a] transition-colors ${
                    s === current ? m.color : 'text-gray-300'
                  }`}
                >
                  {m.icon}
                  {m.label}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DETAIL MODAL                                                       */
/* ------------------------------------------------------------------ */

function LeadDetailModal({
  lead,
  onClose,
  onStatusChange,
}: {
  lead: InterestedCustomer | null;
  onClose: () => void;
  onStatusChange: (id: string, st: InterestedCustomer['status']) => void;
}) {
  if (!lead) return null;

  const statusMeta = STATUS_META[lead.status];
  const sourceMeta = SOURCE_META[lead.source];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-[#333] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
              <Users size={18} className="text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{lead.name}</h2>
              <p className="text-xs text-gray-500">{lead.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#222] text-gray-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem icon={<Mail size={14} />} label="Email" value={lead.email} />
            <InfoItem icon={<PhoneCall size={14} />} label="Phone" value={lead.phone} />
            <InfoItem
              icon={sourceMeta.icon}
              label="Source"
              value={
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sourceMeta.bg} ${sourceMeta.color} ${sourceMeta.border}`}>
                  {sourceMeta.icon}
                  {sourceMeta.label}
                </span>
              }
            />
            <InfoItem
              icon={<Calendar size={14} />}
              label="Date Added"
              value={formatDate(lead.timestamp)}
            />
          </div>

          {/* Status Row */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
            <span className="text-sm text-gray-400">Status:</span>
            <StatusDropdown
              current={lead.status}
              onChange={(s) => onStatusChange(lead.id, s)}
            />
          </div>

          {/* Message */}
          {lead.message && (
            <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
              <div className="flex items-center gap-2 mb-2 text-gray-400">
                <MessageSquare size={14} />
                <span className="text-xs font-medium uppercase tracking-wide">Message</span>
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">{lead.message}</p>
            </div>
          )}

          {/* Page Viewed */}
          {lead.pageViewed && (
            <InfoItem
              icon={<Eye size={14} />}
              label="Page Viewed"
              value={lead.pageViewed}
            />
          )}

          {/* Conversation History */}
          {lead.conversationHistory && lead.conversationHistory.length > 0 && (
            <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a]">
              <div className="flex items-center gap-2 mb-3 text-gray-400">
                <Bot size={14} />
                <span className="text-xs font-medium uppercase tracking-wide">
                  Chatbot Conversation
                </span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {lead.conversationHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-3 py-2 rounded-lg text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-gray-200'
                          : 'bg-[#222] border border-[#333] text-gray-300'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p className="mt-1 text-[10px] text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-[#222]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#222] text-gray-300 text-sm font-medium hover:bg-[#2a2a2a] transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="mt-0.5 text-gray-500">{icon}</span>
      <div>
        <p className="text-[11px] text-gray-500 uppercase tracking-wide">{label}</p>
        <div className="text-sm text-gray-200 mt-0.5">{value}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PAGINATION COMPONENT                                               */
/* ------------------------------------------------------------------ */

function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}) {
  const start = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-[#222]">
      <p className="text-xs text-gray-500">
        Showing {start} to {end} of {totalItems} leads
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={page === 1}
          className="p-1.5 rounded-md hover:bg-[#222] text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronFirst size={14} />
        </button>
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-1.5 rounded-md hover:bg-[#222] text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="px-2 text-xs text-gray-400">
          {page} / {totalPages || 1}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages || totalPages === 0}
          className="p-1.5 rounded-md hover:bg-[#222] text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={page === totalPages || totalPages === 0}
          className="p-1.5 rounded-md hover:bg-[#222] text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLast size={14} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN LEADS COMPONENT                                               */
/* ------------------------------------------------------------------ */

export default function Leads() {
  /* -- state -- */
  const [leads, setLeads] = useState<InterestedCustomer[]>([]);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('timestamp');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [detailLead, setDetailLead] = useState<InterestedCustomer | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  /* -- load & seed -- */
  useEffect(() => {
    const data = seedIfEmpty();
    setLeads(data);
  }, [refreshTick]);

  /* -- stats -- */
  const stats = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((l) => l.status === 'new').length;
    const contacted = leads.filter((l) => l.status === 'contacted').length;
    const converted = leads.filter((l) => l.status === 'converted').length;
    const lost = leads.filter((l) => l.status === 'lost').length;
    return { total, new: newCount, contacted, converted, lost };
  }, [leads]);

  /* -- filtered & sorted leads -- */
  const filtered = useMemo(() => {
    let rows = [...leads];

    // search
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q) ||
          l.id.toLowerCase().includes(q)
      );
    }

    // source filter
    if (sourceFilter !== 'all') {
      rows = rows.filter((l) => l.source === sourceFilter);
    }

    // status filter
    if (statusFilter !== 'all') {
      rows = rows.filter((l) => l.status === statusFilter);
    }

    // sort
    rows.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'email':
          cmp = a.email.localeCompare(b.email);
          break;
        case 'source':
          cmp = a.source.localeCompare(b.source);
          break;
        case 'status':
          cmp = a.status.localeCompare(b.status);
          break;
        case 'timestamp':
          cmp = new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return rows;
  }, [leads, search, sourceFilter, statusFilter, sortField, sortDir]);

  /* -- paginated -- */
  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  /* -- reset page on filter change -- */
  useEffect(() => {
    setPage(1);
  }, [search, sourceFilter, statusFilter]);

  /* -- handlers -- */
  const toggleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir('asc');
      }
    },
    [sortField]
  );

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    const currentIds = new Set(paginated.map((l) => l.id));
    const allSelected = [...currentIds].every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        currentIds.forEach((id) => next.delete(id));
      } else {
        currentIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [paginated, selectedIds]);

  const updateStatus = useCallback(
    (id: string, newStatus: InterestedCustomer['status']) => {
      setLeads((prev) => {
        const next = prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l));
        saveLeads(next);
        return next;
      });
      if (detailLead && detailLead.id === id) {
        setDetailLead({ ...detailLead, status: newStatus });
      }
    },
    [detailLead]
  );

  const bulkDelete = useCallback(() => {
    if (!selectedIds.size) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected lead(s)?`)) return;
    setLeads((prev) => {
      const next = prev.filter((l) => !selectedIds.has(l.id));
      saveLeads(next);
      return next;
    });
    setSelectedIds(new Set());
  }, [selectedIds]);

  const bulkStatusChange = useCallback(
    (newStatus: InterestedCustomer['status']) => {
      if (!selectedIds.size) return;
      setLeads((prev) => {
        const next = prev.map((l) =>
          selectedIds.has(l.id) ? { ...l, status: newStatus } : l
        );
        saveLeads(next);
        return next;
      });
      setSelectedIds(new Set());
    },
    [selectedIds]
  );

  const deleteLead = useCallback((id: string) => {
    if (!window.confirm('Delete this lead?')) return;
    setLeads((prev) => {
      const next = prev.filter((l) => l.id !== id);
      saveLeads(next);
      return next;
    });
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const clearFilters = useCallback(() => {
    setSearch('');
    setSourceFilter('all');
    setStatusFilter('all');
    setSortField('timestamp');
    setSortDir('desc');
  }, []);

  const allSelectedOnPage =
    paginated.length > 0 && paginated.every((l) => selectedIds.has(l.id));
  const someSelectedOnPage =
    paginated.some((l) => selectedIds.has(l.id)) && !allSelectedOnPage;

  /* -- sort indicator -- */
  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field)
      return <MoreHorizontal size={12} className="text-gray-600 ml-1" />;
    return sortDir === 'asc' ? (
      <ChevronUp size={12} className="text-[#D4AF37] ml-1" />
    ) : (
      <ChevronDown size={12} className="text-[#D4AF37] ml-1" />
    );
  }

  /* -- stat card helper -- */
  function StatCard({
    label,
    value,
    icon,
    accent,
  }: {
    label: string;
    value: number;
    icon: React.ReactNode;
    accent: string;
  }) {
    return (
      <div className="bg-[#111] border border-[#222] rounded-xl p-4 flex items-center gap-4 hover:border-[#333] transition-colors">
        <div
          className="w-11 h-11 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${accent}15`, border: `1px solid ${accent}25` }}
        >
          <span style={{ color: accent }}>{icon}</span>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{label}</p>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------------- */
  /*  RENDER                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-gray-100">
      {/* Page Header */}
      <div className="px-6 py-5 border-b border-[#1a1a1a] flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Users size={20} className="text-[#D4AF37]" />
            Leads Management
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Manage leads from chatbot, contact forms & callback requests
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRefreshTick((t) => t + 1)}
            className="p-2 rounded-lg bg-[#111] border border-[#222] text-gray-400 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => exportCSV(filtered)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4AF37] text-black text-sm font-semibold hover:bg-[#C4A030] transition-colors"
          >
            <Download size={14} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="Total Leads" value={stats.total} icon={<Users size={20} />} accent="#D4AF37" />
          <StatCard label="New" value={stats.new} icon={<UserPlus size={20} />} accent="#fbbf24" />
          <StatCard label="Contacted" value={stats.contacted} icon={<PhoneCall size={20} />} accent="#60a5fa" />
          <StatCard label="Converted" value={stats.converted} icon={<CheckCircle size={20} />} accent="#34d399" />
          <StatCard label="Lost" value={stats.lost} icon={<XCircle size={20} />} accent="#f87171" />
        </div>

        {/* Filter Bar */}
        <div className="bg-[#111] border border-[#222] rounded-xl">
          <div className="px-5 py-3 border-b border-[#222] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-[#D4AF37]" />
              <span className="text-sm font-medium text-gray-300">Filters</span>
              {(search || sourceFilter !== 'all' || statusFilter !== 'all') && (
                <button
                  onClick={clearFilters}
                  className="ml-2 text-xs text-gray-500 hover:text-[#D4AF37] underline transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showFilters ? 'Hide' : 'Show'}
            </button>
          </div>

          {showFilters && (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search name, email, phone..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all"
                />
              </div>

              {/* Source Filter */}
              <div className="relative">
                <Bot size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as SourceFilter)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-200 appearance-none focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all cursor-pointer"
                >
                  <option value="all">All Sources</option>
                  <option value="chatbot">Chatbot</option>
                  <option value="contact_form">Contact Form</option>
                  <option value="callback_request">Callback Request</option>
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Hash size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="w-full pl-9 pr-8 py-2.5 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] text-sm text-gray-200 appearance-none focus:outline-none focus:border-[#D4AF37]/50 focus:ring-1 focus:ring-[#D4AF37]/20 transition-all cursor-pointer"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="converted">Converted</option>
                  <option value="lost">Lost</option>
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>

              {/* CSV Export (small screen fallback) */}
              <div className="hidden lg:block" />
            </div>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-lg">
            <span className="text-sm text-[#D4AF37] font-medium">
              {selectedIds.size} selected
            </span>
            <div className="h-4 w-px bg-[#D4AF37]/20" />
            <span className="text-xs text-gray-500">Change status:</span>
            {(Object.keys(STATUS_META) as InterestedCustomer['status'][]).map((s) => (
              <button
                key={s}
                onClick={() => bulkStatusChange(s)}
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_META[s].bg} ${STATUS_META[s].color} ${STATUS_META[s].border} border hover:opacity-80 transition-opacity`}
              >
                {STATUS_META[s].label}
              </button>
            ))}
            <div className="h-4 w-px bg-[#D4AF37]/20 ml-2" />
            <button
              onClick={bulkDelete}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
            >
              <Trash2 size={12} />
              Delete
            </button>
          </div>
        )}

        {/* Leads Table */}
        <div className="bg-[#111] border border-[#222] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#222] bg-[#0f0f0f]">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelectedOnPage}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelectedOnPage;
                      }}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-[#333] bg-[#1a1a1a] text-[#D4AF37] focus:ring-[#D4AF37]/20 focus:ring-offset-0 cursor-pointer"
                    />
                  </th>
                  <th className="px-3 py-3 text-left">
                    <button
                      onClick={() => toggleSort('name')}
                      className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
                    >
                      Lead
                      <SortIcon field="name" />
                    </button>
                  </th>
                  <th className="px-3 py-3 text-left">
                    <button
                      onClick={() => toggleSort('email')}
                      className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
                    >
                      Contact
                      <SortIcon field="email" />
                    </button>
                  </th>
                  <th className="px-3 py-3 text-left">
                    <button
                      onClick={() => toggleSort('source')}
                      className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
                    >
                      Source
                      <SortIcon field="source" />
                    </button>
                  </th>
                  <th className="px-3 py-3 text-left">
                    <button
                      onClick={() => toggleSort('status')}
                      className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
                    >
                      Status
                      <SortIcon field="status" />
                    </button>
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-3 py-3 text-left">
                    <button
                      onClick={() => toggleSort('timestamp')}
                      className="flex items-center text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-300 transition-colors"
                    >
                      Date
                      <SortIcon field="timestamp" />
                    </button>
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider w-20">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <Users size={32} className="mx-auto text-gray-700 mb-3" />
                      <p className="text-gray-500 text-sm">No leads found</p>
                      <p className="text-gray-600 text-xs mt-1">
                        Try adjusting your filters or search
                      </p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((lead) => {
                    const isSelected = selectedIds.has(lead.id);
                    const statusMeta = STATUS_META[lead.status];
                    const sourceMeta = SOURCE_META[lead.source];

                    return (
                      <tr
                        key={lead.id}
                        className={`border-b border-[#1a1a1a] hover:bg-[#161616] transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#D4AF37]/5' : ''
                        }`}
                        onClick={() => setDetailLead(lead)}
                      >
                        {/* Checkbox */}
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(lead.id)}
                            className="w-4 h-4 rounded border-[#333] bg-[#1a1a1a] text-[#D4AF37] focus:ring-[#D4AF37]/20 focus:ring-offset-0 cursor-pointer"
                          />
                        </td>

                        {/* Lead (Name + ID) */}
                        <td className="px-3 py-3">
                          <p className="font-medium text-gray-200">{lead.name}</p>
                          <p className="text-[11px] text-gray-600 mt-0.5">{lead.id}</p>
                        </td>

                        {/* Contact */}
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5 text-gray-300">
                            <Mail size={11} className="text-gray-600 shrink-0" />
                            <span className="text-xs">{lead.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400 mt-0.5">
                            <PhoneCall size={11} className="text-gray-600 shrink-0" />
                            <span className="text-xs">{lead.phone}</span>
                          </div>
                        </td>

                        {/* Source */}
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sourceMeta.bg} ${sourceMeta.color} ${sourceMeta.border} border`}
                          >
                            {sourceMeta.icon}
                            {sourceMeta.label}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                          <StatusDropdown
                            current={lead.status}
                            onChange={(s) => updateStatus(lead.id, s)}
                          />
                        </td>

                        {/* Message */}
                        <td className="px-3 py-3 max-w-[200px]">
                          {lead.message ? (
                            <div className="group relative">
                              <p className="text-xs text-gray-400 truncate">{lead.message}</p>
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-30">
                                <div className="bg-[#1a1a1a] border border-[#333] rounded-lg shadow-xl px-3 py-2 max-w-xs">
                                  <p className="text-xs text-gray-300 leading-relaxed">
                                    {lead.message}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-600 italic">No message</span>
                          )}
                        </td>

                        {/* Date */}
                        <td className="px-3 py-3">
                          <p className="text-xs text-gray-400">{formatDate(lead.timestamp)}</p>
                          <p className="text-[10px] text-gray-600 mt-0.5">
                            {timeAgo(lead.timestamp)}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="px-3 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDetailLead(lead);
                              }}
                              className="p-1.5 rounded-md text-gray-500 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteLead(lead.id);
                              }}
                              className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Detail Modal */}
      {detailLead && (
        <LeadDetailModal
          lead={detailLead}
          onClose={() => setDetailLead(null)}
          onStatusChange={updateStatus}
        />
      )}
    </div>
  );
}
