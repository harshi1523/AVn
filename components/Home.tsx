
import React from "react";
import Hero from "./Hero";
import CategorySection from "./CategorySection";
import FAQ from "./FAQ";
import DealOfTheDay from "./DealOfTheDay";
import ProductSection from "./ProductSection";

import { Product as ProductType } from "../lib/mockData";
import { useStore } from "../lib/store";

interface HomeProps {
  onNavigate: (view: string, params?: any) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const { visibleProducts: products, isProductsReady } = useStore();
  const featuredProducts = products.slice(0, 4);
  const refurbishedDeals = products
    .filter(p => p.condition === 'Refurbished')
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      name: p.name,
      price: `₹${p.price.toLocaleString()}`,
      originalPrice: `₹${p.originalPrice.toLocaleString()}`,
      image: p.image,
      availability: p.availability
    }));

  const brands = [
    { name: 'Apple', img: '/brands/apple.jpg', slogan: 'Think Different' },
    { name: 'Dell', img: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?q=80&w=600&auto=format&fit=crop', slogan: 'Power Your Future' },
    { name: 'Asus', img: '/brands/asus.jpg', slogan: 'In Search of Incredible' },
    { name: 'Lenovo', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop', slogan: 'Smarter Tech for All' },
    { name: 'HP', img: '/brands/hp.jpg', slogan: 'Keep Reinventing' },
    { name: 'Razer', img: 'https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?q=80&w=600&auto=format&fit=crop', slogan: 'For Gamers. By Gamers.' },
  ];

  return (
    <div className="animate-in fade-in duration-500 bg-brand-page">
      <Hero onNavigate={onNavigate} />

      <CategorySection onNavigate={onNavigate} />

      <section className="py-8 max-w-7xl mx-auto px-4">
        <h3 className="avn-heading">Latest Launches</h3>
        <div
          className="relative rounded-2xl-custom overflow-hidden h-[500px] group cursor-pointer border border-white/10 shadow-2xl"
          onClick={() => onNavigate('product', { id: 'apple-macbook-pro-m3' })}
        >
          <img
            src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2000&auto=format&fit=crop"
            alt="MacBook Pro M3"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent"></div>
          <div className="absolute inset-0 p-12 md:p-16 flex flex-col justify-center">
            <span className="text-brand-primary font-bold text-[10px] tracking-widest uppercase mb-4">Apple</span>
            <h4 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight tracking-tight max-w-xl">MacBook Pro M3. Scary Fast.</h4>
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-white">Buy Now From ₹1,89,994</span>
              <div className="w-10 h-10 rounded-full border border-white/30 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all">
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </div>
            </div>
          </div>
        </div>
        <hr className="border-white/5 my-12" />
      </section>

      {!isProductsReady ? (
        <section className="py-8 max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex justify-between items-baseline mb-8">
            <div className="h-6 w-48 bg-white/5 rounded-lg animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-brand-card border border-white/5 rounded-[2rem] overflow-hidden animate-pulse">
                <div className="aspect-square bg-white/5" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-5 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
          <hr className="border-white/5 my-12" />
        </section>
      ) : (
        <ProductSection
          title="Refurbished Collection"
          products={refurbishedDeals}
          onProductClick={(id) => {
            const p = products.find(prod => prod.id === id);
            onNavigate('product', { id, type: p?.availability === 'both' ? undefined : p?.availability });
          }}
          onViewAll={() => onNavigate('listing', { refurbishedOnly: true })}
        />
      )}

      <section className="py-8 max-w-7xl mx-auto px-4">
        <h3 className="avn-heading">Shop By Brand</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {brands.map((brand, i) => (
            <div
              key={i}
              className="group relative h-96 rounded-[2.5rem] overflow-hidden cursor-pointer border border-white/10 transition-all duration-500 hover:border-brand-primary/40 hover:-translate-y-2 shadow-2xl"
              onClick={() => onNavigate('brand', { brand: brand.name })}
            >
              <img
                src={brand.img}
                className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:brightness-100 group-hover:scale-110 transition-all duration-1000"
                alt={brand.name}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
              <div className="absolute inset-0 p-10 flex flex-col justify-end">
                <h4 className="text-4xl font-bold text-white mb-2 tracking-tight">{brand.name}</h4>
                <p className="text-gray-400 text-sm font-medium mb-8">{brand.slogan}</p>
                <button className="w-fit bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-[10px] uppercase tracking-widest py-4 px-10 rounded-xl hover:bg-white hover:text-black transition-all">
                  Explore Catalog
                </button>
              </div>
            </div>
          ))}
        </div>
        <hr className="border-white/5 my-12" />
      </section>

      <section className="py-8 max-w-7xl mx-auto px-4">
        <h3 className="avn-heading">Featured Devices</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {!isProductsReady
            ? [...Array(4)].map((_, i) => (
              <div key={i} className="bg-brand-card border border-white/5 rounded-2xl p-5 animate-pulse flex flex-col h-full">
                <div className="aspect-video bg-white/5 rounded-xl mb-6" />
                <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/5 rounded w-1/2 mb-auto" />
                <div className="pt-4 border-t border-white/5 mt-4 flex justify-between items-center">
                  <div className="h-5 bg-white/5 rounded w-1/3" />
                  <div className="h-8 bg-white/5 rounded-lg w-20" />
                </div>
              </div>
            ))
            : featuredProducts.map(p => (
              <ProductCard key={p.id} product={p} onNavigate={onNavigate} />
            ))
          }
        </div>
        <div className="flex justify-center">
          <button onClick={() => onNavigate('listing')} className="bg-white/5 border border-white/10 text-white px-10 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-all">View More</button>
        </div>
        <hr className="border-white/5 my-12" />
      </section>

      <DealOfTheDay onNavigate={onNavigate} />

      <section className="py-8 max-w-7xl mx-auto px-4">
        <h3 className="avn-heading">For Your Budget</h3>
        <p className="text-gray-500 text-sm mb-12">Find the perfect device that fits your financial plan.</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 relative h-96 rounded-3xl-custom overflow-hidden bg-brand-card border border-white/10 group cursor-pointer" onClick={() => onNavigate('listing', { priceRange: 'low' })}>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
            <div className="absolute inset-0 p-16 flex flex-col justify-center items-start text-left">
              <span className="bg-green-600/20 text-green-400 px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest mb-4">Budget Friendly</span>
              <h4 className="text-6xl font-bold text-white mb-4 leading-none tracking-tight">Below <span className="text-green-500">₹1,200</span></h4>
              <p className="text-gray-400 text-lg">Reliable daily drivers for students & office work.</p>
            </div>
          </div>
          <div className="flex flex-col gap-8">
            <div className="relative h-44 rounded-3xl-custom overflow-hidden bg-red-900/10 border border-white/10 p-10 flex flex-col justify-end items-start text-left group cursor-pointer" onClick={() => onNavigate('listing', { priceRange: 'mid' })}>
              <span className="bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest mb-2">Mid-Grade</span>
              <h4 className="text-3xl font-bold text-white tracking-tight">₹1,200 - ₹2,500 <span className="text-xs text-gray-500 font-medium">/mo</span></h4>
            </div>
            <div className="relative h-44 rounded-3xl-custom overflow-hidden bg-purple-900/10 border border-white/10 p-10 flex flex-col justify-end items-start text-left group cursor-pointer" onClick={() => onNavigate('listing', { priceRange: 'high' })}>
              <span className="bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest mb-2">Pro Grade</span>
              <h4 className="text-3xl font-bold text-white tracking-tight">₹2,500+ <span className="text-xs text-gray-500 font-medium">/mo</span></h4>
            </div>
          </div>
        </div>
        <hr className="border-white/5 my-12" />
      </section>

      <FAQ />
    </div>
  );
}

interface ProductCardProps {
  // Explicitly add key to props interface to resolve TypeScript error on line 108
  key?: React.Key;
  product: ProductType;
  onNavigate: (view: string, params?: any) => void;
}

function ProductCard({ product, onNavigate }: ProductCardProps) {
  const { wishlist, toggleWishlist } = useStore();
  const isInWishlist = wishlist.includes(product.id);
  const isRent = product.availability === 'rent' || product.availability === 'both';

  return (
    <div className="bg-brand-card border border-white/10 rounded-2xl p-5 hover:border-white/30 transition-all group shadow-xl flex flex-col h-full relative">
      <div className={`absolute top-4 right-4 z-30 transition-all duration-300 ${isInWishlist ? 'opacity-100 scale-100' : 'opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100'}`}>
        <button
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
          className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl transition-all active:scale-125 ${isInWishlist ? 'bg-red-500 text-white shadow-glow' : 'bg-black/60 text-white border border-white/10 hover:bg-white hover:text-black'}`}
        >
          <span className={`material-symbols-outlined text-[18px] ${isInWishlist ? 'filled-icon' : 'font-light'}`}>favorite</span>
        </button>
      </div>
      <div className="relative aspect-video mb-6 bg-black rounded-xl flex items-center justify-center p-4 border border-white/5 overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" />
      </div>
      <div className="mb-4">
        <h4 className="font-bold text-sm text-white truncate tracking-tight">{product.name}</h4>
        <p className="text-[10px] text-gray-500 font-medium truncate">{product.subtitle}</p>
      </div>
      <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
        <div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{isRent ? 'Monthly' : 'Price'}</p>
          <p className="text-lg font-bold text-white">₹{product.price.toLocaleString()}</p>
        </div>
        <button onClick={() => onNavigate('product', { id: product.id })} className={`px-5 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-md active:scale-95 ${isRent ? 'bg-brand-primary text-white' : 'bg-white text-black'
          }`}>
          {isRent ? 'Rent Now' : 'Buy Now'}
        </button>
      </div>
    </div>
  );
}
