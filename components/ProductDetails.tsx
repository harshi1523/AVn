import React, { useState } from "react";
import { Review } from "../lib/mockData";
import { useStore } from "../lib/store";
import Tooltip from "./Tooltip";

interface ProductDetailsProps {
  productId: string;
  context?: 'rent' | 'buy';
  onBack: () => void;
}

export default function ProductDetails({ productId, context, onBack }: ProductDetailsProps) {
  const { user, addToCart, wishlist, toggleWishlist, toggleAuth, products } = useStore();
  const product = products.find(p => p.id === productId);

  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const [localReviews] = useState<Review[]>(product?.reviewsList || []);

  const allImages = product?.images && product.images.length > 0 ? product.images : (product?.image ? [product.image] : []);
  const [selectedImage, setSelectedImage] = useState(allImages[0] || '');

  if (!product) return <div className="p-20 text-center text-white/20 font-display text-xl uppercase tracking-widest">Product Not Found</div>;

  const defaultMode: 'rent' | 'buy' = context || (product.type === 'buy' ? 'buy' : 'rent');
  const [purchaseMode, setPurchaseMode] = useState<'rent' | 'buy'>(defaultMode);
  const [selectedTenure, setSelectedTenure] = useState(1);

  const isModeRent = purchaseMode === 'rent';
  const selectedRentalOption = product.rentalOptions?.find(o => o.months === selectedTenure);

  const buyPrice = product.buyPrice || product.price;
  const basePrice = isModeRent && selectedRentalOption ? selectedRentalOption.price : buyPrice;

  const isInWishlist = wishlist.includes(product.id);

  const handleAddToCart = async (shouldNavigateToCart: boolean = false) => {
    if (!user) {
      toggleAuth(true);
      return;
    }
    setCartError(null);
    try {
      await addToCart(product.id, purchaseMode, isModeRent ? selectedTenure : undefined, { ram: product.variants?.ram?.[0], ssd: product.variants?.ssd?.[0], color: product.variants?.colors?.[0]?.name });
      if (shouldNavigateToCart) {
        window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'checkout' } }));
      } else {
        setIsAdding(true);
        setTimeout(() => { setIsAdding(false); setJustAdded(true); setTimeout(() => setJustAdded(false), 2500); }, 800);
      }
    } catch (err: any) {
      const code = err?.message;
      if (code === 'KYC_NOT_APPROVED') {
        setCartError('KYC verification required before renting. Please complete your identity verification.');
        setTimeout(() => window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'kyc' } })), 1500);
      } else if (code === 'MAX_RENTALS_REACHED') {
        setCartError('You already have 3 active rentals. Return a device to rent another.');
      } else if (code === 'TENURE_EXCEEDED') {
        setCartError('Maximum rental duration is 3 months.');
      } else {
        setCartError('Failed to add item. Please try again.');
      }
    }
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`material-symbols-outlined text-sm ${star <= rating ? 'filled-icon text-[#FACC15]' : 'text-white/10'}`}>
          star
        </span>
      ))}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl bg-brand-page min-h-screen">
      <div className="flex flex-col lg:flex-row px-4 md:px-8 pt-4 pb-12 gap-8">
        <div className="lg:w-[45%] flex flex-col">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative flex flex-col items-center justify-center min-h-[300px] md:min-h-[400px]">
              <img src={selectedImage} className="max-w-full max-h-full object-contain mb-4" alt={product.name} />

              {/* Thumbnail Gallery */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 w-full justify-center max-w-full custom-scrollbar">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 transition-all ${selectedImage === img ? 'border-brand-primary' : 'border-transparent opacity-50 hover:opacity-100'}`}
                    >
                      <img src={img} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 mb-2">
              {product.status === 'LOW STOCK' && <span className="text-brand-warning text-xs font-bold uppercase tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-sm">warning</span> Low Stock</span>}
              {product.status === 'RENTED' && <span className="text-blue-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-sm">lock</span> Rented Out</span>}
              {product.status === 'OUT_OF_STOCK' && <span className="text-red-500 text-xs font-bold uppercase tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-sm">block</span> Out of Stock</span>}
            </div>

            {cartError && (
              <div className="mb-3 flex items-start gap-2 p-3 bg-red-900/30 border border-red-500/40 rounded-xl text-red-400 text-xs font-medium">
                <span className="material-symbols-outlined text-sm flex-shrink-0 mt-0.5">error</span>
                <span>{cartError}</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAddToCart(false)}
                disabled={product.status === 'RENTED' || product.status === 'OUT_OF_STOCK'}
                className={`text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] shadow-glow disabled:opacity-50 disabled:cursor-not-allowed ${product.status === 'OUT_OF_STOCK' ? 'bg-white/10' : 'bg-cta-gradient'}`}
              >
                <span className="material-symbols-outlined text-lg">{product.status === 'OUT_OF_STOCK' ? 'notifications' : 'shopping_cart'}</span>
                {product.status === 'OUT_OF_STOCK' ? 'Notify Me' : (justAdded ? 'Added' : 'Add to Cart')}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleAddToCart(true);
                }}
                disabled={product.status === 'RENTED' || product.status === 'OUT_OF_STOCK'}
                className={`font-bold py-4 rounded-xl flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isModeRent ? 'bg-brand-primary text-white shadow-glow' : 'bg-white text-black'}`}
              >
                <span className="material-symbols-outlined text-lg">{isModeRent ? 'real_estate_agent' : 'bolt'}</span>
                {isModeRent ? 'Rent Now' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div >

        <div className="flex-1 flex flex-col pt-2">
          <button onClick={onBack} className="flex items-center gap-1 text-[9px] font-bold text-white/20 hover:text-white uppercase tracking-widest mb-4">
            <span className="material-symbols-outlined text-sm">chevron_left</span> Back to Catalog
          </button>

          {/* Brand & Category */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-brand-primary font-bold uppercase tracking-widest text-[10px]">{product.brand}</span>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <span className="text-white/40 font-bold uppercase tracking-widest text-[10px]">{product.category}</span>
            {product.status === 'AVAILABLE' && (
              <span className="ml-2 flex items-center gap-1 text-brand-success text-[10px] font-bold uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">check_circle</span> In Stock
              </span>
            )}
          </div>

          <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tight">{product.name}</h2>

          {/* Subtitle/Description */}
          <p className="text-lg text-white/60 font-medium mb-4 leading-relaxed">{product.subtitle}</p>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1.5 bg-brand-success text-black px-2 py-0.5 rounded text-[11px] font-bold">{product.rating} <span className="material-symbols-outlined text-[12px] filled-icon">star</span></div>
            <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{product.reviews} Ratings</span>
          </div>
          <div className="mb-8">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl md:text-5xl font-bold text-white tracking-tight">₹{basePrice.toLocaleString()}</span>
              {isModeRent && <span className="text-white/20 font-bold uppercase tracking-widest text-sm">/ month</span>}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="venus-heading">Ownership Protocol</h3>
              {product.type === 'rent_and_buy' && !context && (
                <div className="flex gap-3 mb-10">
                  <button onClick={() => setPurchaseMode('buy')} className={`flex-1 p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${purchaseMode === 'buy' ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-white/20'}`}>
                    <span className="text-[18px] font-bold">Buy Outright</span>
                  </button>
                  <button onClick={() => setPurchaseMode('rent')} className={`flex-1 p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${purchaseMode === 'rent' ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-white/20'}`}>
                    <span className="text-[18px] font-bold">Monthly Rental</span>
                  </button>
                </div>
              )}
              {product.type === 'buy' && (
                <div className="mb-10">
                  <div className="p-4 rounded-xl border bg-white text-black border-white inline-flex items-center gap-2">
                    <span className="text-[18px] font-bold">Buy Outright</span>
                  </div>
                </div>
              )}
              {product.type === 'rent' && (
                <div className="mb-10">
                  <div className="p-4 rounded-xl border bg-white text-black border-white inline-flex items-center gap-2">
                    <span className="text-[18px] font-bold">Monthly Rental</span>
                  </div>
                </div>
              )}

              {purchaseMode === 'rent' ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <h3 className="venus-heading">Monthly Rental Advantages</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 italic">
                    Acquire elite hardware with zero capital friction. Perfect for scaling operations, project-based needs, and maintaining access to the latest technology without full upfront commitment.
                  </p>

                  <h3 className="venus-heading">Tenure Selection</h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[1, 2, 3].map((m) => (
                      <button
                        key={m}
                        onClick={() => setSelectedTenure(m)}
                        className={`py-4 rounded-xl border flex flex-col items-center justify-center transition-all ${selectedTenure === m ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-white/40'}`}
                      >
                        <span className="text-lg font-bold">{m}M</span>
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Tenure</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] font-bold text-brand-primary uppercase tracking-[0.2em] mb-10">
                    * Rental duration is capped at 3 months. KYC approval required before renting.
                  </p>

                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3 text-white/60 text-sm">
                      <span className="material-symbols-outlined text-brand-primary text-sm mt-1">check_circle</span>
                      <span><strong>Dynamic Flexibility:</strong> Scale your workstation specs up or down as project requirements evolve.</span>
                    </li>
                    <li className="flex items-start gap-3 text-white/60 text-sm">
                      <span className="material-symbols-outlined text-brand-primary text-sm mt-1">check_circle</span>
                      <span><strong>Frequent Upgrades:</strong> Switch to the next generation of tech every 12 months with zero resale hassle.</span>
                    </li>
                    <li className="flex items-start gap-3 text-white/60 text-sm">
                      <span className="material-symbols-outlined text-brand-primary text-sm mt-1">check_circle</span>
                      <span><strong>Low Initial Friction:</strong> Deploy high-end nodes for a fraction of the market price today.</span>
                    </li>
                  </ul>
                  <hr className="border-white/5 my-8" />
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <h3 className="venus-heading">Buy Outright Advantages</h3>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6 italic">
                    The definitive path for long-term asset command. Secure permanent access to your hardware with no ongoing financial protocols.
                  </p>
                  <ul className="space-y-4 mb-8">
                    <li className="flex items-start gap-3 text-white/60 text-sm">
                      <span className="material-symbols-outlined text-brand-primary text-sm mt-1">check_circle</span>
                      <span><strong>Lifetime Ownership:</strong> 100% command of your hardware from day one. No returns, no recurring fees.</span>
                    </li>
                    <li className="flex items-start gap-3 text-white/60 text-sm">
                      <span className="material-symbols-outlined text-brand-primary text-sm mt-1">check_circle</span>
                      <span><strong>Zero Recurring Costs:</strong> A one-time acquisition ensures you have the tools you need forever with no monthly bills.</span>
                    </li>
                    <li className="flex items-start gap-3 text-white/60 text-sm">
                      <span className="material-symbols-outlined text-brand-primary text-sm mt-1">check_circle</span>
                      <span><strong>Permanent Asset Value:</strong> High-end tech retains residual market value. Build equity in your professional toolkit.</span>
                    </li>
                    <li className="flex items-start gap-3 text-white/60 text-sm">
                      <span className="material-symbols-outlined text-brand-primary text-sm mt-1">check_circle</span>
                      <span><strong>Absolute Control:</strong> Modify, skin, or hardware-upgrade your device without any rental restrictions.</span>
                    </li>
                  </ul>
                  <hr className="border-white/5 my-8" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div >

      <hr className="border-white/5 my-12" />

      {
        product.features && product.features.length > 0 && (
          <section className="px-4 md:px-8 py-8">
            <h3 className="venus-heading">Elite Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {product.features.map((feature, idx) => (
                <div key={idx} className="bg-brand-card/40 p-6 rounded-3xl border border-white/5">
                  <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary mb-4">
                    <span className="material-symbols-outlined text-[20px]">{feature.icon || 'settings'}</span>
                  </div>
                  <h4 className="text-white font-bold text-base mb-2">{feature.title}</h4>
                  <p className="text-white/40 text-xs leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
            <hr className="border-white/5 my-12" />
          </section>
        )
      }

      {
        product.fullSpecs && (
          <section className="px-4 md:px-8 py-8">
            <h3 className="venus-heading">Technical Manifest</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              {Object.entries(product.fullSpecs).map(([category, specs]) => (
                <div key={category}>
                  <h4 className="text-white font-bold text-[11px] uppercase tracking-widest mb-4 border-b border-white/10 pb-2">{category}</h4>
                  <div className="space-y-3">
                    {Object.entries(specs).map(([label, value]) => (
                      <div key={label} className="flex justify-between items-baseline gap-4">
                        <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{label}</span>
                        <span className="text-xs text-white font-medium text-right">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <hr className="border-white/5 my-12" />
          </section>
        )
      }

      <section className="px-4 md:px-8 py-8">
        <h3 className="venus-heading">Deployment Feedback</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {localReviews.slice(0, 3).map(review => (
            <div key={review.id} className="bg-brand-card/30 p-8 rounded-[2rem] border border-white/5">
              <div className="flex justify-between items-center mb-6">
                <StarRating rating={review.rating} />
                <span className="text-[9px] text-white/20 font-bold uppercase tracking-widest">{review.date}</span>
              </div>
              <p className="text-xs text-white/60 leading-relaxed mb-6">"{review.comment}"</p>
              <div className="flex items-center gap-3 pt-6 border-t border-white/5">
                <div className="w-8 h-8 rounded-xl bg-brand-primary/10 flex items-center justify-center text-[10px] text-brand-primary font-bold">
                  {review.userName.charAt(0)}
                </div>
                <div>
                  <span className="text-[11px] font-bold text-white/80 uppercase tracking-widest block">{review.userName}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <hr className="border-white/5 my-12" />
      </section>
    </div >
  );
}