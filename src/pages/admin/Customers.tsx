// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Filter, ChevronLeft, ChevronRight, X, Pencil, Trash2
} from 'lucide-react';

/* ──────────────────────── FORMATTING HELPERS ──────────────────────── */

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

/* ──────────────────────── STATUS META ──────────────────────── */

const CUSTOMER_GROUPS = ['Default', 'Wholesale', 'Retailer'];

function groupBadgeCls(group) {
  const g = (group || '').toLowerCase();
  if (g === 'wholesale') return 'bg-purple-500/20 text-purple-400';
  if (g === 'retailer') return 'bg-blue-500/20 text-blue-400';
  return 'bg-gray-500/20 text-gray-400';
}

function statusBadgeCls(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'enabled' || s === 'active' || s === '1' || s === true) return 'bg-emerald-500/20 text-emerald-400';
  if (s === 'disabled' || s === 'inactive' || s === '0' || s === false) return 'bg-red-500/20 text-red-400';
  return 'bg-gray-500/20 text-gray-400';
}

function statusLabel(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'enabled' || s === 'active' || s === '1' || s === true) return 'Enabled';
  if (s === 'disabled' || s === 'inactive' || s === '0' || s === false) return 'Disabled';
  return 'Unknown';
}

/* ──────────────────────── COMPONENT ──────────────────────── */

