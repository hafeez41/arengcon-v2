"use client";

import clsx from "clsx";
import { SmartImage } from "./smart-image";
import { SiteFooter } from "./site-footer";

const UNSPLASH = "?auto=format&fit=crop&w=640&q=70";

const SERVICES = [
  {
    num: "01",
    title: "Architectural Solutions",
    desc: "From concept through technical documentation to construction administration — comprehensive architectural services at every stage of a project's life.",
    img: `https://images.unsplash.com/photo-1487958449943-2429e8be8625${UNSPLASH}`,
  },
  {
    num: "02",
    title: "Construction",
    desc: "Full-service construction management and contracting, delivering projects on programme and to specification across all typologies.",
    img: `https://images.unsplash.com/photo-1541888946425-d81bb19240f5${UNSPLASH}`,
  },
  {
    num: "03",
    title: "Interior Solutions",
    desc: "Interior design that goes beyond surface — material selection, spatial planning, lighting, and joinery resolved with the same rigour as the building envelope.",
    img: `https://images.unsplash.com/photo-1618219740975-d40978bb7378${UNSPLASH}`,
  },
  {
    num: "04",
    title: "Landscape",
    desc: "Landscape architecture and planting design rooted in ecological knowledge and local material culture, from intimate courtyards to large-scale ground planes.",
    img: `https://images.unsplash.com/photo-1558904541-efa843a96f01${UNSPLASH}`,
  },
  {
    num: "05",
    title: "Civil Engineering",
    desc: "Site infrastructure, drainage, roads, and earthworks — engineered to support the built fabric above and around it.",
    img: `https://images.unsplash.com/photo-1503387762-592deb58ef4e${UNSPLASH}`,
  },
  {
    num: "06",
    title: "Electrical Engineering",
    desc: "Integrated electrical systems design, from power distribution and lighting controls to renewable energy installations.",
    img: `https://images.unsplash.com/photo-1473341304170-971dccb5ac1e${UNSPLASH}`,
  },
  {
    num: "07",
    title: "Mechanical Engineering",
    desc: "HVAC, plumbing, and fire suppression systems designed for tropical climates and coordinated with the architectural intent.",
    img: `https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122${UNSPLASH}`,
  },
  {
    num: "08",
    title: "Infrastructural Solutions",
    desc: "Large-scale infrastructure planning and delivery — roads, utilities, and public realm — for developers and municipal clients.",
    img: `https://images.unsplash.com/photo-1473042904451-00171c69419d${UNSPLASH}`,
  },
];

export function ServicesView() {
  return (
    <>
      <div className="h-[72px] desk:h-[120px]" aria-hidden />
      <section className="mx-auto max-w-[1100px] px-5 py-16 desk:px-8 desk:py-24">
        <h1 className="font-bank text-[48px] font-medium uppercase leading-none tracking-tight desk:text-[80px]">
          Services
        </h1>

        <div className="mt-16">
          {SERVICES.map((s, i) => (
            <div
              key={s.num}
              className={clsx(
                "border-t border-line py-8 desk:py-10",
                i === SERVICES.length - 1 && "border-b",
              )}
            >
              <div className="flex flex-col gap-6 desk:flex-row desk:items-start desk:gap-10">
                <span className="shrink-0 pt-1 text-[10px] uppercase tracking-[0.18em] text-muted desk:order-1">
                  {s.num}
                </span>
                <div className="desk:order-2 desk:flex-1">
                  <h2 className="font-bank text-[20px] font-medium uppercase tracking-tight desk:text-[26px]">
                    {s.title}
                  </h2>
                  <p className="mt-3 max-w-[600px] text-[13.5px] leading-[1.75] text-ink/80">
                    {s.desc}
                  </p>
                </div>
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/[0.04] desk:order-3 desk:w-[260px] desk:shrink-0">
                  <SmartImage
                    src={s.img}
                    alt={s.title}
                    fill
                    sizes="(max-width: 1400px) 100vw, 260px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
