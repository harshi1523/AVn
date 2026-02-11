import React, { useState } from "react";

const faqs = [
  { q: "How does the refundable deposit work?", a: "The deposit is collected at the time of booking and is fully refunded within 48 hours of product return after a quality check." },
  { q: "What happens if I accidentally damage the laptop?", a: "Minor wear and tear are expected. For significant accidental damage, we have flexible insurance plans that cover up to 80% of repair costs." },
  { q: "Is there a minimum rental duration?", a: "The minimum rental duration is 1 day, but we offer significantly better rates for weekly and monthly rentals." },
  { q: "Can I buy the laptop if I like it?", a: "Yes! We offer a 'Rent-to-Own' program where a portion of your paid rent can be adjusted against the purchase price." }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-8 max-w-4xl mx-auto px-4">
      <h3 className="avn-heading text-center">Frequently Asked Questions</h3>
      <p className="text-gray-500 text-center mb-10">Everything you need to know about our rental process.</p>

      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-dark-card border border-white/5 rounded-2xl overflow-hidden transition-all">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="w-full flex justify-between items-center p-6 text-left hover:bg-white/5 transition-all"
            >
              <span className="font-bold text-white text-lg">{faq.q}</span>
              <span className="material-symbols-outlined text-gray-500 transition-transform duration-300" style={{ transform: openIndex === i ? 'rotate(180deg)' : 'none' }}>
                expand_more
              </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${openIndex === i ? 'max-h-96' : 'max-h-0'}`}>
              <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-white/5">
                {faq.a}
              </div>
            </div>
          </div>
        ))}
      </div>
      <hr className="border-white/5 my-12" />
    </section>
  );
}