import React from "react";
import { useStore } from "../lib/store";

interface CartPageProps {
  onNavigate: (view: string, params?: any) => void;
}

export default function CartPage({ onNavigate }: CartPageProps) {
  const { cart, removeFromCart, updateQuantity, updateTenure } = useStore();

  const subtotal = React.useMemo(() => cart.reduce((acc, item) => acc + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0), [cart]);
  const deposit = React.useMemo(() => cart.filter(item => item.type === 'rent').reduce((acc, item) => acc + (5000 * (Number(item.quantity) || 0)), 0), [cart]);
  const tax = subtotal * 0.18; // 18% GST
  const total = React.useMemo(() => subtotal + deposit + tax, [subtotal, deposit, tax]);

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500 px-6">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-8 border border-white/10 shadow-glow">
          <span className="material-symbols-outlined text-4xl text-gray-600">shopping_cart_off</span>
        </div>
        <h2 className="text-4xl font-display font-bold text-white mb-4 tracking-tighter uppercase italic">Cart is Empty</h2>
        <p className="text-gray-500 mb-12 text-center max-w-md font-medium leading-relaxed">
          Your shopping cart is currently empty. Explore our premium tech collection to add some high-performance nodes to your setup.
        </p>
        <button
          onClick={() => onNavigate('listing')}
          className="bg-cta-gradient text-white font-black px-12 py-5 rounded-2xl text-[10px] uppercase tracking-[0.4em] hover:brightness-110 transition-all active:scale-95 shadow-glow"
        >
          Explore Collection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 animate-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col lg:flex-row gap-16">

        {/* Left Section: Itemized Cart */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-12 border-b border-white/10 pb-8">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter uppercase italic">
              Shopping <span className="text-white/20">Cart</span>
            </h1>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] bg-brand-primary/10 px-4 py-1.5 rounded-full border border-brand-primary/20">
                {cart.reduce((acc, item) => acc + item.quantity, 0)} ITEMS
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {cart.map((item) => (
              <div
                key={item.id}
                className="group relative bg-brand-card border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 hover:border-white/20 transition-all duration-500 shadow-xl"
              >
                <div className="w-full md:w-40 aspect-square bg-black/60 rounded-[1.5rem] p-6 flex items-center justify-center border border-white/5 group-hover:bg-black/80 transition-colors shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain transition-all duration-700 group-hover:scale-110" />
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white tracking-tight mb-2 uppercase italic font-display">{item.name}</h3>
                      <div className="flex items-center gap-3">
                        <p className="text-[10px] text-brand-primary font-black uppercase tracking-widest bg-brand-primary/10 w-fit px-2 py-0.5 rounded border border-brand-primary/20">
                          {item.type === 'rent' ? 'Rental Plan' : 'Outright Purchase'}
                        </p>
                        {item.type === 'rent' && (
                          <div className="relative group/tenure">
                            <select
                              value={item.tenure}
                              onChange={(e) => updateTenure(item.id, parseInt(e.target.value))}
                              className="appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-0.5 pr-8 text-[10px] font-black text-white uppercase tracking-widest hover:border-brand-primary/40 transition-all cursor-pointer focus:outline-none"
                            >
                              {[3, 6, 12, 18, 24].map(m => (
                                <option key={m} value={m} className="bg-brand-card">{m} Months</option>
                              ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[12px] text-white/40 pointer-events-none transition-transform group-hover/tenure:text-brand-primary">expand_more</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-600 hover:text-red-500 transition-colors p-2"
                      title="Remove Item"
                    >
                      <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {item.variants?.ram && (
                      <span className="text-[9px] font-bold text-white/40 bg-white/5 border border-white/10 px-3 py-1 rounded-lg uppercase tracking-widest">{item.variants.ram}</span>
                    )}
                    {item.variants?.ssd && (
                      <span className="text-[9px] font-bold text-white/40 bg-white/5 border border-white/10 px-3 py-1 rounded-lg uppercase tracking-widest">{item.variants.ssd}</span>
                    )}
                    {item.variants?.color && (
                      <span className="text-[9px] font-bold text-white/40 bg-white/5 border border-white/10 px-3 py-1 rounded-lg uppercase tracking-widest">{item.variants.color}</span>
                    )}
                  </div>

                  <div className="mt-auto pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-6">
                    <div className="flex items-center bg-black/40 border border-white/10 rounded-2xl p-1">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="w-10 text-center font-black text-xs text-white">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest mb-1">
                        {item.type === 'rent' ? 'Monthly Commitment' : 'Line Total'}
                      </p>
                      <p className="text-2xl font-display font-bold text-white tracking-tighter italic">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => onNavigate('listing')}
            className="mt-12 group flex items-center gap-3 text-white transition-all font-black text-[10px] uppercase tracking-[0.4em]"
          >
            <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Continue Shopping
          </button>
        </div>

        {/* Right Section: Payment Summary */}
        <div className="w-full lg:w-[400px]">
          <div className="sticky top-32">
            <div className="bg-brand-card border border-white/10 rounded-[3rem] p-10 shadow-2xl overflow-hidden relative group">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/5 rounded-full blur-[80px]" />
              <h2 className="text-2xl font-display font-bold text-white mb-10 tracking-tight uppercase italic">Order Summary</h2>
              <div className="space-y-6 mb-10">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Base Payload</span>
                  <span className="text-white font-bold">₹{subtotal.toLocaleString()}</span>
                </div>
                {deposit > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Security Deposit</span>
                    <span className="text-white font-bold">₹{deposit.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Shipping & Handling</span>
                  <span className="text-brand-success font-black text-[9px] tracking-widest bg-brand-success/10 px-2 py-0.5 rounded border border-brand-success/20 uppercase">FREE</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Applicable Taxes (18%)</span>
                  <span className="text-white font-bold">₹{Math.round(tax).toLocaleString()}</span>
                </div>
              </div>
              <div className="pt-8 border-t border-white/10 mb-10">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-white/40 text-[9px] font-black uppercase tracking-[0.4em]">Final Commitment</span>
                  <span className="text-5xl font-display font-bold text-white tracking-tighter italic">₹{Math.round(total).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => onNavigate('checkout')}
                className="w-full bg-cta-gradient hover:brightness-110 text-white font-black py-6 rounded-2xl text-[10px] uppercase tracking-[0.4em] transition-all active:scale-95 shadow-glow flex items-center justify-center gap-3"
              >
                Proceed to Checkout
                <span className="material-symbols-outlined text-[18px]">shopping_cart_checkout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}