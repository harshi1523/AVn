import React, { useState, useEffect } from "react";

interface SupportPortalProps {
  initialTab?: 'status' | 'centers';
}

export default function SupportPortal({ initialTab = 'status' }: SupportPortalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [orderId, setOrderId] = useState("");
  const [statusResult, setStatusResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setStatusResult({
        id: orderId,
        status: "In Transit",
        location: "Bengaluru HUB",
        eta: "Tomorrow, Oct 24"
      });
      setLoading(false);
    }, 1200);
  };

  const centers = [
    { city: "Mumbai", area: "Andheri East", phone: "+91 22 4567 8900" },
    { city: "Bengaluru", area: "Koramangala", phone: "+91 80 1234 5678" },
    { city: "Delhi", area: "Nehru Place", phone: "+91 11 9876 5432" },
    { city: "Hyderabad", area: "HITEC City", phone: "+91 40 4444 5555" }
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 animate-in fade-in slide-in-from-top-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-display font-bold text-white mb-4">Support Center</h1>
        <p className="text-brand-textSecondary">We're here to help you get the most out of your technology.</p>
      </div>

      <div className="flex justify-center mb-12">
        <div className="bg-brand-card p-1 rounded-full border border-white/5 flex gap-2">
          <button 
            onClick={() => setActiveTab('status')}
            className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'status' ? 'bg-brand-primary text-white shadow-glow' : 'text-brand-textSecondary hover:text-white'}`}
          >
            Order Tracking
          </button>
          <button 
            onClick={() => setActiveTab('centers')}
            className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === 'centers' ? 'bg-brand-primary text-white shadow-glow' : 'text-brand-textSecondary hover:text-white'}`}
          >
            Service Centers
          </button>
        </div>
      </div>

      {activeTab === 'status' ? (
        <div className="bg-brand-card rounded-3xl p-8 border border-white/10 shadow-xl">
          <form onSubmit={handleTrack} className="flex flex-col md:flex-row gap-4 mb-8">
            <input 
              type="text" 
              required
              placeholder="Enter Order ID (e.g., ORD-12345)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="flex-1 bg-black/50 border border-gray-700 p-4 rounded-xl text-white focus:outline-none focus:border-brand-primary"
            />
            <button className="bg-cta-gradient text-white font-bold px-10 py-4 rounded-xl hover:scale-105 transition-transform shadow-glow">
              Track Order
            </button>
          </form>

          {loading && (
            <div className="flex flex-col items-center py-12">
              <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin mb-4"></div>
              <p className="text-brand-textMuted animate-pulse font-bold tracking-widest uppercase text-xs">Checking our databases...</p>
            </div>
          )}

          {statusResult && !loading && (
            <div className="animate-in zoom-in duration-300">
               <div className="p-6 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl mb-6">
                  <div className="flex justify-between items-center mb-6">
                     <div>
                       <p className="text-xs text-brand-textSecondary uppercase font-bold tracking-widest">Current Status</p>
                       <h3 className="text-2xl font-bold text-brand-primary">{statusResult.status}</h3>
                     </div>
                     <div className="text-right">
                       <p className="text-xs text-brand-textSecondary uppercase font-bold tracking-widest">Expected Delivery</p>
                       <p className="text-white font-bold">{statusResult.eta}</p>
                     </div>
                  </div>
                  <div className="relative pt-4 pb-8">
                     <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-800 -translate-y-1/2 rounded-full"></div>
                     <div className="absolute top-1/2 left-0 w-2/3 h-1 bg-brand-primary -translate-y-1/2 rounded-full shadow-glow"></div>
                     <div className="flex justify-between relative z-10">
                        <div className="bg-brand-primary text-white w-8 h-8 rounded-full flex items-center justify-center shadow-glow"><span className="material-symbols-outlined text-sm">inventory_2</span></div>
                        <div className="bg-brand-primary text-white w-8 h-8 rounded-full flex items-center justify-center shadow-glow"><span className="material-symbols-outlined text-sm">local_shipping</span></div>
                        <div className="bg-gray-800 text-gray-500 w-8 h-8 rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-sm">check_circle</span></div>
                     </div>
                  </div>
               </div>
               <div className="bg-white/5 p-4 rounded-xl flex items-center gap-4">
                  <span className="material-symbols-outlined text-brand-primary">location_on</span>
                  <div>
                    <p className="text-white text-sm font-bold">Last seen at {statusResult.location}</p>
                    <p className="text-xs text-brand-textSecondary">Updated 14 mins ago</p>
                  </div>
               </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {centers.map((c, i) => (
             <div key={i} className="bg-brand-card border border-white/5 rounded-2xl p-6 hover:border-brand-primary/30 transition-all flex flex-col justify-between shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-brand-primary">
                      <span className="material-symbols-outlined">storefront</span>
                   </div>
                   <div>
                      <h3 className="text-xl font-bold text-white">{c.city}</h3>
                      <p className="text-brand-textSecondary text-sm">{c.area}</p>
                   </div>
                </div>
                <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                   <div className="flex items-center gap-2 text-xs text-brand-textMuted">
                      <span className="material-symbols-outlined text-sm">call</span>
                      {c.phone}
                   </div>
                   <button className="w-full bg-white/5 text-white py-2 rounded-lg text-sm font-bold hover:bg-brand-primary hover:text-white">Get Directions</button>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Testimonial Section with Renamed Brand */}
      <div className="mt-20 p-10 bg-brand-elevated rounded-[3rem] border border-brand-border text-center">
        <p className="text-brand-textSecondary text-lg italic font-light">"SB Tech Solution's protection plan saved our project when a laptop was damaged during travel. The replacement process was seamless."</p>
        <p className="text-brand-primary font-black text-xs uppercase tracking-widest mt-6">— CTO, Digital Nexus</p>
      </div>
    </div>
  );
}