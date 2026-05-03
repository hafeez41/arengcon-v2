"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { Logo } from "./logo";
import { AnimatePresence, motion } from "framer-motion";
import { SearchOverlay } from "./search-overlay";
import { useTheme } from "./theme-provider";
import { useNavigate } from "./spa-router";
import { useModal } from "./modal-context";

type NavKey = "arch" | "int" | "cons" | "updates";

const NAV: { key: NavKey; label: string }[] = [
  { key: "arch", label: "Architecture" },
  { key: "int", label: "Interior Design" },
  { key: "cons", label: "Construction" },
  { key: "updates", label: "Updates" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const { openCategory, openUpdates } = useModal();

  const openNav = (key: NavKey) => {
    if (key === "updates") openUpdates();
    else openCategory(key);
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || e.key === "/") {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    navigate(href);
  };

  return (
    <>
      <header
        className={clsx(
          "fixed inset-x-0 top-0 z-50 transition-[background,border-color] duration-300",
          scrolled
            ? "bg-paper border-b border-line"
            : "bg-paper/0 border-b border-transparent",
        )}
      >
        <div className="mx-auto flex w-full max-w-[1800px] items-center justify-between px-4 py-3 md:px-8 md:py-3.5">
          <a
            href="/"
            onClick={go("/")}
            className="flex items-center gap-2.5 md:gap-3"
            aria-label="Arengcon home"
            data-cursor="hover"
          >
            <Logo className="h-7 w-7 md:h-9 md:w-9" priority />
            <span className="font-bank whitespace-nowrap text-[13px] font-medium tracking-[0.16em] uppercase md:text-[15px]">
              Arengcon
            </span>
          </a>

          <nav className="hidden items-center gap-7 md:flex lg:gap-9">
            {NAV.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => openNav(item.key)}
                className="hover-line whitespace-nowrap text-[10.5px] font-medium uppercase tracking-[0.14em]"
                data-cursor="hover"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4 md:gap-5">
            <button
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-ink/5"
              data-cursor="hover"
            >
              <ThemeIcon dark={theme === "dark"} />
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="hover-line whitespace-nowrap text-[10.5px] font-medium uppercase tracking-[0.14em]"
              data-cursor="hover"
            >
              Search
            </button>
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="md:hidden whitespace-nowrap text-[10.5px] font-medium uppercase tracking-[0.14em]"
              data-cursor="hover"
            >
              Menu
            </button>
          </div>
        </div>
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.7, ease: [0.83, 0, 0.17, 1] }}
            className="fixed inset-0 z-[80] bg-ink text-paper"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between px-4 py-3 md:px-8 md:py-3.5">
                <a
                  href="/"
                  onClick={go("/")}
                  className="flex items-center gap-2.5 md:gap-3"
                  data-cursor="hover"
                >
                  <Logo className="h-7 w-7 md:h-9 md:w-9" invert />
                  <span className="font-bank text-[13px] font-medium tracking-wider2 uppercase md:text-[15px]">
                    Arengcon
                  </span>
                </a>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="text-[11px] font-medium uppercase tracking-wider2"
                  data-cursor="hover"
                >
                  Close
                </button>
              </div>
              <nav className="flex flex-1 flex-col items-start justify-center gap-3 px-5 md:px-10">
                {NAV.map((item, i) => (
                  <motion.div
                    key={item.key}
                    initial={{ y: 60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: 0.18 + i * 0.07,
                      duration: 0.7,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        openNav(item.key);
                      }}
                      className="font-bank text-5xl font-medium uppercase tracking-tight"
                      data-cursor="hover"
                    >
                      {item.label}
                    </button>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.7 }}
                  className="mt-8 flex flex-col gap-3 text-[11px] uppercase tracking-wider2 text-paper/60"
                >
                  <a
                    href="/about"
                    onClick={go("/about")}
                    className="hover-line"
                    data-cursor="hover"
                  >
                    About
                  </a>
                  <a
                    href="/contact"
                    onClick={go("/contact")}
                    className="hover-line"
                    data-cursor="hover"
                  >
                    Contact
                  </a>
                </motion.div>
              </nav>
              <div className="px-5 pb-6 pt-4 text-[10px] uppercase tracking-wider2 text-paper/50 md:px-10">
                © 2013 Arengcon
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ThemeIcon({ dark }: { dark: boolean }) {
  return (
    <svg
      width="16"
      height="16"
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
