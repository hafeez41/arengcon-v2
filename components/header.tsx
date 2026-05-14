"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "./logo";
import { useTheme } from "./theme-provider";
import { useNavigate, useRouterPath } from "./spa-router";
import { useIntroDone } from "./intro-context";
import { SearchOverlay } from "./search-overlay";
import { useProjectExpanded } from "./project-expanded-context";
import {
  type Category,
  SUBCATEGORIES,
  categoryHasSubcategories,
} from "@/lib/projects";
import { SIZE } from "@/lib/motion";

export type FilterKey = "all" | Category | "updates";

export type RouteFilter = {
  category: FilterKey;
  subcategory?: string;
};

const DISCIPLINE_FILTERS: { key: FilterKey; label: string; href: string }[] = [
  { key: "arch", label: "Architecture", href: "/architecture" },
  { key: "int", label: "Interiors", href: "/interiors" },
  { key: "cons", label: "Construction", href: "/construction" },
  { key: "land", label: "Landscaping", href: "/landscaping" },
  { key: "updates", label: "Updates", href: "/updates" },
];

const PAGE_LINKS: { key: string; label: string; href: string }[] = [
  { key: "about", label: "About", href: "/about" },
  { key: "people", label: "People", href: "/people" },
  { key: "services", label: "Services", href: "/services" },
];

const PATH_TO_CATEGORY: Record<string, FilterKey> = {
  architecture: "arch",
  interiors: "int",
  "interior-design": "int",
  construction: "cons",
  landscaping: "land",
  updates: "updates",
  news: "updates",
};

function getActivePage(path: string): string | null {
  const clean = path.split("?")[0].split("#")[0].replace(/\/$/, "");
  if (clean === "/about") return "about";
  if (clean === "/people") return "people";
  if (clean === "/services") return "services";
  return null;
}

export function parseRouteFilter(path: string): RouteFilter {
  const clean = path.split("?")[0].split("#")[0].replace(/^\/+/, "").replace(/\/+$/, "");
  if (!clean) return { category: "all" };
  const [first, second] = clean.split("/");
  const cat = PATH_TO_CATEGORY[first];
  if (!cat) return { category: "all" };
  if (
    second &&
    cat !== "updates" &&
    cat !== "all" &&
    categoryHasSubcategories(cat as Category) &&
    SUBCATEGORIES[cat as Category].some((s) => s.slug === second)
  ) {
    return { category: cat, subcategory: second };
  }
  return { category: cat };
}

