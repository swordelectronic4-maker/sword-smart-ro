// @ts-nocheck
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  LayoutDashboard, BarChart3, ShoppingBag, Users, Package, Warehouse,
  Ticket, Calendar, Truck, CreditCard, FileText, ClipboardList, Settings,
  Search, Bell, ChevronLeft, ChevronRight, Eye, Pencil, Trash2, X,
  IndianRupee, TrendingUp, TrendingDown, Download, CheckCircle,
  XCircle, AlertTriangle, Menu, LogOut, User,
  Plus, ChevronDown, ArrowUpDown,
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  adminOrders, adminUsers, adminProducts, inventory, coupons,
  subscriptions, shipments, transactions, auditLogs, revenueData,
  salesTrendData, revenueByCategory, ordersByStatus, userAcquisitionData,
  gstData, paymentMethodData, topProducts, notifications as notifs,
  settingsData, rolePermissions,
} from '@/data/adminData';
import type {
  AdminOrder, AdminUser, AdminProduct, Coupon,
  Transaction, AuditLog, InventoryItem, OrderStatus,
  ProductStatus, CouponType,
} from '@/data/adminData';

/* ===== Utility ===== */
const INR = (n: number) => `\u20B9${n.toLocaleString('en-IN')}`;
const COLORS = ['#D4AF37', '#2EC4B6', '#7B61FF', '#E63946', '#00B4D8', '#E8A838'];
const STATUS_COLORS: Record<string, string> = {
  placed: 'bg-[#00B4D8]/10 text-[#00B4D8]',
  processing: 'bg-[#E8A838]/10 text-[#E8A838]',
  shipped: 'bg-[#7B61FF]/10 text-[#7B61FF]',
  delivered: 'bg-[#2EC4B6]/10 text-[#2EC4B6]',
  cancelled: 'bg-[#E63946]/10 text-[#E63946]',
  out_for_delivery: 'bg-[#9B5DE5]/10 text-[#9B5DE5]',
  active: 'bg-[#2EC4B6]/10 text-[#2EC4B6]',
  inactive: 'bg-[#666]/10 text-[#666]',
  suspended: 'bg-[#E63946]/10 text-[#E63946]',
  paused: 'bg-[#E8A838]/10 text-[#E8A838]',
  expired: 'bg-[#666]/10 text-[#666]',
  captured: 'bg-[#2EC4B6]/10 text-[#2EC4B6]',
  failed: 'bg-[#E63946]/10 text-[#E63946]',
  refunded: 'bg-[#E8A838]/10 text-[#E8A838]',
  partially_refunded: 'bg-[#9B5DE5]/10 text-[#9B5DE5]',
  pending: 'bg-[#00B4D8]/10 text-[#00B4D8]',
  booked: 'bg-[#00B4D8]/10 text-[#00B4D8]',
  picked_up: 'bg-[#7B61FF]/10 text-[#7B61FF]',
  in_transit: 'bg-[#E8A838]/10 text-[#E8A838]',
  rto: 'bg-[#E63946]/10 text-[#E63946]',
};
const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-[#D4AF37]/10 text-[#D4AF37]',
  manager: 'bg-[#7B61FF]/10 text-[#7B61FF]',
  support: 'bg-[#2EC4B6]/10 text-[#2EC4B6]',
  customer: 'bg-[#666]/10 text-[#A0A0A0]',
};
/* gold gradient ref for charts */

/* ===== Sidebar Navigation ===== */
const navGroups = [
  {
    label: 'Main',
    items: [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'analytics', label: 'Analytics', icon: BarChart3 },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { key: 'orders', label: 'Orders', icon: ShoppingBag },
      { key: 'users', label: 'Users', icon: Users },
      { key: 'products', label: 'Products', icon: Package },
      { key: 'inventory', label: 'Inventory', icon: Warehouse },
      { key: 'coupons', label: 'Coupons', icon: Ticket },
    ],
  },
  {
    label: 'Operations',
    items: [
      { key: 'subscriptions', label: 'Subscriptions', icon: Calendar },
      { key: 'shipping', label: 'Shipping', icon: Truck },
      { key: 'payments', label: 'Payments', icon: CreditCard },
    ],
  },
  {
    label: 'Compliance',
    items: [
      { key: 'gst-reports', label: 'GST Reports', icon: FileText },
      { key: 'audit-logs', label: 'Audit Logs', icon: ClipboardList },
    ],
  },
  {
    label: 'System',
    items: [
      { key: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

/* ===== Sortable Table Hook ===== */
function useSort<T>(data: T[], defaultKey?: keyof T) {
  const [sortKey, setSortKey] = useState<keyof T | undefined>(defaultKey);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const toggle = (key: keyof T) => {
    if (sortKey === key) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); }
    else { setSortKey(key); setSortDir('desc'); }
  };
  const sorted = useMemo(() => {
    if (!sortKey) return data;
    const d = [...data];
    d.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      if (typeof av === 'number' && typeof bv === 'number') return sortDir === 'asc' ? av - bv : bv - av;
      return sortDir === 'asc' ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return d;
  }, [data, sortKey, sortDir]);
  return { sorted, toggle, sortKey, sortDir };
}

/* ===== Pagination Hook ===== */
function usePagination<T>(data: T[], defaultSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultSize);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, safePage, pageSize]);
  return { page: safePage, setPage, pageSize, setPageSize, totalPages, paginated, total: data.length };
}

/* ===== Filter Input ===== */
function FilterInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="relative">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
      <Input
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Search...'}
        className="pl-8 h-8 bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white text-[0.8125rem] placeholder:text-[#666] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/20 rounded-none w-[240px]"
      />
    </div>
  );
}

/* ===== CSV Export ===== */
function exportCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const csv = [headers.join(','), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ===== KPI Card ===== */
function KPICard({ label, value, change, changeType, icon: Icon }: { label: string; value: string; change: string; changeType: 'up' | 'down'; icon: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <div className="glass-panel p-5 hover:border-[rgba(212,175,55,0.25)] transition-all duration-300 bg-gradient-to-br from-[rgba(212,175,55,0.03)] to-transparent relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/[0.04] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="relative flex items-center justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37]/15 to-[#D4AF37]/5 flex items-center justify-center border border-[#D4AF37]/20">
          <Icon size={18} className="text-[#D4AF37]" />
        </div>
        <span className={cn('flex items-center gap-1 text-[0.75rem] font-medium', changeType === 'up' ? 'text-[#2EC4B6]' : 'text-[#E63946]')}>;
          {changeType === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {change}
        </span>
      </div>
      <p className="text-data-md font-['Playfair_Display'] text-white text-xl tracking-tight">{value}</p>
      <p className="text-[0.7rem] text-[#666] mt-1 uppercase tracking-wider font-medium">{label}</p>
    </div>
  );
}

/* ===== Recharts Custom Tooltip ===== */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111] border border-[rgba(255,255,255,0.1)] p-3 text-[0.8125rem]">
      <p className="text-[#A0A0A0] mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-white font-mono">{p.name}: {typeof p.value === 'number' && p.value > 999 ? INR(p.value) : p.value}</p>
      ))}
    </div>
  );
}

