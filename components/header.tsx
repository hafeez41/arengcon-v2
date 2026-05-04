"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { motion } from "framer-motion";
import { Logo } from "./logo";
import { useTheme } from "./theme-provider";
import { useNavigate, useRouterPath } from "./spa-router";
import { useIntroDone } from "./intro-context";
import { SearchOverlay } from "./search-overlay";
import type { Category } from "@/lib/projects";

const MORPH = { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const };

type FilterKey = "all" | Category | "news";

const FILTERS: { key: FilterKey; label: string; href: string }[] = [
  { key: "arch", label: "Architecture", href: "/architecture" },
  { key: "int", label: "Interiors", href: "/interiors" },
  { key: "cons", label: "Construction", href: "/construction" },
  { key: "news", label: "News", href: "/news" },
];

export function FILTER_FROM_PATH(path: string): FilterKey {
  if (path.startsWith("/architecture")) return "arch";
  if (path.startsWith("/interiors")) return "int";
  if (path.startsWith("/construction")) return "cons";
  if (path.startsWith("/news")) return "news";
  return "all";
}

function labelFor(f: FilterKey): string {
  if (f === "arch") return "Architecture";
  if (f === "int") return "Interiors";
  if (f === "cons") return "Construction";
  if (f === "news") return "News";
  return "All work";
}

export function Header() {
  const path = useRouterPath();
  const active = FILTER_FROM_PATH(path);
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const introDone = useIntroDone();
  const [searchOpen, setSearchOpen] = useState(false);

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
            className="flex items-center gap-2.5"
          >
            {introDone ? (
              <motion.div
                layoutId="brand-mark"
                transition={{ layout: MORPH }}
                className="flex items-center gap-2.5"
              >
                <Logo className="h-7 w-7 md:h-8 md:w-8" priority />
                <span className="text-[15px] font-medium tracking-tight md:text-[16px]">
                  Arengcon
                </span>
              </motion.div>
            ) : (
              // Reserve the same space during splash so layout doesn't jump
              <span aria-hidden className="block h-7 w-[110px] md:h-8 md:w-[120px]" />
            )}
          </a>

          <nav className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-9 md:flex lg:gap-14">
            {FILTERS.map((f) => (
              <a
                key={f.key}
                href={f.href}
                onClick={go(f.href)}
                className={clsx(
                  "relative text-[11px] font-medium uppercase tracking-[0.18em] transition-colors md:text-[12px]",
                  active === f.key ? "text-ink" : "text-muted hover:text-ink",
                )}
              >
                {f.label}
                {active === f.key && (
                  <motion.span
                    layoutId="filter-underline"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute -bottom-2 left-0 right-0 h-px bg-ink"
                  />
                )}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="grid h-8 w-8 place-items-center transition-colors hover:bg-ink/5"
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
            <a
              href="/"
              onClick={go("/")}
              className="hidden text-[10.5px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-ink md:inline"
            >
              {labelFor(active)}
            </a>
            <button
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="grid h-8 w-8 place-items-center transition-colors hover:bg-ink/5"
            >
              <ThemeIcon dark={theme === "dark"} />
            </button>
          </div>
        </div>

        <nav className="flex items-center justify-center gap-5 px-4 pb-3 md:hidden">
          {FILTERS.map((f) => (
            <a
              key={f.key}
              href={f.href}
              onClick={go(f.href)}
              className={clsx(
                "relative text-[10px] uppercase tracking-[0.14em] transition-colors",
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
