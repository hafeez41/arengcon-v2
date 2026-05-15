"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { SmartImage } from "./smart-image";
import { ScrollFade } from "./scroll-fade";
import { Logo } from "./logo";
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
import { SIZE } from "@/lib/motion";
import { useProjectExpanded } from "./project-expanded-context";
import { useLenis } from "./lenis-provider";

export type FilterKey = "all" | Category | "updates";

export function ProjectsList({
  filter,
  subcategory,
}: {
  filter: FilterKey;
  subcategory?: string;
}) {
  const { list, adminProjects, isPlaceholder } = useEffectiveProjects();
  const [expanded, setExpanded] = useState<string | null>(null);
  const { setAnyExpanded } = useProjectExpanded();

  useEffect(() => {
    setExpanded(null);
  }, [filter, subcategory]);

  useEffect(() => {
    setAnyExpanded(expanded !== null);
  }, [expanded, setAnyExpanded]);

  const handleClick = (slug: string) => {
    setExpanded((cur) => (cur === slug ? null : slug));
  };

  const filtered = list.filter((p) => {
    if (filter !== "all" && p.category !== filter) return false;
    if (subcategory && p.subcategory !== subcategory) return false;
    return true;
  });

  const filterKey = subcategory ? `${filter}/${subcategory}` : `${filter}`;

  return (
    <ul className="flex flex-col gap-y-2 desk:gap-y-3">
      <AnimatePresence mode="popLayout" initial={true}>
        {filtered.map((p) => (
          <motion.li
            key={`${filterKey}-${p.slug}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={SIZE}
          >
            <ScrollFade disabled={expanded === p.slug}>
              <ProjectRow
                project={p}
                expanded={expanded === p.slug}
                onClick={() => handleClick(p.slug)}
                adminProjects={adminProjects}
                isPlaceholder={isPlaceholder}
              />
            </ScrollFade>
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
  isPlaceholder,
}: {
  project: Project;
  expanded: boolean;
  onClick: () => void;
  adminProjects: AdminProject[];
  isPlaceholder: boolean;
}) {
  const cat = CATEGORY_LABELS[project.category];
  const gallery = projectGallery(project, adminProjects);
  const galleryRest = gallery.slice(1);
  const rowRef = useRef<HTMLDivElement>(null);
  const { setExpandedOverlapsRail } = useProjectExpanded();
  const lenisRef = useLenis();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Click-and-drag horizontal scroll inside the expanded row.
  // `wasDrag` tells the post-mouseup click handler to swallow the click so
  // dragging on the image doesn't accidentally collapse the project.
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0, wasDrag: false });

  const onRowMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!expanded) return;
    const el = rowRef.current;
    if (!el) return;
    dragRef.current.active = true;
    dragRef.current.wasDrag = false;
    dragRef.current.startX = e.pageX;
    dragRef.current.startScroll = el.scrollLeft;
  };
  const onRowMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const el = rowRef.current;
    if (!el) return;
    const delta = e.pageX - dragRef.current.startX;
    if (Math.abs(delta) > 4) dragRef.current.wasDrag = true;
    el.scrollLeft = dragRef.current.startScroll - delta;
  };
  const onRowMouseEnd = () => {
    dragRef.current.active = false;
  };
  const onRowClickCapture = (e: React.MouseEvent<HTMLDivElement>) => {
    if (dragRef.current.wasDrag) {
      e.preventDefault();
      e.stopPropagation();
      dragRef.current.wasDrag = false;
    }
  };

  // Smoothly carry the page to the row when it expands. Wrapped in a tiny
  // setTimeout so the row's new (taller) height has been laid out before we
  // measure offset — that way the scroll and the height/width transition run
  // in parallel from the same starting frame (matches BIG.dk's approach).
  useEffect(() => {
    if (!expanded) return;
    const lenis = lenisRef.current;
    const el = rowRef.current;
    if (!lenis || !el) return;
    const t = window.setTimeout(() => {
      const vh = window.innerHeight;
      const elTop = el.getBoundingClientRect().top + window.scrollY;
      // Settle the row top ~12vh below the viewport top so the image lands
      // with symmetric breathing above and below.
      const headerOffset = window.innerWidth >= 1400 ? 0.12 * vh - 60 : 72;
      const target = Math.max(0, elTop - headerOffset);
      lenis.scrollTo(target, {
        duration: 0.78,
        easing: (k: number) => 1 - Math.pow(1 - k, 3),
      });
    }, 10);
    return () => window.clearTimeout(t);
  }, [expanded, lenisRef]);

  // Update arrow visibility based on horizontal scroll position of the row.
  useEffect(() => {
    if (!expanded) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }
    const el = rowRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [expanded]);

  const scrollByPanel = (dir: 1 | -1) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth * 0.8 * dir, behavior: "smooth" });
  };

  // While expanded, track whether the row's viewport rect overlaps the side rail's zone.
  // Rail sits fixed at top:200px and grows downward — use a generous [200, 720] band.
  useEffect(() => {
    if (!expanded) {
      setExpandedOverlapsRail(false);
      return;
    }
    const RAIL_TOP = 200;
    const RAIL_BOTTOM = 720;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const el = rowRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const overlaps = rect.top < RAIL_BOTTOM && rect.bottom > RAIL_TOP;
      setExpandedOverlapsRail(overlaps);
    };
    const onScrollOrResize = () => {
      if (raf) return;
      raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
      if (raf) cancelAnimationFrame(raf);
      setExpandedOverlapsRail(false);
    };
  }, [expanded, setExpandedOverlapsRail]);

  return (
    <div className="relative">
    <div
      ref={rowRef}
      data-lenis-prevent={expanded ? "" : undefined}
      onMouseDown={onRowMouseDown}
      onMouseMove={onRowMouseMove}
      onMouseUp={onRowMouseEnd}
      onMouseLeave={onRowMouseEnd}
      onClickCapture={onRowClickCapture}
      className={clsx(
        "w-full select-none",
        expanded
          ? "overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing [&_img]:pointer-events-none"
          : "overflow-visible",
      )}
    >
      <div
        className={clsx(
          "flex transition-[gap,padding] duration-[780ms] ease-[cubic-bezier(0.45,0,0.55,1)]",
          expanded
            ? "items-start gap-8 desk:gap-12 pl-[7.5vw] desk:pl-0 desk:py-[4vh]"
            : "mx-auto max-w-[1100px] flex-col gap-4 px-5 items-start desk:flex-row desk:gap-10 desk:px-8",
        )}
      >
        {/* Sidebar */}
        <div
          className={clsx(
            "shrink-0 transition-[width] duration-[780ms] ease-[cubic-bezier(0.45,0,0.55,1)]",
            expanded
              ? "px-5 pt-6 pb-2 desk:w-[200px] desk:overflow-y-auto desk:px-8 desk:py-6"
              : "w-full desk:w-[280px]",
          )}
        >
          <button
            type="button"
            onClick={onClick}
            className="block w-full text-left"
            aria-expanded={expanded}
          >
            <Pictogram />
            <h3 className="mt-5 text-[17px] leading-[1.25] tracking-tight desk:text-[18px]">
              {project.title}
            </h3>
            <div className="mt-2 text-[10.5px] uppercase tracking-[0.14em] text-muted">
              {project.location}
            </div>
          </button>

          {/* Metadata reveal — CSS grid-rows trick instead of JS height animation */}
          <div
            aria-hidden={!expanded}
            className={clsx(
              "grid transition-[grid-template-rows,opacity] duration-[780ms] ease-[cubic-bezier(0.45,0,0.55,1)]",
              expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="min-h-0 overflow-hidden">
              <dl className="mt-10 space-y-5">
                <Meta label="Client" value={project.client} />
                <Meta label="Typology" value={cat.name} />
                <Meta label="Size m²/ft²" value={project.size} />
                <Meta label="Status" value={project.status} />
                <div className="pt-3">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-muted">Share</div>
                  <ShareRow title={project.title} />
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Main image (no framer layout — was conflicting with order classes) */}
        <button
          type="button"
          onClick={onClick}
          className={clsx(
            "group block shrink-0 transition-[width,height,max-width] duration-[780ms] ease-[cubic-bezier(0.45,0,0.55,1)]",
            expanded
              ? "w-[85vw] h-[64vw] desk:w-[108vh] desk:max-w-[calc(100%_-_528px)] desk:h-[72vh] order-first desk:order-none"
              : "w-full desk:w-[560px] desk:h-[420px] desk:max-w-none",
          )}
          aria-label={`${expanded ? "Collapse" : "Expand"} ${project.title}`}
        >
          <div className="relative w-full h-full overflow-hidden bg-ink/[0.04] aspect-[4/3]">
            <SmartImage
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 1400px) 85vw, calc(100vw - 530px)"
              className="object-contain transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
            />
          </div>
        </button>

        {/* Description — CSS-driven width transition (compositor thread, no JS layout) */}
        <div
          aria-hidden={!expanded}
          className={clsx(
            "shrink-0 overflow-hidden transition-[width,opacity] duration-[780ms] ease-[cubic-bezier(0.45,0,0.55,1)]",
            expanded ? "w-[280px] opacity-100" : "w-0 opacity-0",
            !expanded && "pointer-events-none select-none",
          )}
        >
          <div className="w-[280px] px-5 py-6 desk:overflow-y-auto desk:max-h-[calc(100vh_-_120px)]">
            <p className="text-[13.5px] leading-[1.65]">{project.summary}</p>
            <div className="mt-5 space-y-3 text-[13px] leading-[1.65] text-ink/85">
              {project.description.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </div>
        </div>

        {/* Gallery panels — continue in the same horizontal scroll track */}
        {expanded &&
          galleryRest.map((src, i) => (
            <motion.figure
              key={`${i}-${src.slice(0, 32)}`}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ ...SIZE, delay: 0.18 + i * 0.06 }}
              className="shrink-0 desk:self-center"
            >
              <div className="relative w-[85vw] h-[64vw] overflow-hidden bg-ink/[0.04] desk:w-[108vh] desk:max-w-[calc(100vw_-_528px)] desk:h-[72vh]">
                <SmartImage
                  src={src}
                  alt={`${project.title} ${i + 2}`}
                  fill
                  sizes="(max-width: 1400px) 80vw, 600px"
                  className="object-contain"
                />
              </div>
            </motion.figure>
          ))}

        {/* Pull quote — placeholder/demo data only, never on admin-created projects */}
        {expanded && isPlaceholder && (
          <motion.aside
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ ...SIZE, delay: 0.18 + galleryRest.length * 0.06 }}
            className="flex w-[85vw] h-[64vw] shrink-0 items-center justify-center bg-ink p-10 text-paper desk:w-[108vh] desk:max-w-[calc(100vw_-_528px)] desk:h-[72vh] desk:p-14"
          >
            <blockquote className="max-w-[32ch]">
              <p className="text-[20px] leading-[1.3] tracking-tight desk:text-[24px]">
                The drawings matched the steel — we came in with a brief and
                walked out with a building the brief never asked for.
              </p>
              <footer className="mt-6 text-[10px] uppercase tracking-[0.18em] text-paper/70">
                — {project.client}
              </footer>
            </blockquote>
          </motion.aside>
        )}

        {expanded && <div aria-hidden className="w-10 shrink-0 desk:w-20" />}
      </div>
    </div>

    {/* Click-to-scroll chevrons (desk only; touch users already have native swipe) */}
    {expanded && (
      <>
        <button
          type="button"
          onClick={() => scrollByPanel(-1)}
          aria-label="Scroll left"
          tabIndex={canScrollLeft ? 0 : -1}
          className={clsx(
            "absolute left-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-paper/85 text-ink shadow-sm backdrop-blur transition-opacity duration-200 hover:bg-paper desk:grid",
            canScrollLeft ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <ChevronIcon direction="left" />
        </button>
        <button
          type="button"
          onClick={() => scrollByPanel(1)}
          aria-label="Scroll right"
          tabIndex={canScrollRight ? 0 : -1}
          className={clsx(
            "absolute right-4 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-paper/85 text-ink shadow-sm backdrop-blur transition-opacity duration-200 hover:bg-paper desk:grid",
            canScrollRight ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <ChevronIcon direction="right" />
        </button>
      </>
    )}
    </div>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={direction === "left" ? "rotate-180" : ""}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function Pictogram() {
  // Logo already includes its own black circle; no wrapper / no invert.
  return <Logo className="h-9 w-9" />;
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[9px] uppercase tracking-[0.2em] text-muted">
        {label}
      </dt>
      <dd className="mt-2 text-[13px] tracking-tight text-ink">{value}</dd>
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

