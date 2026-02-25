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
      <header className={`fixed top-0 left-0 right-0 z-[70] transition-all duration-500 ${scrolled ? 'bg-brand-page/90 backdrop-blur-xl h-20 shadow-elevated border-b border-brand-border' : 'bg-brand-page h-24 border-b border-brand-border/50'}`}>
        <div className={`${user?.role === 'admin' && currentView === 'dashboard' ? 'w-full lg:pl-80 pr-4 md:pr-6' : 'max-w-7xl mx-auto px-4 md:px-6'} h-full flex items-center justify-between`}>

          {/* Left Section: Mobile Menu & Logo */}
          <div className="flex items-center gap-2 md:gap-4 lg:gap-10">
            <button
              onClick={() => setIsMenuOpen(true)}
              className="lg:hidden p-2 text-brand-textSecondary hover:text-brand-textPrimary transition-colors"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>

            <button onClick={() => onNavigate('home')} className="flex items-center group shrink-0">
              <div className="relative w-9 h-9 md:w-10 md:h-10 flex items-center justify-center">
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
              <span className="ml-3 md:ml-3.5 text-xl md:text-2xl font-bold tracking-tight text-brand-textPrimary font-display">
                AvN Tech Solution
              </span>
            </button>

            {/* Core Navigation Links - Desktop Only */}
            <nav className="hidden lg:flex items-center gap-10">
              <button
                onClick={() => onNavigate('home')}
                className={`text-sm font-semibold transition-all duration-300 ${isHomeActive ? 'text-brand-primary' : 'text-brand-textSecondary hover:text-brand-textPrimary hover:scale-105'}`}
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
          <div className="flex items-center gap-1 md:gap-2">

            {/* Favorites Utility - Visible from md up */}
            <button
              onClick={() => onNavigate('wishlist')}
              className={`relative p-2.5 md:p-3 transition-all duration-300 group hidden sm:block rounded-xl hover:bg-brand-elevated ${currentView === 'wishlist' ? 'text-brand-primary' : 'text-brand-textSecondary hover:text-brand-textPrimary'}`}
              title="Favorites"
            >
              <span className="material-symbols-outlined text-[24px] md:text-[26px]">favorite</span>
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brand-primary text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-glow">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Search Utility */}
            <button
              onClick={onOpenSearch}
              className="p-2.5 md:p-3 text-brand-textSecondary hover:text-brand-textPrimary transition-all duration-300 group rounded-xl hover:bg-brand-elevated"
              title="Search Catalog (Cmd+K)"
            >
              <span className="material-symbols-outlined text-[24px] md:text-[26px]">search</span>
            </button>

            {/* Cart Utility */}
            <button
              onClick={() => onNavigate('cart')}
              className={`relative p-2.5 md:p-3 transition-all duration-300 group rounded-xl hover:bg-brand-elevated ${currentView === 'cart' ? 'text-brand-primary' : 'text-brand-textSecondary hover:text-brand-textPrimary'}`}
              title="Cart"
            >
              <span className="material-symbols-outlined text-[24px] md:text-[26px]">shopping_cart</span>
              {cart.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brand-primary text-white text-[9px] font-bold flex items-center justify-center rounded-full shadow-glow">
                  {cart.length}
                </span>
              )}
            </button>

            {/* User Section */}
            <div className="relative ml-2 md:ml-3">
              {user ? (
                <div className="flex items-center gap-1 md:gap-2 bg-brand-elevated p-1.5 rounded-2xl border border-brand-border shadow-card-soft">
                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 hover:bg-brand-page/50 rounded-xl transition-all duration-300 group"
                  >
                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center text-[10px] md:text-[11px] font-bold text-white uppercase shadow-sm transition-all duration-300 ${currentView === 'dashboard' ? 'bg-white text-black' : 'bg-brand-primary group-hover:scale-110'}`}>
                      {user.name.charAt(0)}
                    </div>
                    <span className={`text-sm md:text-base font-bold hidden sm:block ${currentView === 'dashboard' ? 'text-brand-primary' : 'text-brand-textPrimary'}`}>
                      {user.name.split(' ')[0]}
                    </span>
                  </button>
                  <div className="w-px h-6 bg-brand-border hidden sm:block"></div>
                  <button
                    onClick={handleLogout}
                    className="p-2.5 text-brand-textMuted hover:text-red-400 transition-all duration-300 hidden sm:block rounded-xl hover:bg-brand-page/50"
                    title="Logout"
                  >
                    <span className="material-symbols-outlined text-[20px] md:text-[22px]">logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => toggleAuth(true)}
                  className="bg-cta-gradient hover:brightness-110 text-white px-4 md:px-8 py-2.5 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-[0.15em] md:tracking-[0.25em] transition-all duration-300 active:scale-95 whitespace-nowrap shadow-glow hover:shadow-glow-lg"
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