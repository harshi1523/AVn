
import React from "react";

export default function DealOfTheDay({ onNavigate }: { onNavigate: any }) {
  return (
    <section className="py-24 max-w-7xl mx-auto px-4">
      <div className="bg-dark-card rounded-3xl-custom overflow-hidden grid lg:grid-cols-2 gap-0 border border-white/10 shadow-2xl">
        <div className="p-12 md:p-16 flex flex-col justify-center">
          <div className="flex items-center gap-3 text-brand-secondary font-black text-xs tracking-[0.3em] uppercase mb-6">
            <span className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse"></span>
            DEAL OF THE DAY
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white mb-2 leading-none tracking-tighter uppercase italic">Razer Blade 16</h2>
          <div className="text-4xl font-black text-brand-secondary mb-10 tracking-tight">25% OFF</div>

          <div className="flex gap-4 mb-12">
            {[{ v: '04', l: 'Hrs' }, { v: '32', l: 'Min' }, { v: '15', l: 'Sec' }].map((t, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-xl font-black text-white mb-2">{t.v}</div>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t.l}</span>
              </div>
            ))}
          </div>

          <p className="text-gray-400 mb-10 text-sm font-medium leading-relaxed max-w-sm">
            Limited time offer on the ultimate gaming workstation. Experience uncompromised power.
          </p>

          <div className="flex flex-wrap items-center gap-8">
            <div>
              <p className="text-gray-600 line-through text-sm font-bold uppercase tracking-widest">₹4,500/mo</p>
              <p className="text-3xl font-black text-white tracking-tighter">₹3,375<span className="text-xs font-medium text-gray-500 ml-1">/mo</span></p>
            </div>
            <button
              onClick={() => onNavigate('deal-of-the-day')}
              className="bg-brand-secondary hover:brightness-110 text-white px-10 py-4 rounded-xl font-bold text-sm uppercase tracking-widest shadow-xl transition-all active:scale-95"
            >
              Claim Deal
            </button>
          </div>
        </div>
        <div className="relative min-h-[400px]">
          <img
            src="https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?q=80&w=1200&auto=format&fit=crop"
            alt="Razer Blade 16"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#121212] via-[#121212]/30 to-transparent"></div>
          {/* Animated light bars */}
          <div className="absolute bottom-0 right-0 p-10 flex gap-1 items-end">
            <div className="w-2 h-32 bg-brand-secondary/40 rounded-full animate-pulse"></div>
            <div className="w-2 h-48 bg-brand-secondary/60 rounded-full animate-pulse [animation-delay:200ms]"></div>
            <div className="w-2 h-24 bg-brand-secondary/30 rounded-full animate-pulse [animation-delay:400ms]"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
