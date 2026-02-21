import React, { useState, useEffect } from "react";
import { Product } from "../lib/mockData";
import { useStore } from "../lib/store";
import QuickViewModal from "./QuickViewModal";

interface BrandListingProps {
    brand: string;
    onProductClick: (id: string) => void;
    onBack: () => void;
}

const BRAND_METADATA: Record<string, { logo: string; banner: string; desc: string }> = {
    'Apple': {
        logo: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg',
        banner: 'https://images.unsplash.com/photo-1510511459019-5dee9954889c?auto=format&fit=crop',
        desc: 'Precision engineered hardware. Experience the Apple ecosystem with MacBook Pro, iMac, and Mac Studio.'
    },
    'Dell': {
        logo: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Dell_Logo.svg',
        banner: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop',
        desc: 'Reliable business infrastructure. From Latitude laptops to Alienware gaming behemoths.'
    },
    'Asus': {
        logo: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Asus_logo.svg',
        banner: 'https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?auto=format&fit=crop',
        desc: 'In search of incredible. Performance focused hardware for creators and gamers alike.'
    },
    'Lenovo': {
        logo: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg',
        banner: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop',
        desc: 'Smarter technology for all. Versatile laptops, desktops, and enterprise-grade solutions.'
    },
    'Razer': {
        logo: 'https://upload.wikimedia.org/wikipedia/en/4/40/Razer_snake_logo.svg',
        banner: 'https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?auto=format&fit=crop',
        desc: 'For Gamers. By Gamers. The world\'s leading lifestyle brand for gamers.'
    },
    'HP': {
        logo: 'https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg',
        banner: 'https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?auto=format&fit=crop',
        desc: 'Innovation that works for you. Leading the way with sustainable and powerful computing.'
    }
};

/**
 * Helper to generate responsive Unsplash URLs
 */
const getUnsplashResponsiveUrl = (url: string, width: number, quality: number = 80) => {
    if (!url.includes('unsplash.com')) return url;
    // Ensure we don't duplicate query params if already present
    const baseUrl = url.split('?')[0];
    return `${baseUrl}?q=${quality}&w=${width}&auto=format&fit=crop`;
};