export function Header() {
  const path = useRouterPath();
  const { category: active, subcategory: activeSub } = parseRouteFilter(path);
  const activePage = getActivePage(path);
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const introDone = useIntroDone();
  const { expandedOverlapsRail } = useProjectExpanded();
  const [searchOpen, setSearchOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState<FilterKey | null>(null);
  const [closed, setClosed] = useState<FilterKey | null>(null);

  useEffect(() => {
    setClosed(null);
    setDrawerOpen(false);
    const { category } = parseRouteFilter(path);
    setDrawerExpanded(
      category !== "all" && category !== "updates" && categoryHasSubcategories(category as Category)
        ? category
        : null,
    );
  }, [path]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        const target = e.target as HTMLElement | null;
        if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };

  const handleDisciplineClick = (f: { key: FilterKey; href: string }) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (active === f.key && !activePage) {
      navigate("/");
    } else {
      setClosed(null);
      navigate(f.href);
    }
  };

  const handlePageClick = (p: { key: string; href: string }) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (activePage === p.key) {
      navigate("/");
    } else {
      navigate(p.href);
    }
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setDrawerOpen(false);
    const footer = document.getElementById("site-footer");
    if (footer) {
      footer.scrollIntoView({ behavior: "smooth" });
    }
    window.dispatchEvent(new CustomEvent("arengcon:open-contact"));
  };

  // On desktop, show hamburger instead of side rail only while an expanded
  // project's rect overlaps the rail's viewport zone. Once you scroll past
  // the expanded row, the rail returns.
  const showHamburger = expandedOverlapsRail;

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 bg-paper/95 backdrop-blur">
        <div className="relative mx-auto flex w-full items-center justify-between gap-4 px-5 py-4 desk:px-8 desk:py-5">
          <a
            href="/"
            onClick={go("/")}
            aria-label="Arengcon home"
            className="flex items-center gap-2.5 desk:gap-3"
          >
            {introDone ? (
              <motion.div
                layoutId="brand-mark"
                transition={{ layout: SIZE }}
                className="flex items-center gap-2.5 desk:gap-3"
              >
                <Logo className="h-8 w-8 desk:h-10 desk:w-10" priority />
                <div className="flex flex-col">
                  <span className="font-bank text-[16px] font-medium uppercase leading-none tracking-[0.04em] desk:text-[22px]">
                    Arengcon
                  </span>
                  <span className="hidden desk:block text-[7px] uppercase tracking-[0.28em] text-muted mt-1">
                    a design &amp; construction company
                  </span>
                </div>
              </motion.div>
            ) : (
              <span aria-hidden className="block h-8 w-[110px] desk:h-10 desk:w-[200px]" />
            )}
          </a>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="grid h-9 w-9 place-items-center rounded-full transition-colors duration-200 hover:bg-ink/[0.06]"
            >
              <SearchIcon />
            </button>
            <button
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="grid h-9 w-9 place-items-center rounded-full transition-colors duration-200 hover:bg-ink/[0.06]"
            >
              <ThemeIcon dark={theme === "dark"} />
            </button>
            {/* Hamburger: always shown on mobile/tablet; shown on desktop only when a project is expanded */}
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation"
              className={clsx(
                "grid h-9 w-9 place-items-center rounded-full transition-colors duration-200 hover:bg-ink/[0.06]",
                showHamburger ? "" : "desk:hidden",
              )}
            >
              <HamburgerIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Desktop side rail — hidden only while an expanded project overlaps the rail's zone */}
      {!expandedOverlapsRail && (
        <aside className="pointer-events-none fixed left-6 top-[200px] z-40 hidden desk:block desk:left-12">
          <ul className="flex flex-col">
            {DISCIPLINE_FILTERS.map((f) => {
              const isActive = active === f.key && !activePage;
              const hasSubs =
                f.key !== "all" &&
                f.key !== "updates" &&
                categoryHasSubcategories(f.key as Category);
              const showSubs = hasSubs && isActive && closed !== f.key;
              const onCatClick = (e: React.MouseEvent) => {
                e.preventDefault();
                if (isActive && hasSubs) {
                  setClosed((prev) => (prev === f.key ? null : f.key));
                } else {
                  handleDisciplineClick(f)(e);
                }
              };
              return (
                <li key={f.key} className="flex flex-col">
                  <a
                    href={f.href}
                    onClick={onCatClick}
                    className={clsx(
                      "pointer-events-auto relative flex items-center py-2.5 text-[11.5px] font-medium uppercase tracking-[0.18em] transition-colors duration-200",
                      isActive ? "text-ink" : "text-muted hover:text-ink",
                    )}
                  >
                    {isActive && !activeSub && (
                      <motion.span
                        layoutId="filter-rail-mark"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute -left-5 block h-[2px] w-3 bg-ink"
                      />
                    )}
                    <span>{f.label}</span>
                  </a>

                  {hasSubs && (
                    <div
                      className={clsx(
                        "grid transition-[grid-template-rows,opacity] duration-[780ms] ease-[cubic-bezier(0.45,0,0.55,1)]",
                        showSubs ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="min-h-0 overflow-hidden">
                      <ul className="ml-1 mt-1 flex flex-col border-l border-line/60 pl-4">
                        {SUBCATEGORIES[f.key as Category].map((sub) => {
                          const isSubActive = activeSub === sub.slug && isActive;
                          const subHref = `${f.href}/${sub.slug}`;
                          return (
                            <li key={sub.slug}>
                              <a
                                href={subHref}
                                onClick={go(subHref)}
                                className={clsx(
                                  "pointer-events-auto relative block py-1.5 text-[10.5px] tracking-[0.06em] transition-colors duration-200",
                                  isSubActive ? "text-ink" : "text-muted/80 hover:text-ink",
                                )}
                              >
                                {isSubActive && (
                                  <motion.span
                                    layoutId="filter-rail-mark"
                                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                                    className="absolute -left-[21px] top-1/2 block h-[2px] w-2.5 -translate-y-1/2 bg-ink"
                                  />
                                )}
                                {sub.label}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Page links separator */}
          <div className="my-5 h-px w-8 bg-line" />

          <ul className="flex flex-col">
            {PAGE_LINKS.map((p) => {
              const isActive = activePage === p.key;
              return (
                <li key={p.key}>
                  <a
                    href={p.href}
                    onClick={handlePageClick(p)}
                    className={clsx(
                      "pointer-events-auto relative flex items-center py-2.5 text-[11.5px] font-medium uppercase tracking-[0.18em] transition-colors duration-200",
                      isActive ? "text-ink" : "text-muted hover:text-ink",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="filter-rail-mark"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        className="absolute -left-5 block h-[2px] w-3 bg-ink"
                      />
                    )}
                    {p.label}
                  </a>
                </li>
              );
            })}
            <li>
              <a
                href="#contact"
                onClick={handleContactClick}
                className="pointer-events-auto flex items-center py-2.5 text-[11.5px] font-medium uppercase tracking-[0.18em] text-muted transition-colors duration-200 hover:text-ink"
              >
                Contact
              </a>
            </li>
          </ul>
        </aside>
      )}

      {/* Mobile/tablet + expanded-state nav drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="drawer-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-ink/25"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.nav
              key="drawer-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 z-[70] flex h-full w-72 flex-col bg-paper px-8 py-8"
            >
              <button
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation"
                className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full transition-colors duration-200 hover:bg-ink/[0.06]"
              >
                <XIcon />
              </button>

              <div className="mb-8 mt-2">
                <span className="font-bank text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
                  Navigation
                </span>
              </div>

              {/* Disciplines */}
              <ul className="flex flex-col">
                {DISCIPLINE_FILTERS.map((f) => {
                  const isActive = active === f.key && !activePage;
                  const hasSubs =
                    f.key !== "all" &&
                    f.key !== "updates" &&
                    categoryHasSubcategories(f.key as Category);
                  const isOpen = drawerExpanded === f.key;

                  return (
                    <li key={f.key}>
                      <button
                        onClick={() => {
                          if (hasSubs) {
                            setDrawerExpanded(isOpen ? null : f.key);
                            if (!isActive) navigate(f.href);
                          } else {
                            if (isActive) navigate("/");
                            else navigate(f.href);
                            setDrawerOpen(false);
                          }
                        }}
                        className={clsx(
                          "flex w-full items-center justify-between py-3 text-left text-[12px] font-medium uppercase tracking-[0.18em] transition-colors duration-200",
                          isActive ? "text-ink" : "text-muted hover:text-ink",
                        )}
                      >
                        <span className="relative pl-5">
                          {isActive && (
                            <span className="absolute left-0 top-1/2 block h-[2px] w-2.5 -translate-y-1/2 bg-ink" />
                          )}
                          {f.label}
                        </span>
                        {hasSubs && (
                          <motion.span
                            animate={{ rotate: isOpen ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="shrink-0 text-muted"
                          >
                            <ChevronRightIcon />
                          </motion.span>
                        )}
                      </button>

                      {hasSubs && (
                        <div
                          className={clsx(
                            "grid transition-[grid-template-rows,opacity] duration-[400ms] ease-[cubic-bezier(0.45,0,0.55,1)]",
                            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                          )}
                        >
                          <div className="min-h-0 overflow-hidden">
                          <ul className="mb-2 ml-5 border-l border-line/60 pl-4">
                            {SUBCATEGORIES[f.key as Category].map((sub) => {
                              const subHref = `${f.href}/${sub.slug}`;
                              return (
                                <li key={sub.slug}>
                                  <a
                                    href={subHref}
                                    onClick={(e) => { go(subHref)(e); setDrawerOpen(false); }}
                                    className="block py-2 text-[11px] tracking-[0.06em] text-muted/80 transition-colors duration-200 hover:text-ink"
                                  >
                                    {sub.label}
                                  </a>
                                </li>
                              );
                            })}
                          </ul>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>

              {/* Separator */}
              <div className="my-4 h-px bg-line" />

              {/* Page links */}
              <ul className="flex flex-col">
                {PAGE_LINKS.map((p) => {
                  const isActive = activePage === p.key;
                  return (
                    <li key={p.key}>
                      <button
                        onClick={() => {
                          if (isActive) navigate("/");
                          else navigate(p.href);
                          setDrawerOpen(false);
                        }}
                        className={clsx(
                          "flex w-full items-center py-3 text-left text-[12px] font-medium uppercase tracking-[0.18em] transition-colors duration-200",
                          isActive ? "text-ink" : "text-muted hover:text-ink",
                        )}
                      >
                        <span className="relative pl-5">
                          {isActive && (
                            <span className="absolute left-0 top-1/2 block h-[2px] w-2.5 -translate-y-1/2 bg-ink" />
                          )}
                          {p.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
                <li>
                  <button
                    onClick={handleContactClick}
                    className="flex w-full items-center py-3 pl-5 text-left text-[12px] font-medium uppercase tracking-[0.18em] text-muted transition-colors duration-200 hover:text-ink"
                  >
                    Contact
                  </button>
                </li>
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor" aria-hidden>
      <rect width="16" height="1.5" rx="0.75" />
      <rect y="4.75" width="16" height="1.5" rx="0.75" />
      <rect y="9.5" width="16" height="1.5" rx="0.75" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ThemeIcon({ dark }: { dark: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {dark ? (
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      ) : (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2m-7.07-14.07 1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2m-4.93-7.07-1.41 1.41M6.34 17.66l-1.41 1.41" />
        </>
      )}
    </svg>
  );
}
