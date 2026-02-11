import React, { useState } from "react";
import { useStore } from "../lib/store";

interface MenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, params?: any) => void;
  currentView: string;
}

interface MenuItem {
  label: string;
  params: {
    view?: string;
    type?: 'rent' | 'buy' | 'all';
    category?: string;
    searchQuery?: string;
    id?: string;
    refurbishedOnly?: boolean;
    page?: string;
    tab?: string;
  };
  icon?: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

export default function MenuDrawer({ isOpen, onClose, onNavigate, currentView }: MenuDrawerProps) {
  const { user, toggleAuth, logout } = useStore();
  const [activeSection, setActiveSection] = useState<string | null>("rentals");

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const menuItems: Record<string, MenuSection> = {
    rentals: {
      title: "Provisioning",
      items: [
        { label: "MacBook Units", params: { type: 'rent', category: 'Laptop' }, icon: 'laptop_mac' },
        { label: "Windows Nodes", params: { type: 'rent', category: 'Laptop' }, icon: 'terminal' },
        { label: "Workstations", params: { type: 'rent', category: 'Desktop' }, icon: 'desktop_windows' },
        { label: "Gaming Grids", params: { type: 'rent', category: 'Gaming' }, icon: 'sports_esports' },
        { label: "View Manifest", params: { type: 'rent' }, icon: 'rebase_edit' },
      ]
    },
    creative: {
      title: "Creative Labs",
      items: [
        { label: "Asset Studio", params: { view: 'video-studio' }, icon: 'movie_creation' },
      ]
    },
    shop: {
      title: "Acquisition",
      items: [
        { label: "Laptops", params: { type: 'buy', category: 'Laptop' }, icon: 'devices' },
        { label: "Monitors", params: { type: 'buy', category: 'Monitor' }, icon: 'monitor' },
        { label: "Refurbished", params: { refurbishedOnly: true }, icon: 'history' },
        { label: "Audio Gear", params: { category: 'Audio' }, icon: 'headphones' },
        { label: "Peripherals", params: { category: 'Accessories' }, icon: 'keyboard' },
      ]
    },
    operations: {
      title: "Operations",
      items: [
        { label: "Mission Brief", params: { view: 'about' }, icon: 'info' },
        { label: "Direct Uplink", params: { view: 'contact' }, icon: 'alternate_email' },
        { label: "Support Core", params: { view: 'support-portal' }, icon: 'support_agent' },
        { label: "Terms of Use", params: { view: 'info', page: 'terms' }, icon: 'gavel' },
      ]
    }
  };

  return (
    <>
      {/* Heavy Backdrop */}
      <div
        className={`fixed inset-0 bg-black/90 backdrop-blur-md z-[60] transition-opacity duration-500 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />

      {/* Drawer Interface */}
      <aside className={`fixed top-0 left-0 h-full w-[85%] max-w-[380px] bg-dark-sidebar z-[70] transform transition-transform duration-500 ease-[cubic-bezier(0.2,1,0.3,1)] border-r border-white/5 flex flex-col shadow-[20px_0_80px_rgba(0,0,0,0.8)] ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>

        {/* Terminal Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-brand-primary flex items-center justify-center text-white shadow-glow">
              <span className="material-symbols-outlined text-lg">token</span>
            </div>
            <span className="text-xl font-black text-white uppercase tracking-widest italic font-display">SB TECH</span>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white"
          >
            <span className="material-symbols-outlined font-light">close</span>
          </button>
        </div>

        {/* User Identity Access */}
        <div className="p-6 bg-gradient-to-b from-white/[0.02] to-transparent border-b border-white/5">
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shadow-inner ${currentView === 'dashboard' ? 'bg-white text-black' : 'bg-brand-primary text-white'}`}>
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h4 className={`font-bold tracking-tight ${currentView === 'dashboard' ? 'text-brand-primary' : 'text-white'}`}>{user.name}</h4>
                  <p className="text-[9px] text-brand-primary font-black uppercase tracking-widest">Operator Active</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { onNavigate('dashboard'); onClose(); }}
                  className={`text-[9px] font-black uppercase py-3 rounded-lg tracking-widest transition-all ${currentView === 'dashboard' ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10 text-white'}`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => { logout(); onClose(); }}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[9px] font-black uppercase py-3 rounded-lg tracking-widest transition-all"
                >
                  Terminate
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => { onClose(); toggleAuth(true); }}
                className="w-full bg-white text-black font-black py-4 rounded-xl text-[10px] tracking-[0.4em] uppercase shadow-glow hover:brightness-90 transition-all active:scale-95"
              >
                INITIALIZE_ACCESS
              </button>
              <p className="text-[8px] text-white/20 text-center uppercase tracking-widest font-black">Encrypted profile protocol enabled</p>
            </div>
          )}
        </div>

        {/* Tactical Manifest (Scrollable) */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-6">
          <div className="flex flex-col">
            {Object.entries(menuItems).map(([key, section]) => (
              <div key={key} className="mb-4">
                <button
                  onClick={() => toggleSection(key)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors group"
                >
                  <h4 className={`text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${activeSection === key ? 'text-brand-primary' : 'text-white/40 group-hover:text-white'}`}>
                    {section.title}
                  </h4>
                  <span className={`material-symbols-outlined text-white/20 transition-transform duration-500 ${activeSection === key ? "rotate-180 text-brand-primary" : ""}`}>
                    expand_more
                  </span>
                </button>

                <div className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.2,1,0.3,1)] ${activeSection === key ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"}`}>
                  <ul className="flex flex-col pb-4">
                    {section.items.map((item, idx) => {
                      const isActive = item.params.view === currentView;
                      return (
                        <li key={idx}>
                          <button
                            onClick={() => {
                              if (item.params.view) {
                                onNavigate(item.params.view, item.params);
                              } else {
                                onNavigate('listing', item.params);
                              }
                              onClose();
                            }}
                            className={`w-full flex items-center gap-4 px-10 py-3.5 transition-all group relative overflow-hidden ${isActive ? 'bg-brand-primary/10 text-brand-primary' : 'text-white/40 hover:text-white hover:bg-white/[0.03]'}`}
                          >
                            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-0 bg-brand-primary transition-all duration-300 ${isActive ? 'h-full' : 'group-hover:h-1/2'}`}></div>
                            {item.icon && <span className={`material-symbols-outlined text-[18px] transition-all ${isActive ? 'opacity-100 text-brand-primary' : 'opacity-40 group-hover:opacity-100 group-hover:text-brand-primary'}`}>{item.icon}</span>}
                            <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${isActive ? 'text-brand-primary' : ''}`}>{item.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="px-6 mt-12">
            <h4 className="text-[8px] font-black text-white/20 uppercase tracking-[0.4em] mb-6">Discovery Channels</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { l: 'Offers', i: 'percent', c: 'text-brand-secondary' },
                { l: 'New', i: 'auto_awesome', c: 'text-brand-primary' },
                { l: 'Stores', i: 'location_on', c: 'text-white/40' },
                { l: 'Legal', i: 'verified_user', c: 'text-white/40' }
              ].map((action) => (
                <button key={action.l} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 transition-all group">
                  <span className={`material-symbols-outlined text-sm ${action.c} opacity-60 group-hover:opacity-100`}>{action.i}</span>
                  <span className="text-[9px] font-black text-white/40 uppercase tracking-widest group-hover:text-white">{action.l}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tactical Footer */}
        <div className="p-8 border-t border-white/5 bg-black">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 border border-white/10">
              <span className="material-symbols-outlined">headset_mic</span>
            </div>
            <div>
              <p className="text-[8px] text-white/20 uppercase font-black tracking-widest">Support Line</p>
              <p className="text-sm font-black text-white tracking-tight italic">1800-SB-TECH</p>
            </div>
          </div>

          <div className="flex justify-between items-center opacity-30">
            <div className="flex gap-4">
              {['instagram', 'linkedin', 'x'].map(s => (
                <span key={s} className="material-symbols-outlined text-lg hover:text-brand-primary cursor-pointer transition-colors">
                  {s === 'x' ? 'close' : s === 'instagram' ? 'photo_camera' : 'group'}
                </span>
              ))}
            </div>
            <span className="text-[7px] font-black uppercase tracking-widest">SYS_v4.2.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}