import React, { useState, useEffect } from "react";
import { products } from "../lib/mockData";
import { useStore } from "../lib/store";

interface DealOfTheDayPageProps {
    onNavigate: (view: string, params?: any) => void;
}

export default function DealOfTheDayPage({ onNavigate }: DealOfTheDayPageProps) {
    const { addToCart } = useStore();
    const product = products.find(p => p.id === 'razer-blade-16');

    // Countdown timer state
    const [timeLeft, setTimeLeft] = useState({ h: 4, m: 32, s: 15 });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { h, m, s } = prev;
                if (s > 0) s--;
                else if (m > 0) { m--; s = 59; }
                else if (h > 0) { h--; m = 59; s = 59; }
                return { h, m, s };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!product) return null;

    const handleProvision = async () => {
        try {
            await addToCart(product.id, 'rent', 3); // Capped at 3 months now
            onNavigate('cart');
        } catch (err: any) {
            const code = err?.message;
            if (code === 'KYC_NOT_APPROVED' || code === 'KYC_EXPIRED' || code === 'KYC_LIMIT_REACHED') {
                window.dispatchEvent(new CustomEvent('navigate', { detail: { view: 'kyc' } }));
            } else {
                alert(err?.message || 'Failed to add item to cart.');
            }
        }
    };

    return (
        <div className="animate-in fade-in duration-700 bg-brand-page min-h-screen">
            {/* Immersive Hero Section */}
            <section className="relative h-[90vh] overflow-hidden flex items-center">
                <img
                    src="https://images.unsplash.com/photo-1603481588273-2f908a9a7a1b?q=80&w=2000&auto=format&fit=crop"
                    className="absolute inset-0 w-full h-full object-cover brightness-[0.2] grayscale-[0.5]"
                    alt="Razer Blade 16 Background"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-brand-page"></div>

                {/* HUD Elements */}
                <div className="absolute top-10 left-10 text-brand-secondary/40 font-mono text-[10px] tracking-[0.5em] hidden lg:block">
                    SYSTEM_ACCESS: GRANTED<br />ENCRYPTION: ACTIVE<br />NODE_STATUS: EXTREME_DEAL
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 grid lg:grid-cols-2 gap-20 items-center">
                    <div className="animate-in slide-in-from-left duration-1000">
                        <div className="flex items-center gap-3 text-brand-secondary font-black text-xs tracking-[0.5em] uppercase mb-8">
                            <span className="w-2 h-2 rounded-full bg-brand-secondary animate-pulse shadow-[0_0_10px_#A855F7]"></span>
                            Active Deal Protocol v2.4
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-white mb-6 leading-none tracking-tighter uppercase italic">
                            RAZER <br />
                            <span className="gradient-text-reality">BLADE 16</span>
                        </h1>
                        <p className="text-xl text-gray-400 mb-12 max-w-lg leading-relaxed font-light italic opacity-80">
                            The definitive gaming workstation. Featuring the world's first Dual Mode Mini-LED display. Engineered for absolute dominance.
                        </p>

                        <div className="flex gap-6 mb-16">
                            {[
                                { v: timeLeft.h.toString().padStart(2, '0'), l: 'HRS' },
                                { v: timeLeft.m.toString().padStart(2, '0'), l: 'MIN' },
                                { v: timeLeft.s.toString().padStart(2, '0'), l: 'SEC' }
                            ].map((t, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-3xl font-black text-white mb-3 backdrop-blur-xl">
                                        {t.v}
                                    </div>
                                    <span className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4em]">{t.l}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative animate-in zoom-in duration-1000">
                        <div className="absolute -inset-20 bg-brand-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>
                        <div className="bg-brand-card/40 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-12 shadow-[0_40px_100px_rgba(0,0,0,1)] relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-10">
                                <div>
                                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Standard Price</p>
                                    <p className="text-xl text-gray-600 line-through font-bold">₹4,500/mo</p>
                                </div>
                                <div className="text-right">
                                    <span className="bg-brand-secondary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-glow">25% SAVING</span>
                                </div>
                            </div>

                            <div className="mb-12">
                                <p className="text-[10px] text-brand-secondary font-black uppercase tracking-[0.4em] mb-2">Protocol Deployment Price</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-7xl font-display font-bold text-white tracking-tighter italic">₹3,375</span>
                                    <span className="text-lg text-white/30 font-black uppercase tracking-widest">/mo</span>
                                </div>
                            </div>

                            <div className="space-y-6 mb-12">
                                <div className="flex items-center gap-4 text-white/60 text-sm font-medium italic">
                                    <span className="material-symbols-outlined text-brand-secondary text-[20px] filled-icon">verified</span>
                                    NVIDIA® GeForce RTX™ 4080
                                </div>
                                <div className="flex items-center gap-4 text-white/60 text-sm font-medium italic">
                                    <span className="material-symbols-outlined text-brand-secondary text-[20px] filled-icon">verified</span>
                                    Intel® Core™ i9-13950HX
                                </div>
                                <div className="flex items-center gap-4 text-white/60 text-sm font-medium italic">
                                    <span className="material-symbols-outlined text-brand-secondary text-[20px] filled-icon">verified</span>
                                    16" Dual Mode Mini-LED Display
                                </div>
                            </div>

                            <button
                                onClick={handleProvision}
                                className="w-full bg-cta-gradient hover:brightness-110 text-white font-black py-7 rounded-3xl text-[11px] uppercase tracking-[0.5em] transition-all active:scale-95 shadow-glow flex items-center justify-center gap-4"
                            >
                                PROVISION_NODE_NOW
                                <span className="material-symbols-outlined text-[20px]">bolt</span>
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* In-Depth Specifications */}
            <section className="py-32 max-w-7xl mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-20 items-start">
                    <div>
                        <h2 className="text-4xl font-display font-bold text-white mb-8 tracking-tighter uppercase italic">Technical <span className="text-white/20">Manifest</span></h2>
                        <p className="text-gray-500 mb-16 text-lg font-light leading-relaxed">
                            The Razer Blade 16 is built for performance without compromise. Explore the architectural details that define the world's most powerful 16-inch gaming laptop.
                        </p>

                        <div className="grid sm:grid-cols-2 gap-8">
                            {[
                                { t: 'Graphics Architecture', v: 'NVIDIA GeForce RTX 4080 (175W TGP)' },
                                { t: 'Processing Core', v: 'Intel Core i9-13950HX (24-Cores)' },
                                { t: 'Thermal Solution', v: 'Vapor Chamber Cooling Protocol' },
                                { t: 'Chassis Integrity', v: 'CNC Aluminum Unibody Shell' }
                            ].map((spec, i) => (
                                <div key={i} className="bg-brand-card/30 border border-white/5 p-8 rounded-[2rem] hover:border-brand-secondary/30 transition-all group">
                                    <h4 className="text-[9px] font-black text-brand-secondary uppercase tracking-[0.4em] mb-4">{spec.t}</h4>
                                    <p className="text-white font-bold leading-snug">{spec.v}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-brand-card border border-white/10 rounded-[3rem] p-12 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <h3 className="text-2xl font-display font-bold text-white mb-10 tracking-tight italic uppercase">Visual Protocol</h3>
                        <div className="space-y-10">
                            <div className="flex gap-8">
                                <div className="w-16 h-16 rounded-2xl bg-brand-secondary/10 flex items-center justify-center text-brand-secondary flex-shrink-0 border border-brand-secondary/20">
                                    <span className="material-symbols-outlined text-3xl">light_mode</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-2">Dual Mode Mini-LED</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed">Switch between UHD+ 120Hz for creative work and FHD+ 240Hz for extreme gaming performance at the touch of a button.</p>
                                </div>
                            </div>
                            <div className="flex gap-8">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white flex-shrink-0 border border-white/10">
                                    <span className="material-symbols-outlined text-3xl">palette</span>
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-lg mb-2">Color Precision</h4>
                                    <p className="text-gray-500 text-sm leading-relaxed">100% DCI-P3 color space with 1,000 nits peak brightness and VESA DisplayHDR™ 1000 certification for unparalleled visual accuracy.</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-16 pt-10 border-t border-white/5 flex items-center justify-between">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-brand-card bg-gray-800"></div>
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-brand-card bg-brand-secondary flex items-center justify-center text-[10px] font-black text-white">42+</div>
                            </div>
                            <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Active Operatives Using This Node</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="py-40 text-center relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_#A855F715_0%,_transparent_70%)] pointer-events-none"></div>
                <div className="max-w-3xl mx-auto px-6 relative z-10">
                    <h2 className="text-5xl md:text-7xl font-black text-white mb-10 tracking-tighter italic uppercase leading-tight">
                        DEPLOY THE <br />
                        <span className="text-brand-secondary">ULTIMATE POWER</span>
                    </h2>
                    <p className="text-gray-400 mb-14 text-lg font-light italic leading-relaxed">
                        Don't let legacy hardware throttle your creativity. Provision the Razer Blade 16 today and join the elite tier of digital operatives.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
                        <button
                            onClick={handleProvision}
                            className="bg-white text-black font-black px-14 py-6 rounded-2xl text-[11px] uppercase tracking-[0.4em] hover:bg-gray-200 transition-all active:scale-95 shadow-2xl"
                        >
                            Provision Protocol
                        </button>
                        <button
                            onClick={() => onNavigate('listing', { category: 'Gaming' })}
                            className="text-[11px] font-black text-white/40 hover:text-white transition-all uppercase tracking-[0.5em] underline underline-offset-8 decoration-brand-secondary/30"
                        >
                            Explore Gaming Grid
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}