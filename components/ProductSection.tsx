import React from "react";
import { useStore } from "../lib/store";

interface ProductSummary {
  id: string;
  name: string;
  price: string;
  originalPrice: string;
  image: string;
  rating?: number;
  condition?: string;
  type?: 'rent' | 'buy';
  status?: string;
}

interface ProductSectionProps {
  title: string;
  products: ProductSummary[];
  variant?: "dark" | "blue";
  onProductClick?: (id: string) => void;
  onViewAll?: () => void;
  isLoading?: boolean;
}

export default function ProductSection({ title, products, onProductClick, onViewAll }: ProductSectionProps) {
  const { wishlist, toggleWishlist } = useStore();

  return (
    <section className="py-8 max-w-7xl mx-auto px-4 md:px-8">
      <div className="flex justify-between items-baseline mb-8">
        <h3 className="avn-heading">{title}</h3>
        <button onClick={onViewAll} className="text-[9px] font-bold uppercase tracking-widest text-brand-primary hover:text-white transition-all">
          View All Collection
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {products.map((product) => {
          const isInWishlist = wishlist.includes(product.id);
          const isRent = product.type === 'rent';
          return (
            <div key={product.id} onClick={() => onProductClick && onProductClick(product.id)} className="group relative bg-brand-card border border-white/10 rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:border-white/30">
              <div className={`absolute top-4 right-4 z-30 transition-all duration-300 ${isInWishlist ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'}`}>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-3xl transition-all active:scale-125 ${isInWishlist ? 'bg-red-500 text-white shadow-glow' : 'bg-black/60 text-white/40 hover:text-white shadow-xl border border-white/10'}`}
                >
                  <span className={`material-symbols-outlined text-[18px] ${isInWishlist ? 'filled-icon' : 'font-light'}`}>favorite</span>
                </button>
              </div>

              {/* Status Badge */}
              {product.status && product.status !== 'AVAILABLE' && (
                <div className={`absolute top-4 left-4 z-30 px-3 py-1.5 rounded-lg border backdrop-blur-md text-[9px] font-bold uppercase tracking-widest ${product.status === 'LOW STOCK' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                  product.status === 'RENTED' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                    'bg-red-500/10 border-red-500/20 text-red-500'
                  }`}>
                  {product.status.replace('_', ' ')}
                </div>
              )}

              <div className="relative aspect-square bg-black/60 p-8 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-6">
                <h4 className="font-bold text-white text-sm leading-tight line-clamp-2 mb-5 uppercase tracking-tight opacity-80">{product.name}</h4>
                <div className="flex items-baseline gap-2 border-t border-white/10 pt-5">
                  <span className="text-xl font-bold text-white tracking-tight">{product.price}</span>
                  {isRent && <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">/mo</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <hr className="border-white/5 my-12" />
    </section>
  );
}