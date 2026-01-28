import React from "react";

interface ServicesHubProps {
  page: string;
}

export default function ServicesHub({ page }: ServicesHubProps) {
  const serviceData: any = {
    'protection': {
      title: "Device Protection Plan",
      icon: "security",
      desc: "Accidents happen. Our TechShield plan covers liquid damage, screen cracks, and hardware failures with zero deductible.",
      features: ["Unlimited Repairs", "24h Replacement", "International Coverage"]
    },
    'warranty': {
      title: "Extended Warranty",
      icon: "verified_user",
      desc: "Extend your peace of mind up to 3 years. We cover all mechanical and electrical breakdowns after the manufacturer's warranty expires.",
      features: ["Genuine Spare Parts", "No Repair Limit", "Cashless Service"]
    },
    'exchange': {
      title: "Laptop Exchange",
      icon: "swap_horiz",
      desc: "Trade in your old laptop for instant credit towards your next rental or purchase. We accept all brands regardless of age.",
      features: ["Best Market Value", "Free Pickup", "Data Wiping Included"]
    },
    'ewaste': {
      title: "E-Waste Disposal",
      icon: "recycling",
      desc: "Join our green initiative. Send us your old electronics, and we'll ensure they are recycled responsibly in accordance with global standards.",
      features: ["Zero Landfill Policy", "Certificate of Recycling", "Reward Coupons"]
    }
  };

  const service = serviceData[page] || serviceData['protection'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 animate-in fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
        <div>
          <div className="w-16 h-16 rounded-2xl bg-brand-accent/10 flex items-center justify-center text-brand-accent mb-8 shadow-inner shadow-brand-accent/20">
             <span className="material-symbols-outlined text-4xl">{service.icon}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">{service.title}</h1>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed">{service.desc}</p>
          <div className="space-y-4">
             {service.features.map((f: string, i: number) => (
                <div key={i} className="flex items-center gap-4 text-white font-bold">
                   <span className="material-symbols-outlined text-brand-accent text-xl">check_circle</span>
                   {f}
                </div>
             ))}
          </div>
          <button className="mt-12 bg-white text-black font-bold px-10 py-4 rounded-full hover:bg-brand-accent transition-all shadow-xl">
            Get Started Now
          </button>
        </div>
        <div className="relative">
           <div className="aspect-square rounded-[3rem] overflow-hidden border border-white/5 relative shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1200&auto=format&fit=crop" 
                className="w-full h-full object-cover opacity-60 mix-blend-luminosity" 
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-black via-brand-black/40 to-transparent"></div>
              <div className="absolute bottom-12 left-12 right-12">
                 <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                    <p className="text-brand-accent text-sm font-bold uppercase mb-2">Service Highlight</p>
                    <p className="text-white text-lg italic">"TechRent's protection plan saved our project when a laptop was damaged during travel."</p>
                    <p className="text-gray-500 text-xs mt-4">— CTO, Digital Nexus</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}