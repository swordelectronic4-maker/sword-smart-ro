// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import {
  Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, X, Star,
  Folder, Building2, FileText, Filter, SlidersHorizontal, Repeat, Check
} from 'lucide-react';

const currency = (n) => {
  if (typeof n !== 'number') return '₹0';
  return '₹' + n.toLocaleString('en-IN');
};

/* ──────────────── Catalog Router ──────────────── */
export default function Catalog({ section = 'categories' }) {
  switch (section) {
    case 'categories':
      return <CategoriesManager />;
    case 'manufacturers':
      return <ManufacturersManager />;
    case 'reviews':
      return <ReviewsManager />;
    case 'information':
      return <InformationManager />;
    case 'filters':
      return <FiltersManager />;
    case 'options':
      return <OptionsManager />;
    case 'recurring-profiles':
      return <RecurringProfilesManager />;
    case 'attributes':
      return <AttributesManager />;
    case 'attribute-groups':
      return <AttributeGroupsManager />;
    default:
      return <CategoriesManager />;
  }
}

/* ═══════════════════════════════════════════
   CATEGORIES
   ═══════════════════════════════════════════ */

function CategoriesManager() {
  const [categories, setCategories] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_categories') || '[]'); }
    catch { return getDefaultCategories(); }
  });
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', parent: '', sortOrder: 0, status: 'Enabled' });

  useEffect(() => {
    localStorage.setItem('admin_categories', JSON.stringify(categories));
  }, [categories]);

  const filtered = useMemo(() =>
    categories.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase())),
    [categories, search]
  );

  const openAdd = () => { setEditing(null); setForm({ name: '', parent: '', sortOrder: 0, status: 'Enabled' }); setModalOpen(true); };
  const openEdit = (cat) => { setEditing(cat); setForm({ ...cat }); setModalOpen(true); };

  const save = () => {
    if (!form.name.trim()) return;
    if (editing) {
      setCategories(prev => prev.map(c => c.id === editing.id ? { ...c, ...form } : c));
    } else {
      setCategories(prev => [...prev, { ...form, id: Date.now() }]);
    }
    setModalOpen(false);
  };

  const remove = (id) => { if (confirm('Delete this category?')) setCategories(prev => prev.filter(c => c.id !== id)); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Categories</h2>
        <button onClick={openAdd} className="btn-sword flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium self-start">
          <Plus size={16} /> Add Category
        </button>
      </div>
      <div className="bg-[#111] border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full h-9 pl-9 pr-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 text-xs border-b border-white/10">
              <th className="pb-2 font-medium"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></th>
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium">Sort Order</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(cat => (
              <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                <td className="py-2.5"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></td>
                <td className="py-2.5 text-gray-300">{cat.name}</td>
                <td className="py-2.5 text-gray-400">{cat.sortOrder}</td>
                <td className="py-2.5"><StatusBadge status={cat.status} /></td>
                <td className="py-2.5 text-right flex items-center gap-2 justify-end">
                  <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#D4AF37] transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => remove(cat.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#161616] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">{editing ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
              <Field label="Parent Category" value={form.parent} onChange={v => setForm({ ...form, parent: v })} placeholder="Top Level" />
              <Field label="Sort Order" type="number" value={form.sortOrder} onChange={v => setForm({ ...form, sortOrder: Number(v) })} />
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full h-10 px-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#D4AF37]/50">
                  <option>Enabled</option>
                  <option>Disabled</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-white/10">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={save} className="btn-sword px-4 py-2 rounded-lg text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   MANUFACTURERS
   ═══════════════════════════════════════════ */

function ManufacturersManager() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_manufacturers') || '[]'); }
    catch { return getDefaultManufacturers(); }
  });
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', sortOrder: 0 });

  useEffect(() => { localStorage.setItem('admin_manufacturers', JSON.stringify(items)); }, [items]);

  const filtered = items.filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditing(null); setForm({ name: '', sortOrder: 0 }); setModalOpen(true); };
  const openEdit = (m) => { setEditing(m); setForm({ ...m }); setModalOpen(true); };
  const save = () => { if (!form.name.trim()) return; editing ? setItems(prev => prev.map(m => m.id === editing.id ? { ...m, ...form } : m)) : setItems(prev => [...prev, { ...form, id: Date.now() }]); setModalOpen(false); };
  const remove = (id) => { if (confirm('Delete?')) setItems(prev => prev.filter(m => m.id !== id)); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Manufacturers</h2>
        <button onClick={openAdd} className="btn-sword flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium self-start"><Plus size={16} /> Add Manufacturer</button>
      </div>
      <div className="bg-[#111] border border-white/10 rounded-xl p-4">
        <div className="relative max-w-xs mb-4"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="w-full h-9 pl-9 pr-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50" /></div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 text-xs border-b border-white/10"><th className="pb-2 font-medium"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></th><th className="pb-2 font-medium">Name</th><th className="pb-2 font-medium">Sort Order</th><th className="pb-2 font-medium text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(m => (
              <tr key={m.id} className="hover:bg-white/5 transition-colors">
                <td className="py-2.5"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></td>
                <td className="py-2.5 text-gray-300">{m.name}</td>
                <td className="py-2.5 text-gray-400">{m.sortOrder}</td>
                <td className="py-2.5 text-right flex items-center gap-2 justify-end">
                  <button onClick={() => openEdit(m)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#D4AF37] transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => remove(m.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#161616] border border-white/10 rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">{editing ? 'Edit Manufacturer' : 'Add Manufacturer'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
              <Field label="Sort Order" type="number" value={form.sortOrder} onChange={v => setForm({ ...form, sortOrder: Number(v) })} />
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-white/10">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={save} className="btn-sword px-4 py-2 rounded-lg text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   REVIEWS
   ═══════════════════════════════════════════ */

function ReviewsManager() {
  const [reviews, setReviews] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_reviews') || '[]'); }
    catch { return getDefaultReviews(); }
  });
  const [search, setSearch] = useState('');

  useEffect(() => { localStorage.setItem('admin_reviews', JSON.stringify(reviews)); }, [reviews]);

  const filtered = reviews.filter(r => !search || r.author.toLowerCase().includes(search.toLowerCase()) || r.product.toLowerCase().includes(search.toLowerCase()));

  const toggleStatus = (id) => setReviews(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'Enabled' ? 'Disabled' : 'Enabled' } : r));
  const remove = (id) => { if (confirm('Delete review?')) setReviews(prev => prev.filter(r => r.id !== id)); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Reviews</h2>
      </div>
      <div className="bg-[#111] border border-white/10 rounded-xl p-4">
        <div className="relative max-w-xs mb-4"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by author or product..." className="w-full h-9 pl-9 pr-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50" /></div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 text-xs border-b border-white/10"><th className="pb-2 font-medium"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></th><th className="pb-2 font-medium">Product</th><th className="pb-2 font-medium">Author</th><th className="pb-2 font-medium">Rating</th><th className="pb-2 font-medium">Status</th><th className="pb-2 font-medium">Date Added</th><th className="pb-2 font-medium text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-white/5 transition-colors">
                <td className="py-2.5"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></td>
                <td className="py-2.5 text-gray-300">{r.product}</td>
                <td className="py-2.5 text-gray-300">{r.author}</td>
                <td className="py-2.5"><div className="flex items-center gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'text-[#D4AF37] fill-[#D4AF37]' : 'text-gray-600'} />)}</div></td>
                <td className="py-2.5"><button onClick={() => toggleStatus(r.id)} className={r.status === 'Enabled' ? 'px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20'}>{r.status}</button></td>
                <td className="py-2.5 text-gray-400 text-xs">{r.date}</td>
                <td className="py-2.5 text-right"><button onClick={() => remove(r.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   INFORMATION (CMS Pages)
   ═══════════════════════════════════════════ */

function InformationManager() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_information') || '[]'); }
    catch { return getDefaultInformation(); }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'Enabled', sortOrder: 0, bottom: 1 });

  useEffect(() => { localStorage.setItem('admin_information', JSON.stringify(items)); }, [items]);

  const openAdd = () => { setEditing(null); setForm({ title: '', description: '', status: 'Enabled', sortOrder: 0, bottom: 1 }); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ ...item }); setModalOpen(true); };
  const save = () => { if (!form.title.trim()) return; editing ? setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...form } : i)) : setItems(prev => [...prev, { ...form, id: Date.now() }]); setModalOpen(false); };
  const remove = (id) => { if (confirm('Delete?')) setItems(prev => prev.filter(i => i.id !== id)); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Information Pages</h2>
        <button onClick={openAdd} className="btn-sword flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium self-start"><Plus size={16} /> Add Information</button>
      </div>
      <div className="bg-[#111] border border-white/10 rounded-xl p-4">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 text-xs border-b border-white/10"><th className="pb-2 font-medium"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></th><th className="pb-2 font-medium">Title</th><th className="pb-2 font-medium">Sort Order</th><th className="pb-2 font-medium">Status</th><th className="pb-2 font-medium text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="py-2.5"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></td>
                <td className="py-2.5 text-gray-300">{item.title}</td>
                <td className="py-2.5 text-gray-400">{item.sortOrder}</td>
                <td className="py-2.5"><StatusBadge status={item.status} /></td>
                <td className="py-2.5 text-right flex items-center gap-2 justify-end">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#D4AF37] transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => remove(item.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#161616] border border-white/10 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">{editing ? 'Edit' : 'Add'} Information</h3>
              <button onClick={() => setModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <Field label="Title" value={form.title} onChange={v => setForm({ ...form, title: v })} />
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={6} className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50" />
              </div>
              <Field label="Sort Order" type="number" value={form.sortOrder} onChange={v => setForm({ ...form, sortOrder: Number(v) })} />
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label>
                <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full h-10 px-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#D4AF37]/50">
                  <option>Enabled</option>
                  <option>Disabled</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-white/10">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={save} className="btn-sword px-4 py-2 rounded-lg text-sm font-medium">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   FILTERS
   ═══════════════════════════════════════════ */

function FiltersManager() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_filters') || '[]'); }
    catch { return getDefaultFilters(); }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', sortOrder: 0 });

  useEffect(() => { localStorage.setItem('admin_filters', JSON.stringify(items)); }, [items]);

  const openAdd = () => { setEditing(null); setForm({ name: '', sortOrder: 0 }); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ ...item }); setModalOpen(true); };
  const save = () => { if (!form.name.trim()) return; editing ? setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...form } : i)) : setItems(prev => [...prev, { ...form, id: Date.now() }]); setModalOpen(false); };
  const remove = (id) => { if (confirm('Delete?')) setItems(prev => prev.filter(i => i.id !== id)); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Filters</h2>
        <button onClick={openAdd} className="btn-sword flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium self-start"><Plus size={16} /> Add Filter</button>
      </div>
      <div className="bg-[#111] border border-white/10 rounded-xl p-4">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 text-xs border-b border-white/10"><th className="pb-2 font-medium"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></th><th className="pb-2 font-medium">Filter Name</th><th className="pb-2 font-medium">Sort Order</th><th className="pb-2 font-medium text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="py-2.5"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></td>
                <td className="py-2.5 text-gray-300">{item.name}</td>
                <td className="py-2.5 text-gray-400">{item.sortOrder}</td>
                <td className="py-2.5 text-right flex items-center gap-2 justify-end">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#D4AF37] transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => remove(item.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && (
        <Modal title={editing ? 'Edit Filter' : 'Add Filter'} onClose={() => setModalOpen(false)}>
          <div className="space-y-4"><Field label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} /><Field label="Sort Order" type="number" value={form.sortOrder} onChange={v => setForm({ ...form, sortOrder: Number(v) })} /></div>
          <div className="flex justify-end gap-3 p-5 border-t border-white/10 mt-6 -mx-5 -mb-5"><button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button><button onClick={save} className="btn-sword px-4 py-2 rounded-lg text-sm font-medium">Save</button></div>
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   OPTIONS
   ═══════════════════════════════════════════ */

