import React, { useState, useEffect, useMemo } from "react";
import { Product } from "../lib/mockData";
import { useStore } from "../lib/store";
import Tooltip from "./Tooltip";
import QuickViewModal from "./QuickViewModal";

interface ListingProps {
    category?: string;
    type?: 'rent' | 'buy';
    searchQuery?: string;
    favoritesOnly?: boolean;
    refurbishedOnly?: boolean;
    onProductClick: (id: string) => void;
    onCategoryChange?: (category: string) => void;
}

export default function Listing({ category = 'All', type, searchQuery, favoritesOnly, refurbishedOnly, onProductClick, onCategoryChange }: ListingProps) {
    const { wishlist, toggleWishlist, addToCart, products } = useStore();
    const [isLoading, setIsLoading] = useState(true);
    const [localSearch, setLocalSearch] = useState("");
    const [selectedType, setSelectedType] = useState<'rent' | 'buy' | 'all'>(type || 'all');
    const [selectedCondition, setSelectedCondition] = useState<'New' | 'Refurbished' | 'All'>(refurbishedOnly ? 'Refurbished' : 'All');

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, [category, type, searchQuery, favoritesOnly, refurbishedOnly, selectedType, selectedCondition]);

    useEffect(() => {
        if (type) setSelectedType(type);
    }, [type]);

    const filteredProducts = useMemo(() => {
        let results = products;
        if (favoritesOnly) {
            results = results.filter(p => wishlist.includes(p.id));
        } else {
            const query = (searchQuery || localSearch).toLowerCase();
            if (query) {
                const keywords = query.split(/\s+/);
                results = results.filter(p => {
                    const searchableText = `${p.name} ${p.brand} ${p.category} ${p.subtitle} ${p.condition}`.toLowerCase();
                    return keywords.every(kw => searchableText.includes(kw));
                });
            }
            if (category && category !== 'All') {
                results = results.filter(p => p.category === category || (category === 'Desktop' && p.category === 'Monitor') || (category === 'Accessories' && ['Keyboards', 'Mice', 'Audio'].includes(p.category || '')));
            }
            if (selectedType !== 'all') {
                results = results.filter(p => p.type === selectedType);
            }
            const activeCondition = refurbishedOnly ? 'Refurbished' : (selectedCondition !== 'All' ? selectedCondition : null);
            if (activeCondition) results = results.filter(p => p.condition === activeCondition);
        }
        return results;
    }, [category, type, searchQuery, favoritesOnly, refurbishedOnly, selectedType, selectedCondition, localSearch, wishlist]);

    const categories = [
        { label: 'All Products', value: 'All', icon: 'grid_view' },
        { label: 'Laptops', value: 'Laptop', icon: 'laptop_mac' },
        { label: 'Desktops', value: 'Desktop', icon: 'desktop_windows' },
        { label: 'Accessories', value: 'Accessories', icon: 'keyboard' },
        { label: 'Gaming', value: 'Gaming', icon: 'sports_esports' }
    ];

    return (
        <div className="min-h-screen max-w-7xl mx-auto px-4 md:px-8 pt-8">
            <div className="flex flex-col lg:flex-row gap-12 items-start">
                <aside className="hidden lg:block w-72 sticky top-32 h-[calc(100vh-160px)] overflow-y-auto no-scrollbar pr-4">
                    <div className="space-y-12">
                        {/* Categories Section */}
                        <div>
                            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-6">Categories</h3>
                            <div className="flex flex-col gap-3">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.value}
                                        onClick={() => onCategoryChange?.(cat.value)}
                                        className={`group w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${category === cat.value
                                                ? 'bg-white text-black scale-100 shadow-xl'
                                                : 'text-white/40 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined text-[20px] transition-colors ${category === cat.value ? 'text-black' : 'text-white/40 group-hover:text-white'
                                            }`}>{cat.icon}</span>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rent or Buy Section */}
                        <div>
                            <h3 className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-6">Rent or Buy</h3>
                            <div className="p-1.5 bg-brand-card border border-white/5 rounded-2xl flex relative">
                                {['all', 'rent', 'buy'].map((t) => {
                                    const isActive = selectedType === t;
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => setSelectedType(t as 'all' | 'rent' | 'buy')}
                                            className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative z-10 ${isActive
                                                    ? 'bg-white text-black shadow-lg'
                                                    : 'text-white/40 hover:text-white'
                                                }`}
                                        >
                                            {t}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 w-full">
                    <h3 className="venus-heading">
                        {favoritesOnly ? 'Wishlist' : (category === 'All' ? 'Full Collection' : `${category} Collection`)}
                    </h3>

                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                        {filteredProducts.map((product) => (
                            <div key={product.id} onClick={() => onProductClick(product.id)} className="group relative bg-brand-card border border-white/5 rounded-[2rem] overflow-hidden cursor-pointer transition-all hover:border-brand-primary/40 hover:-translate-y-2 flex flex-col h-full shadow-xl">
                                <div className="aspect-square bg-black/40 p-6 flex items-center justify-center">
                                    <img src={product.image} alt={product.name} className="w-[85%] h-[85%] object-contain group-hover:scale-110 transition-all duration-700" />
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h4 className="font-bold text-white mb-2 line-clamp-2 text-base uppercase tracking-tight">{product.name}</h4>
                                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                        <p className="text-lg font-bold text-white">₹{product.price.toLocaleString()}</p>
                                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{product.condition}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <hr className="border-white/5 my-12" />
                </div>
            </div>
        </div>
    );
}