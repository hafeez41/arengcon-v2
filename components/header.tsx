"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "./logo";
import { useTheme } from "./theme-provider";
import { useNavigate, useRouterPath } from "./spa-router";
import { useIntroDone } from "./intro-context";
import { SearchOverlay } from "./search-overlay";
import {
  type Category,
  SUBCATEGORIES,
  categoryHasSubcategories,
} from "@/lib/projects";

const MORPH = { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const };
const FLOAT = { duration: 0.85, ease: [0.22, 1, 0.36, 1] as const };

export type FilterKey = "all" | Category | "updates";

export type RouteFilter = {
  category: FilterKey;
  subcategory?: string;
};

const FILTERS: { key: FilterKey; label: string; href: string }[] = [
  { key: "arch", label: "Architecture", href: "/architecture" },
  { key: "int", label: "Interiors", href: "/interiors" },
  { key: "cons", label: "Construction", href: "/construction" },
  { key: "land", label: "Landscaping", href: "/landscaping" },
  { key: "updates", label: "Updates", href: "/updates" },
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

export function FILTER_FROM_PATH(path: string): FilterKey {
  return parseRouteFilter(path).category;
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

function labelFor(f: FilterKey): string {
  if (f === "arch") return "Architecture";
  if (f === "int") return "Interiors";
  if (f === "cons") return "Construction";
  if (f === "land") return "Landscaping";
  if (f === "updates") return "Updates";
  return "All work";
}

export function Header() {
  const path = useRouterPath();
  const { category: active, subcategory: activeSub } = parseRouteFilter(path);
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const introDone = useIntroDone();
  const [searchOpen, setSearchOpen] = useState(false);

  // Local override so the user can manually close the active category's
  // dropdown without changing the URL. Reset whenever the path changes.
  const [closed, setClosed] = useState<FilterKey | null>(null);
  useEffect(() => {
    setClosed(null);
  }, [path]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        const target = e.target as HTMLElement | null;
        if (target?.tagName === "INPUT" || target?.tagName === "TEXTAREA") return;
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(href);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 bg-paper/95 backdrop-blur">
        <div className="relative mx-auto flex w-full items-center justify-between gap-4 px-5 py-4 md:px-8 md:py-5">
          <a
            href="/"
            onClick={go("/")}
            aria-label="Arengcon home"
            className="flex items-center gap-2.5 md:gap-4"
          >
            {introDone ? (
              <motion.div
                layoutId="brand-mark"
                transition={{ layout: MORPH }}
                className="flex items-center gap-2.5 md:gap-4"
              >
                <Logo className="h-9 w-9 md:h-16 md:w-16" priority />
                <span className="font-bank text-[18px] font-medium uppercase leading-none tracking-[0.04em] md:text-[42px]">
                  Arengcon
                </span>
              </motion.div>
            ) : (
              <span aria-hidden className="block h-9 w-[120px] md:h-16 md:w-[260px]" />
            )}
          </a>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="grid h-9 w-9 place-items-center rounded-full transition-colors duration-200 hover:bg-ink/[0.06]"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
            <button
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="grid h-9 w-9 place-items-center rounded-full transition-colors duration-200 hover:bg-ink/[0.06]"
            >
              <ThemeIcon dark={theme === "dark"} />
            </button>
          </div>
        </div>

        <nav className="flex items-center justify-between gap-2 overflow-x-auto px-4 pb-3 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {FILTERS.map((f) => (
            <a
              key={f.key}
              href={f.href}
              onClick={go(f.href)}
              className={clsx(
                "relative whitespace-nowrap text-[9px] uppercase tracking-[0.1em] transition-colors",
                active === f.key ? "text-ink" : "text-muted",
              )}
            >
              {f.label}
              {active === f.key && (
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-ink" />
              )}
            </a>
          ))}
        </nav>
      </header>

      {/* Desktop side rail — categories + animated subcategory tree. */}
      <aside className="pointer-events-none fixed left-6 top-[200px] z-40 hidden md:block md:left-12">
        <ul className="flex flex-col">
          {FILTERS.map((f) => {
            const isActive = active === f.key;
            const hasSubs =
              f.key !== "all" &&
              f.key !== "updates" &&
              categoryHasSubcategories(f.key as Category);
            // Auto-show when the category is active in the URL, but allow
            // the user to override by clicking the parent again.
            const showSubs = hasSubs && isActive && closed !== f.key;
            const onCatClick = (e: React.MouseEvent) => {
              e.preventDefault();
              if (isActive && hasSubs) {
                // Toggle the dropdown without changing the URL.
                setClosed((prev) => (prev === f.key ? null : f.key));
              } else {
                setClosed(null);
                navigate(f.href);
              }
            };
            return (
              <li key={f.key} className="flex flex-col">
                <a
                  href={f.href}
                  onClick={onCatClick}
                  className={clsx(
                    "pointer-events-auto relative flex items-center py-3 text-[12.5px] font-medium uppercase tracking-[0.18em] transition-colors duration-200",
                    isActive ? "text-ink" : "text-muted hover:text-ink",
                  )}
                >
                  {isActive && !activeSub && (
                    <motion.span
                      layoutId="filter-rail-mark"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 32,
                      }}
                      className="absolute -left-5 block h-[2px] w-3 bg-ink"
                    />
                  )}
                  <span>{f.label}</span>
                </a>

                {hasSubs && (
                  <motion.div
                    initial={false}
                    animate={{
                      height: showSubs ? "auto" : 0,
                      opacity: showSubs ? 1 : 0,
                    }}
                    transition={FLOAT}
                    style={{ overflow: "hidden" }}
                  >
                    <ul className="ml-1 mt-1 flex flex-col border-l border-line/60 pl-4">
                      {SUBCATEGORIES[f.key as Category].map((sub) => {
                        const isSubActive = activeSub === sub.slug;
                        const subHref = `${f.href}/${sub.slug}`;
                        return (
                          <li key={sub.slug}>
                            <a
                              href={subHref}
                              onClick={go(subHref)}
                              className={clsx(
                                "pointer-events-auto relative block py-1.5 text-[11px] tracking-[0.06em] transition-colors duration-200",
                                isSubActive
                                  ? "text-ink"
                                  : "text-muted/80 hover:text-ink",
                              )}
                            >
                              {isSubActive && (
                                <motion.span
                                  layoutId="filter-rail-mark"
                                  transition={{
                                    type: "spring",
                                    stiffness: 380,
                                    damping: 32,
                                  }}
                                  className="absolute -left-[21px] top-1/2 block h-[2px] w-2.5 -translate-y-1/2 bg-ink"
                                />
                              )}
                              {sub.label}
                            </a>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                )}
              </li>
            );
          })}
        </ul>
      </aside>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

function ThemeIcon({ dark }: { dark: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {dark ? (
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      ) : (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m4.93 19.07 1.41-1.41" />
          <path d="m17.66 6.34 1.41-1.41" />
        </>
      )}
    </svg>
  );
}
