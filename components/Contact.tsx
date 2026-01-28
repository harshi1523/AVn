import React from "react";

export default function Contact() {
  return (
    <section className="py-24 sm:py-32 bg-transparent">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Let’s Connect
        </h2>
        <p className="mt-6 max-w-xl mx-auto text-lg text-gray-400">
          Have a question or want to explore our products? We’d love to hear from
          you.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6">
          <button className="w-full sm:w-auto rounded-lg bg-brand-accent px-8 py-3.5 text-base font-bold text-black shadow-lg shadow-brand-accent/25 hover:bg-brand-accent/90 hover:shadow-brand-accent/40 active:scale-95 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-accent">
            Browse Our Products
          </button>
          <a
            href="mailto:support@techrent.com"
            className="text-base font-bold leading-6 text-white hover:text-brand-accent transition-colors flex items-center gap-1 group"
          >
            Email Us <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}