/* ===== Order Detail Modal ===== */
function OrderDetailModal({ order, open, onClose, onStatusChange }: {
  order: AdminOrder | null; open: boolean; onClose: () => void;
  onStatusChange: (id: string, status: OrderStatus) => void;
}) {
  if (!order) return null;
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  useEffect(() => setNewStatus(order.status), [order.status]);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[700px] bg-[#111] border-[rgba(255,255,255,0.08)] text-white max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-3">
            <span className="text-data-sm font-mono text-[#D4AF37]">{order.id}</span>
            <Badge className={cn('rounded-none text-[0.65rem] uppercase', STATUS_COLORS[order.status] || 'bg-[#666]/10 text-[#666]')}>
              {order.status.replace(/_/g, ' ')}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-[#A0A0A0]">
            Placed on {format(parseISO(order.placedAt), 'dd MMM yyyy, hh:mm a')}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 text-[0.875rem]">
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card p-4">
              <p className="text-label text-[#666] mb-2">Customer</p>
              <p className="text-white font-medium">{order.customer}</p>
              <p className="text-[#A0A0A0]">{order.email}</p>
              <p className="text-[#A0A0A0]">{order.phone}</p>
            </div>
            <div className="glass-card p-4">
              <p className="text-label text-[#666] mb-2">Shipping Address</p>
              <p className="text-white">{order.address}</p>
              <p className="text-[#A0A0A0]">{order.city}, {order.state} - {order.pincode}</p>
            </div>
          </div>
          {order.trackingId && (
            <div className="glass-card p-4">
              <p className="text-label text-[#666] mb-2">Shipping</p>
              <div className="grid grid-cols-3 gap-3">
                <div><span className="text-[#666]">Carrier:</span> <span className="text-white">{order.carrier}</span></div>
                <div><span className="text-[#666]">Tracking:</span> <span className="text-data-sm font-mono text-[#D4AF37]">{order.trackingId}</span></div>
                <div><span className="text-[#666]">ETA:</span> <span className="text-white">{order.placedAt ? format(new Date(new Date(order.placedAt).getTime() + 5 * 86400000), 'dd MMM yyyy') : 'N/A'}</span></div>
              </div>
            </div>
          )}
          <div>
            <p className="text-label text-[#666] mb-2">Items</p>
            <Table>
              <TableHeader>
                <TableRow className="border-b-[rgba(255,255,255,0.06)]">
                  <TableHead className="text-[#A0A0A0] text-[0.75rem]">Product</TableHead>
                  <TableHead className="text-[#A0A0A0] text-[0.75rem] text-right">Qty</TableHead>
                  <TableHead className="text-[#A0A0A0] text-[0.75rem] text-right">Price</TableHead>
                  <TableHead className="text-[#A0A0A0] text-[0.75rem] text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item, i) => (
                  <TableRow key={i} className="border-b-[rgba(255,255,255,0.04)]">
                    <TableCell className="text-white">{item.name}</TableCell>
                    <TableCell className="text-white text-right">{item.qty}</TableCell>
                    <TableCell className="text-white font-mono text-right">{INR(item.price)}</TableCell>
                    <TableCell className="text-[#D4AF37] font-mono text-right">{INR(item.price * item.qty)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="glass-card p-4">
            <div className="space-y-1 text-[0.875rem]">
              <div className="flex justify-between"><span className="text-[#A0A0A0]">Subtotal</span><span className="text-white font-mono">{INR(order.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-[#A0A0A0]">CGST (9%)</span><span className="text-white font-mono">{INR(order.cgst)}</span></div>
              <div className="flex justify-between"><span className="text-[#A0A0A0]">SGST (9%)</span><span className="text-white font-mono">{INR(order.sgst)}</span></div>
              {order.igst > 0 && <div className="flex justify-between"><span className="text-[#A0A0A0]">IGST (18%)</span><span className="text-white font-mono">{INR(order.igst)}</span></div>}
              <div className="flex justify-between"><span className="text-[#A0A0A0]">Shipping</span><span className="text-white font-mono">{order.shipping === 0 ? 'Free' : INR(order.shipping)}</span></div>
              {order.discount > 0 && <div className="flex justify-between"><span className="text-[#2EC4B6]">Discount</span><span className="text-[#2EC4B6] font-mono">-{INR(order.discount)}</span></div>}
              <div className="border-t border-[rgba(255,255,255,0.1)] pt-2 flex justify-between font-semibold">
                <span className="text-white">Grand Total</span><span className="text-[#D4AF37] font-mono">{INR(order.grandTotal)}</span>
              </div>
            </div>
          </div>
          <div className="glass-card p-4">
            <p className="text-label text-[#666] mb-2">Payment</p>
            <div className="grid grid-cols-3 gap-3 text-[0.875rem]">
              <div><span className="text-[#666]">Method:</span> <span className="text-white">{order.paymentMethod}</span></div>
              <div><span className="text-[#666]">Status:</span> <Badge className={cn('rounded-none text-[0.6rem]', STATUS_COLORS[order.paymentStatus] || '')}>{order.paymentStatus}</Badge></div>
              <div><span className="text-[#666]">Razorpay ID:</span> <span className="text-data-sm font-mono text-[#D4AF37]">{order.razorpayId}</span></div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
              <SelectTrigger className="w-[180px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-8 text-[0.8125rem] rounded-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">
                {(['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'] as OrderStatus[]).map(s => (
                  <SelectItem key={s} value={s} className="text-[0.8125rem] focus:bg-[rgba(212,175,55,0.1)] focus:text-white">{s.replace(/_/g, ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => onStatusChange(order.id, newStatus)}
              className="btn-primary h-8 px-4 text-[0.75rem]"
            >Update Status</Button>
            <Button variant="ghost" className="h-8 text-[0.75rem] text-[#A0A0A0] hover:text-white" onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


/* ===== User Detail Modal ===== */
function UserDetailModal({ user, open, onClose, onRoleChange, onStatusChange }: {
  user: AdminUser | null; open: boolean; onClose: () => void;
  onRoleChange: (id: string, role: string) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  if (!user) return null;
  const userOrders = adminOrders.filter(o => o.customer === user.name).slice(0, 5);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[600px] bg-[#111] border-[rgba(255,255,255,0.08)] text-white max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-3">
            <div className="w-9 h-9 bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[#D4AF37] font-medium text-[0.875rem]">
              {user.name.split(' ').map(n => n[0]).join('')}
            </div>
            <span>{user.name}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-[0.875rem]">
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-3"><span className="text-[#666]">Email:</span> <span className="text-white font-mono text-[0.8125rem]">{user.email}</span></div>
            <div className="glass-card p-3"><span className="text-[#666]">Phone:</span> <span className="text-white">{user.phone}</span></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[#666]">Role:</span>
              <Select value={user.role} onValueChange={(v) => onRoleChange(user.id, v)}>
                <SelectTrigger className="w-[140px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-7 text-[0.75rem] rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">
                  {['customer', 'admin', 'manager', 'support'].map(r => (
                    <SelectItem key={r} value={r} className="text-[0.75rem] capitalize">{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#666]">Status:</span>
              <Select value={user.status} onValueChange={(v) => onStatusChange(user.id, v)}>
                <SelectTrigger className="w-[140px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-7 text-[0.75rem] rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">
                  {['active', 'inactive', 'suspended'].map(s => (
                    <SelectItem key={s} value={s} className="text-[0.75rem] capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="glass-card p-4">
            <p className="text-label text-[#666] mb-2">Stats</p>
            <div className="grid grid-cols-3 gap-4">
              <div><p className="text-data-sm font-mono text-white">{user.orders}</p><p className="text-[0.7rem] text-[#666]">Orders</p></div>
              <div><p className="text-data-sm font-mono text-[#D4AF37]">{INR(user.totalSpent)}</p><p className="text-[0.7rem] text-[#666]">Total Spent</p></div>
              <div><p className="text-data-sm font-mono text-white">{format(parseISO(user.joined), 'MMM yyyy')}</p><p className="text-[0.7rem] text-[#666]">Joined</p></div>
            </div>
          </div>
          {userOrders.length > 0 && (
            <div>
              <p className="text-label text-[#666] mb-2">Recent Orders</p>
              <div className="space-y-2">
                {userOrders.map(o => (
                  <div key={o.id} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                    <span className="text-data-sm font-mono text-[#D4AF37]">{o.id}</span>
                    <span className="text-[0.75rem] text-[#A0A0A0]">{format(parseISO(o.placedAt), 'dd MMM yyyy')}</span>
                    <span className="text-[0.8125rem] text-white font-mono">{INR(o.grandTotal)}</span>
                    <Badge className={cn('rounded-none text-[0.6rem]', STATUS_COLORS[o.status])}>{o.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" className="h-8 text-[0.75rem] text-[#A0A0A0] hover:text-white" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ===== Product Form Modal ===== */
function ProductFormModal({ product, open, onClose, onSave }: {
  product: AdminProduct | null; open: boolean; onClose: () => void;
  onSave: (p: Partial<AdminProduct>) => void;
}) {
  const isEdit = !!product;
  const [form, setForm] = useState({ name: '', sku: '', category: '', price: 0, stock: 0, reorderLevel: 0, status: 'active' as ProductStatus });
  useEffect(() => {
    if (product) setForm({ name: product.name, sku: product.sku, category: product.category, price: product.price, stock: product.stock, reorderLevel: product.reorderLevel, status: product.status });
    else setForm({ name: '', sku: '', category: 'Purifiers', price: 0, stock: 0, reorderLevel: 5, status: 'active' });
  }, [product]);
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] bg-[#111] border-[rgba(255,255,255,0.08)] text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">{isEdit ? 'Edit Product' : 'Add Product'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-[0.875rem]">
          <div><Label className="text-[0.75rem] text-[#A0A0A0]">Product Name *</Label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-[0.75rem] text-[#A0A0A0]">SKU *</Label><Input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1" /></div>
            <div><Label className="text-[0.75rem] text-[#A0A0A0]">Category</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">
                  {['Purifiers', 'Filters', 'Membranes', 'Accessories', 'Kits', 'Services'].map(c => <SelectItem key={c} value={c} className="text-[0.75rem]">{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-[0.75rem] text-[#A0A0A0]">Price (\u20B9) *</Label><Input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1" /></div>
            <div><Label className="text-[0.75rem] text-[#A0A0A0]">Stock *</Label><Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1" /></div>
            <div><Label className="text-[0.75rem] text-[#A0A0A0]">Reorder Level</Label><Input type="number" value={form.reorderLevel} onChange={e => setForm(f => ({ ...f, reorderLevel: Number(e.target.value) }))} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1" /></div>
          </div>
          <div><Label className="text-[0.75rem] text-[#A0A0A0]">Status</Label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as ProductStatus }))}>
              <SelectTrigger className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1 w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">
                {['active', 'inactive', 'draft'].map(s => <SelectItem key={s} value={s} className="text-[0.75rem] capitalize">{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" className="h-8 text-[0.75rem] text-[#A0A0A0] hover:text-white" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)} className="btn-primary h-8 px-5 text-[0.75rem]">{isEdit ? 'Save Changes' : 'Create Product'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ===== Coupon Form Modal ===== */
function CouponFormModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (c: any) => void }) {
  const [form, setForm] = useState({ code: '', description: '', type: 'percentage' as CouponType, value: 0, minOrder: 0, usageLimit: 100, validFrom: '', validUntil: '', firstOrderOnly: false });
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[500px] bg-[#111] border-[rgba(255,255,255,0.08)] text-white max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="text-lg font-semibold">Create Coupon</DialogTitle></DialogHeader>
        <div className="space-y-3 text-[0.875rem]">
          <div><Label className="text-[0.75rem] text-[#A0A0A0]">Code *</Label><Input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1 font-mono" /></div>
          <div><Label className="text-[0.75rem] text-[#A0A0A0]">Description</Label><Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none mt-1 min-h-[60px]" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-[0.75rem] text-[#A0A0A0]">Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as CouponType }))}>
                <SelectTrigger className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">
                  {['percentage', 'fixed', 'free_shipping'].map(t => <SelectItem key={t} value={t} className="text-[0.75rem] capitalize">{t.replace('_', ' ')}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-[0.75rem] text-[#A0A0A0]">Value {form.type === 'percentage' ? '(%)' : form.type === 'fixed' ? '(\u20B9)' : ''}</Label><Input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: Number(e.target.value) }))} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1" disabled={form.type === 'free_shipping'} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-[0.75rem] text-[#A0A0A0]">Min Order (\u20B9)</Label><Input type="number" value={form.minOrder} onChange={e => setForm(f => ({ ...f, minOrder: Number(e.target.value) }))} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1" /></div>
            <div><Label className="text-[0.75rem] text-[#A0A0A0]">Usage Limit</Label><Input type="number" value={form.usageLimit} onChange={e => setForm(f => ({ ...f, usageLimit: Number(e.target.value) }))} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-[0.75rem] text-[#A0A0A0]">Valid From</Label><Input type="date" value={form.validFrom} onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1" /></div>
            <div><Label className="text-[0.75rem] text-[#A0A0A0]">Valid Until</Label><Input type="date" value={form.validUntil} onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1" /></div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Switch checked={form.firstOrderOnly} onCheckedChange={v => setForm(f => ({ ...f, firstOrderOnly: v }))} className="data-[state=checked]:bg-[#D4AF37]" />
            <Label className="text-[0.75rem] text-[#A0A0A0]">First Order Only</Label>
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" className="h-8 text-[0.75rem] text-[#A0A0A0] hover:text-white" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSave(form)} className="btn-primary h-8 px-5 text-[0.75rem]">Create Coupon</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ===== Refund Modal ===== */
function RefundModal({ txn, open, onClose, onRefund }: {
  txn: Transaction | null; open: boolean; onClose: () => void; onRefund: (id: string, amount: number) => void;
}) {
  const [amount, setAmount] = useState(0);
  useEffect(() => { if (txn) setAmount(txn.amount); }, [txn]);
  if (!txn) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px] bg-[#111] border-[rgba(255,255,255,0.08)] text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Process Refund</DialogTitle>
          <DialogDescription className="text-[#A0A0A0]">Order: {txn.orderId} | Razorpay: {txn.razorpayId}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-[0.875rem]">
          <div className="glass-card p-3 flex justify-between"><span className="text-[#666]">Original Amount:</span><span className="text-white font-mono">{INR(txn.amount)}</span></div>
          <div><Label className="text-[0.75rem] text-[#A0A0A0]">Refund Amount (\u20B9)</Label><Input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1" max={txn.amount} /></div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" className="h-8 text-[0.75rem] text-[#A0A0A0] hover:text-white" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onRefund(txn.id, amount)} className="bg-[#E63946] hover:bg-[#c4303a] text-white h-8 px-5 text-[0.75rem]">Process Refund</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


/* ===== MODULE 1: Dashboard ===== */
function DashboardModule({ onNav }: { onNav: (k: string) => void }) {
  const totalRevenue = adminOrders.reduce((s, o) => s + (o.status !== 'cancelled' ? o.grandTotal : 0), 0);
  const totalOrders = adminOrders.length;
  const activeUsers = adminUsers.filter(u => u.status === 'active').length;
  const avgOrder = Math.round(totalRevenue / totalOrders);
  const lowStockItems = adminProducts.filter(p => p.stock <= p.reorderLevel);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Revenue" value={INR(totalRevenue)} change="12.5%" changeType="up" icon={IndianRupee} />
        <KPICard label="Total Orders" value={String(totalOrders)} change="8.2%" changeType="up" icon={ShoppingBag} />
        <KPICard label="Active Users" value={String(activeUsers)} change="15.1%" changeType="up" icon={Users} />
        <KPICard label="Avg. Order Value" value={INR(avgOrder)} change="3.4%" changeType="up" icon={BarChart3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 glass-panel p-5">
          <h3 className="text-label text-white mb-4 font-['Playfair_Display'] text-sm tracking-wide">Revenue Trend (30 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs><linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/><stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tickFormatter={v => format(parseISO(v), 'dd MMM')} stroke="#666" tick={{ fontSize: 11 }} />
              <YAxis stroke="#666" tick={{ fontSize: 11 }} tickFormatter={v => v >= 1000 ? `\u20B9${v / 1000}k` : `\u20B9${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fill="url(#goldGradient)" name="Revenue" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Distribution */}
        <div className="glass-panel p-5">
          <h3 className="text-label text-white mb-4 font-['Playfair_Display'] text-sm tracking-wide">Order Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={ordersByStatus} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, count }) => `${name}: ${count}`} labelLine={false}>
                {ordersByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-label text-white font-['Playfair_Display'] text-sm tracking-wide">Recent Orders</h3>
            <button onClick={() => onNav('orders')} className="text-[0.75rem] text-[#D4AF37] hover:underline">View All</button>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-b-[rgba(255,255,255,0.06)]">
                <TableHead className="text-[#A0A0A0] text-[0.7rem]">Order ID</TableHead>
                <TableHead className="text-[#A0A0A0] text-[0.7rem]">Customer</TableHead>
                <TableHead className="text-[#A0A0A0] text-[0.7rem]">Amount</TableHead>
                <TableHead className="text-[#A0A0A0] text-[0.7rem]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminOrders.slice(0, 5).map(o => (
                <TableRow key={o.id} className="border-b-[rgba(255,255,255,0.04)]">
                  <TableCell className="text-data-sm font-mono text-[#D4AF37] text-[0.75rem]">{o.id}</TableCell>
                  <TableCell className="text-white text-[0.75rem]">{o.customer}</TableCell>
                  <TableCell className="text-white font-mono text-[0.75rem]">{INR(o.grandTotal)}</TableCell>
                  <TableCell><Badge className={cn('rounded-none text-[0.6rem]', STATUS_COLORS[o.status])}>{o.status.replace(/_/g, ' ')}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-label text-white font-['Playfair_Display'] text-sm tracking-wide">Low Stock Alerts</h3>
            <AlertTriangle size={16} className="text-[#E63946]" />
          </div>
          {lowStockItems.length === 0 ? (
            <p className="text-[#A0A0A0] text-[0.875rem]">All products well stocked</p>
          ) : (
            <div className="space-y-3">
              {lowStockItems.map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                  <div>
                    <p className="text-[0.8125rem] text-white">{p.name}</p>
                    <p className="text-[0.7rem] text-[#666]">SKU: {p.sku}</p>
                  </div>
                  <div className="text-right">
                    <p className={cn('text-data-sm font-mono', p.stock <= 3 ? 'text-[#E63946]' : 'text-[#E8A838]')}>{p.stock} left</p>
                    <p className="text-[0.65rem] text-[#666]">Reorder: {p.reorderLevel}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="glass-panel p-5">
        <h3 className="text-label text-white mb-4 font-['Playfair_Display'] text-sm tracking-wide">Top Products by Sales</h3>
        <div className="space-y-3">
          {topProducts.map((p, i) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-[0.75rem] text-[#666] w-5">#{i + 1}</span>
                <span className="text-[0.8125rem] text-white">{p.name}</span>
                <Badge className="bg-[rgba(255,255,255,0.06)] text-[#A0A0A0] rounded-none text-[0.6rem]">{p.category}</Badge>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[0.75rem] text-[#A0A0A0]">{p.salesCount} sold</span>
                <span className="text-data-sm font-mono text-[#D4AF37] text-[0.8125rem]">{INR(p.revenue)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ===== MODULE 2: Analytics ===== */
function AnalyticsModule() {
  const [range, setRange] = useState<'7' | '30' | '90' | '365'>('30');
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {(['7', '30', '90', '365'] as const).map(r => (
            <Button key={r} variant={range === r ? 'default' : 'ghost'} onClick={() => setRange(r)} className={cn('h-7 px-3 text-[0.75rem] rounded-none', range === r ? 'bg-[#D4AF37] text-[#0A0A0A] hover:bg-[#AA8C2C]' : 'text-[#A0A0A0] hover:text-white')}>
              Last {r} Days
            </Button>
          ))}
        </div>
        <Button variant="ghost" className="h-7 text-[0.75rem] text-[#A0A0A0] hover:text-white" onClick={() => exportCSV('analytics.csv', ['Metric', 'Value'], [['Total Revenue', INR(2458390)], ['Total Orders', '186'], ['Active Users', '1247'], ['Avg Order Value', INR(13217)]])}>
          <Download size={14} className="mr-1" />Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-5">
          <h3 className="text-label text-white mb-4 font-['Playfair_Display'] text-sm tracking-wide">Sales Trend (6 Months)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={salesTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" stroke="#666" tick={{ fontSize: 11 }} />
              <YAxis stroke="#666" tick={{ fontSize: 11 }} tickFormatter={v => v >= 100000 ? `\u20B9${(v / 100000).toFixed(1)}L` : `\u20B9${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} dot={{ fill: '#D4AF37', r: 3 }} name="Revenue" />
              <Line type="monotone" dataKey="orders" stroke="#2EC4B6" strokeWidth={2} dot={{ fill: '#2EC4B6', r: 3 }} name="Orders" yAxisId={1} />
              <YAxis yAxisId={1} orientation="right" stroke="#666" tick={{ fontSize: 11 }} />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-5">
          <h3 className="text-label text-white mb-4 font-['Playfair_Display'] text-sm tracking-wide">Revenue by Category</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={revenueByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {revenueByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-5">
          <h3 className="text-label text-white mb-4 font-['Playfair_Display'] text-sm tracking-wide">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ordersByStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" stroke="#666" tick={{ fontSize: 11 }} />
              <YAxis stroke="#666" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-panel p-5">
          <h3 className="text-label text-white mb-4 font-['Playfair_Display'] text-sm tracking-wide">User Acquisition</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={userAcquisitionData}>
              <defs><linearGradient id="acqNew" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/><stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/></linearGradient>
              <linearGradient id="acqRet" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2EC4B6" stopOpacity={0.3}/><stop offset="95%" stopColor="#2EC4B6" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" stroke="#666" tick={{ fontSize: 11 }} />
              <YAxis stroke="#666" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="newUsers" stroke="#D4AF37" strokeWidth={2} fill="url(#acqNew)" name="New Users" />
              <Area type="monotone" dataKey="returning" stroke="#2EC4B6" strokeWidth={2} fill="url(#acqRet)" name="Returning" />
              <Legend wrapperStyle={{ fontSize: '11px' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ===== MODULE 3: Orders ===== */
function OrdersModule() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [detailOrder, setDetailOrder] = useState<AdminOrder | null>(null);
  const [orders, setOrders] = useState(adminOrders);

  const filtered = useMemo(() => orders.filter(o => {
    const q = search.toLowerCase();
    const match = !q || o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q) || o.phone.includes(q);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return match && matchStatus;
  }), [orders, search, statusFilter]);

  const { sorted, toggle, sortKey, sortDir: _sortDir } = useSort(filtered, 'placedAt');
  const { paginated, page, setPage, pageSize, setPageSize, totalPages, total } = usePagination(sorted, 10);

  const toggleRow = (id: string) => {
    setSelectedRows(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleAll = () => {
    setSelectedRows(prev => prev.size === paginated.length ? new Set() : new Set(paginated.map(p => p.id)));
  };
  const handleStatusChange = (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setDetailOrder(null);
  };

  const SortTH = ({ label, field }: { label: string; field: keyof AdminOrder }) => (
    <TableHead className="text-[#666] text-[0.7rem] cursor-pointer select-none hover:text-white uppercase tracking-wider font-medium px-4 py-3" onClick={() => toggle(field)}>
      <span className="flex items-center gap-1">{label} <ArrowUpDown size={10} className={sortKey === field ? 'text-[#D4AF37]' : 'text-[#444]'} /></span>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <FilterInput value={search} onChange={setSearch} placeholder="Search orders, customers..." />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-8 text-[0.75rem] rounded-none">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">
              <SelectItem value="all" className="text-[0.75rem]">All Status</SelectItem>
              {['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map(s => (
                <SelectItem key={s} value={s} className="text-[0.75rem] capitalize">{s.replace(/_/g, ' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {selectedRows.size > 0 && (
            <span className="text-[0.75rem] text-[#D4AF37]">{selectedRows.size} selected</span>
          )}
          <Button variant="ghost" className="h-7 text-[0.75rem] text-[#A0A0A0] hover:text-white" onClick={() => exportCSV('orders.csv', ['Order ID', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Payment', 'City'], paginated.map(o => [o.id, o.customer, format(parseISO(o.placedAt), 'dd MMM yyyy'), o.items.length, o.grandTotal, o.status, o.paymentMethod, o.city]))}>
            <Download size={14} className="mr-1" />Export
          </Button>
        </div>
      </div>

      <div className="glass-panel overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#111] border-b border-[#D4AF37]/30">
              <TableHead className="w-8 px-4 py-3"><input type="checkbox" checked={paginated.length > 0 && selectedRows.size === paginated.length} onChange={toggleAll} className="accent-[#D4AF37]" /></TableHead>
              <SortTH label="Order ID" field="id" />
              <SortTH label="Customer" field="customer" />
              <SortTH label="Date" field="placedAt" />
              <TableHead className="text-[#666] text-[0.7rem] uppercase tracking-wider font-medium px-4 py-3">Items</TableHead>
              <SortTH label="Total" field="grandTotal" />
              <TableHead className="text-[#666] text-[0.7rem] uppercase tracking-wider font-medium px-4 py-3">Status</TableHead>
              <TableHead className="text-[#666] text-[0.7rem] uppercase tracking-wider font-medium px-4 py-3">Payment</TableHead>
              <TableHead className="text-[#666] text-[0.7rem] uppercase tracking-wider font-medium px-4 py-3">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(o => (
              <TableRow key={o.id} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                <TableCell className="px-4 py-3"><input type="checkbox" checked={selectedRows.has(o.id)} onChange={() => toggleRow(o.id)} className="accent-[#D4AF37]" /></TableCell>
                <TableCell className="text-data-sm font-mono text-[#D4AF37] text-[0.75rem] cursor-pointer px-4 py-3" onClick={() => setDetailOrder(o)}>{o.id}</TableCell>
                <TableCell className="px-4 py-3">
                  <div>
                    <p className="text-[0.8125rem] text-white">{o.customer}</p>
                    <p className="text-[0.7rem] text-[#666]">{o.phone}</p>
                  </div>
                </TableCell>
                <TableCell className="text-[0.75rem] text-[#666] px-4 py-3">{format(parseISO(o.placedAt), 'dd MMM yyyy')}</TableCell>
                <TableCell className="text-[0.75rem] text-[#666] px-4 py-3">{o.items.length} item(s)</TableCell>
                <TableCell className="text-[0.8125rem] text-white font-mono px-4 py-3">{INR(o.grandTotal)}</TableCell>
                <TableCell className="px-4 py-3"><Badge className={cn('rounded-none text-[0.6rem]', STATUS_COLORS[o.status])}>{o.status.replace(/_/g, ' ')}</Badge></TableCell>
                <TableCell className="px-4 py-3"><span className="text-[0.7rem] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[#A0A0A0]">{o.paymentMethod}</span></TableCell>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setDetailOrder(o)} className="p-1 text-[#666] hover:text-[#D4AF37] transition-colors"><Eye size={14} /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[0.75rem] text-[#666]">Show</span>
          <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-[60px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-7 text-[0.75rem] rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">
              {[10, 25, 50].map(s => <SelectItem key={s} value={String(s)} className="text-[0.75rem]">{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <span className="text-[0.75rem] text-[#666]">of {total} records</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" className="h-7 w-7 p-0 text-[#A0A0A0] hover:text-white" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></Button>
          <span className="text-[0.75rem] text-[#A0A0A0] px-2">{page} / {totalPages}</span>
          <Button variant="ghost" className="h-7 w-7 p-0 text-[#A0A0A0] hover:text-white" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></Button>
        </div>
      </div>

      <OrderDetailModal order={detailOrder} open={!!detailOrder} onClose={() => setDetailOrder(null)} onStatusChange={handleStatusChange} />
    </div>
  );
}


/* ===== MODULE 4: Users ===== */
function UsersModule() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const [users, setUsers] = useState(adminUsers);

  const filtered = useMemo(() => users.filter(u => {
    const q = search.toLowerCase();
    const match = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.phone.includes(q);
    return match && (roleFilter === 'all' || u.role === roleFilter) && (statusFilter === 'all' || u.status === statusFilter);
  }), [users, search, roleFilter, statusFilter]);
  const { sorted, toggle, sortKey, sortDir: _sortDir } = useSort(filtered, 'joined');
  const { paginated, page, setPage, pageSize, setPageSize, totalPages, total } = usePagination(sorted, 10);

  const handleRoleChange = (id: string, role: string) => setUsers(prev => prev.map(u => u.id === id ? { ...u, role: role as AdminUser['role'] } : u));
  const handleStatusChange = (id: string, status: string) => setUsers(prev => prev.map(u => u.id === id ? { ...u, status: status as AdminUser['status'] } : u));
  const SortTH = ({ label, field }: { label: string; field: keyof AdminUser }) => (
    <TableHead className="text-[#A0A0A0] text-[0.7rem] cursor-pointer select-none hover:text-white" onClick={() => toggle(field)}>
      <span className="flex items-center gap-1">{label} <ArrowUpDown size={10} className={sortKey === field ? 'text-[#D4AF37]' : 'text-[#666]'} /></span>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <FilterInput value={search} onChange={setSearch} placeholder="Search users..." />
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[130px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-8 text-[0.75rem] rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">
              <SelectItem value="all" className="text-[0.75rem]">All Roles</SelectItem>
              {['customer', 'admin', 'manager', 'support'].map(r => <SelectItem key={r} value={r} className="text-[0.75rem] capitalize">{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-8 text-[0.75rem] rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">
              <SelectItem value="all" className="text-[0.75rem]">All Status</SelectItem>
              {['active', 'inactive', 'suspended'].map(s => <SelectItem key={s} value={s} className="text-[0.75rem] capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" className="h-7 text-[0.75rem] text-[#A0A0A0] hover:text-white" onClick={() => exportCSV('users.csv', ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Orders', 'Total Spent'], paginated.map(u => [u.id, u.name, u.email, u.phone, u.role, u.status, u.orders, u.totalSpent]))}>
          <Download size={14} className="mr-1" />Export
        </Button>
      </div>
      <div className="glass-panel overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b-[rgba(255,255,255,0.06)]">
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Avatar</TableHead>
              <SortTH label="Name" field="name" />
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Email</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Phone</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Role</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Status</TableHead>
              <SortTH label="Orders" field="orders" />
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Joined</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(u => (
              <TableRow key={u.id} className="border-b-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]">
                <TableCell><div className="w-8 h-8 bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[#D4AF37] font-medium text-[0.7rem]">{u.name.split(' ').map(n => n[0]).join('')}</div></TableCell>
                <TableCell className="text-[0.8125rem] text-white font-medium">{u.name}</TableCell>
                <TableCell className="text-data-sm font-mono text-[#A0A0A0] text-[0.7rem]">{u.email}</TableCell>
                <TableCell className="text-[0.75rem] text-[#A0A0A0]">{u.phone}</TableCell>
                <TableCell><Badge className={cn('rounded-none text-[0.6rem] capitalize', ROLE_COLORS[u.role])}>{u.role}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <span className={cn('w-1.5 h-1.5 rounded-full', u.status === 'active' ? 'bg-[#2EC4B6]' : u.status === 'inactive' ? 'bg-[#666]' : 'bg-[#E63946]')} />
                    <span className="text-[0.75rem] text-[#A0A0A0] capitalize">{u.status}</span>
                  </div>
                </TableCell>
                <TableCell className="text-[0.8125rem] text-white font-mono">{u.orders}</TableCell>
                <TableCell className="text-[0.75rem] text-[#A0A0A0]">{format(parseISO(u.joined), 'MMM yyyy')}</TableCell>
                <TableCell><button onClick={() => setDetailUser(u)} className="p-1 text-[#666] hover:text-[#D4AF37]"><Eye size={14} /></button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-[60px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-7 text-[0.75rem] rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">{[10, 25, 50].map(s => <SelectItem key={s} value={String(s)} className="text-[0.75rem]">{s}</SelectItem>)}</SelectContent>
          </Select>
          <span className="text-[0.75rem] text-[#666]">of {total} records</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" className="h-7 w-7 p-0 text-[#A0A0A0] hover:text-white" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></Button>
          <span className="text-[0.75rem] text-[#A0A0A0] px-2">{page} / {totalPages}</span>
          <Button variant="ghost" className="h-7 w-7 p-0 text-[#A0A0A0] hover:text-white" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></Button>
        </div>
      </div>
      <UserDetailModal user={detailUser} open={!!detailUser} onClose={() => setDetailUser(null)} onRoleChange={handleRoleChange} onStatusChange={handleStatusChange} />
    </div>
  );
}

/* ===== MODULE 5: Products ===== */
function ProductsModule() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [products, setProducts] = useState(adminProducts);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => products.filter(p => {
    const q = search.toLowerCase();
    return (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)) && (catFilter === 'all' || p.category === catFilter);
  }), [products, search, catFilter]);
  const { sorted, toggle, sortKey, sortDir: _sortDir } = useSort(filtered, 'sales');
  const { paginated, page, setPage, pageSize, setPageSize, totalPages, total } = usePagination(sorted, 10);

  const handleSave = (form: Partial<AdminProduct>) => {
    if (editProduct) {
      setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...form } : p));
    } else {
      const newProd: AdminProduct = {
        id: `PRD-${String(products.length + 1).padStart(4, '0')}`,
        name: form.name || 'New Product', sku: form.sku || '', category: form.category || 'Purifiers',
        price: form.price || 0, costPrice: 0, stock: form.stock || 0, reorderLevel: form.reorderLevel || 5,
        status: (form.status as ProductStatus) || 'active', sales: 0, image: '/filter-cartridge.png',
      };
      setProducts(prev => [...prev, newProd]);
    }
    setEditProduct(null); setFormOpen(false);
  };
  const handleDelete = (id: string) => { if (confirm('Delete this product?')) setProducts(prev => prev.filter(p => p.id !== id)); };
  const SortTH = ({ label, field }: { label: string; field: keyof AdminProduct }) => (
    <TableHead className="text-[#A0A0A0] text-[0.7rem] cursor-pointer select-none hover:text-white" onClick={() => toggle(field)}>
      <span className="flex items-center gap-1">{label} <ArrowUpDown size={10} className={sortKey === field ? 'text-[#D4AF37]' : 'text-[#666]'} /></span>
    </TableHead>
  );
  const cats = Array.from(new Set(adminProducts.map(p => p.category)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <FilterInput value={search} onChange={setSearch} placeholder="Search products..." />
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-[140px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-8 text-[0.75rem] rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">
              <SelectItem value="all" className="text-[0.75rem]">All Categories</SelectItem>
              {cats.map(c => <SelectItem key={c} value={c} className="text-[0.75rem]">{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="h-7 text-[0.75rem] text-[#A0A0A0] hover:text-white" onClick={() => exportCSV('products.csv', ['ID', 'Name', 'SKU', 'Category', 'Price', 'Stock', 'Status'], paginated.map(p => [p.id, p.name, p.sku, p.category, p.price, p.stock, p.status]))}>
            <Download size={14} className="mr-1" />Export
          </Button>
          <Button onClick={() => { setEditProduct(null); setFormOpen(true); }} className="btn-primary h-7 px-3 text-[0.75rem]"><Plus size={14} className="mr-1" />Add Product</Button>
        </div>
      </div>
      <div className="glass-panel overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b-[rgba(255,255,255,0.06)]">
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Image</TableHead>
              <SortTH label="Name" field="name" />
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">SKU</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Category</TableHead>
              <SortTH label="Price" field="price" />
              <SortTH label="Stock" field="stock" />
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Status</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(p => (
              <TableRow key={p.id} className="border-b-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]">
                <TableCell><div className="w-9 h-9 bg-[#1A1A1A] flex items-center justify-center"><Package size={16} className="text-[#666]" /></div></TableCell>
                <TableCell className="text-[0.8125rem] text-white font-medium">{p.name}</TableCell>
                <TableCell className="text-data-sm font-mono text-[#A0A0A0] text-[0.7rem]">{p.sku}</TableCell>
                <TableCell><Badge className="bg-[rgba(255,255,255,0.06)] text-[#A0A0A0] rounded-none text-[0.6rem]">{p.category}</Badge></TableCell>
                <TableCell className="text-[0.8125rem] text-[#D4AF37] font-mono">{INR(p.price)}</TableCell>
                <TableCell>
                  <span className={cn('text-data-sm font-mono', p.stock <= p.reorderLevel ? 'text-[#E63946]' : p.stock <= p.reorderLevel + 5 ? 'text-[#E8A838]' : 'text-[#2EC4B6]')}>{p.stock}</span>
                </TableCell>
                <TableCell>
                  <Switch checked={p.status === 'active'} onCheckedChange={() => setProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: x.status === 'active' ? 'inactive' as const : 'active' as const } : x))} className="data-[state=checked]:bg-[#D4AF37]" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditProduct(p); setFormOpen(true); }} className="p-1 text-[#666] hover:text-[#D4AF37]"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1 text-[#666] hover:text-[#E63946]"><Trash2 size={14} /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-[60px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-7 text-[0.75rem] rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">{[10, 25, 50].map(s => <SelectItem key={s} value={String(s)} className="text-[0.75rem]">{s}</SelectItem>)}</SelectContent>
          </Select>
          <span className="text-[0.75rem] text-[#666]">of {total} records</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" className="h-7 w-7 p-0 text-[#A0A0A0] hover:text-white" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></Button>
          <span className="text-[0.75rem] text-[#A0A0A0] px-2">{page} / {totalPages}</span>
          <Button variant="ghost" className="h-7 w-7 p-0 text-[#A0A0A0] hover:text-white" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></Button>
        </div>
      </div>
      <ProductFormModal product={editProduct} open={formOpen} onClose={() => setFormOpen(false)} onSave={handleSave} />
    </div>
  );
}


/* ===== MODULE 6: Inventory ===== */
function InventoryModule() {
  const [inv, setInv] = useState(inventory);
  const [search, setSearch] = useState('');
  const [adjItem, setAdjItem] = useState<InventoryItem | null>(null);
  const [adjQty, setAdjQty] = useState(0);
  const [adjReason, setAdjReason] = useState('Received');

  const filtered = useMemo(() => inv.filter(i => !search || i.productName.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase())), [inv, search]);
  const { sorted, toggle, sortKey, sortDir: _sortDir } = useSort(filtered, 'currentStock');
  const { paginated, page, setPage, pageSize, setPageSize, totalPages, total } = usePagination(sorted, 10);

  const lowStock = inv.filter(i => i.currentStock <= i.reorderLevel);
  const handleAdjust = () => {
    if (!adjItem) return;
    setInv(prev => prev.map(i => i.id === adjItem.id ? { ...i, currentStock: Math.max(0, i.currentStock + adjQty), lastUpdated: new Date().toISOString() } : i));
    setAdjItem(null); setAdjQty(0);
  };
  const SortTH = ({ label, field }: { label: string; field: keyof InventoryItem }) => (
    <TableHead className="text-[#A0A0A0] text-[0.7rem] cursor-pointer select-none hover:text-white" onClick={() => toggle(field)}>
      <span className="flex items-center gap-1">{label} <ArrowUpDown size={10} className={sortKey === field ? 'text-[#D4AF37]' : 'text-[#666]'} /></span>
    </TableHead>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 text-center"><p className="text-data-md font-mono text-white">{inv.length}</p><p className="text-[0.7rem] text-[#A0A0A0] mt-1">Total SKUs</p></div>
        <div className="glass-panel p-4 text-center"><p className="text-data-md font-mono text-[#2EC4B6]">{inv.filter(i => i.currentStock > i.reorderLevel).length}</p><p className="text-[0.7rem] text-[#A0A0A0] mt-1">In Stock</p></div>
        <div className="glass-panel p-4 text-center"><p className="text-data-md font-mono text-[#E8A838]">{lowStock.length}</p><p className="text-[0.7rem] text-[#A0A0A0] mt-1">Low Stock</p></div>
        <div className="glass-panel p-4 text-center"><p className="text-data-md font-mono text-[#E63946]">{inv.filter(i => i.currentStock === 0).length}</p><p className="text-[0.7rem] text-[#A0A0A0] mt-1">Out of Stock</p></div>
      </div>

      {lowStock.length > 0 && (
        <div className="glass-panel p-4 border-l-2 border-l-[#E8A838]">
          <h3 className="text-label text-[#E8A838] mb-3 flex items-center gap-2"><AlertTriangle size={14} />Low Stock Alerts</h3>
          <div className="space-y-2">
            {lowStock.slice(0, 5).map(item => (
              <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                <span className="text-[0.8125rem] text-white">{item.productName} <span className="text-[0.7rem] text-[#666]">({item.sku})</span></span>
                <span className="text-[0.75rem] font-mono text-[#E63946]">{item.currentStock} / {item.reorderLevel}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <FilterInput value={search} onChange={setSearch} placeholder="Search inventory..." />
        <Button variant="ghost" className="h-7 text-[0.75rem] text-[#A0A0A0] hover:text-white" onClick={() => exportCSV('inventory.csv', ['SKU', 'Product', 'Stock', 'Reorder', 'Status'], paginated.map(i => [i.sku, i.productName, i.currentStock, i.reorderLevel, i.currentStock === 0 ? 'Out of Stock' : i.currentStock <= i.reorderLevel ? 'Low' : 'OK']))}>
          <Download size={14} className="mr-1" />Export
        </Button>
      </div>

      <div className="glass-panel overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b-[rgba(255,255,255,0.06)]">
              <SortTH label="SKU" field="sku" />
              <SortTH label="Product" field="productName" />
              <SortTH label="Stock" field="currentStock" />
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Reorder Level</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Status</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Last Updated</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(item => {
              const status = item.currentStock === 0 ? 'out' : item.currentStock <= item.reorderLevel ? 'low' : 'ok';
              return (
                <TableRow key={item.id} className="border-b-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]">
                  <TableCell className="text-data-sm font-mono text-[#A0A0A0] text-[0.75rem]">{item.sku}</TableCell>
                  <TableCell className="text-[0.8125rem] text-white">{item.productName}</TableCell>
                  <TableCell className={cn('text-data-sm font-mono', status === 'out' ? 'text-[#E63946]' : status === 'low' ? 'text-[#E8A838]' : 'text-[#2EC4B6]')}>{item.currentStock}</TableCell>
                  <TableCell className="text-[0.75rem] text-[#A0A0A0]">{item.reorderLevel}</TableCell>
                  <TableCell>
                    {status === 'ok' ? <span className="flex items-center gap-1 text-[0.7rem] text-[#2EC4B6]"><CheckCircle size={12} /> In Stock</span> :
                     status === 'low' ? <span className="flex items-center gap-1 text-[0.7rem] text-[#E8A838]"><AlertTriangle size={12} /> Low</span> :
                     <span className="flex items-center gap-1 text-[0.7rem] text-[#E63946]"><XCircle size={12} /> Out</span>}
                  </TableCell>
                  <TableCell className="text-[0.7rem] text-[#666]">{format(parseISO(item.lastUpdated), 'dd MMM yyyy')}</TableCell>
                  <TableCell><Button size="sm" variant="ghost" className="h-6 text-[0.7rem] text-[#D4AF37] hover:bg-[rgba(212,175,55,0.1)]" onClick={() => setAdjItem(item)}>Adjust</Button></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-[60px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-7 text-[0.75rem] rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">{[10, 25, 50].map(s => <SelectItem key={s} value={String(s)} className="text-[0.75rem]">{s}</SelectItem>)}</SelectContent>
          </Select>
          <span className="text-[0.75rem] text-[#666]">of {total} records</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" className="h-7 w-7 p-0 text-[#A0A0A0] hover:text-white" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></Button>
          <span className="text-[0.75rem] text-[#A0A0A0] px-2">{page} / {totalPages}</span>
          <Button variant="ghost" className="h-7 w-7 p-0 text-[#A0A0A0] hover:text-white" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></Button>
        </div>
      </div>

      <Dialog open={!!adjItem} onOpenChange={() => setAdjItem(null)}>
        <DialogContent className="max-w-[400px] bg-[#111] border-[rgba(255,255,255,0.08)] text-white">
          <DialogHeader><DialogTitle>Adjust Stock</DialogTitle><DialogDescription className="text-[#A0A0A0]">{adjItem?.productName} (Current: {adjItem?.currentStock})</DialogDescription></DialogHeader>
          <div className="space-y-3 text-[0.875rem]">
            <div><Label className="text-[0.75rem] text-[#A0A0A0]">Adjustment (+/-)</Label><Input type="number" value={adjQty} onChange={e => setAdjQty(Number(e.target.value))} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1" /></div>
            <div><Label className="text-[0.75rem] text-[#A0A0A0]">Reason</Label>
              <Select value={adjReason} onValueChange={setAdjReason}>
                <SelectTrigger className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">
                  {['Received', 'Damaged', 'Return', 'Correction', 'Other'].map(r => <SelectItem key={r} value={r} className="text-[0.75rem]">{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" className="h-8 text-[0.75rem] text-[#A0A0A0] hover:text-white" onClick={() => setAdjItem(null)}>Cancel</Button>
            <Button onClick={handleAdjust} className="btn-primary h-8 px-4 text-[0.75rem]">Update Stock</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ===== MODULE 7: Coupons ===== */
function CouponsModule() {
  const [couponList, setCouponList] = useState(coupons);
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => couponList.filter(c => !search || c.code.toLowerCase().includes(search.toLowerCase()) || c.description.toLowerCase().includes(search.toLowerCase())), [couponList, search]);
  const { paginated, page, setPage, pageSize, setPageSize, totalPages, total } = usePagination(filtered, 10);

  const handleCreate = (form: any) => {
    const newCoupon: Coupon = {
      id: `CP-${String(couponList.length + 1).padStart(3, '0')}`,
      code: form.code, description: form.description, type: form.type, value: form.value,
      minOrder: form.minOrder, maxDiscount: form.type === 'percentage' ? form.value * 100 : undefined,
      usageLimit: form.usageLimit, usageCount: 0,
      validFrom: form.validFrom, validUntil: form.validUntil,
      status: 'active', firstOrderOnly: form.firstOrderOnly,
    };
    setCouponList(prev => [...prev, newCoupon]);
    setFormOpen(false);
  };
  const toggleStatus = (id: string) => setCouponList(prev => prev.map(c => c.id === id ? { ...c, status: c.status === 'active' ? 'disabled' as const : 'active' as const } : c));
  const handleDelete = (id: string) => { if (confirm('Delete this coupon?')) setCouponList(prev => prev.filter(c => c.id !== id)); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <FilterInput value={search} onChange={setSearch} placeholder="Search coupons..." />
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="h-7 text-[0.75rem] text-[#A0A0A0] hover:text-white" onClick={() => exportCSV('coupons.csv', ['Code', 'Type', 'Value', 'Min Order', 'Usage', 'Expiry', 'Status'], paginated.map(c => [c.code, c.type, c.type === 'percentage' ? `${c.value}%` : c.type === 'fixed' ? INR(c.value) : 'FREE', c.minOrder, `${c.usageCount}/${c.usageLimit}`, c.validUntil, c.status]))}>
            <Download size={14} className="mr-1" />Export
          </Button>
          <Button onClick={() => setFormOpen(true)} className="btn-primary h-7 px-3 text-[0.75rem]"><Plus size={14} className="mr-1" />Create Coupon</Button>
        </div>
      </div>
      <div className="glass-panel overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b-[rgba(255,255,255,0.06)]">
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Code</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Description</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Type</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Value</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Min Order</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Usage</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Expiry</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Status</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(c => (
              <TableRow key={c.id} className="border-b-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]">
                <TableCell className="text-data-sm font-mono text-[#D4AF37] text-[0.75rem]">{c.code}</TableCell>
                <TableCell className="text-[0.75rem] text-white max-w-[200px] truncate">{c.description}</TableCell>
                <TableCell><Badge className="bg-[rgba(255,255,255,0.06)] text-[#A0A0A0] rounded-none text-[0.6rem] capitalize">{c.type.replace('_', ' ')}</Badge></TableCell>
                <TableCell className="text-[0.75rem] text-white font-mono">{c.type === 'percentage' ? `${c.value}%` : c.type === 'fixed' ? INR(c.value) : 'FREE'}</TableCell>
                <TableCell className="text-[0.75rem] text-[#A0A0A0] font-mono">{c.minOrder > 0 ? INR(c.minOrder) : '-'}</TableCell>
                <TableCell className="text-[0.75rem] text-[#A0A0A0]">{c.usageCount}/{c.usageLimit}</TableCell>
                <TableCell className="text-[0.7rem] text-[#666]">{c.validUntil}</TableCell>
                <TableCell><Badge className={cn('rounded-none text-[0.6rem]', c.status === 'active' ? 'bg-[#2EC4B6]/10 text-[#2EC4B6]' : c.status === 'expired' ? 'bg-[#666]/10 text-[#666]' : 'bg-[#E8A838]/10 text-[#E8A838]')}>{c.status}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Switch checked={c.status === 'active'} onCheckedChange={() => toggleStatus(c.id)} className="data-[state=checked]:bg-[#D4AF37] scale-75" />
                    <button onClick={() => handleDelete(c.id)} className="p-1 text-[#666] hover:text-[#E63946]"><Trash2 size={14} /></button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-[60px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-7 text-[0.75rem] rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">{[10, 25].map(s => <SelectItem key={s} value={String(s)} className="text-[0.75rem]">{s}</SelectItem>)}</SelectContent>
          </Select>
          <span className="text-[0.75rem] text-[#666]">of {total} records</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" className="h-7 w-7 p-0 text-[#A0A0A0] hover:text-white" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></Button>
          <span className="text-[0.75rem] text-[#A0A0A0] px-2">{page} / {totalPages}</span>
          <Button variant="ghost" className="h-7 w-7 p-0 text-[#A0A0A0] hover:text-white" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></Button>
        </div>
      </div>
      <CouponFormModal open={formOpen} onClose={() => setFormOpen(false)} onSave={handleCreate} />
    </div>
  );
}


/* ===== MODULE 8: Subscriptions ===== */
function SubscriptionsModule() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => subscriptions.filter(s => {
    const q = search.toLowerCase();
    return (!q || s.customer.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) &&
      (planFilter === 'all' || s.plan === planFilter) && (statusFilter === 'all' || s.status === statusFilter);
  }), [search, planFilter, statusFilter]);
  const { paginated, page, setPage, pageSize, setPageSize, totalPages, total } = usePagination(filtered, 10);

  const planCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    subscriptions.forEach(s => { counts[s.plan] = (counts[s.plan] || 0) + 1; });
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {Object.entries(planCounts).map(([plan, count]) => (
          <div key={plan} className="glass-panel p-3 text-center">
            <p className="text-data-sm font-mono text-[#D4AF37]">{count}</p>
            <p className="text-[0.65rem] text-[#A0A0A0] mt-0.5">{plan}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <FilterInput value={search} onChange={setSearch} placeholder="Search subscriptions..." />
          <Select value={planFilter} onValueChange={setPlanFilter}>
            <SelectTrigger className="w-[150px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-8 text-[0.75rem] rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">
              <SelectItem value="all" className="text-[0.75rem]">All Plans</SelectItem>
              {['Quarterly Filter', 'Bi-Annual Filter', 'Annual Filter', 'AMC Gold', 'AMC Platinum'].map(p => <SelectItem key={p} value={p} className="text-[0.75rem]">{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-8 text-[0.75rem] rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">
              <SelectItem value="all" className="text-[0.75rem]">All Status</SelectItem>
              {['active', 'paused', 'cancelled', 'expired'].map(s => <SelectItem key={s} value={s} className="text-[0.75rem] capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" className="h-7 text-[0.75rem] text-[#A0A0A0] hover:text-white" onClick={() => exportCSV('subscriptions.csv', ['ID', 'Customer', 'Plan', 'Start', 'Next Delivery', 'Status', 'Amount'], paginated.map(s => [s.id, s.customer, s.plan, s.startDate, s.nextDelivery, s.status, s.amount]))}>
          <Download size={14} className="mr-1" />Export
        </Button>
      </div>

      <div className="glass-panel overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b-[rgba(255,255,255,0.06)]">
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Sub ID</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Customer</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Plan</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Start Date</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Next Delivery</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Status</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(s => (
              <TableRow key={s.id} className="border-b-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]">
                <TableCell className="text-data-sm font-mono text-[#D4AF37] text-[0.75rem]">{s.id}</TableCell>
                <TableCell>
                  <div><p className="text-[0.8125rem] text-white">{s.customer}</p><p className="text-[0.7rem] text-[#666]">{s.email}</p></div>
                </TableCell>
                <TableCell><Badge className="bg-[rgba(255,255,255,0.06)] text-[#A0A0A0] rounded-none text-[0.6rem]">{s.plan}</Badge></TableCell>
                <TableCell className="text-[0.75rem] text-[#A0A0A0]">{format(parseISO(s.startDate), 'dd MMM yyyy')}</TableCell>
                <TableCell className="text-[0.75rem] text-[#A0A0A0]">{format(parseISO(s.nextDelivery), 'dd MMM yyyy')}</TableCell>
                <TableCell><Badge className={cn('rounded-none text-[0.6rem] capitalize', STATUS_COLORS[s.status])}>{s.status}</Badge></TableCell>
                <TableCell className="text-[0.8125rem] text-white font-mono">{INR(s.amount)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-[60px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-7 text-[0.75rem] rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">{[10, 25].map(s => <SelectItem key={s} value={String(s)} className="text-[0.75rem]">{s}</SelectItem>)}</SelectContent>
          </Select>
          <span className="text-[0.75rem] text-[#666]">of {total} records</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" className="h-7 w-7 p-0 text-[#A0A0A0] hover:text-white" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></Button>
          <span className="text-[0.75rem] text-[#A0A0A0] px-2">{page} / {totalPages}</span>
          <Button variant="ghost" className="h-7 w-7 p-0 text-[#A0A0A0] hover:text-white" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></Button>
        </div>
      </div>
    </div>
  );
}

/* ===== MODULE 9: Shipping ===== */
function ShippingModule() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => shipments.filter(s => {
    const q = search.toLowerCase();
    return (!q || s.orderId.toLowerCase().includes(q) || s.awb.includes(q)) && (statusFilter === 'all' || s.status === statusFilter);
  }), [search, statusFilter]);
  const { paginated, page, setPage, pageSize, setPageSize, totalPages, total } = usePagination(filtered, 10);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    shipments.forEach(s => { counts[s.status] = (counts[s.status] || 0) + 1; });
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {['booked', 'in_transit', 'delivered', 'failed'].map(k => (
          <div key={k} className="glass-panel p-3 text-center">
            <p className="text-data-sm font-mono text-[#D4AF37]">{statusCounts[k] || 0}</p>
            <p className="text-[0.65rem] text-[#A0A0A0] mt-0.5 capitalize">{k.replace('_', ' ')}</p>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <FilterInput value={search} onChange={setSearch} placeholder="Search AWB, order..." />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-8 text-[0.75rem] rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">
              <SelectItem value="all" className="text-[0.75rem]">All Status</SelectItem>
              {['booked', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'rto'].map(s => <SelectItem key={s} value={s} className="text-[0.75rem] capitalize">{s.replace(/_/g, ' ')}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" className="h-7 text-[0.75rem] text-[#A0A0A0] hover:text-white" onClick={() => exportCSV('shipments.csv', ['ID', 'Order', 'Carrier', 'AWB', 'Status', 'Origin', 'Destination', 'ETA'], paginated.map(s => [s.id, s.orderId, s.carrier, s.awb, s.status, s.origin, s.destination, s.estimatedDelivery]))}>
          <Download size={14} className="mr-1" />Export Manifest
        </Button>
      </div>
      <div className="glass-panel overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b-[rgba(255,255,255,0.06)]">
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Shipment ID</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Order</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Carrier</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">AWB</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Status</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">From</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">To</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Est. Delivery</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(s => (
              <TableRow key={s.id} className="border-b-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]">
                <TableCell className="text-data-sm font-mono text-[#D4AF37] text-[0.75rem]">{s.id}</TableCell>
                <TableCell className="text-data-sm font-mono text-[#A0A0A0] text-[0.7rem]">{s.orderId}</TableCell>
                <TableCell className="text-[0.75rem] text-white">{s.carrier}</TableCell>
                <TableCell className="text-data-sm font-mono text-[#A0A0A0] text-[0.7rem]">{s.awb}</TableCell>
                <TableCell><Badge className={cn('rounded-none text-[0.6rem] capitalize', STATUS_COLORS[s.status])}>{s.status.replace(/_/g, ' ')}</Badge></TableCell>
                <TableCell className="text-[0.7rem] text-[#A0A0A0]">{s.origin}</TableCell>
                <TableCell className="text-[0.7rem] text-[#A0A0A0]">{s.destination}</TableCell>
                <TableCell className="text-[0.75rem] text-[#A0A0A0]">{format(parseISO(s.estimatedDelivery), 'dd MMM yyyy')}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-[60px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-7 text-[0.75rem] rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">{[10, 25].map(s => <SelectItem key={s} value={String(s)} className="text-[0.75rem]">{s}</SelectItem>)}</SelectContent>
          </Select>
          <span className="text-[0.75rem] text-[#666]">of {total} records</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" className="h-7 w-7 p-0 text-[#A0A0A0] hover:text-white" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></Button>
          <span className="text-[0.75rem] text-[#A0A0A0] px-2">{page} / {totalPages}</span>
          <Button variant="ghost" className="h-7 w-7 p-0 text-[#A0A0A0] hover:text-white" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></Button>
        </div>
      </div>
    </div>
  );
}


/* ===== MODULE 10: Payments ===== */
function PaymentsModule() {
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [txnList, setTxnList] = useState(transactions);
  const [refundTxn, setRefundTxn] = useState<Transaction | null>(null);

  const filtered = useMemo(() => txnList.filter(t => {
    const q = search.toLowerCase();
    return (!q || t.orderId.toLowerCase().includes(q) || t.razorpayId.toLowerCase().includes(q) || t.customer.toLowerCase().includes(q)) &&
      (methodFilter === 'all' || t.method === methodFilter);
  }), [txnList, search, methodFilter]);
  const { sorted, toggle, sortKey, sortDir: _sortDir } = useSort(filtered, 'date');
  const { paginated, page, setPage, pageSize, setPageSize, totalPages, total } = usePagination(sorted, 10);

  const totalRev = txnList.filter(t => t.status === 'captured').reduce((s, t) => s + t.amount, 0);
  const successCount = txnList.filter(t => t.status === 'captured').length;
  const failedCount = txnList.filter(t => t.status === 'failed').length;
  const refundTotal = txnList.filter(t => t.status === 'refunded' || t.status === 'partially_refunded').reduce((s, t) => s + t.amount, 0);

  const handleRefund = (id: string, _amount: number) => {
    setTxnList(prev => prev.map(t => t.id === id ? { ...t, status: 'refunded' as const } : t));
    setRefundTxn(null);
  };
  const SortTH = ({ label, field }: { label: string; field: keyof Transaction }) => (
    <TableHead className="text-[#A0A0A0] text-[0.7rem] cursor-pointer select-none hover:text-white" onClick={() => toggle(field)}>
      <span className="flex items-center gap-1">{label} <ArrowUpDown size={10} className={sortKey === field ? 'text-[#D4AF37]' : 'text-[#666]'} /></span>
    </TableHead>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4"><p className="text-data-sm font-mono text-[#D4AF37]">{INR(totalRev)}</p><p className="text-[0.7rem] text-[#A0A0A0] mt-1">Total Revenue</p></div>
        <div className="glass-panel p-4"><p className="text-data-sm font-mono text-[#2EC4B6]">{successCount}</p><p className="text-[0.7rem] text-[#A0A0A0] mt-1">Successful</p></div>
        <div className="glass-panel p-4"><p className="text-data-sm font-mono text-[#E63946]">{failedCount}</p><p className="text-[0.7rem] text-[#A0A0A0] mt-1">Failed</p></div>
        <div className="glass-panel p-4"><p className="text-data-sm font-mono text-[#E8A838]">{INR(refundTotal)}</p><p className="text-[0.7rem] text-[#A0A0A0] mt-1">Refunds</p></div>
      </div>

      <div className="glass-panel p-5">
        <h3 className="text-label text-white mb-4 font-['Playfair_Display'] text-sm tracking-wide">Payment Methods</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={paymentMethodData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="method" stroke="#666" tick={{ fontSize: 11 }} />
            <YAxis stroke="#666" tick={{ fontSize: 11 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Transactions" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <FilterInput value={search} onChange={setSearch} placeholder="Search transactions..." />
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[130px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-8 text-[0.75rem] rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">
              <SelectItem value="all" className="text-[0.75rem]">All Methods</SelectItem>
              {['UPI', 'Card', 'Net Banking', 'EMI', 'COD', 'Wallet'].map(m => <SelectItem key={m} value={m} className="text-[0.75rem]">{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" className="h-7 text-[0.75rem] text-[#A0A0A0] hover:text-white" onClick={() => exportCSV('payments.csv', ['ID', 'Order', 'Razorpay ID', 'Customer', 'Amount', 'Method', 'Status', 'Date'], paginated.map(t => [t.id, t.orderId, t.razorpayId, t.customer, t.amount, t.method, t.status, t.date]))}>
          <Download size={14} className="mr-1" />Export
        </Button>
      </div>

      <div className="glass-panel overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b-[rgba(255,255,255,0.06)]">
              <SortTH label="Transaction ID" field="id" />
              <SortTH label="Order" field="orderId" />
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Razorpay ID</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Customer</TableHead>
              <SortTH label="Amount" field="amount" />
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Method</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Status</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Settlement</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(t => (
              <TableRow key={t.id} className="border-b-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]">
                <TableCell className="text-data-sm font-mono text-[#D4AF37] text-[0.75rem]">{t.id}</TableCell>
                <TableCell className="text-data-sm font-mono text-[#A0A0A0] text-[0.7rem]">{t.orderId}</TableCell>
                <TableCell className="text-data-sm font-mono text-[#A0A0A0] text-[0.7rem]">{t.razorpayId}</TableCell>
                <TableCell className="text-[0.75rem] text-white">{t.customer}</TableCell>
                <TableCell className="text-[0.8125rem] text-white font-mono">{INR(t.amount)}</TableCell>
                <TableCell className="text-[0.7rem] bg-[rgba(255,255,255,0.05)] px-2 py-0.5 text-[#A0A0A0] w-fit">{t.method}</TableCell>
                <TableCell><Badge className={cn('rounded-none text-[0.6rem]', STATUS_COLORS[t.status])}>{t.status.replace('_', ' ')}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className={cn('w-1.5 h-1.5 rounded-full', t.settlementStatus === 'settled' ? 'bg-[#2EC4B6]' : 'bg-[#E8A838]')} />
                    <span className="text-[0.7rem] text-[#A0A0A0] capitalize">{t.settlementStatus}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {t.status === 'captured' && <Button size="sm" variant="ghost" className="h-6 text-[0.7rem] text-[#E8A838] hover:bg-[rgba(232,168,56,0.1)]" onClick={() => setRefundTxn(t)}>Refund</Button>}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-[60px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-7 text-[0.75rem] rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">{[10, 25].map(s => <SelectItem key={s} value={String(s)} className="text-[0.75rem]">{s}</SelectItem>)}</SelectContent>
          </Select>
          <span className="text-[0.75rem] text-[#666]">of {total} records</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" className="h-7 w-7 p-0 text-[#A0A0A0] hover:text-white" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></Button>
          <span className="text-[0.75rem] text-[#A0A0A0] px-2">{page} / {totalPages}</span>
          <Button variant="ghost" className="h-7 w-7 p-0 text-[#A0A0A0] hover:text-white" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></Button>
        </div>
      </div>
      <RefundModal txn={refundTxn} open={!!refundTxn} onClose={() => setRefundTxn(null)} onRefund={handleRefund} />
    </div>
  );
}

/* ===== MODULE 11: GST Reports ===== */
function GSTReportsModule() {
  const [period, setPeriod] = useState('monthly');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4"><p className="text-data-sm font-mono text-white">{INR(gstData.totalTaxable)}</p><p className="text-[0.7rem] text-[#A0A0A0] mt-1">Total Taxable Value</p></div>
        <div className="glass-panel p-4"><p className="text-data-sm font-mono text-[#00B4D8]">{INR(gstData.totalCGST)}</p><p className="text-[0.7rem] text-[#A0A0A0] mt-1">Total CGST (9%)</p></div>
        <div className="glass-panel p-4"><p className="text-data-sm font-mono text-[#2EC4B6]">{INR(gstData.totalSGST)}</p><p className="text-[0.7rem] text-[#A0A0A0] mt-1">Total SGST (9%)</p></div>
        <div className="glass-panel p-4"><p className="text-data-sm font-mono text-[#E8A838]">{INR(gstData.totalIGST)}</p><p className="text-[0.7rem] text-[#A0A0A0] mt-1">Total IGST (18%)</p></div>
      </div>

      <div className="flex items-center gap-3">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[140px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-8 text-[0.75rem] rounded-none"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">
            {['monthly', 'quarterly', 'yearly'].map(p => <SelectItem key={p} value={p} className="text-[0.75rem] capitalize">{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="ghost" className="h-7 text-[0.75rem] text-[#A0A0A0] hover:text-white" onClick={() => exportCSV('gst_invoices.csv', ['Invoice No', 'Date', 'Customer', 'GSTIN', 'HSN', 'Taxable', 'CGST', 'SGST', 'IGST', 'Total'], gstData.invoices.map(i => [i.id, i.date, i.customer, i.gstin || 'N/A', i.hsn, i.taxableValue, i.cgst, i.sgst, i.igst, i.total]))}>
          <Download size={14} className="mr-1" />Export CSV
        </Button>
        <Button variant="ghost" className="h-7 text-[0.75rem] text-[#A0A0A0] hover:text-white" onClick={() => exportCSV('gstr1_summary.csv', ['Tax Component', 'Amount'], [['Taxable Value', gstData.totalTaxable], ['CGST', gstData.totalCGST], ['SGST', gstData.totalSGST], ['IGST', gstData.totalIGST], ['Total Tax', gstData.totalCGST + gstData.totalSGST + gstData.totalIGST]])}>
          <Download size={14} className="mr-1" />GSTR-1 JSON
        </Button>
      </div>

      <div className="glass-panel p-5">
        <h3 className="text-label text-white mb-4 font-['Playfair_Display'] text-sm tracking-wide">GSTR-1 Summary</h3>
        <Table>
          <TableHeader>
            <TableRow className="border-b-[rgba(255,255,255,0.06)]">
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Supply Type</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem] text-right">Invoice Count</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem] text-right">Taxable Value</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem] text-right">CGST</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem] text-right">SGST</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem] text-right">IGST</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { type: 'B2B (Registered)', count: 6, taxable: 1560000, cgst: 140400, sgst: 140400, igst: 34200 },
              { type: 'B2C Large (>2.5L)', count: 4, taxable: 1200000, cgst: 108000, sgst: 108000, igst: 0 },
              { type: 'B2C Small', count: 8, taxable: 2450000, cgst: 220500, sgst: 220500, igst: 0 },
              { type: 'Nil-rated', count: 2, taxable: 253200, cgst: 22788, sgst: 22788, igst: 0 },
            ].map((row, i) => (
              <TableRow key={i} className="border-b-[rgba(255,255,255,0.04)]">
                <TableCell className="text-[0.8125rem] text-white">{row.type}</TableCell>
                <TableCell className="text-[0.8125rem] text-white font-mono text-right">{row.count}</TableCell>
                <TableCell className="text-[0.8125rem] text-white font-mono text-right">{INR(row.taxable)}</TableCell>
                <TableCell className="text-[0.8125rem] text-[#00B4D8] font-mono text-right">{INR(row.cgst)}</TableCell>
                <TableCell className="text-[0.8125rem] text-[#2EC4B6] font-mono text-right">{INR(row.sgst)}</TableCell>
                <TableCell className="text-[0.8125rem] text-[#E8A838] font-mono text-right">{INR(row.igst)}</TableCell>
              </TableRow>
            ))}
            <TableRow className="border-t border-[rgba(255,255,255,0.1)]">
              <TableCell className="text-[0.875rem] text-white font-semibold">Total</TableCell>
              <TableCell className="text-[0.875rem] text-white font-mono font-semibold text-right">20</TableCell>
              <TableCell className="text-[0.875rem] text-[#D4AF37] font-mono font-semibold text-right">{INR(gstData.totalTaxable)}</TableCell>
              <TableCell className="text-[0.875rem] text-[#00B4D8] font-mono font-semibold text-right">{INR(gstData.totalCGST)}</TableCell>
              <TableCell className="text-[0.875rem] text-[#2EC4B6] font-mono font-semibold text-right">{INR(gstData.totalSGST)}</TableCell>
              <TableCell className="text-[0.875rem] text-[#E8A838] font-mono font-semibold text-right">{INR(gstData.totalIGST)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="glass-panel p-5">
        <h3 className="text-label text-white mb-4 font-['Playfair_Display'] text-sm tracking-wide">Tax Invoices</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-[rgba(255,255,255,0.06)]">
                <TableHead className="text-[#A0A0A0] text-[0.7rem]">Invoice No</TableHead>
                <TableHead className="text-[#A0A0A0] text-[0.7rem]">Date</TableHead>
                <TableHead className="text-[#A0A0A0] text-[0.7rem]">Customer</TableHead>
                <TableHead className="text-[#A0A0A0] text-[0.7rem]">GSTIN</TableHead>
                <TableHead className="text-[#A0A0A0] text-[0.7rem]">Taxable</TableHead>
                <TableHead className="text-[#A0A0A0] text-[0.7rem]">CGST</TableHead>
                <TableHead className="text-[#A0A0A0] text-[0.7rem]">SGST</TableHead>
                <TableHead className="text-[#A0A0A0] text-[0.7rem]">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gstData.invoices.map(inv => (
                <TableRow key={inv.id} className="border-b-[rgba(255,255,255,0.04)]">
                  <TableCell className="text-data-sm font-mono text-[#D4AF37] text-[0.75rem]">{inv.id}</TableCell>
                  <TableCell className="text-[0.75rem] text-[#A0A0A0]">{format(parseISO(inv.date), 'dd MMM yyyy')}</TableCell>
                  <TableCell className="text-[0.75rem] text-white">{inv.customer}</TableCell>
                  <TableCell className="text-data-sm font-mono text-[#A0A0A0] text-[0.7rem]">{inv.gstin || 'N/A'}</TableCell>
                  <TableCell className="text-[0.75rem] text-white font-mono">{INR(inv.taxableValue)}</TableCell>
                  <TableCell className="text-[0.75rem] text-[#00B4D8] font-mono">{INR(inv.cgst)}</TableCell>
                  <TableCell className="text-[0.75rem] text-[#2EC4B6] font-mono">{INR(inv.sgst)}</TableCell>
                  <TableCell className="text-[0.75rem] text-[#D4AF37] font-mono">{INR(inv.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}


/* ===== MODULE 12: Audit Logs ===== */
function AuditLogsModule() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');

  const filtered = useMemo(() => auditLogs.filter(l => {
    const q = search.toLowerCase();
    return (!q || l.user.toLowerCase().includes(q) || l.target.toLowerCase().includes(q)) &&
      (actionFilter === 'all' || l.action === actionFilter) &&
      (moduleFilter === 'all' || l.module === moduleFilter);
  }), [search, actionFilter, moduleFilter]);
  const { sorted, toggle, sortKey, sortDir: _sortDir } = useSort(filtered, 'timestamp');
  const { paginated, page, setPage, pageSize, setPageSize, totalPages, total } = usePagination(sorted, 10);

  const actionColor: Record<string, string> = { create: 'text-[#2EC4B6]', update: 'text-[#00B4D8]', delete: 'text-[#E63946]', login: 'text-[#666]', logout: 'text-[#666]', export: 'text-[#E8A838]' };
  const modules = Array.from(new Set(auditLogs.map(l => l.module)));
  const SortTH = ({ label, field }: { label: string; field: keyof AuditLog }) => (
    <TableHead className="text-[#A0A0A0] text-[0.7rem] cursor-pointer select-none hover:text-white" onClick={() => toggle(field)}>
      <span className="flex items-center gap-1">{label} <ArrowUpDown size={10} className={sortKey === field ? 'text-[#D4AF37]' : 'text-[#666]'} /></span>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <FilterInput value={search} onChange={setSearch} placeholder="Search logs..." />
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger className="w-[130px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-8 text-[0.75rem] rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">
              <SelectItem value="all" className="text-[0.75rem]">All Actions</SelectItem>
              {['create', 'update', 'delete', 'login', 'logout', 'export'].map(a => <SelectItem key={a} value={a} className="text-[0.75rem] capitalize">{a}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-[140px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-8 text-[0.75rem] rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">
              <SelectItem value="all" className="text-[0.75rem]">All Modules</SelectItem>
              {modules.map(m => <SelectItem key={m} value={m} className="text-[0.75rem]">{m}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <Button variant="ghost" className="h-7 text-[0.75rem] text-[#A0A0A0] hover:text-white" onClick={() => exportCSV('audit_logs.csv', ['Timestamp', 'User', 'Role', 'Module', 'Action', 'Target', 'Details', 'IP'], paginated.map(l => [l.timestamp, l.user, l.role, l.module, l.action, l.target, l.details, l.ip]))}>
          <Download size={14} className="mr-1" />Export
        </Button>
      </div>
      <div className="glass-panel overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b-[rgba(255,255,255,0.06)]">
              <SortTH label="Timestamp" field="timestamp" />
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">User</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Role</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Module</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Action</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Target</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">Details</TableHead>
              <TableHead className="text-[#A0A0A0] text-[0.7rem]">IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map(l => (
              <TableRow key={l.id} className="border-b-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.02)]">
                <TableCell className="text-data-sm font-mono text-[#A0A0A0] text-[0.7rem]">{format(parseISO(l.timestamp), 'dd/MM/yyyy HH:mm:ss')}</TableCell>
                <TableCell className="text-[0.75rem] text-white">{l.user}</TableCell>
                <TableCell><Badge className={cn('rounded-none text-[0.6rem] capitalize', ROLE_COLORS[l.role])}>{l.role}</Badge></TableCell>
                <TableCell className="text-[0.75rem] text-[#A0A0A0]">{l.module}</TableCell>
                <TableCell className={cn('text-[0.75rem] font-medium capitalize', actionColor[l.action])}>{l.action}</TableCell>
                <TableCell className="text-data-sm font-mono text-[#D4AF37] text-[0.7rem]">{l.target}</TableCell>
                <TableCell className="text-[0.7rem] text-[#A0A0A0] max-w-[200px] truncate">{l.details}</TableCell>
                <TableCell className="text-data-sm font-mono text-[#666] text-[0.7rem]">{l.ip}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-[60px] bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white h-7 text-[0.75rem] rounded-none"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-[#1A1A1A] border-[rgba(255,255,255,0.1)] text-white">{[10, 25, 50].map(s => <SelectItem key={s} value={String(s)} className="text-[0.75rem]">{s}</SelectItem>)}</SelectContent>
          </Select>
          <span className="text-[0.75rem] text-[#666]">of {total} records</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" className="h-7 w-7 p-0 text-[#A0A0A0] hover:text-white" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={14} /></Button>
          <span className="text-[0.75rem] text-[#A0A0A0] px-2">{page} / {totalPages}</span>
          <Button variant="ghost" className="h-7 w-7 p-0 text-[#A0A0A0] hover:text-white" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={14} /></Button>
        </div>
      </div>
    </div>
  );
}

/* ===== MODULE 13: Settings ===== */
function SettingsModule() {
  const [tab, setTab] = useState('general');
  const [settings, setSettings] = useState(settingsData);

  const update = (key: string, value: string) => setSettings(s => ({ ...s, [key]: value }));

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b border-[rgba(255,255,255,0.06)] pb-0 overflow-x-auto">
        {[{ key: 'general', label: 'General' }, { key: 'payment', label: 'Payment' }, { key: 'shipping', label: 'Shipping' }, { key: 'notifications', label: 'Notifications' }, { key: 'roles', label: 'Users & Roles' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={cn('px-4 py-2 text-[0.8125rem] font-medium transition-colors whitespace-nowrap border-b-2', tab === t.key ? 'text-[#D4AF37] border-[#D4AF37]' : 'text-[#A0A0A0] border-transparent hover:text-white')}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <div className="glass-panel p-6 max-w-[600px] space-y-4">
          <h3 className="text-label text-white mb-2">General Settings</h3>
          <div><Label className="text-[0.75rem] text-[#A0A0A0]">Store Name</Label><Input value={settings.storeName} onChange={e => update('storeName', e.target.value)} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1" /></div>
          <div><Label className="text-[0.75rem] text-[#A0A0A0]">Tagline</Label><Input value={settings.tagline} onChange={e => update('tagline', e.target.value)} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-[0.75rem] text-[#A0A0A0]">Contact Email</Label><Input value={settings.contactEmail} onChange={e => update('contactEmail', e.target.value)} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1" /></div>
            <div><Label className="text-[0.75rem] text-[#A0A0A0]">Contact Phone</Label><Input value={settings.contactPhone} onChange={e => update('contactPhone', e.target.value)} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1" /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label className="text-[0.75rem] text-[#A0A0A0]">GSTIN</Label><Input value={settings.gstin} onChange={e => update('gstin', e.target.value)} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1 font-mono" /></div>
            <div><Label className="text-[0.75rem] text-[#A0A0A0]">PAN</Label><Input value={settings.pan} onChange={e => update('pan', e.target.value)} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1 font-mono" /></div>
            <div><Label className="text-[0.75rem] text-[#A0A0A0]">CIN</Label><Input value={settings.cin} onChange={e => update('cin', e.target.value)} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1 font-mono" /></div>
          </div>
          <div><Label className="text-[0.75rem] text-[#A0A0A0]">Registered Address</Label><Textarea value={settings.address} onChange={e => update('address', e.target.value)} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none mt-1 min-h-[60px]" /></div>
          <Button className="btn-primary h-8 px-5 text-[0.75rem] mt-2">Save Changes</Button>
        </div>
      )}

      {tab === 'payment' && (
        <div className="glass-panel p-6 max-w-[600px] space-y-4">
          <h3 className="text-label text-white mb-2">Payment Settings</h3>
          <div><Label className="text-[0.75rem] text-[#A0A0A0]">Razorpay Key ID</Label><Input value={settings.razorpayKeyId} onChange={e => update('razorpayKeyId', e.target.value)} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1 font-mono" /></div>
          <div><Label className="text-[0.75rem] text-[#A0A0A0]">Razorpay Key Secret</Label><Input value={settings.razorpaySecret} onChange={e => update('razorpaySecret', e.target.value)} type="password" className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1 font-mono" /></div>
          <div><Label className="text-[0.75rem] text-[#A0A0A0]">Stripe Publishable Key</Label><Input value={settings.stripeKey} onChange={e => update('stripeKey', e.target.value)} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1 font-mono" /></div>
          <div className="flex items-center gap-2 pt-2">
            <Switch checked className="data-[state=checked]:bg-[#D4AF37]" />
            <Label className="text-[0.75rem] text-[#A0A0A0]">Test Mode</Label>
          </div>
          <Button className="btn-primary h-8 px-5 text-[0.75rem] mt-2">Save Changes</Button>
        </div>
      )}

      {tab === 'shipping' && (
        <div className="glass-panel p-6 max-w-[600px] space-y-4">
          <h3 className="text-label text-white mb-2">Shipping Settings</h3>
          <div><Label className="text-[0.75rem] text-[#A0A0A0]">Free Shipping Threshold (\u20B9)</Label><Input type="number" value={settings.freeShippingThreshold} onChange={e => update('freeShippingThreshold', e.target.value)} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1" /></div>
          <div><Label className="text-[0.75rem] text-[#A0A0A0]">Flat Shipping Rate (\u20B9)</Label><Input type="number" value={settings.flatShippingRate} onChange={e => update('flatShippingRate', e.target.value)} className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white rounded-none h-8 mt-1" /></div>
          <Button className="btn-primary h-8 px-5 text-[0.75rem] mt-2">Save Changes</Button>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="glass-panel p-6 max-w-[600px] space-y-4">
          <h3 className="text-label text-white mb-2">Email Templates</h3>
          <div className="space-y-2">
            {['Order Confirmation', 'Order Shipped', 'Order Delivered', 'Payment Failed', 'Refund Processed', 'Subscription Renewal', 'Low Stock Alert'].map(tpl => (
              <div key={tpl} className="flex items-center justify-between py-2 border-b border-[rgba(255,255,255,0.04)]">
                <span className="text-[0.8125rem] text-white">{tpl}</span>
                <div className="flex items-center gap-3">
                  <Switch defaultChecked className="data-[state=checked]:bg-[#D4AF37] scale-75" />
                  <button className="text-[0.7rem] text-[#D4AF37] hover:underline">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'roles' && (
        <div className="space-y-4">
          <div className="glass-panel p-5">
            <h3 className="text-label text-white mb-4">Role Permissions Matrix</h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b-[rgba(255,255,255,0.06)]">
                    <TableHead className="text-[#A0A0A0] text-[0.7rem]">Module</TableHead>
                    <TableHead className="text-[#A0A0A0] text-[0.7rem] text-center">Admin</TableHead>
                    <TableHead className="text-[#A0A0A0] text-[0.7rem] text-center">Manager</TableHead>
                    <TableHead className="text-[#A0A0A0] text-[0.7rem] text-center">Support</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rolePermissions.map(rp => (
                    <TableRow key={rp.module} className="border-b-[rgba(255,255,255,0.04)]">
                      <TableCell className="text-[0.8125rem] text-white">{rp.module}</TableCell>
                      <TableCell className="text-center text-[0.7rem] text-[#D4AF37]">{rp.admin.length > 0 ? rp.admin.join(', ') : '—'}</TableCell>
                      <TableCell className="text-center text-[0.7rem] text-[#7B61FF]">{rp.manager.length > 0 ? rp.manager.join(', ') : '—'}</TableCell>
                      <TableCell className="text-center text-[0.7rem] text-[#2EC4B6]">{rp.support.length > 0 ? rp.support.join(', ') : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ===== Main Admin Component ===== */
export default function Admin() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Redirect non-admin users
  useEffect(() => {
    if (!isAdmin) {
      navigate('/account');
    }
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const unreadCount = notifs.filter(n => !n.read).length;

  const sectionLabels: Record<string, string> = {
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    orders: 'Orders',
    users: 'Users',
    products: 'Products',
    inventory: 'Inventory',
    coupons: 'Coupons',
    subscriptions: 'Subscriptions',
    shipping: 'Shipping',
    payments: 'Payments',
    'gst-reports': 'GST Reports',
    'audit-logs': 'Audit Logs',
    settings: 'Settings',
  };

  const renderModule = () => {
    switch (activeSection) {
      case 'dashboard': return <DashboardModule onNav={setActiveSection} />;
      case 'analytics': return <AnalyticsModule />;
      case 'orders': return <OrdersModule />;
      case 'users': return <UsersModule />;
      case 'products': return <ProductsModule />;
      case 'inventory': return <InventoryModule />;
      case 'coupons': return <CouponsModule />;
      case 'subscriptions': return <SubscriptionsModule />;
      case 'shipping': return <ShippingModule />;
      case 'payments': return <PaymentsModule />;
      case 'gst-reports': return <GSTReportsModule />;
      case 'audit-logs': return <AuditLogsModule />;
      case 'settings': return <SettingsModule />;
      default: return <DashboardModule onNav={setActiveSection} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0A0A0A] flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-[#0D0D0D] border-r border-[rgba(255,255,255,0.06)] z-[1100] transition-all duration-300 flex flex-col',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:w-[260px]'
        )}
      >
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-[rgba(255,255,255,0.06)] flex-shrink-0">
          <span className="font-display text-[1.25rem] text-[#D4AF37] tracking-tight">SWORD</span>
          <span className="text-label text-[#666] ml-2 text-[0.65rem]">ADMIN</span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto text-[#666] hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3">
          {navGroups.map(group => (
            <div key={group.label} className="mb-3">
              <p className="text-[0.6rem] uppercase tracking-[0.1em] text-[#444] px-5 mb-1 font-medium">{group.label}</p>
              {group.items.map(item => {
                const Icon = item.icon;
                const isActive = activeSection === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => { setActiveSection(item.key); setSidebarOpen(false); }}
                    className={cn(
                      'w-full flex items-center gap-3 px-5 py-[10px] text-left transition-all text-[0.8125rem] font-medium',
                      isActive
                        ? 'bg-[rgba(212,175,55,0.08)] text-[#D4AF37] border-l-[3px] border-l-[#D4AF37]'
                        : 'text-[#A0A0A0] hover:bg-[rgba(255,255,255,0.03)] hover:text-white border-l-[3px] border-l-transparent'
                    )}
                  >
                    <Icon size={18} className={isActive ? 'text-[#D4AF37]' : 'text-[#666]'} />
                    {item.label}
                    {item.key === 'orders' && adminOrders.filter(o => o.status === 'placed').length > 0 && (
                      <span className="ml-auto w-4 h-4 bg-[#E63946] text-white text-[0.6rem] flex items-center justify-center">{adminOrders.filter(o => o.status === 'placed').length}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Bottom: Exit Admin */}
        <div className="p-3 border-t border-[rgba(255,255,255,0.06)] flex-shrink-0">
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-2 px-3 py-2 text-[0.75rem] text-[#A0A0A0] hover:text-white transition-colors">
            <ChevronLeft size={14} /> Exit Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top Bar */}
        <header className="h-14 bg-[#111] border-b border-[rgba(255,255,255,0.06)] flex items-center px-4 lg:px-6 gap-4 flex-shrink-0 z-[1090]">
          {/* Mobile hamburger */}
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#A0A0A0] hover:text-white p-1">
            <Menu size={20} />
          </button>

          {/* Breadcrumb / Title */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="hidden sm:inline text-[0.75rem] text-[#666]">Admin</span>
            <span className="hidden sm:inline text-[0.75rem] text-[#444]">/</span>
            <h1 className="text-[0.9375rem] font-semibold text-white truncate">{sectionLabels[activeSection]}</h1>
          </div>

          <div className="flex-1" />

          {/* Global Search */}
          <div className="hidden md:block relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#666]" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search orders, users, products..."
              className="pl-8 h-8 bg-[rgba(255,255,255,0.05)] border-[rgba(255,255,255,0.1)] text-white text-[0.75rem] placeholder:text-[#666] focus:border-[#D4AF37] w-[280px] rounded-none"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }} className="relative p-2 text-[#A0A0A0] hover:text-white transition-colors">
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#E63946] text-white text-[0.6rem] flex items-center justify-center">{unreadCount}</span>
              )}
            </button>
            {notifOpen && (
              <>
                <div className="fixed inset-0 z-[1095]" onClick={() => setNotifOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-[320px] bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] shadow-xl z-[1100] py-2">
                  <div className="px-4 py-2 border-b border-[rgba(255,255,255,0.06)] flex items-center justify-between">
                    <span className="text-[0.8125rem] font-medium text-white">Notifications</span>
                    <span className="text-[0.7rem] text-[#666]">{unreadCount} unread</span>
                  </div>
                  {notifs.map(n => (
                    <div key={n.id} className={cn('px-4 py-2.5 border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.03)] cursor-pointer', !n.read && 'bg-[rgba(212,175,55,0.03)]')}>
                      <p className={cn('text-[0.75rem]', !n.read ? 'text-white font-medium' : 'text-[#A0A0A0]')}>{n.message}</p>
                      <p className="text-[0.65rem] text-[#666] mt-0.5">{n.time}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* User Avatar */}
          <div className="relative">
            <button onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[rgba(212,175,55,0.1)] flex items-center justify-center text-[#D4AF37] font-medium text-[0.75rem]">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'A'}
              </div>
              <ChevronDown size={14} className="text-[#666] hidden sm:block" />
            </button>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-[1095]" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-[200px] bg-[#1A1A1A] border border-[rgba(255,255,255,0.08)] shadow-xl z-[1100] py-2">
                  <div className="px-4 py-2 border-b border-[rgba(255,255,255,0.06)]">
                    <p className="text-[0.8125rem] text-white font-medium">{user?.name}</p>
                    <p className="text-[0.7rem] text-[#666]">{user?.email}</p>
                  </div>
                  <button onClick={() => { setUserMenuOpen(false); setActiveSection('settings'); }} className="w-full flex items-center gap-2 px-4 py-2 text-[0.75rem] text-[#A0A0A0] hover:text-white hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                    <User size={14} /> Profile
                  </button>
                  <button onClick={() => { setUserMenuOpen(false); setActiveSection('settings'); }} className="w-full flex items-center gap-2 px-4 py-2 text-[0.75rem] text-[#A0A0A0] hover:text-white hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                    <Settings size={14} /> Settings
                  </button>
                  <div className="border-t border-[rgba(255,255,255,0.06)] mt-1 pt-1">
                    <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center gap-2 px-4 py-2 text-[0.75rem] text-[#E63946] hover:bg-[rgba(230,57,70,0.05)] transition-colors">
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-[1400px] mx-auto">
            {renderModule()}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-[1050] lg:hidden" onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}
