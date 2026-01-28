import React from "react";

const features = [
  { icon: "verified", title: "Certified Quality", desc: "100% Tested & Verified Devices" },
  { icon: "rocket_launch", title: "Express Delivery", desc: "Doorstep Delivery in 24 Hours" },
  { icon: "published_with_changes", title: "Easy Upgrades", desc: "Flexible Plans & Device Swaps" },
  { icon: "support_agent", title: "24/7 Support", desc: "Dedicated Tech Assistance" },
];

export default function TrustSection() {
  return (
    <section className="py-12 border-t border-white/10 bg-black/40 backdrop-blur-md">
      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="flex flex-col items-center text-center gap-3 group">
              <div className="w-12 h-12 rounded-full bg-brand-card border border-gray-700 flex items-center justify-center group-hover:border-brand-accent group-hover:text-brand-accent transition-colors">
                <span className="material-symbols-outlined text-[28px]">{feature.icon}</span>
              </div>
              <div>
                <h4 className="font-bold text-white text-base md:text-lg">{feature.title}</h4>
                <p className="text-gray-400 text-xs md:text-sm">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}