import React, { useState, useEffect } from "react";
import { StoreProvider, useStore } from "./lib/store";
import { ToastProvider } from "./lib/ToastContext";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Listing from "./components/Listing";
import ProductDetails from "./components/ProductDetails";
import Footer from "./components/Footer";
import Checkout from "./components/Checkout";
import Dashboard from "./components/Dashboard";
import AuthModal from "./components/AuthModal";
import Mission from "./components/Mission";
import CoreValues from "./components/CoreValues";
import Timeline from "./components/Timeline";
import Team from "./components/Team";
import Contact from "./components/Contact";
import CorporateRentals from "./components/CorporateRentals";
import SupportPortal from "./components/SupportPortal";
import InfoCenter from "./components/InfoCenter";
import ServicesHub from "./components/ServicesHub";
import KYCVerification from "./components/KYCVerification";
import BrandListing from "./components/BrandListing";
import CartPage from "./components/CartPage";
import NotificationCenter from "./components/NotificationCenter";
import DealOfTheDayPage from "./components/DealOfTheDayPage";
import WhatsAppChatbot from "./components/WhatsAppChatbot";
import SearchOverlay from "./components/SearchOverlay";
import VideoGenerator from "./components/VideoGenerator";

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const [viewParams, setViewParams] = useState<any>({});
  const [scrolled, setScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const handleNavigateEvent = (e: any) => {
      if (e.detail) {
        navigate(e.detail.view, e.detail.params);
      }
    };
    window.addEventListener('navigate', handleNavigateEvent);

    // Cmd+K shortcut for search
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('navigate', handleNavigateEvent);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const navigate = (view: string, params: any = {}) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);
    setViewParams(params);
    setIsSearchOpen(false); // Close search on navigation
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-brand-page relative overflow-x-hidden text-brand-textPrimary">
      {/* Stealth Glow Elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-primary/[0.04] rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-primary/5 rounded-full blur-[160px]" />
      </div>

      {currentView !== 'kyc' && (
        <Navbar
          onNavigate={navigate}
          onOpenSearch={() => setIsSearchOpen(true)}
          scrolled={scrolled}
          currentView={currentView}
          viewParams={viewParams}
        />
      )}
      <AuthModal />
      <NotificationCenter />
      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={navigate}
      />

      <main className={`flex-1 relative ${currentView === 'kyc' ? 'pt-0' : 'pt-24'} pb-12`}>
        {currentView === 'home' && <Home onNavigate={navigate} />}
        {currentView === 'listing' && (
          <Listing
            category={viewParams.category}
            type={viewParams.type}
            searchQuery={viewParams.searchQuery}
            refurbishedOnly={viewParams.refurbishedOnly}
            onProductClick={(id) => navigate('product', { id })}
            onCategoryChange={(cat) => navigate('listing', { ...viewParams, category: cat })}
          />
        )}
        {currentView === 'brand' && (
          <BrandListing
            brand={viewParams.brand}
            onProductClick={(id) => navigate('product', { id })}
            onBack={() => navigate('home')}
          />
        )}
        {currentView === 'wishlist' && <Listing favoritesOnly={true} onProductClick={(id) => navigate('product', { id })} />}
        {currentView === 'cart' && <CartPage onNavigate={navigate} />}
        {currentView === 'product' && <ProductDetails productId={viewParams.id} onBack={() => navigate('listing', { category: 'All' })} />}
        {currentView === 'deal-of-the-day' && <DealOfTheDayPage onNavigate={navigate} />}
        {currentView === 'video-studio' && <VideoGenerator onBack={() => navigate('home')} />}
        {currentView === 'checkout' && (
          <Checkout
            onSuccess={(isRental) => {
              if (isRental) {
                navigate('kyc');
              } else {
                navigate('dashboard', { tab: 'orders' });
              }
            }}
            onBack={() => navigate('cart')}
          />
        )}
        {currentView === 'kyc' && <KYCVerification onComplete={() => navigate('dashboard')} onSkip={() => navigate('dashboard')} />}
        {currentView === 'dashboard' && <Dashboard initialTab={viewParams.tab} />}
        {currentView === 'corporate' && <CorporateRentals />}
        {currentView === 'support-portal' && <SupportPortal initialTab={viewParams.tab} />}
        {currentView === 'info' && <InfoCenter page={viewParams.page} />}
        {currentView === 'services' && <ServicesHub page={viewParams.page} />}
        {currentView === 'about' && (
          <div className="animate-in">
            <Mission />
            <CoreValues />
            <Timeline />
            <Team />
          </div>
        )}
        {currentView === 'contact' && <div className="animate-in"><Contact /></div>}
      </main>

      {currentView !== 'kyc' && <Footer onNavigate={navigate} />}

      {/* Global WhatsApp Chatbot */}
      <WhatsAppChatbot />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </StoreProvider>
  );
}