export default function BrandListing({ brand, onProductClick, onBack }: BrandListingProps) {
    const { wishlist, toggleWishlist, addToCart, products } = useStore();
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 600);
        return () => clearTimeout(timer);
    }, [brand]);

    const brandLower = brand.toLowerCase();
    const displayProducts = products.filter(p => {
        const byBrandField = p.brand?.toLowerCase() === brandLower;
        const byNamePrefix = !p.brand && p.name?.toLowerCase().startsWith(brandLower);
        return byBrandField || byNamePrefix;
    });
    const metadata = BRAND_METADATA[brand] || {
        logo: '',
        banner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop',
        desc: `Explore the full range of ${brand} products available for rent and purchase.`
    };

    return (
        <div className="animate-in fade-in duration-500">
            {/* Brand Header with Responsive <picture> */}
            <div className="relative h-[400px] md:h-[500px] overflow-hidden">
                <picture className="absolute inset-0 w-full h-full">
                    {/* Mobile: 640px */}
                    <source
                        media="(max-width: 640px)"
                        srcSet={getUnsplashResponsiveUrl(metadata.banner, 640, 75)}
                    />
                    {/* Tablet: 1024px */}
                    <source
                        media="(max-width: 1024px)"
                        srcSet={getUnsplashResponsiveUrl(metadata.banner, 1024, 80)}
                    />
                    {/* Desktop Default: 1920px */}
                    <img
                        src={getUnsplashResponsiveUrl(metadata.banner, 1920, 85)}
                        alt={`${brand} Brand Banner`}
                        className="w-full h-full object-cover filter brightness-[0.3]"
                        loading="eager"
                    />
                </picture>

                <div className="absolute inset-0 bg-gradient-to-t from-brand-page via-black/40 to-transparent"></div>
                <div className="absolute inset-0 max-w-7xl mx-auto px-6 flex flex-col justify-center items-start">
                    <button onClick={onBack} className="text-[10px] font-black uppercase tracking-[0.4em] text-white hover:text-white/80 mb-10 flex items-center gap-2 group">
                        <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span> Back to Home
                    </button>
                    <div className="flex items-center gap-8 mb-6">
                        <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-3xl p-4 flex items-center justify-center shadow-2xl">
                            <img src={metadata.logo} alt={brand} className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase italic">{brand}</h1>
                    </div>
                    <p className="max-w-xl text-gray-400 text-sm md:text-lg leading-relaxed font-medium opacity-80">{metadata.desc}</p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
                <div className="flex justify-between items-end mb-12 md:mb-16 border-b border-white/10 pb-10">
                    <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-widest italic">Product Manifest</h2>
                    <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em]">{displayProducts.length} Active Nodes</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="aspect-[3/4] skeleton-shimmer rounded-[2rem] md:rounded-[2.5rem] opacity-20"></div>
                        ))
                    ) : displayProducts.length === 0 ? (
                        <div className="col-span-full py-32 text-center">
                            <span className="material-symbols-outlined text-6xl text-white/10 mb-6">inventory_2</span>
                            <h3 className="text-xl font-bold text-white/40 uppercase tracking-widest">No products found for this brand</h3>
                        </div>
                    ) : (
                        displayProducts.map(product => {
                            const isInWishlist = wishlist.includes(product.id);
                            const isRent = product.type === 'rent';

                            // Generate responsive srcset for product images if they are Unsplash
                            const productImgSrcSet = product.image.includes('unsplash.com')
                                ? `${getUnsplashResponsiveUrl(product.image, 300)} 300w, ${getUnsplashResponsiveUrl(product.image, 600)} 600w, ${getUnsplashResponsiveUrl(product.image, 900)} 900w`
                                : undefined;

                            return (
                                <div
                                    key={product.id}
                                    onClick={() => onProductClick(product.id)}
                                    className="group relative bg-brand-card border border-white/5 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden cursor-pointer transition-all duration-500 hover:border-brand-primary/40 hover:-translate-y-2 flex flex-col h-full"
                                >
                                    <div className="absolute top-4 left-4 md:top-6 md:left-6 z-30">
                                        <div className={`px-2.5 md:px-4 py-1 md:py-1.5 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-lg border ${isRent
                                            ? 'bg-brand-primary text-white border-brand-primary'
                                            : 'bg-white text-black border-white'
                                            }`}>
                                            {isRent ? 'RENT' : 'BUY'}
                                        </div>
                                    </div>

                                    <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                                            className={`w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center backdrop-blur-3xl transition-all active:scale-125 ${isInWishlist ? 'bg-red-500 text-white shadow-glow' : 'bg-black/60 text-white/40 border border-white/10'}`}
                                        >
                                            <span className={`material-symbols-outlined text-[16px] md:text-[18px] ${isInWishlist ? 'filled-icon' : 'font-light'}`}>favorite</span>
                                        </button>
                                    </div>

                                    <div className="aspect-square bg-black/60 p-6 md:p-10 flex items-center justify-center relative">
                                        <div className="absolute inset-0 topography-lines opacity-5"></div>
                                        <img
                                            src={getUnsplashResponsiveUrl(product.image, 600)}
                                            srcSet={productImgSrcSet}
                                            sizes="(max-width: 768px) 45vw, 20vw"
                                            alt={product.name}
                                            className="w-full h-full object-contain group-hover:scale-110 transition-all duration-700 relative z-10"
                                            loading="lazy"
                                        />
                                    </div>

                                    <div className="p-6 md:p-8 flex-1 flex flex-col">
                                        <h3 className="text-white font-bold text-xs md:text-sm tracking-tight uppercase line-clamp-2 mb-4 md:mb-6 group-hover:text-brand-primary transition-colors">{product.name}</h3>
                                        <div className="mt-auto flex justify-between items-end border-t border-white/5 pt-4 md:pt-6">
                                            <div>
                                                <p className="text-[8px] md:text-[10px] text-white/20 font-black uppercase tracking-widest mb-1">{isRent ? 'MONTHLY' : 'TOTAL'}</p>
                                                <p className="text-lg md:text-xl font-black text-white tracking-tighter italic">₹{product.price.toLocaleString()}</p>
                                            </div>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onProductClick(product.id); }}
                                                className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:bg-brand-primary group-hover:text-white transition-all"
                                            >
                                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {quickViewProduct && (
                <QuickViewModal
                    product={quickViewProduct}
                    onClose={() => setQuickViewProduct(null)}
                    onNavigateToProduct={(id) => { setQuickViewProduct(null); onProductClick(id); }}
                />
            )}
        </div>
    );
}
