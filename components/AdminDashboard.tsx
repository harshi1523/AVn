
import React, { useState } from "react";
import { useStore, Order, User } from "../lib/store";
import { Product } from "../lib/mockData";
import QuickViewModal from "./QuickViewModal";
import AddProductModal from "./AddProductModal";
import { generateInvoice } from "../lib/invoice";

export default function AdminDashboard() {
  const { user, finance, orders, tickets, allUsers, products: allProducts, logout, updateOrderStatus, updateTicketStatus, updateKYCStatus, deleteProduct, updateOrderNotes, updateUserStatus, addTicketMessage, updateTicketPriority, assignTicket } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'users' | 'financials' | 'support'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedKYCUser, setSelectedKYCUser] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin'>('all');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectionError, setRejectionError] = useState(false);
  const [viewingKYCHistory, setViewingKYCHistory] = useState<any>(null);

  // Support Tab State
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketStatusFilter, setTicketStatusFilter] = useState<'All' | 'Open' | 'In Progress' | 'Pending' | 'Resolved'>('All');
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState<'All' | 'Urgent' | 'High' | 'Medium' | 'Low'>('All');
  const [ticketSearchTerm, setTicketSearchTerm] = useState('');
  const [ticketReplyInput, setTicketReplyInput] = useState('');

  const handleNavigateToProduct = (id: string) => {
    console.log("Navigating to product:", id);
  };

  const allOrders = allUsers.flatMap(user => user.orders || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const allTickets = allUsers.flatMap(user => user.tickets || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [dateRange, setDateRange] = useState<'7d' | '30d' | '3m' | '6m' | '12m' | 'custom'>('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // 1. Determine Date Range
  const getDateRangeStart = () => {
    if (dateRange === 'custom') return customStart ? new Date(customStart) : new Date(0);
    const now = new Date();
    if (dateRange === '7d') { const d = new Date(now); d.setDate(d.getDate() - 7); return d; }
    if (dateRange === '30d') { const d = new Date(now); d.setDate(d.getDate() - 30); return d; }
    if (dateRange === '3m') { const d = new Date(now); d.setMonth(d.getMonth() - 3); return d; }
    if (dateRange === '6m') { const d = new Date(now); d.setMonth(d.getMonth() - 6); return d; }
    if (dateRange === '12m') { const d = new Date(now); d.setFullYear(d.getFullYear() - 1); return d; }
    return new Date(0);
  };

  const startDate = getDateRangeStart();
  const endDate = dateRange === 'custom' && customEnd ? new Date(customEnd) : new Date();

  // Ensure endDate includes the full day if it's today or custom date (set to end of day)
  endDate.setHours(23, 59, 59, 999);

  // 2. Filter Products (for Inventory)
  const filteredProducts = allProducts.filter(p => {
    if (!searchTerm) return true;
    const query = searchTerm.toLowerCase();
    const keywords = query.split(/\s+/);
    const searchableText = `${p.name} ${p.id} ${p.brand} ${p.category || ''} ${p.availability || ''}`.toLowerCase();
    return keywords.every(kw => searchableText.includes(kw));
  });

  const [filterStatus, setFilterStatus] = useState<Order['status'] | 'All'>('All');

  // 3. Filter Orders
  const filteredOrders = allOrders.filter(o => {
    const d = new Date(o.date);
    const matchesDate = d >= startDate && d <= endDate;
    const matchesStatus = filterStatus === 'All' || o.status === 'Completed' && filterStatus === 'Delivered' ? true : o.status === filterStatus; // Handle Completed/Delivered mapping if needed? No, exact match is better.
    // Actually, let's stick to exact match for simplicity first. 
    // Wait, 'Completed' and 'Delivered' are distinct?
    // In types.ts: 'Placed' | 'Awaiting Delivery' | 'In Transit' | 'Delivered' | 'In Use' | 'Returning' | 'Inspection' | 'Completed' | 'Cancelled'

    return matchesDate && (filterStatus === 'All' || o.status === filterStatus);
  });

  // 3. Filter Tickets
  const filteredTickets = tickets.filter(t => {
    const d = new Date(t.date);
    return d >= startDate && d <= endDate;
  });

  // 4. Calculate Stats
  // Total Revenue
  const calculatedRevenue = filteredOrders
    .filter(o => o.status === 'Completed' || o.status === 'Delivered')
    .reduce((acc, order) => acc + (order.total || 0), 0);

  // Growth (vs Previous Period)
  const duration = endDate.getTime() - startDate.getTime();
  const previousEndDate = new Date(startDate);
  const previousStartDate = new Date(startDate.getTime() - duration);

  const previousOrders = allOrders.filter(o => {
    const d = new Date(o.date);
    return d >= previousStartDate && d < previousEndDate;
  });

  const previousRevenue = previousOrders
    .filter(o => o.status === 'Completed' || o.status === 'Delivered')
    .reduce((acc, order) => acc + (order.total || 0), 0);

  const growthPercentage = previousRevenue === 0
    ? (calculatedRevenue > 0 ? 100 : 0)
    : ((calculatedRevenue - previousRevenue) / previousRevenue) * 100;

  // Active Rentals (As of endDate)
  const activeRentalsCount = allOrders.filter(o => {
    // Check for rental items
    if (o.items.some(i => i.type === 'rent')) {
      // If we have rental dates, check overlap with endDate
      if (o.rentalStartDate && o.rentalEndDate) {
        const start = new Date(o.rentalStartDate);
        const end = new Date(o.rentalEndDate);
        // Active if start <= endDate AND end >= endDate
        return start <= endDate && end >= endDate;
      }
      // Fallback to status if dates missing
      return (o.status === 'Active Rental' || o.status === 'In Use');
    }
    return false;
  }).length;


  const stats = [
    { label: 'Total Revenue', value: `₹${(calculatedRevenue / 1000000).toFixed(2)}M`, icon: 'payments' },
    { label: 'Growth', value: `${growthPercentage >= 0 ? '+' : ''}${growthPercentage.toFixed(1)}%`, icon: 'trending_up' },
    { label: 'Active Rentals', value: activeRentalsCount, icon: 'laptop_mac' },
    { label: 'Active Returns', value: allOrders.filter(o => o.status === 'Return Requested').length, icon: 'assignment_return' },
    { label: 'Support Tickets', value: filteredTickets.filter(t => t.status !== 'Resolved').length, icon: 'contact_support' },
  ];

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
      {/* Mobile Menu logic ... */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-6 left-6 z-50 w-12 h-12 bg-brand-card/80 backdrop-blur-md border border-brand-border rounded-xl flex items-center justify-center text-white shadow-lg"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm animate-in fade-in duration-300"
        />
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar ... */}
        {/* ... Sidebar code unchanged ... */}
        <div className={`
          fixed inset-y-0 left-0 z-50 w-[280px] lg:w-72 bg-brand-page lg:bg-transparent transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex-shrink-0 p-6 lg:p-0 h-full lg:h-auto overflow-y-auto lg:overflow-visible border-r border-brand-border lg:border-none
          ${isMobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'}
        `}>
          <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-8 mb-6 shadow-2xl relative">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden absolute top-6 right-6 text-gray-400 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <div className="flex items-center gap-4 mb-12">
              <div className="w-16 h-16 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-brand-primary font-display font-bold text-3xl shadow-inner border border-brand-primary/10">
                V
              </div>
              <div>
                <h3 className="text-white font-bold text-sm">AvN Admin</h3>
                <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] mt-1">Dashboard</p>
              </div>
            </div>

            <nav className="flex flex-col gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: 'dashboard' },
                { id: 'inventory', label: 'Inventory', icon: 'inventory_2' },
                { id: 'orders', label: 'Orders', icon: 'local_shipping' },
                { id: 'financials', label: 'Financials', icon: 'payments' },
                { id: 'users', label: 'Users & KYC', icon: 'group' },
                { id: 'support', label: 'Support Tickets', icon: 'confirmation_number' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id as any); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black transition-all ${activeTab === tab.id ? 'bg-white text-black' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <button onClick={logout} className="w-full bg-brand-card border border-brand-border text-red-400 hover:bg-red-400/10 py-5 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3">
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>

        {/* Admin Content Area */}
        <div className="flex-1 mt-16 lg:mt-0">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-8 lg:mb-10 gap-4">
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-white tracking-tighter capitalize">
              AvN {activeTab}
            </h1>

            {(activeTab === 'overview' || activeTab === 'financials') && (
              <div className="flex flex-wrap items-center gap-4">
                {dateRange === 'custom' && (
                  <div className="flex items-center gap-2 bg-black/40 border border-brand-border rounded-xl px-2">
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="bg-transparent text-gray-400 text-xs p-2 focus:outline-none"
                      placeholder="Start"
                    />
                    <span className="text-gray-600">-</span>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="bg-transparent text-gray-400 text-xs p-2 focus:outline-none"
                      placeholder="End"
                    />
                  </div>
                )}
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="bg-black/40 border border-brand-border rounded-xl text-sm text-gray-400 px-4 py-2 focus:outline-none focus:border-brand-primary cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <option value="7d" style={{ backgroundColor: 'white', color: 'black' }}>Last 7 Days</option>
                  <option value="30d" style={{ backgroundColor: 'white', color: 'black' }}>Last 30 Days</option>
                  <option value="3m" style={{ backgroundColor: 'white', color: 'black' }}>Last 3 Months</option>
                  <option value="6m" style={{ backgroundColor: 'white', color: 'black' }}>Last 6 Months</option>
                  <option value="12m" style={{ backgroundColor: 'white', color: 'black' }}>Last 12 Months</option>
                  <option value="custom" style={{ backgroundColor: 'white', color: 'black' }}>Custom Range</option>
                </select>
              </div>
            )}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-8 lg:space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-brand-card border border-brand-border p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-xl" data-testid={`stat-card-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-white border border-white/5">
                      <span className="material-symbols-outlined text-[20px] lg:text-[22px]">{stat.icon}</span>
                    </div>
                    <p className="text-[9px] lg:text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-2">{stat.label}</p>
                    <p className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tighter" data-testid={`stat-value-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-brand-card border border-brand-border rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 shadow-2xl" data-testid="sales-chart-container">
                <h3 className="text-xl lg:text-2xl font-display font-bold text-white mb-8 lg:mb-12">
                  Sales Growth ({dateRange === 'custom' ? 'Custom Range' : dateRange === '7d' ? 'Last 7 Days' : dateRange === '30d' ? 'Last 30 Days' : 'Monthly'})
                </h3>

                {/* Dynamic Sales Graph */}
                {(() => {
                  // Determine resolution based on duration
                  const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
                  const isDaily = dayDiff <= 31;

                  let chartData = [];
                  if (isDaily) {
                    // Generate daily buckets
                    for (let i = 0; i < dayDiff; i++) {
                      const d = new Date(startDate);
                      d.setDate(d.getDate() + i);
                      const label = `${d.getDate()}/${d.getMonth() + 1}`;
                      chartData.push({ date: d, label, value: 0 });
                    }
                  } else {
                    // Generate monthly buckets (approx)
                    const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
                    for (let i = 0; i < monthDiff; i++) {
                      const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
                      const label = d.toLocaleString('default', { month: 'short' });
                      chartData.push({ date: d, label, value: 0 });
                    }
                  }

                  // Aggregate Data
                  filteredOrders.forEach(order => {
                    if (order.status === 'Completed' || order.status === 'Delivered') {
                      const orderDate = new Date(order.date);
                      // Find bucket
                      const bucket = chartData.find(b => {
                        if (isDaily) {
                          return b.date.getDate() === orderDate.getDate() && b.date.getMonth() === orderDate.getMonth() && b.date.getFullYear() === orderDate.getFullYear();
                        } else {
                          return b.date.getMonth() === orderDate.getMonth() && b.date.getFullYear() === orderDate.getFullYear();
                        }
                      });
                      if (bucket) {
                        bucket.value += order.total;
                      }
                    }
                  });


                  const maxValue = Math.max(...chartData.map(d => d.value), 1000); // Minimum 1000 to avoid division by zero

                  return (
                    <>
                      <div className="h-56 lg:h-72 flex items-end justify-between gap-1 lg:gap-2 border-b border-white/10 pb-6 transition-all duration-500">
                        {chartData.map((data, i) => {
                          const heightPercentage = Math.max((data.value / maxValue) * 100, 5); // Min 5% height
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center group relative">
                              {/* Tooltip */}
                              <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-elevated border border-brand-border text-white text-xs p-2 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg">
                                {data.label} {isDaily ? '' : data.date.getFullYear()}: ₹{data.value.toLocaleString()}
                              </div>
                              <div
                                className="w-full bg-brand-primary/20 rounded-t-lg group-hover:bg-brand-primary transition-all duration-300 relative overflow-hidden"
                                style={{ height: `${heightPercentage}%` }}
                              >
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20"></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-6 text-[8px] lg:text-[9px] text-gray-500 font-black uppercase tracking-[0.5em]">
                        {chartData.map((data, i) => (
                          // Adaptive Label Hiding: Show max 12 labels approx
                          (chartData.length <= 12 || i % Math.ceil(chartData.length / 12) === 0) ? <span key={i}>{data.label}</span> : <span key={i}></span>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}


          {activeTab === 'orders' && (
            <div className="bg-brand-card border border-brand-border rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Order Management</h3>
                <div className="flex gap-4">
                  <button
                    onClick={() => setFilterStatus('Return Requested')}
                    className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors mr-2 font-bold"
                  >
                    Return Requests ({allOrders.filter(o => o.status === 'Return Requested').length})
                  </button>
                  {(filterStatus !== 'All' || dateRange !== '7d') && (
                    <button
                      onClick={() => { setFilterStatus('All'); setDateRange('7d'); }}
                      className="text-xs text-brand-primary hover:text-white transition-colors underline"
                    >
                      Clear Filters
                    </button>
                  )}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="bg-black/40 border border-brand-border rounded-xl text-xs text-gray-400 px-4 py-2 focus:outline-none focus:border-brand-primary cursor-pointer hover:bg-white/5 transition-colors"
                  >
                    <option value="All" style={{ backgroundColor: 'white', color: 'black' }}>All Statuses</option>
                    <option value="Placed" style={{ backgroundColor: 'white', color: 'black' }}>Placed</option>
                    <option value="Shipped" style={{ backgroundColor: 'white', color: 'black' }}>Shipped</option>
                    <option value="Delivered" style={{ backgroundColor: 'white', color: 'black' }}>Delivered</option>
                    <option value="In Use" style={{ backgroundColor: 'white', color: 'black' }}>In Use (Active Rentals)</option>
                    <option value="Return Requested" style={{ backgroundColor: 'white', color: 'black' }}>Return Requested</option>
                    <option value="Returned" style={{ backgroundColor: 'white', color: 'black' }}>Returned</option>
                    <option value="Completed" style={{ backgroundColor: 'white', color: 'black' }}>Completed</option>
                    <option value="Cancelled" style={{ backgroundColor: 'white', color: 'black' }}>Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {filteredOrders.length === 0 ? <p className="text-gray-500 text-center py-8">No orders found.</p> : filteredOrders.map(order => (
                  <div key={order.id} onClick={() => setSelectedOrder(order)} className="bg-white/5 rounded-2xl p-6 border border-white/5 cursor-pointer hover:bg-white/10 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-white font-bold">{order.userName}</p>
                        <p className="text-[10px] text-gray-500">{order.id}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{order.date}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${order.status === 'Completed' || order.status === 'Delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                            order.status === 'In Use' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                              'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                          }`}>
                          {order.status}
                        </span>
                        <span className="text-[9px] text-gray-400 bg-white/5 px-2 py-1 rounded">{order.items[0]?.type === 'rent' ? 'Rental' : 'Purchase'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/5 gap-2">
                      <p className="text-white font-bold">₹{order.total.toLocaleString()}</p>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          const btn = document.getElementById(`admin-mob-invoice-btn-${order.id}`);
                          if (btn) { btn.style.opacity = '0.5'; }
                          await generateInvoice(order, allUsers.find(u => u.id === order.userId) || null);
                          if (btn) { btn.style.opacity = '1'; }
                        }}
                        id={`admin-mob-invoice-btn-${order.id}`}
                        className="bg-white/5 hover:bg-white/10 p-2 rounded-lg text-gray-400 hover:text-white transition-colors ml-auto"
                        title="Download Invoice"
                      >
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto min-h-[500px]">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[9px] text-gray-500 font-black uppercase tracking-[0.1em] border-b border-white/5">
                      <th className="px-6 py-4 whitespace-nowrap">Order ID</th>
                      <th className="px-6 py-4 whitespace-nowrap">Date</th>
                      <th className="px-6 py-4 whitespace-nowrap">Customer</th>
                      <th className="px-6 py-4 whitespace-nowrap">Type</th>
                      <th className="px-6 py-4 whitespace-nowrap">Amount</th>
                      <th className="px-6 py-4 whitespace-nowrap">Payment</th>
                      <th className="px-6 py-4 whitespace-nowrap">Status</th>
                      <th className="px-6 py-4 text-right whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? <tr><td colSpan={8} className="text-center py-12 text-gray-500">No orders found for selected filters.</td></tr> : filteredOrders.map(order => (
                      <tr key={order.id} onClick={() => setSelectedOrder(order)} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group">
                        <td className="px-6 py-4 text-white font-mono text-xs">{order.id}</td>
                        <td className="px-6 py-4 text-gray-400 text-xs">{order.date}</td>
                        <td className="px-6 py-4">
                          <p className="text-white font-bold text-xs">{order.userName}</p>
                          <p className="text-[10px] text-gray-500">{order.userEmail}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${order.items[0]?.type === 'rent' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                            {order.items[0]?.type === 'rent' ? 'Rental' : 'Buy'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white font-bold text-sm">₹{order.total.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold uppercase ${order.paymentStatus === 'Paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                            {order.paymentStatus || 'Paid'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${order.status === 'Completed' || order.status === 'Delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                            order.status === 'Cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                              order.status === 'In Use' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-2 text-right">
                            <button
                              onClick={async () => {
                                const btn = document.getElementById(`admin-invoice-btn-${order.id}`);
                                if (btn) { btn.style.opacity = '0.5'; }
                                await generateInvoice(order, allUsers.find(u => u.id === order.userId) || null);
                                if (btn) { btn.style.opacity = '1'; }
                              }}
                              id={`admin-invoice-btn-${order.id}`}
                              className="bg-white/5 hover:bg-white/10 p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
                              title="Download Invoice"
                            >
                              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                            </button>
                            <select
                              onChange={(e) => {
                                const newStatus = e.target.value as any;
                                if (newStatus === 'Shipped') {
                                  const courier = prompt("Enter Courier Name:");
                                  const tracking = prompt("Enter Tracking Number:");
                                  if (courier && tracking) {
                                    updateOrderStatus(order.id, newStatus, { courier, trackingNumber: tracking });
                                  } else {
                                    alert("Tracking info is required for Shipped status.");
                                  }
                                } else {
                                  updateOrderStatus(order.id, newStatus);
                                }
                              }}
                              className="bg-black/40 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-400 p-2 focus:outline-none focus:border-brand-primary"
                              value={order.status}
                            >
                              <option value="Placed" style={{ backgroundColor: 'white', color: 'black' }}>Placed</option>
                              <option value="Processing" style={{ backgroundColor: 'white', color: 'black' }}>Processing</option>
                              <option value="Shipped" style={{ backgroundColor: 'white', color: 'black' }}>Shipped</option>
                              <option value="Delivered" style={{ backgroundColor: 'white', color: 'black' }}>Delivered</option>
                              {/* Rental Specific */}
                              {order.items.some(i => i.type === 'rent') && (
                                <>
                                  <option value="In Use" style={{ backgroundColor: 'white', color: 'black' }}>In Use (Active)</option>
                                  <option value="Return Requested" style={{ backgroundColor: 'white', color: 'black' }}>Return Requested</option>
                                  <option value="Returned" style={{ backgroundColor: 'white', color: 'black' }}>Returned</option>
                                </>
                              )}
                              <option value="Completed" style={{ backgroundColor: 'white', color: 'black' }}>Completed</option>
                              <option value="Cancelled" style={{ backgroundColor: 'white', color: 'black' }}>Cancelled</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Detail Modal */}
              {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}>
                  <div className="bg-dark-modal border border-white/10 rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                    <div className="p-8 border-b border-white/5 flex justify-between items-start sticky top-0 bg-dark-modal/95 backdrop-blur z-10">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Order Details</h2>
                        <p className="text-sm text-gray-500 font-mono">#{selectedOrder.id}</p>
                      </div>
                      <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* Customer & Delivery */}
                      <div className="space-y-6">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                          <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-4">Customer Info</h4>
                          <div className="space-y-2">
                            <p className="text-white font-bold text-lg">{selectedOrder.userName}</p>
                            <p className="text-gray-400 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-base">mail</span> {selectedOrder.userEmail}</p>
                            <p className="text-gray-400 text-sm flex items-center gap-2"><span className="material-symbols-outlined text-base">call</span> {allUsers.find(u => u.id === selectedOrder.userId)?.addresses?.[0]?.phone || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                          <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-4">Delivery Details</h4>
                          <div className="space-y-2">
                            <p className="text-gray-300 text-sm leading-relaxed">{selectedOrder.address}</p>
                            <div className="mt-4 flex gap-4">
                              <div className="text-center bg-black/40 p-3 rounded-xl border border-white/5 flex-1">
                                <p className="text-[10px] text-gray-500 uppercase">Method</p>
                                <p className="text-white font-bold">{selectedOrder.deliveryMethod === 'pickup' ? 'Store Pickup' : 'Home Delivery'}</p>
                              </div>
                              <div className="text-center bg-black/40 p-3 rounded-xl border border-white/5 flex-1">
                                <p className="text-[10px] text-gray-500 uppercase">Status</p>
                                <p className="text-brand-primary font-bold">{selectedOrder.status}</p>
                              </div>
                            </div>
                            {selectedOrder.trackingInfo && (
                              <div className="mt-2 bg-brand-primary/10 p-3 rounded-xl border border-brand-primary/20">
                                <p className="text-[10px] text-brand-primary uppercase font-bold">Tracking Info</p>
                                <p className="text-white text-xs mt-1">{selectedOrder.trackingInfo.courier}: {selectedOrder.trackingInfo.trackingNumber}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Order Items & Summary */}
                      <div className="space-y-6">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                          <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-4">Ordered Items</h4>
                          <div className="space-y-4">
                            {selectedOrder.items.map((item, idx) => (
                              <div key={idx} className="flex gap-4 items-start pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                <div className="w-16 h-16 bg-white/5 rounded-xl p-2 flex-shrink-0">
                                  <img src={item.image} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-white font-bold text-sm">{item.name}</p>
                                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                  {item.type === 'rent' && (
                                    <div className="mt-1 flex gap-2">
                                      <span className="bg-purple-500/10 text-purple-400 text-[10px] px-2 py-0.5 rounded border border-purple-500/20">Rent: {item.tenure} Months</span>
                                    </div>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="text-white font-bold text-sm">₹{item.price.toLocaleString()}</p>
                                  {item.type === 'rent' && <p className="text-[10px] text-gray-500">/mo</p>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                          <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-4">Internal Notes</h4>
                          <div className="space-y-4 mb-4">
                            {selectedOrder.internalNotes?.map((note) => (
                              <div key={note.id} className="bg-black/30 p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <p className="text-xs text-brand-primary font-bold">{note.author}</p>
                                    <p className="text-[10px] text-gray-500">{new Date(note.date).toLocaleString()}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    {editingNoteId === note.id ? (
                                      <>
                                        <button
                                          onClick={() => {
                                            const updatedNotes = selectedOrder.internalNotes?.map(n =>
                                              n.id === note.id ? { ...n, content: editingNoteContent, date: new Date().toISOString() + ' (Edited)' } : n
                                            );
                                            updateOrderNotes(selectedOrder.id, updatedNotes);
                                            setSelectedOrder({ ...selectedOrder, internalNotes: updatedNotes });
                                            setEditingNoteId(null);
                                            setEditingNoteContent('');
                                          }}
                                          className="text-green-500 hover:text-green-400 transition-colors"
                                          title="Save"
                                        >
                                          <span className="material-symbols-outlined text-sm">check</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingNoteId(null);
                                            setEditingNoteContent('');
                                          }}
                                          className="text-gray-500 hover:text-white transition-colors"
                                          title="Cancel"
                                        >
                                          <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                      </>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => {
                                            setEditingNoteId(note.id);
                                            setEditingNoteContent(note.content);
                                          }}
                                          className="text-gray-500 hover:text-white transition-colors"
                                          title="Edit"
                                        >
                                          <span className="material-symbols-outlined text-sm">edit</span>
                                        </button>
                                        <button
                                          onClick={() => {
                                            if (confirm('Delete this note?')) {
                                              const updatedNotes = selectedOrder.internalNotes?.filter(n => n.id !== note.id);
                                              updateOrderNotes(selectedOrder.id, updatedNotes);
                                              setSelectedOrder({ ...selectedOrder, internalNotes: updatedNotes }); // Optimistic update
                                            }
                                          }}
                                          className="text-gray-500 hover:text-red-500 transition-colors"
                                          title="Delete"
                                        >
                                          <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                                {editingNoteId === note.id ? (
                                  <textarea
                                    value={editingNoteContent}
                                    onChange={(e) => setEditingNoteContent(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-brand-primary"
                                    rows={3}
                                  />
                                ) : (
                                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{note.content}</p>
                                )}
                              </div>
                            ))}
                            {(!selectedOrder.internalNotes || selectedOrder.internalNotes.length === 0) && (
                              <p className="text-sm text-gray-500 italic">No internal notes yet.</p>
                            )}
                          </div>
                        </div>

                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                          <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-4">Payment Summary</h4>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-400">
                              <span>Subtotal</span>
                              <span>₹{selectedOrder.total.toLocaleString()}</span>
                            </div>
                            {selectedOrder.depositAmount && (
                              <div className="flex justify-between text-gray-400">
                                <span>Security Deposit (Refundable)</span>
                                <span>₹{selectedOrder.depositAmount.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-gray-400">
                              <span>Delivery Fee</span>
                              <span>₹{selectedOrder.deliveryFee || 0}</span>
                            </div>
                            <div className="flex justify-between text-gray-400">
                              <span>Tax</span>
                              <span>₹{selectedOrder.tax || 0}</span>
                            </div>
                            <div className="pt-3 border-t border-white/10 flex justify-between items-center mt-2">
                              <span className="text-white font-bold">Total Paid</span>
                              <span className="text-xl font-bold text-brand-primary">₹{selectedOrder.total.toLocaleString()}</span>
                            </div>
                            {selectedOrder.transactionId && (
                              <p className="text-[10px] text-gray-500 text-center mt-4">Transaction ID: <span className="font-mono text-gray-300">{selectedOrder.transactionId}</span></p>
                            )}
                          </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 col-span-1 md:col-span-2">
                          <h4 className="text-xs font-black uppercase text-gray-500 tracking-widest mb-4">Order Timeline</h4>
                          <div className="space-y-4">
                            {selectedOrder.timeline?.map((event, idx) => (
                              <div key={idx} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                  <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                                  {idx !== (selectedOrder.timeline?.length || 0) - 1 && <div className="w-px h-full bg-white/10 my-1"></div>}
                                </div>
                                <div>
                                  <p className="text-sm text-white font-bold">{event.status}</p>
                                  <p className="text-[10px] text-gray-500">{new Date(event.date).toLocaleString()}</p>
                                  {event.note && <p className="text-[10px] text-gray-400 mt-1">{event.note}</p>}
                                </div>
                              </div>
                            ))}
                            {(!selectedOrder.timeline || selectedOrder.timeline.length === 0) && <p className="text-sm text-gray-500">No timeline data available.</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-8 relative z-10">
              <div className="flex flex-col md:flex-row gap-5 mb-10 justify-between items-center">
                <div className="relative w-full md:w-96">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">search</span>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border border-brand-border rounded-xl pl-12 pr-10 py-4 text-white focus:outline-none focus:border-brand-primary transition-all text-sm"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  )}
                </div>
                <button
                  onClick={() => { setEditingProduct(null); setIsAddProductOpen(true); }}
                  className="bg-cta-gradient hover:brightness-110 transition-all text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 w-full md:w-auto text-center cursor-pointer active:scale-95 shadow-lg"
                >
                  <span className="material-symbols-outlined">add</span> Add New Product
                </button>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-50">
                  <span className="material-symbols-outlined text-6xl mb-4">search_off</span>
                  <p className="text-xl font-bold text-white">No results found</p>
                  <p className="text-sm text-gray-400 mt-2">Try adjusting your search or filters</p>
                  <button onClick={() => setSearchTerm('')} className="mt-6 text-brand-primary font-bold uppercase tracking-widest text-[10px] hover:text-white transition-colors">
                    Clear Search
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(p => (
                    <div key={p.id} className="bg-brand-card border border-brand-border rounded-[2.5rem] p-8 shadow-xl group hover:border-brand-primary/50 transition-all">
                      <div
                        onClick={() => setSelectedProduct(p)}
                        className="aspect-[4/3] bg-black/40 rounded-[1.5rem] mb-6 p-6 flex items-center justify-center cursor-pointer hover:bg-black/60 transition-colors relative overflow-hidden"
                      >
                        <img src={p.image} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-[9px] font-black uppercase tracking-widest border border-white/20">Quick View</span>
                        </div>
                      </div>
                      <h3 className="text-white font-bold tracking-tight mb-2 truncate">{p.name}</h3>
                      <div className="flex gap-2 mb-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${p.status === 'AVAILABLE' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                          p.status === 'RENTED' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                            'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>{p.status || 'AVAILABLE'}</span>
                        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-white/5 text-gray-400 border border-white/10">
                          Qty: {p.stock ?? 0}
                        </span>
                        {!!p.deposit && (
                          <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase bg-white/5 text-gray-400 border border-white/10">
                            Dep: ₹{p.deposit.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-4 mt-6">
                        <button onClick={() => { setEditingProduct(p); setIsAddProductOpen(true); }} className="flex-1 bg-white/5 hover:bg-white/10 py-4 lg:py-3 rounded-xl text-[9px] font-black uppercase text-gray-400 hover:text-white transition-all cursor-pointer min-h-[44px] flex items-center justify-center">Edit</button>
                        <button onClick={() => {
                          // Check for active orders/rentals
                          const activeOrders = allUsers.flatMap(u => u.orders || []).filter(o =>
                            (o.status === 'Placed' || o.status === 'Shipped' || o.status === 'Active Rental' || o.status === 'In Use' || o.status === 'Awaiting Delivery') &&
                            o.items.some(i => i.productId === p.id)
                          );

                          let message = `Are you sure you want to delete "${p.name}"?`;
                          if (activeOrders.length > 0) {
                            message += `\n\nWARNING: This product is currently in ${activeOrders.length} ACTIVE order(s)/rental(s).\nDeleting it will NOT remove it from existing orders, but it will be removed from the catalog.`;
                          } else {
                            message += `\n\nThis action cannot be undone.`;
                          }

                          if (confirm(message)) {
                            deleteProduct(p.id)
                              .then(() => alert("Product deleted successfully"))
                              .catch(err => alert("Failed to delete product: " + err.message));
                          }
                        }} className="flex-1 bg-white/5 hover:bg-red-500/20 py-4 lg:py-3 rounded-xl text-[9px] font-black uppercase text-red-400/50 hover:text-red-400 transition-all cursor-pointer min-h-[44px] flex items-center justify-center">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


          {activeTab === 'financials' && (
            <div className="space-y-8">
              {/* Financial Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-brand-card border border-brand-border p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-bl-[100%] transition-transform group-hover:scale-110"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-brand-primary border border-white/5">
                      <span className="material-symbols-outlined text-[24px]">payments</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-2">Total Revenue</p>
                    <p className="text-3xl font-display font-bold text-white tracking-tighter">
                      ₹{(calculatedRevenue / 1000000).toFixed(2)}M
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      <span className={`${growthPercentage >= 0 ? 'text-green-400' : 'text-red-400'} font-bold`}>
                        {growthPercentage >= 0 ? '+' : ''}{growthPercentage.toFixed(1)}%
                      </span> vs last period
                    </p>
                  </div>
                </div>

                <div className="bg-brand-card border border-brand-border p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-bl-[100%] transition-transform group-hover:scale-110"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-purple-400 border border-white/5">
                      <span className="material-symbols-outlined text-[24px]">devices</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-2">Active Rental Value</p>
                    <p className="text-3xl font-display font-bold text-white tracking-tighter">
                      ₹{(activeRentalsCount * 5000 / 100000).toFixed(1)}L
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Estimated monthly recurring revenue from <span className="text-white font-bold">{activeRentalsCount}</span> active units</p>
                  </div>
                </div>

                <div className="bg-brand-card border border-brand-border p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-bl-[100%] transition-transform group-hover:scale-110"></div>
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-blue-400 border border-white/5">
                      <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                    </div>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-2">Avg. Order Value</p>
                    <p className="text-3xl font-display font-bold text-white tracking-tighter">
                      ₹{filteredOrders.length > 0 ? (calculatedRevenue / filteredOrders.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) : 0}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">Based on <span className="text-white font-bold">{filteredOrders.length}</span> orders in current period</p>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-8 shadow-xl">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
                  <button className="text-xs text-brand-primary hover:text-white transition-colors font-bold uppercase tracking-widest flex items-center gap-2">
                    View All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-[9px] text-gray-500 font-black uppercase tracking-[0.1em] border-b border-white/5">
                        <th className="px-6 py-4 whitespace-nowrap">Transaction ID</th>
                        <th className="px-6 py-4 whitespace-nowrap">Date</th>
                        <th className="px-6 py-4 whitespace-nowrap">User</th>
                        <th className="px-6 py-4 whitespace-nowrap">Type</th>
                        <th className="px-6 py-4 whitespace-nowrap">Amount</th>
                        <th className="px-6 py-4 whitespace-nowrap">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.slice(0, 10).map(order => (
                        <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-4 text-white font-mono text-xs">{order.transactionId || `TXN_${order.id.substring(0, 8)}`}</td>
                          <td className="px-6 py-4 text-gray-400 text-xs">{new Date(order.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-white text-xs font-bold">{order.userName}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${order.items[0]?.type === 'rent' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                              {order.items[0]?.type === 'rent' ? 'Rental' : 'Purchase'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-white font-bold text-sm">₹{order.total.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${order.paymentStatus === 'Paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                              }`}>
                              {order.paymentStatus || 'Paid'}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredOrders.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center py-12 text-gray-500">No transactions found for this period</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-6 lg:p-10 shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">User Management & KYC</h3>
                <div className="flex gap-4">
                  {/* Role/Status Filter */}
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value as any)} // Cast to any to accept new value
                    className="bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary cursor-pointer appearance-none"
                  >
                    <option value="all" style={{ backgroundColor: 'white', color: 'black' }}>All Users</option>
                    <option value="user" style={{ backgroundColor: 'white', color: 'black' }}>Customers Only</option>
                    <option value="admin" style={{ backgroundColor: 'white', color: 'black' }}>Admins Only</option>
                    <option value="pending_kyc" style={{ backgroundColor: 'white', color: 'black' }}>Pending KYC</option>
                  </select>

                  <div className="relative w-64">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">search</span>
                    <input
                      type="text"
                      placeholder="Search by Name, Email, ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] border-b border-white/5">
                      <th className="px-6 py-6 whitespace-nowrap">User</th>
                      <th className="px-6 py-6 whitespace-nowrap">Email</th>
                      <th className="px-6 py-6 whitespace-nowrap">Role</th>
                      <th className="px-6 py-6 whitespace-nowrap">Account Status</th>
                      <th className="px-6 py-6 whitespace-nowrap">KYC Status</th>
                      <th className="px-6 py-6 text-right whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers
                      .filter(u => {
                        const matchesSearch = !searchTerm ||
                          u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.addresses?.some(a => a.phone?.includes(searchTerm));

                        let matchesRole = true;
                        if (roleFilter === 'all') matchesRole = true;
                        else if (roleFilter === 'pending_kyc') matchesRole = u.kycStatus === 'pending';
                        else matchesRole = u.role === roleFilter;

                        return matchesSearch && matchesRole;
                      })
                      .sort((a, b) => {
                        // Sort by submission date if pending, oldest first
                        if (roleFilter === 'pending_kyc' && a.kycStatus === 'pending' && b.kycStatus === 'pending') {
                          return new Date(a.kycSubmissionDate || 0).getTime() - new Date(b.kycSubmissionDate || 0).getTime();
                        }
                        return 0;
                      })
                      .map(u => (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                          <td className="px-6 py-6 text-white font-bold">
                            {u.name}
                            {u.kycStatus === 'pending' && (
                              <div className="text-[9px] font-normal text-yellow-500 mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[10px]">warning</span>
                                {u.kycSubmissionDate ? `${Math.floor((Date.now() - new Date(u.kycSubmissionDate).getTime()) / (1000 * 60 * 60 * 24))} days pending` : 'Action Required'}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-6 text-gray-400 text-sm">{u.email}</td>
                          <td className="px-6 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${u.accountStatus === 'suspended' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                              {u.accountStatus || 'active'}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${u.kycStatus === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                              u.kycStatus === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                u.kycStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                  'bg-gray-500/10 text-gray-500 border-gray-500/20'
                              }`}>
                              {u.kycStatus || 'Not Submitted'}
                            </span>
                          </td>
                          <td className="px-6 py-6 text-right flex justify-end gap-2">
                            <button
                              onClick={() => setViewingUser(u)}
                              className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-all border border-brand-border"
                              title="View Profile"
                            >
                              <span className="material-symbols-outlined text-[18px]">visibility</span>
                            </button>
                            {u.kycStatus === 'pending' && (
                              <button
                                onClick={() => {
                                  console.log("Review button clicked for user:", u.id);
                                  setSelectedKYCUser(u);
                                }}
                                className="bg-purple-600 text-white hover:bg-purple-700 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-glow border border-purple-500"
                              >
                                Review Docs
                              </button>
                            )}
                            {u.kycStatus === 'approved' && (
                              <span className="text-gray-500 text-[10px] font-black uppercase flex items-center h-full">Verified</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    {allUsers.length === 0 && ( /* Fallback if no users loaded */
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No users found. (Ensure you are logged in as Admin and Firestore sync is active)</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-6 lg:p-10 shadow-2xl overflow-hidden">
              <h3 className="text-xl font-bold text-white mb-6">Support Tickets</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] border-b border-white/5">
                      <th className="px-6 py-6 whitespace-nowrap">ID</th>
                      <th className="px-6 py-6 whitespace-nowrap">Subject & Description</th>
                      <th className="px-6 py-6 whitespace-nowrap">Customer</th>
                      <th className="px-6 py-6 whitespace-nowrap">Date</th>
                      <th className="px-6 py-6 whitespace-nowrap">Status</th>
                      <th className="px-6 py-6 text-right whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allTickets.map(ticket => (
                      <tr key={ticket.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-6 text-white font-mono">{ticket.id}</td>
                        <td className="px-6 py-6 max-w-md">
                          <p className="text-white font-bold">{ticket.subject}</p>
                          <p className="text-gray-400 text-xs mt-1 truncate">{ticket.description}</p>
                        </td>
                        <td className="px-6 py-6">
                          <p className="text-white font-bold">{ticket.userName}</p>
                        </td>
                        <td className="px-6 py-6 text-gray-400 text-sm">{ticket.date}</td>
                        <td className="px-6 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${ticket.status === 'Open' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' :
                            ticket.status === 'Resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                              ticket.status === 'In Progress' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                            }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <select
                            value={ticket.status}
                            onChange={(e) => updateTicketStatus(ticket.id, e.target.value as any)}
                            className="bg-black/40 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-400 p-2 focus:outline-none focus:border-brand-primary"
                          >
                            <option value="Open" style={{ backgroundColor: 'white', color: 'black' }}>Open</option>
                            <option value="Pending" style={{ backgroundColor: 'white', color: 'black' }}>Pending</option>
                            <option value="In Progress" style={{ backgroundColor: 'white', color: 'black' }}>In Progress</option>
                            <option value="Resolved" style={{ backgroundColor: 'white', color: 'black' }}>Resolved</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {allTickets.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No tickets found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'financials' && (() => {
            // ── Date & order data already computed above (startDate, endDate, filteredOrders) ──
            const finOrders = allOrders.filter(o => {
              const d = new Date(o.date);
              return d >= startDate && d <= endDate;
            });

            const rentalOrders = finOrders.filter(o => o.items.some(i => i.type === 'rent'));
            const purchaseOrders = finOrders.filter(o => o.items.every(i => i.type === 'buy'));

            const totalRev = finOrders.reduce((s, o) => s + (o.total || 0), 0);
            const rentalRev = rentalOrders.reduce((s, o) => s + (o.total || 0), 0);
            const purchaseRev = purchaseOrders.reduce((s, o) => s + (o.total || 0), 0);
            const avgOrder = finOrders.length > 0 ? totalRev / finOrders.length : 0;

            // ── Revenue chart (same bucket logic as overview) ──
            const dayDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
            const isDaily = dayDiff <= 31;
            const chartBuckets: { label: string; date: Date; rental: number; purchase: number }[] = [];

            if (isDaily) {
              for (let i = 0; i < dayDiff; i++) {
                const d = new Date(startDate); d.setDate(d.getDate() + i);
                chartBuckets.push({ date: d, label: `${d.getDate()}/${d.getMonth() + 1}`, rental: 0, purchase: 0 });
              }
            } else {
              const monthDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth()) + 1;
              for (let i = 0; i < monthDiff; i++) {
                const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
                chartBuckets.push({ date: d, label: d.toLocaleString('default', { month: 'short' }), rental: 0, purchase: 0 });
              }
            }

            finOrders.forEach(order => {
              const od = new Date(order.date);
              const bucket = chartBuckets.find(b =>
                isDaily
                  ? b.date.getDate() === od.getDate() && b.date.getMonth() === od.getMonth() && b.date.getFullYear() === od.getFullYear()
                  : b.date.getMonth() === od.getMonth() && b.date.getFullYear() === od.getFullYear()
              );
              if (bucket) {
                if (order.items.some(i => i.type === 'rent')) bucket.rental += order.total || 0;
                else bucket.purchase += order.total || 0;
              }
            });

            const maxBucket = Math.max(...chartBuckets.map(b => b.rental + b.purchase), 1000);

            // ── CSV export ──
            const exportCSV = () => {
              const header = ['Date', 'Order ID', 'Customer', 'Email', 'Type', 'Amount (₹)', 'Payment Method', 'Status'];
              const rows = finOrders.map(o => [
                o.date,
                o.id,
                o.userName || '',
                o.userEmail || '',
                o.items.some(i => i.type === 'rent') ? 'Rental' : 'Purchase',
                o.total,
                o.paymentMethod || 'N/A',
                o.status
              ]);
              const csv = [header, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url;
              a.download = `financials_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
              a.click(); URL.revokeObjectURL(url);
            };

            return (
              <div className="space-y-8">
                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Total Revenue', value: `₹${totalRev.toLocaleString('en-IN')}`, icon: 'payments', color: 'text-brand-primary' },
                    { label: 'Rental Revenue', value: `₹${rentalRev.toLocaleString('en-IN')}`, icon: 'laptop_mac', color: 'text-purple-400' },
                    { label: 'Purchase Revenue', value: `₹${purchaseRev.toLocaleString('en-IN')}`, icon: 'shopping_cart', color: 'text-blue-400' },
                    { label: 'Avg. Order Value', value: `₹${Math.round(avgOrder).toLocaleString('en-IN')}`, icon: 'trending_up', color: 'text-green-400' },
                  ].map((kpi, i) => (
                    <div key={i} className="bg-brand-card border border-brand-border rounded-[2rem] p-8 shadow-xl flex flex-col gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center">
                        <span className={`material-symbols-outlined text-[22px] ${kpi.color}`}>{kpi.icon}</span>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-1">{kpi.label}</p>
                        <p className="text-3xl font-display font-bold text-white tracking-tighter">{kpi.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Revenue Bar Chart ── */}
                <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-8 lg:p-12 shadow-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 gap-4">
                    <div>
                      <h3 className="text-2xl font-display font-bold text-white">Revenue Breakdown</h3>
                      <p className="text-xs text-gray-500 mt-1">Rental vs Purchase</p>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-gray-400">
                      <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-brand-primary inline-block" /><span>Rental</span></span>
                      <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /><span>Purchase</span></span>
                    </div>
                  </div>
                  <div className="h-64 flex items-end justify-between gap-1 border-b border-white/10 pb-6">
                    {chartBuckets.map((b, i) => {
                      const rentalH = Math.max((b.rental / maxBucket) * 100, b.rental > 0 ? 5 : 0);
                      const purchaseH = Math.max((b.purchase / maxBucket) * 100, b.purchase > 0 ? 5 : 0);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                          <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-brand-elevated border border-brand-border text-white text-xs p-2 rounded pointer-events-none whitespace-nowrap z-10 shadow-lg">
                            <p className="font-bold">{b.label}</p>
                            {b.rental > 0 && <p className="text-brand-primary">Rental: ₹{b.rental.toLocaleString()}</p>}
                            {b.purchase > 0 && <p className="text-blue-400">Purchase: ₹{b.purchase.toLocaleString()}</p>}
                          </div>
                          {b.rental > 0 && (
                            <div className="w-full bg-brand-primary/30 group-hover:bg-brand-primary transition-all duration-300 rounded-t-sm" style={{ height: `${rentalH}%` }} />
                          )}
                          {b.purchase > 0 && (
                            <div className="w-full bg-blue-500/30 group-hover:bg-blue-500 transition-all duration-300 rounded-t-sm" style={{ height: `${purchaseH}%` }} />
                          )}
                          {b.rental === 0 && b.purchase === 0 && (
                            <div className="w-full bg-white/5 rounded-t-sm" style={{ height: '4%' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-4 text-[8px] lg:text-[9px] text-gray-500 font-black uppercase tracking-[0.5em]">
                    {chartBuckets.map((b, i) => (
                      (chartBuckets.length <= 12 || i % Math.ceil(chartBuckets.length / 12) === 0)
                        ? <span key={i}>{b.label}</span>
                        : <span key={i} />
                    ))}
                  </div>
                </div>

                {/* ── Transaction Table ── */}
                <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-8 lg:p-10 shadow-2xl overflow-hidden">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                      <h3 className="text-xl font-display font-bold text-white">Transactions</h3>
                      <p className="text-xs text-gray-500 mt-1">{finOrders.length} records in selected period</p>
                    </div>
                    <button
                      onClick={exportCSV}
                      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-brand-border text-gray-300 hover:text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      Export CSV
                    </button>
                  </div>

                  {finOrders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 opacity-40 gap-4">
                      <span className="material-symbols-outlined text-6xl">receipt_long</span>
                      <p className="text-white font-bold">No transactions in this period</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[9px] text-gray-500 font-black uppercase tracking-[0.3em] border-b border-white/5">
                            <th className="px-5 py-4">Date</th>
                            <th className="px-5 py-4">Order ID</th>
                            <th className="px-5 py-4">Customer</th>
                            <th className="px-5 py-4">Type</th>
                            <th className="px-5 py-4 text-right">Amount</th>
                            <th className="px-5 py-4">Payment</th>
                            <th className="px-5 py-4">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {finOrders.map(order => {
                            const isRental = order.items.some(i => i.type === 'rent');
                            return (
                              <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                                <td className="px-5 py-4 text-gray-400 text-xs whitespace-nowrap">{order.date}</td>
                                <td className="px-5 py-4 text-white font-mono text-xs">{order.id}</td>
                                <td className="px-5 py-4">
                                  <p className="text-white font-bold text-xs">{order.userName}</p>
                                  <p className="text-gray-500 text-[10px]">{order.userEmail}</p>
                                </td>
                                <td className="px-5 py-4">
                                  <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${isRental ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                    {isRental ? 'Rental' : 'Purchase'}
                                  </span>
                                </td>
                                <td className="px-5 py-4 text-right">
                                  <p className="text-white font-bold text-sm">₹{order.total.toLocaleString('en-IN')}</p>
                                </td>
                                <td className="px-5 py-4">
                                  <span className={`text-[10px] font-bold uppercase ${order.paymentStatus === 'Paid' || !order.paymentStatus ? 'text-green-400' : order.paymentStatus === 'Pending' ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {order.paymentMethod || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-5 py-4">
                                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${order.status === 'Completed' || order.status === 'Delivered'
                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                    : order.status === 'Cancelled'
                                      ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                      : order.status === 'In Use'
                                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                    }`}>
                                    {order.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {activeTab === 'support' && (() => {
            // Get all tickets from all users
            const allTickets = allUsers.flatMap(u =>
              (u.tickets || []).map(t => ({ ...t, userId: u.id, userName: u.name, customerEmail: u.email }))
            ).sort((a, b) => new Date(b.lastUpdated || b.date).getTime() - new Date(a.lastUpdated || a.date).getTime());

            // Apply filters
            let filteredTickets = allTickets;
            if (ticketStatusFilter !== 'All') {
              filteredTickets = filteredTickets.filter(t => t.status === ticketStatusFilter);
            }
            if (ticketPriorityFilter !== 'All') {
              filteredTickets = filteredTickets.filter(t => t.priority === ticketPriorityFilter);
            }
            if (ticketSearchTerm.trim()) {
              const search = ticketSearchTerm.toLowerCase();
              filteredTickets = filteredTickets.filter(t =>
                t.id.toLowerCase().includes(search) ||
                t.subject.toLowerCase().includes(search) ||
                (t.userName || '').toLowerCase().includes(search) ||
                (t.customerEmail || '').toLowerCase().includes(search)
              );
            }

            // Sort by priority (Urgent > High > Medium > Low) then by lastUpdated
            const priorityOrder = { 'Urgent': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
            filteredTickets.sort((a, b) => {
              const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
              if (priorityDiff !== 0) return priorityDiff;
              return new Date(b.lastUpdated || b.date).getTime() - new Date(a.lastUpdated || a.date).getTime();
            });

            return (
              <div className="space-y-6">
                {/* Header with Filters */}
                <div className="bg-brand-card border border-brand-border rounded-[2rem] p-6 shadow-xl">
                  <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Support Tickets</h3>
                    <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                      {/* Search */}
                      <input
                        type="text"
                        placeholder="Search tickets..."
                        value={ticketSearchTerm}
                        onChange={(e) => setTicketSearchTerm(e.target.value)}
                        className="flex-1 lg:flex-none lg:w-64 bg-black/40 border border-brand-border rounded-xl text-sm text-white px-4 py-2 focus:outline-none focus:border-brand-primary placeholder:text-gray-500"
                      />

                      {/* Status Filter */}
                      <select
                        value={ticketStatusFilter}
                        onChange={(e) => setTicketStatusFilter(e.target.value as any)}
                        className="bg-black/40 border border-brand-border rounded-xl text-xs text-gray-400 px-4 py-2 focus:outline-none focus:border-brand-primary cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <option value="All" style={{ backgroundColor: 'white', color: 'black' }}>All Statuses</option>
                        <option value="Open" style={{ backgroundColor: 'white', color: 'black' }}>Open</option>
                        <option value="In Progress" style={{ backgroundColor: 'white', color: 'black' }}>In Progress</option>
                        <option value="Pending" style={{ backgroundColor: 'white', color: 'black' }}>Pending</option>
                        <option value="Resolved" style={{ backgroundColor: 'white', color: 'black' }}>Resolved</option>
                      </select>

                      {/* Priority Filter */}
                      <select
                        value={ticketPriorityFilter}
                        onChange={(e) => setTicketPriorityFilter(e.target.value as any)}
                        className="bg-black/40 border border-brand-border rounded-xl text-xs text-gray-400 px-4 py-2 focus:outline-none focus:border-brand-primary cursor-pointer hover:bg-white/5 transition-colors"
                      >
                        <option value="All" style={{ backgroundColor: 'white', color: 'black' }}>All Priorities</option>
                        <option value="Urgent" style={{ backgroundColor: 'white', color: 'black' }}>Urgent</option>
                        <option value="High" style={{ backgroundColor: 'white', color: 'black' }}>High</option>
                        <option value="Medium" style={{ backgroundColor: 'white', color: 'black' }}>Medium</option>
                        <option value="Low" style={{ backgroundColor: 'white', color: 'black' }}>Low</option>
                      </select>

                      {/* Clear Filters */}
                      {(ticketStatusFilter !== 'All' || ticketPriorityFilter !== 'All' || ticketSearchTerm.trim()) && (
                        <button
                          onClick={() => {
                            setTicketStatusFilter('All');
                            setTicketPriorityFilter('All');
                            setTicketSearchTerm('');
                          }}
                          className="text-xs text-brand-primary hover:text-white transition-colors underline whitespace-nowrap"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider mb-1">Total</p>
                      <p className="text-2xl font-bold text-white">{allTickets.length}</p>
                    </div>
                    <div className="bg-red-500/10 rounded-xl p-4 border border-red-500/20">
                      <p className="text-[10px] text-red-400 font-black uppercase tracking-wider mb-1">Urgent</p>
                      <p className="text-2xl font-bold text-red-400">{allTickets.filter(t => t.priority === 'Urgent').length}</p>
                    </div>
                    <div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/20">
                      <p className="text-[10px] text-yellow-400 font-black uppercase tracking-wider mb-1">Open</p>
                      <p className="text-2xl font-bold text-yellow-400">{allTickets.filter(t => t.status === 'Open').length}</p>
                    </div>
                    <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                      <p className="text-[10px] text-green-400 font-black uppercase tracking-wider mb-1">Resolved</p>
                      <p className="text-2xl font-bold text-green-400">{allTickets.filter(t => t.status === 'Resolved').length}</p>
                    </div>
                  </div>
                </div>

                {/* Tickets Table */}
                <div className="bg-brand-card border border-brand-border rounded-[2rem] p-6 shadow-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-[9px] text-gray-500 font-black uppercase tracking-[0.1em] border-b border-white/5">
                          <th className="px-4 py-4 whitespace-nowrap">Ticket ID</th>
                          <th className="px-4 py-4 whitespace-nowrap">Customer</th>
                          <th className="px-4 py-4">Subject</th>
                          <th className="px-4 py-4 whitespace-nowrap">Priority</th>
                          <th className="px-4 py-4 whitespace-nowrap">Status</th>
                          <th className="px-4 py-4 whitespace-nowrap">Assigned To</th>
                          <th className="px-4 py-4 whitespace-nowrap">Created</th>
                          <th className="px-4 py-4 whitespace-nowrap">Last Updated</th>
                          <th className="px-4 py-4 text-right whitespace-nowrap">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTickets.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="text-center py-12 text-gray-500">
                              {allTickets.length === 0 ? 'No tickets yet' : 'No tickets match your filters'}
                            </td>
                          </tr>
                        ) : (
                          filteredTickets.map(ticket => (
                            <tr
                              key={ticket.id}
                              onClick={() => setSelectedTicket(ticket)}
                              className="border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                            >
                              <td className="px-4 py-4 text-white font-mono text-xs">{ticket.id}</td>
                              <td className="px-4 py-4">
                                <div>
                                  <p className="text-white text-sm font-bold">{ticket.userName}</p>
                                  <p className="text-gray-500 text-xs">{ticket.customerEmail}</p>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-gray-300 text-sm max-w-xs truncate">{ticket.subject}</td>
                              <td className="px-4 py-4">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${ticket.priority === 'Urgent' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                  ticket.priority === 'High' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                                    ticket.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                                      'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                  }`}>
                                  {ticket.priority}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase border ${ticket.status === 'Resolved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                  ticket.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                                    ticket.status === 'Pending' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                                      'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                  }`}>
                                  {ticket.status}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-gray-400 text-xs">
                                {ticket.assignedToName || <span className="text-gray-600 italic">Unassigned</span>}
                              </td>
                              <td className="px-4 py-4 text-gray-400 text-xs">{ticket.date}</td>
                              <td className="px-4 py-4 text-gray-400 text-xs">
                                {new Date(ticket.lastUpdated || ticket.date).toLocaleString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </td>
                              <td className="px-4 py-4 text-right">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedTicket(ticket);
                                  }}
                                  className="bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-brand-primary hover:text-white transition-all"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === 'settings' && (
            <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-10 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-white/10 mb-4">settings</span>
                <h3 className="text-xl font-bold text-white mb-2">System Settings</h3>
                <p className="text-gray-500 text-sm">Platform configuration and policy settings module coming soon.</p>
              </div>
            </div>
          )}

          <div className="mt-20 pt-10 border-t border-white/5 text-center lg:text-left">
            <p className="text-white/20 text-xs text font-bold">© 2026 AvN. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Product Modal */}
      {
        selectedProduct && (
          <QuickViewModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onNavigateToProduct={handleNavigateToProduct}
          />
        )
      }

      {/* Add Product Modal */}
      {
        isAddProductOpen && (
          <AddProductModal onClose={() => { setIsAddProductOpen(false); setEditingProduct(null); }} productToEdit={editingProduct} />
        )
      }

      {/* KYC Review Modal */}
      {
        selectedKYCUser && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-28 lg:pt-32">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedKYCUser(null)} />
            <div className="relative bg-brand-card border border-brand-border rounded-[2rem] p-8 w-full max-w-4xl shadow-2xl overflow-y-auto max-h-[85vh]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">KYC Verification</h3>
                  <p className="text-sm text-gray-500 mt-1">Review documents for <span className="text-white font-bold">{selectedKYCUser.name}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedKYCUser.kycHistory && selectedKYCUser.kycHistory.length > 0 && (
                    <button
                      onClick={() => setViewingKYCHistory(selectedKYCUser)}
                      className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-gray-400 hover:text-white transition-all border border-brand-border flex items-center gap-2"
                      title="View KYC History"
                    >
                      <span className="material-symbols-outlined text-[18px]">history</span>
                      <span className="text-xs font-bold uppercase tracking-wider">History</span>
                    </button>
                  )}
                  <button onClick={() => setSelectedKYCUser(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="bg-black/40 rounded-xl p-4 border border-white/10 relative group">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Front Side</p>
                    {selectedKYCUser.kycDocuments?.front && (
                      <a
                        href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/kyc-documents/${selectedKYCUser.kycDocuments.front}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
                        download
                      >
                        <span className="material-symbols-outlined text-sm">download</span> Download
                      </a>
                    )}
                  </div>
                  {selectedKYCUser.kycDocuments?.front ? (
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/kyc-documents/${selectedKYCUser.kycDocuments.front}`}
                        className="w-full h-auto rounded-lg cursor-zoom-in group-hover:scale-105 transition-transform duration-500"
                        alt="ID Front"
                        onClick={() => setZoomedImage(`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/kyc-documents/${selectedKYCUser.kycDocuments.front}`)}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                        <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined">zoom_in</span> Click to Zoom</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-600 italic">No document uploaded</div>
                  )}
                </div>
                <div className="bg-black/40 rounded-xl p-4 border border-white/10 relative group">
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Back Side</p>
                    {selectedKYCUser.kycDocuments?.back && (
                      <a
                        href={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/kyc-documents/${selectedKYCUser.kycDocuments.back}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-white transition-all flex items-center gap-1 text-[10px] font-bold uppercase"
                        download
                      >
                        <span className="material-symbols-outlined text-sm">download</span> Download
                      </a>
                    )}
                  </div>
                  {selectedKYCUser.kycDocuments?.back ? (
                    <div className="relative overflow-hidden rounded-lg">
                      <img
                        src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/kyc-documents/${selectedKYCUser.kycDocuments.back}`}
                        className="w-full h-auto rounded-lg cursor-zoom-in group-hover:scale-105 transition-transform duration-500"
                        alt="ID Back"
                        onClick={() => setZoomedImage(`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/kyc-documents/${selectedKYCUser.kycDocuments.back}`)}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                        <span className="text-white text-xs font-bold uppercase tracking-widest flex items-center gap-2"><span className="material-symbols-outlined">zoom_in</span> Click to Zoom</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 flex items-center justify-center text-gray-600 italic">No document uploaded</div>
                  )}
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 border border-white/5 mb-8">
                <h4 className="text-sm font-bold text-white mb-4">Applicant Details</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Full Name</p>
                    <p className="text-white text-sm">{selectedKYCUser.name}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Email</p>
                    <p className="text-white text-sm">{selectedKYCUser.email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Submitted On</p>
                    <p className="text-white text-sm">{selectedKYCUser.kycSubmissionDate ? new Date(selectedKYCUser.kycSubmissionDate).toLocaleDateString() : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-gray-500 font-black tracking-widest">Pending Since</p>
                    <p className="text-yellow-500 text-sm font-bold">
                      {selectedKYCUser.kycSubmissionDate
                        ? `${Math.floor((Date.now() - new Date(selectedKYCUser.kycSubmissionDate).getTime()) / (1000 * 60 * 60 * 24))} Days`
                        : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
                {/* Rejection Input - Enhanced with validation */}
                <div className="flex flex-col gap-3">
                  <label className="text-gray-400 text-xs font-bold uppercase tracking-widest">Rejection Reason</label>
                  <div className="relative">
                    <textarea
                      id="rejectionReason"
                      value={rejectionReason}
                      onChange={(e) => {
                        const value = e.target.value.slice(0, 500); // Enforce 500 char limit
                        setRejectionReason(value);
                        if (rejectionError && value.trim()) {
                          setRejectionError(false);
                        }
                      }}
                      placeholder="Provide specific feedback to help the user resubmit correctly (e.g., 'Document image is blurry. Please upload a clear, high-resolution photo')"
                      className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all placeholder:text-gray-600 resize-none ${rejectionError ? 'border-red-500 ring-2 ring-red-500/20' : 'border-brand-border focus:border-brand-primary'
                        }`}
                      rows={4}
                      maxLength={500}
                    />
                    {rejectionError && (
                      <div className="absolute -top-8 left-0 bg-red-500/90 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                        <span className="material-symbols-outlined text-sm">error</span>
                        <span>Rejection reason is required</span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${rejectionReason.length >= 450 ? 'text-yellow-500 font-bold' :
                      rejectionReason.length >= 500 ? 'text-red-500 font-bold' :
                        'text-gray-500'
                      }`}>
                      {rejectionReason.length}/500 characters
                    </span>
                    {rejectionReason.trim() && (
                      <button
                        onClick={() => {
                          setRejectionReason('');
                          setRejectionError(false);
                        }}
                        className="text-xs text-gray-500 hover:text-white transition-colors underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-2">
                  <button
                    onClick={() => {
                      const reason = rejectionReason.trim();

                      if (!reason) {
                        setRejectionError(true);
                        return;
                      }

                      if (confirm(`Confirm Rejection?\n\nReason: "${reason}"\n\nThis will be sent to the customer.`)) {
                        updateKYCStatus(selectedKYCUser.id, 'rejected', undefined, reason);
                        setSelectedKYCUser(null);
                        setRejectionReason('');
                        setRejectionError(false);
                      }
                    }}
                    className="flex-1 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-red-500/20 hover:border-red-500/40"
                  >
                    Reject KYC
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm("Confirm KYC Approval?\n\nThis will enable the user to proceed with rental checkouts.")) {
                        const result = await updateKYCStatus(selectedKYCUser.id, 'approved');
                        if (result) alert(result);
                        setSelectedKYCUser(null);
                        setRejectionReason('');
                        setRejectionError(false);
                      }
                    }}
                    className="flex-1 bg-green-500 text-white hover:bg-green-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-glow"
                  >
                    Approve KYC
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* User Profile Modal */}
      {
        viewingUser && (
          <div className="fixed inset-0 z-[40] flex items-start justify-center p-4 pt-32 md:pt-36 lg:pt-40">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setViewingUser(null)} />
            <div className="relative bg-brand-card border border-brand-border rounded-[2rem] p-8 w-full max-w-4xl shadow-2xl overflow-y-auto max-h-[85vh]">
              <div className="flex justify-between items-start mb-8">
                <div className="flex gap-4">
                  <div className="w-16 h-16 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary text-2xl font-bold">
                    {viewingUser.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold text-white">{viewingUser.name}</h2>
                    <p className="text-sm text-gray-500">{viewingUser.email}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${viewingUser.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'}`}>
                        {viewingUser.role}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${viewingUser.kycStatus === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                        {viewingUser.kycStatus || 'No KYC'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase border ${viewingUser.accountStatus === 'suspended' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                        {viewingUser.accountStatus || 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const newStatus = viewingUser.accountStatus === 'suspended' ? 'active' : 'suspended';
                      if (confirm(`Are you sure you want to ${newStatus === 'suspended' ? 'SUSPEND' : 'ACTIVATE'} this user?`)) {
                        updateUserStatus(viewingUser.id, newStatus);
                        setViewingUser({ ...viewingUser, accountStatus: newStatus });
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${viewingUser.accountStatus === 'suspended' ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'}`}
                  >
                    {viewingUser.accountStatus === 'suspended' ? 'Activate Account' : 'Suspend Account'}
                  </button>
                  <button
                    onClick={() => alert("Password reset link sent to " + viewingUser.email)}
                    className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg text-gray-400 hover:text-white transition-all border border-brand-border text-xs font-bold uppercase tracking-wider"
                  >
                    Reset Password
                  </button>
                  <button onClick={() => setViewingUser(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all ml-2">
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-black/40 rounded-xl p-6 border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Orders</p>
                  <p className="text-2xl font-bold text-white">{viewingUser.orders?.length || 0}</p>
                </div>
                <div className="bg-black/40 rounded-xl p-6 border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Total Spend</p>
                  <p className="text-2xl font-bold text-brand-primary">₹{(viewingUser.orders?.filter(o => o.status !== 'Returned').reduce((acc, o) => acc + o.total, 0) || 0).toLocaleString()}</p>
                </div>
                <div className="bg-black/40 rounded-xl p-6 border border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Active Rentals</p>
                  <p className="text-2xl font-bold text-white">{viewingUser.orders?.filter(o => o.status === 'Active Rental' || o.status === 'In Use').length || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Contact & Addresses */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-brand-primary">badge</span> Personal Info</h3>
                  <div className="bg-black/20 p-6 rounded-xl border border-white/5 space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Details</p>
                      <p className="text-white mt-1">Joined: {new Date(viewingUser.joinedDate || Date.now()).toLocaleDateString()}</p>
                      <p className="text-white">Phone: {viewingUser.addresses?.[0]?.phone || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-2">Saved Addresses</p>
                      {viewingUser.addresses?.map((addr, idx) => (
                        <div key={idx} className="mb-2 last:mb-0 p-3 bg-white/5 rounded-lg text-sm text-gray-300">
                          <p className="font-bold text-white">{addr.label} {addr.isDefault && <span className="text-[9px] bg-brand-primary/20 text-brand-primary px-1 rounded ml-2">DEFAULT</span>}</p>
                          <p>{addr.address}, {addr.city}</p>
                          <p>{addr.state} - {addr.pincode}</p>
                        </div>
                      )) || <p className="text-gray-500 italic">No addresses saved.</p>}
                    </div>
                  </div>
                </div>

                {/* KYC Info */}
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><span className="material-symbols-outlined text-brand-primary">verified_user</span> KYC Information</h3>
                  <div className="bg-black/20 p-6 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-gray-400">Current Status</span>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${viewingUser.kycStatus === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : viewingUser.kycStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                        {viewingUser.kycStatus || 'Not Submitted'}
                      </span>
                    </div>
                    {viewingUser.kycVerifiedDate && <p className="text-xs text-gray-500 mb-4">Verified on: {new Date(viewingUser.kycVerifiedDate).toLocaleDateString()}</p>}

                    {viewingUser.kycStatus === 'pending' && (
                      <button
                        onClick={() => {
                          setViewingUser(null);
                          setSelectedKYCUser(viewingUser);
                        }}
                        className="w-full bg-purple-600 text-white hover:bg-purple-700 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-glow"
                      >
                        Review Documents Now
                      </button>
                    )}
                    {viewingUser.kycDocuments && (
                      <div className="mt-4 flex gap-4">
                        <span className="text-xs text-gray-400 flex items-center gap-1"><span className="material-symbols-outlined text-sm">description</span> Front ID Submitted</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><span className="material-symbols-outlined text-sm">description</span> Back ID Submitted</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Order History */}
              <h3 className="text-lg font-bold text-white mb-4">Order & Rental History</h3>
              <div className="bg-black/20 rounded-xl overflow-hidden border border-white/5 mb-8">
                <table className="w-full text-left">
                  <thead className="bg-white/5">
                    <tr className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4">Items</th>
                      <th className="px-6 py-4">Total</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {viewingUser.orders?.map(order => (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-xs font-mono text-gray-400">{order.id}</td>
                        <td className="px-6 py-4 text-xs text-white">{order.date}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] font-black uppercase px-2 py-1 rounded border ${order.items.some(i => i.type === 'rent') ? 'text-blue-400 border-blue-400/20 bg-blue-400/10' : 'text-green-400 border-green-400/20 bg-green-400/10'}`}>
                            {order.items.some(i => i.type === 'rent') ? 'RENTAL' : 'BUY'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-gray-400 max-w-[200px] truncate">
                          {order.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-white">₹{order.total.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full bg-white/10 text-[9px] font-bold uppercase tracking-wider text-gray-300">
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!viewingUser.orders || viewingUser.orders.length === 0) && (
                      <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">No orders found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Support Tickets */}
              <h3 className="text-lg font-bold text-white mb-4">Support Tickets</h3>
              <div className="bg-black/20 rounded-xl overflow-hidden border border-white/5">
                <table className="w-full text-left">
                  <thead className="bg-white/5">
                    <tr className="text-[9px] text-gray-500 font-black uppercase tracking-widest">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {viewingUser.tickets?.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 text-xs font-mono text-gray-400">{ticket.id}</td>
                        <td className="px-6 py-4 text-xs text-white font-bold">{ticket.subject}</td>
                        <td className="px-6 py-4 text-xs text-gray-400">{ticket.date}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 rounded-full bg-white/10 text-[9px] font-bold uppercase tracking-wider text-gray-300">
                            {ticket.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {(!viewingUser.tickets || viewingUser.tickets.length === 0) && (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">No tickets found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )
      }

      {/* KYC History Modal */}
      {
        viewingKYCHistory && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setViewingKYCHistory(null)} />
            <div className="relative bg-brand-card border border-brand-border rounded-[2rem] p-8 w-full max-w-3xl shadow-2xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white">KYC History</h3>
                  <p className="text-sm text-gray-500 mt-1">Complete audit trail for <span className="text-white font-bold">{viewingKYCHistory.name}</span></p>
                </div>
                <button onClick={() => setViewingKYCHistory(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              {/* Current Status Banner */}
              <div className={`mb-6 p-4 rounded-xl border ${viewingKYCHistory.kycStatus === 'approved' ? 'bg-green-500/10 border-green-500/20' :
                viewingKYCHistory.kycStatus === 'rejected' ? 'bg-red-500/10 border-red-500/20' :
                  viewingKYCHistory.kycStatus === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20' :
                    'bg-gray-500/10 border-gray-500/20'
                }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Current Status</p>
                    <p className={`text-lg font-bold mt-1 ${viewingKYCHistory.kycStatus === 'approved' ? 'text-green-500' :
                      viewingKYCHistory.kycStatus === 'rejected' ? 'text-red-500' :
                        viewingKYCHistory.kycStatus === 'pending' ? 'text-yellow-500' :
                          'text-gray-500'
                      }`}>
                      {viewingKYCHistory.kycStatus?.toUpperCase() || 'NOT SUBMITTED'}
                    </p>
                  </div>
                  {viewingKYCHistory.kycVerifiedDate && (
                    <div className="text-right">
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Last Updated</p>
                      <p className="text-sm text-white mt-1">{new Date(viewingKYCHistory.kycVerifiedDate).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Timeline (Newest First)</h4>
                {viewingKYCHistory.kycHistory && viewingKYCHistory.kycHistory.length > 0 ? (
                  <div className="space-y-4">
                    {[...viewingKYCHistory.kycHistory].reverse().map((entry: any, idx: number) => (
                      <div key={entry.id} className="flex gap-4">
                        {/* Timeline Indicator */}
                        <div className="flex flex-col items-center">
                          <div className={`w-3 h-3 rounded-full ${entry.action === 'approved' ? 'bg-green-500' :
                            entry.action === 'rejected' ? 'bg-red-500' :
                              entry.action === 'resubmitted' ? 'bg-blue-500' :
                                'bg-yellow-500'
                            }`}></div>
                          {idx !== viewingKYCHistory.kycHistory.length - 1 && (
                            <div className="w-px h-full bg-white/10 my-1"></div>
                          )}
                        </div>

                        {/* Event Details */}
                        <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/5">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className={`text-sm font-bold uppercase tracking-wider ${entry.action === 'approved' ? 'text-green-500' :
                                entry.action === 'rejected' ? 'text-red-500' :
                                  entry.action === 'resubmitted' ? 'text-blue-500' :
                                    'text-yellow-500'
                                }`}>
                                {entry.action}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(entry.timestamp).toLocaleString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase border ${entry.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                              entry.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                              }`}>
                              {entry.status}
                            </span>
                          </div>

                          {/* Admin Info */}
                          {entry.adminName && (
                            <div className="mb-2 flex items-center gap-2">
                              <span className="material-symbols-outlined text-brand-primary text-sm">admin_panel_settings</span>
                              <span className="text-xs text-gray-400">Reviewed by: <span className="text-white font-bold">{entry.adminName}</span></span>
                            </div>
                          )}

                          {/* Rejection Reason */}
                          {entry.reason && (
                            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                              <p className="text-[10px] text-red-400 uppercase tracking-wider font-bold mb-1">Rejection Reason</p>
                              <p className="text-sm text-white">{entry.reason}</p>
                            </div>
                          )}

                          {/* Document References */}
                          {entry.documents && (
                            <div className="mt-3 flex gap-2">
                              <span className="material-symbols-outlined text-gray-500 text-sm">description</span>
                              <span className="text-xs text-gray-400">Documents archived</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <span className="material-symbols-outlined text-4xl text-gray-600 mb-2">history</span>
                    <p className="text-gray-500">No history available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }

      {/* Ticket Detail Modal */}
      {
        selectedTicket && (() => {
          const adminList = allUsers.filter(u => u.role === 'admin');

          return (
            <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-28 lg:pt-32">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedTicket(null)} />
              <div className="relative bg-brand-card border border-brand-border rounded-[2rem] p-8 w-full max-w-5xl shadow-2xl overflow-y-auto max-h-[85vh]">
                {/* Header */}
                <div className="flex justify-between items-start mb-6 pb-6 border-b border-white/10">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">{selectedTicket.subject}</h3>
                    <p className="text-sm text-gray-500">Ticket ID: <span className="font-mono text-white">{selectedTicket.id}</span></p>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Customer Info & Controls */}
                  <div className="space-y-4">
                    {/* Customer Info */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider mb-3">Customer Information</p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-gray-500">Name</p>
                          <p className="text-white font-bold">{selectedTicket.userName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Email</p>
                          <p className="text-white text-sm">{selectedTicket.customerEmail}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Created</p>
                          <p className="text-white text-sm">{selectedTicket.date}</p>
                        </div>
                      </div>
                    </div>

                    {/* Status Control */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider mb-3">Status</p>
                      <select
                        value={selectedTicket.status}
                        onChange={(e) => {
                          updateTicketStatus(selectedTicket.id, e.target.value as any);
                          setSelectedTicket({ ...selectedTicket, status: e.target.value });
                        }}
                        className="w-full bg-black/40 border border-brand-border rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:border-brand-primary cursor-pointer"
                      >
                        <option value="Open" style={{ backgroundColor: 'white', color: 'black' }}>Open</option>
                        <option value="In Progress" style={{ backgroundColor: 'white', color: 'black' }}>In Progress</option>
                        <option value="Pending" style={{ backgroundColor: 'white', color: 'black' }}>Pending</option>
                        <option value="Resolved" style={{ backgroundColor: 'white', color: 'black' }}>Resolved</option>
                      </select>
                    </div>

                    {/* Priority Control */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider mb-3">Priority</p>
                      <select
                        value={selectedTicket.priority}
                        onChange={(e) => {
                          updateTicketPriority(selectedTicket.id, e.target.value as any);
                          setSelectedTicket({ ...selectedTicket, priority: e.target.value });
                        }}
                        className="w-full bg-black/40 border border-brand-border rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:border-brand-primary cursor-pointer"
                      >
                        <option value="Low" style={{ backgroundColor: 'white', color: 'black' }}>Low</option>
                        <option value="Medium" style={{ backgroundColor: 'white', color: 'black' }}>Medium</option>
                        <option value="High" style={{ backgroundColor: 'white', color: 'black' }}>High</option>
                        <option value="Urgent" style={{ backgroundColor: 'white', color: 'black' }}>Urgent</option>
                      </select>
                    </div>

                    {/* Assignment Control */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider mb-3">Assigned To</p>
                      <select
                        value={selectedTicket.assignedTo || ''}
                        onChange={(e) => {
                          const selectedAdmin = adminList.find(a => a.id === e.target.value);
                          if (selectedAdmin) {
                            assignTicket(selectedTicket.id, selectedAdmin.id, selectedAdmin.name);
                            setSelectedTicket({ ...selectedTicket, assignedTo: selectedAdmin.id, assignedToName: selectedAdmin.name });
                          }
                        }}
                        className="w-full bg-black/40 border border-brand-border rounded-lg text-sm text-white px-3 py-2 focus:outline-none focus:border-brand-primary cursor-pointer"
                      >
                        <option value="" style={{ backgroundColor: 'white', color: 'gray' }}>Unassigned</option>
                        {adminList.map(admin => (
                          <option key={admin.id} value={admin.id} style={{ backgroundColor: 'white', color: 'black' }}>{admin.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Right Column - Conversation Thread */}
                  <div className="lg:col-span-2 space-y-4">
                    {/* Messages */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5 max-h-[400px] overflow-y-auto">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider mb-4">Conversation</p>
                      <div className="space-y-4">
                        {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                          selectedTicket.messages.map((msg: any) => (
                            <div key={msg.id} className={`flex gap-3 ${msg.senderRole === 'admin' ? 'flex-row-reverse' : ''}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.senderRole === 'admin' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-white/10 text-white'
                                }`}>
                                <span className="material-symbols-outlined text-sm">
                                  {msg.senderRole === 'admin' ? 'support_agent' : 'person'}
                                </span>
                              </div>
                              <div className={`flex-1 ${msg.senderRole === 'admin' ? 'text-right' : ''}`}>
                                <div className="flex items-center gap-2 mb-1">
                                  <p className={`text-xs font-bold ${msg.senderRole === 'admin' ? 'text-brand-primary' : 'text-white'}`}>
                                    {msg.senderName}
                                  </p>
                                  <p className="text-[10px] text-gray-500">
                                    {new Date(msg.timestamp).toLocaleString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                                <div className={`inline-block p-3 rounded-lg ${msg.senderRole === 'admin'
                                  ? 'bg-brand-primary/10 border border-brand-primary/20'
                                  : 'bg-white/10 border border-white/5'
                                  }`}>
                                  <p className="text-sm text-white whitespace-pre-wrap">{msg.message}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 text-center py-4">No messages yet</p>
                        )}
                      </div>
                    </div>

                    {/* Reply Input */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-wider mb-3">Send Reply</p>
                      <textarea
                        value={ticketReplyInput}
                        onChange={(e) => setTicketReplyInput(e.target.value)}
                        placeholder="Type your response..."
                        className="w-full bg-black/40 border border-brand-border rounded-lg text-sm text-white px-4 py-3 focus:outline-none focus:border-brand-primary placeholder:text-gray-500 min-h-[100px] resize-none"
                      />
                      <div className="flex justify-between items-center mt-3">
                        <p className="text-xs text-gray-500">{ticketReplyInput.length} characters</p>
                        <button
                          onClick={async () => {
                            if (ticketReplyInput.trim()) {
                              await addTicketMessage(selectedTicket.id, ticketReplyInput.trim());
                              setTicketReplyInput('');
                              // Refresh ticket data
                              const updatedUser = allUsers.find(u => u.id === selectedTicket.userId);
                              const updatedTicket = updatedUser?.tickets?.find(t => t.id === selectedTicket.id);
                              if (updatedTicket) {
                                setSelectedTicket({ ...updatedTicket, userId: selectedTicket.userId, userName: selectedTicket.userName, customerEmail: selectedTicket.customerEmail });
                              }
                            }
                          }}
                          disabled={!ticketReplyInput.trim()}
                          className="bg-brand-primary text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-brand-primaryHover transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <span className="material-symbols-outlined text-[18px]">send</span>
                          Send Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })()
      }

      {/* Image Zoom Modal */}
      {
        zoomedImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setZoomedImage(null)}>
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-all">
              <span className="material-symbols-outlined text-4xl">close</span>
            </button>
            <img src={zoomedImage} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" alt="Zoomed View" />
          </div>
        )
      }
    </div >
  );
}
