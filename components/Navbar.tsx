import React, { useState } from "react";
import { useStore } from "../lib/store";
import MenuDrawer from "./MenuDrawer";

interface NavbarProps {
  onNavigate: (view: string, params?: any) => void;
  onOpenSearch: () => void;
  scrolled: boolean;
  currentView: string;
  viewParams: any;
}

export default function Navbar({ onNavigate, onOpenSearch, scrolled, currentView, viewParams }: NavbarProps) {
  const { cart, wishlist, toggleAuth, user, logout } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onNavigate('home');
  };

  const isHomeActive = currentView === 'home';
  const isProductsActive = (currentView === 'listing' || currentView === 'product') && !viewParams.refurbishedOnly;
  const isRefurbishedActive = (currentView === 'listing' || currentView === 'product') && viewParams.refurbishedOnly;

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-brand-page/95 backdrop-blur-md h-16 shadow-sm border-b border-brand-border' : 'bg-brand-page h-20 border-b border-brand-border/50'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-full flex items-center justify-between">

          {/* Left Section: Mobile Menu & Logo */}
          <div className="flex items-center gap-2 md:gap-4 lg:gap-10">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 text-brand-textSecondary hover:text-brand-textPrimary transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>

            <button onClick={() => onNavigate('home')} className="flex items-center group shrink-0">
              <div className="relative w-8 h-8 md:w-9 md:h-9 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-brand-textPrimary fill-current transition-transform duration-700 group-hover:rotate-45">
                  {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
                    <ellipse
                      key={deg}
                      cx="50" cy="22" rx="7" ry="16"
                      transform={`rotate(${deg} 50 50)`}
                    />
                  ))}
                </svg>
              </div>
              <span className="ml-2 md:ml-2.5 text-lg md:text-xl font-bold tracking-tight text-brand-textPrimary font-display">
                AvN Tech Solution
              </span>
            </button>

            {/* Core Navigation Links - Desktop Only */}
            <nav className="hidden lg:flex items-center gap-8">
              <button
                onClick={() => onNavigate('home')}
                className={`text-sm font-semibold transition-colors ${isHomeActive ? 'text-brand-primary' : 'text-brand-textSecondary hover:text-brand-textPrimary'}`}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('listing')}
                className={`text-sm font-semibold transition-colors ${isProductsActive ? 'text-brand-primary' : 'text-brand-textSecondary hover:text-brand-textPrimary'}`}
              >
                Products
              </button>
              <button
                onClick={() => onNavigate('listing', { refurbishedOnly: true })}
                className={`text-sm font-semibold transition-colors ${isRefurbishedActive ? 'text-brand-primary' : 'text-brand-textSecondary hover:text-brand-textPrimary'}`}
              >
                Refurbished
              </button>
            </nav>
          </div>

          {/* Right Section: Utilities and Auth */}
          <div className="flex items-center gap-0.5 md:gap-2">

            {/* Favorites Utility - Visible from md up */}
            <button
              onClick={() => onNavigate('wishlist')}
              className={`relative p-2 transition-all group hidden sm:block ${currentView === 'wishlist' ? 'text-brand-primary' : 'text-brand-textSecondary hover:text-brand-textPrimary'}`}
              title="Favorites"
            >
              <span className="material-symbols-outlined text-[22px] md:text-[24px]">favorite</span>
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-brand-primary text-white text-[8px] font-bold flex items-center justify-center rounded-full shadow-glow">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Search Utility */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-brand-textSecondary hover:text-brand-textPrimary transition-all group"
              title="Search Catalog (Cmd+K)"
            >
              <span className="material-symbols-outlined text-[22px] md:text-[24px]">search</span>
            </button>

            {/* Cart Utility */}
            <button
              onClick={() => onNavigate('cart')}
              className={`relative p-2 transition-all group ${currentView === 'cart' ? 'text-brand-primary' : 'text-brand-textSecondary hover:text-brand-textPrimary'}`}
              title="Cart"
            >
              <span className="material-symbols-outlined text-[22px] md:text-[24px]">shopping_cart</span>
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-brand-primary text-white text-[8px] font-bold flex items-center justify-center rounded-full shadow-glow">
                  {cart.length}
                </span>
              )}
            </button>

            {/* User Section */}
            <div className="relative ml-1 md:ml-2">
              {user ? (
                <div className="flex items-center gap-1 md:gap-2 bg-brand-elevated p-1 rounded-2xl border border-brand-border">
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 hover:bg-brand-page/50 rounded-xl transition-all group"
                  >
                    <div className={`w-6 h-6 md:w-7 md:h-7 rounded-lg flex items-center justify-center text-[9px] md:text-[10px] font-bold text-white uppercase shadow-sm ${currentView === 'dashboard' ? 'bg-white text-black' : 'bg-brand-primary'}`}>
                      {user.name.charAt(0)}
                    </div>
                    <span className={`text-xs md:text-sm font-bold hidden sm:block ${currentView === 'dashboard' ? 'text-brand-primary' : 'text-brand-textPrimary'}`}>
                      {user.name.split(' ')[0]}
                    </span>
                  </button>
                  <div className="w-px h-6 bg-brand-border hidden sm:block"></div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-brand-textMuted hover:text-red-400 transition-colors hidden sm:block"
                    title="Logout"
                  >
                    <span className="material-symbols-outlined text-[18px] md:text-[20px]">logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => toggleAuth(true)}
                  className="bg-cta-gradient hover:brightness-110 text-white px-3 md:px-7 py-2 md:py-2.5 rounded-xl md:rounded-2xl text-[9px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all active:scale-95 whitespace-nowrap shadow-glow"
                >
                  Log In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onNavigate={(view, params) => {
          onNavigate(view, params);
          setIsMenuOpen(false);
        }}
        currentView={currentView}
      />
    </>
  );
}