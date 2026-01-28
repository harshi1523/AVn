import React from "react";

export default function PromoBanners() {
  return (
    <section className="py-8">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Banner 1 */}
          <div className="relative rounded-2xl overflow-hidden h-[250px] md:h-[350px] group cursor-pointer">
            <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2000&auto=format&fit=crop')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-transparent flex flex-col justify-center px-8 md:px-12">
               <span className="text-brand-accent font-bold mb-2">Corporate Offer</span>
               <h3 className="text-3xl font-bold text-white mb-4 leading-tight">Workstation<br/>Rentals</h3>
               <p className="text-gray-300 mb-6">Equip your team from ₹2,500/mo</p>
               <button className="w-fit border border-white text-white hover:bg-white hover:text-black px-6 py-2 rounded font-medium transition-colors">
                  Get Quote
               </button>
            </div>
          </div>

          {/* Banner 2 */}
          <div className="relative rounded-2xl overflow-hidden h-[250px] md:h-[350px] group cursor-pointer">
            <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('https://images.unsplash.com/photo-1616588589676-62b3bd4ff6d2?q=80&w=2000&auto=format&fit=crop')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-transparent flex flex-col justify-center px-8 md:px-12">
               <span className="text-brand-accent font-bold mb-2">Gaming Zone</span>
               <h3 className="text-3xl font-bold text-white mb-4 leading-tight">Ultimate<br/>Setups</h3>
               <p className="text-gray-300 mb-6">Up to 30% Off on Pre-builts</p>
               <button className="w-fit border border-white text-white hover:bg-white hover:text-black px-6 py-2 rounded font-medium transition-colors">
                  Shop Now
               </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}