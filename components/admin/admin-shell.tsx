"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProjectsSection } from "./projects-section";
import { UpdatesSection } from "./updates-section";
import { ContactSection } from "./contact-section";
import { SettingsSection } from "./settings-section";
import { LoginScreen } from "./login-screen";
import { Cursor } from "../cursor";
import { ThemeProvider, useTheme } from "../theme-provider";
import { useAdminData } from "@/lib/admin-store";
import { isAuthed, setAuthed } from "@/lib/auth-store";

const TABS = [
  { key: "projects", label: "Projects" },
  { key: "updates", label: "Updates" },
  { key: "contact", label: "Contact" },
  { key: "settings", label: "Settings" },
] as const;

type Tab = (typeof TABS)[number]["key"];

export function AdminShell() {
  return (
    <ThemeProvider>
      <AdminInner />
    </ThemeProvider>
  );
}

function AdminInner() {
  const [tab, setTab] = useState<Tab>("projects");
  const [authReady, setAuthReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const { loaded, projects, updates, contact } = useAdminData();

  useEffect(() => {
    setSignedIn(isAuthed());
    setAuthReady(true);
  }, []);

  if (!authReady) {
    return (
      <>
        <Cursor />
        <div className="flex min-h-screen items-center justify-center bg-paper text-[10px] uppercase tracking-[0.18em] text-ink/45">
          Loading…
        </div>
      </>
    );
  }

  if (!signedIn) {
    return (
      <>
        <Cursor />
        <LoginScreen onSuccess={() => setSignedIn(true)} />
      </>
    );
  }

  const onSignOut = () => {
    setAuthed(false);
    setSignedIn(false);
    setTab("projects");
  };

  return (
    <div className="min-h-screen bg-paper text-ink transition-colors duration-300">
      <Cursor />
      <AdminHeader tab={tab} setTab={setTab} onSignOut={onSignOut} />

      {!loaded ? (
        <div className="px-5 py-16 text-center text-[11px] uppercase tracking-[0.18em] text-ink/45 md:px-10">
          Loading…
        </div>
      ) : (
        <main className="mx-auto w-full max-w-[1400px] px-5 py-10 md:px-8 md:py-14">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              {tab === "projects" && <ProjectsSection projects={projects} />}
              {tab === "updates" && <UpdatesSection updates={updates} />}
              {tab === "contact" && <ContactSection contact={contact} />}
              {tab === "settings" && <SettingsSection onSignOut={onSignOut} />}
            </motion.div>
          </AnimatePresence>
        </main>
      )}

      <footer className="border-t border-line">
        <div className="mx-auto w-full max-w-[1400px] px-5 py-6 text-[10px] uppercase tracking-[0.18em] text-ink/45 md:px-8">
          Stored locally in this browser · Use the same device for your edits
        </div>
      </footer>
    </div>
  );
}

function AdminHeader({
  tab,
  setTab,
  onSignOut,
}: {
  tab: Tab;
  setTab: (t: Tab) => void;
  onSignOut: () => void;
}) {
  const { theme, toggle } = useTheme();
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper/85 backdrop-blur transition-colors duration-300">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-3 md:px-8 md:py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 md:gap-4">
            <a
              href="/"
              className="font-bank text-[13px] font-medium uppercase tracking-[0.18em] transition-opacity duration-200 hover:opacity-70 md:text-[14px]"
              data-cursor="hover"
            >
              Arengcon
            </a>
            <span className="hidden text-[10px] uppercase tracking-[0.18em] text-ink/45 sm:inline">
              · Admin
            </span>
          </div>

          <nav className="relative hidden items-center gap-1 rounded-full border border-line bg-paper/40 p-1 md:flex md:gap-1.5">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                data-cursor="hover"
                className={
                  "relative rounded-full px-3 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.14em] transition-colors duration-200 md:px-4 " +
                  (tab === t.key ? "text-paper" : "text-ink/55 hover:text-ink")
                }
              >
                {tab === t.key && (
                  <motion.span
                    layoutId="admin-tab-pill"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-0 -z-10 rounded-full bg-ink"
                  />
                )}
                <span className="relative">{t.label}</span>
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1 md:gap-3">
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              data-cursor="hover"
              className="grid h-8 w-8 place-items-center rounded-full transition-colors duration-200 hover:bg-ink/5"
            >
              <ThemeIcon dark={theme === "dark"} />
            </button>
            <a
              href="/"
              data-cursor="hover"
              aria-label="View site"
              className="grid h-8 w-8 place-items-center rounded-full transition-colors duration-200 hover:bg-ink/5 md:hidden"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3h7v7" />
                <path d="M21 3l-9 9" />
                <path d="M21 14v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h6" />
              </svg>
            </a>
            <a
              href="/"
              data-cursor="hover"
              className="hidden text-[10.5px] uppercase tracking-[0.14em] text-ink/55 transition-colors duration-200 hover:text-ink md:inline"
            >
              View site →
            </a>
            <button
              type="button"
              onClick={onSignOut}
              data-cursor="hover"
              aria-label="Sign out"
              className="grid h-8 w-8 place-items-center rounded-full transition-colors duration-200 hover:bg-ink/5 md:hidden"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </button>
            <button
              type="button"
              onClick={onSignOut}
              data-cursor="hover"
              className="hidden text-[10.5px] uppercase tracking-[0.14em] text-ink/55 transition-colors duration-200 hover:text-ink md:inline"
            >
              Sign out
            </button>
          </div>
        </div>

        <nav className="relative mt-3 grid grid-cols-4 gap-1 rounded-full border border-line bg-paper/40 p-1 md:hidden">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              data-cursor="hover"
              className={
                "relative rounded-full px-1 py-1.5 text-center text-[10px] font-medium uppercase tracking-[0.12em] transition-colors duration-200 " +
                (tab === t.key ? "text-paper" : "text-ink/55 hover:text-ink")
              }
            >
              {tab === t.key && (
                <motion.span
                  layoutId="admin-tab-pill-mobile"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  className="absolute inset-0 -z-10 rounded-full bg-ink"
                />
              )}
              <span className="relative">{t.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
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
