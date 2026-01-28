
import React from "react";

export default function CorporateRentals() {
  const tiers = [
    { name: "Startups", scale: "1-10 Devices", feature: "Low Security Deposit", color: "from-white/20" },
    { name: "SME", scale: "11-50 Devices", feature: "24h On-site Support", color: "from-white/40" },
    { name: "Enterprise", scale: "50+ Devices", feature: "Dedicated Asset Manager", color: "from-white/60" }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-8 py-12 animate-in fade-in slide-in-from-bottom-4">
      <div className="relative rounded-[3rem] overflow-hidden bg-brand-card border border-white/10 p-8 md:p-20 text-center mb-16 shadow-2xl">
        <div className="absolute inset-0 bg-white/[0.02] opacity-30"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <span className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px] mb-6 block">Venus For Business</span>
          <h1 className="text-4xl md:text-7xl font-display font-bold text-white mb-8 tracking-tighter leading-[0.9]">Empower Your Operations with Premium Solutions</h1>
          <p className="text-xl text-brand-muted mb-12 leading-relaxed font-light italic">Scale your architecture without capital friction. We provide managed infrastructure for elite operatives.</p>
          <button className="bg-white text-black font-black px-12 py-5 rounded-2xl text-[10px] uppercase tracking-[0.4em] hover:opacity-80 transition-all shadow-2xl active:scale-95">
            Initialize Sales Protocol
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {tiers.map((tier, i) => (
          <div key={i} className="bg-brand-card border border-white/5 rounded-[2.5rem] p-10 hover:border-white/20 transition-all group shadow-xl">
            <div className={`w-12 h-1 bg-gradient-to-r ${tier.color} to-transparent rounded-full mb-8`}></div>
            <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">{tier.name}</h3>
            <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-10">{tier.scale}</p>
            <ul className="space-y-5 text-brand-muted text-sm font-medium">
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-white text-sm">check_circle</span> {tier.feature}</li>
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-white text-sm">check_circle</span> Modular Terms</li>
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-white text-sm">check_circle</span> Global Deployment</li>
              <li className="flex items-center gap-3"><span className="material-symbols-outlined text-white text-sm">check_circle</span> Integrated Logistics</li>
            </ul>
          </div>
        ))}
      </div>

      <div className="bg-white/[0.02] rounded-[3rem] p-12 border border-white/5 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-white mb-10 tracking-tight">Why Choose Venus B2B?</h2>
          <div className="space-y-10">
            {[
              { t: "Asset Intelligence", d: "Track your entire catalog via our low-latency dashboard." },
              { t: "Predictable Capital", d: "Fixed monthly deployments for transparent financial planning." },
              { t: "Cyclic Refresh", d: "Maintain peak performance with periodic architecture updates." }
            ].map((f, i) => (
              <div key={i} className="flex gap-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 border border-white/10">
                  <span className="material-symbols-outlined text-white font-light">verified</span>
                </div>
                <div>
                  <h4 className="font-bold text-white tracking-tight text-lg mb-1">{f.t}</h4>
                  <p className="text-brand-muted text-sm leading-relaxed">{f.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-brand-black p-10 rounded-[2rem] border border-white/5 shadow-inner">
           <h3 className="text-[11px] font-black text-white/30 uppercase tracking-[0.4em] mb-8 text-center">Inquiry Manifest</h3>
           <div className="space-y-5">
             <input type="text" placeholder="ENTITY_NAME" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white placeholder:text-white/10 text-xs font-bold tracking-widest" />
             <input type="email" placeholder="COMMS_ADDRESS" className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white placeholder:text-white/10 text-xs font-bold tracking-widest" />
             <select className="w-full bg-brand-black border border-white/10 p-4 rounded-xl text-white/40 text-xs font-bold tracking-widest focus:outline-none">
               <option>PAYLOAD_VOLUME</option>
               <option>1-10 NODES</option>
               <option>10-50 NODES</option>
               <option>50+ NODES</option>
             </select>
             <button className="w-full bg-white text-black font-black py-5 rounded-xl text-[10px] uppercase tracking-[0.5em] mt-4 shadow-2xl active:scale-95 transition-all">Submit Request</button>
           </div>
        </div>
      </div>
    </div>
  );
}
