
import React, { useState, useMemo, Suspense, lazy } from "react";
import { useStore } from "../lib/store";

// Lazy load sub-components for performance
const AdminOverview = lazy(() => import("./admin/AdminOverview"));
const AdminInventory = lazy(() => import("./admin/AdminInventory"));
const AdminOrders = lazy(() => import("./admin/AdminOrders"));
const AdminFinancials = lazy(() => import("./admin/AdminFinancials"));
const AdminUsers = lazy(() => import("./admin/AdminUsers"));
const AdminSupport = lazy(() => import("./admin/AdminSupport"));
const Home = lazy(() => import("./Home"));
const Listing = lazy(() => import("./Listing"));
const ProductDetails = lazy(() => import("./ProductDetails"));
const BrandListing = lazy(() => import("./BrandListing"));
const CartPage = lazy(() => import("./CartPage"));
const DealOfTheDayPage = lazy(() => import("./DealOfTheDayPage"));
const Checkout = lazy(() => import("./Checkout"));
const Wishlist = lazy(() => import("./Listing")); // Wishlist uses Listing with favoritesOnly
const VideoGenerator = lazy(() => import("./VideoGenerator"));
const CorporateRentals = lazy(() => import("./CorporateRentals"));
const SupportPortal = lazy(() => import("./SupportPortal"));
const InfoCenter = lazy(() => import("./InfoCenter"));
const ServicesHub = lazy(() => import("./ServicesHub"));
const Mission = lazy(() => import("./Mission"));
const CoreValues = lazy(() => import("./CoreValues"));
const Timeline = lazy(() => import("./Timeline"));
const Team = lazy(() => import("./Team"));
const Contact = lazy(() => import("./Contact"));

// Navbar and Search for Customer Portal
import Navbar from "./Navbar";
import SearchOverlay from "./SearchOverlay";

// Shared Modals
const QuickViewModal = lazy(() => import("./QuickViewModal"));
const AddProductModal = lazy(() => import("./AddProductModal"));

