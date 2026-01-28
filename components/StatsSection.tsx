import React from "react";

const stats = [
  { label: 'Active Orders', value: '2,847', icon: 'laptop_mac' },
  { label: 'System Uptime', value: '99.9%', icon: 'bolt' },
  { label: 'Happy Customers', value: '12k+', icon: 'groups' },
  { label: 'Customer Rating', value: '4.9/5', icon: 'star' }
];

const features = [
  { 
    icon: 'verified_user', 
    title: 'Top Quality Guaranteed', 
    desc: 'Every item is tested and checked thoroughly. We make sure you get only the best performance.', 
    color: 'bg-brand-primary' 
  },
  { 
    icon: 'payments', 
    title: 'Clear Pricing', 
    desc: 'No hidden fees. What you see is what you pay. Transparent pricing with no surprises.', 
    color: 'bg-white' 
  },
  { 
    icon: 'history', 
    title: 'Fast Returns', 
    desc: 'Need to change your mind? We process returns quickly and give you your credit back fast.', 
    color: 'bg-brand-secondary' 
  }
];

export default function StatsSection() {
  return (
    <section className="py-12 bg-black relative overflow-hidden border-t border-white/5">
      {/* Background Decorative Element */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none topography-lines" style={{ backgroundSize: '400px' }}></div>
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        <div className="flex flex-col items-center mb-16">
          <h3 className="venus-heading text-center">
            The Best Place To Get Tech
          </h3>
          <p className="text-gray-500 text-center mt-4 max-w-2xl text-lg font-medium opacity-60 italic leading-relaxed">
            The simplest way to get high-end technology for your work or play. Designed for people who want the best tools without the wait.
          </p>
        </div>
        
        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, i) => (
            <div key={i} className="bg-brand-card p-10 rounded-[2.5rem] border border-white/5 flex flex-col items-center text-center group hover:border-brand-primary/30 transition-all duration-500 hover:-translate-y-2">
              <div className="text-gray-600 group-hover:text-brand-primary transition-colors mb-6">
                <span className="material-symbols-outlined text-4xl font-light">{stat.icon}</span>
              </div>
              <p className="text-4xl font-bold text-white tracking-tighter mb-1 font-display">{stat.value}</p>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em]">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Feature Detail Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="bg-[#0D0D0D] p-12 rounded-[3.5rem] border border-white/5 hover:border-brand-primary/40 transition-all duration-700 group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/5 rounded-full blur-[80px] -mr-16 -mt-16 group-hover:bg-brand-primary/10 transition-colors"></div>
              
              <div className={`${f.icon === 'payments' ? 'bg-white text-black' : 'bg-brand-primary text-white'} w-14 h-14 rounded-2xl flex items-center justify-center mb-10 shadow-glow group-hover:scale-110 transition-transform duration-500`}>
                <span className="material-symbols-outlined text-2xl filled-icon">{f.icon}</span>
              </div>
              
              <h4 className="text-2xl font-bold text-white mb-5 tracking-tight group-hover:text-brand-primary transition-colors">
                {f.title}
              </h4>
              
              <p className="text-gray-400 leading-relaxed text-sm font-medium opacity-80 group-hover:opacity-100 transition-opacity">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
        <hr className="border-white/5 my-12" />
      </div>
    </section>
  );
}