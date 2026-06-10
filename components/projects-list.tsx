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
    <ul className="flex flex-col gap-y-1 desk:gap-y-2">
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
      const elTop = el.getBoundingClientRect().top + window.scrollY;
      // Land the row top just below the fixed header (120px desk / 72px mobile)
      // plus a small gap. The expanded row is ~76vh, so this leaves clear
      // space at the bottom for the next project to peek through.
      const headerOffset = window.innerWidth >= 1400 ? 140 : 84;
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
    <AnimatePresence>
      {expanded && (
        <motion.div
          key="swipe-hint"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 0.55, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="pointer-events-none absolute right-5 top-3 z-10 flex items-center gap-1.5 desk:hidden"
          aria-hidden
        >
          <span className="text-[9px] uppercase tracking-[0.22em] text-ink/70">
            Swipe
          </span>
          <motion.span
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            className="text-[12px] leading-none text-ink/70"
          >
            →
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
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
            ? "items-start gap-8 desk:gap-12 pl-[7.5vw] desk:pl-0 py-[2vh]"
            : "mx-auto max-w-[1100px] flex-col gap-4 px-5 items-start desk:flex-row desk:gap-10 desk:px-8",
        )}
      >
        {/* Sidebar */}
        <div
          className={clsx(
            "shrink-0 transition-[width] duration-[780ms] ease-[cubic-bezier(0.45,0,0.55,1)]",
            expanded
              ? "px-5 pt-3 pb-2 max-h-[55vh] overflow-y-auto desk:w-[260px] desk:max-h-[64vh] desk:px-8 desk:py-6"
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
            <h3 className="mt-4 text-[20px] leading-[1.15] tracking-tight desk:text-[24px]">
              {project.title}
            </h3>
            <div className="mt-2.5 text-[10.5px] uppercase leading-none tracking-[0.14em] text-muted">
              {project.location}
            </div>
            <div className="mt-1.5 text-[10.5px] uppercase leading-none tracking-[0.14em] tabnum text-muted">
              {project.year}
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
              <dl className="mt-1.5 space-y-1">
                <Meta label="Client" value={project.client} />
                <Meta label="Typology" value={cat.name} />
                <Meta label="Size m²/ft²" value={project.size} />
                <Meta label="Status" value={project.status} />
                <div className="pt-2">
                  <div className="text-[12px] uppercase tracking-[0.18em] text-muted">Share</div>
                  <ShareRow title={project.title} slug={project.slug} />
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
              ? "w-[92vw] desk:w-[96vh] desk:max-w-[calc(100%_-_588px)] desk:h-[64vh] order-first desk:order-none"
              : "w-full desk:w-[560px] desk:h-[420px] desk:max-w-none",
          )}
          aria-label={`${expanded ? "Collapse" : "Expand"} ${project.title}`}
        >
          <div className="relative w-full overflow-hidden bg-ink/[0.04] aspect-[4/3] desk:h-full desk:aspect-auto">
            <SmartImage
              src={project.image}
              alt={project.title}
              fill
              sizes="(max-width: 1400px) 85vw, calc(100vw - 530px)"
              className="object-contain transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
            />
            {/* OPEN PROJECT call-out — only on the collapsed tile. Always
                visible on mobile; fades from 40% to 100% on desktop hover. */}
            {!expanded && (
              <span
                aria-hidden
                className="pointer-events-none absolute left-1/2 top-1/2 flex h-11 w-36 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-paper/85 text-[10.5px] uppercase tracking-[0.18em] text-ink backdrop-blur-[2px] transition-opacity duration-300 desk:opacity-40 desk:group-hover:opacity-100"
              >
                Open Project
              </span>
            )}
          </div>
        </button>

        {/* Description — CSS-driven width transition (compositor thread, no JS layout) */}
        <div
          aria-hidden={!expanded}
          className={clsx(
            "shrink-0 overflow-hidden transition-[width,opacity] duration-[780ms] ease-[cubic-bezier(0.45,0,0.55,1)]",
            // max-h-0 when collapsed: in the mobile flex-COLUMN layout a
            // zero-width item still reserves its full content height, which
            // was injecting a huge empty gap between projects. Zero height
            // kills that; on desktop flex-row it's a harmless no-op.
            expanded ? "w-[280px] opacity-100" : "w-0 max-h-0 opacity-0",
            !expanded && "pointer-events-none select-none",
          )}
        >
          <div className="w-[280px] px-5 py-6 max-h-[40vh] overflow-y-auto desk:max-h-[64vh]">
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
              <div className="relative w-[92vw] aspect-[4/3] overflow-hidden bg-ink/[0.04] desk:w-[96vh] desk:max-w-[calc(100vw_-_588px)] desk:h-[64vh] desk:aspect-auto">
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
            className="flex w-[92vw] h-[64vh] shrink-0 items-center justify-center bg-ink p-10 text-paper desk:w-[96vh] desk:max-w-[calc(100vw_-_588px)] desk:h-[64vh] desk:p-14"
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
      <dt className="text-[12px] uppercase tracking-[0.18em] leading-none text-muted">
        {label}
      </dt>
      <dd className="mt-0.5 text-[14px] leading-snug tracking-tight text-ink">
        {value}
      </dd>
    </div>
  );
}

