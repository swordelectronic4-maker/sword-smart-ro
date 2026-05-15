// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import {
  Pencil, Trash2, Plus, Search, Filter, ChevronLeft, ChevronRight,
  ChevronDown, X, Upload, Image as ImageIcon,
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   Constants & Shared Styles
   ═══════════════════════════════════════════════════════════════ */
const rupee = '\u20B9';
const inputCls = 'w-full bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded transition-colors';
const labelCls = 'block text-xs text-gray-400 mb-1';
const tabBase = 'px-4 py-2 text-sm border-b-2 transition-colors cursor-pointer whitespace-nowrap';
const tabActive = 'border-[#D4AF37] text-[#D4AF37]';
const tabInactive = 'border-transparent text-gray-400 hover:text-white';
const TABS = ['General','Data','Links','Attribute','Option','Discount','Special','Image','SEO'];
const CATEGORIES = ['Water Purifiers','Smart RO','Components','Filters','Membranes','Accessories','AMC Plans'];

/* ═══════════════════════════════════════════════════════════════
   Seed Data — 25 Sample Products
   ═══════════════════════════════════════════════════════════════ */
const SEED_PRODUCTS = [
  { id:'prod_1704000000001', name:'SWORD Classic RO System', model:'SWORD-RO-100', category:'Water Purifiers', price:12500, quantity:50, sold:12, status:'Enabled', image:'https://via.placeholder.com/40', description:'5-stage RO purification system' },
  { id:'prod_1704000000002', name:'SWORD Smart RO Pro', model:'SWORD-RO-200', category:'Smart RO', price:18500, quantity:35, sold:8, status:'Enabled', image:'https://via.placeholder.com/40', description:'Smart IoT enabled RO system with app control' },
  { id:'prod_1704000000003', name:'Sediment Filter 10"', model:'FLT-SED-10', category:'Filters', price:450, quantity:200, sold:89, status:'Enabled', image:'https://via.placeholder.com/40', description:'10 inch sediment filter cartridge' },
  { id:'prod_1704000000004', name:'Carbon Block Filter', model:'FLT-CBN-10', category:'Filters', price:650, quantity:150, sold:67, status:'Enabled', image:'https://via.placeholder.com/40', description:'Activated carbon block filter' },
  { id:'prod_1704000000005', name:'75 GPD RO Membrane', model:'MEM-75GPD', category:'Membranes', price:2800, quantity:80, sold:34, status:'Enabled', image:'https://via.placeholder.com/40', description:'75 gallons per day RO membrane' },
  { id:'prod_1704000000006', name:'100 GPD RO Membrane', model:'MEM-100GPD', category:'Membranes', price:3500, quantity:60, sold:22, status:'Enabled', image:'https://via.placeholder.com/40', description:'100 gallons per day RO membrane' },
  { id:'prod_1704000000007', name:'Faucet Adapter Kit', model:'ACC-FA-KIT', category:'Accessories', price:350, quantity:120, sold:45, status:'Disabled', image:'https://via.placeholder.com/40', description:'Universal faucet adapter kit' },
  { id:'prod_1704000000008', name:'Pipe Cutter Tool', model:'ACC-PC-TOOL', category:'Accessories', price:280, quantity:90, sold:18, status:'Enabled', image:'https://via.placeholder.com/40', description:'Professional pipe cutter for RO installation' },
  { id:'prod_1704000000009', name:'Annual Maintenance Plan', model:'AMC-SILVER', category:'AMC Plans', price:2500, quantity:999, sold:156, status:'Enabled', image:'https://via.placeholder.com/40', description:'Silver annual maintenance contract' },
  { id:'prod_1704000000010', name:'Premium AMC Plan', model:'AMC-GOLD', category:'AMC Plans', price:4500, quantity:999, sold:89, status:'Enabled', image:'https://via.placeholder.com/40', description:'Gold AMC with parts replacement' },
  { id:'prod_1704000000011', name:'Booster Pump 100GPD', model:'COMP-BP-100', category:'Components', price:3200, quantity:45, sold:15, status:'Enabled', image:'https://via.placeholder.com/40', description:'100 GPD booster pump for RO systems' },
  { id:'prod_1704000000012', name:'UV Sterilizer Module', model:'COMP-UV-11', category:'Components', price:1800, quantity:30, sold:10, status:'Disabled', image:'https://via.placeholder.com/40', description:'11W UV sterilizer module' },
  { id:'prod_1704000000013', name:'SWORD Ultra RO System', model:'SWORD-RO-500', category:'Water Purifiers', price:28500, quantity:20, sold:5, status:'Enabled', image:'https://via.placeholder.com/40', description:'Commercial grade 500 LPD RO system' },
  { id:'prod_1704000000014', name:'Inline Sediment Filter', model:'FLT-SED-IN', category:'Filters', price:550, quantity:175, sold:72, status:'Enabled', image:'https://via.placeholder.com/40', description:'Inline sediment filter cartridge' },
  { id:'prod_1704000000015', name:'50 GPD RO Membrane', model:'MEM-50GPD', category:'Membranes', price:2200, quantity:100, sold:41, status:'Enabled', image:'https://via.placeholder.com/40', description:'50 GPD RO membrane' },
  { id:'prod_1704000000016', name:'TDS Meter Pen', model:'ACC-TDS-PEN', category:'Accessories', price:480, quantity:85, sold:63, status:'Enabled', image:'https://via.placeholder.com/40', description:'Digital TDS meter testing pen' },
  { id:'prod_1704000000017', name:'Platinum AMC Plan', model:'AMC-PLAT', category:'AMC Plans', price:7500, quantity:999, sold:34, status:'Enabled', image:'https://via.placeholder.com/40', description:'Platinum AMC with complete parts coverage' },
  { id:'prod_1704000000018', name:'RO Housing Bowl', model:'COMP-HB-WH', category:'Components', price:750, quantity:110, sold:28, status:'Enabled', image:'https://via.placeholder.com/40', description:'White membrane housing bowl' },
  { id:'prod_1704000000019', name:'Flow Restrictor 300CC', model:'COMP-FR-300', category:'Components', price:120, quantity:250, sold:95, status:'Enabled', image:'https://via.placeholder.com/40', description:'300CC flow restrictor for RO systems' },
  { id:'prod_1704000000020', name:'SWORD Compact RO', model:'SWORD-RO-50', category:'Water Purifiers', price:8500, quantity:75, sold:38, status:'Enabled', image:'https://via.placeholder.com/40', description:'Compact 50 LPD RO for small families' },
  { id:'prod_1704000000021', name:'Inline Carbon Filter', model:'FLT-CBN-IN', category:'Filters', price:680, quantity:140, sold:56, status:'Disabled', image:'https://via.placeholder.com/40', description:'Inline activated carbon filter' },
  { id:'prod_1704000000022', name:'Alkaline Cartridge', model:'FLT-ALK-IN', category:'Filters', price:950, quantity:65, sold:23, status:'Enabled', image:'https://via.placeholder.com/40', description:'Mineral alkaline cartridge for pH balance' },
  { id:'prod_1704000000023', name:'SMPS Adapter 24V', model:'COMP-SMPS24', category:'Components', price:1450, quantity:55, sold:19, status:'Enabled', image:'https://via.placeholder.com/40', description:'24V SMPS power adapter for RO pump' },
  { id:'prod_1704000000024', name:'Float Valve Assembly', model:'ACC-FV-ASM', category:'Accessories', price:220, quantity:130, sold:47, status:'Enabled', image:'https://via.placeholder.com/40', description:'Float valve assembly for storage tank' },
  { id:'prod_1704000000025', name:'SWORD Industrial RO', model:'SWORD-RO-1000', category:'Water Purifiers', price:65000, quantity:8, sold:2, status:'Enabled', image:'https://via.placeholder.com/40', description:'Industrial 1000 LPD RO system for commercial use' },
];

