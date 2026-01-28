import React from "react";

const team = [
  {
    name: "Jane Doe",
    role: "Founder & CEO",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "John Smith",
    role: "Head of Technology",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop",
  },
  {
    name: "Emily Jones",
    role: "Head of Customer Support",
    image:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop",
  },
];

export default function Team() {
  return (
    <section className="bg-brand-card py-20 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Meet the Team
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            The passionate people behind our success.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((member, index) => (
            <div key={index} className="text-center group">
              <div className="relative mx-auto h-40 w-40 rounded-full p-1 border-2 border-transparent group-hover:border-brand-accent/50 transition-colors">
                 <img
                    alt={`${member.name} - ${member.role}`}
                    aria-label={`Profile picture of ${member.name}, who serves as ${member.role}`}
                    className="h-full w-full rounded-full object-cover transition-transform duration-500 group-hover:scale-105"
                    src={member.image}
                    loading="lazy"
                />
              </div>
              <h3 className="mt-6 text-xl font-bold text-white group-hover:text-brand-accent transition-colors">
                {member.name}
              </h3>
              <p className="text-base font-medium text-brand-accent mt-1">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}