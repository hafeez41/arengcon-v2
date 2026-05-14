"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Header } from "./header";
import { IntroSplash } from "./intro-splash";
import { IntroProvider } from "./intro-context";
import { ThemeProvider } from "./theme-provider";
import { SpaRouterProvider, useRouterPath } from "./spa-router";
import { resolveView } from "./views";
import { ProjectExpandedProvider } from "./project-expanded-context";
import { LenisProvider } from "./lenis-provider";

export function SpaShell({ initialPath }: { initialPath: string }) {
  const [introDone, setIntroDone] = useState(false);
  const [splashRemoved, setSplashRemoved] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.history.state?.spaInit !== true) {
      window.history.replaceState({ spaInit: true }, "", window.location.pathname);
    }
  }, []);

  return (
    <ThemeProvider>
      <SpaRouterProvider initialPath={initialPath}>
        <ProjectExpandedProvider>
          <LenisProvider>
          <IntroProvider done={introDone}>
            {!splashRemoved && (
              <IntroSplash
                onLeaveStart={() => setIntroDone(true)}
                onLeaveEnd={() => setSplashRemoved(true)}
              />
            )}
            <Header />
            <main className="relative">
              <RouteOutlet />
            </main>
          </IntroProvider>
          </LenisProvider>
        </ProjectExpandedProvider>
      </SpaRouterProvider>
    </ThemeProvider>
  );
}

function RouteOutlet() {
  const path = useRouterPath();
  // Key by view identity, not full URL — so changing filter or subcategory
  // (which still renders HomeView) doesn't remount the whole tree and
  // doesn't fight with the in-place layout animations inside ProjectsList.
  const clean = path.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";
  const viewKey =
    clean === "/about" || clean === "/people" || clean === "/services"
      ? clean
      : "home";

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={viewKey}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      >
        {resolveView(path)}
      </motion.div>
    </AnimatePresence>
  );
}