function ShareRow({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  // Project detail page URL. SSR-safe: falls back to the canonical host.
  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/projects/${slug}`
      : `https://arengcon.com/projects/${slug}`;
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const shares: { label: string; href: string; glyph: React.ReactNode }[] = [
    {
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      glyph: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.23 2.69.23v2.96H15.83c-1.49 0-1.96.93-1.96 1.89v2.27h3.33l-.53 3.49h-2.8V24C19.61 23.07 24 18.09 24 12.07z" />
        </svg>
      ),
    },
    {
      label: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      glyph: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19 0H5C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5zM7.27 18.27H4.5V9.73h2.77v8.54zM5.88 8.45c-.89 0-1.6-.72-1.6-1.6s.72-1.6 1.6-1.6c.89 0 1.6.72 1.6 1.6s-.71 1.6-1.6 1.6zm13.27 9.82h-2.77V14c0-.95-.02-2.18-1.33-2.18-1.33 0-1.53 1.04-1.53 2.11v4.34h-2.77V9.73h2.66v1.16h.04c.37-.7 1.27-1.43 2.62-1.43 2.81 0 3.33 1.85 3.33 4.25v4.56z" />
        </svg>
      ),
    },
    {
      label: "X",
      href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
      glyph: (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${t}%20${u}`,
      glyph: (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.7.9-.9 1.1-.2.2-.3.2-.6.1-1.7-.8-2.8-1.5-3.9-3.4-.3-.5.3-.5.8-1.5.1-.2 0-.4 0-.5s-.7-1.5-.9-2.1c-.2-.6-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.4-.2.3-1 .9-1 2.3s.9 2.7 1.1 2.9c.2.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.2-.2-.5-.3zM12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.1 1.5 5.8L0 24l6.4-1.5c1.7.9 3.6 1.5 5.6 1.5 6.6 0 12-5.4 12-12S18.6 0 12 0zm0 21.8c-1.8 0-3.5-.5-5-1.3l-.4-.2-3.7.9.9-3.6-.2-.4c-.9-1.5-1.4-3.3-1.4-5.1 0-5.4 4.4-9.8 9.8-9.8s9.8 4.4 9.8 9.8-4.4 9.7-9.8 9.7z" />
        </svg>
      ),
    },
  ];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard perms can fail in some embedded contexts — silently ignore.
    }
  };

  return (
    <div className="mt-2 flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        {shares.map(({ label, href, glyph }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`Share on ${label}`}
            className="grid h-7 w-7 place-items-center bg-ink/[0.06] text-muted transition-colors hover:bg-ink hover:text-paper"
            onClick={(e) => e.stopPropagation()}
          >
            {glyph}
          </a>
        ))}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void copyLink();
          }}
          aria-label="Copy project link"
          className="grid h-7 w-7 place-items-center bg-ink/[0.06] text-muted transition-colors hover:bg-ink hover:text-paper"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5" />
            <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5" />
          </svg>
        </button>
      </div>
      <AnimatePresence>
        {copied && (
          <motion.div
            key="copied-toast"
            initial={{ opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="text-[10px] uppercase tracking-[0.18em] text-emerald-600"
          >
            Project Link Copied
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

