import React, { useState } from "react";
import { useStore } from "../lib/store";
import AdminDashboard from "./AdminDashboard";
import { generateInvoice } from "../lib/invoice";

import AddressModal from "./AddressModal";

interface DashboardProps {
    initialTab?: 'rentals' | 'orders' | 'support';
}

export default function Dashboard({ initialTab = 'rentals' }: DashboardProps) {
    const { user, orders, tickets, addTicket, logout, updateRentalPreferences, refreshProfile } = useStore();
    const [activeTab, setActiveTab] = useState<'rentals' | 'orders' | 'support'>(initialTab);
    const [ticketSubject, setTicketSubject] = useState("");

    // Modal States
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    // DEBUG: Monitor KYC Status changes
    React.useEffect(() => {
        console.log("🔄 Dashboard: KYC Status Changed to:", user?.kycStatus);
    }, [user?.kycStatus]);

    // Event listener removed - logic moved to direct handler

    if (!user) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
            <span className="material-symbols-outlined text-6xl text-brand-muted mb-4 opacity-20">account_circle</span>
            <h2 className="text-2xl font-display font-bold text-white mb-2">Log In Required</h2>
            <p className="text-brand-muted mb-8 max-w-xs mx-auto">Please log in to view your orders and account details.</p>
        </div>
    );

    if (user.role === 'admin') {
        return <AdminDashboard />;
    }

    const activeRentals = orders.filter(o => o.items.some(i => i.type === 'rent'));
    const pastOrders = orders;

    return (
        <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full md:w-72 flex-shrink-0">
                    <div className="bg-brand-card border border-brand-border rounded-[2rem] p-8 mb-6 shadow-xl relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-8 relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-brand-primary flex items-center justify-center text-white font-display font-bold text-2xl shadow-inner">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                                <h3 className="text-white font-bold truncate leading-tight">{user.name}</h3>
                                <p className="text-xs text-brand-muted truncate mt-1">Customer</p>
                            </div>
                        </div>

                        <nav className="flex flex-col gap-2 relative z-10">
                            {[
                                { id: 'rentals', label: 'My Rentals', icon: 'laptop_mac' },
                                { id: 'orders', label: 'Order History', icon: 'history' },
                                { id: 'support', label: 'Help & Support', icon: 'support_agent' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-brand-primary text-white shadow-lg' : 'text-brand-muted hover:text-white hover:bg-white/5'}`}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <button onClick={logout} className="w-full bg-brand-card/40 border border-brand-border text-red-400 hover:bg-red-400/10 py-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 group">
                        <span className="material-symbols-outlined text-[20px]">logout</span>
                        Logout
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl md:text-4xl text-white avn-heading">
                            {activeTab === 'rentals' ? 'My Devices' : activeTab === 'orders' ? 'Order History' : 'Support Center'}
                        </h1>
                        <div className="text-brand-muted text-[10px] font-black uppercase tracking-[0.2em]">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                    </div>

                    {/* KYC Status Card */}
                    {activeTab === 'rentals' && (
                        <div className="mb-8">
                            {!user.kycStatus || user.kycStatus === 'not_submitted' || user.kycStatus === 'reupload_required' ? (
                                <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-brand-border rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <span className="material-symbols-outlined">verified_user</span>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-lg">Identity Verification Required</h3>
                                            <p className="text-brand-muted text-sm">Verify your identity to start renting products.</p>
                                            {user.kycStatus === 'reupload_required' && <p className="text-red-400 text-xs mt-1 font-bold">Action Required: Previous documents were invalid.</p>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'kyc' } }))}
                                        className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all"
                                    >
                                        {user.kycStatus === 'reupload_required' ? 'Re-upload Documents' : 'Complete Verification'}
                                    </button>
                                </div>
                            ) : user.kycStatus === 'pending' ? (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-[2rem] p-6 flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500 animate-pulse">
                                        <span className="material-symbols-outlined">hourglass_top</span>
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-lg">Verification in Progress</h3>
                                        <div className="flex items-center gap-4">
                                            <p className="text-brand-muted text-sm">Our team is reviewing your documents. This usually takes 24 hours.</p>
                                            <button
                                                onClick={() => refreshProfile()}
                                                className="bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1.5 rounded-lg border border-white/10 font-bold transition-all whitespace-nowrap"
                                            >
                                                Check Status
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : user.kycStatus === 'approved' ? (
                                (!user.addresses?.length || !user.rentalPreferences?.isOnboardingComplete) ? (
                                    <div className="bg-brand-card border border-brand-border rounded-[2rem] p-6 mb-6">
                                        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Setup Required</p>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-sm ${user.addresses?.length ? 'text-green-400 line-through' : 'text-white'}`}>1. Add Delivery Address</span>
                                                    {!user.addresses?.length && (
                                                        <button onClick={() => setIsAddressModalOpen(true)} className="text-xs bg-white text-black px-3 py-1.5 rounded-lg font-bold">Add</button>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-sm ${user.rentalPreferences?.isOnboardingComplete ? 'text-green-400 line-through' : 'text-white'}`}>2. Set Payment Preference</span>
                                                    {!user.rentalPreferences?.isOnboardingComplete && (
                                                        <button
                                                            onClick={() => setIsPaymentModalOpen(true)}
                                                            className="text-xs bg-white text-black px-3 py-1.5 rounded-lg font-bold"
                                                        >
                                                            Set
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : null
                            ) : user.kycStatus === 'rejected' ? (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                                            <span className="material-symbols-outlined">error</span>
                                        </div>
                                        <div>
                                            <h3 className="text-white font-bold text-lg">Verification Failed</h3>
                                            <p className="text-brand-muted text-sm">Reason: <span className="text-white font-bold">{user.kycRejectionReason || 'Documents unclear or invalid'}</span></p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'kyc' } }))}
                                        className="bg-red-500 text-white hover:bg-red-600 px-6 py-3 rounded-xl text-sm font-bold shadow-lg transition-all"
                                    >
                                        Re-upload Documents
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    )}

                    {activeTab === 'rentals' && (
                        <div className="flex flex-col gap-6">
                            {activeRentals.length === 0 ? (
                                <div className="text-center py-20 bg-brand-card/30 border border-brand-border border-dashed rounded-[2.5rem]">
                                    <span className="material-symbols-outlined text-5xl text-brand-muted/30 mb-4">inventory</span>
                                    <h3 className="text-xl font-bold text-white mb-2">No Active Rentals</h3>
                                    <p className="text-brand-muted text-sm max-w-xs mx-auto">Rent a device today and it will appear here.</p>
                                </div>
                            ) : (
                                activeRentals.map(order => (
                                    order.items.filter(i => i.type === 'rent').map((item, idx) => (
                                        <div key={`${order.id}-${idx}`} className="bg-brand-card border border-brand-border rounded-[2rem] p-8 relative overflow-hidden group hover:border-brand-primary/30 transition-all shadow-xl">
                                            <div className="flex flex-col md:flex-row gap-8">
                                                <div className="w-32 h-32 bg-black/40 rounded-3xl flex-shrink-0 p-4 border border-brand-border/30">
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h3 className="text-2xl font-bold text-white tracking-tight">{item.name}</h3>
                                                            <p className="text-brand-muted text-sm mt-1">Order ID: <span className="font-mono">{order.id}</span></p>
                                                        </div>
                                                        <span className="bg-green-500/10 text-green-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-500/20">Active</span>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 mt-6">
                                                        <div>
                                                            <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mb-1">Rental Period</p>
                                                            <p className="text-white font-bold">{item.tenure} Months</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mb-1">Monthly Price</p>
                                                            <p className="text-brand-primary font-bold">₹{item.price.toLocaleString()}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mb-1">Ordered On</p>
                                                            <p className="text-white font-bold">{order.date}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-8 flex flex-wrap gap-4 justify-end border-t border-brand-border/20 pt-6">
                                                <button className="bg-brand-primary/10 text-brand-primary px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-brand-primary/20 hover:bg-brand-primary hover:text-white transition-all">
                                                    Manage Rental
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'orders' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {pastOrders.map(order => (
                                <div key={order.id} className="bg-brand-card border border-brand-border rounded-[2rem] p-8 shadow-xl">
                                    <div className="flex justify-between items-center mb-6 border-b border-brand-border/20 pb-6">
                                        <div>
                                            <p className="text-[10px] text-brand-muted font-black uppercase tracking-[0.2em] mb-1">Order ID</p>
                                            <p className="text-white font-mono font-bold">{order.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] text-brand-muted font-black uppercase tracking-[0.2em] mb-1">Total Price</p>
                                            <p className="text-brand-primary font-bold text-xl">₹{order.total.toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-4 mb-8">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-black/40 rounded-xl flex-shrink-0 p-2 border border-brand-border/20">
                                                    <img src={item.image} className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-sm font-bold truncate">{item.name}</p>
                                                    <p className="text-brand-muted text-[10px] font-black uppercase tracking-widest">{item.type}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pt-6 border-t border-brand-border/20 flex justify-between items-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${order.status === 'Delivered' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20'}`}>
                                            {order.status}
                                        </span>
                                        <button
                                            onClick={async () => {
                                                const btn = document.getElementById(`invoice-btn-${order.id}`);
                                                if (btn) {
                                                    btn.innerText = "Processing...";
                                                    btn.setAttribute('disabled', 'true');
                                                }
                                                await generateInvoice(order, user);
                                                if (btn) {
                                                    btn.innerText = "Download Invoice";
                                                    btn.removeAttribute('disabled');
                                                }
                                            }}
                                            id={`invoice-btn-${order.id}`}
                                            className="text-[10px] font-black uppercase tracking-widest text-brand-muted hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Download Invoice
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {activeTab === 'support' && (
                        <div className="space-y-8">
                            <div className="bg-brand-card border border-brand-border rounded-[2.5rem] p-10 shadow-2xl">
                                <h3 className="text-2xl font-display font-bold text-white mb-6">Need help?</h3>
                                <div className="flex flex-col md:flex-row gap-4">
                                    <input
                                        type="text"
                                        placeholder="Tell us what you need help with..."
                                        value={ticketSubject}
                                        onChange={(e) => setTicketSubject(e.target.value)}
                                        className="flex-1 bg-black/40 border border-brand-border rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-brand-primary transition-all placeholder:text-gray-500 font-medium"
                                    />
                                    <button
                                        onClick={() => {
                                            if (ticketSubject) {
                                                addTicket(ticketSubject);
                                                setTicketSubject("");
                                            }
                                        }}
                                        className="bg-brand-primary text-white font-black text-xs uppercase tracking-[0.2em] px-10 py-4 rounded-2xl hover:bg-brand-primaryHover transition-all shadow-lg active:scale-95"
                                    >
                                        Send Message
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-brand-muted uppercase tracking-[0.4em] mb-6">Support History</h3>
                                {tickets.map(ticket => (
                                    <div key={ticket.id} className="flex items-center justify-between bg-brand-card/50 backdrop-blur-md p-6 rounded-3xl border border-brand-border hover:border-brand-primary/30 transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${ticket.status === 'Open' ? 'bg-brand-primary/10 border-brand-primary/20 text-brand-primary' : 'bg-green-500/10 border-green-500/20 text-green-500'}`}>
                                                <span className="material-symbols-outlined text-[20px]">{ticket.status === 'Open' ? 'mail' : 'done'}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-white font-bold">{ticket.subject}</h4>
                                                <p className="text-[10px] text-brand-muted font-black uppercase tracking-widest mt-1">Ticket {ticket.id} • Created on {ticket.date}</p>
                                            </div>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${ticket.status === 'Open' ? 'bg-brand-primary/10 text-brand-primary border-brand-primary/20' : 'bg-green-500/10 text-green-500 border-green-500/20'}`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Address Modal */}
            {isAddressModalOpen && <AddressModal onClose={() => setIsAddressModalOpen(false)} />}

            {/* Payment Preference Modal */}
            {
                isPaymentModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsPaymentModalOpen(false)} />
                        <div className="relative bg-brand-card border border-brand-border rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                            <h3 className="text-xl font-bold text-white mb-6">Payment Preference</h3>
                            <p className="text-gray-400 text-sm mb-6">Select your preferred method for monthly rental payments and security deposit refunds.</p>

                            <div className="flex flex-col gap-3">
                                {[
                                    { id: 'card', label: 'Credit/Debit Card', icon: 'credit_card' },
                                    { id: 'upi', label: 'UPI / VPA', icon: 'qr_code' },
                                    { id: 'net_banking', label: 'Net Banking', icon: 'account_balance' }
                                ].map(method => (
                                    <button
                                        key={method.id}
                                        onClick={async () => {
                                            await updateRentalPreferences({ depositMethod: method.id as any, isOnboardingComplete: true });
                                            setIsPaymentModalOpen(false);
                                        }}
                                        className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-brand-primary/50 transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                            <span className="material-symbols-outlined">{method.icon}</span>
                                        </div>
                                        <span className="font-bold text-white">{method.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
