import React from "react";

interface CategoryCirclesProps {
  onNavigate: (view: string, params?: any) => void;
}

const categories = [
  { name: "Laptops", filter: "Laptop", icon: "laptop_mac", img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=300&auto=format&fit=crop" },
  { name: "Desktops", filter: "Desktop", icon: "desktop_windows", img: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=300&auto=format&fit=crop" },
  { name: "Monitors", filter: "Monitor", icon: "monitor", img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=300&auto=format&fit=crop" },
  { name: "Keyboards", filter: "Keyboards", icon: "keyboard", img: "https://images.unsplash.com/photo-1587829741301-dc798b91a603?q=80&w=300&auto=format&fit=crop" },
  { name: "Mice", filter: "Mice", icon: "mouse", img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?q=80&w=300&auto=format&fit=crop" },
  { name: "Gaming", filter: "Gaming", icon: "sports_esports", img: "https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?q=80&w=300&auto=format&fit=crop" },
  { name: "Audio", filter: "Audio", icon: "headphones", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&auto=format&fit=crop" },
];

export default function CategoryCircles({ onNavigate }: CategoryCirclesProps) {
  return (
    <section className="py-12">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <h2 className="text-xl md:text-2xl text-white mb-10 flex items-center gap-5">
            <span className="text-white venus-heading">Categories</span>
            <div className="flex-1 h-px bg-white/10"></div>
        </h2>
        
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-10 md:grid md:grid-cols-7">
          {categories.map((cat, idx) => (
            <div 
                key={idx} 
                className="group relative flex-shrink-0 w-40 md:w-auto cursor-pointer"
                onClick={() => onNavigate('listing', { category: cat.filter })}
            >
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden bg-brand-card border border-white/10 transition-all duration-500 hover:border-white/40 hover:shadow-[0_0_50px_rgba(255,255,255,0.05)] hover:-translate-y-2">
                
                {/* Image Overlay with full color and improved opacity */}
                <img 
                    src={cat.img} 
                    alt={cat.name} 
                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-125 opacity-50 group-hover:opacity-100" 
                />
                
                {/* Gradient for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10"></div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20 flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-4 text-white group-hover:bg-white group-hover:text-black group-hover:scale-110 transition-all duration-500 shadow-2xl">
                        <span className="material-symbols-outlined text-3xl font-light">{cat.icon}</span>
                    </div>
                    <span className="text-[10px] font-black text-white transition-colors tracking-[0.3em] uppercase">{cat.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}