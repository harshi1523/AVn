
import React from "react";
import { useStore } from "../lib/store";
import Tooltip from "./Tooltip";

interface CartDrawerProps {
  onCheckout: () => void;
}

export default function CartDrawer({ onCheckout }: CartDrawerProps) {
  const { isCartOpen, toggleCart, cart, removeFromCart } = useStore();

  if (!isCartOpen) return null;

  const total = cart.reduce((acc, item) => acc + item.price, 0);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => toggleCart(false)}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-lg bg-dark-elevated h-full shadow-elevated border-l border-gray-800 flex flex-col animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-dark-header">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            Your Cart <span className="text-sm font-normal text-gray-500">({cart.length} items)</span>
          </h2>
          <Tooltip text="Close Cart" position="bottom">
            <button
              onClick={() => toggleCart(false)}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-all duration-300 text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </Tooltip>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
              <span className="material-symbols-outlined text-6xl mb-4 opacity-50">shopping_cart_off</span>
              <p className="text-lg font-medium">Your cart is empty</p>
              <p className="text-sm mb-6">Looks like you haven't added anything yet.</p>
              <button
                onClick={() => toggleCart(false)}
                className="text-brand-primary hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex gap-5 bg-black/20 p-5 rounded-2xl border border-white/5 group relative hover:border-white/10 transition-all duration-300 hover:shadow-card-soft">
                <div className="w-24 h-24 bg-white/5 rounded-xl flex-shrink-0 overflow-hidden border border-white/5">
                  <img src={item.image} alt={item.name} className="w-full h-full object-contain p-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-white truncate pr-2 text-base uppercase tracking-tight">{item.name}</h4>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-500 hover:text-red-500 transition-all duration-300 p-1 rounded-lg hover:bg-red-500/10"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-bold bg-white/5 px-2 py-0.5 rounded">
                      {item.type === 'rent' ? `Rental • ${item.tenure}m` : 'Purchase'}
                    </p>
                    {item.variants?.ram && (
                      <p className="text-[9px] text-brand-primary uppercase tracking-wider font-bold bg-brand-primary/10 px-2 py-0.5 rounded">
                        {item.variants.ram}
                      </p>
                    )}
                    {item.variants?.ssd && (
                      <p className="text-[9px] text-brand-primary uppercase tracking-wider font-bold bg-brand-primary/10 px-2 py-0.5 rounded">
                        {item.variants.ssd}
                      </p>
                    )}
                  </div>

                  {item.warranty && (
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="material-symbols-outlined text-[12px] text-brand-primary">verified</span>
                      <span className="text-[9px] text-brand-primary font-black uppercase tracking-widest">{item.warranty.label}</span>
                    </div>
                  )}

                  <p className="text-white font-bold text-lg">
                    ₹{item.price.toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-gray-800 bg-dark-header space-y-5">
            <div className="flex justify-between items-center text-xl font-bold text-white">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500 text-center">Shipping & taxes calculated at checkout</p>
            <button
              onClick={() => {
                toggleCart(false);
                onCheckout();
              }}
              className="w-full bg-cta-gradient hover:brightness-110 text-white font-black py-5 rounded-2xl transition-all duration-300 active:scale-95 flex items-center justify-center gap-3 shadow-glow hover:shadow-glow-lg text-sm uppercase tracking-[0.3em]"
            >
              Checkout
              <span className="material-symbols-outlined text-sm">shopping_cart_checkout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
