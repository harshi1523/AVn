import React, { useState, useEffect, useRef, useMemo } from "react";
import { products, Product } from "../lib/mockData";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, params?: any) => void;
  nested?: boolean;
}

export default function SearchOverlay({ isOpen, onClose, onNavigate, nested }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(-1);
      // Delay focus slightly to allow for transition
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const filteredResults = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery) return [];

    // Tokenized "Every Word" Search Logic
    const keywords = trimmedQuery.split(/\s+/);

    return products.filter(p => {
      // Aggregate searchable fields
      const searchableText = [
        p.name,
        p.brand,
        p.category,
        p.subtitle,
        p.condition,
        p.availability,
        ...(Object.values(p.specs || {})),
      ].join(' ').toLowerCase();

      // Ensure EVERY keyword appears in the metadata
      return keywords.every(kw => searchableText.includes(kw));
    }).slice(0, 5); // Show top 5 matches
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < filteredResults.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > -1 ? prev - 1 : -1));
      } else if (e.key === 'Enter') {
        if (selectedIndex >= 0 && filteredResults[selectedIndex]) {
          e.preventDefault();
          onNavigate('product', { id: filteredResults[selectedIndex].id, type: filteredResults[selectedIndex].availability === 'both' ? undefined : filteredResults[selectedIndex].availability });
        } else if (query.trim()) {
          e.preventDefault();
          onNavigate('listing', { searchQuery: query });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredResults, selectedIndex, query, onNavigate, onClose]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onNavigate('listing', { searchQuery: query });
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 ${nested ? 'lg:left-[320px]' : ''} z-[1000] flex flex-col items-center pt-[15vh] px-4 md:px-8 animate-in fade-in duration-300`}>
      {/* Background with deep blur */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-3xl"
        onClick={onClose}
      />

      {/* Search Container */}
      <div className="relative w-full max-w-2xl animate-in zoom-in-95 slide-in-from-top-12 duration-500">
        <form onSubmit={handleSearch} className="group relative">
          {/* Integrated Return Button and Search Icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 z-10">
            <button
              type="button"
              onClick={onClose}
              className="p-3 text-gray-400 hover:text-white transition-all rounded-full hover:bg-white/5 active:scale-90 flex items-center justify-center"
              title="Return to Home"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back</span>
            </button>
            <div className="w-px h-6 bg-white/10 hidden md:block mx-1"></div>
            <span className="material-symbols-outlined text-gray-500 group-focus-within:text-brand-primary transition-colors hidden md:block">search</span>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
            placeholder="Type your mission requirements..."
            className="w-full bg-brand-card/70 border-b-2 border-white/10 p-8 pl-16 md:pl-28 text-xl md:text-2xl text-white placeholder:text-gray-600 focus:outline-none focus:border-brand-primary transition-all rounded-t-3xl shadow-2xl backdrop-blur-md"
          />

          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
            <button type="submit" className="text-gray-600 hover:text-white transition-colors">
              <span className="material-symbols-outlined text-3xl">arrow_forward</span>
            </button>
          </div>
        </form>

        {/* Results / Suggestions */}
        <div className="bg-brand-card/80 border-x border-b border-white/5 rounded-b-3xl overflow-hidden shadow-2xl backdrop-blur-md">
          {query.trim() ? (
            <div className="p-4 md:p-6 space-y-4">
              <h4 className="text-[10px] text-gray-500 venus-heading mb-4 ml-2">Quick Results</h4>
              {filteredResults.length > 0 ? (
                <div className="space-y-2">
                  {filteredResults.map((product, idx) => (
                    <button
                      key={product.id}
                      onClick={() => onNavigate('product', { id: product.id, type: product.availability === 'both' ? undefined : product.availability })}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border border-transparent transition-all text-left group ${selectedIndex === idx ? 'bg-white/10 border-white/20' : 'hover:bg-white/5 hover:border-white/10'}`}
                    >
                      <div className="w-10 h-10 bg-black rounded-xl flex-shrink-0 p-1.5 border border-white/5">
                        <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className={`text-white font-bold truncate transition-colors ${selectedIndex === idx ? 'text-brand-primary' : ''}`}>{product.name}</h5>
                        <p className="text-xs text-gray-500 truncate italic">{product.subtitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-white italic">₹{product.price.toLocaleString()}</p>
                        <p className="text-[8px] text-gray-600 font-black uppercase tracking-widest">{product.availability}</p>
                      </div>
                    </button>
                  ))}
                  <button
                    onClick={handleSearch}
                    className="w-full mt-4 p-4 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.4em] text-brand-primary hover:bg-brand-primary hover:text-white transition-all text-center"
                  >
                    View All Matching "{query}"
                  </button>
                </div>
              ) : (
                <div className="py-12 text-center text-gray-600">
                  <span className="material-symbols-outlined text-4xl mb-4 opacity-20">search_off</span>
                  <p className="text-[10px] text-white/40 venus-heading">No results found for "{query}"</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-10">
              <h4 className="text-[10px] text-gray-500 venus-heading mb-6 text-center">Suggested Searches</h4>
              <div className="flex flex-wrap justify-center gap-3">
                {['MacBook Pro', 'Gaming PC', 'Monitors', 'Refurbished', 'Workstation'].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setQuery(s);
                      setSelectedIndex(-1);
                    }}
                    className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-widest hover:border-brand-primary hover:text-brand-primary transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
