
import React, { useState } from "react";
import { useStore, Order } from "../lib/store";
import { Product } from "../lib/mockData";
import QuickViewModal from "./QuickViewModal";
import AddProductModal from "./AddProductModal";
import { generateInvoice } from "../lib/invoice";

export default function AdminDashboard() {
  const { user, finance, orders, tickets, allUsers, products: allProducts, logout, updateOrderStatus, updateTicketStatus, updateKYCStatus, deleteProduct } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'users' | 'financials' | 'reports' | 'settings' | 'support'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedKYCUser, setSelectedKYCUser] = useState<any>(null); // Using any for simplicity with Store User type mismatch
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Event listener removed - actions handled directly in handlers

  const handleNavigateToProduct = (id: string) => {
    // Navigation wrapper
    console.log("Navigating to product:", id);
  };

  // Aggregate all orders from all users for Admin
  const allOrders = allUsers.flatMap(user => user.orders || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Aggregate all tickets from all users
  const allTickets = allUsers.flatMap(user => user.tickets || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const stats = [
    { label: 'Total Revenue', value: `₹${(finance.totalRevenue / 1000000).toFixed(1)}M`, icon: 'payments' },
    { label: 'Growth', value: `+${finance.monthlyGrowth}%`, icon: 'trending_up' },
    { label: 'Active Rentals', value: allOrders.filter(o => o.status === 'Active Rental' || o.status === 'In Use').length, icon: 'laptop_mac' },
    { label: 'Support Tickets', value: allTickets.filter(t => t.status === 'Open').length, icon: 'contact_support' },
  ];

  const handleStatusChange = (orderId: string, status: Order['status']) => {
    updateOrderStatus(orderId, status);
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8 animate-in fade-in duration-500 relative">
      {/* Mobile Menu Button */}
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
        {/* Sidebar */}
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
                { id: 'support', label: 'Support Tickets', icon: 'confirmation_number' },
                { id: 'reports', label: 'Reports', icon: 'analytics' },
                { id: 'settings', label: 'Settings', icon: 'settings' }
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
          <div className="flex items-center justify-between mb-8 lg:mb-10">
            <h1 className="text-3xl lg:text-5xl font-display font-bold text-white tracking-tighter capitalize">
              AvN {activeTab}
            </h1>
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-8 lg:space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                {stats.map((stat, i) => (
                  <div key={i} className="bg-brand-card border border-brand-border p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-xl">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 text-white border border-white/5">
                      <span className="material-symbols-outlined text-[20px] lg:text-[22px]">{stat.icon}</span>
                    </div>
                    <p className="text-[9px] lg:text-[10px] text-gray-500 font-black uppercase tracking-[0.4em] mb-2">{stat.label}</p>
                    <p className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tighter">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="bg-brand-card border border-brand-border rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-12 shadow-2xl">
                <h3 className="text-xl lg:text-2xl font-display font-bold text-white mb-8 lg:mb-12">Sales Growth</h3>
                <div className="h-56 lg:h-72 flex items-end justify-between gap-2 lg:gap-5 border-b border-white/10 pb-6">
                  {[60, 45, 80, 55, 95, 70, 85, 100, 40, 90, 65, 75].map((h, i) => (
                    <div key={i} className="flex-1 bg-brand-primary/20 rounded-t-lg hover:bg-brand-primary transition-all duration-300" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
                <div className="flex justify-between mt-6 text-[8px] lg:text-[9px] text-gray-500 font-black uppercase tracking-[0.5em]">
                  <span>Jan</span><span>Apr</span><span>Jul</span><span>Dec</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-brand-card border border-brand-border rounded-[2rem] lg:rounded-[3rem] p-6 lg:p-10 shadow-2xl overflow-hidden">
              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {allOrders.map(order => (
                  <div key={order.id} className="bg-white/5 rounded-2xl p-6 border border-white/5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-white font-bold">{order.userName}</p>
                        <p className="text-[10px] text-gray-500">{order.id}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase border border-brand-primary/20">
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-white/5 gap-2">
                      <p className="text-white font-bold">₹{order.total.toLocaleString()}</p>
                      <button
                        onClick={async () => {
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
                      <select
                        onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                        className="bg-black/40 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-400 p-2 focus:outline-none focus:border-brand-primary"
                      >
                        <option>Action</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Returned">Returned</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] border-b border-white/5">
                      <th className="px-6 py-6 whitespace-nowrap">ID</th>
                      <th className="px-6 py-6 whitespace-nowrap">Customer</th>
                      <th className="px-6 py-6 whitespace-nowrap">Total</th>
                      <th className="px-6 py-6 whitespace-nowrap">Status</th>
                      <th className="px-6 py-6 text-right whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.map(order => (
                      <tr key={order.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-6 text-white font-mono">{order.id}</td>
                        <td className="px-6 py-6">
                          <p className="text-white font-bold">{order.userName}</p>
                          <p className="text-[10px] text-gray-500">{order.userEmail}</p>
                        </td>
                        <td className="px-6 py-6 text-white font-bold">₹{order.total.toLocaleString()}</td>
                        <td className="px-6 py-6">
                          <span className="px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase border border-brand-primary/20">
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-6 text-right">
                          <div className="flex justify-end gap-2 text-right">
                            <button
                              onClick={async () => {
                                // Simple inline loading state for admin
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
                              onChange={(e) => handleStatusChange(order.id, e.target.value as any)}
                              className="bg-black/40 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest text-gray-400 p-2 focus:outline-none focus:border-brand-primary"
                            >
                              <option>Update Status</option>
                              <option value="Shipped">Shipped</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Returned">Returned</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-8 relative z-10">
              <div className="flex flex-col md:flex-row gap-5 mb-10">
                <button
                  onClick={() => { setEditingProduct(null); setIsAddProductOpen(true); }}
                  className="bg-cta-gradient hover:brightness-110 transition-all text-white px-10 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 w-full md:w-auto text-center cursor-pointer active:scale-95 shadow-lg"
                >
                  <span className="material-symbols-outlined">add</span> Add New Product
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allProducts.map(p => (
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
                    <div className="flex gap-4 mt-6">
                      <button onClick={() => { setEditingProduct(p); setIsAddProductOpen(true); }} className="flex-1 bg-white/5 hover:bg-white/10 py-4 lg:py-3 rounded-xl text-[9px] font-black uppercase text-gray-400 hover:text-white transition-all cursor-pointer min-h-[44px] flex items-center justify-center">Edit</button>
                      <button onClick={() => { if (confirm(`Delete ${p.name}?`)) deleteProduct(p.id); }} className="flex-1 bg-white/5 hover:bg-red-500/20 py-4 lg:py-3 rounded-xl text-[9px] font-black uppercase text-red-400/50 hover:text-red-400 transition-all cursor-pointer min-h-[44px] flex items-center justify-center">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'financials' && (
            <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-10 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-white/10 mb-4">payments</span>
                <h3 className="text-xl font-bold text-white mb-2">Financial Management</h3>
                <p className="text-gray-500 text-sm">Payments, Invoices, and Refunds module coming soon.</p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-6 lg:p-10 shadow-2xl overflow-hidden">
              <h3 className="text-xl font-bold text-white mb-6">User Management & KYC</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] border-b border-white/5">
                      <th className="px-6 py-6 whitespace-nowrap">User</th>
                      <th className="px-6 py-6 whitespace-nowrap">Email</th>
                      <th className="px-6 py-6 whitespace-nowrap">Role</th>
                      <th className="px-6 py-6 whitespace-nowrap">KYC Status</th>
                      <th className="px-6 py-6 text-right whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map(u => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-6 text-white font-bold">{u.name}</td>
                        <td className="px-6 py-6 text-gray-400 text-sm">{u.email}</td>
                        <td className="px-6 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'}`}>
                            {u.role}
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
                            <span className="text-gray-500 text-[10px] font-black uppercase">Verified</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    {allUsers.length === 0 && ( /* Fallback if no users loaded */
                      <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">No users found. (Ensure you are logged in as Admin and Firestore sync is active)</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-10 flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl text-white/10 mb-4">analytics</span>
                <h3 className="text-xl font-bold text-white mb-2">Analytics & Reports</h3>
                <p className="text-gray-500 text-sm">Detailed revenue and usage reports module coming soon.</p>
              </div>
            </div>
          )}

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
      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onNavigateToProduct={handleNavigateToProduct}
        />
      )}

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <AddProductModal onClose={() => { setIsAddProductOpen(false); setEditingProduct(null); }} productToEdit={editingProduct} />
      )}

      {/* KYC Review Modal */}
      {selectedKYCUser && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedKYCUser(null)} />
          <div className="relative bg-brand-card border border-brand-border rounded-[2rem] p-8 w-full max-w-4xl shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white">KYC Verification</h3>
                <p className="text-sm text-gray-500 mt-1">Review documents for <span className="text-white font-bold">{selectedKYCUser.name}</span></p>
              </div>
              <button onClick={() => setSelectedKYCUser(null)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Front Side</p>
                {selectedKYCUser.kycDocuments?.front ? (
                  <img
                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/kyc-documents/${selectedKYCUser.kycDocuments.front}`}
                    className="w-full h-auto rounded-lg"
                    alt="ID Front"
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-600 italic">No document uploaded</div>
                )}
              </div>
              <div className="bg-black/40 rounded-xl p-4 border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Back Side</p>
                {selectedKYCUser.kycDocuments?.back ? (
                  <img
                    src={`${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/kyc-documents/${selectedKYCUser.kycDocuments.back}`}
                    className="w-full h-auto rounded-lg"
                    alt="ID Back"
                  />
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-600 italic">No document uploaded</div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-white/5 pt-6">
              {/* Rejection Input - only show if not already approved */}
              <div className="flex flex-col gap-2">
                <label className="text-gray-400 text-xs font-bold uppercase tracking-widest">Action</label>
                <div className="flex gap-4">
                  <input
                    type="text"
                    id="rejectionReason"
                    placeholder="Reason for rejection (required for reject)"
                    className="flex-1 bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500/50 transition-all placeholder:text-gray-600"
                  />
                  <button
                    onClick={() => {
                      const reasonInput = document.getElementById('rejectionReason') as HTMLInputElement;
                      const reason = reasonInput.value;

                      if (!reason) {
                        alert("Please provide a reason for rejection.");
                        return;
                      }

                      if (confirm("Confirm Rejection with reason: " + reason + "?")) {
                        updateKYCStatus(selectedKYCUser.id, 'rejected', undefined, reason);
                        setSelectedKYCUser(null);
                      }
                    }}
                    className="bg-red-500/10 text-red-500 hover:bg-red-500/20 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap"
                  >
                    Reject
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm("Confirm Approval?")) {
                        const result = await updateKYCStatus(selectedKYCUser.id, 'approved');
                        if (result) alert(result);
                        setSelectedKYCUser(null);
                      }
                    }}
                    className="bg-green-500 text-white hover:bg-green-600 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-glow whitespace-nowrap"
                  >
                    Approve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