/* ═══════════════════════════════════════════════════════════════
   localStorage Helpers
   ═══════════════════════════════════════════════════════════════ */
function getProducts() { try { return JSON.parse(localStorage.getItem('sword_products') || '[]'); } catch { return []; } }
function setProducts(val) { try { localStorage.setItem('sword_products', JSON.stringify(val)); } catch {} }
function saveProduct(formData, editingId) {
  const products = getProducts();
  if (editingId) { const idx = products.findIndex(p => p.id === editingId); if (idx !== -1) products[idx] = { ...products[idx], ...formData, updatedAt: new Date().toISOString() }; }
  else { products.push({ ...formData, id: 'prod_' + Date.now(), createdAt: new Date().toISOString() }); }
  setProducts(products); return products;
}
function deleteProduct(id) { const p = getProducts().filter(x => x.id !== id); setProducts(p); return p; }
function bulkDeleteProduct(ids) { const p = getProducts().filter(x => !ids.includes(x.id)); setProducts(p); return p; }
function seedInitialData() { try { if (JSON.parse(localStorage.getItem('sword_products') || '[]').length) return; } catch { return; } setProducts(SEED_PRODUCTS); }

/* ═══════════════════════════════════════════════════════════════
   Toggle Switch Component
   ═══════════════════════════════════════════════════════════════ */
