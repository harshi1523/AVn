import React from "react";

interface InfoCenterProps {
  page: string;
}

export default function InfoCenter({ page }: InfoCenterProps) {
  const contentMap: any = {
    'rental-guide': {
      title: "The Ultimate Deployment Guide",
      subtitle: "Everything you need to know about provisioning with SB Tech Solution.",
      sections: [
        { h: "The Protocol", p: "Simply select your node, choose a provisioning plan, and verify your credentials. We deploy to your location within 24-48 hours." },
        { h: "Security Deposit", p: "We maintain a minimal refundable deposit on certain elite-tier assets. This is released within 72 hours of asset recovery." },
        { h: "Scaling Infrastructure", p: "Changed your specs? You can upgrade to a higher performance node or extend your deployment anytime via the command center." }
      ]
    },
    'buying-guide': {
      title: "Intelligent Acquisition",
      subtitle: "Make informed decisions with our expert architecture advice.",
      sections: [
        { h: "Native vs Recertified", p: "Our recertified nodes undergo a 50-point telemetry check and come with a 1-year warranty, offering maximum efficiency." },
        { h: "Legacy-Proofing", p: "We recommend at least 32GB Unified Memory for contemporary multitasking and NVMe architecture for all elite workstations." }
      ]
    },
    'terms': {
      title: "Terms of Service",
      subtitle: "The legal framework for using our infrastructure and services.",
      sections: [
        { h: "1. Acceptance of Terms", p: "By accessing or using the SB Tech Solution platform, website, or services, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, you must terminate your access immediately." },
        { h: "2. User Responsibilities", p: "You agree to use our services only for lawful purposes. Prohibited conduct includes attempting to reverse engineer the software, utilizing the infrastructure for illegal activities, or interfering with network security protocols." },
        { h: "3. Intellectual Property", p: "All content, logos, code, and design elements within the SB Tech Solution ecosystem are the exclusive property of SB Tech Solution Infrastructure Private Limited. You are granted a limited, non-exclusive license to use the service as intended." },
        { h: "4. Termination", p: "We reserve the right to terminate or suspend your access to our network at any time, without notice, for conduct that we believe violates these terms or is harmful to other users or our business interests." },
        { h: "5. Limitation of Liability", p: "The service is provided on an 'As Is' and 'As Available' basis. SB Tech Solution is not responsible for any damages, including data loss, hardware errors, or downtime resulting from the use of our software or hardware." },
        { h: "6. Governing Law", p: "These terms and any disputes arising from them shall be governed by and construed in accordance with the laws of India, without regard to conflict of law principles." }
      ]
    },
    'privacy': {
      title: "Privacy Policy",
      subtitle: "How we protect, manage, and secure your digital metadata.",
      sections: [
        { h: "1. Information Collected", p: "We collect personal data (name, email, shipping address) to facilitate orders. We also collect non-personal data such as IP addresses, browser types, and device telemetry to ensure network stability." },
        { h: "2. How Information is Used", p: "Your data is used to provide customer support, authenticate your identity, and improve app functionality. We utilize telemetry to optimize device deployment and health monitoring." },
        { h: "3. Data Sharing & Third Parties", p: "We do not sell your personal data to advertisers. We share limited data with trusted third parties like Google Analytics to track usage patterns and logistics partners to fulfill hardware deliveries." },
        { h: "4. Cookies & Tracking", p: "Our platform uses cookies and similar tracking technologies to store session data and user preferences. You can manage your cookie settings through your browser interface." },
        { h: "5. User Rights", p: "You have the right to view, update, or request the deletion of your personal data. We comply with global privacy standards to ensure you have control over your digital identity." },
        { h: "6. Contact Information", p: "For any questions regarding your privacy or data security, please contact our Data Protection Officer at privacy@sbtechsolution.com." }
      ]
    },
    'refund': {
      title: "Recovery Policy",
      subtitle: "Transparent returns and financial reversals.",
      sections: [
        { h: "Deployment Cancellations", p: "Full reversal if cancelled before logistics initialization. Pro-rata maintenance apply if cancelled during active deployment." },
        { h: "Asset Returns", p: "7-day inspection window for all acquired items if found with technical anomalies." }
      ]
    }
  };

  const content = contentMap[page] || contentMap['rental-guide'];

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-16 border-b border-white/5 pb-16">
        <h1 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 tracking-tighter">{content.title}</h1>
        <p className="text-xl text-brand-muted leading-relaxed font-light italic">{content.subtitle}</p>
      </div>

      <div className="space-y-16">
        {content.sections.map((s: any, i: number) => (
          <div key={i} className="group">
             <h2 className="text-xl font-bold text-white mb-6 group-hover:text-white/80 transition-colors flex items-center gap-5 uppercase tracking-tight">
                <span className="w-1 h-6 bg-white/20 rounded-full"></span>
                {s.h}
             </h2>
             <p className="text-brand-muted text-lg leading-relaxed pl-8 border-l border-white/5 font-light">
                {s.p}
             </p>
          </div>
        ))}
      </div>

      <div className="mt-24 p-12 bg-brand-card rounded-[3rem] border border-white/5 text-center relative overflow-hidden group">
         <div className="absolute inset-0 bg-white/[0.01] opacity-0 group-hover:opacity-100 transition-opacity"></div>
         <h3 className="text-2xl font-display font-bold text-white mb-4 tracking-tight">Technical Queries?</h3>
         <p className="text-brand-muted mb-10 font-light">Our support operatives are available 24/7 to assist with your infrastructure.</p>
         <button className="bg-white text-black font-black px-10 py-4 rounded-xl text-[10px] uppercase tracking-[0.4em] hover:opacity-80 transition-all shadow-2xl active:scale-95">
            Initialize Direct Comms
         </button>
      </div>
    </div>
  );
}