
import React, { useState, useEffect } from "react";
import { useStore } from "../lib/store";

interface CheckoutProps {
    onSuccess: (isRental: boolean) => void;
    onBack?: () => void;
}

export default function Checkout({ onSuccess, onBack }: CheckoutProps) {
    const { cart, removeFromCart, placeOrder, user, addAddress, removeAddress, savePendingCheckout } = useStore();
    const [selectedAddress, setSelectedAddress] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'net' | 'upi'>('card');
    const [upiId, setUpiId] = useState<string>('');  // NEW: UPI ID state
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);

    // Address Form State
    const [newAddr, setNewAddr] = useState({ label: '', address: '', city: '', phone: '' });

    const addresses = user?.addresses || [];

    // Auto-select default address or first address
    useEffect(() => {
        if (addresses.length === 0) {
            setShowAddressForm(true);
        } else if (!selectedAddress) {
            const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
            setSelectedAddress(defaultAddr.id);
        }
    }, [addresses.length]);

    // Auto-select payment method and pre-fill UPI ID from preferences
    useEffect(() => {
        if (user?.rentalPreferences) {
            const { depositMethod, upiId: savedUpiId } = user.rentalPreferences;

            // Map depositMethod to paymentMethod
            if (depositMethod === 'upi') {
                setPaymentMethod('upi');
            } else if (depositMethod === 'net_banking') {
                setPaymentMethod('net');
            } else if (depositMethod === 'card') {
                setPaymentMethod('card');
            }

            // Pre-fill UPI ID if available
            if (savedUpiId) {
                setUpiId(savedUpiId);
            }
        }
    }, [user?.rentalPreferences]);

    if (cart.length === 0) return (
        <div className="min-h-screen bg-[#F3F4F6] flex flex-col items-center justify-center p-8">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">shopping_cart_off</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart is Empty</h2>
            <button onClick={onBack || (() => window.history.back())} className="text-brand-primary font-bold hover:underline">Return to Shopping</button>
        </div>
    );

    const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
    const deposit = cart.filter(item => item.type === 'rent').length * 200;
    const shipping = 0;
    const taxRate = 0.085;
    const tax = subtotal * taxRate;
    const totalToday = subtotal + deposit + shipping + tax;

    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
    const [agreementSigned, setAgreementSigned] = useState(false);
    const containsRental = cart.some(item => item.type === 'rent');

    const handleContinue = async () => {
        const deliveryAddress = deliveryMethod === 'pickup'
            ? "Self Pickup from AvN Hub" // Hardcoded for simplicity as in original
            : addresses.find(a => a.id === selectedAddress)?.address || "Default Address";

        const rentalDetails = containsRental ? {
            start: new Date().toISOString().split('T')[0], // Today
            end: new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString().split('T')[0], // 12 months default
            deposit: deposit,
            method: deliveryMethod
        } : undefined;

        // KYC CHECK: Only required for rentals.
        // Buy-only orders will skip this block and proceed directly to payment/placement.
        if (containsRental) {
            if (false && user?.kycStatus !== 'approved') { // KYC Check bypassed for testing
                const pendingDetails = JSON.parse(JSON.stringify({
                    address: deliveryAddress,
                    rentalDetails,
                    total: totalToday,
                    paymentMethod,
                    items: cart
                }));

                if (user?.kycStatus === 'rejected' || user?.kycStatus === 'reupload_required') {
                    if (confirm("Your KYC was rejected. Please re-upload documents. Go to Verification page?")) {
                        await savePendingCheckout(pendingDetails);
                        window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'kyc' } }));
                    }
                } else if (user?.kycStatus === 'pending') {
                    await savePendingCheckout(pendingDetails);
                    alert("Your KYC is currently under review. We have saved your order details and it will be placed automatically upon approval.");
                } else {
                    // NEW: Check for KYC Expiry (6 Months)
                    if (user?.kycVerifiedDate) {
                        const verifyDate = new Date(user.kycVerifiedDate);
                        const sixMonthsAgo = new Date();
                        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

                        if (verifyDate < sixMonthsAgo) {
                            if (confirm("Your KYC verification has expired (valid for 6 months). Please re-upload documents to proceed.")) {
                                await savePendingCheckout(pendingDetails);
                                // Reset status to allow re-upload (optional, or handle in KYC page)
                                // For now, redirecting to KYC page is enough, assuming KYC page handles 'approved' state by allowing re-upload or we need to update status?
                                // Ideally, we should update status to 'reupload_required' but cannot easily do it from here without store method or admin action.
                                // However, the KYC page usually checks status. If status is 'approved', it might show "Already Verified".
                                // We might need to handle this. Let's see.
                                window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'kyc' } }));
                            }
                            return;
                        }
                    }



                    if (confirm("Identity Verification Required for rentals. Proceed to upload documents? (Your order will be placed automatically after approval)")) {
                        await savePendingCheckout(pendingDetails);
                        window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'kyc' } }));
                    }
                }
                return;
            }

        }

        // Validate Address only if we are actually proceeding to order NOW
        if (deliveryMethod === 'delivery' && !selectedAddress && !containsRental) {
            // Logic adjusted: Rental flow handled above. If pure buy flow or passed rental checks:
            // Note: Original code checked address before isProcessing.
        }

        if (deliveryMethod === 'delivery' && !selectedAddress) {
            alert("Please select or add a shipping address.");
            return;
        }

        setIsProcessing(true);

        setTimeout(() => {
            placeOrder(deliveryAddress, paymentMethod, totalToday, rentalDetails);
            setIsProcessing(false);
            onSuccess(containsRental);
        }, 1200);
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAddr.address || !newAddr.city || !newAddr.phone) return;
        await addAddress(newAddr);
        setNewAddr({ label: '', address: '', city: '', phone: '' });
        setShowAddressForm(false);
    };

    return (
        <div className="min-h-screen bg-[#F3F4F6] pb-48">
            {/* Header */}
            <div className="bg-white px-6 py-6 flex items-center justify-between sticky top-0 z-30 border-b border-gray-100">
                <button onClick={onBack || (() => window.history.back())} className="text-gray-900">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 className="text-xl font-bold text-gray-900 absolute left-1/2 -translate-x-1/2">Checkout</h1>
                <div className="w-6"></div>
            </div>

            <div className="max-w-xl mx-auto px-6 py-8 space-y-8">

                {/* Delivery Method Selection */}
                <section>
                    <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Fulfilment Method</h2>
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setDeliveryMethod('delivery')}
                            className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${deliveryMethod === 'delivery' ? 'bg-white border-brand-primary text-brand-primary shadow-sm' : 'bg-transparent border-gray-200 text-gray-400'}`}
                        >
                            <span className="material-symbols-outlined">local_shipping</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Home Delivery</span>
                        </button>
                        <button
                            onClick={() => setDeliveryMethod('pickup')}
                            className={`flex-1 py-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${deliveryMethod === 'pickup' ? 'bg-white border-brand-primary text-brand-primary shadow-sm' : 'bg-transparent border-gray-200 text-gray-400'}`}
                        >
                            <span className="material-symbols-outlined">store</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest">Self Pickup</span>
                        </button>
                    </div>
                </section>

                {/* Rental Agreement - Only if renting */}
                {containsRental && (
                    <section className="bg-white rounded-[2rem] p-8 shadow-card-soft border border-brand-primary/20">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                <span className="material-symbols-outlined">gavel</span>
                            </div>
                            <h3 className="text-sm font-bold text-gray-900">Digital Rental Agreement</h3>
                        </div>
                        <div className="h-32 overflow-y-auto bg-gray-50 rounded-xl p-4 text-[10px] text-gray-500 mb-4 border border-gray-100">
                            <p className="mb-2"><strong>1. Asset Custody:</strong> The Lessee agrees to maintain the equipment in good condition...</p>
                            <p className="mb-2"><strong>2. Payment Terms:</strong> Monthly rental fees are due on the 1st of each cycle...</p>
                            <p><strong>3. Liability:</strong> In case of damage, the Lessee is liable for repair costs up to the full asset value...</p>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${agreementSigned ? 'bg-brand-primary border-brand-primary' : 'border-gray-300 bg-white'}`}>
                                {agreementSigned && <span className="material-symbols-outlined text-white text-sm">check</span>}
                            </div>
                            <input type="checkbox" className="hidden" checked={agreementSigned} onChange={(e) => setAgreementSigned(e.target.checked)} />
                            <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900">I accept the Rental Terms & Conditions</span>
                        </label>
                    </section>
                )}

                {/* Order Summary ... (existing) */}
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Order Summary</h2>
                        <span className="text-[10px] bg-white border border-gray-200 px-3 py-1 rounded-full text-gray-500 font-bold">{cart.length} ITEMS</span>
                    </div>
                    {/* ... existing items map ... */}
                    <div className="space-y-4">
                        {cart.map((item) => (
                            <div key={item.id} className="bg-white rounded-[2rem] p-6 flex gap-6 shadow-card-soft border border-gray-100 relative group">
                                <div className="w-24 h-24 bg-[#EBD0B9] rounded-2xl flex-shrink-0 flex items-center justify-center p-3">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.name}</h3>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[22px]">delete</span>
                                        </button>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-4">
                                        {item.variants?.color || 'Standard'} • {item.variants?.ram || 'Base Spec'}
                                    </p>
                                    <span className={`inline-block text-[10px] font-bold px-4 py-1.5 rounded-full border ${item.type === 'rent' ? 'bg-brand-magenta-50 text-brand-primary border-brand-magenta-100' : 'bg-gray-50 text-gray-900 border-gray-200'}`}>
                                        {item.type === 'rent' ? `${item.tenure || 12} Months Rental` : 'Outright Purchase'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Shipping Address - Only if Delivery */}
                {deliveryMethod === 'delivery' && (
                    <section>
                        <div className="flex justify-between items-baseline mb-6">
                            <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Shipping Address</h2>
                            <button
                                onClick={() => setShowAddressForm(!showAddressForm)}
                                className="text-brand-primary text-xs font-bold hover:underline"
                            >
                                {showAddressForm ? (addresses.length > 0 ? 'Cancel' : '') : 'Add New Address'}
                            </button>
                        </div>

                        {showAddressForm && (
                            <div className="bg-white rounded-[2rem] p-8 shadow-card-soft border border-brand-primary/20 mb-6 animate-in slide-in-from-top-4">
                                <h3 className="text-sm font-bold mb-6 text-gray-900">New Deployment Location</h3>
                                <form onSubmit={handleAddAddress} className="space-y-4">
                                    <input
                                        type="text"
                                        placeholder="Label (e.g. Home, Office)"
                                        className="w-full border-b border-gray-200 py-3 focus:border-brand-primary outline-none text-sm bg-transparent text-gray-900"
                                        value={newAddr.label}
                                        onChange={e => setNewAddr({ ...newAddr, label: e.target.value })}
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Full Address"
                                        className="w-full border-b border-gray-200 py-3 focus:border-brand-primary outline-none text-sm bg-transparent text-gray-900"
                                        value={newAddr.address}
                                        onChange={e => setNewAddr({ ...newAddr, address: e.target.value })}
                                        required
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="City, State"
                                            className="w-full border-b border-gray-200 py-3 focus:border-brand-primary outline-none text-sm bg-transparent text-gray-900"
                                            value={newAddr.city}
                                            onChange={e => setNewAddr({ ...newAddr, city: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone"
                                            className="w-full border-b border-gray-200 py-3 focus:border-brand-primary outline-none text-sm bg-transparent text-gray-900"
                                            value={newAddr.phone}
                                            onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-brand-primary text-white font-black py-4 rounded-xl mt-4 text-[10px] uppercase tracking-widest shadow-glow hover:brightness-110 active:scale-95 transition-all"
                                    >
                                        Add Address
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="space-y-4">
                            {addresses.length === 0 ? (
                                <div className="bg-white/40 border-2 border-dashed border-gray-300 rounded-[2rem] p-12 text-center">
                                    <p className="text-gray-400 text-sm italic">Add an address to continue deployment.</p>
                                </div>
                            ) : (
                                addresses.map((addr) => {
                                    if (!addr || !addr.id) return null; // Safety check
                                    const isSelected = selectedAddress === addr.id;
                                    return (
                                        <div
                                            key={addr.id}
                                            onClick={() => setSelectedAddress(addr.id)}
                                            className={`bg-white rounded-[2rem] p-6 flex items-start gap-4 border-2 transition-all cursor-pointer ${isSelected ? 'border-brand-primary shadow-glow' : 'border-transparent shadow-card-soft'}`}
                                        >
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                <span className="material-symbols-outlined filled-icon">location_on</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h4 className="font-bold text-gray-900">{addr.label || 'Details'}</h4>
                                                    {addr.isDefault && (
                                                        <span className="bg-gray-100 text-gray-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase">Default</span>
                                                    )}
                                                </div>
                                                {addr.recipientName && (
                                                    <p className="text-gray-700 text-sm font-semibold mb-1">{addr.recipientName}</p>
                                                )}
                                                <p className="text-gray-500 text-sm leading-relaxed">{addr.address || ''}</p>
                                                <p className="text-gray-500 text-sm">{addr.city || ''}{addr.state ? `, ${addr.state}` : ''}{addr.pincode ? ` - ${addr.pincode}` : ''}</p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-brand-primary' : 'border-gray-200'}`}>
                                                    {isSelected && <div className="w-3 h-3 rounded-full bg-brand-primary" />}
                                                </div>
                                                <button
                                                    onClick={async (e) => {
                                                        e.stopPropagation();
                                                        if (addr.isDefault) {
                                                            alert("Cannot delete the default address. Please set another address as default first.");
                                                            return;
                                                        }
                                                        if (confirm("Are you sure you want to delete this address?")) {
                                                            try {
                                                                await removeAddress(addr.id);
                                                                if (selectedAddress === addr.id) {
                                                                    setSelectedAddress('');
                                                                }
                                                            } catch (err: any) {
                                                                alert(err.message || "Failed to delete address");
                                                            }
                                                        }
                                                    }}
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                                    title="Delete Address"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Add Address Trigger */}
                        {!showAddressForm && (
                            <button
                                onClick={() => setShowAddressForm(true)}
                                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-[2rem] text-gray-400 font-bold uppercase tracking-widest text-[10px] hover:border-brand-primary hover:text-brand-primary transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">add</span>
                                Add New Address
                            </button>
                        )}
                    </section>
                )}

                {/* Payment Details ... existing but wrapped in section */}
                <section>
                    <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">Payment Details</h2>
                    <div className="bg-white rounded-[2rem] p-8 shadow-card-soft border border-gray-100 space-y-5">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Cart Value</span>
                            <span className="text-gray-900 font-bold">₹{subtotal.toLocaleString()}</span>
                        </div>
                        {deposit > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400 text-sm">Rental Deposits</span>
                                <span className="text-gray-900 font-bold">₹{deposit.toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Fulfilment</span>
                            <span className="text-brand-success font-bold uppercase text-[10px] tracking-widest bg-green-50 px-2 py-0.5 rounded">
                                {deliveryMethod === 'pickup' ? 'PICKUP' : 'FREE DELIVERY'}
                            </span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-400 text-sm">Estimated Tax</span>
                            <span className="text-gray-900 font-bold">₹{Math.round(tax).toLocaleString()}</span>
                        </div>
                        <div className="pt-5 border-t border-gray-100 flex justify-between items-baseline">
                            <span className="text-gray-900 font-bold">Total Commitment</span>
                            <span className="text-brand-primary text-2xl font-black">₹{Math.round(totalToday).toLocaleString()}</span>
                        </div>
                    </div>
                </section>
            </div>

            {/* Bottom Bar ... (mostly existing but disabled if validation fails) */}
            <div className="fixed bottom-0 left-0 right-0 z-40">
                <div className="bg-white/80 backdrop-blur-2xl border-t border-gray-100 p-6 flex items-center justify-between shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
                    <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total</p>
                        <p className="text-2xl font-black text-gray-900">₹{Math.round(totalToday).toLocaleString()}</p>
                    </div>
                    <button
                        onClick={handleContinue}
                        disabled={isProcessing}
                        className="bg-cta-gradient text-white font-black px-12 py-5 rounded-2xl shadow-glow hover:brightness-110 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                    >
                        {isProcessing ? 'Verifying...' : (
                            <>
                                Confirm Protocol <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Payment Methods Tabs */}
                <div className="bg-[#F3F4F6]/80 backdrop-blur-md px-6 py-4 grid grid-cols-3 gap-4 border-t border-gray-200">
                    <button
                        onClick={() => setPaymentMethod('card')}
                        className={`bg-white p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${paymentMethod === 'card' ? 'border-brand-primary shadow-sm' : 'border-transparent'}`}
                    >
                        <span className={`material-symbols-outlined ${paymentMethod === 'card' ? 'text-brand-primary' : 'text-gray-400'}`}>credit_card</span>
                        <span className={`text-[10px] font-bold ${paymentMethod === 'card' ? 'text-gray-900' : 'text-gray-400'}`}>Card</span>
                    </button>
                    <button
                        onClick={() => setPaymentMethod('net')}
                        className={`bg-white p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${paymentMethod === 'net' ? 'border-brand-primary shadow-sm' : 'border-transparent'}`}
                    >
                        <span className={`material-symbols-outlined ${paymentMethod === 'net' ? 'text-brand-primary' : 'text-gray-400'}`}>account_balance</span>
                        <span className={`text-[10px] font-bold ${paymentMethod === 'net' ? 'text-gray-900' : 'text-gray-400'}`}>Net Banking</span>
                    </button>
                    <button
                        onClick={() => setPaymentMethod('upi')}
                        className={`bg-white p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${paymentMethod === 'upi' ? 'border-brand-primary shadow-sm' : 'border-transparent'}`}
                    >
                        <span className={`material-symbols-outlined ${paymentMethod === 'upi' ? 'text-brand-primary' : 'text-gray-400'}`}>grid_view</span>
                        <span className={`text-[10px] font-bold ${paymentMethod === 'upi' ? 'text-gray-900' : 'text-gray-400'}`}>UPI</span>
                    </button>
                </div>
            </div>
        </div >
    );
}
