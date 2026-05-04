"use client";

import { motion } from "framer-motion";
import { SmartImage } from "./smart-image";
import { useNavigate } from "./spa-router";
import { CATEGORY_LABELS, type Project } from "@/lib/projects";

export function ProjectGrid({ items }: { items: Project[] }) {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2 md:gap-y-20 lg:grid-cols-3">
      {items.map((p, i) => (
        <motion.a
          key={p.slug}
          href={`/projects/${p.slug}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/projects/${p.slug}`);
          }}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: 0.55,
            ease: [0.16, 1, 0.3, 1],
            delay: Math.min(0.04 * (i % 3), 0.12),
          }}
          className="group block"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/[0.04]">
            <SmartImage
              src={p.image}
              alt={p.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.025]"
            />
            <div className="absolute left-3 top-3 grid h-8 w-8 place-items-center bg-paper text-[10px] tracking-tight text-ink shadow-[0_4px_12px_rgba(0,0,0,0.04)]">
              {pictogramFor(p)}
            </div>
            <div className="absolute right-3 top-3 bg-paper/85 px-2 py-0.5 text-[10px] tracking-tight tabnum text-ink backdrop-blur-sm">
              {p.year}
            </div>
          </div>

          <div className="mt-4 flex items-baseline justify-between gap-3">
            <h3 className="text-[17px] tracking-tight">{p.title}</h3>
            <span className="text-[12px] text-muted tabnum">
              {CATEGORY_LABELS[p.category].name}
            </span>
          </div>
          <div className="mt-1 text-[13px] text-muted">
            {p.location} · {p.status}
          </div>
        </motion.a>
      ))}
    </div>
  );
}

function pictogramFor(p: Project) {
  const map: Record<Project["category"], string> = {
    arch: "▲",
    int: "◐",
    cons: "▮",
  };
  return map[p.category];
}
