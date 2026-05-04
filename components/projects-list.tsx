"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { SmartImage } from "./smart-image";
import {
  CATEGORY_LABELS,
  type Category,
  type Project,
} from "@/lib/projects";
import {
  projectGallery,
  useEffectiveProjects,
} from "@/lib/effective-data";
import type { AdminProject } from "@/lib/admin-store";

export type FilterKey = "all" | Category;

// Long, soft easing — same on every animation so they breathe together
const FLOAT = { duration: 1.4, ease: [0.22, 1, 0.36, 1] as const };
const ENTRY = { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const };

export function ProjectsList({ filter }: { filter: FilterKey }) {
  const { list, adminProjects } = useEffectiveProjects();
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setExpanded(null);
  }, [filter]);

  const handleClick = (slug: string) => {
    // Simultaneous swap — framer cross-fades both projects in place
    setExpanded((cur) => (cur === slug ? null : slug));
  };

  const filtered =
    filter === "all" ? list : list.filter((p) => p.category === filter);

  return (
    <ul className="flex flex-col gap-y-24 md:gap-y-32">
      <AnimatePresence mode="popLayout" initial={false}>
        {filtered.map((p) => (
          <motion.li
            key={p.slug}
            layout="position"
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={ENTRY}
          >
            <ProjectRow
              project={p}
              expanded={expanded === p.slug}
              onClick={() => handleClick(p.slug)}
              adminProjects={adminProjects}
            />
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

function ProjectRow({
  project,
  expanded,
  onClick,
  adminProjects,
}: {
  project: Project;
  expanded: boolean;
  onClick: () => void;
  adminProjects: AdminProject[];
}) {
  const cat = CATEGORY_LABELS[project.category];
  const gallery = projectGallery(project, adminProjects);

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
      <div className="grid grid-cols-12 items-start gap-x-6 gap-y-8 md:gap-x-8">
        {/* Title column — slides via layout */}
        <motion.div
          layout
          transition={{ layout: FLOAT }}
          className={clsx(
            "col-span-12 row-start-2 md:row-start-1",
            expanded
              ? "md:col-span-3 md:col-start-1"
              : "md:col-span-3 md:col-start-2",
          )}
        >
          <button
            type="button"
            onClick={onClick}
            className="block w-full text-left"
            aria-expanded={expanded}
          >
            <Pictogram project={project} />
            <h3 className="mt-5 text-[17px] leading-[1.25] tracking-tight md:text-[18px]">
              {project.title}
            </h3>
            <div className="mt-2 text-[10.5px] uppercase tracking-[0.14em] text-muted">
              {project.location}
            </div>
          </button>

          <motion.div
            initial={false}
            animate={{
              height: expanded ? "auto" : 0,
              opacity: expanded ? 1 : 0,
            }}
            transition={FLOAT}
            style={{ overflow: "hidden" }}
          >
            <dl className="mt-10 space-y-5">
              <Meta label="Client" value={project.client} />
              <Meta label="Typology" value={cat.name} />
              <Meta label="Size m²/ft²" value={project.size} />
              <Meta label="Status" value={project.status} />
              <div className="pt-3">
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted">
                  Share
                </div>
                <ShareRow title={project.title} />
              </div>
            </dl>
          </motion.div>
        </motion.div>

        {/* Image — grows via layout (FLIP) */}
        <motion.button
          layout
          transition={{ layout: FLOAT }}
          type="button"
          onClick={onClick}
          className={clsx(
            "group col-span-12 row-start-1 block",
            expanded
              ? "md:col-span-6 md:col-start-4"
              : "md:col-span-5 md:col-start-5",
          )}
          aria-label={`${expanded ? "Collapse" : "Expand"} ${project.title}`}
        >
          <motion.div
            layout
            transition={{ layout: FLOAT }}
            className="relative aspect-[4/3] w-full overflow-hidden bg-ink/[0.04]"
          >
            <SmartImage
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
            />
          </motion.div>
        </motion.button>

        {/* Description — opacity only, always in grid */}
        <motion.div
          layout
          initial={false}
          animate={{ opacity: expanded ? 1 : 0 }}
          transition={{ ...FLOAT, layout: FLOAT }}
          aria-hidden={!expanded}
          className={clsx(
            "col-span-12 row-start-3 md:col-span-3 md:col-start-10 md:row-start-1",
            !expanded && "pointer-events-none select-none",
          )}
        >
          <p className="text-[13.5px] leading-[1.65]">{project.summary}</p>
          <div className="mt-5 space-y-3 text-[13px] leading-[1.65] text-ink/85">
            {project.description.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Extended horizontal gallery */}
      {gallery.length > 1 && (
        <motion.div
          initial={false}
          animate={{
            height: expanded ? "auto" : 0,
            opacity: expanded ? 1 : 0,
          }}
          transition={FLOAT}
          aria-hidden={!expanded}
          style={{ overflow: "hidden" }}
        >
          <div className="mt-12 md:mt-16">
            <ExtendedGallery
              gallery={gallery.slice(1)}
              project={project}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Pictogram({ project }: { project: Project }) {
  return (
    <div className="grid h-9 w-9 place-items-center bg-ink text-paper">
      <CategoryGlyph category={project.category} />
    </div>
  );
}

function CategoryGlyph({ category }: { category: Category }) {
  if (category === "arch") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M4 11l8-6 8 6" />
        <path d="M5 11v9h14v-9" />
        <path d="M10 20v-5h4v5" />
        <rect x="7" y="13" width="2.5" height="2.5" />
        <rect x="14.5" y="13" width="2.5" height="2.5" />
      </svg>
    );
  }
  if (category === "int") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
        <rect x="3" y="4" width="18" height="16" />
        <path d="M3 13h10" />
        <path d="M13 4v9" />
        <path d="M13 13v7" />
        <path d="M16 20v-3" />
        <path d="M16 17a3 3 0 0 0 3-3" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M2 16h20" />
      <path d="M2 12h20" />
      <path d="M3 16l4-4" />
      <path d="M9 16l-2-4" />
      <path d="M9 16l2-4" />
      <path d="M15 16l-2-4" />
      <path d="M15 16l2-4" />
      <path d="M21 16l-4-4" />
      <path d="M2 16v3" />
      <path d="M22 16v3" />
    </svg>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.14em] text-muted">
        {label}
      </dt>
      <dd className="mt-1.5 text-[12.5px] uppercase tracking-tight">{value}</dd>
    </div>
  );
}

function ShareRow({ title }: { title: string }) {
  const url = `mailto:?subject=${encodeURIComponent(title)}`;
  return (
    <div className="mt-3 flex items-center gap-2">
      <a
        href={url}
        aria-label="Email"
        className="grid h-7 w-7 place-items-center bg-ink/[0.06] text-muted transition-colors hover:bg-ink hover:text-paper"
        onClick={(e) => e.stopPropagation()}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="5" width="18" height="14" rx="1" />
          <path d="m4 6 8 7 8-7" />
        </svg>
      </a>
      {[
        { label: "Facebook", glyph: "f" },
        { label: "LinkedIn", glyph: "in" },
        { label: "X", glyph: "X" },
      ].map(({ label, glyph }) => (
        <button
          key={label}
          aria-label={label}
          className="grid h-7 w-7 place-items-center bg-ink/[0.06] text-[10.5px] tracking-tight text-muted transition-colors hover:bg-ink hover:text-paper"
          onClick={(e) => e.stopPropagation()}
        >
          {glyph}
        </button>
      ))}
    </div>
  );
}

function ExtendedGallery({
  gallery,
  project,
}: {
  gallery: string[];
  project: Project;
}) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.7, behavior: "smooth" });
  };

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div className="text-[10px] uppercase tracking-[0.18em] text-muted">
          More — scroll →
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              scrollBy(-1);
            }}
            aria-label="Previous"
            className="grid h-9 w-9 place-items-center border border-line transition-colors hover:bg-ink/[0.04]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              scrollBy(1);
            }}
            aria-label="Next"
            className="grid h-9 w-9 place-items-center border border-line transition-colors hover:bg-ink/[0.04]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {gallery.map((src, i) => (
          <figure
            key={`${i}-${src.slice(0, 32)}`}
            className="relative aspect-[4/3] w-[78vw] max-w-[640px] shrink-0 snap-start overflow-hidden bg-ink/[0.04] md:w-[48vw]"
          >
            <SmartImage
              src={src}
              alt={`${project.title} ${i + 2}`}
              fill
              sizes="(max-width: 768px) 80vw, 50vw"
              className="object-cover"
            />
          </figure>
        ))}

        <aside className="flex w-[78vw] max-w-[640px] shrink-0 snap-start items-center justify-center bg-ink p-10 text-paper md:w-[48vw] md:p-14">
          <blockquote className="max-w-[34ch]">
            <p className="text-[20px] leading-[1.3] tracking-tight md:text-[24px]">
              “The drawings matched the steel. We came in with a brief and
              walked out with a building that took the brief somewhere we
              hadn’t asked it to go.”
            </p>
            <footer className="mt-6 text-[10px] uppercase tracking-[0.18em] text-paper/70">
              — {project.client}
            </footer>
          </blockquote>
        </aside>
      </div>
    </div>
  );
}
