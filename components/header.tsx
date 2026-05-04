"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { Logo } from "./logo";
import { useTheme } from "./theme-provider";
import { useNavigate } from "./spa-router";
import { SearchOverlay } from "./search-overlay";

type NavGroup = {
  key: string;
  label: string;
  href: string;
  children?: { label: string; href: string }[];
};

const NAV: NavGroup[] = [
  {
    key: "projects",
    label: "Projects",
    href: "/projects",
    children: [
      { label: "Architecture", href: "/projects/architecture" },
      { label: "Interiors", href: "/projects/interiors" },
      { label: "Construction", href: "/projects/construction" },
      { label: "Landscape", href: "/projects/landscape" },
      { label: "Planning", href: "/projects/planning" },
      { label: "Products", href: "/projects/products" },
    ],
  },
  { key: "news", label: "News", href: "/news" },
  { key: "about", label: "About", href: "/about" },
  { key: "sustainability", label: "Sustainability", href: "/sustainability" },
  { key: "people", label: "People", href: "/people" },
  { key: "careers", label: "Careers", href: "/careers" },
  { key: "contact", label: "Contact", href: "/contact" },
];

const ARCHITECTURE_TOPICS = [
  "Civic",
  "Cultural",
  "Education",
  "Hospitality",
  "Residential",
  "Workplace",
  "Infrastructure",
  "Adaptive Reuse",
];

export function Header() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = mobileOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, searchOpen]);

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
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleEnter = (key: string) => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setHovered(key);
  };

  const handleLeave = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setHovered(null), 140);
  };

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMobileOpen(false);
    setHovered(null);
    navigate(href);
  };

  const projectsItem = NAV.find((n) => n.key === "projects")!;
  const showMega = hovered === "projects";

  return (
    <>
      <header
        className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md"
        onMouseLeave={handleLeave}
      >
        <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-6 px-5 py-4 md:px-8 md:py-5">
          <a
            href="/"
            onClick={go("/")}
            className="flex items-center gap-3 text-[15px] font-medium tracking-tight"
          >
            <Logo className="h-6 w-6" priority />
            <span>Arengcon</span>
          </a>

          <nav className="hidden items-center gap-7 md:flex">
            {NAV.map((item) => (
              <div
                key={item.key}
                className="relative"
                onMouseEnter={() => handleEnter(item.key)}
              >
                <a
                  href={item.href}
                  onClick={go(item.href)}
                  className="editorial-link text-[14px] tracking-tight"
                >
                  {item.label}
                </a>
              </div>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="hidden text-[13px] tracking-tight text-muted transition-colors hover:text-ink md:inline"
            >
              Search
            </button>
            <button
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-ink/5"
            >
              <ThemeIcon dark={theme === "dark"} />
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="text-[13px] tracking-tight md:hidden"
            >
              Menu
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showMega && projectsItem.children && (
            <motion.div
              key="mega"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onMouseEnter={() => handleEnter("projects")}
              onMouseLeave={handleLeave}
              className="absolute inset-x-0 top-full border-b border-line bg-paper"
            >
              <div className="mx-auto grid w-full max-w-[1600px] grid-cols-12 gap-x-6 gap-y-8 px-5 py-10 md:px-8 md:py-12">
                <div className="col-span-12 md:col-span-3">
                  <div className="eyebrow">Browse</div>
                  <ul className="mt-3 space-y-1.5">
                    {projectsItem.children.map((c) => (
                      <li key={c.href}>
                        <a
                          href={c.href}
                          onClick={go(c.href)}
                          className="editorial-link text-[15px] tracking-tight"
                        >
                          {c.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-span-12 md:col-span-3">
                  <div className="eyebrow">Architecture</div>
                  <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 md:grid-cols-1">
                    {ARCHITECTURE_TOPICS.map((t) => (
                      <li key={t}>
                        <a
                          href={`/projects/architecture/${t.toLowerCase().replace(/\s+/g, "-")}`}
                          onClick={go(`/projects/architecture/${t.toLowerCase().replace(/\s+/g, "-")}`)}
                          className="editorial-link text-[13px] text-muted transition-colors hover:text-ink"
                        >
                          {t}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="col-span-12 md:col-span-6">
                  <div className="eyebrow">Featured</div>
                  <p className="mt-3 max-w-prose text-[15px] leading-[1.55] tracking-tight">
                    Selected work across civic, cultural, and infrastructural
                    scales — from a single-span pedestrian bridge to a
                    six-line transit interchange.
                  </p>
                  <a
                    href="/projects"
                    onClick={go("/projects")}
                    className="editorial-link mt-4 inline-block text-[13px]"
                  >
                    View all projects →
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className="fixed inset-0 z-[80] bg-paper text-ink md:hidden"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <a
                href="/"
                onClick={go("/")}
                className="flex items-center gap-3 text-[15px] font-medium tracking-tight"
              >
                <Logo className="h-6 w-6" />
                <span>Arengcon</span>
              </a>
              <button
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="text-[13px] tracking-tight"
              >
                Close
              </button>
            </div>
            <nav className="px-5 py-8">
              <ul className="space-y-4">
                {NAV.map((item, i) => (
                  <motion.li
                    key={item.key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 * i, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <a
                      href={item.href}
                      onClick={go(item.href)}
                      className={clsx(
                        "block tracking-tight",
                        "text-[28px] leading-[1.1]",
                      )}
                    >
                      {item.label}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
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
