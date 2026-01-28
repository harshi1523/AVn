import React from "react";

interface CategorySectionProps {
  onNavigate: (view: string, params?: any) => void;
}

const categories = [
  {
    name: "Laptops",
    filter: "Laptop",
    desc: "MacBook Pro, XPS & ThinkPad",
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop",
    color: "from-blue-900/40"
  },
  {
    name: "Desktops",
    filter: "Desktop",
    desc: "Workstations & Professional Monitors",
    img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop",
    color: "from-gray-900/40"
  },
  {
    name: "Accessories",
    filter: "Accessories",
    desc: "Tablets, Peripherals & Creative Gear",
    img: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?q=80&w=600&auto=format&fit=crop",
    color: "from-orange-900/40"
  }
];

export default function CategorySection({ onNavigate }: CategorySectionProps) {
  return (
    <section className="py-8 max-w-7xl mx-auto px-4">
      <h3 className="avn-heading">Explore Categories</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {categories.map((cat, idx) => (
          <div
            key={idx}
            className="group relative h-[320px] rounded-3xl-custom overflow-hidden cursor-pointer border border-white/10 bg-brand-card hover:border-white/20 transition-all shadow-xl"
            onClick={() => onNavigate('listing', { category: cat.filter })}
          >
            <img
              src={cat.img}
              alt={cat.name}
              className="absolute inset-0 w-full h-full object-cover opacity-50 transition-transform duration-1000 group-hover:scale-110"
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} via-black/40 to-transparent`}></div>
            <div className="absolute inset-0 p-8 flex flex-col items-center text-center">
              <h4 className="text-3xl font-bold text-white mb-2 font-display">{cat.name}</h4>
              <p className="text-gray-400 text-sm mb-auto font-medium">{cat.desc}</p>
              <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-[10px] uppercase tracking-widest py-3 px-8 rounded-xl hover:bg-white hover:text-black transition-all">
                Browse Category
              </button>
            </div>
          </div>
        ))}
      </div>
      <hr className="border-white/5 my-12" />
    </section>
  );
}