"use client";

import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
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

export function ProjectsList({ filter }: { filter: FilterKey }) {
  const { list, adminProjects } = useEffectiveProjects();
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    setExpanded(null);
  }, [filter]);

  const filtered =
    filter === "all" ? list : list.filter((p) => p.category === filter);

  return (
    <LayoutGroup id="projects-list">
      <ul className="flex flex-col gap-y-20 md:gap-y-32">
        <AnimatePresence mode="popLayout" initial={false}>
          {filtered.map((p) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                layout: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.4 },
                y: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
              }}
            >
              <ProjectRow
                project={p}
                expanded={expanded === p.slug}
                onToggle={() =>
                  setExpanded((cur) => (cur === p.slug ? null : p.slug))
                }
                adminProjects={adminProjects}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </LayoutGroup>
  );
}

function ProjectRow({
  project,
  expanded,
  onToggle,
  adminProjects,
}: {
  project: Project;
  expanded: boolean;
  onToggle: () => void;
  adminProjects: AdminProject[];
}) {
  const cat = CATEGORY_LABELS[project.category];
  const gallery = projectGallery(project, adminProjects);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!expanded || !ref.current) return;
    const top = ref.current.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, top - 100), behavior: "smooth" });
  }, [expanded]);

  return (
    <motion.div
      ref={ref}
      layout
      transition={{ layout: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }}
      className="mx-auto w-full max-w-[1280px] px-5 md:px-8"
    >
      <div className="grid grid-cols-12 gap-x-4 gap-y-6 md:gap-x-8">
        {/* Title + meta column */}
        <motion.div
          layout
          transition={{ layout: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }}
          className={clsx(
            "col-span-12 row-start-2 md:row-start-1",
            expanded
              ? "md:col-span-3 md:col-start-1"
              : "md:col-span-3 md:col-start-2",
          )}
        >
          <button
            type="button"
            onClick={onToggle}
            className="block w-full text-left"
            aria-expanded={expanded}
          >
            <Pictogram project={project} />
            <h3 className="mt-5 text-[18px] leading-[1.25] tracking-tight md:text-[19px]">
              {project.title}
            </h3>
            <div className="mt-2 text-[10.5px] uppercase tracking-[0.14em] text-muted">
              {project.location}
            </div>
          </button>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.dl
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{
                  duration: 0.4,
                  delay: 0.18,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="mt-12 space-y-6"
              >
                <Meta label="Client" value={project.client} />
                <Meta label="Typology" value={cat.name} />
                <Meta label="Size m²/ft²" value={project.size} />
                <Meta label="Status" value={project.status} />
                <div className="pt-4">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-muted">
                    Share
                  </div>
                  <ShareRow title={project.title} />
                </div>
              </motion.dl>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Image column */}
        <motion.button
          layout
          transition={{ layout: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }}
          type="button"
          onClick={onToggle}
          className={clsx(
            "group col-span-12 row-start-1 block",
            expanded
              ? "md:col-span-6 md:col-start-4"
              : "md:col-span-7 md:col-start-5",
          )}
          aria-label={`${expanded ? "Collapse" : "Expand"} ${project.title}`}
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/[0.04]">
            <SmartImage
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.025]"
              priority={false}
            />
          </div>
        </motion.button>

        {/* Description column (only expanded) */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              key="desc"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{
                duration: 0.5,
                delay: 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="col-span-12 row-start-3 md:col-span-3 md:col-start-10 md:row-start-1"
            >
              <p className="text-[13.5px] leading-[1.65]">
                {project.summary}
              </p>
              <div className="mt-5 space-y-3 text-[13px] leading-[1.65] text-ink/85">
                {project.description.map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Extended horizontal gallery */}
      <AnimatePresence>
        {expanded && gallery.length > 1 && (
          <motion.div
            key="extended"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{
              duration: 0.55,
              delay: 0.25,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="mt-16 md:mt-20"
          >
            <ExtendedGallery
              gallery={gallery.slice(1)}
              project={project}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
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
  // Abstract architectural marks per discipline
  if (category === "arch") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" strokeLinejoin="miter">
        <path d="M3 19h18" />
        <path d="M5 19V9l7-5 7 5v10" />
        <path d="M10 19v-6h4v6" />
      </svg>
    );
  }
  if (category === "int") {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square">
        <rect x="4" y="4" width="16" height="16" />
        <path d="M4 14h7" />
        <path d="M11 14v6" />
        <path d="M16 4v6" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" strokeLinejoin="miter">
      <path d="M3 17h18" />
      <path d="M3 17l4-7h10l4 7" />
      <path d="M9 17v-3" />
      <path d="M15 17v-3" />
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
            className="relative aspect-[4/3] w-[78vw] max-w-[820px] shrink-0 snap-start overflow-hidden bg-ink/[0.04] md:w-[58vw]"
          >
            <SmartImage
              src={src}
              alt={`${project.title} ${i + 2}`}
              fill
              sizes="(max-width: 768px) 80vw, 60vw"
              className="object-cover"
            />
          </figure>
        ))}

        <aside className="flex w-[78vw] max-w-[820px] shrink-0 snap-start items-center justify-center bg-ink p-10 text-paper md:w-[58vw] md:p-16">
          <blockquote className="max-w-[36ch]">
            <p className="text-[22px] leading-[1.25] tracking-tight md:text-[28px]">
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
