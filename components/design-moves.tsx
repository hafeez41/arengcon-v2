"use client";

import { motion } from "framer-motion";
import { SmartImage } from "./smart-image";

export type DesignMove = {
  label: string;
  description: string;
  image: string;
};

export function DesignMoves({ moves }: { moves: DesignMove[] }) {
  return (
    <section className="border-t border-line">
      <div className="mx-auto w-full max-w-[1600px] px-5 py-16 md:px-8 md:py-24">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <div className="eyebrow">Design moves</div>
            <h2 className="mt-2 text-display-md">{moves.length} design decisions, in order.</h2>
          </div>
          <div className="hidden text-[12px] text-muted md:block">
            Scroll to read.
          </div>
        </div>
        <ol className="space-y-16 md:space-y-24">
          {moves.map((m, i) => (
            <motion.li
              key={`${i}-${m.label}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="grid grid-cols-12 gap-x-6 gap-y-6"
            >
              <div className="col-span-12 md:col-span-3">
                <div className="text-[44px] tabnum leading-none tracking-tight md:text-[64px]">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="eyebrow mt-3">{m.label}</div>
                <p className="mt-4 max-w-prose text-[14px] leading-[1.55] text-muted">
                  {m.description}
                </p>
              </div>
              <div className="col-span-12 md:col-span-9">
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-ink/[0.04]">
                  <SmartImage
                    src={m.image}
                    alt={`${m.label} diagram`}
                    fill
                    sizes="(max-width: 768px) 100vw, 75vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
