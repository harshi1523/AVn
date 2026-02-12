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
        <div className="min-h-screen max-w-7xl mx-auto px-4 md:px-8 pt-10">
            <div className="flex flex-col lg:flex-row gap-14 items-start">
                <aside className="hidden lg:block w-80 sticky top-32 h-[calc(100vh-160px)] overflow-y-auto no-scrollbar pr-4">
                    <div className="space-y-12">
                        {/* Categories Section */}
                        <div>
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-7">Categories</h3>
                            <div className="flex flex-col gap-3.5">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.value}
                                        onClick={() => onCategoryChange?.(cat.value)}
                                        className={`group w-full flex items-center gap-4 px-7 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.15em] transition-all duration-300 ${category === cat.value
                                            ? 'bg-white text-black scale-100 shadow-elevated'
                                            : 'text-white hover:bg-white/5 hover:scale-105'
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined text-[22px] transition-colors ${category === cat.value ? 'text-black' : 'text-white'
                                            }`}>{cat.icon}</span>
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rent or Buy Section */}
                        <div>
                            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-7">Rent or Buy</h3>
                            <div className="p-2 bg-brand-card border border-white/5 rounded-2xl flex relative">
                                {['all', 'rent', 'buy'].map((t) => {
                                    const isActive = selectedType === t;
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => setSelectedType(t as 'all' | 'rent' | 'buy')}
                                            className={`flex-1 py-3.5 px-5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 relative z-10 ${isActive
                                                ? 'bg-white text-black shadow-lg'
                                                : 'text-white'
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

                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-7 mb-12">
                        {filteredProducts.map((product) => (
                            <div key={product.id} onClick={() => onProductClick(product.id)} className="group relative bg-brand-card border border-white/5 rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 hover:border-brand-primary/40 hover:-translate-y-2 hover:shadow-card-hover flex flex-col h-full">
                                <div className="aspect-square bg-black/40 p-8 flex items-center justify-center">
                                    <img src={product.image} alt={product.name} className="w-[85%] h-[85%] object-contain group-hover:scale-110 transition-all duration-700" />
                                    {/* Status Badge */}
                                    {product.status && product.status !== 'AVAILABLE' && (
                                        <div className={`absolute top-5 right-5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border backdrop-blur-md shadow-lg ${product.status === 'OUT_OF_STOCK' ? 'bg-red-500/20 text-red-500 border-red-500/30' :
                                            product.status === 'RENTED' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                                                'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' // Low Stock
                                            }`}>
                                            {product.status.replace('_', ' ')}
                                        </div>
                                    )}
                                </div>
                                <div className="p-7 flex-1 flex flex-col">
                                    <h4 className="font-bold text-white mb-2 line-clamp-2 text-lg uppercase tracking-tight">{product.name}</h4>
                                    <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                                        <p className="text-xl font-bold text-white">₹{product.price.toLocaleString()}</p>
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