// @ts-nocheck
import React, { useState, useMemo } from 'react';
import {
  Plus, Search, Filter, ChevronLeft, ChevronRight, X, Eye,
  FileText, Truck, Trash2
} from 'lucide-react';

/* ──────────────────────── STATUS HELPERS ──────────────────────── */

const STATUS_META = {
  'pending':       { label: 'Pending',       cls: 'bg-yellow-500/20 text-yellow-400' },
  'processing':    { label: 'Processing',    cls: 'bg-blue-500/20 text-blue-400' },
  'shipped':       { label: 'Shipped',       cls: 'bg-purple-500/20 text-purple-400' },
  'complete':      { label: 'Complete',      cls: 'bg-emerald-500/20 text-emerald-400' },
  'delivered':     { label: 'Delivered',     cls: 'bg-emerald-500/20 text-emerald-400' },
  'cancelled':     { label: 'Cancelled',     cls: 'bg-red-500/20 text-red-400' },
  'canceled':      { label: 'Canceled',      cls: 'bg-red-500/20 text-red-400' },
  'refunded':      { label: 'Refunded',      cls: 'bg-red-500/20 text-red-400' },
  'failed':        { label: 'Failed',        cls: 'bg-red-500/20 text-red-400' },
  'expired':       { label: 'Expired',       cls: 'bg-gray-500/20 text-gray-400' },
  'denied':        { label: 'Denied',        cls: 'bg-gray-500/20 text-gray-400' },
  'voided':        { label: 'Voided',        cls: 'bg-gray-500/20 text-gray-400' },
  'missing orders':{ label: 'Missing Orders', cls: 'bg-gray-500/20 text-gray-400' },
  'chargeback':    { label: 'Chargeback',    cls: 'bg-red-500/20 text-red-400' },
  'canceled reversal': { label: 'Canceled Reversal', cls: 'bg-gray-500/20 text-gray-400' },
  'reversed':      { label: 'Reversed',      cls: 'bg-gray-500/20 text-gray-400' },
  'processed':     { label: 'Processed',     cls: 'bg-blue-500/20 text-blue-400' },
};

const ALL_ORDER_STATUSES = [
  'Missing Orders','Canceled','Canceled Reversal','Chargeback','Complete',
  'Denied','Expired','Failed','Pending','Processed','Processing',
  'Refunded','Reversed','Shipped','Voided'
];

function getStatusMeta(status) {
  const key = (status || '').toString().toLowerCase().trim();
  return STATUS_META[key] || { label: status || 'Unknown', cls: 'bg-gray-500/20 text-gray-400' };
}

/* ──────────────────────── FORMATTING HELPERS ──────────────────────── */

