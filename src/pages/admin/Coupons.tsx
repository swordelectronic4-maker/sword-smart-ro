// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Pencil, Trash2, Plus, Search, X, ChevronDown } from 'lucide-react';

const defaultCoupons = [
  {
    id: 1,
    name: 'Diwali Special',
    code: 'DIWALI25',
    type: 'Percentage',
    discount: 25,
    totalAmount: 1000,
    usesPerCustomer: 1,
    usesPerCoupon: 100,
    dateStart: '2025-10-20',
    dateEnd: '2025-11-05',
    status: 'Enabled',
    products: '',
    categories: '',
  },
  {
    id: 2,
    name: 'New Year Sale',
    code: 'NEWYEAR2025',
    type: 'Fixed Amount',
    discount: 500,
    totalAmount: 2500,
    usesPerCustomer: 2,
    usesPerCoupon: 50,
    dateStart: '2025-12-28',
    dateEnd: '2026-01-05',
    status: 'Enabled',
    products: '',
    categories: '',
  },
  {
    id: 3,
    name: 'Free Shipping',
    code: 'FREESHIP',
    type: 'Free Shipping',
    discount: 0,
    totalAmount: 500,
    usesPerCustomer: 5,
    usesPerCoupon: 200,
    dateStart: '2025-01-01',
    dateEnd: '2025-12-31',
    status: 'Enabled',
    products: '',
    categories: '',
  },
  {
    id: 4,
    name: 'Buy 1 Get 1',
    code: 'BOGO',
    type: 'Buy X Get Y',
    discount: 50,
    totalAmount: 0,
    usesPerCustomer: 3,
    usesPerCoupon: 500,
    dateStart: '2025-06-01',
    dateEnd: '2025-06-30',
    status: 'Disabled',
    products: '',
    categories: '',
  },
  {
    id: 5,
    name: 'Summer Sizzle',
    code: 'SUMMER15',
    type: 'Percentage',
    discount: 15,
    totalAmount: 1500,
    usesPerCustomer: 1,
    usesPerCoupon: 300,
    dateStart: '2025-04-01',
    dateEnd: '2025-06-30',
    status: 'Enabled',
    products: '',
    categories: '',
  },
  {
    id: 6,
    name: 'Flash Friday',
    code: 'FLASH50',
    type: 'Percentage',
    discount: 50,
    totalAmount: 5000,
    usesPerCustomer: 1,
    usesPerCoupon: 20,
    dateStart: '2025-07-11',
    dateEnd: '2025-07-13',
    status: 'Enabled',
    products: '',
    categories: '',
  },
  {
    id: 7,
    name: 'Welcome Gift',
    code: 'WELCOME200',
    type: 'Fixed Amount',
    discount: 200,
    totalAmount: 999,
    usesPerCustomer: 1,
    usesPerCoupon: 1000,
    dateStart: '2025-01-01',
    dateEnd: '2025-12-31',
    status: 'Enabled',
    products: '',
    categories: '',
  },
];

const couponTypes = ['Percentage', 'Fixed Amount', 'Free Shipping', 'Buy X Get Y'];
const statusOptions = ['Enabled', 'Disabled'];

