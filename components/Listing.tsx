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
    onProductClick: (id: string, type?: 'rent' | 'buy') => void;
    onCategoryChange?: (category: string) => void;
}

export default function Listing({ category = 'All', type, searchQuery, favoritesOnly, refurbishedOnly, onProductClick, onCategoryChange }: ListingProps) {
    const { wishlist, toggleWishlist, addToCart, visibleProducts: products } = useStore();
    const [isLoading, setIsLoading] = useState(true);
    const [localSearch, setLocalSearch] = useState("");
    const [selectedType, setSelectedType] = useState<'rent' | 'buy' | 'all'>(type || 'all');
    const [selectedCondition, setSelectedCondition] = useState<'New' | 'Refurbished' | 'All'>(refurbishedOnly ? 'Refurbished' : 'All');
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<'popularity' | 'price-low' | 'price-high' | 'newest'>('popularity');

    useEffect(() => {
        setIsLoading(true);
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, [category, type, searchQuery, favoritesOnly, refurbishedOnly, selectedType, selectedCondition, selectedBrands, sortBy]);

    useEffect(() => {
        if (type) setSelectedType(type);
    }, [type]);

    const sortedAndFilteredProducts = useMemo(() => {
        let results = [...products];
        if (favoritesOnly) {
            results = results.filter(p => wishlist.includes(p.id));
        } else {
            const query = (searchQuery || localSearch).toLowerCase();
            if (query) {
                const keywords = query.split(/\s+/);
                results = results.filter(p => {
                    const searchableText = `${p.name} ${p.brand} ${p.category} ${p.subtitle} ${p.condition} ${p.availability}`.toLowerCase();
                    return keywords.every(kw => searchableText.includes(kw));
                });
            }
            if (category && category !== 'All') {
                results = results.filter(p => p.category === category);
            }
            if (selectedType !== 'all') {
                results = results.filter(p =>
                    selectedType === 'rent'
                        ? (p.availability === 'rent' || p.availability === 'both')
                        : (p.availability === 'buy' || p.availability === 'both')
                );
            }
            if (selectedBrands.length > 0) {
                results = results.filter(p => selectedBrands.includes(p.brand));
            }
            const activeCondition = refurbishedOnly ? 'Refurbished' : (selectedCondition !== 'All' ? selectedCondition : null);
            if (activeCondition) results = results.filter(p => p.condition === activeCondition);
        }

        // Apply Sorting
        switch (sortBy) {
            case 'popularity':
                results.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
                break;
            case 'price-low':
                results.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                results.sort((a, b) => b.price - a.price);
                break;
            case 'newest':
                results.sort((a, b) => Number(b.id) - Number(a.id));
                break;
        }

        return results;
    }, [category, type, searchQuery, favoritesOnly, refurbishedOnly, selectedType, selectedCondition, selectedBrands, localSearch, wishlist, sortBy, products]);

    const availableBrands = useMemo(() => {
        const brands = Array.from(new Set(products.map(p => p.brand))).filter(Boolean);
        return brands.sort();
    }, [products]);

    const categories = [
        { label: 'All Products', value: 'All', icon: 'grid_view' },
        { label: 'Laptops', value: 'Laptop', icon: 'laptop_mac' },
        { label: 'Desktops', value: 'Desktop', icon: 'desktop_windows' },
        { label: 'Monitors', value: 'Monitor', icon: 'monitor' },
        { label: 'Keyboards', value: 'Keyboards', icon: 'keyboard' },
        { label: 'Mice', value: 'Mice', icon: 'mouse' },
        { label: 'Gaming', value: 'Gaming', icon: 'sports_esports' },
        { label: 'Audio', value: 'Audio', icon: 'headphones' }
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

                        {/* Brand Section */}
                        <div>
                            <div className="flex items-center justify-between mb-7">
                                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Brands</h3>
                                {selectedBrands.length > 0 && (
                                    <button
                                        onClick={() => setSelectedBrands([])}
                                        className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:text-white transition-colors"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col gap-4">
                                {availableBrands.map(brand => (
                                    <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedBrands.includes(brand)}
                                                onChange={(e) => {
                                                    if (e.target.checked) setSelectedBrands(prev => [...prev, brand]);
                                                    else setSelectedBrands(prev => prev.filter(b => b !== brand));
                                                }}
                                                className="peer appearance-none w-5 h-5 border border-white/10 rounded-md bg-white/5 checked:bg-brand-primary checked:border-brand-primary transition-all duration-300"
                                            />
                                            <span className="material-symbols-outlined absolute text-[14px] text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">check</span>
                                        </div>
                                        <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${selectedBrands.includes(brand) ? 'text-white' : 'text-white/40 group-hover:text-white'}`}>
                                            {brand}
                                        </span>
                                    </label>
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
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-widest text-brand-muted">
                        <span className="hover:text-white cursor-pointer transition-colors" onClick={() => onCategoryChange?.('All')}>Home</span>
                        <span className="material-symbols-outlined text-[10px] scale-75">chevron_right</span>
                        <span className="hover:text-white cursor-pointer transition-colors" onClick={() => onCategoryChange?.('All')}>Collection</span>
                        {category !== 'All' && (
                            <>
                                <span className="material-symbols-outlined text-[10px] scale-75">chevron_right</span>
                                <span className="text-white">{category}</span>
                            </>
                        )}
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 pb-6 border-b border-white/5">
                        <div className="space-y-1">
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                                {favoritesOnly ? 'Wishlist' : (category === 'All' ? 'Full Collection' : `${category} Collection`)}
                            </h2>
                            <p className="text-[11px] font-black text-brand-muted uppercase tracking-[0.3em]">Showing {sortedAndFilteredProducts.length} Results</p>
                        </div>

                        {/* Desktop Sort Options */}
                        <div className="hidden md:flex items-center gap-8">
                            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Sort By</span>
                            <div className="flex items-center gap-6">
                                {[
                                    { label: 'Popularity', value: 'popularity' },
                                    { label: 'Price -- Low to High', value: 'price-low' },
                                    { label: 'Price -- High to Low', value: 'price-high' },
                                    { label: 'Newest First', value: 'newest' }
                                ].map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setSortBy(opt.value as any)}
                                        className={`text-[10px] font-black uppercase tracking-widest transition-all relative py-2 ${sortBy === opt.value ? 'text-brand-primary' : 'text-white/40 hover:text-white'
                                            }`}
                                    >
                                        {opt.label}
                                        {sortBy === opt.value && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary rounded-full shadow-glow" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mobile Brand Filter */}
                        <div className="md:hidden space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest">Filter By Brand</span>
                                {selectedBrands.length > 0 && (
                                    <button
                                        onClick={() => setSelectedBrands([])}
                                        className="text-[10px] font-black text-brand-primary uppercase tracking-widest"
                                    >
                                        Clear ({selectedBrands.length})
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {availableBrands.map(brand => {
                                    const isSelected = selectedBrands.includes(brand);
                                    return (
                                        <button
                                            key={brand}
                                            onClick={() => {
                                                if (isSelected) setSelectedBrands(prev => prev.filter(b => b !== brand));
                                                else setSelectedBrands(prev => [...prev, brand]);
                                            }}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${isSelected
                                                ? 'bg-brand-primary border-brand-primary text-white'
                                                : 'bg-brand-card border-white/5 text-white/40 hover:border-white/20'
                                                }`}
                                        >
                                            {brand}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mobile Sort Dropdown */}
                        <div className="md:hidden space-y-2">
                            <span className="text-[10px] font-black text-brand-muted uppercase tracking-widest block">Sort By</span>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="w-full bg-brand-card border border-white/10 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest text-white focus:outline-none focus:border-brand-primary transition-all appearance-none"
                                >
                                    <option value="popularity">Popularity</option>
                                    <option value="price-low">Price -- Low to High</option>
                                    <option value="price-high">Price -- High to Low</option>
                                    <option value="newest">Newest First</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 xl:grid-cols-3 gap-7 mb-12">
                        {sortedAndFilteredProducts.length === 0 ? (
                            <div className="col-span-full py-32 text-center bg-brand-card/50 border border-white/5 rounded-[3rem] backdrop-blur-sm animate-in fade-in zoom-in duration-700">
                                <div className="w-24 h-24 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-8 shadow-glow">
                                    <span className="material-symbols-outlined text-5xl text-brand-primary animate-pulse">inventory_2</span>
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4 italic">No matching products</h3>
                                <p className="text-brand-muted text-[11px] font-black uppercase tracking-[0.3em] max-w-sm mx-auto mb-10 leading-relaxed">
                                    Your current filter selection returned zero results. Try adjusting your parameters.
                                </p>
                                <button
                                    onClick={() => {
                                        setSelectedBrands([]);
                                        setSelectedType('all');
                                        setSelectedCondition('All');
                                        onCategoryChange?.('All');
                                    }}
                                    className="bg-white text-black px-10 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-elevated active:scale-95"
                                >
                                    Reset All Filters
                                </button>
                            </div>
                        ) : (
                            sortedAndFilteredProducts.map((product) => (
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
                            ))
                        )}
                    </div>
                    <hr className="border-white/5 my-12" />
                </div>
            </div>
        </div>
    );
}