export default function AdminDashboard() {
  const {
    user, tickets, allUsers, products: allProducts, logout
  } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'orders' | 'users' | 'financials' | 'support' | 'customerPortal'>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '3m' | '6m' | '12m' | 'custom'>('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Customer Portal Navigation State
  const [customerView, setCustomerView] = useState('home');
  const [customerParams, setCustomerParams] = useState<any>({});
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for navbar within the dashboard main area
  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    setScrolled(e.currentTarget.scrollTop > 50);
  };

  // Local state for modals
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [selectedKYCUser, setSelectedKYCUser] = useState<any>(null);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);

  // 1. Memoize shared data
  const allOrders = useMemo(() => {
    return allUsers.flatMap(u => (u as any).orders || []).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [allUsers]);

  const allTickets = useMemo(() => {
    return allUsers.flatMap(u => (u as any).tickets || []).sort((a, b) => new Date(b.lastUpdated || b.date).getTime() - new Date(a.lastUpdated || a.date).getTime());
  }, [allUsers]);

  const { startDate, endDate } = useMemo(() => {
    let start = new Date(0);
    const now = new Date();
    if (dateRange === 'custom') {
      start = customStart ? new Date(customStart) : new Date(0);
    } else {
      const d = new Date(now);
      if (dateRange === '7d') d.setDate(d.getDate() - 7);
      else if (dateRange === '30d') d.setDate(d.getDate() - 30);
      else if (dateRange === '3m') d.setMonth(d.getMonth() - 3);
      else if (dateRange === '6m') d.setMonth(d.getMonth() - 6);
      else if (dateRange === '12m') d.setFullYear(now.getFullYear() - 1);
      start = d;
    }
    const end = (dateRange === 'custom' && customEnd) ? new Date(customEnd) : new Date();
    end.setHours(23, 59, 59, 999);
    return { startDate: start, endDate: end };
  }, [dateRange, customStart, customEnd]);

  const filteredOrders = useMemo(() => {
    return allOrders.filter(o => {
      const d = new Date(o.date);
      return d >= startDate && d <= endDate;
    });
  }, [allOrders, startDate, endDate]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return allProducts;
    const query = searchTerm.toLowerCase();
    return allProducts.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.id.toLowerCase().includes(query) ||
      (p.brand && p.brand.toLowerCase().includes(query))
    );
  }, [allProducts, searchTerm]);

  const onCustomerNavigate = (view: string, params: any = {}) => {
    setCustomerView(view);
    setCustomerParams(params);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminOverview startDate={startDate} endDate={endDate} allOrders={allOrders} filteredOrders={filteredOrders} tickets={allTickets} dateRange={dateRange} />;
      case 'inventory':
        return (
          <AdminInventory
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredProducts={filteredProducts}
            setSelectedProduct={setSelectedProduct}
            setEditingProduct={setEditingProduct}
            setIsAddProductOpen={setIsAddProductOpen}
            allUsers={allUsers}
          />
        );
      case 'orders':
        return <AdminOrders allOrders={allOrders} allUsers={allUsers} startDate={startDate} endDate={endDate} />;
      case 'users':
        return (
          <AdminUsers
            allUsers={allUsers}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setViewingUser={setViewingUser}
            setSelectedKYCUser={setSelectedKYCUser}
          />
        );
      case 'financials':
        return <AdminFinancials startDate={startDate} endDate={endDate} allOrders={allOrders} />;
      case 'support':
        return <AdminSupport tickets={allTickets} setSelectedTicket={setSelectedTicket} />;
      case 'customerPortal':
        return (
          <div className="relative pt-24 min-h-screen">
            <div className="fixed top-0 left-0 lg:left-[320px] right-0 z-[65]">
              <Navbar
                onNavigate={onCustomerNavigate}
                onOpenSearch={() => setIsSearchOpen(true)}
                scrolled={scrolled}
                currentView={customerView}
                viewParams={customerParams}
              />
            </div>
            <SearchOverlay
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              onNavigate={onCustomerNavigate}
            />
            <div className="space-y-6">
              {customerView !== 'home' && (
                <button
                  onClick={() => onCustomerNavigate('home')}
                  className="flex items-center gap-2 text-brand-primary hover:text-white transition-colors mb-4 group"
                >
                  <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Back to Portal Home</span>
                </button>
              )}
              <div className="rounded-3xl overflow-hidden border border-white/5 bg-brand-page/20 backdrop-blur-md">
                {customerView === 'home' && <Home onNavigate={onCustomerNavigate} />}
                {customerView === 'listing' && (
                  <Listing
                    category={customerParams.category}
                    type={customerParams.type}
                    searchQuery={customerParams.searchQuery}
                    refurbishedOnly={customerParams.refurbishedOnly}
                    priceRange={customerParams.priceRange}
                    onProductClick={(id, type) => onCustomerNavigate('product', { id, type })}
                    onCategoryChange={(cat) => onCustomerNavigate('listing', { ...customerParams, category: cat })}
                    onBack={() => onCustomerNavigate('home')}
                  />
                )}
                {customerView === 'brand' && (
                  <BrandListing
                    brand={customerParams.brand}
                    onProductClick={(id, type) => onCustomerNavigate('product', { id, type })}
                    onBack={() => onCustomerNavigate('home')}
                  />
                )}
                {customerView === 'product' && (
                  <ProductDetails
                    productId={customerParams.id}
                    context={customerParams.type}
                    onBack={() => onCustomerNavigate('listing', { category: 'All' })}
                  />
                )}
                {customerView === 'wishlist' && (
                  <Listing
                    favoritesOnly={true}
                    onProductClick={(id) => onCustomerNavigate('product', { id })}
                    onBack={() => onCustomerNavigate('home')}
                  />
                )}
                {customerView === 'cart' && <CartPage onNavigate={onCustomerNavigate} />}
                {customerView === 'deal-of-the-day' && <DealOfTheDayPage onNavigate={onCustomerNavigate} />}
                {customerView === 'video-studio' && <VideoGenerator onBack={() => onCustomerNavigate('home')} />}
                {customerView === 'checkout' && (
                  <Checkout
                    onSuccess={() => onCustomerNavigate('home')}
                    onBack={() => onCustomerNavigate('cart')}
                  />
                )}
                {customerView === 'corporate' && <CorporateRentals />}
                {customerView === 'support-portal' && <SupportPortal initialTab={customerParams.tab} />}
                {customerView === 'info' && <InfoCenter page={customerParams.page} />}
                {customerView === 'services' && <ServicesHub page={customerParams.page} />}
                {customerView === 'about' && (
                  <div className="animate-in">
                    <Mission />
                    <CoreValues />
                    <Timeline />
                    <Team />
                  </div>
                )}
                {customerView === 'contact' && <Contact />}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-brand-page h-screen flex overflow-hidden font-display">
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-3 left-4 z-[60] w-12 h-12 glass-card rounded-xl flex items-center justify-center text-white shadow-lg border border-white/10"
      >
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden fixed inset-0 bg-black/80 z-[50] backdrop-blur-md animate-in fade-in duration-300" />
      )}

      <div className="flex h-full w-full relative">
        <aside className={`fixed inset-y-0 left-0 z-[55] w-[280px] lg:w-[320px] h-screen transform transition-all duration-500 ease-in-out p-4 lg:p-6 flex flex-col overflow-hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="h-full glass-card rounded-[2.5rem] flex flex-col shadow-elevated border border-white/5 relative overflow-hidden bg-brand-page/40 backdrop-blur-2xl">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden absolute top-6 right-6 z-20 text-gray-400 hover:text-white transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
            <div className="flex-shrink-0 p-8 pb-4 relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/20 flex items-center justify-center p-1.5 border border-brand-primary/20">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-brand-primary fill-current">
                    {[0, 36, 72, 108, 144, 180, 216, 252, 288, 324].map((deg) => (
                      <ellipse key={deg} cx="50" cy="22" rx="7" ry="16" transform={`rotate(${deg} 50 50)`} />
                    ))}
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg tracking-tight leading-tight">AvN Tech</h3>
                  <p className="text-[8px] text-brand-primary font-black uppercase tracking-[0.4em]">Solution</p>
                </div>
              </div>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mt-6"></div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-0 relative z-10">
              <nav className="space-y-1">
                {[
                  { id: 'overview', label: 'Overview', icon: 'grid_view' },
                  { id: 'inventory', icon: 'inventory_2', label: 'Inventory' },
                  { id: 'orders', icon: 'local_shipping', label: 'Orders' },
                  { id: 'financials', icon: 'payments', label: 'Financials' },
                  { id: 'users', icon: 'group', label: 'Users & KYC' },
                  { id: 'support', icon: 'confirmation_number', label: 'Support' },
                  { id: 'customerPortal', icon: 'visibility', label: 'Customer Portal' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as any); setIsMobileMenuOpen(false); }}
                    className={`group flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] uppercase tracking-[0.2em] font-black transition-all duration-300 relative overflow-hidden ${activeTab === tab.id ? 'bg-white text-black shadow-elevated scale-105' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <span className={`material-symbols-outlined text-[20px] transition-transform duration-300 ${activeTab === tab.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {tab.icon}
                    </span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 p-6 pt-2 relative z-10 border-t border-white/5">
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20">
                <span className="material-symbols-outlined text-xl">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        <main
          onScroll={activeTab === 'customerPortal' ? handleScroll : undefined}
          className="flex-1 h-screen overflow-y-auto custom-scrollbar p-4 pt-6 lg:p-10 lg:ml-[320px] scroll-smooth"
        >
          <div className="max-w-[1400px] mx-auto">
            {activeTab !== 'customerPortal' && (
              <header className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 gap-8 py-4 lg:py-0">
                <div>
                  <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tighter capitalize flex items-center gap-4">
                    <span className="text-brand-primary">AvN</span> {activeTab}
                    <span className="w-3 h-3 rounded-full bg-brand-primary shadow-glow animate-pulse"></span>
                  </h1>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.4em] mt-3">Monitoring real-time platform performance</p>
                </div>

                {(activeTab === 'overview' || activeTab === 'financials') && (
                  <div className="flex flex-wrap items-center gap-4">
                    {dateRange === 'custom' && (
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-2xl px-3 py-1 shadow-inner">
                        <input type="date" value={customStart} onChange={(e) => setCustomStart(e.target.value)} className="bg-transparent text-white/50 text-[10px] font-bold uppercase p-2 focus:outline-none focus:text-white transition-colors" />
                        <span className="text-white/20">/</span>
                        <input type="date" value={customEnd} onChange={(e) => setCustomEnd(e.target.value)} className="bg-transparent text-white/50 text-[10px] font-bold uppercase p-2 focus:outline-none focus:text-white transition-colors" />
                      </div>
                    )}
                    <div className="relative">
                      <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value as any)}
                        className="custom-select bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white/70 px-6 py-4 focus:outline-none focus:border-brand-primary cursor-pointer hover:bg-white/10 transition-all min-w-[180px]"
                      >
                        <option value="7d" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Last 7 Days</option>
                        <option value="30d" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Last 30 Days</option>
                        <option value="3m" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Last 3 Months</option>
                        <option value="6m" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Last 6 Months</option>
                        <option value="12m" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Last 12 Months</option>
                        <option value="custom" style={{ backgroundColor: '#1a1a1a', color: 'white' }}>Custom Range</option>
                      </select>
                    </div>
                  </div>
                )}
              </header>
            )}

            <Suspense fallback={
              <div className="flex items-center justify-center h-96">
                <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            }>
              {renderTabContent()}
            </Suspense>
          </div>
        </main>
      </div>

      {/* Global Modals */}
      {selectedProduct && (
        <Suspense fallback={null}>
          <QuickViewModal product={selectedProduct} isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} onNavigate={id => console.log(id)} />
        </Suspense>
      )}
      {isAddProductOpen && (
        <Suspense fallback={null}>
          <AddProductModal isOpen={isAddProductOpen} onClose={() => setIsAddProductOpen(false)} editingProduct={editingProduct} />
        </Suspense>
      )}
    </div>
  );
}
