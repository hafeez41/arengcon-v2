"use client";

import { SiteFooter } from "./site-footer";

const TEAM = [
  {
    name: "Emeka Okoye",
    title: "Founding Principal",
    bio: [
      "Emeka leads the practice and has directed projects across residential, civic, and commercial typologies. His approach is rooted in the conviction that architecture must first serve those who inhabit it.",
      "He holds degrees from Ahmadu Bello University and the Architectural Association, London, and has taught at institutions across West Africa.",
    ],
  },
  {
    name: "Amina Bello",
    title: "Principal, Interiors",
    bio: [
      "Amina oversees all interior design projects at the firm, bringing a material intelligence shaped by years of sourcing and specification work across the region.",
      "Her interiors are distinguished by a clarity of light and a rigour of detail that elevates every space she touches.",
    ],
  },
  {
    name: "Tunde Adeyemi",
    title: "Director of Construction",
    bio: [
      "Tunde bridges the gap between design intent and built reality. His background in both engineering and construction management allows him to anticipate and resolve challenges before they reach the site.",
      "He has overseen delivery of over forty projects across Nigeria and Ghana.",
    ],
  },
  {
    name: "Chisom Eze",
    title: "Senior Associate, Landscape",
    bio: [
      "Chisom leads landscape design across all project types, bringing an ecological sensitivity and a deep knowledge of West African planting to every scheme.",
    ],
  },
];

export function PeopleView() {
  return (
    <>
      <div className="h-[72px] desk:h-[120px]" aria-hidden />
      <section className="mx-auto max-w-[1100px] px-5 py-16 desk:px-8 desk:py-24">
        <h1 className="font-bank text-[48px] font-medium uppercase leading-none tracking-tight desk:text-[80px]">
          People
        </h1>

        <div className="mt-16 divide-y divide-line">
          {TEAM.map((member) => (
            <TeamMember key={member.name} {...member} />
          ))}
        </div>
      </section>
      <SiteFooter />
    </>
  );
}

function TeamMember({
  name,
  title,
  bio,
}: {
  name: string;
  title: string;
  bio: string[];
}) {
  return (
    <div className="flex flex-col gap-8 py-14 desk:flex-row desk:gap-16">
      <div className="shrink-0">
        <div className="h-36 w-36 rounded-full bg-ink/[0.06] desk:h-48 desk:w-48" />
      </div>
      <div className="max-w-[560px]">
        <h2 className="font-bank text-[22px] font-medium uppercase leading-none tracking-tight desk:text-[28px]">
          {name}
        </h2>
        <div className="mt-2 text-[10.5px] uppercase tracking-[0.18em] text-muted">{title}</div>
        <div className="mt-6 space-y-3">
          {bio.map((para, i) => (
            <p key={i} className="text-[13.5px] leading-[1.75] tracking-tight text-ink/85">
              {para}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
