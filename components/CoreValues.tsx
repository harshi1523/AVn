import React from "react";

const values = [
  {
    icon: "group",
    title: "Customer-Centric",
    description:
      "Your needs are at the heart of everything we do. We're dedicated to providing personalized support and a seamless experience.",
  },
  {
    icon: "workspace_premium",
    title: "Uncompromising Quality",
    description:
      "Every product we offer is rigorously tested and certified to meet the highest standards of performance and reliability.",
  },
  {
    icon: "recycling",
    title: "Sustainable Tech",
    description:
      "We're committed to reducing e-waste by promoting device rentals and responsible recycling programs.",
  },
];

export default function CoreValues() {
  return (
    <section className="bg-brand-card py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto lg:mx-0 mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Our Core Values
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            We are guided by principles that ensure we deliver the best for our
            customers and the planet.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {values.map((value, index) => (
            <div
              key={index}
              className="group flex flex-col gap-6 rounded-xl border border-gray-700 bg-[#121212] p-8 hover:shadow-lg hover:border-brand-accent/30 transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-full bg-brand-accent/10 flex items-center justify-center group-hover:bg-brand-accent/20 transition-colors">
                <span className="material-symbols-outlined text-brand-accent icon-lg">
                  {value.icon}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {value.title}
                </h3>
                <p className="text-base leading-relaxed text-gray-400">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}