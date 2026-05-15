// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Download, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

/* ──────────────── Sample data ──────────────── */
const generateSalesData = () => {
  const data = [];
  const baseDate = new Date(2025, 5, 1);
  for (let i = 0; i < 90; i++) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() + i);
    const orders = Math.floor(Math.random() * 50) + 5;
    const avgItems = Math.floor(Math.random() * 5) + 1;
    const subtotal = orders * (Math.floor(Math.random() * 2000) + 500);
    const tax = Math.round(subtotal * 0.18);
    data.push({
      date: d.toISOString().split('T')[0],
      orders,
      products: orders * avgItems,
      tax,
      total: subtotal + tax,
    });
  }
  return data;
};

const generateProductsData = () => {
  const names = [
    ['Wireless Earbuds Pro', 'WE-2025'],
    ['Smart Watch Ultra', 'SW-U50'],
    ['Bluetooth Speaker', 'BS-360'],
    ['Gaming Mouse RGB', 'GM-RGB'],
    ['Mechanical Keyboard', 'MK-75%'],
    ['USB-C Hub 7-in-1', 'UC-HUB7'],
    ['Laptop Stand Aluminum', 'LS-ALU'],
    ['Noise Cancel Headphones', 'NC-900'],
    ['Portable SSD 1TB', 'PS-1TB'],
    ['Wireless Charger Pad', 'WC-PAD'],
    ['Phone Case Premium', 'PC-PRO'],
    ['Tablet Stand Foldable', 'TS-FOLD'],
    ['LED Desk Lamp', 'LED-DL'],
    ['Webcam HD 1080p', 'CAM-1080'],
    ['Power Bank 20000mAh', 'PB-20K'],
  ];
  return names.map(([name, model], i) => ({
    id: i + 1,
    name,
    model,
    views: Math.floor(Math.random() * 5000) + 200,
    quantitySold: Math.floor(Math.random() * 800) + 10,
    total: Math.floor(Math.random() * 500000) + 5000,
  }));
};