function ToggleSwitch({ on, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div onClick={onChange} className={`w-9 h-5 rounded-full flex items-center transition-colors ${on ? 'bg-[#D4AF37]' : 'bg-gray-600'}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${on ? 'ml-[18px]' : 'ml-0.5'}`} />
      </div>
      <span className="text-xs text-gray-400">{label}</span>
    </label>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Main Products Component
   ═══════════════════════════════════════════════════════════════ */
export default function Products() {
  useEffect(() => { seedInitialData(); }, []);

  /* ────── State ────── */
  const [products, setProductsState] = useState(() => getProducts());
  const [refreshKey, setRefreshKey] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterModel, setFilterModel] = useState('');
  const [filterPrice, setFilterPrice] = useState('');
  const [filterQty, setFilterQty] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortCol, setSortCol] = useState('name');
  const [sortDir, setSortDir] = useState('asc');
  const [selected, setSelected] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('General');
  const [form, setForm] = useState({});
  const [attrRows, setAttrRows] = useState([]);
  const [optRows, setOptRows] = useState([]);
  const [discRows, setDiscRows] = useState([]);
  const [specRows, setSpecRows] = useState([]);
  const [addImages, setAddImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  /* ────── Helpers ────── */
  function refresh() { setProductsState(getProducts()); setRefreshKey(k => k + 1); }

  /* ────── Filtering & Sorting ────── */
  const filtered = useMemo(() => {
    let d = [...products];
    if (filterName) d = d.filter(p => (p.name || '').toLowerCase().includes(filterName.toLowerCase()));
    if (filterModel) d = d.filter(p => (p.model || '').toLowerCase().includes(filterModel.toLowerCase()));
    if (filterPrice) d = d.filter(p => String(p.price || '').includes(filterPrice));
    if (filterQty) d = d.filter(p => String(p.quantity || '').includes(filterQty));
    if (filterCategory) d = d.filter(p => (p.category || '').toLowerCase() === filterCategory.toLowerCase());
    if (filterStatus) d = d.filter(p => (p.status || '').toLowerCase() === filterStatus.toLowerCase());
    d.sort((a, b) => { const av = a[sortCol] || '', bv = b[sortCol] || ''; if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av; return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av)); });
    return d;
  }, [products, filterName, filterModel, filterPrice, filterQty, filterCategory, filterStatus, sortCol, sortDir, refreshKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  useEffect(() => { setCurrentPage(1); }, [filterName, filterModel, filterPrice, filterQty, filterCategory, filterStatus]);

  /* ────── Table helpers ────── */
  function toggleSort(col) { if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortCol(col); setSortDir('asc'); } }
  function toggleSelect(id) { setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; }); }
  function toggleSelectAll() { if (selected.size === paginated.length && paginated.length > 0) setSelected(new Set()); else setSelected(new Set(paginated.map(p => p.id))); }
  function SortHeader({ label, col }) { return (<th className="bg-[#111] text-gray-400 text-xs uppercase px-3 py-3 text-left cursor-pointer select-none hover:text-white transition-colors" onClick={() => toggleSort(col)}><span className="inline-flex items-center gap-1">{label}{sortCol === col && <ChevronDown size={12} className={`transition-transform ${sortDir === 'desc' ? 'rotate-180' : ''}`} />}</span></th>); }

  /* ────── Modal helpers ────── */
  function openAdd() {
    setEditingId(null);
    setForm({ name:'', description:'', metaTagTitle:'', metaTagDescription:'', metaTagKeywords:'', productTags:'', model:'', sku:'', upc:'', ean:'', jan:'', isbn:'', mpn:'', price:'', cost:'', quantity:'', minimum:'1', subtractStock:true, outOfStockStatus:'Out of Stock', requiresShipping:true, dateAvailable:'', length:'', width:'', height:'', weight:'', status:'Enabled', sortOrder:'0', categories:[], manufacturer:'', filters:'', seoKeyword:'', image:'' });
    setAttrRows([]); setOptRows([]); setDiscRows([]); setSpecRows([]); setAddImages([]); setNewImageUrl(''); setActiveTab('General'); setShowModal(true);
  }
  function openEdit(product) {
    setEditingId(product.id);
    setForm({ name:product.name||'', description:product.description||'', metaTagTitle:product.metaTagTitle||'', metaTagDescription:product.metaTagDescription||'', metaTagKeywords:product.metaTagKeywords||'', productTags:product.productTags||'', model:product.model||'', sku:product.sku||'', upc:product.upc||'', ean:product.ean||'', jan:product.jan||'', isbn:product.isbn||'', mpn:product.mpn||'', price:product.price!=null?String(product.price):'', cost:product.cost!=null?String(product.cost):'', quantity:product.quantity!=null?String(product.quantity):'', minimum:String(product.minimum||'1'), subtractStock:product.subtractStock!==false, outOfStockStatus:product.outOfStockStatus||'Out of Stock', requiresShipping:product.requiresShipping!==false, dateAvailable:product.dateAvailable||'', length:product.length||'', width:product.width||'', height:product.height||'', weight:product.weight||'', status:product.status||'Enabled', sortOrder:String(product.sortOrder||'0'), categories:product.categories||[], manufacturer:product.manufacturer||'', filters:product.filters||'', seoKeyword:product.seoKeyword||'', image:product.image||'' });
    setAttrRows(product.attributes||[]); setOptRows(product.options||[]); setDiscRows(product.discounts||[]); setSpecRows(product.specials||[]); setAddImages(product.additionalImages||[]); setNewImageUrl(''); setActiveTab('General'); setShowModal(true);
  }
  function handleSave() {
    saveProduct({ ...form, price:parseFloat(form.price)||0, cost:parseFloat(form.cost)||0, quantity:parseInt(form.quantity)||0, minimum:parseInt(form.minimum)||1, length:parseFloat(form.length)||0, width:parseFloat(form.width)||0, height:parseFloat(form.height)||0, weight:parseFloat(form.weight)||0, sortOrder:parseInt(form.sortOrder)||0, image:form.image||'https://via.placeholder.com/40', category:form.categories&&form.categories.length>0?form.categories[0]:'', attributes:attrRows, options:optRows, discounts:discRows, specials:specRows, additionalImages:addImages }, editingId);
    setShowModal(false); setEditingId(null); refresh();
  }
  function handleDelete(id) { deleteProduct(id); setDeleteConfirm(null); refresh(); }
  function handleBulkDelete() { if (selected.size === 0) return; bulkDeleteProduct(Array.from(selected)); setSelected(new Set()); refresh(); }
  function toggleCategory(cat) { setForm(prev => { const c = [...(prev.categories||[])]; const i = c.indexOf(cat); if (i > -1) c.splice(i,1); else c.push(cat); return {...prev, categories:c}; }); }

  /* ═══════════════════════════════════════════════════════════════
     Dynamic Row Helpers
     ═══════════════════════════════════════════════════════════════ */
  const AR = { add:() => setAttrRows(p => [...p,{name:'',value:''}]), upd:(i,f,v) => setAttrRows(p => { const n=[...p]; n[i]={...n[i],[f]:v}; return n; }), rem:i => setAttrRows(p => p.filter((_,x) => x !== i)) };
  const OR = { add:() => setOptRows(p => [...p,{name:'',type:'select',required:false,values:[]}]), upd:(i,f,v) => setOptRows(p => { const n=[...p]; n[i]={...n[i],[f]:v}; return n; }), rem:i => setOptRows(p => p.filter((_,x) => x !== i)), addVal:i => setOptRows(p => { const n=[...p]; n[i]={...n[i],values:[...(n[i].values||[]),{name:'',quantity:'',price:''}]}; return n; }), updVal:(ri,vi,f,v) => setOptRows(p => { const n=[...p]; const vals=[...n[ri].values]; vals[vi]={...vals[vi],[f]:v}; n[ri]={...n[ri],values:vals}; return n; }), remVal:(ri,vi) => setOptRows(p => { const n=[...p]; n[ri]={...n[ri],values:(n[ri].values||[]).filter((_,x) => x !== vi)}; return n; }) };
  const DR = { add:() => setDiscRows(p => [...p,{customerGroup:'',quantity:'',priority:'',price:'',dateStart:'',dateEnd:''}]), upd:(i,f,v) => setDiscRows(p => { const n=[...p]; n[i]={...n[i],[f]:v}; return n; }), rem:i => setDiscRows(p => p.filter((_,x) => x !== i)) };
  const SR = { add:() => setSpecRows(p => [...p,{customerGroup:'',priority:'',price:'',dateStart:'',dateEnd:''}]), upd:(i,f,v) => setSpecRows(p => { const n=[...p]; n[i]={...n[i],[f]:v}; return n; }), rem:i => setSpecRows(p => p.filter((_,x) => x !== i)) };
  const IR = { add:() => { if (!newImageUrl.trim()) return; setAddImages(p => [...p,{url:newImageUrl.trim(),sortOrder:String((p.length+1)*10)}]); setNewImageUrl(''); }, rem:i => setAddImages(p => p.filter((_,x) => x !== i)), updSort:(i,v) => setAddImages(p => { const n=[...p]; n[i]={...n[i],sortOrder:v}; return n; }) };

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <div className="p-6 min-h-screen bg-black">

      {/* ====== Top Actions Bar ====== */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-white">Products</h1>
        <div className="flex items-center gap-3">
          <button onClick={openAdd} className="inline-flex items-center gap-2 bg-[#D4AF37] text-black text-sm font-medium px-4 py-2 rounded hover:bg-[#c4a030] transition-colors"><Plus size={16} /> Add</button>
          <button className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.12] text-white text-sm px-4 py-2 rounded hover:bg-white/[0.1] transition-colors"><Upload size={16} /> Export</button>
          <button className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.12] text-white text-sm px-4 py-2 rounded hover:bg-white/[0.1] transition-colors"><Upload size={16} className="rotate-180" /> Import</button>
        </div>
      </div>

      {/* ====== Filter Panel ====== */}
      <div className="mb-4">
        <button onClick={() => setShowFilters(s => !s)} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-2">
          <Filter size={14} /> Filter <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        {showFilters && (
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-4 gap-3">
              <div><label className={labelCls}>Product Name</label><input type="text" value={filterName} onChange={e => setFilterName(e.target.value)} placeholder="Product Name" className={inputCls} /></div>
              <div><label className={labelCls}>Model</label><input type="text" value={filterModel} onChange={e => setFilterModel(e.target.value)} placeholder="Model" className={inputCls} /></div>
              <div><label className={labelCls}>Price</label><input type="text" value={filterPrice} onChange={e => setFilterPrice(e.target.value)} placeholder="Price" className={inputCls} /></div>
              <div><label className={labelCls}>Quantity</label><input type="text" value={filterQty} onChange={e => setFilterQty(e.target.value)} placeholder="Quantity" className={inputCls} /></div>
            </div>
            <div className="grid grid-cols-5 gap-3">
              <div><label className={labelCls}>Categories</label><select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={inputCls}><option value="">-- All Categories --</option><option value="Water Purifiers">Water Purifiers</option><option value="Smart RO">&nbsp;&nbsp;&nbsp;Smart RO</option><option value="Components">&nbsp;&nbsp;&nbsp;Components</option><option value="Filters">Filters</option><option value="Membranes">Membranes</option><option value="Accessories">Accessories</option><option value="AMC Plans">AMC Plans</option></select></div>
              <div><label className={labelCls}>Manufacturer</label><select className={inputCls}><option value="">-- None --</option></select></div>
              <div><label className={labelCls}>Supplier</label><select className={inputCls}><option value="">-- None --</option></select></div>
              <div><label className={labelCls}>Status</label><select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={inputCls}><option value="">-- All --</option><option value="Enabled">Enabled</option><option value="Disabled">Disabled</option></select></div>
              <div className="flex items-end"><button className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.12] text-white text-sm px-4 py-2 rounded hover:bg-white/[0.1] transition-colors w-full justify-center"><Search size={14} /> Filter</button></div>
            </div>
          </div>
        )}
      </div>

      {/* ====== Bulk Actions ====== */}
      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <span className="text-sm text-gray-400">{selected.size} selected</span>
          <button onClick={handleBulkDelete} className="text-sm text-red-400 hover:text-red-300 px-3 py-1 rounded bg-red-500/10 border border-red-500/20 transition-colors">Delete Selected</button>
        </div>
      )}

      {/* ====== Product Table ====== */}
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead><tr>
              <th className="bg-[#111] text-gray-400 text-xs uppercase px-3 py-3 w-10"><input type="checkbox" checked={paginated.length > 0 && selected.size === paginated.length} onChange={toggleSelectAll} className="rounded border-white/20 bg-white/[0.06]" /></th>
              <th className="bg-[#111] text-gray-400 text-xs uppercase px-3 py-3 w-14">Image</th>
              <SortHeader label="Product Name" col="name" />
              <SortHeader label="Model" col="model" />
              <SortHeader label="Category" col="category" />
              <SortHeader label="Price" col="price" />
              <SortHeader label="Quantity" col="quantity" />
              <SortHeader label="Sold" col="sold" />
              <SortHeader label="Status" col="status" />
              <th className="bg-[#111] text-gray-400 text-xs uppercase px-3 py-3 w-24 text-center">Action</th>
            </tr></thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-500 text-sm">No products found.</td></tr>
              ) : paginated.map(p => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                  <td className="px-3 py-3"><input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} className="rounded border-white/20 bg-white/[0.06]" /></td>
                  <td className="px-3 py-3"><img src={p.image || 'https://via.placeholder.com/40'} alt={p.name} className="w-10 h-10 rounded object-cover bg-white/5" onError={e => { e.currentTarget.src = 'https://via.placeholder.com/40'; }} /></td>
                  <td className="px-3 py-3"><button onClick={() => openEdit(p)} className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">{p.name}</button></td>
                  <td className="px-3 py-3 text-gray-300 text-sm">{p.model}</td>
                  <td className="px-3 py-3 text-gray-300 text-sm">{p.category}</td>
                  <td className="px-3 py-3 text-gray-300 text-sm">{rupee}{Number(p.price || 0).toLocaleString('en-IN')}</td>
                  <td className="px-3 py-3 text-gray-300 text-sm">{p.quantity}</td>
                  <td className="px-3 py-3 text-gray-300 text-sm">{p.sold || 0}</td>
                  <td className="px-3 py-3"><span className={p.status === 'Enabled' ? 'bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded' : 'bg-gray-500/20 text-gray-400 text-xs px-2 py-0.5 rounded'}>{p.status || 'Enabled'}</span></td>
                  <td className="px-3 py-3"><div className="flex items-center justify-center gap-2"><button onClick={() => openEdit(p)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded transition-colors" title="Edit"><Pencil size={14} /></button><button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Delete"><Trash2 size={14} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ====== Pagination ====== */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.08]">
          <span className="text-sm text-gray-400">Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} ({totalPages} Pages)</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} onClick={() => setCurrentPage(page)} className={`w-8 h-8 text-xs rounded transition-colors ${page === currentPage ? 'bg-[#D4AF37] text-black font-medium' : 'bg-white/[0.06] text-gray-300 hover:bg-white/[0.1]'}`}>{page}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages} className="w-8 h-8 text-xs rounded bg-white/[0.06] text-gray-300 hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"><ChevronRight size={14} /></button>
            <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage >= totalPages} className="w-8 h-8 text-xs rounded bg-white/[0.06] text-gray-300 hover:bg-white/[0.1] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"><span className="text-[10px] font-bold">&gt;&gt;</span></button>
          </div>
        </div>
      </div>

      {/* ====== Delete Confirmation ====== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-white/[0.12] rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-white font-medium mb-2">Confirm Delete</h3>
            <p className="text-gray-400 text-sm mb-4">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════
          Add / Edit Product Modal (9 tabs)
          ═══════════════════════════════════════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/[0.12] rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.08] flex-shrink-0">
              <h2 className="text-lg font-medium text-white">{editingId ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => { setShowModal(false); setEditingId(null); }} className="text-gray-400 hover:text-white transition-colors"><X size={20} /></button>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-1 px-6 border-b border-white/[0.08] overflow-x-auto flex-shrink-0">
              {TABS.map(t => (
                <button key={t} onClick={() => setActiveTab(t)} className={`${tabBase} ${activeTab === t ? tabActive : tabInactive}`}>
                  {t}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">

              {/* ─────────── Tab 1: General ─────────── */}
              {activeTab === 'General' && (
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className={labelCls}>
                      Product Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name || ''}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Description</label>
                    <textarea
                      rows={4}
                      value={form.description || ''}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                      className={inputCls + ' resize-none'}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Meta Tag Title</label>
                    <input
                      type="text"
                      value={form.metaTagTitle || ''}
                      onChange={(e) => setForm({ ...form, metaTagTitle: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Meta Tag Description</label>
                    <textarea
                      rows={3}
                      value={form.metaTagDescription || ''}
                      onChange={(e) => setForm({ ...form, metaTagDescription: e.target.value })}
                      className={inputCls + ' resize-none'}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Meta Tag Keywords</label>
                    <input
                      type="text"
                      value={form.metaTagKeywords || ''}
                      onChange={(e) => setForm({ ...form, metaTagKeywords: e.target.value })}
                      placeholder="keyword1, keyword2, keyword3"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Product Tags</label>
                    <input
                      type="text"
                      value={form.productTags || ''}
                      onChange={(e) => setForm({ ...form, productTags: e.target.value })}
                      placeholder="tag1, tag2, tag3"
                      className={inputCls}
                    />
                  </div>
                </div>
              )}

              {/* ─────────── Tab 2: Data ─────────── */}
              {activeTab === 'Data' && (
                <div className="grid grid-cols-3 gap-4">
                  {/* Row 1: Model, SKU, UPC */}
                  <div>
                    <label className={labelCls}>Model</label>
                    <input
                      type="text"
                      value={form.model || ''}
                      onChange={(e) => setForm({ ...form, model: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>SKU</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={form.sku || ''}
                        onChange={(e) => setForm({ ...form, sku: e.target.value })}
                        className={inputCls + ' flex-1'}
                      />
                      <button
                        onClick={() => setForm({ ...form, sku: 'SKU-' + Date.now().toString(36).toUpperCase() })}
                        className="text-xs bg-white/[0.08] border border-white/[0.12] text-gray-300 px-3 py-2 rounded hover:bg-white/[0.12] transition-colors whitespace-nowrap"
                      >
                        Auto Generate
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>UPC</label>
                    <input
                      type="text"
                      value={form.upc || ''}
                      onChange={(e) => setForm({ ...form, upc: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  {/* Row 2: EAN, JAN, ISBN */}
                  <div>
                    <label className={labelCls}>EAN</label>
                    <input
                      type="text"
                      value={form.ean || ''}
                      onChange={(e) => setForm({ ...form, ean: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>JAN</label>
                    <input
                      type="text"
                      value={form.jan || ''}
                      onChange={(e) => setForm({ ...form, jan: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>ISBN</label>
                    <input
                      type="text"
                      value={form.isbn || ''}
                      onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  {/* Row 3: MPN, Price, Cost */}
                  <div>
                    <label className={labelCls}>MPN</label>
                    <input
                      type="text"
                      value={form.mpn || ''}
                      onChange={(e) => setForm({ ...form, mpn: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Price ({rupee})</label>
                    <input
                      type="number"
                      value={form.price || ''}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Cost ({rupee})</label>
                    <input
                      type="number"
                      value={form.cost || ''}
                      onChange={(e) => setForm({ ...form, cost: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  {/* Row 4: Qty, Min Qty, Subtract Stock */}
                  <div>
                    <label className={labelCls}>Quantity</label>
                    <input
                      type="number"
                      value={form.quantity || ''}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Minimum Quantity</label>
                    <input
                      type="number"
                      value={form.minimum || '1'}
                      onChange={(e) => setForm({ ...form, minimum: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <ToggleSwitch
                      on={form.subtractStock !== false}
                      onChange={() => setForm({ ...form, subtractStock: !form.subtractStock })}
                      label="Subtract Stock"
                    />
                  </div>
                  {/* Row 5: Stock Status, Shipping, Date */}
                  <div>
                    <label className={labelCls}>Out of Stock Status</label>
                    <select
                      value={form.outOfStockStatus || 'Out of Stock'}
                      onChange={(e) => setForm({ ...form, outOfStockStatus: e.target.value })}
                      className={inputCls}
                    >
                      <option>Out of Stock</option>
                      <option>In Stock</option>
                      <option>Pre-Order</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <ToggleSwitch
                      on={form.requiresShipping !== false}
                      onChange={() => setForm({ ...form, requiresShipping: !form.requiresShipping })}
                      label="Requires Shipping"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Date Available</label>
                    <input
                      type="date"
                      value={form.dateAvailable || ''}
                      onChange={(e) => setForm({ ...form, dateAvailable: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  {/* Row 6: Dimensions (full width) */}
                  <div className="col-span-3">
                    <label className={labelCls}>Dimensions (L x W x H)</label>
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        placeholder="Length"
                        value={form.length || ''}
                        onChange={(e) => setForm({ ...form, length: e.target.value })}
                        className={inputCls}
                      />
                      <input
                        type="number"
                        placeholder="Width"
                        value={form.width || ''}
                        onChange={(e) => setForm({ ...form, width: e.target.value })}
                        className={inputCls}
                      />
                      <input
                        type="number"
                        placeholder="Height"
                        value={form.height || ''}
                        onChange={(e) => setForm({ ...form, height: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                  </div>
                  {/* Row 7: Weight, Status, Sort Order */}
                  <div>
                    <label className={labelCls}>Weight</label>
                    <input
                      type="number"
                      value={form.weight || ''}
                      onChange={(e) => setForm({ ...form, weight: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-5">
                    <ToggleSwitch
                      on={(form.status || 'Enabled') === 'Enabled'}
                      onChange={() => setForm({ ...form, status: (form.status || 'Enabled') === 'Enabled' ? 'Disabled' : 'Enabled' })}
                      label={(form.status || 'Enabled') === 'Enabled' ? 'Enabled' : 'Disabled'}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Sort Order</label>
                    <input
                      type="number"
                      value={form.sortOrder || '0'}
                      onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>
              )}

              {/* ─────────── Tab 3: Links ─────────── */}
              {activeTab === 'Links' && (
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Categories</label>
                    <div className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-3 space-y-1.5">
                      {CATEGORIES.map((cat) => (
                        <label key={cat} className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer hover:text-white transition-colors">
                          <input
                            type="checkbox"
                            checked={(form.categories || []).includes(cat)}
                            onChange={() => toggleCategory(cat)}
                            className="rounded border-white/20 bg-white/[0.06]"
                          />
                          {cat}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>Manufacturer</label>
                    <select
                      value={form.manufacturer || ''}
                      onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                      className={inputCls}
                    >
                      <option value="">-- None --</option>
                      <option>SWORD</option>
                      <option>Generic</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Filters</label>
                    <input
                      type="text"
                      value={form.filters || ''}
                      onChange={(e) => setForm({ ...form, filters: e.target.value })}
                      placeholder="Comma separated filter names"
                      className={inputCls}
                    />
                  </div>
                </div>
              )}

              {/* ─────────── Tab 4: Attribute ─────────── */}
              {activeTab === 'Attribute' && (
                <div className="space-y-3">
                  {attrRows.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No attributes added yet.</p>
                  )}
                  {attrRows.map((row, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end bg-white/[0.02] border border-white/[0.06] rounded p-3">
                      <div>
                        <label className={labelCls}>Attribute Name</label>
                        <input
                          type="text"
                          value={row.name || ''}
                          onChange={(e) => updateAttrRow(i, 'name', e.target.value)}
                          placeholder="e.g. Color"
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Attribute Value</label>
                        <input
                          type="text"
                          value={row.value || ''}
                          onChange={(e) => updateAttrRow(i, 'value', e.target.value)}
                          placeholder="e.g. Red"
                          className={inputCls}
                        />
                      </div>
                      <button
                        onClick={() => removeAttrRow(i)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addAttrRow}
                    className="inline-flex items-center gap-2 text-sm text-[#D4AF37] hover:text-[#e0be4f] transition-colors"
                  >
                    <Plus size={14} />
                    Add Attribute
                  </button>
                </div>
              )}

              {/* ─────────── Tab 5: Option ─────────── */}
              {activeTab === 'Option' && (
                <div className="space-y-4">
                  {optRows.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No options added yet.</p>
                  )}
                  {optRows.map((row, i) => (
                    <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded p-3 space-y-3">
                      <div className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-end">
                        <div>
                          <label className={labelCls}>Option Name</label>
                          <input
                            type="text"
                            value={row.name || ''}
                            onChange={(e) => updateOptRow(i, 'name', e.target.value)}
                            placeholder="e.g. Size"
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Type</label>
                          <select
                            value={row.type || 'select'}
                            onChange={(e) => updateOptRow(i, 'type', e.target.value)}
                            className={inputCls}
                          >
                            <option>select</option>
                            <option>radio</option>
                            <option>checkbox</option>
                            <option>text</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2 pb-2">
                          <label className="flex items-center gap-1 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={!!row.required}
                              onChange={(e) => updateOptRow(i, 'required', e.target.checked)}
                              className="rounded border-white/20 bg-white/[0.06]"
                            />
                            <span className="text-xs text-gray-400">Required</span>
                          </label>
                        </div>
                        <button
                          onClick={() => removeOptRow(i)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors mb-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {(row.values || []).length > 0 && (
                        <div className="pl-4 border-l-2 border-white/[0.06] space-y-2">
                          {row.values.map((val, vi) => (
                            <div key={vi} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
                              <input
                                type="text"
                                value={val.name || ''}
                                onChange={(e) => updateOptValue(i, vi, 'name', e.target.value)}
                                placeholder="Value name"
                                className={inputCls}
                              />
                              <input
                                type="number"
                                value={val.quantity || ''}
                                onChange={(e) => updateOptValue(i, vi, 'quantity', e.target.value)}
                                placeholder="Quantity"
                                className={inputCls}
                              />
                              <input
                                type="number"
                                value={val.price || ''}
                                onChange={(e) => updateOptValue(i, vi, 'price', e.target.value)}
                                placeholder={`Price (${rupee})`}
                                className={inputCls}
                              />
                              <button
                                onClick={() => removeOptValue(i, vi)}
                                className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => addOptValue(i)}
                        className="text-xs text-[#D4AF37] hover:text-[#e0be4f] transition-colors inline-flex items-center gap-1"
                      >
                        <Plus size={12} />
                        Add Option Value
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addOptRow}
                    className="inline-flex items-center gap-2 text-sm text-[#D4AF37] hover:text-[#e0be4f] transition-colors"
                  >
                    <Plus size={14} />
                    Add Option
                  </button>
                </div>
              )}

              {/* ─────────── Tab 6: Discount ─────────── */}
              {activeTab === 'Discount' && (
                <div className="space-y-3">
                  {discRows.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No discounts added yet.</p>
                  )}
                  {discRows.map((row, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-2 items-end bg-white/[0.02] border border-white/[0.06] rounded p-3">
                      <div>
                        <label className={labelCls}>Customer Group</label>
                        <select
                          value={row.customerGroup || ''}
                          onChange={(e) => updateDiscRow(i, 'customerGroup', e.target.value)}
                          className={inputCls}
                        >
                          <option value="">Default</option>
                          <option>Wholesale</option>
                          <option>Retail</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Quantity</label>
                        <input
                          type="number"
                          value={row.quantity || ''}
                          onChange={(e) => updateDiscRow(i, 'quantity', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Priority</label>
                        <input
                          type="number"
                          value={row.priority || ''}
                          onChange={(e) => updateDiscRow(i, 'priority', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Price ({rupee})</label>
                        <input
                          type="number"
                          value={row.price || ''}
                          onChange={(e) => updateDiscRow(i, 'price', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Date Start</label>
                        <input
                          type="date"
                          value={row.dateStart || ''}
                          onChange={(e) => updateDiscRow(i, 'dateStart', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Date End</label>
                        <input
                          type="date"
                          value={row.dateEnd || ''}
                          onChange={(e) => updateDiscRow(i, 'dateEnd', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <button
                        onClick={() => removeDiscRow(i)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addDiscRow}
                    className="inline-flex items-center gap-2 text-sm text-[#D4AF37] hover:text-[#e0be4f] transition-colors"
                  >
                    <Plus size={14} />
                    Add Discount
                  </button>
                </div>
              )}

              {/* ─────────── Tab 7: Special ─────────── */}
              {activeTab === 'Special' && (
                <div className="space-y-3">
                  {specRows.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">No special prices added yet.</p>
                  )}
                  {specRows.map((row, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] gap-2 items-end bg-white/[0.02] border border-white/[0.06] rounded p-3">
                      <div>
                        <label className={labelCls}>Customer Group</label>
                        <select
                          value={row.customerGroup || ''}
                          onChange={(e) => updateSpecRow(i, 'customerGroup', e.target.value)}
                          className={inputCls}
                        >
                          <option value="">Default</option>
                          <option>Wholesale</option>
                          <option>Retail</option>
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Priority</label>
                        <input
                          type="number"
                          value={row.priority || ''}
                          onChange={(e) => updateSpecRow(i, 'priority', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Price ({rupee})</label>
                        <input
                          type="number"
                          value={row.price || ''}
                          onChange={(e) => updateSpecRow(i, 'price', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Date Start</label>
                        <input
                          type="date"
                          value={row.dateStart || ''}
                          onChange={(e) => updateSpecRow(i, 'dateStart', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Date End</label>
                        <input
                          type="date"
                          value={row.dateEnd || ''}
                          onChange={(e) => updateSpecRow(i, 'dateEnd', e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <button
                        onClick={() => removeSpecRow(i)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addSpecRow}
                    className="inline-flex items-center gap-2 text-sm text-[#D4AF37] hover:text-[#e0be4f] transition-colors"
                  >
                    <Plus size={14} />
                    Add Special Price
                  </button>
                </div>
              )}

              {/* ─────────── Tab 8: Image ─────────── */}
              {activeTab === 'Image' && (
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>Primary Image</label>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-32 bg-white/[0.04] border border-white/[0.1] rounded-lg flex items-center justify-center overflow-hidden">
                        {form.image ? (
                          <img
                            src={form.image}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        ) : (
                          <ImageIcon size={32} className="text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="text"
                          value={form.image || ''}
                          onChange={(e) => setForm({ ...form, image: e.target.value })}
                          placeholder="Image URL"
                          className={inputCls}
                        />
                        <p className="text-xs text-gray-500">
                          Enter an image URL or use a placeholder
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-white/[0.06] pt-4">
                    <label className={labelCls}>Additional Images</label>
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="text"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addImageUrl()}
                        placeholder="Image URL"
                        className={inputCls + ' flex-1'}
                      />
                      <button
                        onClick={addImageUrl}
                        className="inline-flex items-center gap-1 text-sm text-[#D4AF37] hover:text-[#e0be4f] border border-[#D4AF37]/30 px-3 py-2 rounded transition-colors"
                      >
                        <Plus size={14} />
                        Add Image
                      </button>
                    </div>
                    {addImages.length > 0 && (
                      <div className="grid grid-cols-4 gap-3">
                        {addImages.map((img, i) => (
                          <div key={i} className="bg-white/[0.03] border border-white/[0.08] rounded-lg p-2 space-y-2">
                            <div className="w-full h-24 bg-white/[0.04] rounded flex items-center justify-center overflow-hidden">
                              <img
                                src={img.url}
                                alt=""
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                              />
                            </div>
                            <input
                              type="text"
                              value={img.sortOrder}
                              onChange={(e) => updateAddImageSort(i, e.target.value)}
                              placeholder="Sort Order"
                              className={inputCls + ' text-xs py-1'}
                            />
                            <button
                              onClick={() => removeAddImage(i)}
                              className="w-full text-xs text-red-400 hover:bg-red-500/10 py-1 rounded transition-colors flex items-center justify-center gap-1"
                            >
                              <Trash2 size={12} />
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─────────── Tab 9: SEO ─────────── */}
              {activeTab === 'SEO' && (
                <div className="space-y-4">
                  <div>
                    <label className={labelCls}>SEO Keyword</label>
                    <input
                      type="text"
                      value={form.seoKeyword || ''}
                      onChange={(e) => setForm({ ...form, seoKeyword: e.target.value })}
                      placeholder="url-friendly-slug"
                      className={inputCls}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Do not use spaces, instead replace spaces with -
                      and make sure the SEO keyword is globally unique.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/[0.08] flex-shrink-0">
              <button
                onClick={() => { setShowModal(false); setEditingId(null); }}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white border border-white/[0.12] rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm bg-[#D4AF37] text-black font-medium rounded hover:bg-[#c4a030] transition-colors"
              >
                {editingId ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