function formatCurrency(amount) {
  const n = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  return `\u20B9${n.toFixed(2)}`;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function formatShortDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

/* ──────────────────────── COMPONENT ──────────────────────── */

export default function Orders() {
  /* Local data */
  const [orders, setOrders] = useState(() =>
    JSON.parse(localStorage.getItem('sword_orders') || '[]')
  );

  /* Selection */
  const [selected, setSelected] = useState([]);

  /* Filters */
  const [showFilters, setShowFilters] = useState(true);
  const [fOrderId, setFOrderId] = useState('');
  const [fCustomer, setFCustomer] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [fTotal, setFTotal] = useState('');
  const [fDateAdded, setFDateAdded] = useState('');
  const [fDateModified, setFDateModified] = useState('');

  /* Pagination */
  const [page, setPage] = useState(1);
  const perPage = 10;

  /* Modal */
  const [detailOrder, setDetailOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('details');

  /* History form (inside modal) */
  const [histStatus, setHistStatus] = useState('');
  const [histNotify, setHistNotify] = useState(false);
  const [histComment, setHistComment] = useState('');

  /* ───────── Filtered data ───────── */
  const filtered = useMemo(() => {
    let list = [...orders];
    if (fOrderId.trim()) list = list.filter(o => String(o.id || o.order_id || '').includes(fOrderId.trim()));
    if (fCustomer.trim()) {
      list = list.filter(o => {
        const name = `${o.customer_name || o.customer || ''} ${o.email || ''}`.toLowerCase();
        return name.includes(fCustomer.trim().toLowerCase());
      });
    }
    if (fStatus) {
      list = list.filter(o => String(o.status || '').toLowerCase() === fStatus.toLowerCase());
    }
    if (fTotal.trim()) list = list.filter(o => {
      const t = parseFloat(o.total || o.grand_total || 0);
      return String(t).includes(fTotal.trim());
    });
    if (fDateAdded) list = list.filter(o => {
      const od = new Date(o.date_added || o.created_at);
      const fd = new Date(fDateAdded);
      return od.toDateString() === fd.toDateString();
    });
    if (fDateModified) list = list.filter(o => {
      const od = new Date(o.date_modified || o.updated_at || o.date_added || o.created_at);
      const fd = new Date(fDateModified);
      return od.toDateString() === fd.toDateString();
    });
    return list.sort((a, b) => new Date(b.date_added || b.created_at || 0) - new Date(a.date_added || a.created_at || 0));
  }, [orders, fOrderId, fCustomer, fStatus, fTotal, fDateAdded, fDateModified]);

  /* ───────── Pagination ───────── */
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const clampedPage = Math.min(page, totalPages);
  const startIdx = (clampedPage - 1) * perPage;
  const endIdx = Math.min(startIdx + perPage, totalItems);
  const pageItems = filtered.slice(startIdx, endIdx);

  /* ───────── Handlers ───────── */
  function handleSelectAll(e) {
    if (e.target.checked) setSelected(pageItems.map(o => o.id || o.order_id));
    else setSelected([]);
  }

  function handleSelect(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  function clearFilters() {
    setFOrderId('');
    setFCustomer('');
    setFStatus('');
    setFTotal('');
    setFDateAdded('');
    setFDateModified('');
    setPage(1);
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this order?')) return;
    const next = orders.filter(o => (o.id || o.order_id) !== id);
    setOrders(next);
    localStorage.setItem('sword_orders', JSON.stringify(next));
    setSelected([]);
  }

  function handleAddHistory() {
    if (!detailOrder || !histStatus) return;
    const entry = {
      date: new Date().toISOString(),
      status: histStatus,
      comment: histComment,
      notified: histNotify ? 'Yes' : 'No'
    };
    const history = [...(detailOrder.history || []), entry];
    const updated = { ...detailOrder, history };
    /* Also update order status if changed */
    if (histStatus !== detailOrder.status) {
      updated.status = histStatus;
      updated.date_modified = new Date().toISOString();
    }
    /* Persist */
    const nextOrders = orders.map(o => (o.id || o.order_id) === (updated.id || updated.order_id) ? updated : o);
    setOrders(nextOrders);
    localStorage.setItem('sword_orders', JSON.stringify(nextOrders));
    setDetailOrder(updated);
    setHistStatus('');
    setHistComment('');
    setHistNotify(false);
  }

  /* ═══════════════════════ RENDER ═══════════════════════ */

  return (
    <div className="p-6 text-white">
      {/* ────── Top Bar ────── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-white">Orders</h1>
        <button className="bg-[#D4AF37] hover:bg-[#c4a030] text-black px-4 py-2 rounded flex items-center gap-2 text-sm font-medium transition-colors">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mt-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Order ID</label>
                <input
                  type="text"
                  value={fOrderId}
                  onChange={e => { setFOrderId(e.target.value); setPage(1); }}
                  placeholder="Order ID"
                  className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Customer</label>
                <input
                  type="text"
                  value={fCustomer}
                  onChange={e => { setFCustomer(e.target.value); setPage(1); }}
                  placeholder="Customer name or email"
                  className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Order Status</label>
                <select
                  value={fStatus}
                  onChange={e => { setFStatus(e.target.value); setPage(1); }}
                  className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                >
                  <option value="">All Statuses</option>
                  {ALL_ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Total</label>
                <input
                  type="text"
                  value={fTotal}
                  onChange={e => { setFTotal(e.target.value); setPage(1); }}
                  placeholder="e.g. 1200"
                  className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                />
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
              <div>
                <label className="block text-xs text-gray-400 mb-1">Date Modified</label>
                <input
                  type="date"
                  value={fDateModified}
                  onChange={e => { setFDateModified(e.target.value); setPage(1); }}
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
                onClick={clearFilters}
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ────── Orders Table ────── */}
      <div className="bg-[#111] border border-white/10 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#111] text-gray-400 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={pageItems.length > 0 && pageItems.every(o => selected.includes(o.id || o.order_id))}
                    onChange={handleSelectAll}
                    className="accent-[#D4AF37]"
                  />
                </th>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Date Added</th>
                <th className="px-4 py-3">Date Modified</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
              {pageItems.map(order => {
                const id = order.id || order.order_id;
                const meta = getStatusMeta(order.status);
                const customerName = order.customer_name || order.customer || order.billing_name || 'Guest';
                const email = order.email || order.customer_email || '-';
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
                        onClick={() => { setDetailOrder(order); setActiveTab('details'); }}
                      >
                        #{id}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{customerName}</div>
                      <div className="text-xs text-gray-400">{email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block text-xs px-2 py-1 rounded ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">{formatCurrency(order.total || order.grand_total)}</td>
                    <td className="px-4 py-3 text-gray-400">{formatShortDate(order.date_added || order.created_at)}</td>
                    <td className="px-4 py-3 text-gray-400">{formatShortDate(order.date_modified || order.updated_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-1.5 text-gray-400 hover:text-[#D4AF37] transition-colors"
                          title="View"
                          onClick={() => { setDetailOrder(order); setActiveTab('details'); }}
                        >
                          <Eye size={15} />
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

      {/* ═══════════════ ORDER DETAIL MODAL ═══════════════ */}
      {detailOrder && (
        <div
          className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setDetailOrder(null)}
        >
          <div
            className="bg-[#111] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg my-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Order #{detailOrder.id || detailOrder.order_id}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Invoice No: {detailOrder.invoice_no || detailOrder.invoice || '—'} &nbsp;|&nbsp;
                  {formatDate(detailOrder.date_added || detailOrder.created_at)}
                </p>
              </div>
              <button
                className="p-2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setDetailOrder(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 px-6">
              {['details','products','history'].map(tab => (
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

            {/* ──────── DETAILS TAB ──────── */}
            {activeTab === 'details' && (
              <div className="p-6 space-y-6">
                {/* Customer info row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white/[0.03] border border-white/5 rounded p-4">
                    <div className="text-xs text-gray-400 mb-1">Customer Name</div>
                    <div className="text-sm text-white font-medium">
                      {detailOrder.customer_name || detailOrder.customer || detailOrder.billing_name || 'Guest'}
                    </div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded p-4">
                    <div className="text-xs text-gray-400 mb-1">Email</div>
                    <div className="text-sm text-white font-medium">{detailOrder.email || detailOrder.customer_email || '—'}</div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded p-4">
                    <div className="text-xs text-gray-400 mb-1">Phone</div>
                    <div className="text-sm text-white font-medium">{detailOrder.phone || detailOrder.telephone || '—'}</div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded p-4">
                    <div className="text-xs text-gray-400 mb-1">Order Date</div>
                    <div className="text-sm text-white font-medium">
                      {formatDate(detailOrder.date_added || detailOrder.created_at)}
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/[0.03] border border-white/5 rounded p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">Payment Address</h3>
                    <div className="text-sm text-gray-300 leading-relaxed">
                      {detailOrder.payment_address || detailOrder.billing_address || (
                        <>
                          {detailOrder.billing_name || detailOrder.customer_name || 'Guest'}<br />
                          {detailOrder.billing_address_1 || detailOrder.address || '—'}<br />
                          {detailOrder.billing_city || ''}{detailOrder.billing_city ? ', ' : ''}
                          {detailOrder.billing_state || ''}{detailOrder.billing_state ? ' ' : ''}
                          {detailOrder.billing_postcode || ''}<br />
                          {detailOrder.billing_country || 'India'}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="bg-white/[0.03] border border-white/5 rounded p-4">
                    <h3 className="text-sm font-semibold text-white mb-3">Shipping Address</h3>
                    <div className="text-sm text-gray-300 leading-relaxed">
                      {detailOrder.shipping_address || (
                        <>
                          {detailOrder.shipping_name || detailOrder.customer_name || 'Guest'}<br />
                          {detailOrder.shipping_address_1 || detailOrder.address || '—'}<br />
                          {detailOrder.shipping_city || ''}{detailOrder.shipping_city ? ', ' : ''}
                          {detailOrder.shipping_state || ''}{detailOrder.shipping_state ? ' ' : ''}
                          {detailOrder.shipping_postcode || ''}<br />
                          {detailOrder.shipping_country || 'India'}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Totals */}
                <div className="bg-white/[0.03] border border-white/5 rounded p-4">
                  <h3 className="text-sm font-semibold text-white mb-3">Order Totals</h3>
                  <div className="space-y-2 max-w-sm ml-auto">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white font-medium">{formatCurrency(detailOrder.subtotal || (detailOrder.total * 0.82))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Shipping</span>
                      <span className="text-white font-medium">{formatCurrency(detailOrder.shipping || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tax</span>
                      <span className="text-white font-medium">{formatCurrency(detailOrder.tax || (detailOrder.total * 0.18))}</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
                      <span className="text-gray-400 font-medium">Grand Total</span>
                      <span className="text-[#D4AF37] font-semibold">{formatCurrency(detailOrder.total || detailOrder.grand_total)}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  <button className="bg-[#D4AF37] hover:bg-[#c4a030] text-black px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors">
                    <FileText size={14} /> Generate Invoice
                  </button>
                  <button className="bg-white/[0.08] hover:bg-white/[0.12] text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2 border border-white/10 transition-colors">
                    <Truck size={14} /> Generate Shipping Label
                  </button>
                </div>
              </div>
            )}

            {/* ──────── PRODUCTS TAB ──────── */}
            {activeTab === 'products' && (
              <div className="p-6 space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#111] text-gray-400 text-xs uppercase">
                      <tr>
                        <th className="px-4 py-3">Image</th>
                        <th className="px-4 py-3">Product Name</th>
                        <th className="px-4 py-3">Model</th>
                        <th className="px-4 py-3">Qty</th>
                        <th className="px-4 py-3">Unit Price</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(detailOrder.products || detailOrder.items || []).length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">No products in this order.</td>
                        </tr>
                      )}
                      {(detailOrder.products || detailOrder.items || []).map((item, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="px-4 py-3">
                            {item.image ? (
                              <img src={item.image} alt="" className="w-10 h-10 rounded object-cover" />
                            ) : (
                              <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-xs text-gray-500">—</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-white">{item.name || item.product_name || 'Product'}</td>
                          <td className="px-4 py-3 text-gray-400">{item.model || item.sku || '—'}</td>
                          <td className="px-4 py-3 text-gray-400">{item.quantity || item.qty || 1}</td>
                          <td className="px-4 py-3 text-gray-300">{formatCurrency(item.price || item.unit_price || 0)}</td>
                          <td className="px-4 py-3 text-right text-white font-medium">
                            {formatCurrency((item.price || item.unit_price || 0) * (item.quantity || item.qty || 1))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Order totals */}
                <div className="bg-white/[0.03] border border-white/5 rounded p-4 ml-auto max-w-xs">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Subtotal</span>
                      <span className="text-white">{formatCurrency(detailOrder.subtotal || (detailOrder.total * 0.82))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Shipping</span>
                      <span className="text-white">{formatCurrency(detailOrder.shipping || 0)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tax</span>
                      <span className="text-white">{formatCurrency(detailOrder.tax || (detailOrder.total * 0.18))}</span>
                    </div>
                    <div className="border-t border-white/10 pt-2 flex justify-between text-sm">
                      <span className="text-gray-400 font-medium">Grand Total</span>
                      <span className="text-[#D4AF37] font-semibold">{formatCurrency(detailOrder.total || detailOrder.grand_total)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button className="bg-[#D4AF37] hover:bg-[#c4a030] text-black px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors">
                    <FileText size={14} /> Generate Invoice
                  </button>
                  <button className="bg-white/[0.08] hover:bg-white/[0.12] text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2 border border-white/10 transition-colors">
                    <Truck size={14} /> Generate Shipping Label
                  </button>
                </div>
              </div>
            )}

            {/* ──────── HISTORY TAB ──────── */}
            {activeTab === 'history' && (
              <div className="p-6 space-y-6">
                {/* Add History Form */}
                <div className="bg-white/[0.03] border border-white/5 rounded p-4">
                  <h3 className="text-sm font-semibold text-white mb-4">Add History</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-1">
                      <label className="block text-xs text-gray-400 mb-1">Status</label>
                      <select
                        value={histStatus}
                        onChange={e => setHistStatus(e.target.value)}
                        className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                      >
                        <option value="">Select Status</option>
                        {ALL_ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-xs text-gray-400 mb-1">Comment</label>
                      <input
                        type="text"
                        value={histComment}
                        onChange={e => setHistComment(e.target.value)}
                        placeholder="Optional comment"
                        className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
                      />
                    </div>
                    <div className="md:col-span-1 flex items-center pb-2.5">
                      <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={histNotify}
                          onChange={e => setHistNotify(e.target.checked)}
                          className="accent-[#D4AF37]"
                        />
                        Notify Customer
                      </label>
                    </div>
                    <div className="md:col-span-1">
                      <button
                        onClick={handleAddHistory}
                        className="w-full bg-[#D4AF37] hover:bg-[#c4a030] text-black px-4 py-2 rounded text-sm font-medium transition-colors"
                      >
                        Add History
                      </button>
                    </div>
                  </div>
                </div>

                {/* History List */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Order History</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#111] text-gray-400 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Comment</th>
                          <th className="px-4 py-3">Notified</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(detailOrder.history || []).length === 0 && (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                              No history entries yet.
                            </td>
                          </tr>
                        )}
                        {[...(detailOrder.history || [])].reverse().map((h, i) => {
                          const hm = getStatusMeta(h.status);
                          return (
                            <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                              <td className="px-4 py-3 text-gray-300">{formatDate(h.date)}</td>
                              <td className="px-4 py-3">
                                <span className={`inline-block text-xs px-2 py-1 rounded ${hm.cls}`}>{hm.label}</span>
                              </td>
                              <td className="px-4 py-3 text-gray-300">{h.comment || '—'}</td>
                              <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  h.notified === 'Yes' || h.notified === true
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-gray-500/20 text-gray-400'
                                }`}>
                                  {h.notified === 'Yes' || h.notified === true ? 'Yes' : 'No'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="bg-[#D4AF37] hover:bg-[#c4a030] text-black px-4 py-2 rounded text-sm font-medium flex items-center gap-2 transition-colors">
                    <FileText size={14} /> Generate Invoice
                  </button>
                  <button className="bg-white/[0.08] hover:bg-white/[0.12] text-white px-4 py-2 rounded text-sm font-medium flex items-center gap-2 border border-white/10 transition-colors">
                    <Truck size={14} /> Generate Shipping Label
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