const generateCustomersData = () => {
  const firstNames = ['Aarav', 'Vihaan', 'Aditya', 'Vivaan', 'Arjun', 'Sai', 'Ayaan', 'Krishna', 'Ishaan', 'Dhruv', 'Aaradhya', 'Diya', 'Saanvi', 'Ananya', 'Navya'];
  const lastNames = ['Patel', 'Shah', 'Mehta', 'Gupta', 'Kumar', 'Singh', 'Reddy', 'Nair', 'Iyer', 'Desai', 'Joshi', 'Rao', 'Malhotra', 'Kapoor', 'Verma'];
  const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
  return firstNames.map((first, i) => {
    const last = lastNames[i % lastNames.length];
    const domain = domains[i % domains.length];
    const orders = Math.floor(Math.random() * 50) + 1;
    return {
      id: i + 1,
      name: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${domain}`,
      orders,
      total: orders * (Math.floor(Math.random() * 5000) + 500),
    };
  });
};

const salesData = generateSalesData();
const productsData = generateProductsData();
const customersData = generateCustomersData();

/* ──────────────── Helpers ──────────────── */
const formatCurrency = (amount) => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
};

const exportCSV = (rows, filename) => {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(','), ...rows.map((row) => headers.map((h) => `"${row[h]}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const groupSalesData = (data, groupBy) => {
  const grouped = {};
  data.forEach((row) => {
    const date = new Date(row.date);
    let key;
    switch (groupBy) {
      case 'Week':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
        break;
      case 'Month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'Year':
        key = String(date.getFullYear());
        break;
      default:
        key = row.date;
    }
    if (!grouped[key]) {
      grouped[key] = { date: key, orders: 0, products: 0, tax: 0, total: 0 };
    }
    grouped[key].orders += row.orders;
    grouped[key].products += row.products;
    grouped[key].tax += row.tax;
    grouped[key].total += row.total;
  });
  return Object.values(grouped).sort((a, b) => (a.date > b.date ? 1 : -1));
};

/* ──────────────── Summary Card ──────────────── */
const SummaryCard = ({ title, value, subtitle }) => (
  <div className="bg-[#111] border border-white/10 rounded-lg p-4 flex-1">
    <p className="text-xs text-gray-400 mb-1">{title}</p>
    <p className="text-xl font-semibold text-white">{value}</p>
    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

/* ──────────────── Pagination ──────────────── */
const usePagination = (data, pageSize = 15) => {
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [data.length]);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const paginated = data.slice((page - 1) * pageSize, page * pageSize);
  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));
  return { page, totalPages, paginated, goTo };
};

const Pagination = ({ page, totalPages, goTo, totalItems }) => (
  <div className="flex items-center justify-between mt-4">
    <p className="text-xs text-gray-500">
      Showing {(page - 1) * 15 + 1} - {Math.min(page * 15, totalItems)} of {totalItems}
    </p>
    <div className="flex items-center gap-1">
      <button
        onClick={() => goTo(page - 1)}
        disabled={page === 1}
        className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let p;
        if (totalPages <= 5) {
          p = i + 1;
        } else if (page <= 3) {
          p = i + 1;
        } else if (page >= totalPages - 2) {
          p = totalPages - 4 + i;
        } else {
          p = page - 2 + i;
        }
        return (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={`w-8 h-8 text-xs rounded transition-colors ${
              page === p ? 'bg-[#D4AF37] text-black font-medium' : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {p}
          </button>
        );
      })}
      <button
        onClick={() => goTo(page + 1)}
        disabled={page === totalPages}
        className="p-1.5 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

/* ──────────────── Date Filter Bar ──────────────── */
const DateFilterBar = ({ from, to, onFromChange, onToChange, onFilter, groupBy, onGroupChange, groupOptions }) => (
  <div className="flex flex-wrap items-end gap-3 mb-4">
    <div>
      <label className="block text-xs text-gray-400 mb-1">From</label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="date"
          value={from}
          onChange={(e) => onFromChange(e.target.value)}
          className="bg-white/[0.06] border border-white/[0.12] text-white text-sm pl-9 pr-3 py-2 outline-none focus:border-[#D4AF37] rounded"
        />
      </div>
    </div>
    <div>
      <label className="block text-xs text-gray-400 mb-1">To</label>
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="date"
          value={to}
          onChange={(e) => onToChange(e.target.value)}
          className="bg-white/[0.06] border border-white/[0.12] text-white text-sm pl-9 pr-3 py-2 outline-none focus:border-[#D4AF37] rounded"
        />
      </div>
    </div>
    {groupOptions && (
      <div>
        <label className="block text-xs text-gray-400 mb-1">Group By</label>
        <select
          value={groupBy}
          onChange={(e) => onGroupChange(e.target.value)}
          className="bg-white/[0.06] border border-white/[0.12] text-white text-sm px-3 py-2 outline-none focus:border-[#D4AF37] rounded appearance-none cursor-pointer min-w-[120px]"
        >
          {groupOptions.map((opt) => (
            <option key={opt} value={opt} className="bg-[#1a1a1a]">{opt}</option>
          ))}
        </select>
      </div>
    )}
    <button
      onClick={onFilter}
      className="bg-white/[0.08] border border-white/20 text-white text-sm px-4 py-2 rounded hover:bg-white/[0.12] transition-colors"
    >
      Filter
    </button>
  </div>
);

/* ═══════════════════════════════════════════════════
   REPORTS COMPONENT
   ═══════════════════════════════════════════════════ */
export default function Reports({ section = 'reports-sales' }) {
  const [from, setFrom] = useState('2025-06-01');
  const [to, setTo] = useState('2025-08-31');
  const [groupBy, setGroupBy] = useState('Day');
  const [filteredData, setFilteredData] = useState([]);

  const reportType = section;

  /* ── filter logic ── */
  const applyFilter = () => {
    const fTime = new Date(from).getTime();
    const tTime = new Date(to).getTime();
    if (reportType === 'reports-sales') {
      const filtered = salesData.filter((r) => {
        const rt = new Date(r.date).getTime();
        return rt >= fTime && rt <= tTime;
      });
      setFilteredData(groupSalesData(filtered, groupBy));
    } else if (reportType === 'reports-products') {
      setFilteredData([...productsData]);
    } else if (reportType === 'reports-customers') {
      setFilteredData([...customersData]);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [reportType]);

  /* ── summaries ── */
  const salesSummary = useMemo(() => {
    if (reportType !== 'reports-sales') return null;
    const totalSales = filteredData.reduce((s, r) => s + r.total, 0);
    const totalOrders = filteredData.reduce((s, r) => s + r.orders, 0);
    const avgOrder = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
    return { totalSales, totalOrders, avgOrder };
  }, [filteredData, reportType]);

  const productsSummary = useMemo(() => {
    if (reportType !== 'reports-products') return null;
    const sortedByViews = [...filteredData].sort((a, b) => b.views - a.views);
    const sortedBySold = [...filteredData].sort((a, b) => b.quantitySold - a.quantitySold);
    return {
      mostViewed: sortedByViews[0],
      mostPurchased: sortedBySold[0],
      totalProducts: filteredData.length,
    };
  }, [filteredData, reportType]);

  const customersSummary = useMemo(() => {
    if (reportType !== 'reports-customers') return null;
    const sorted = [...filteredData].sort((a, b) => b.orders - a.orders);
    const totalRevenue = filteredData.reduce((s, r) => s + r.total, 0);
    return {
      topCustomer: sorted[0],
      totalCustomers: filteredData.length,
      totalRevenue,
    };
  }, [filteredData, reportType]);

  /* ── pagination ── */
  const { page, totalPages, paginated, goTo } = usePagination(filteredData);

  /* ── export ── */
  const handleExport = () => {
    if (reportType === 'reports-sales') {
      exportCSV(filteredData, `sales_report_${from}_${to}.csv`);
    } else if (reportType === 'reports-products') {
      exportCSV(filteredData, 'products_report.csv');
    } else {
      exportCSV(filteredData, 'customers_report.csv');
    }
  };

  /* ── render helpers ── */
  const getTitle = () => {
    switch (reportType) {
      case 'reports-sales': return 'Sales Report';
      case 'reports-products': return 'Products Report';
      case 'reports-customers': return 'Customers Report';
      default: return 'Report';
    }
  };

  const getSubtitle = () => {
    switch (reportType) {
      case 'reports-sales': return 'Analyze sales performance over a selected date range';
      case 'reports-products': return 'Track product views and sales performance';
      case 'reports-customers': return 'Monitor customer activity and order history';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white">{getTitle()}</h1>
            <p className="text-sm text-gray-400 mt-1">{getSubtitle()}</p>
          </div>
          <button
            onClick={handleExport}
            className="bg-white/[0.08] border border-white/20 text-white text-sm px-4 py-2 rounded hover:bg-white/[0.12] transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>

        {/* Date Filter */}
        <DateFilterBar
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
          onFilter={applyFilter}
          groupBy={groupBy}
          onGroupChange={setGroupBy}
          groupOptions={reportType === 'reports-sales' ? ['Day', 'Week', 'Month', 'Year'] : null}
        />

        {/* ══════════ SALES REPORT ══════════ */}
        {reportType === 'reports-sales' && (
          <>
            {salesSummary && (
              <div className="flex gap-4 mb-6">
                <SummaryCard title="Total Sales" value={formatCurrency(salesSummary.totalSales)} subtitle={`₹${salesSummary.totalSales.toLocaleString('en-IN')}`} />
                <SummaryCard title="No. of Orders" value={salesSummary.totalOrders.toLocaleString('en-IN')} subtitle="Across selected period" />
                <SummaryCard title="Average Order Value" value={formatCurrency(salesSummary.avgOrder)} subtitle={`₹${salesSummary.avgOrder.toLocaleString('en-IN')} per order`} />
              </div>
            )}
            <div className="bg-[#111] border border-white/10 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Date</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">No. of Orders</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">No. of Products</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Tax (₹)</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No data available for the selected range.</td>
                      </tr>
                    ) : (
                      paginated.map((row, idx) => (
                        <tr key={idx} className="border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors">
                          <td className="px-4 py-3 text-sm text-white">{row.date}</td>
                          <td className="px-4 py-3 text-sm text-gray-300 text-right">{row.orders}</td>
                          <td className="px-4 py-3 text-sm text-gray-300 text-right">{row.products}</td>
                          <td className="px-4 py-3 text-sm text-gray-300 text-right">₹{row.tax.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 text-sm text-white font-medium text-right">₹{row.total.toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination page={page} totalPages={totalPages} goTo={goTo} totalItems={filteredData.length} />
          </>
        )}

        {/* ══════════ PRODUCTS REPORT ══════════ */}
        {reportType === 'reports-products' && (
          <>
            {productsSummary && (
              <div className="flex gap-4 mb-6">
                <SummaryCard title="Total Products" value={productsSummary.totalProducts} subtitle="In catalog" />
                <SummaryCard title="Most Viewed" value={productsSummary.mostViewed?.name || '—'} subtitle={`${productsSummary.mostViewed?.views?.toLocaleString('en-IN') || 0} views`} />
                <SummaryCard title="Most Purchased" value={productsSummary.mostPurchased?.name || '—'} subtitle={`${productsSummary.mostPurchased?.quantitySold?.toLocaleString('en-IN') || 0} sold`} />
              </div>
            )}
            <div className="bg-[#111] border border-white/10 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Product Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Model</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Views</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Qty Sold</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Total (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No product data available.</td>
                      </tr>
                    ) : (
                      paginated.map((row) => (
                        <tr key={row.id} className="border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors">
                          <td className="px-4 py-3 text-sm text-white font-medium">{row.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-400 font-mono">{row.model}</td>
                          <td className="px-4 py-3 text-sm text-gray-300 text-right">{row.views.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 text-sm text-gray-300 text-right">{row.quantitySold.toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 text-sm text-white font-medium text-right">₹{row.total.toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination page={page} totalPages={totalPages} goTo={goTo} totalItems={filteredData.length} />
          </>
        )}

        {/* ══════════ CUSTOMERS REPORT ══════════ */}
        {reportType === 'reports-customers' && (
          <>
            {customersSummary && (
              <div className="flex gap-4 mb-6">
                <SummaryCard title="Total Customers" value={customersSummary.totalCustomers.toLocaleString('en-IN')} subtitle="Registered users" />
                <SummaryCard title="Top Customer" value={customersSummary.topCustomer?.name || '—'} subtitle={`${customersSummary.topCustomer?.orders || 0} orders`} />
                <SummaryCard title="Total Revenue" value={formatCurrency(customersSummary.totalRevenue)} subtitle={`₹${customersSummary.totalRevenue.toLocaleString('en-IN')}`} />
              </div>
            )}

            {/* Top Customers by Order Count */}
            <div className="bg-[#111] border border-white/10 rounded-lg overflow-hidden mb-6">
              <div className="px-4 py-3 border-b border-white/10">
                <h3 className="text-sm font-medium text-white">Top Customers by Order Count</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Rank</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Customer Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Email</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">No. of Orders</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400">Total Spent (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No customer data available.</td>
                      </tr>
                    ) : (
                      paginated.map((row, idx) => (
                        <tr key={row.id} className="border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors">
                          <td className="px-4 py-3 text-sm text-gray-400">
                            {(page - 1) * 15 + idx + 1 <= 3 ? (
                              <span className={`inline-flex w-6 h-6 rounded-full items-center justify-center text-xs font-bold ${
                                (page - 1) * 15 + idx + 1 === 1 ? 'bg-[#D4AF37]/20 text-[#D4AF37]' :
                                (page - 1) * 15 + idx + 1 === 2 ? 'bg-gray-400/20 text-gray-300' :
                                'bg-orange-500/20 text-orange-400'
                              }`}>
                                {(page - 1) * 15 + idx + 1}
                              </span>
                            ) : (
                              <span className="text-gray-500 ml-1">{(page - 1) * 15 + idx + 1}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-white font-medium">{row.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-400">{row.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-300 text-right">{row.orders}</td>
                          <td className="px-4 py-3 text-sm text-white font-medium text-right">₹{row.total.toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination page={page} totalPages={totalPages} goTo={goTo} totalItems={filteredData.length} />
          </>
        )}
      </div>
    </div>
  );
}
