import React from "react";

const milestones = [
  {
    year: "2020",
    description: "Founded with a vision to revolutionize tech access.",
    icon: "flag",
    side: "left",
  },
  {
    year: "2021",
    description: "Welcomed our first 1,000 satisfied customers.",
    icon: "groups",
    side: "right",
  },
  {
    year: "2023",
    description: "Expanded our services to include flexible rental options.",
    icon: "store",
    side: "left",
  },
];

export default function Timeline() {
  return (
    <section className="py-20 sm:py-32 bg-transparent overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16 md:mb-24">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl uppercase font-display italic">
            Our <span className="text-brand-primary">Journey</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-gray-500 font-medium italic">
            A brief history of our milestones and growth.
          </p>
        </div>

        <div className="relative">
          {/* Vertical Line - left aligned on mobile, centered on md+ */}
          <div className="absolute left-6 md:left-1/2 top-0 h-full w-px md:-translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

          <div className="space-y-16 md:space-y-24">
            {milestones.map((item, index) => (
              <div
                key={index}
                className={`relative flex items-center md:justify-center ${item.side === "left" ? "md:flex-row-reverse" : "md:flex-row"
                  } flex-row pl-12 md:pl-0`}
              >
                {/* Content Side */}
                <div
                  className={`w-full md:w-1/2 animate-in slide-in-from-${item.side === 'left' ? 'right' : 'left'}-8 duration-700 ${item.side === "left" ? "md:text-right md:pr-16" : "md:text-left md:pl-16"
                    } text-left`}
                >
                  <h3 className="text-2xl md:text-3xl font-display font-black text-white italic tracking-tighter mb-2 md:mb-3">
                    {item.year}
                  </h3>
                  <p className="text-sm md:text-base text-gray-400 font-medium leading-relaxed opacity-80">
                    {item.description}
                  </p>
                </div>

                {/* Icon Marker */}
                <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-brand-primary shadow-glow ring-4 md:ring-8 ring-brand-page z-10 transition-transform hover:scale-110 duration-300">
                  <span className="material-symbols-outlined text-white text-lg filled-icon">
                    {item.icon}
                  </span>
                </div>

                {/* Spacing for the other side on desktop */}
                <div className="hidden md:block w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}