function OptionsManager() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_options') || '[]'); }
    catch { return getDefaultOptions(); }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'Select', sortOrder: 0 });

  useEffect(() => { localStorage.setItem('admin_options', JSON.stringify(items)); }, [items]);

  const openAdd = () => { setEditing(null); setForm({ name: '', type: 'Select', sortOrder: 0 }); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ ...item }); setModalOpen(true); };
  const save = () => { if (!form.name.trim()) return; editing ? setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...form } : i)) : setItems(prev => [...prev, { ...form, id: Date.now() }]); setModalOpen(false); };
  const remove = (id) => { if (confirm('Delete?')) setItems(prev => prev.filter(i => i.id !== id)); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Options</h2>
        <button onClick={openAdd} className="btn-sword flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium self-start"><Plus size={16} /> Add Option</button>
      </div>
      <div className="bg-[#111] border border-white/10 rounded-xl p-4">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 text-xs border-b border-white/10"><th className="pb-2 font-medium"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></th><th className="pb-2 font-medium">Option Name</th><th className="pb-2 font-medium">Type</th><th className="pb-2 font-medium">Sort Order</th><th className="pb-2 font-medium text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="py-2.5"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></td>
                <td className="py-2.5 text-gray-300">{item.name}</td>
                <td className="py-2.5 text-gray-400">{item.type}</td>
                <td className="py-2.5 text-gray-400">{item.sortOrder}</td>
                <td className="py-2.5 text-right flex items-center gap-2 justify-end">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#D4AF37] transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => remove(item.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && (
        <Modal title={editing ? 'Edit Option' : 'Add Option'} onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            <Field label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
            <div><label className="block text-xs font-medium text-gray-400 mb-1.5">Type</label><select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full h-10 px-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#D4AF37]/50"><option>Select</option><option>Radio</option><option>Checkbox</option><option>Text</option><option>Textarea</option></select></div>
            <Field label="Sort Order" type="number" value={form.sortOrder} onChange={v => setForm({ ...form, sortOrder: Number(v) })} />
          </div>
          <div className="flex justify-end gap-3 p-5 border-t border-white/10 mt-6 -mx-5 -mb-5"><button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button><button onClick={save} className="btn-sword px-4 py-2 rounded-lg text-sm font-medium">Save</button></div>
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   RECURRING PROFILES
   ═══════════════════════════════════════════ */

function RecurringProfilesManager() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_recurring') || '[]'); }
    catch { return getDefaultRecurring(); }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: 0, frequency: 'Month', duration: 0, cycle: 1, status: 'Enabled' });

  useEffect(() => { localStorage.setItem('admin_recurring', JSON.stringify(items)); }, [items]);

  const openAdd = () => { setEditing(null); setForm({ name: '', price: 0, frequency: 'Month', duration: 0, cycle: 1, status: 'Enabled' }); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ ...item }); setModalOpen(true); };
  const save = () => { if (!form.name.trim()) return; editing ? setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...form } : i)) : setItems(prev => [...prev, { ...form, id: Date.now() }]); setModalOpen(false); };
  const remove = (id) => { if (confirm('Delete?')) setItems(prev => prev.filter(i => i.id !== id)); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Recurring Profiles</h2>
        <button onClick={openAdd} className="btn-sword flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium self-start"><Plus size={16} /> Add Profile</button>
      </div>
      <div className="bg-[#111] border border-white/10 rounded-xl p-4">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 text-xs border-b border-white/10"><th className="pb-2 font-medium"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></th><th className="pb-2 font-medium">Name</th><th className="pb-2 font-medium">Price</th><th className="pb-2 font-medium">Frequency</th><th className="pb-2 font-medium">Duration</th><th className="pb-2 font-medium">Status</th><th className="pb-2 font-medium text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="py-2.5"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></td>
                <td className="py-2.5 text-gray-300">{item.name}</td>
                <td className="py-2.5 text-gray-400">{currency(item.price)}</td>
                <td className="py-2.5 text-gray-400">{item.frequency}</td>
                <td className="py-2.5 text-gray-400">{item.duration || '∞'}</td>
                <td className="py-2.5"><StatusBadge status={item.status} /></td>
                <td className="py-2.5 text-right flex items-center gap-2 justify-end">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#D4AF37] transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => remove(item.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && (
        <Modal title={editing ? 'Edit Profile' : 'Add Profile'} onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            <Field label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
            <Field label="Price" type="number" value={form.price} onChange={v => setForm({ ...form, price: Number(v) })} />
            <div><label className="block text-xs font-medium text-gray-400 mb-1.5">Frequency</label><select value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })} className="w-full h-10 px-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#D4AF37]/50"><option>Day</option><option>Week</option><option>Month</option><option>Year</option></select></div>
            <Field label="Duration (0 = infinite)" type="number" value={form.duration} onChange={v => setForm({ ...form, duration: Number(v) })} />
            <Field label="Cycle" type="number" value={form.cycle} onChange={v => setForm({ ...form, cycle: Number(v) })} />
            <div><label className="block text-xs font-medium text-gray-400 mb-1.5">Status</label><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full h-10 px-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-300 focus:outline-none focus:border-[#D4AF37]/50"><option>Enabled</option><option>Disabled</option></select></div>
          </div>
          <div className="flex justify-end gap-3 p-5 border-t border-white/10 mt-6 -mx-5 -mb-5"><button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button><button onClick={save} className="btn-sword px-4 py-2 rounded-lg text-sm font-medium">Save</button></div>
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   ATTRIBUTES
   ═══════════════════════════════════════════ */

function AttributesManager() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_attributes') || '[]'); }
    catch { return getDefaultAttributes(); }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', group: 'General', sortOrder: 0 });

  useEffect(() => { localStorage.setItem('admin_attributes', JSON.stringify(items)); }, [items]);

  const openAdd = () => { setEditing(null); setForm({ name: '', group: 'General', sortOrder: 0 }); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ ...item }); setModalOpen(true); };
  const save = () => { if (!form.name.trim()) return; editing ? setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...form } : i)) : setItems(prev => [...prev, { ...form, id: Date.now() }]); setModalOpen(false); };
  const remove = (id) => { if (confirm('Delete?')) setItems(prev => prev.filter(i => i.id !== id)); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Attributes</h2>
        <button onClick={openAdd} className="btn-sword flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium self-start"><Plus size={16} /> Add Attribute</button>
      </div>
      <div className="bg-[#111] border border-white/10 rounded-xl p-4">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 text-xs border-b border-white/10"><th className="pb-2 font-medium"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></th><th className="pb-2 font-medium">Name</th><th className="pb-2 font-medium">Attribute Group</th><th className="pb-2 font-medium">Sort Order</th><th className="pb-2 font-medium text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="py-2.5"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></td>
                <td className="py-2.5 text-gray-300">{item.name}</td>
                <td className="py-2.5 text-gray-400">{item.group}</td>
                <td className="py-2.5 text-gray-400">{item.sortOrder}</td>
                <td className="py-2.5 text-right flex items-center gap-2 justify-end">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#D4AF37] transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => remove(item.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && (
        <Modal title={editing ? 'Edit Attribute' : 'Add Attribute'} onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            <Field label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
            <Field label="Attribute Group" value={form.group} onChange={v => setForm({ ...form, group: v })} />
            <Field label="Sort Order" type="number" value={form.sortOrder} onChange={v => setForm({ ...form, sortOrder: Number(v) })} />
          </div>
          <div className="flex justify-end gap-3 p-5 border-t border-white/10 mt-6 -mx-5 -mb-5"><button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button><button onClick={save} className="btn-sword px-4 py-2 rounded-lg text-sm font-medium">Save</button></div>
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   ATTRIBUTE GROUPS
   ═══════════════════════════════════════════ */

function AttributeGroupsManager() {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_attribute_groups') || '[]'); }
    catch { return getDefaultAttributeGroups(); }
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', sortOrder: 0 });

  useEffect(() => { localStorage.setItem('admin_attribute_groups', JSON.stringify(items)); }, [items]);

  const openAdd = () => { setEditing(null); setForm({ name: '', sortOrder: 0 }); setModalOpen(true); };
  const openEdit = (item) => { setEditing(item); setForm({ ...item }); setModalOpen(true); };
  const save = () => { if (!form.name.trim()) return; editing ? setItems(prev => prev.map(i => i.id === editing.id ? { ...i, ...form } : i)) : setItems(prev => [...prev, { ...form, id: Date.now() }]); setModalOpen(false); };
  const remove = (id) => { if (confirm('Delete?')) setItems(prev => prev.filter(i => i.id !== id)); };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">Attribute Groups</h2>
        <button onClick={openAdd} className="btn-sword flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium self-start"><Plus size={16} /> Add Group</button>
      </div>
      <div className="bg-[#111] border border-white/10 rounded-xl p-4">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-500 text-xs border-b border-white/10"><th className="pb-2 font-medium"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></th><th className="pb-2 font-medium">Name</th><th className="pb-2 font-medium">Sort Order</th><th className="pb-2 font-medium text-right">Action</th></tr></thead>
          <tbody className="divide-y divide-white/5">
            {items.map(item => (
              <tr key={item.id} className="hover:bg-white/5 transition-colors">
                <td className="py-2.5"><input type="checkbox" className="rounded bg-[#1a1a1a] border-white/20" /></td>
                <td className="py-2.5 text-gray-300">{item.name}</td>
                <td className="py-2.5 text-gray-400">{item.sortOrder}</td>
                <td className="py-2.5 text-right flex items-center gap-2 justify-end">
                  <button onClick={() => openEdit(item)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-[#D4AF37] transition-colors"><Pencil size={14} /></button>
                  <button onClick={() => remove(item.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && (
        <Modal title={editing ? 'Edit Group' : 'Add Group'} onClose={() => setModalOpen(false)}>
          <div className="space-y-4"><Field label="Name" value={form.name} onChange={v => setForm({ ...form, name: v })} /><Field label="Sort Order" type="number" value={form.sortOrder} onChange={v => setForm({ ...form, sortOrder: Number(v) })} /></div>
          <div className="flex justify-end gap-3 p-5 border-t border-white/10 mt-6 -mx-5 -mb-5"><button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">Cancel</button><button onClick={save} className="btn-sword px-4 py-2 rounded-lg text-sm font-medium">Save</button></div>
        </Modal>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════ */

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-400 mb-1.5">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 bg-[#1a1a1a] border border-white/10 rounded-lg text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
      />
    </div>
  );
}

function StatusBadge({ status }) {
  const enabled = status === 'Enabled' || status === 'Enabled';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${enabled ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
      {status}
    </span>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-[#161616] border border-white/10 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400"><X size={18} /></button>
        </div>
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DEFAULT DATA
   ═══════════════════════════════════════════ */

function getDefaultCategories() {
  return [
    { id: 1, name: 'Water Purifiers', parent: 'Top Level', sortOrder: 1, status: 'Enabled' },
    { id: 2, name: 'RO Systems', parent: 'Water Purifiers', sortOrder: 1, status: 'Enabled' },
    { id: 3, name: 'NF Systems', parent: 'Water Purifiers', sortOrder: 2, status: 'Enabled' },
    { id: 4, name: 'Filter Cartridges', parent: 'Top Level', sortOrder: 2, status: 'Enabled' },
    { id: 5, name: 'UV Modules', parent: 'Top Level', sortOrder: 3, status: 'Enabled' },
    { id: 6, name: 'Accessories', parent: 'Top Level', sortOrder: 4, status: 'Enabled' },
  ];
}

function getDefaultManufacturers() {
  return [
    { id: 1, name: 'SWORD Electronics', sortOrder: 1 },
    { id: 2, name: 'DOW Chemicals', sortOrder: 2 },
    { id: 3, name: 'Philips UV', sortOrder: 3 },
    { id: 4, name: '3M Filtration', sortOrder: 4 },
  ];
}

function getDefaultReviews() {
  return [
    { id: 1, product: 'SWORD Smart RO - Pearl White', author: 'Rahul Sharma', rating: 5, status: 'Enabled', date: '2026-05-10' },
    { id: 2, product: 'SWORD Smart RO - Matte Black', author: 'Priya Patel', rating: 5, status: 'Enabled', date: '2026-05-09' },
    { id: 3, product: 'SWORD Filter Cartridge Set', author: 'Amit Kumar', rating: 4, status: 'Enabled', date: '2026-05-08' },
    { id: 4, product: 'SWORD Smart RO - Pearl White', author: 'Sneha Gupta', rating: 5, status: 'Enabled', date: '2026-05-07' },
    { id: 5, product: 'SWORD UV Sterilizer Module', author: 'Vikram Singh', rating: 4, status: 'Disabled', date: '2026-05-06' },
  ];
}

function getDefaultInformation() {
  return [
    { id: 1, title: 'About Us', description: 'SWORD Home Appliances - Leading water purification technology company in India.', sortOrder: 1, status: 'Enabled', bottom: 1 },
    { id: 2, title: 'Terms & Conditions', description: 'Standard terms and conditions for using our website and services.', sortOrder: 2, status: 'Enabled', bottom: 1 },
    { id: 3, title: 'Privacy Policy', description: 'How we collect, use, and protect your personal information.', sortOrder: 3, status: 'Enabled', bottom: 1 },
    { id: 4, title: 'Shipping & Returns', description: 'Information about our shipping policies and return process.', sortOrder: 4, status: 'Enabled', bottom: 1 },
    { id: 5, title: 'Contact Us', description: 'Get in touch with our customer support team.', sortOrder: 5, status: 'Enabled', bottom: 1 },
  ];
}

function getDefaultFilters() {
  return [
    { id: 1, name: 'Filter Type', sortOrder: 1 },
    { id: 2, name: 'Color', sortOrder: 2 },
    { id: 3, name: 'Price Range', sortOrder: 3 },
    { id: 4, name: 'Capacity', sortOrder: 4 },
  ];
}

function getDefaultOptions() {
  return [
    { id: 1, name: 'Color', type: 'Select', sortOrder: 1 },
    { id: 2, name: 'Size', type: 'Radio', sortOrder: 2 },
    { id: 3, name: 'Warranty Extension', type: 'Checkbox', sortOrder: 3 },
    { id: 4, name: 'Installation Type', type: 'Select', sortOrder: 4 },
  ];
}

function getDefaultRecurring() {
  return [
    { id: 1, name: 'Annual Filter Subscription', price: 4999, frequency: 'Year', duration: 0, cycle: 1, status: 'Enabled' },
    { id: 2, name: 'Quarterly Maintenance', price: 1499, frequency: 'Month', duration: 12, cycle: 3, status: 'Enabled' },
  ];
}

function getDefaultAttributes() {
  return [
    { id: 1, name: 'Filtration Stages', group: 'Technical', sortOrder: 1 },
    { id: 2, name: 'Water Flow Rate', group: 'Technical', sortOrder: 2 },
    { id: 3, name: 'TDS Range', group: 'Technical', sortOrder: 3 },
    { id: 4, name: 'Warranty Period', group: 'General', sortOrder: 1 },
    { id: 5, name: 'Installation Type', group: 'General', sortOrder: 2 },
  ];
}

function getDefaultAttributeGroups() {
  return [
    { id: 1, name: 'General', sortOrder: 1 },
    { id: 2, name: 'Technical', sortOrder: 2 },
    { id: 3, name: 'Dimensions', sortOrder: 3 },
  ];
}