export default function Customers() {
  /* Local data */
  const [customers, setCustomers] = useState(() =>
    JSON.parse(localStorage.getItem('sword_users') || '[]')
  );

  /* Selection */
  const [selected, setSelected] = useState([]);

  /* Filters */
  const [showFilters, setShowFilters] = useState(true);
  const [fName, setFName] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fGroup, setFGroup] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [fDateAdded, setFDateAdded] = useState('');

  /* Pagination */
  const [page, setPage] = useState(1);
  const perPage = 10;

  /* Add/Edit Modal */
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  /* Form state */
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    telephone: '',
    password: '',
    confirm_password: '',
    customer_group: 'Default',
    status: 'Enabled',
    newsletter: 'Disabled',
    addresses: [],
    history: []
  });

  /* History form */
  const [histComment, setHistComment] = useState('');

  /* ───────── Helpers ───────── */
  function resetForm() {
    setForm({
      first_name: '',
      last_name: '',
      email: '',
      telephone: '',
      password: '',
      confirm_password: '',
      customer_group: 'Default',
      status: 'Enabled',
      newsletter: 'Disabled',
      addresses: [],
      history: []
    });
    setHistComment('');
    setActiveTab('general');
  }

  function openAdd() {
    setEditCustomer(null);
    resetForm();
    setShowModal(true);
  }

  function openEdit(customer) {
    setEditCustomer(customer);
    setForm({
      first_name: customer.first_name || '',
      last_name: customer.last_name || '',
      email: customer.email || '',
      telephone: customer.telephone || customer.phone || '',
      password: '',
      confirm_password: '',
      customer_group: customer.customer_group || customer.group || 'Default',
      status: customer.status !== undefined ? (typeof customer.status === 'boolean' ? (customer.status ? 'Enabled' : 'Disabled') : String(customer.status)) : 'Enabled',
      newsletter: customer.newsletter || 'Disabled',
      addresses: (customer.addresses || []).map(a => ({ ...a })),
      history: (customer.history || []).map(h => ({ ...h }))
    });
    setHistComment('');
    setActiveTab('general');
    setShowModal(true);
  }

  function handleSave() {
    if (!form.email.trim()) {
      alert('Email is required');
      return;
    }
    if (!editCustomer && !form.password) {
      alert('Password is required for new customers');
      return;
    }
    if (form.password && form.password !== form.confirm_password) {
      alert('Passwords do not match');
      return;
    }

    const payload = {
      id: editCustomer ? (editCustomer.id || editCustomer.user_id) : Date.now().toString(),
      first_name: form.first_name,
      last_name: form.last_name,
      name: `${form.first_name} ${form.last_name}`.trim() || form.email,
      email: form.email,
      telephone: form.telephone,
      customer_group: form.customer_group,
      group: form.customer_group,
      status: form.status,
      newsletter: form.newsletter,
      addresses: form.addresses,
      history: form.history,
      ip: editCustomer ? (editCustomer.ip || '127.0.0.1') : '127.0.0.1',
      date_added: editCustomer ? (editCustomer.date_added || editCustomer.created_at) : new Date().toISOString()
    };
    if (form.password) payload.password = form.password;

    let next;
    if (editCustomer) {
      next = customers.map(c => (c.id || c.user_id) === (editCustomer.id || editCustomer.user_id) ? payload : c);
    } else {
      next = [...customers, payload];
    }
    setCustomers(next);
    localStorage.setItem('sword_users', JSON.stringify(next));
    setShowModal(false);
    resetForm();
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this customer?')) return;
    const next = customers.filter(c => (c.id || c.user_id) !== id);
    setCustomers(next);
    localStorage.setItem('sword_users', JSON.stringify(next));
    setSelected([]);
  }

  function handleSelectAll(e) {
    if (e.target.checked) setSelected(pageItems.map(c => c.id || c.user_id));
    else setSelected([]);
  }

  function handleSelect(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function addAddress() {
    setForm(prev => ({
      ...prev,
      addresses: [...prev.addresses, {
        first_name: '', last_name: '', company: '', address_1: '', address_2: '',
        city: '', postcode: '', country: 'India', state: '', default: false
      }]
    }));
  }

  function removeAddress(idx) {
    setForm(prev => ({ ...prev, addresses: prev.addresses.filter((_, i) => i !== idx) }));
  }

  function updateAddress(idx, field, value) {
    setForm(prev => {
      const addresses = prev.addresses.map((a, i) => i === idx ? { ...a, [field]: value } : a);
      return { ...prev, addresses };
    });
  }

  function handleAddHistory() {
    if (!histComment.trim()) return;
    setForm(prev => ({
      ...prev,
      history: [...(prev.history || []), { date: new Date().toISOString(), comment: histComment }]
    }));
    setHistComment('');
  }

  /* ───────── Filters ───────── */
  const filtered = useMemo(() => {
    let list = [...customers];
    if (fName.trim()) {
      const term = fName.trim().toLowerCase();
      list = list.filter(c => {
        const full = `${c.first_name || ''} ${c.last_name || ''} ${c.name || ''}`.toLowerCase();
        return full.includes(term);
      });
    }
    if (fEmail.trim()) {
      list = list.filter(c => (c.email || '').toLowerCase().includes(fEmail.trim().toLowerCase()));
    }
    if (fGroup) {
      list = list.filter(c => (c.customer_group || c.group || 'Default') === fGroup);
    }
    if (fStatus) {
      list = list.filter(c => {
        const s = String(c.status || '').toLowerCase();
        return fStatus === 'Enabled' ? (s === 'enabled' || s === 'active' || s === '1') : (s === 'disabled' || s === 'inactive' || s === '0');
      });
    }
    if (fDateAdded) {
      list = list.filter(c => {
        const cd = new Date(c.date_added || c.created_at);
        const fd = new Date(fDateAdded);
        return cd.toDateString() === fd.toDateString();
      });
    }
    return list.sort((a, b) => new Date(b.date_added || b.created_at || 0) - new Date(a.date_added || a.created_at || 0));
  }, [customers, fName, fEmail, fGroup, fStatus, fDateAdded]);

  /* ───────── Pagination ───────── */
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const clampedPage = Math.min(page, totalPages);
  const startIdx = (clampedPage - 1) * perPage;
  const endIdx = Math.min(startIdx + perPage, totalItems);
  const pageItems = filtered.slice(startIdx, endIdx);

  /* ═══════════════════════ RENDER ═══════════════════════ */

  return (
    <div className="p-6 text-white">
      {/* ────── Top Bar ────── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Customers</h1>
        <button
          onClick={openAdd}
          className="bg-[#D4AF37] hover:bg-[#c4a030] text-black px-4 py-2 rounded flex items-center gap-2 text-sm font-medium transition-colors"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      {/* ────── Filter Panel ────── */}
      <div className="bg-[#111] border border-white/10 rounded-lg mb-6 overflow-hidden">
        <button
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
          onClick={() => setShowFilters(!showFilters)}
        >
          <span className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <Filter size={15} /> Filters
          </span>
          <span className="text-gray-500 text-xs">{showFilters ? 'Hide' : 'Show'}</span>
        </button>
        {showFilters && (
          <div className="px-4 pb-4 border-t border-white/5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mt-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Customer Name</label>
                <input
                  type="text"
                  value={fName}
                  onChange={e => { setFName(e.target.value); setPage(1); }}
                  placeholder="Name"
                  className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Email</label>
                <input
                  type="text"
                  value={fEmail}
                  onChange={e => { setFEmail(e.target.value); setPage(1); }}
                  placeholder="Email address"
                  className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Customer Group</label>
                <select
                  value={fGroup}
                  onChange={e => { setFGroup(e.target.value); setPage(1); }}
                  className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                >
                  <option value="">All Groups</option>
                  {CUSTOMER_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Status</label>
                <select
                  value={fStatus}
                  onChange={e => { setFStatus(e.target.value); setPage(1); }}
                  className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                >
                  <option value="">All</option>
                  <option value="Enabled">Enabled</option>
                  <option value="Disabled">Disabled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Date Added</label>
                <input
                  type="date"
                  value={fDateAdded}
                  onChange={e => { setFDateAdded(e.target.value); setPage(1); }}
                  className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                className="bg-[#D4AF37] hover:bg-[#c4a030] text-black px-4 py-2 rounded text-sm font-medium transition-colors"
                onClick={() => setPage(1)}
              >
                Filter
              </button>
              <button
                className="border border-white/20 hover:border-white/40 text-gray-300 px-4 py-2 rounded text-sm transition-colors"
                onClick={() => {
                  setFName(''); setFEmail(''); setFGroup(''); setFStatus(''); setFDateAdded('');
                  setPage(1);
                }}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ────── Customers Table ────── */}
      <div className="bg-[#111] border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#111] text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={pageItems.length > 0 && pageItems.every(c => selected.includes(c.id || c.user_id))}
                    onChange={handleSelectAll}
                    className="accent-[#D4AF37]"
                  />
                </th>
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Customer Group</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Date Added</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    No customers found.
                  </td>
                </tr>
              )}
              {pageItems.map(customer => {
                const id = customer.id || customer.user_id;
                const name = customer.name || `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Unnamed';
                const group = customer.customer_group || customer.group || 'Default';
                return (
                  <tr key={id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(id)}
                        onChange={() => handleSelect(id)}
                        className="accent-[#D4AF37]"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="text-[#D4AF37] hover:underline font-medium"
                        onClick={() => openEdit(customer)}
                      >
                        {name}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{customer.email || '-'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs px-2 py-1 rounded ${groupBadgeCls(group)}`}>
                        {group}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs px-2 py-1 rounded ${statusBadgeCls(customer.status)}`}>
                        {statusLabel(customer.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{customer.ip || '127.0.0.1'}</td>
                    <td className="px-4 py-3 text-gray-400">{formatDate(customer.date_added || customer.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-1.5 text-gray-400 hover:text-[#D4AF37] transition-colors"
                          title="Edit"
                          onClick={() => openEdit(customer)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                          title="Delete"
                          onClick={() => handleDelete(id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ────── Pagination ────── */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
          <span className="text-xs text-gray-400">
            Showing {totalItems > 0 ? startIdx + 1 : 0} to {endIdx} of {totalItems} ({totalPages} Pages)
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={clampedPage <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1.5 border border-white/10 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`min-w-[28px] px-2 py-1 rounded text-xs font-medium transition-colors ${
                  p === clampedPage ? 'bg-[#D4AF37] text-black' : 'border border-white/10 hover:bg-white/5 text-gray-300'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={clampedPage >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="p-1.5 border border-white/10 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════ ADD / EDIT MODAL ═══════════════ */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-[#111] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg my-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">
                {editCustomer ? 'Edit Customer' : 'Add Customer'}
              </h2>
              <button
                className="p-2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowModal(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 px-6">
              {['general','address','history'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2.5 text-sm border-b-2 transition-colors capitalize ${
                    activeTab === tab
                      ? 'border-[#D4AF37] text-[#D4AF37]'
                      : 'border-transparent text-gray-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* ──────── GENERAL TAB ──────── */}
            {activeTab === 'general' && (
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">First Name</label>
                    <input
                      type="text"
                      value={form.first_name}
                      onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))}
                      className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={form.last_name}
                      onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))}
                      className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Email <span className="text-red-400">*</span></label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Telephone</label>
                    <input
                      type="text"
                      value={form.telephone}
                      onChange={e => setForm(p => ({ ...p, telephone: e.target.value }))}
                      className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Password {editCustomer ? '(leave blank to keep)' : <span className="text-red-400">*</span>}</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                      className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      value={form.confirm_password}
                      onChange={e => setForm(p => ({ ...p, confirm_password: e.target.value }))}
                      className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Customer Group</label>
                    <select
                      value={form.customer_group}
                      onChange={e => setForm(p => ({ ...p, customer_group: e.target.value }))}
                      className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                    >
                      {CUSTOMER_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                      className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                    >
                      <option value="Enabled">Enabled</option>
                      <option value="Disabled">Disabled</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Newsletter</label>
                    <select
                      value={form.newsletter}
                      onChange={e => setForm(p => ({ ...p, newsletter: e.target.value }))}
                      className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                    >
                      <option value="Enabled">Enabled</option>
                      <option value="Disabled">Disabled</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ──────── ADDRESS TAB ──────── */}
            {activeTab === 'address' && (
              <div className="p-6 space-y-6">
                {form.addresses.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-6">No addresses added yet.</div>
                )}
                {form.addresses.map((addr, idx) => (
                  <div key={idx} className="bg-white/[0.03] border border-white/5 rounded p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-white">Address #{idx + 1}</h4>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={!!addr.default}
                            onChange={e => updateAddress(idx, 'default', e.target.checked)}
                            className="accent-[#D4AF37]"
                          />
                          Default
                        </label>
                        <button
                          onClick={() => removeAddress(idx)}
                          className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          title="Remove"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">First Name</label>
                        <input
                          type="text"
                          value={addr.first_name || ''}
                          onChange={e => updateAddress(idx, 'first_name', e.target.value)}
                          className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Last Name</label>
                        <input
                          type="text"
                          value={addr.last_name || ''}
                          onChange={e => updateAddress(idx, 'last_name', e.target.value)}
                          className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Company</label>
                        <input
                          type="text"
                          value={addr.company || ''}
                          onChange={e => updateAddress(idx, 'company', e.target.value)}
                          className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Address 1</label>
                        <input
                          type="text"
                          value={addr.address_1 || ''}
                          onChange={e => updateAddress(idx, 'address_1', e.target.value)}
                          className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Address 2</label>
                        <input
                          type="text"
                          value={addr.address_2 || ''}
                          onChange={e => updateAddress(idx, 'address_2', e.target.value)}
                          className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">City</label>
                        <input
                          type="text"
                          value={addr.city || ''}
                          onChange={e => updateAddress(idx, 'city', e.target.value)}
                          className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Postcode</label>
                        <input
                          type="text"
                          value={addr.postcode || ''}
                          onChange={e => updateAddress(idx, 'postcode', e.target.value)}
                          className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Country</label>
                        <input
                          type="text"
                          value={addr.country || 'India'}
                          onChange={e => updateAddress(idx, 'country', e.target.value)}
                          className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">State / Region</label>
                        <input
                          type="text"
                          value={addr.state || ''}
                          onChange={e => updateAddress(idx, 'state', e.target.value)}
                          className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addAddress}
                  className="bg-[#D4AF37] hover:bg-[#c4a030] text-black px-4 py-2 rounded text-sm font-medium transition-colors"
                >
                  + Add Address
                </button>
              </div>
            )}

            {/* ──────── HISTORY TAB ──────── */}
            {activeTab === 'history' && (
              <div className="p-6 space-y-6">
                {/* Add History */}
                <div className="bg-white/[0.03] border border-white/5 rounded p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Add History</h3>
                  <div className="flex items-start gap-3">
                    <textarea
                      value={histComment}
                      onChange={e => setHistComment(e.target.value)}
                      placeholder="Write a comment..."
                      rows={3}
                      className="flex-1 bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded resize-none"
                    />
                    <button
                      onClick={handleAddHistory}
                      className="bg-[#D4AF37] hover:bg-[#c4a030] text-black px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* History List */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Customer History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#111] text-gray-400 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Comment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(form.history || []).length === 0 && (
                          <tr>
                            <td colSpan={2} className="px-4 py-8 text-center text-gray-500">
                              No history entries yet.
                            </td>
                          </tr>
                        )}
                        {[...(form.history || [])].reverse().map((h, i) => (
                          <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{formatDate(h.date)}</td>
                            <td className="px-4 py-3 text-gray-300">{h.comment || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10">
              <button
                onClick={() => setShowModal(false)}
                className="border border-white/20 hover:border-white/40 text-gray-300 px-4 py-2 rounded text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-[#D4AF37] hover:bg-[#c4a030] text-black px-6 py-2 rounded text-sm font-medium transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
