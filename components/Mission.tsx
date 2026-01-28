import React from "react";

export default function Mission() {
  return (
    <section className="py-24 md:py-40 bg-brand-page relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_#D946EF10_0%,_transparent_70%)] pointer-events-none"></div>
      
      <div className="mx-auto max-w-7xl px-6 relative z-10">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px w-12 bg-brand-primary/30"></div>
            <span className="text-brand-primary font-black text-[10px] tracking-[0.5em] uppercase">The Genesis</span>
            <div className="h-px w-12 bg-brand-primary/30"></div>
          </div>
          
          <h2 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter leading-[0.85] uppercase mb-16 max-w-5xl">
            Democratizing <span className="gradient-text-reality">Elite</span> <br />
            Infrastructure
          </h2>
          
          <div className="grid md:grid-cols-2 gap-16 text-left items-start mt-8">
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white uppercase italic tracking-tight flex items-center gap-4">
                <span className="w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
                The Hardware Bottleneck
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed font-medium opacity-80">
                Innovation moves at wire-speed, but hardware ownership is static. We realized that for developers, creators, and elite operatives, the traditional cycle of buying, depreciating, and disposing of premium tech was a friction point in their digital reality.
              </p>
            </div>
            
            <div className="space-y-8">
              <h3 className="text-2xl font-bold text-white uppercase italic tracking-tight flex items-center gap-4">
                <span className="w-1.5 h-1.5 bg-brand-secondary rounded-full"></span>
                Liquid Architecture
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed font-medium opacity-80">
                SB Tech Solution was developed to bridge this gap. We provide a liquid infrastructure—allowing anyone to scale their hardware capabilities instantly. Whether it's a 48-hour high-stakes project or a permanent workstation upgrade, we ensure you always have the definitive tools for your mission.
              </p>
            </div>
          </div>

          <div className="mt-24 p-12 bg-white/[0.02] border border-white/5 rounded-[3rem] w-full max-w-4xl text-center backdrop-blur-xl">
            <p className="text-xl md:text-2xl text-white font-light italic leading-relaxed">
              "We don't just rent machines; we facilitate the next generation of digital breakthroughs by removing capital barriers from the world's most powerful tools."
            </p>
            <p className="mt-8 text-brand-primary font-black text-[10px] uppercase tracking-[0.4em]">SB Tech Solution Leadership Protocol</p>
          </div>
        </div>
      </div>
    </section>
  );
}