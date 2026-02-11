
import React, { useState, useEffect } from "react";
import { useStore } from "../lib/store";

interface CheckoutProps {
    onSuccess: (isRental: boolean) => void;
    onBack?: () => void;
}

type CheckoutStep = 'address' | 'summary' | 'payment';

export default function Checkout({ onSuccess, onBack }: CheckoutProps) {
    const { cart, removeFromCart, placeOrder, user, addAddress, removeAddress, savePendingCheckout } = useStore();

    // Steps State
    const [activeStep, setActiveStep] = useState<CheckoutStep>('address');

    // Data State
    const [selectedAddress, setSelectedAddress] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'net' | 'upi'>('card');
    const [upiId, setUpiId] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Address Form State
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddr, setNewAddr] = useState({ label: '', address: '', city: '', phone: '' });

    // Delivery & Rental State
    const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
    const [agreementSigned, setAgreementSigned] = useState(false);

    const addresses = user?.addresses || [];
    const containsRental = cart.some(item => item.type === 'rent');

    // Auto-select address and determine initial step (only on mount)
    useEffect(() => {
        // Only auto-select if we haven't already selected an address manually
        if (selectedAddress) return;

        if (addresses.length > 0) {
            const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
            setSelectedAddress(defaultAddr.id);
            setActiveStep('summary');
        } else if (addresses.length === 0) {
            setActiveStep('address');
            setShowAddressForm(true);
        }
    }, []); // Run only once on mount

    // Payment Prefs
    useEffect(() => {
        if (user?.rentalPreferences) {
            const { depositMethod, upiId: savedUpiId } = user.rentalPreferences;
            if (depositMethod === 'upi') setPaymentMethod('upi');
            else if (depositMethod === 'net_banking') setPaymentMethod('net');
            else if (depositMethod === 'card') setPaymentMethod('card');
            if (savedUpiId) setUpiId(savedUpiId);
        }
    }, [user?.rentalPreferences]);

    if (cart.length === 0) return (
        <div className="min-h-screen bg-light-page flex flex-col items-center justify-center p-8">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">shopping_cart_off</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart is Empty</h2>
            <button onClick={onBack || (() => window.history.back())} className="text-brand-primary font-bold hover:underline">Return to Shopping</button>
        </div>
    );

    // Calculations
    const subtotal = cart.reduce((acc, item) => acc + item.price, 0);
    const deposit = cart.filter(item => item.type === 'rent').length * 200;
    const shipping = 0; // Free
    const packingFee = 86; // From screenshot example
    const discount = 3000; // Example fixed discount to match screenshot style or calc real one?
    const taxRate = 0.085;
    const tax = subtotal * taxRate;
    // Total for payment logic (keeping existing logic for actual payment processing)
    const totalToPay = subtotal + deposit + shipping + tax;


    const handleContinue = async () => {
        if (activeStep === 'address') {
            if (!selectedAddress && deliveryMethod === 'delivery') {
                alert("Please select an address");
                return;
            }
            setActiveStep('summary');
            return;
        }

        if (activeStep === 'summary') {
            setActiveStep('payment');
            return;
        }

        if (activeStep === 'payment') {
            handlePlaceOrder();
        }
    };

    const handlePlaceOrder = async () => {
        const deliveryAddress = deliveryMethod === 'pickup'
            ? "Self Pickup from AvN Hub"
            : addresses.find(a => a.id === selectedAddress)?.address || "Default Address";

        const rentalDetails = containsRental ? {
            start: new Date().toISOString().split('T')[0],
            end: new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString().split('T')[0],
            deposit: deposit,
            method: deliveryMethod
        } : undefined;

        // Rental validations (KYC etc) - reused from existing
        if (containsRental && user?.kycStatus !== 'approved') {
            const pendingDetails = JSON.parse(JSON.stringify({
                address: deliveryAddress,
                rentalDetails,
                total: totalToPay,
                paymentMethod,
                items: cart
            }));

            if (confirm("Identity Verification Required for rentals. Proceed to upload documents?")) {
                await savePendingCheckout(pendingDetails);
                window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'kyc' } }));
            }
            return;
        }

        setIsProcessing(true);
        setTimeout(() => {
            placeOrder(deliveryAddress, paymentMethod, totalToPay, rentalDetails);
            setIsProcessing(false);
            onSuccess(containsRental);
        }, 1500);
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAddr.address || !newAddr.city || !newAddr.phone) return;

        // addAddress now returns the new address ID
        const newAddressId = await addAddress(newAddr);

        if (newAddressId) {
            setSelectedAddress(newAddressId);
            setActiveStep('summary');
        }

        setNewAddr({ label: '', address: '', city: '', phone: '' });
        setShowAddressForm(false);
    };

    // Render Steps
    const renderStepper = () => (
        <div className="bg-white shadow-sm mb-4">
            <div className="max-w-4xl mx-auto px-4 py-4">
                <div className="flex items-center justify-center w-full">
                    {/* Step 1: Address */}
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${activeStep === 'address' ? 'bg-blue-600 text-white' : (activeStep === 'summary' || activeStep === 'payment') ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {(activeStep === 'summary' || activeStep === 'payment') ? <span className="material-symbols-outlined text-sm">check</span> : '1'}
                        </div>
                        <span className={`ml-2 text-xs font-bold uppercase ${activeStep === 'address' ? 'text-blue-600' : 'text-gray-500'}`}>Address</span>
                    </div>
                    <div className="w-12 h-[1px] bg-gray-300 mx-2"></div>

                    {/* Step 2: Summary */}
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${activeStep === 'summary' ? 'bg-blue-600 text-white' : activeStep === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {activeStep === 'payment' ? <span className="material-symbols-outlined text-sm">check</span> : '2'}
                        </div>
                        <span className={`ml-2 text-xs font-bold uppercase ${activeStep === 'summary' ? 'text-blue-600' : 'text-gray-500'}`}>Order Summary</span>
                    </div>
                    <div className="w-12 h-[1px] bg-gray-300 mx-2"></div>

                    {/* Step 3: Payment */}
                    <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${activeStep === 'payment' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                            3
                        </div>
                        <span className={`ml-2 text-xs font-bold uppercase ${activeStep === 'payment' ? 'text-blue-600' : 'text-gray-500'}`}>Payment</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderAddressStep = () => (
        <div className="bg-white p-6 rounded shadow-sm">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Select Delivery Address</h3>
                <button onClick={() => setShowAddressForm(!showAddressForm)} className="text-blue-600 font-bold text-sm uppercase">
                    {showAddressForm ? 'Cancel' : 'Add New Address'}
                </button>
            </div>

            {showAddressForm && (
                <form onSubmit={handleAddAddress} className="mb-6 p-4 border border-gray-200 rounded bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input type="text" placeholder="Name" className="p-3 border rounded text-gray-900 bg-white" required
                            value={newAddr.label} onChange={e => setNewAddr({ ...newAddr, label: e.target.value })} />
                        <input type="tel" placeholder="Phone" className="p-3 border rounded text-gray-900 bg-white" required
                            value={newAddr.phone} onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })} />
                    </div>
                    <div className="mb-4">
                        <textarea placeholder="Address (Area and Street)" className="w-full p-3 border rounded text-gray-900 bg-white" required
                            value={newAddr.address} onChange={e => setNewAddr({ ...newAddr, address: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <input type="text" placeholder="City/District/Town" className="p-3 border rounded text-gray-900 bg-white" required
                            value={newAddr.city} onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} />
                        {/* State dropdown could be here */}
                    </div>
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded font-bold uppercase text-sm">Save and Deliver Here</button>
                </form>
            )}

            <div className="space-y-4">
                {addresses.map(addr => (
                    <div key={addr.id} onClick={() => setSelectedAddress(addr.id)}
                        className={`p-4 border rounded cursor-pointer flex items-start gap-3 ${selectedAddress === addr.id ? 'bg-blue-50 border-blue-600' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-1 ${selectedAddress === addr.id ? 'border-blue-600' : 'border-gray-400'}`}>
                            {selectedAddress === addr.id && <div className="w-2 h-2 rounded-full bg-blue-600"></div>}
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900">{addr.label || user?.name}</span>
                                <span className="text-sm text-gray-500 font-bold">{addr.phone}</span>
                            </div>
                            <p className="text-sm text-gray-600">{addr.address}, {addr.city} - {addr.pincode}</p>
                            {selectedAddress === addr.id && (
                                <button onClick={handleContinue} className="mt-4 bg-orange-500 text-white px-6 py-3 rounded text-sm font-bold uppercase hover:bg-orange-600 transition-colors">
                                    Deliver Here
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderSummaryStep = () => (
        <div className="flex flex-col lg:flex-row gap-4">
            {/* Left Column */}
            <div className="flex-1 space-y-4">

                {/* Deliver To Block */}
                <div className="bg-white p-4 rounded shadow-sm border border-gray-100 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-gray-500 text-sm">Deliver to:</span>
                            <span className="font-bold text-gray-900 text-sm">
                                {addresses.find(a => a.id === selectedAddress)?.label || user?.name}
                            </span>
                            <span className="bg-gray-100 text-xs px-1 rounded text-gray-500">HOME</span>
                        </div>
                        <p className="text-sm text-gray-600 truncate max-w-md">
                            {addresses.find(a => a.id === selectedAddress)?.address}, {addresses.find(a => a.id === selectedAddress)?.city} {addresses.find(a => a.id === selectedAddress)?.pincode}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{addresses.find(a => a.id === selectedAddress)?.phone}</p>
                    </div>
                    <button onClick={() => setActiveStep('address')} className="text-blue-600 border border-gray-200 px-4 py-2 rounded text-xs font-bold hover:bg-blue-50">
                        Change
                    </button>
                </div>

                {/* Cart Items */}
                {cart.map(item => (
                    <div key={item.id} className="bg-white p-6 rounded shadow-sm border border-gray-100 relative">
                        <div className="flex gap-6">
                            {/* Image */}
                            <div className="w-28 h-28 flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                                <h3 className="text-base font-medium text-gray-900 mb-1 hover:text-blue-600 cursor-pointer">{item.name}</h3>
                                <p className="text-xs text-gray-500 mb-2">{item.variants?.ram || '8 GB RAM'}</p>

                                <div className="flex items-center gap-2 mb-3">
                                    <div className="flex items-center bg-green-700 text-white text-xs font-bold px-1.5 py-0.5 rounded-[3px] gap-1">
                                        4.5 <span className="material-symbols-outlined text-[10px]">star</span>
                                    </div>
                                    <span className="text-gray-500 text-xs font-medium">({Math.floor(Math.random() * 100000).toLocaleString()})</span>
                                    <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-1 rounded border border-blue-100">Assured</span>
                                </div>

                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-xs text-green-600 font-bold">10% Off</span>
                                    <span className="text-gray-400 text-sm line-through">₹{(item.price * 1.1).toFixed(0)}</span>
                                    <span className="text-xl font-bold text-gray-900">₹{item.price.toLocaleString()}</span>
                                </div>

                                <div className="flex items-center gap-1 text-xs text-gray-900 mb-4">
                                    <span>+ ₹{packingFee} Protect Promise Fee</span>
                                    <span className="material-symbols-outlined text-gray-400 text-[14px]">info</span>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center gap-2">
                                        <button
                                            disabled={item.quantity <= 1}
                                            onClick={() => { }} // Impl update qty
                                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 disabled:opacity-50"
                                        >
                                            -
                                        </button>
                                        <div className="border border-gray-300 px-4 py-1 text-sm font-bold bg-white">
                                            Q: {item.quantity}
                                        </div>
                                        <button
                                            onClick={() => { }} // Impl update qty
                                            className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-600"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-900 font-bold text-sm hover:text-red-600 uppercase">Remove</button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <p className="text-xs text-gray-500">Delivery by <span className="text-gray-900 font-bold">Feb 14, Fri</span> | <span className="text-green-600 font-bold">Free</span> <span className="line-through text-gray-400">₹40</span></p>
                        </div>
                    </div>
                ))}

                {/* Additional Options */}
                <div className="bg-white p-4 rounded shadow-sm border border-gray-100 flex items-center gap-3">
                    <input type="checkbox" id="gst" className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <label htmlFor="gst" className="text-sm font-medium text-gray-900">Use GST Invoice</label>
                </div>

                {/* Rest Assured Banner */}
                <div className="flex items-start gap-3 p-4 bg-white rounded shadow-sm border border-gray-100">
                    <span className="material-symbols-outlined text-yellow-500 text-2xl">verified_user</span>
                    <div>
                        <h4 className="text-sm font-bold text-gray-900">Rest assured with Open Box Delivery</h4>
                        <p className="text-xs text-gray-600 mt-1">Delivery agent will open the package so you can check for correct product, damage or missing items. Share OTP to accept the delivery. <a href="#" className="text-blue-600">Why?</a></p>
                    </div>
                </div>

            </div>

            {/* Right Column (Sticky Price Details) */}
            <div className="w-full lg:w-[350px] sticky top-24 h-fit">
                <div className="bg-white rounded shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <h3 className="text-gray-500 font-bold text-sm uppercase tracking-wide">Price Details</h3>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-900">Price ({cart.length} item)</span>
                            <span className="text-gray-900">₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-900">Discount</span>
                            <span className="text-green-600">- ₹{discount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-900">Delivery Charges</span>
                            <span className="text-green-600">Free</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-900">Secured Packaging Fee</span>
                            <span className="text-gray-900">₹{packingFee}</span>
                        </div>

                        <div className="border-t border-dashed border-gray-200 my-2"></div>

                        <div className="flex justify-between text-lg font-bold">
                            <span className="text-gray-900">Total Amount</span>
                            <span className="text-gray-900">₹{totalToPay.toLocaleString()}</span>
                        </div>

                        <div className="mt-2 text-green-700 font-bold text-sm">
                            You will save ₹{discount.toLocaleString()} on this order
                        </div>
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-white">
                        <div className="flex items-center gap-2 mb-4">
                            <img src="https://static-assets-web.flixcart.com/fk-p-linchpin-web/fk-cp-zion/img/shield_5f9216.png" className="w-6 h-6 grayscale opacity-60" alt="" />
                            <p className="text-[10px] text-gray-500 font-bold uppercase">Safe and Secure Payments. Easy returns. 100% Authentic products.</p>
                        </div>
                        <button onClick={handleContinue} className="w-full bg-brand-accent text-white font-bold py-4 rounded-sm shadow-sm uppercase text-sm tracking-wide hover:brightness-110 transition-all duration-200">
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPaymentStep = () => (
        <div className="bg-white p-6 rounded shadow-sm max-w-2xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-6 bg-blue-600 text-white p-3 -mx-6 -mt-6 rounded-t">Select Payment Method</h3>

            <div className="space-y-4">
                <label className={`flex items-center gap-4 p-4 border rounded cursor-pointer ${paymentMethod === 'card' ? 'bg-blue-50 border-blue-600' : 'border-gray-200'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="text-blue-600 w-5 h-5" />
                    <div className="flex-1">
                        <span className="font-bold text-gray-900 block">Credit / Debit / ATM Card</span>
                        <span className="text-xs text-gray-500">Add and secure your card as per RBI guidelines</span>
                    </div>
                </label>

                <label className={`flex items-center gap-4 p-4 border rounded cursor-pointer ${paymentMethod === 'upi' ? 'bg-blue-50 border-blue-600' : 'border-gray-200'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="text-blue-600 w-5 h-5" />
                    <div>
                        <span className="font-bold text-gray-900 block">UPI</span>
                        <span className="text-xs text-gray-500">Google Pay, PhonePe, Paytm & more</span>
                    </div>
                </label>

                <label className={`flex items-center gap-4 p-4 border rounded cursor-pointer ${paymentMethod === 'net' ? 'bg-blue-50 border-blue-600' : 'border-gray-200'}`}>
                    <input type="radio" name="payment" checked={paymentMethod === 'net'} onChange={() => setPaymentMethod('net')} className="text-blue-600 w-5 h-5" />
                    <div>
                        <span className="font-bold text-gray-900 block">Net Banking</span>
                        <span className="text-xs text-gray-500">All Indian banks supported</span>
                    </div>
                </label>

                {/* COD Option (disabled typically for expensive rentals but maybe allowed) */}
                <label className={`flex items-center gap-4 p-4 border rounded cursor-pointer border-gray-200 opacity-60`}>
                    <input type="radio" name="payment" disabled className="text-gray-400 w-5 h-5" />
                    <div>
                        <span className="font-bold text-gray-500 block">Cash on Delivery</span>
                        <span className="text-xs text-gray-400">Currently unavailable for this order</span>
                    </div>
                </label>
            </div>

            <button
                onClick={handleContinue}
                disabled={isProcessing}
                className="w-full bg-brand-accent text-white font-bold py-4 rounded mt-8 text-sm uppercase shadow hover:brightness-110 disabled:opacity-70 flex items-center justify-center gap-2 transition-all duration-200"
            >
                {isProcessing ? 'Processing...' : `Pay ₹${totalToPay.toLocaleString()}`}
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-light-page pb-24 text-text-dark">
            {/* Header / Nav */}
            <div className="bg-dark-elevated p-4 text-white shadow sticky top-0 z-30 flex items-center border-b border-white/10">
                <button onClick={onBack || (() => window.history.back())} className="mr-4">
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <span className="font-bold text-lg">Checkout</span>
            </div>

            {renderStepper()}

            <div className="max-w-7xl mx-auto px-4 py-4">
                {activeStep === 'address' && renderAddressStep()}
                {activeStep === 'summary' && renderSummaryStep()}
                {activeStep === 'payment' && renderPaymentStep()}
            </div>
        </div>
    );
}
