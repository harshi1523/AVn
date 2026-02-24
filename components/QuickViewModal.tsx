import React, { useState } from "react";
import { Product } from "../lib/mockData";
import { useStore } from "../lib/store";
import Tooltip from "./Tooltip";

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onNavigateToProduct: (id: string) => void;
}

export default function QuickViewModal({ product, onClose, onNavigateToProduct }: QuickViewModalProps) {
  const { user, addToCart, toggleAuth } = useStore();
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [cartError, setCartError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

  const isRental = product.availability === 'rent' || product.availability === 'both';
  const currentPrice = isRental && product.rentalOptions
    ? product.rentalOptions[selectedPlan].price
    : (product.buyPrice || product.price);

  const currentTenure = isRental && product.rentalOptions
    ? product.rentalOptions[selectedPlan].months
    : undefined;

  const handleAddToCart = async () => {
    if (!user) {
      toggleAuth(true);
      return;
    }
    setCartError(null);
    setIsAdding(true);
    try {
      await addToCart(product.id, isRental ? 'rent' : 'buy', currentTenure);
      setIsAdding(false);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err: any) {
      setIsAdding(false);
      const code = err?.message;
      if (code === 'KYC_NOT_APPROVED' || code === 'KYC_EXPIRED' || code === 'KYC_LIMIT_REACHED') {
        const msg = code === 'KYC_NOT_APPROVED' ? 'KYC required.' : code === 'KYC_EXPIRED' ? 'KYC Expired.' : 'Limit Reached.';
        setCartError(msg);
        setTimeout(() => {
          onClose();
          window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'kyc' } }));
        }, 1500);
      } else if (code === 'MAX_RENTALS_REACHED') {
        setCartError('3 active rentals max.');
      } else {
        setCartError(err?.message || 'Error');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-brand-card rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/10 animate-in zoom-in-95 duration-500">
        <button onClick={onClose} className="absolute top-8 right-8 z-40 p-3 rounded-full bg-black/60 text-white/40 hover:text-white transition-all">
          <span className="material-symbols-outlined font-light">close</span>
        </button>

        <div className="w-full md:w-1/2 bg-black p-10 flex items-center justify-center relative">
          <img src={product.image} alt={product.name} className="w-full h-auto object-contain max-h-[400px]" />
        </div>

        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <div className="mb-6">
            <span className="text-[9px] text-brand-primary font-black uppercase tracking-[0.4em] mb-4 block">{isRental ? 'RENTAL' : 'PURCHASE'}</span>
            <h2 className="text-3xl font-display font-bold text-white mb-2">{product.name}</h2>
            <p className="text-white/40 text-sm">{product.subtitle}</p>
          </div>

          {cartError && (
            <div className="mb-4 p-3 bg-red-900/30 border border-red-500/40 rounded-xl text-red-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">error</span>
              {cartError}
            </div>
          )}

          {isRental && product.rentalOptions && (
            <div className="mb-8">
              <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] mb-4 block">Select Plan</label>
              <div className="flex gap-4">
                {product.rentalOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedPlan(idx)}
                    className={`flex-1 p-4 rounded-2xl border transition-all ${selectedPlan === idx ? 'bg-white text-black' : 'border-white/10 text-white/40'}`}
                  >
                    <div className="text-xl font-bold">{opt.months}m</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto">
            <div className="flex items-baseline gap-4 mb-8">
              <span className="text-5xl font-display font-bold text-white">₹{currentPrice.toLocaleString()}</span>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`flex-[2] py-5 rounded-xl font-black text-[10px] uppercase tracking-[0.4em] transition-all active:scale-95 flex items-center justify-center gap-4 ${justAdded ? 'bg-green-500' : 'bg-white text-black'}`}
              >
                {isAdding ? 'Adding...' : justAdded ? 'Added' : isRental ? 'Rent Now' : 'Buy Now'}
              </button>
              <button onClick={() => { onClose(); onNavigateToProduct(product.id); }} className="flex-1 border border-white/10 rounded-xl text-white/40 hover:text-white transition-all">
                <span className="material-symbols-outlined">info</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}