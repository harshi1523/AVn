import React from "react";

interface HeroProps {
  onNavigate: (view: string, params?: any) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  return (
    <section className="relative w-full pt-20 pb-4 md:pt-36 md:pb-6 overflow-hidden group">
      <div className="absolute inset-0 z-0 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2000&auto=format&fit=crop" 
          className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-[2000ms] opacity-20 md:opacity-40 group-hover:opacity-60 scale-110 md:scale-105 group-hover:scale-100" 
          alt="MacBook Pro Background"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="max-w-4xl animate-in slide-in-from-bottom-12 duration-1000">
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] md:leading-[1.3] text-white font-display mb-6 md:mb-10 tracking-tighter md:tracking-tight uppercase">
            Upgrade <br className="hidden sm:block" />
            your digital <br />
            <span className="gradient-text-reality font-black">Reality</span>
          </h1>
          
          <p className="text-sm md:text-xl text-gray-400 max-w-lg md:max-w-xl mb-10 md:mb-14 leading-relaxed font-medium opacity-80">
            Access premium hardware with zero friction. Rent for a project or buy for the long term. 
          </p>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mb-4">
            <button 
              onClick={() => onNavigate('listing', { type: 'buy' })}
              className="w-full sm:w-auto px-10 md:px-14 py-4 md:py-5 bg-cta-gradient text-white font-black uppercase tracking-[0.2em] md:tracking-[0.4em] rounded-full hover:brightness-110 transition-all shadow-glow active:scale-95 text-[10px] md:text-xs"
            >
              Buy Now
            </button>
            <button 
              onClick={() => onNavigate('listing', { type: 'rent' })}
              className="w-full sm:w-auto px-10 md:px-14 py-4 md:py-5 bg-white text-black font-black uppercase tracking-[0.2em] md:tracking-[0.4em] rounded-full hover:bg-gray-100 transition-all active:scale-95 text-[10px] md:text-xs shadow-2xl"
            >
              Rent Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}