"use client";

import clsx from "clsx";
import { SmartImage } from "./smart-image";
import { SiteFooter } from "./site-footer";
import { useEffectiveServices } from "@/lib/effective-data";

export function ServicesView() {
  const { list } = useEffectiveServices();

  return (
    <>
      <div className="h-[72px] desk:h-[120px]" aria-hidden />
      <section className="mx-auto max-w-[1100px] px-5 py-16 desk:px-8 desk:py-24">
        <h1 className="font-bank text-[48px] font-medium uppercase leading-none tracking-tight desk:text-[80px]">
          Services
        </h1>

        <div className="mt-16">
          {list.map((s, i) => (
            <div
              key={s.id}
              className={clsx(
                "border-t border-line py-8 desk:py-10",
                i === list.length - 1 && "border-b",
              )}
            >
              <div className="flex flex-col gap-6 desk:flex-row desk:items-start desk:gap-10">
                <span className="shrink-0 pt-1 text-[10px] uppercase tracking-[0.18em] text-muted desk:order-1">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="desk:order-2 desk:flex-1">
                  <h2 className="font-bank text-[20px] font-medium uppercase tracking-tight desk:text-[26px]">
                    {s.title}
                  </h2>
                  <p className="mt-3 max-w-[600px] text-[13.5px] leading-[1.75] text-ink/80">
                    {s.desc}
                  </p>
                </div>
                {s.image && (
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/[0.04] desk:order-3 desk:w-[260px] desk:shrink-0">
                    <SmartImage
                      src={s.image}
                      alt={s.title}
                      fill
                      sizes="(max-width: 1400px) 100vw, 260px"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
      <SiteFooter />
    </>
  );
}
