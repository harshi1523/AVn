import React, { useState, useEffect } from "react";
import { useStore } from "../lib/store";
import AdminDashboard from "./AdminDashboard";
import { generateInvoice } from "../lib/invoice";
import { useToast } from "../lib/ToastContext"; // Use Global Toast
import AddressModal from "./AddressModal";
import EditProfileModal from "./EditProfileModal";
import { Address } from "../lib/types";

interface DashboardProps {
    initialTab?: 'rentals' | 'orders' | 'support' | 'rental-preferences' | 'addresses' | 'my-rentals';
}

export default function Dashboard({ initialTab = 'rentals' }: DashboardProps) {
    const { user, orders, tickets, addTicket, logout, updateRentalPreferences, refreshProfile, removeAddress, setDefaultAddress, updateOrderStatus, updateProfile } = useStore();
    const { showToast } = useToast(); // Global Toast
    const [activeTab, setActiveTab] = useState<'rentals' | 'orders' | 'support' | 'rental-preferences' | 'addresses' | 'my-rentals'>(initialTab);
    const [ticketSubject, setTicketSubject] = useState("");
    const [ticketDescription, setTicketDescription] = useState("");

    // Modal States
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [upiId, setUpiId] = useState(user?.rentalPreferences?.upiId || '');
    const [selectedMethod, setSelectedMethod] = useState<'card' | 'upi' | 'net_banking'>('upi');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvc, setCardCvc] = useState('');

    // Rental Management States
    const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedRental, setSelectedRental] = useState<{ orderId: string; item: any } | null>(null);
    const [extensionMonths, setExtensionMonths] = useState(3);
    const [returnReason, setReturnReason] = useState('');
    const [showCvc, setShowCvc] = useState(false);

    // Profile Edit State
    const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

    // Order Detail Modal State
    const [isOrderDetailModalOpen, setIsOrderDetailModalOpen] = useState(false);
    const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<any>(null);


    // Rental Management Handlers
    const handleExtendRental = () => {
        if (selectedRental) {
            // TODO: Implement actual extension logic with backend
            showToast(`Rental extended by ${extensionMonths} months successfully!`, 'success');
            setIsExtendModalOpen(false);
            setSelectedRental(null);
            setExtensionMonths(3);
        }
    };

    const handleRequestReturn = async () => {
        if (selectedRental && returnReason.trim()) {
            try {
                // Update order status to 'Return Requested' and add note
                await updateOrderStatus(selectedRental.orderId, 'Return Requested', {
                    courier: 'Return Request',
                    trackingNumber: returnReason
                });

                showToast('Return request submitted successfully! Our team will contact you soon.', 'success');
                setIsReturnModalOpen(false);
                setSelectedRental(null);
                setReturnReason('');
            } catch (error: any) {
                console.error("Failed to submit return request:", error);
                showToast(error.message || 'Failed to submit return request. Please try again.', 'error');
            }
        } else {
            showToast('Please provide a reason for return', 'error');
        }
    };

    // Auto-fill form data when user data loads
    useEffect(() => {
        if (user?.rentalPreferences) {
            setUpiId(user.rentalPreferences.upiId || '');
            setSelectedMethod(user.rentalPreferences.depositMethod || 'upi');
        }
    }, [user, isPaymentModalOpen]);


    React.useEffect(() => {
        console.log("🔄 Dashboard: KYC Status Changed to:", user?.kycStatus);
    }, [user?.kycStatus]);



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
    const pastOrders = [...orders].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


    return (
        <div className="min-h-screen bg-brand-page">
            <div className="flex">
                {/* Sidebar */}
                <div className="w-64 min-h-screen bg-brand-card border-r border-brand-border flex flex-col">
                    {/* Navigation */}
                    <nav className="flex-1 p-4">
                        <div className="space-y-1">
                            {[
                                { id: 'rentals', label: 'Dashboard', icon: 'dashboard' },
                                { id: 'orders', label: 'Order history', icon: 'history' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-brand-primary text-white'
                                        : 'text-brand-muted hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}

                            {/* My Rentals Menu Item */}
                            <button
                                onClick={() => setActiveTab('my-rentals' as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'my-rentals'
                                    ? 'bg-brand-primary text-white'
                                    : 'text-brand-muted hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-xl">devices</span>
                                My Rentals ({activeRentals.length})
                            </button>

                            {/* Address Display */}
                            <button
                                onClick={() => setActiveTab('addresses' as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'addresses'
                                    ? 'bg-brand-primary text-white'
                                    : 'text-brand-muted hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-xl">location_on</span>
                                Addresses ({user.addresses?.length || 0})
                            </button>

                            {[
                                { id: 'support', label: 'Contact Us', icon: 'phone' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-brand-primary text-white'
                                        : 'text-brand-muted hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                                    {tab.label}
                                </button>
                            ))}

                            {/* Rental Preferences Menu Item */}
                            <button
                                onClick={() => setActiveTab('rental-preferences')}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'rental-preferences'
                                    ? 'bg-brand-primary text-white'
                                    : 'text-brand-muted hover:bg-white/5 hover:text-white'
                                    }`}
                            >
                                <span className="material-symbols-outlined text-xl">payments</span>
                                Rental Preferences
                            </button>
                        </div>
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-brand-border">
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all"
                        >
                            <span className="material-symbols-outlined text-xl">logout</span>
                            Log out
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-brand-page p-8">
                    {/* Header */}
                    <div className="mb-8 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <div className="w-16 h-16 rounded-full bg-brand-primary flex items-center justify-center overflow-hidden border-2 border-brand-border">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-white text-4xl">account_circle</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => setIsEditProfileModalOpen(true)}
                                    className="absolute inset-0 bg-black/60 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full"
                                >
                                    CHANGE
                                </button>
                            </div>

                            <div>
                                <p className="text-sm text-brand-muted">
                                    Hello <span className="font-semibold text-white">{user.name}</span> (not {user.name}? <button onClick={logout} className="text-brand-primary hover:underline">Log out</button>)
                                </p>
                                <p className="text-xs text-brand-muted/60">Manage your profile and rentals</p>
                            </div>
                        </div>
                    </div>


                    {/* KYC Status Card */}
                    {activeTab === 'rentals' && (
                        <div className={`mb-6 p-6 rounded-2xl border transition-all shadow-lg overflow-hidden relative ${user?.kycStatus === 'approved'
                            ? 'bg-green-500/10 border-green-500/30'
                            : user?.kycStatus === 'pending'
                                ? 'bg-yellow-500/10 border-yellow-500/30'
                                : user?.kycStatus === 'rejected'
                                    ? 'bg-red-500/10 border-red-500/30'
                                    : 'bg-brand-primary/10 border-brand-primary/20'
                            }`}>
                            {/* Decorative Background Icon */}
                            <div className="absolute right-[-20px] top-[-20px] opacity-[0.05] pointer-events-none">
                                <span className="material-symbols-outlined text-[120px]">
                                    {user?.kycStatus === 'approved' ? 'verified_user' : 'badge'}
                                </span>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 ${user?.kycStatus === 'approved'
                                        ? 'bg-green-500 text-white'
                                        : user?.kycStatus === 'pending'
                                            ? 'bg-yellow-500 text-black'
                                            : user?.kycStatus === 'rejected'
                                                ? 'bg-red-500 text-white'
                                                : 'bg-brand-primary text-white shadow-glow'
                                        }`}>
                                        <span className="material-symbols-outlined text-2xl">
                                            {user?.kycStatus === 'approved' ? 'verified' :
                                                user?.kycStatus === 'pending' ? 'hourglass_top' :
                                                    user?.kycStatus === 'rejected' ? 'gpp_bad' : 'person_search'}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xl font-bold text-white tracking-tight">Identity Verification</h3>
                                            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${user?.kycStatus === 'approved'
                                                ? 'bg-green-500 text-white'
                                                : user?.kycStatus === 'pending'
                                                    ? 'bg-yellow-500 text-black'
                                                    : user?.kycStatus === 'rejected'
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-white/10 text-white/60'
                                                }`}>
                                                {user?.kycStatus ? user.kycStatus.replace('_', ' ') : 'NOT SUBMITTED'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-brand-muted leading-relaxed max-w-md">
                                            {user?.kycStatus === 'approved'
                                                ? (
                                                    <div className="flex flex-col gap-1">
                                                        <span>Your identity is verified. You have full access to all rental features.</span>
                                                        {user.kycVerifiedDate && (
                                                            <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest mt-1">
                                                                VALID UNTIL: {(() => {
                                                                    const d = new Date(user.kycVerifiedDate);
                                                                    d.setMonth(d.getMonth() + 3);
                                                                    return d.toLocaleDateString();
                                                                })()}
                                                            </span>
                                                        )}
                                                    </div>
                                                )
                                                : user?.kycStatus === 'pending'
                                                    ? 'Your documents are under review. This usually takes less than 24 hours.'
                                                    : user?.kycStatus === 'rejected'
                                                        ? 'Verification failed. Please review the reason and try again.'
                                                        : 'Complete your KYC to unlock rentals. It only takes 2 minutes and a valid ID.'}
                                        </p>
                                    </div>
                                </div>

                                {(!user?.kycStatus || user.kycStatus === 'not_submitted' || user.kycStatus === 'rejected') && (
                                    <button
                                        onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'kyc' } }))}
                                        className="bg-white text-black hover:bg-brand-primary hover:text-white px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 group"
                                    >
                                        Verify Identity
                                        <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Account Details Card */}
                    {activeTab === 'rentals' && (
                        <div className="bg-brand-card border border-brand-border rounded-2xl p-8 mb-6 shadow-xl relative overflow-hidden">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-white">Account details</h2>
                                <button
                                    onClick={() => setIsEditProfileModalOpen(true)}
                                    className="bg-brand-primary text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-brand-primaryHover transition-all shadow-glow flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                    Edit Profile
                                </button>
                            </div>


                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                    <div>
                                        <label className="text-sm font-semibold text-brand-muted block mb-2">Name</label>
                                        <p className="text-white">{user.name}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-brand-muted block mb-2">E-mail</label>
                                        <p className="text-white">{user.email}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                    <div>
                                        <label className="text-sm font-semibold text-brand-muted block mb-2">Phone</label>
                                        <p className="text-white">{user.phone || 'Not provided'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-brand-muted block mb-2">Joined Date</label>
                                        <p className="text-white">{user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>



                                {user.addresses && user.addresses.length > 0 ? (
                                    <>
                                        <div>
                                            <label className="text-sm font-semibold text-brand-muted block mb-2">Primary Address</label>
                                            <p className="text-white">{user.addresses.find(a => a.isDefault)?.address || user.addresses[0].address}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                            <div>
                                                <label className="text-sm font-semibold text-brand-muted block mb-2">City</label>
                                                <p className="text-white">{user.addresses.find(a => a.isDefault)?.city || user.addresses[0].city}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm font-semibold text-brand-muted block mb-2">Postal code</label>
                                                <p className="text-white">{user.addresses.find(a => a.isDefault)?.pincode || user.addresses[0].pincode}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('addresses')}
                                            className="text-brand-primary text-sm font-semibold hover:underline flex items-center gap-1 mt-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">settings</span>
                                            Manage all addresses ({user.addresses.length})
                                        </button>
                                    </>
                                ) : (
                                    <div className="bg-white/5 border border-dashed border-brand-border rounded-xl p-6 text-center">
                                        <span className="material-symbols-outlined text-brand-muted text-3xl mb-2 opacity-50">location_off</span>
                                        <p className="text-brand-muted text-sm mb-4">No addresses added yet. Add one to speed up checkout.</p>
                                        <button
                                            onClick={() => {
                                                setEditingAddress(undefined);
                                                setIsAddressModalOpen(true);
                                            }}
                                            className="bg-brand-primary/10 text-brand-primary text-sm px-6 py-2 rounded-lg font-bold hover:bg-brand-primary/20 transition-all border border-brand-primary/30"
                                        >
                                            Add First Address
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Referral Card */}
                    {activeTab === 'rentals' && (
                        <div className="bg-gradient-to-r from-brand-primary to-purple-600 rounded-2xl shadow-xl p-8 text-white mb-6">
                            <div className="flex items-start gap-6">
                                <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-4xl">card_giftcard</span>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-2">Refer to get ₹100 AvN DigiCash</h3>
                                    <p className="text-sm opacity-90 mb-4">
                                        Share referral link and your friend gets Flat 30% Off when they place their order and you get ₹100 AvN DigiCash once their order gets delivered!
                                    </p>
                                    <div className="bg-white/10 rounded-lg p-4 mb-4">
                                        <p className="text-xs opacity-75 mb-2">Share your referral link via:</p>
                                        <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2">
                                            <input
                                                type="text"
                                                value="https://avntech.in/?referral_code=nylss27pj&utm_sour"
                                                readOnly
                                                className="flex-1 bg-transparent text-gray-900 text-sm outline-none"
                                            />
                                            <button className="text-brand-primary font-semibold text-sm hover:underline">
                                                Copy
                                            </button>
                                        </div>
                                    </div>
                                    <button className="w-full bg-white text-brand-primary py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all flex items-center justify-center gap-2">
                                        <span className="material-symbols-outlined">share</span>
                                        Share invite link
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* My Rentals Content */}
                    {activeTab === 'my-rentals' && (
                        <div className="bg-brand-card border border-brand-border rounded-2xl p-8 shadow-xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">My Rental Devices</h3>
                                {user.kycStatus === 'approved' && (
                                    <span className="text-sm text-brand-muted">
                                        {activeRentals.length} Active {activeRentals.length === 1 ? 'Rental' : 'Rentals'}
                                    </span>
                                )}
                            </div>

                            {user.kycStatus !== 'approved' ? (
                                <div className={`rounded-2xl border p-8 flex flex-col items-center text-center gap-4 ${user.kycStatus === 'pending'
                                    ? 'bg-yellow-500/10 border-yellow-500/30'
                                    : user.kycStatus === 'rejected'
                                        ? 'bg-red-500/10 border-red-500/30'
                                        : 'bg-brand-primary/10 border-brand-primary/20'
                                    }`}>
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${user.kycStatus === 'pending'
                                        ? 'bg-yellow-500 text-black'
                                        : user.kycStatus === 'rejected'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-brand-primary text-white'
                                        }`}>
                                        <span className="material-symbols-outlined text-3xl">
                                            {user.kycStatus === 'pending' ? 'hourglass_top' : user.kycStatus === 'rejected' ? 'gpp_bad' : 'person_search'}
                                        </span>
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white mb-2">
                                            {user.kycStatus === 'pending'
                                                ? 'KYC Under Review'
                                                : user.kycStatus === 'rejected'
                                                    ? 'KYC Verification Failed'
                                                    : 'KYC Verification Required'}
                                        </h4>
                                        <p className="text-sm text-brand-muted max-w-md">
                                            {user.kycStatus === 'pending'
                                                ? 'Your identity documents are currently being reviewed by our team. Your rentals will appear here once your KYC is approved. This usually takes less than 24 hours.'
                                                : user.kycStatus === 'rejected'
                                                    ? 'Your KYC verification was not approved. Please re-submit your documents to access your rentals.'
                                                    : 'You need to complete identity verification before you can access rentals. It only takes 2 minutes.'}
                                        </p>
                                    </div>
                                    {(user.kycStatus !== 'pending') && (
                                        <button
                                            onClick={() => window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'kyc' } }))}
                                            className="mt-2 bg-white text-black hover:bg-brand-primary hover:text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center gap-2"
                                        >
                                            {user.kycStatus === 'rejected' ? 'Re-submit KYC' : 'Verify Identity'}
                                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </button>
                                    )}
                                </div>
                            ) : activeRentals.length > 0 ? (
                                <div className="space-y-4">
                                    {activeRentals.map(order =>
                                        order.items.filter(i => i.type === 'rent').map((item, idx) => (
                                            <div key={`${order.id}-${idx}`} className="border border-brand-border rounded-xl p-6 bg-black/20">
                                                <div className="flex items-start gap-6 mb-4">
                                                    <div className="w-24 h-24 bg-black/40 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-2" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-start justify-between mb-2">
                                                            <div>
                                                                <h4 className="font-bold text-white text-lg mb-1">{item.name}</h4>
                                                                <p className="text-sm text-brand-muted">Order ID: ORD_{order.id}</p>
                                                            </div>
                                                            <span className={`px-4 py-1.5 rounded-full text-xs font-semibold border ${order.status === 'Return Requested'
                                                                ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                                                                : 'bg-green-500/20 text-green-400 border-green-500/30'
                                                                }`}>
                                                                {order.status === 'Delivered' ? 'ACTIVE' : order.status}
                                                            </span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-4 text-sm mt-4">
                                                            <div>
                                                                <span className="text-brand-muted block mb-1">Rental Period</span>
                                                                <span className="font-semibold text-white">{item.tenure} Months</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-brand-muted block mb-1">Monthly Price</span>
                                                                <span className="font-semibold text-brand-primary">₹{item.price.toLocaleString()}</span>
                                                            </div>
                                                            <div>
                                                                <span className="text-brand-muted block mb-1">Ordered On</span>
                                                                <span className="font-semibold text-white">{order.date}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Management Actions */}
                                                <div className="flex items-center gap-3 pt-4 border-t border-brand-border">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRental({ orderId: order.id, item });
                                                            setIsExtendModalOpen(true);
                                                        }}
                                                        className="flex-1 bg-brand-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-brand-primaryHover transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">update</span>
                                                        Extend Rental
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRental({ orderId: order.id, item });
                                                            setIsReturnModalOpen(true);
                                                        }}
                                                        className="flex-1 border border-brand-border text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">assignment_return</span>
                                                        Request Return
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRental({ orderId: order.id, item });
                                                            setIsDetailsModalOpen(true);
                                                        }}
                                                        className="border border-brand-border text-brand-muted px-4 py-2.5 rounded-lg font-semibold hover:bg-white/5 hover:text-white transition-all flex items-center justify-center gap-2"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">info</span>
                                                        Details
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <span className="material-symbols-outlined text-6xl text-brand-muted mb-4 opacity-20">devices_off</span>
                                    <p className="text-brand-muted mb-2">No active rentals at the moment</p>
                                    <p className="text-sm text-brand-muted/60">Browse our catalog to start renting devices</p>
                                </div>
                            )}
                        </div>
                    )}


                    {/* Order History */}
                    {activeTab === 'orders' && (
                        <div className="bg-brand-card border border-brand-border rounded-2xl p-8 shadow-xl">
                            <h3 className="text-xl font-bold text-white mb-6">Order History</h3>
                            <div className="space-y-4">
                                {pastOrders.map(order => (
                                    <div key={order.id} className="border border-brand-border rounded-xl p-6 bg-black/20">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <p className="text-sm text-brand-muted mb-1">Order ID</p>
                                                <p className="font-mono font-semibold text-white">ORD_{order.id}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm text-brand-muted mb-1">Total Price</p>
                                                <p className="font-bold text-brand-primary text-xl">₹{order.total.toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3 mb-4">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-black/40 rounded-lg flex items-center justify-center flex-shrink-0">
                                                        <img src={item.image} className="w-full h-full object-contain p-2" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-white">{item.name}</p>
                                                        <p className="text-sm text-brand-muted">{item.type === 'rent' ? 'Rental' : 'Purchase'}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-brand-border">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${order.status === 'Delivered'
                                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                : 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30'
                                                }`}>
                                                {order.status}
                                            </span>
                                            <div className="flex items-center gap-4">
                                                {['Placed', 'Processing', 'Shipped'].includes(order.status) && (
                                                    <button
                                                        onClick={async () => {
                                                            if (confirm('Are you sure you want to cancel this order?')) {
                                                                try {
                                                                    await updateOrderStatus(order.id, 'Cancelled');
                                                                    showToast('Order cancelled successfully', 'success');
                                                                } catch (error: any) {
                                                                    showToast(error.message || 'Failed to cancel order', 'error');
                                                                }
                                                            }
                                                        }}
                                                        className="text-sm font-semibold text-red-400 hover:underline flex items-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">cancel</span>
                                                        Cancel Order
                                                    </button>
                                                )}

                                                {order.status === 'Delivered' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedRental({ orderId: order.id, item: order.items[0] });
                                                            setIsReturnModalOpen(true);
                                                        }}
                                                        className="text-sm font-semibold text-yellow-400 hover:underline flex items-center gap-1"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">assignment_return</span>
                                                        Request Return
                                                    </button>
                                                )}

                                                <button
                                                    onClick={async () => {
                                                        await generateInvoice(order, user);
                                                    }}
                                                    className="text-sm font-semibold text-brand-muted hover:text-white"
                                                >
                                                    Invoice
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedOrderForDetail(order);
                                                        setIsOrderDetailModalOpen(true);
                                                    }}
                                                    className="bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-primary hover:text-white transition-all"
                                                >
                                                    View Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Addresses Management */}
                    {activeTab === 'addresses' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {user.addresses && user.addresses.length > 0 ? (
                                    user.addresses.map((address) => (
                                        <div
                                            key={address.id}
                                            className={`bg-brand-card border rounded-2xl p-6 shadow-xl transition-all relative group ${address.isDefault ? 'border-brand-primary' : 'border-brand-border'
                                                }`}
                                        >
                                            {address.isDefault && (
                                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-lg z-10">
                                                    Default Address
                                                </div>
                                            )}

                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-brand-primary">
                                                        {address.label === 'Home' ? 'home' : address.label === 'Office' ? 'work' : 'family_restroom'}
                                                    </span>
                                                    <span className="text-xs font-bold text-brand-primary uppercase tracking-widest">{address.label}</span>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => {
                                                            setEditingAddress(address);
                                                            setIsAddressModalOpen(true);
                                                        }}
                                                        className="p-1.5 hover:bg-white/5 rounded-lg text-brand-muted hover:text-white transition-all"
                                                        title="Edit Address"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteConfirmId(address.id)}
                                                        className="p-1.5 hover:bg-red-400/10 rounded-lg text-brand-muted hover:text-red-400 transition-all"
                                                        title="Delete Address"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mb-6">
                                                <h3 className="text-base font-bold text-white mb-2">{address.recipientName || user.name}</h3>
                                                <p className="text-sm text-brand-muted leading-relaxed line-clamp-2 mb-1">{address.address}</p>
                                                <p className="text-sm text-brand-muted">{address.city}, {address.state || 'India'} - {address.pincode}</p>
                                                <p className="text-xs text-brand-muted/60 mt-2 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-xs">call</span>
                                                    {address.phone}
                                                </p>
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                {!address.isDefault && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                await setDefaultAddress(address.id);
                                                                showToast('Default address updated!');
                                                            } catch (error: any) {
                                                                showToast(error.message || 'Failed to update default address', 'error');
                                                            }
                                                        }}
                                                        className="w-full border border-brand-border text-white py-2 rounded-xl text-xs font-bold hover:bg-white/5 transition-all"
                                                    >
                                                        Set as Default
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setEditingAddress(address);
                                                        setIsAddressModalOpen(true);
                                                    }}
                                                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${address.isDefault
                                                        ? 'bg-brand-primary text-white hover:bg-brand-primaryHover'
                                                        : 'bg-white/5 text-white hover:bg-white/10'
                                                        }`}
                                                >
                                                    Edit Details
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full bg-brand-card border border-brand-border rounded-2xl p-12 shadow-xl text-center">
                                        <span className="material-symbols-outlined text-6xl text-brand-muted mb-4 opacity-20">location_off</span>
                                        <p className="text-brand-muted">No addresses added yet</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-center">
                                <button
                                    onClick={() => {
                                        setEditingAddress(undefined);
                                        setIsAddressModalOpen(true);
                                    }}
                                    className="bg-brand-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-brand-primaryHover transition-all shadow-glow"
                                >
                                    Add a new address
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Rental Preferences Management */}
                    {activeTab === 'rental-preferences' && (
                        <div className="bg-brand-card border border-brand-border rounded-2xl p-8 shadow-xl">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold text-white">Rental Payment Preferences</h2>
                                <button
                                    onClick={() => setIsPaymentModalOpen(true)}
                                    className="bg-brand-primary text-white text-sm px-4 py-2 rounded-lg font-semibold hover:bg-brand-primaryHover transition-all shadow-glow flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                    Update Preferences
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white/5 border border-brand-border rounded-xl p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center">
                                            <span className="material-symbols-outlined text-2xl">
                                                {user.rentalPreferences?.depositMethod === 'card' ? 'credit_card' :
                                                    user.rentalPreferences?.depositMethod === 'upi' ? 'qr_code' : 'account_balance'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="text-xs text-brand-muted font-bold uppercase tracking-wider">Preferred Method</p>
                                            <p className="text-lg font-bold text-white capitalize">
                                                {user.rentalPreferences?.depositMethod?.replace('_', ' ') || 'Not Configured'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-brand-border/50">
                                        {user.rentalPreferences?.depositMethod === 'upi' && (
                                            <div>
                                                <label className="text-xs font-semibold text-brand-muted block mb-1">UPI ID</label>
                                                <p className="text-white font-mono">{user.rentalPreferences.upiId || 'Not provided'}</p>
                                            </div>
                                        )}
                                        {user.rentalPreferences?.depositMethod === 'card' && (
                                            <div>
                                                <label className="text-xs font-semibold text-brand-muted block mb-1">Saved Card</label>
                                                <p className="text-white font-mono flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-sm">credit_card</span>
                                                    •••• •••• •••• {user.rentalPreferences.cardLast4 || '****'}
                                                </p>
                                            </div>
                                        )}
                                        {!user.rentalPreferences?.depositMethod && (
                                            <p className="text-sm text-brand-muted italic">Configure your payment method for a faster rental experience.</p>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-brand-primary/5 border border-brand-primary/20 rounded-xl p-6">
                                    <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-brand-primary text-lg">info</span>
                                        Why configure this?
                                    </h4>
                                    <ul className="space-y-3">
                                        {[
                                            'Faster checkout for future rentals',
                                            'Seamless security deposit refunds',
                                            'Automated monthly rental payments',
                                            'Securely stored preferences'
                                        ].map((text, i) => (
                                            <li key={i} className="flex items-start gap-2 text-xs text-brand-muted">
                                                <span className="material-symbols-outlined text-brand-primary text-[14px] mt-0.5">check_circle</span>
                                                {text}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Support */}
                    {activeTab === 'support' && (
                        <div className="bg-brand-card border border-brand-border rounded-2xl p-8 shadow-xl">
                            <h3 className="text-xl font-bold text-white mb-6">Need help?</h3>
                            <div className="space-y-4 mb-6">
                                <input
                                    type="text"
                                    placeholder="Subject (e.g., Product delivery delay)"
                                    value={ticketSubject}
                                    onChange={(e) => setTicketSubject(e.target.value)}
                                    className="w-full bg-black/40 border border-brand-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all placeholder:text-gray-500"
                                />
                                <textarea
                                    placeholder="Description (e.g., My order #12345 is delayed...)"
                                    value={ticketDescription}
                                    onChange={(e) => setTicketDescription(e.target.value)}
                                    className="w-full bg-black/40 border border-brand-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-all placeholder:text-gray-500 min-h-[120px] resize-none"
                                />
                                <button
                                    onClick={() => {
                                        if (ticketSubject && ticketDescription) {
                                            addTicket(ticketSubject, ticketDescription);
                                            setTicketSubject("");
                                            setTicketDescription("");
                                        }
                                    }}
                                    className="bg-brand-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-brand-primaryHover transition-all shadow-glow"
                                >
                                    Send Message
                                </button>
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-semibold text-white">Support History</h4>
                                {tickets.map(ticket => (
                                    <div key={ticket.id} className="border border-brand-border rounded-xl p-6 bg-black/20 flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${ticket.status === 'Open' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-green-500/20 text-green-400'
                                                }`}>
                                                <span className="material-symbols-outlined text-xl">
                                                    {ticket.status === 'Open' ? 'mail' : 'done'}
                                                </span>
                                            </div>
                                            <div>
                                                <h5 className="font-semibold text-white">{ticket.subject}</h5>
                                                <p className="text-sm text-brand-muted mt-1">{ticket.description}</p>
                                                <p className="text-xs text-gray-500 mt-2">Ticket {ticket.id} • Created on {ticket.date}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ticket.status === 'Open' ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30' :
                                            ticket.status === 'Resolved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                                ticket.status === 'In Progress' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
                                                    'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                            }`}>
                                            {ticket.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modals remain the same */}
            {isAddressModalOpen && (
                <AddressModal
                    onClose={() => {
                        setIsAddressModalOpen(false);
                        setEditingAddress(undefined);
                    }}
                    editAddress={editingAddress}
                    onSuccess={(message) => showToast(message)}
                />
            )}

            {deleteConfirmId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)} />
                    <div className="relative bg-brand-card border border-brand-border rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-4">Delete Address?</h3>
                        <p className="text-brand-muted text-sm mb-6">
                            Are you sure you want to delete this address? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 py-3 rounded-xl text-sm font-bold text-brand-muted hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        await removeAddress(deleteConfirmId);
                                        showToast('Address deleted successfully!');
                                        setDeleteConfirmId(null);
                                    } catch (error: any) {
                                        showToast(error.message || 'Failed to delete address', 'error');
                                        setDeleteConfirmId(null);
                                    }
                                }}
                                className="flex-1 bg-red-500 text-white py-3 rounded-xl text-sm font-bold hover:bg-red-600 transition-all"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isPaymentModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsPaymentModalOpen(false)} />
                    <div className="relative bg-brand-card border border-brand-border rounded-2xl p-8 w-full max-w-md shadow-2xl">
                        <h3 className="text-xl font-bold text-white mb-6">Payment Preference</h3>
                        <p className="text-brand-muted text-sm mb-6">Select your preferred method for monthly rental payments and security deposit refunds.</p>

                        <div className="flex flex-col gap-3 mb-6">
                            {[
                                { id: 'card', label: 'Credit/Debit Card', icon: 'credit_card' },
                                { id: 'upi', label: 'UPI / VPA', icon: 'qr_code' },
                                { id: 'net_banking', label: 'Net Banking', icon: 'account_balance' }
                            ].map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => {
                                        setSelectedMethod(method.id as any);
                                        if (method.id === 'upi') setUpiId(user?.rentalPreferences?.upiId || '');
                                    }}
                                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${selectedMethod === method.id
                                        ? 'bg-brand-primary/20 border-brand-primary'
                                        : 'bg-white/5 hover:bg-white/10 border-brand-border'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedMethod === method.id
                                        ? 'bg-brand-primary text-white'
                                        : 'bg-black/40 text-brand-primary'
                                        }`}>
                                        <span className="material-symbols-outlined">{method.icon}</span>
                                    </div>
                                    <span className="font-semibold text-white">{method.label}</span>
                                </button>
                            ))}
                        </div>

                        {selectedMethod === 'upi' ? (
                            <div className="mb-6">
                                <label className="text-brand-muted text-sm font-semibold block mb-2">
                                    UPI ID (Optional)
                                </label>
                                <input
                                    type="text"
                                    placeholder="yourname@upi"
                                    value={upiId}
                                    onChange={(e) => setUpiId(e.target.value)}
                                    className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-primary transition-all"
                                />
                                <p className="text-gray-500 text-xs mt-2">Enter your UPI ID for faster checkout</p>
                            </div>
                        ) : selectedMethod === 'card' ? (
                            <div className="mb-6 space-y-4">
                                <div>
                                    <label className="text-brand-muted text-sm font-semibold block mb-2">Card Number</label>
                                    <input
                                        type="text"
                                        placeholder="0000 0000 0000 0000"
                                        value={cardNumber}
                                        onChange={(e) => setCardNumber(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                                        maxLength={19}
                                        className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-primary transition-all font-mono"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-brand-muted text-sm font-semibold block mb-2">Expiry</label>
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            value={cardExpiry}
                                            onChange={(e) => setCardExpiry(e.target.value)}
                                            maxLength={5}
                                            className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-primary transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-brand-muted text-sm font-semibold block mb-2">CVC</label>
                                        <div className="relative">
                                            <input
                                                type={showCvc ? "text" : "password"}
                                                placeholder="***"
                                                value={cardCvc}
                                                onChange={(e) => setCardCvc(e.target.value)}
                                                maxLength={3}
                                                className="w-full bg-black/40 border border-brand-border rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-brand-primary transition-all pr-12"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCvc(!showCvc)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-primary hover:text-white transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">
                                                    {showCvc ? 'visibility_off' : 'visibility'}
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gray-500 text-[10px] italic">Only card ending digits are stored. Actual sensitive data is processed securely.</p>
                            </div>
                        ) : (
                            <div className="mb-6 bg-black/20 p-4 rounded-xl border border-brand-border">
                                <p className="text-sm text-brand-muted text-center italic">Selected: Net Banking. Details will be collected during checkout.</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setIsPaymentModalOpen(false)}
                                className="flex-1 py-3 rounded-xl text-sm font-bold text-brand-muted hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    try {
                                        const prefs = {
                                            depositMethod: selectedMethod,
                                            isOnboardingComplete: true,
                                            upiId: selectedMethod === 'upi' ? (upiId || undefined) : undefined,
                                            cardLast4: selectedMethod === 'card' ? (cardNumber.replace(/\s/g, '').slice(-4)) : undefined
                                        };
                                        await updateRentalPreferences(prefs);
                                        showToast('Payment preferences saved successfully!');
                                        setIsPaymentModalOpen(false);
                                    } catch (error: any) {
                                        showToast(error.message || 'Failed to save preferences', 'error');
                                    }
                                }}
                                className="flex-1 bg-brand-primary text-white py-3 rounded-xl text-sm font-bold hover:bg-brand-primaryHover transition-all shadow-glow"
                            >
                                Save Preferences
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Extend Rental Modal */}
            {isExtendModalOpen && selectedRental && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-brand-card border border-brand-border rounded-2xl max-w-md w-full p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Extend Rental Period</h3>
                            <button
                                onClick={() => {
                                    setIsExtendModalOpen(false);
                                    setSelectedRental(null);
                                }}
                                className="text-brand-muted hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-brand-muted mb-4">
                                Extend rental period for <span className="text-white font-semibold">{selectedRental.item.name}</span>
                            </p>

                            <label className="block text-sm font-medium text-white mb-2">
                                Extension Period
                            </label>
                            <select
                                value={extensionMonths}
                                onChange={(e) => setExtensionMonths(Number(e.target.value))}
                                className="w-full bg-black/40 border border-brand-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-colors"
                            >
                                <option value={3} style={{ backgroundColor: 'white', color: 'black' }}>3 Months</option>
                                <option value={6} style={{ backgroundColor: 'white', color: 'black' }}>6 Months</option>
                                <option value={9} style={{ backgroundColor: 'white', color: 'black' }}>9 Months</option>
                                <option value={12} style={{ backgroundColor: 'white', color: 'black' }}>12 Months</option>
                            </select>

                            <div className="mt-4 bg-black/20 border border-brand-border rounded-lg p-4">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-brand-muted">Monthly Price:</span>
                                    <span className="text-white font-semibold">₹{selectedRental.item.price.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-brand-muted">Extension Cost:</span>
                                    <span className="text-brand-primary font-bold">₹{(selectedRental.item.price * extensionMonths).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsExtendModalOpen(false);
                                    setSelectedRental(null);
                                }}
                                className="flex-1 border border-brand-border text-white py-3 rounded-lg font-semibold hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExtendRental}
                                className="flex-1 bg-brand-primary text-white py-3 rounded-lg font-semibold hover:bg-brand-primaryHover transition-all shadow-glow"
                            >
                                Confirm Extension
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Request Return Modal */}
            {isReturnModalOpen && selectedRental && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-brand-card border border-brand-border rounded-2xl max-w-md w-full p-8 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Request Return</h3>
                            <button
                                onClick={() => {
                                    setIsReturnModalOpen(false);
                                    setSelectedRental(null);
                                    setReturnReason('');
                                }}
                                className="text-brand-muted hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <div className="mb-6">
                            <p className="text-sm text-brand-muted mb-4">
                                Request return for <span className="text-white font-semibold">{selectedRental.item.name}</span>
                            </p>

                            <label className="block text-sm font-medium text-white mb-2">
                                Reason for Return <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={returnReason}
                                onChange={(e) => setReturnReason(e.target.value)}
                                placeholder="Please provide a reason for returning this device..."
                                rows={4}
                                className="w-full bg-black/40 border border-brand-border rounded-lg px-4 py-3 text-white placeholder-brand-muted/50 focus:outline-none focus:border-brand-primary transition-colors resize-none"
                            />

                            <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                                <div className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-yellow-400 text-lg">info</span>
                                    <p className="text-xs text-yellow-200">
                                        Our team will review your request and contact you within 24-48 hours to arrange pickup.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setIsReturnModalOpen(false);
                                    setSelectedRental(null);
                                    setReturnReason('');
                                }}
                                className="flex-1 border border-brand-border text-white py-3 rounded-lg font-semibold hover:bg-white/5 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRequestReturn}
                                className="flex-1 bg-brand-primary text-white py-3 rounded-lg font-semibold hover:bg-brand-primaryHover transition-all shadow-glow"
                            >
                                Submit Request
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rental Details Modal */}
            {isDetailsModalOpen && selectedRental && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-brand-card border border-brand-border rounded-2xl max-w-2xl w-full p-8 shadow-2xl my-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-white">Rental Details</h3>
                            <button
                                onClick={() => {
                                    setIsDetailsModalOpen(false);
                                    setSelectedRental(null);
                                }}
                                className="text-brand-muted hover:text-white transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Product Info */}
                        <div className="flex items-start gap-6 mb-6 pb-6 border-b border-brand-border">
                            <div className="w-32 h-32 bg-black/40 rounded-lg flex items-center justify-center flex-shrink-0">
                                <img src={selectedRental.item.image} alt={selectedRental.item.name} className="w-full h-full object-contain p-3" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-white text-xl mb-2">{selectedRental.item.name}</h4>
                                <p className="text-sm text-brand-muted mb-3">Order ID: ORD_{selectedRental.orderId}</p>
                                <div className="flex items-center gap-3">
                                    <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold border border-green-500/30">
                                        ACTIVE
                                    </span>
                                    <span className="text-sm text-brand-muted">
                                        Rented on: {orders.find(o => o.id === selectedRental.orderId)?.date}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Rental Information */}
                        <div className="space-y-6">
                            {/* Rental Timeline */}
                            <div>
                                <h5 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-brand-primary">schedule</span>
                                    Rental Timeline
                                </h5>
                                <div className="grid grid-cols-2 gap-4 bg-black/20 border border-brand-border rounded-lg p-4">
                                    <div>
                                        <p className="text-xs text-brand-muted mb-1">Rental Period</p>
                                        <p className="text-sm font-semibold text-white">{selectedRental.item.tenure} Months</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-brand-muted mb-1">Start Date</p>
                                        <p className="text-sm font-semibold text-white">{orders.find(o => o.id === selectedRental.orderId)?.date}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-brand-muted mb-1">End Date</p>
                                        <p className="text-sm font-semibold text-white">
                                            {new Date(new Date(orders.find(o => o.id === selectedRental.orderId)?.date || '').getTime() + selectedRental.item.tenure * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-brand-muted mb-1">Remaining Days</p>
                                        <p className="text-sm font-semibold text-brand-primary">
                                            {Math.max(0, Math.ceil((new Date(new Date(orders.find(o => o.id === selectedRental.orderId)?.date || '').getTime() + selectedRental.item.tenure * 30 * 24 * 60 * 60 * 1000).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div>
                                <h5 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-brand-primary">payments</span>
                                    Payment Details
                                </h5>
                                <div className="bg-black/20 border border-brand-border rounded-lg p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-brand-muted">Monthly Rental</span>
                                        <span className="text-sm font-semibold text-white">₹{selectedRental.item.price.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-brand-muted">Total Rental Cost</span>
                                        <span className="text-sm font-semibold text-white">₹{(selectedRental.item.price * selectedRental.item.tenure).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-brand-border">
                                        <span className="text-sm text-brand-muted">Payment Status</span>
                                        <span className="text-sm font-semibold text-green-400">Paid</span>
                                    </div>
                                </div>
                            </div>

                            {/* Product Specifications */}
                            {selectedRental.item.specs && (
                                <div>
                                    <h5 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-brand-primary">settings</span>
                                        Product Specifications
                                    </h5>
                                    <div className="bg-black/20 border border-brand-border rounded-lg p-4">
                                        <div className="grid grid-cols-2 gap-3 text-sm">
                                            {Object.entries(selectedRental.item.specs).map(([key, value]) => (
                                                <div key={key}>
                                                    <span className="text-brand-muted capitalize">{key}: </span>
                                                    <span className="text-white font-medium">{value as string}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Terms & Conditions */}
                            <div>
                                <h5 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-brand-primary">description</span>
                                    Terms & Conditions
                                </h5>
                                <div className="bg-black/20 border border-brand-border rounded-lg p-4">
                                    <ul className="text-xs text-brand-muted space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-xs mt-0.5">check_circle</span>
                                            <span>Device must be returned in original condition</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-xs mt-0.5">check_circle</span>
                                            <span>Security deposit will be refunded after inspection</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-xs mt-0.5">check_circle</span>
                                            <span>Extension requests must be made 7 days before rental end date</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="material-symbols-outlined text-xs mt-0.5">check_circle</span>
                                            <span>Early return requests are subject to approval</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-brand-border">
                            <button
                                onClick={() => {
                                    setIsDetailsModalOpen(false);
                                    setSelectedRental(null);
                                }}
                                className="w-full bg-brand-primary text-white py-3 rounded-lg font-semibold hover:bg-brand-primaryHover transition-all shadow-glow"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Details Modal (History) */}
            {isOrderDetailModalOpen && selectedOrderForDetail && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-brand-card border border-brand-border rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-brand-border flex items-center justify-between bg-white/5">
                            <div>
                                <h3 className="text-xl font-bold text-white">Order Details</h3>
                                <p className="text-sm text-brand-muted">ORD_{selectedOrderForDetail.id} • {selectedOrderForDetail.date}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsOrderDetailModalOpen(false);
                                    setSelectedOrderForDetail(null);
                                }}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-brand-muted hover:bg-white/10 hover:text-white transition-all"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                            {/* Status Timeline */}
                            <div className="relative">
                                <div className="flex justify-between items-center mb-4">
                                    {['Placed', 'Processing', 'Shipped', 'Delivered'].map((step, idx) => {
                                        const statuses = ['Placed', 'Processing', 'Shipped', 'Delivered'];
                                        const currentIdx = statuses.indexOf(selectedOrderForDetail.status);
                                        const isCompleted = idx <= currentIdx;
                                        const isCurrent = idx === currentIdx;

                                        return (
                                            <div key={step} className="flex flex-col items-center relative z-10">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all duration-500 ${isCompleted ? 'bg-brand-primary text-white shadow-glow' : 'bg-white/10 text-brand-muted border border-brand-border'
                                                    }`}>
                                                    {isCompleted ? <span className="material-symbols-outlined text-sm">check</span> : idx + 1}
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${isCurrent ? 'text-brand-primary' : isCompleted ? 'text-white' : 'text-brand-muted'
                                                    }`}>{step}</span>
                                            </div>
                                        );
                                    })}
                                    {/* Timeline Line */}
                                    <div className="absolute top-4 left-0 right-0 h-[2px] bg-white/10 -z-0">
                                        <div
                                            className="h-full bg-brand-primary transition-all duration-1000 ease-out"
                                            style={{
                                                width: `${Math.max(0, (['Placed', 'Processing', 'Shipped', 'Delivered'].indexOf(selectedOrderForDetail.status) / 3) * 100)}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Shipping Info */}
                                <div className="space-y-4">
                                    <div className="bg-white/5 border border-brand-border rounded-xl p-5">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-3">Shipping Details</h4>
                                        <div className="flex items-start gap-3">
                                            <span className="material-symbols-outlined text-brand-muted text-lg">location_on</span>
                                            <div>
                                                <p className="text-sm font-bold text-white mb-1">{user.name}</p>
                                                <p className="text-sm text-brand-muted leading-relaxed">
                                                    {selectedOrderForDetail.address}
                                                </p>
                                                <p className="text-xs text-brand-muted mt-2">Method: <span className="text-white font-medium capitalize">{selectedOrderForDetail.deliveryMethod || 'Delivery'}</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Info */}
                                    <div className="bg-white/5 border border-brand-border rounded-xl p-5">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-3">Payment Info</h4>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-brand-muted">Method</span>
                                            <span className="text-sm font-bold text-white capitalize">{selectedOrderForDetail.paymentMethod || 'Card'}</span>
                                        </div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm text-brand-muted">Status</span>
                                            <span className="text-sm font-bold text-green-400">Paid</span>
                                        </div>
                                        {selectedOrderForDetail.transactionId && (
                                            <div className="flex items-center justify-between pt-2 border-t border-brand-border/50">
                                                <span className="text-sm text-brand-muted">Transaction ID</span>
                                                <span className="text-[10px] font-mono text-brand-muted">{selectedOrderForDetail.transactionId}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Items List */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary px-1">Order Items</h4>
                                    <div className="space-y-3">
                                        {selectedOrderForDetail.items.map((item: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-brand-border/30">
                                                <div className="w-14 h-14 bg-black/40 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <img src={item.image} className="w-full h-full object-contain p-1.5" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-white truncate">{item.name}</p>
                                                    <p className="text-xs text-brand-muted">{item.type === 'rent' ? `Rental • ${item.tenure}M` : 'Purchase'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-black text-white">₹{item.price.toLocaleString()}</p>
                                                    <p className="text-[10px] text-brand-muted">Qty: {item.quantity || 1}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Cost Breakdown */}
                            <div className="bg-brand-primary/10 border border-brand-primary/20 rounded-2xl p-6">
                                <h4 className="text-xs font-black uppercase tracking-widest text-brand-primary mb-4">Cost Breakdown</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-brand-muted">Items Subtotal</span>
                                        <span className="text-white">₹{(selectedOrderForDetail.items.reduce((acc: number, item: any) => acc + (item.price * (item.quantity || 1)), 0)).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-brand-muted">Shipping & Handling</span>
                                        <span className="text-green-400 font-bold">FREE</span>
                                    </div>
                                    {selectedOrderForDetail.items.some((i: any) => i.type === 'rent') && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-brand-muted">Security Deposit (Refundable)</span>
                                            <span className="text-white">₹{selectedOrderForDetail.depositAmount?.toLocaleString() || (selectedOrderForDetail.items.filter((i: any) => i.type === 'rent').length * 200).toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-brand-muted">GST (Included)</span>
                                        <span className="text-white">₹{(selectedOrderForDetail.total * 0.18).toLocaleString()}</span>
                                    </div>
                                    <div className="pt-4 mt-2 border-t border-brand-primary/30 flex justify-between items-center">
                                        <span className="text-lg font-bold text-white">Total Amount</span>
                                        <span className="text-2xl font-black text-brand-primary">₹{selectedOrderForDetail.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-brand-border bg-white/5 flex gap-4">
                            <button
                                onClick={async () => await generateInvoice(selectedOrderForDetail, user)}
                                className="flex-1 border border-brand-border text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">download</span>
                                Download Invoice
                            </button>
                            {['Placed', 'Processing', 'Shipped'].includes(selectedOrderForDetail.status) && (
                                <button
                                    onClick={async () => {
                                        if (confirm('Are you sure you want to cancel this order?')) {
                                            try {
                                                await updateOrderStatus(selectedOrderForDetail.id, 'Cancelled');
                                                showToast('Order cancelled successfully', 'success');
                                                setIsOrderDetailModalOpen(false);
                                            } catch (error: any) {
                                                showToast(error.message || 'Failed to cancel order', 'error');
                                            }
                                        }
                                    }}
                                    className="flex-1 bg-red-400/10 text-red-400 px-6 py-3 rounded-xl font-bold text-sm hover:bg-red-400 hover:text-white transition-all"
                                >
                                    Cancel Order
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <EditProfileModal
                isOpen={isEditProfileModalOpen}
                onClose={() => setIsEditProfileModalOpen(false)}
            />
        </div>
    );
}