const InputField = ({ label, value, onChange, type = 'text', placeholder = '', required = false }) => (
  <div className="mb-3">
    <label className="block text-xs text-gray-400 mb-1">
      {label}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded"
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, required = false }) => (
  <div className="mb-3 relative">
    <label className="block text-xs text-gray-400 mb-1">
      {label}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded appearance-none cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt} value={opt} className="bg-[#1a1a1a] text-white">
          {opt}
        </option>
      ))}
    </select>
    <ChevronDown className="absolute right-3 top-[28px] w-4 h-4 text-gray-400 pointer-events-none" />
  </div>
);

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

  const [form, setForm] = useState({
    name: '',
    code: '',
    type: 'Percentage',
    discount: '',
    totalAmount: '',
    usesPerCustomer: 1,
    usesPerCoupon: 100,
    dateStart: '',
    dateEnd: '',
    status: 'Enabled',
    products: '',
    categories: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('sword_coupons');
    if (stored) {
      try {
        setCoupons(JSON.parse(stored));
      } catch {
        setCoupons(defaultCoupons);
        localStorage.setItem('sword_coupons', JSON.stringify(defaultCoupons));
      }
    } else {
      setCoupons(defaultCoupons);
      localStorage.setItem('sword_coupons', JSON.stringify(defaultCoupons));
    }
  }, []);

  const persist = (updated) => {
    setCoupons(updated);
    localStorage.setItem('sword_coupons', JSON.stringify(updated));
  };

  const resetForm = () => {
    setForm({
      name: '',
      code: '',
      type: 'Percentage',
      discount: '',
      totalAmount: '',
      usesPerCustomer: 1,
      usesPerCoupon: 100,
      dateStart: '',
      dateEnd: '',
      status: 'Enabled',
      products: '',
      categories: '',
    });
    setEditingId(null);
  };

  const openAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setForm({
      name: coupon.name,
      code: coupon.code,
      type: coupon.type,
      discount: coupon.discount,
      totalAmount: coupon.totalAmount,
      usesPerCustomer: coupon.usesPerCustomer,
      usesPerCoupon: coupon.usesPerCoupon,
      dateStart: coupon.dateStart,
      dateEnd: coupon.dateEnd,
      status: coupon.status,
      products: coupon.products,
      categories: coupon.categories,
    });
    setEditingId(coupon.id);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.code.trim()) return;
    if (editingId) {
      const updated = coupons.map((c) => (c.id === editingId ? { ...c, ...form, discount: Number(form.discount), totalAmount: Number(form.totalAmount), usesPerCustomer: Number(form.usesPerCustomer), usesPerCoupon: Number(form.usesPerCoupon) } : c));
      persist(updated);
    } else {
      const newCoupon = {
        id: Date.now(),
        ...form,
        discount: Number(form.discount),
        totalAmount: Number(form.totalAmount),
        usesPerCustomer: Number(form.usesPerCustomer),
        usesPerCoupon: Number(form.usesPerCoupon),
      };
      persist([...coupons, newCoupon]);
    }
    setShowModal(false);
    resetForm();
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      persist(coupons.filter((c) => c.id !== id));
      setSelectedIds((prev) => prev.filter((sid) => sid !== id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} selected coupon(s)?`)) {
      persist(coupons.filter((c) => !selectedIds.includes(c.id)));
      setSelectedIds([]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredCoupons.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCoupons.map((c) => c.id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]));
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const filteredCoupons = coupons
    .filter((c) => {
      const term = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(term) ||
        c.code.toLowerCase().includes(term) ||
        c.type.toLowerCase().includes(term) ||
        c.status.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (typeof aVal === 'string') {
        return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });

  const getDiscountDisplay = (coupon) => {
    if (coupon.type === 'Percentage') return `${coupon.discount}%`;
    if (coupon.type === 'Fixed Amount') return `₹${coupon.discount}`;
    if (coupon.type === 'Free Shipping') return 'Free';
    if (coupon.type === 'Buy X Get Y') return `${coupon.discount}% off`;
    return coupon.discount;
  };

  const getStatusBadge = (status) => (
    <span
      className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
        status === 'Enabled' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
      }`}
    >
      {status}
    </span>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">Coupons</h1>
            <p className="text-sm text-gray-400 mt-1">Manage promotional coupons and discount codes</p>
          </div>
          <button
            onClick={openAdd}
            className="bg-[#D4AF37] text-black text-sm font-medium px-4 py-2 rounded hover:bg-[#E5C158] transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Coupon
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coupons by name, code, type..."
              className="w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm pl-9 pr-3 py-2 outline-none focus:border-[#D4AF37] rounded"
            />
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="text-red-400 text-sm hover:text-red-300 transition-colors flex items-center gap-1 px-3 py-2 border border-red-400/30 rounded"
            >
              <Trash2 className="w-4 h-4" />
              Delete ({selectedIds.length})
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-[#111] border border-white/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={filteredCoupons.length > 0 && selectedIds.length === filteredCoupons.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
                    />
                  </th>
                  <th onClick={() => handleSort('name')} className="px-4 py-3 text-left text-xs font-medium text-gray-400 cursor-pointer hover:text-white select-none">
                    Coupon Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('code')} className="px-4 py-3 text-left text-xs font-medium text-gray-400 cursor-pointer hover:text-white select-none">
                    Code {sortConfig.key === 'code' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('type')} className="px-4 py-3 text-left text-xs font-medium text-gray-400 cursor-pointer hover:text-white select-none">
                    Type {sortConfig.key === 'type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('discount')} className="px-4 py-3 text-left text-xs font-medium text-gray-400 cursor-pointer hover:text-white select-none">
                    Discount {sortConfig.key === 'discount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th onClick={() => handleSort('totalAmount')} className="px-4 py-3 text-left text-xs font-medium text-gray-400 cursor-pointer hover:text-white select-none">
                    Min Order (₹) {sortConfig.key === 'totalAmount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">
                    Date Range
                  </th>
                  <th onClick={() => handleSort('status')} className="px-4 py-3 text-left text-xs font-medium text-gray-400 cursor-pointer hover:text-white select-none">
                    Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-sm text-gray-500">
                      No coupons found.
                    </td>
                  </tr>
                ) : (
                  filteredCoupons.map((coupon) => (
                    <tr key={coupon.id} className="border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(coupon.id)}
                          onChange={() => toggleSelect(coupon.id)}
                          className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-white font-medium">{coupon.name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block bg-[#D4AF37]/15 text-[#D4AF37] text-xs font-mono px-2 py-1 rounded">
                          {coupon.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300">{coupon.type}</td>
                      <td className="px-4 py-3 text-sm text-white font-medium">{getDiscountDisplay(coupon)}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{coupon.totalAmount > 0 ? `₹${coupon.totalAmount}` : '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">
                        <span className="text-xs">{coupon.dateStart}</span>
                        <span className="text-gray-600 mx-1">→</span>
                        <span className="text-xs">{coupon.dateEnd}</span>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(coupon.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(coupon)}
                            className="p-1.5 text-gray-400 hover:text-[#D4AF37] transition-colors rounded"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination summary */}
        <div className="mt-4 text-xs text-gray-500">
          Showing {filteredCoupons.length} of {coupons.length} coupon{coupons.length !== 1 ? 's' : ''}
          {search && ` (filtered by "${search}")`}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="bg-[#151515] border border-white/10 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#151515] z-10">
              <h2 className="text-lg font-medium text-white">
                {editingId ? 'Edit Coupon' : 'Add Coupon'}
              </h2>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                <InputField label="Coupon Name" value={form.name} onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="e.g. Summer Sale" required />
                <InputField label="Code" value={form.code} onChange={(v) => setForm((f) => ({ ...f, code: v }))} placeholder="e.g. SUMMER25" required />
                <SelectField label="Type" value={form.type} onChange={(v) => setForm((f) => ({ ...f, type: v }))} options={couponTypes} required />
                <InputField label="Discount" value={form.discount} onChange={(v) => setForm((f) => ({ ...f, discount: v }))} type="number" placeholder="e.g. 25" />
                <InputField label="Total Amount (Min Order ₹)" value={form.totalAmount} onChange={(v) => setForm((f) => ({ ...f, totalAmount: v }))} type="number" placeholder="e.g. 1000" />
                <SelectField label="Status" value={form.status} onChange={(v) => setForm((f) => ({ ...f, status: v }))} options={statusOptions} />
                <InputField label="Uses Per Customer" value={form.usesPerCustomer} onChange={(v) => setForm((f) => ({ ...f, usesPerCustomer: v }))} type="number" placeholder="e.g. 1" />
                <InputField label="Uses Per Coupon" value={form.usesPerCoupon} onChange={(v) => setForm((f) => ({ ...f, usesPerCoupon: v }))} type="number" placeholder="e.g. 100" />
                <InputField label="Date Start" value={form.dateStart} onChange={(v) => setForm((f) => ({ ...f, dateStart: v }))} type="date" />
                <InputField label="Date End" value={form.dateEnd} onChange={(v) => setForm((f) => ({ ...f, dateEnd: v }))} type="date" />
              </div>
              <div className="mt-2">
                <InputField label="Products (comma-separated product IDs)" value={form.products} onChange={(v) => setForm((f) => ({ ...f, products: v }))} placeholder="e.g. 101, 102, 103" />
                <InputField label="Categories (comma-separated category names)" value={form.categories} onChange={(v) => setForm((f) => ({ ...f, categories: v }))} placeholder="e.g. Electronics, Clothing" />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/10 sticky bottom-0 bg-[#151515] z-10">
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-sm text-gray-400 hover:text-white px-4 py-2 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="bg-[#D4AF37] text-black text-sm font-medium px-6 py-2 rounded hover:bg-[#E5C158] transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
