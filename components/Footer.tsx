import React from "react";

interface FooterProps {
  onNavigate?: (view: string, params?: any) => void;
}

export default function Footer({ onNavigate }: FooterProps) {
  const navigate = (view: string, params?: any) => {
    if (onNavigate) onNavigate(view, params);
  };

  return (
    <footer className="bg-brand-page pt-28 pb-14 border-t border-white/5 relative z-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-14 mb-24">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5 mb-10">
              <span className="material-symbols-outlined text-brand-secondary text-4xl">token</span>
              <span className="text-2xl font-black text-white tracking-tighter font-display uppercase italic">AvN Tech Solution</span>
            </div>
            <p className="text-gray-500 leading-relaxed mb-12 text-base font-medium">
              Top-quality technology ready for your home or office. Experience a better way to get the latest tech.
            </p>
            <div className="flex gap-5">
              {['instagram', 'linkedin', 'x'].map((social) => (
                <button key={social} className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all duration-300 border border-white/10 hover:scale-110">
                  <span className="material-symbols-outlined text-base">{social === 'x' ? 'close' : social === 'instagram' ? 'photo_camera' : 'group'}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-black text-white mb-10 text-xs uppercase tracking-[0.4em]">Products</h4>
            <ul className="space-y-5 text-gray-500 font-bold text-xs uppercase tracking-widest">
              <li><button onClick={() => navigate('listing', { category: 'Laptop' })} className="hover:text-white transition-all duration-300 hover:translate-x-1">Laptops</button></li>
              <li><button onClick={() => navigate('listing', { category: 'Desktop' })} className="hover:text-white transition-all">Desktops</button></li>
              <li><button onClick={() => navigate('listing', { category: 'Monitor' })} className="hover:text-white transition-all">Monitors</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-white mb-8 text-[10px] uppercase tracking-[0.4em]">Company</h4>
            <ul className="space-y-4 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
              <li><button onClick={() => navigate('support-portal', { tab: 'centers' })} className="hover:text-white transition-all">Centers</button></li>
              <li><button onClick={() => navigate('about')} className="hover:text-white transition-all">About AvN Tech Solution</button></li>
              <li><button onClick={() => navigate('info', { page: 'rental-guide' })} className="hover:text-white transition-all">How it Works</button></li>
            </ul>
          </div>

          <div>
            <h4 className="font-black text-white mb-8 text-[10px] uppercase tracking-[0.4em]">Support</h4>
            <ul className="space-y-4 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
              <li><button onClick={() => navigate('contact')} className="hover:text-white transition-all">Contact Us</button></li>
              <li><button onClick={() => navigate('info', { page: 'terms' })} className="hover:text-white transition-all">Terms of Service</button></li>
              <li><button onClick={() => navigate('info', { page: 'privacy' })} className="hover:text-white transition-all">Privacy Policy</button></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-wrap gap-8">
            <div className="flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 group-hover:text-brand-secondary transition-all duration-300 group-hover:scale-110">
                <span className="material-symbols-outlined">chat_bubble</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-0.5">Customer Support</p>
                <p className="text-white font-black text-sm tracking-tight">+91 1800-AvN-TECH</p>
              </div>
            </div>
          </div>

          <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">
            © 2026 AvN Tech Solution Private Limited. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}