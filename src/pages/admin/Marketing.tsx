// @ts-nocheck
import { useState, useEffect } from 'react';
import {
  Mail, Send, Users, Eye, MousePointer, Plus, Search, Trash2, X, Clock,
  CheckCircle, AlertTriangle
} from 'lucide-react';

/* ──────────────── Marketing Router ──────────────── */
export default function Marketing({ section = 'mail' }) {
  switch (section) {
    case 'mail':
      return <MailManager />;
    default:
      return <MailManager />;
  }
}

/* ═══════════════════════════════════════════
   MAIL MANAGER
   ═══════════════════════════════════════════ */

function MailManager() {
  const [campaigns, setCampaigns] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_mail_campaigns') || '[]'); }
    catch { return getDefaultCampaigns(); }
  });
  const [contacts, setContacts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_mail_contacts') || '[]'); }
    catch { return getDefaultContacts(); }
  });
  const [activeTab, setActiveTab] = useState('campaigns');
  const [modalOpen, setModalOpen] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ subject: '', to: '', message: '', status: 'Draft' });
  const [search, setSearch] = useState('');

  useEffect(() => { localStorage.setItem('admin_mail_campaigns', JSON.stringify(campaigns)); }, [campaigns]);
  useEffect(() => { localStorage.setItem('admin_mail_contacts', JSON.stringify(contacts)); }, [contacts]);

  const openCompose = () => { setEditing(null); setForm({ subject: '', to: '', message: '', status: 'Draft' }); setComposeOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setComposeOpen(true); };

  const saveCampaign = () => {
    if (!form.subject.trim()) return;
    if (editing) {
      setCampaigns(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c));
    } else {
      setCampaigns(prev => [...prev, { ...form, id: Date.now(), sent: 0, opened: 0, clicked: 0, date: new Date().toISOString().split('T')[0] }]);
    }
    setComposeOpen(false);
  };

  const sendCampaign = (id) => {
    setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: 'Sent', sent: (c.sent || contacts.length) } : c));
  };

  const remove = (id) => { if (confirm('Delete campaign?')) setCampaigns(prev => prev.filter(c => c.id !== id)); };

  const filtered = campaigns.filter(c => !search || c.subject.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    totalSent: campaigns.reduce((s, c) => s + (c.sent || 0), 0),
    totalOpened: campaigns.reduce((s, c) => s + (c.opened || 0), 0),
    totalClicked: campaigns.reduce((s, c) => s + (c.clicked || 0), 0),
    subscribers: contacts.length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Send} label="Total Sent" value={stats.totalSent.toLocaleString('en-IN')} color="#D4AF37" />
        <StatCard icon={Eye} label="Opened" value={stats.totalOpened.toLocaleString('en-IN')} color="#3B82F6" />
        <StatCard icon={MousePointer} label="Clicked" value={stats.totalClicked.toLocaleString('en-IN')} color="#10B981" />
        <StatCard icon={Users} label="Subscribers" value={stats.subscribers.toLocaleString('en-IN')} color="#8B5CF6" />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-white/10">
        {['campaigns', 'subscribers', 'templates'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2.5 text-sm font-medium transition-colors border-b-2 ${
              activeTab === tab ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {activeTab === 'campaigns' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="relative max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search campaigns..." className="w-full h-9 pl-9 pr-3 bg-[#111] border border-white/10 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50" />
            </div>
            <button onClick={openCompose} className="btn-sword flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium self-start">
              <Plus size={16} /> Compose
            </button>
          </div>

          <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 text-xs border-b border-white/10 bg-[#0f0f0f]">
                  <th className="py-3 px-4 font-medium"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></th>
                  <th className="py-3 px-4 font-medium">Subject</th>
                  <th className="py-3 px-4 font-medium">To</th>
                  <th className="py-3 px-4 font-medium">Sent</th>
                  <th className="py-3 px-4 font-medium">Opened</th>
                  <th className="py-3 px-4 font-medium">Clicked</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Date</th>
                  <th className="py-3 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></td>
                    <td className="py-3 px-4 text-gray-300 font-medium">{c.subject}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{c.to || 'All Subscribers'}</td>
                    <td className="py-3 px-4 text-gray-400">{c.sent || 0}</td>
                    <td className="py-3 px-4 text-gray-400">{c.opened || 0}</td>
                    <td className="py-3 px-4 text-gray-400">{c.clicked || 0}</td>
                    <td className="py-3 px-4"><CampaignStatus status={c.status} /></td>
                    <td className="py-3 px-4 text-gray-500 text-xs">{c.date || '-'}</td>
                    <td className="py-3 px-4 text-right flex items-center gap-1 justify-end">
                      {c.status === 'Draft' && (
                        <button onClick={() => sendCampaign(c.id)} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-gray-400 hover:text-emerald-500 transition-colors" title="Send"><Send size={14} /></button>
                      )}
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#D4AF37] transition-colors"><Mail size={14} /></button>
                      <button onClick={() => remove(c.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-center text-gray-500 text-sm py-8">No campaigns found</p>}
          </div>
        </div>
      )}

      {activeTab === 'subscribers' && (
        <div className="bg-[#111] border border-white/10 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 text-xs border-b border-white/10 bg-[#0f0f0f]">
                <th className="py-3 px-4 font-medium"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></th>
                <th className="py-3 px-4 font-medium">Email</th>
                <th className="py-3 px-4 font-medium">Name</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-4 font-medium">Date Added</th>
                <th className="py-3 px-4 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {contacts.map(s => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></td>
                  <td className="py-3 px-4 text-gray-300">{s.email}</td>
                  <td className="py-3 px-4 text-gray-400">{s.name}</td>
                  <td className="py-3 px-4"><CampaignStatus status={s.status} /></td>
                  <td className="py-3 px-4 text-gray-500 text-xs">{s.dateAdded}</td>
                  <td className="py-3 px-4 text-right">
                    <button onClick={() => setContacts(prev => prev.filter(p => p.id !== s.id))} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {getDefaultTemplates().map(tpl => (
            <div key={tpl.id} className="bg-[#111] border border-white/10 rounded-xl p-5 hover:border-white/15 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-[#D4AF37]/10 flex items-center justify-center mb-3">
                <Mail size={18} style={{ color: '#D4AF37' }} />
              </div>
              <h4 className="text-sm font-semibold text-white mb-1">{tpl.name}</h4>
              <p className="text-xs text-gray-500 mb-4">{tpl.description}</p>
              <button onClick={() => { setForm({ subject: tpl.subject, to: '', message: tpl.body, status: 'Draft' }); setComposeOpen(true); }} className="w-full py-2 rounded-lg border border-[#D4AF37]/30 text-[#D4AF37] text-sm font-medium hover:bg-[#D4AF37]/10 transition-colors">
                Use Template
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Compose Modal */}
      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#161616] border border-white/10 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">{editing ? 'Edit Message' : 'Compose Message'}</h3>
              <button onClick={() => setComposeOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">To</label>
                <input value={form.to} onChange={e => setForm({ ...form, to: e.target.value })} placeholder="All Subscribers" className="w-full h-10 px-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Subject</label>
                <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full h-10 px-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#D4AF37]/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Message</label>
                <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={10} className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50 font-mono" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-white/10">
              <button onClick={() => setComposeOpen(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={saveCampaign} className="px-4 py-2 rounded-lg text-sm font-medium bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 hover:bg-[#D4AF37]/30 transition-colors">Save Draft</button>
              <button onClick={() => { saveCampaign(); if (!editing) setTimeout(() => sendCampaign(Date.now()), 100); }} className="btn-sword px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
                <Send size={14} /> Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Sub-components ─── */

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-5 hover:border-white/15 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 font-medium">{label}</span>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + '15' }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function CampaignStatus({ status }) {
  const styles = {
    'Sent': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'Draft': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    'Scheduled': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Active': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'Unsubscribed': 'bg-red-500/10 text-red-500 border-red-500/20',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styles[status] || styles['Draft']}`}>
      {status}
    </span>
  );
}

/* ─── Default Data ─── */

function getDefaultCampaigns() {
  return [
    { id: 1, subject: 'New Year Sale - 20% Off All Purifiers', to: 'All Subscribers', sent: 1240, opened: 486, clicked: 124, status: 'Sent', date: '2026-01-01' },
    { id: 2, subject: 'Summer Filter Replacement Reminder', to: 'All Subscribers', sent: 980, opened: 352, clicked: 89, status: 'Sent', date: '2026-03-15' },
    { id: 3, subject: 'New SWORD Smart RO Launch Announcement', to: 'All Subscribers', sent: 1560, opened: 712, clicked: 245, status: 'Sent', date: '2026-05-01' },
    { id: 4, subject: 'Monsoon Water Safety Guide', to: '', message: '', status: 'Draft', date: '-' },
  ];
}

function getDefaultContacts() {
  return [
    { id: 1, email: 'rahul.sharma@email.com', name: 'Rahul Sharma', status: 'Active', dateAdded: '2026-01-15' },
    { id: 2, email: 'priya.patel@email.com', name: 'Priya Patel', status: 'Active', dateAdded: '2026-02-20' },
    { id: 3, email: 'amit.kumar@email.com', name: 'Amit Kumar', status: 'Active', dateAdded: '2026-03-10' },
    { id: 4, email: 'sneha.gupta@email.com', name: 'Sneha Gupta', status: 'Unsubscribed', dateAdded: '2026-01-05' },
    { id: 5, email: 'vikram.singh@email.com', name: 'Vikram Singh', status: 'Active', dateAdded: '2026-04-01' },
  ];
}

function getDefaultTemplates() {
  return [
    {
      id: 1, name: 'Promotional Offer', description: 'Template for promotional discounts and seasonal sales.',
      subject: 'Special Offer - {{discount}}% Off!', body: 'Dear Customer,\n\nWe are excited to offer you an exclusive {{discount}}% discount on all our water purifiers. Use code {{code}} at checkout.\n\nValid until {{date}}.\n\nBest regards,\nSWORD Team'
    },
    {
      id: 2, name: 'Order Confirmation', description: 'Sent after a successful order placement.',
      subject: 'Order #{{order_id}} Confirmed', body: 'Dear {{customer_name}},\n\nThank you for your order! Your order #{{order_id}} has been confirmed and is being processed.\n\nTotal: ₹{{total}}\n\nWe will notify you once your order ships.\n\nBest regards,\nSWORD Team'
    },
    {
      id: 3, name: 'Shipping Notification', description: 'Sent when an order is shipped.',
      subject: 'Your Order #{{order_id}} Has Shipped!', body: 'Dear {{customer_name}},\n\nYour order #{{order_id}} has been shipped via {{carrier}}.\n\nTracking Number: {{tracking}}\n\nYou can track your shipment at: {{tracking_url}}\n\nBest regards,\nSWORD Team'
    },
    {
      id: 4, name: 'Filter Replacement Reminder', description: 'Remind customers to replace filters.',
      subject: 'Time to Replace Your Filter', body: 'Dear {{customer_name}},\n\nIt has been {{months}} months since your last filter replacement. For optimal water quality, we recommend replacing your filter now.\n\nOrder replacement cartridges at: {{link}}\n\nBest regards,\nSWORD Team'
    },
    {
      id: 5, name: 'Welcome Email', description: 'Sent to new subscribers.',
      subject: 'Welcome to SWORD!', body: 'Dear {{customer_name}},\n\nWelcome to the SWORD family! Thank you for subscribing to our newsletter.\n\nAs a welcome gift, enjoy 10% off your first purchase with code WELCOME10.\n\nBest regards,\nSWORD Team'
    },
    {
      id: 6, name: 'Feedback Request', description: 'Request product review from customers.',
      subject: 'How is your SWORD Smart RO?', body: 'Dear {{customer_name}},\n\nWe hope you are enjoying your SWORD Smart RO water purifier. We would love to hear your feedback!\n\nPlease take a moment to leave a review: {{review_link}}\n\nBest regards,\nSWORD Team'
    },
  ];
}
