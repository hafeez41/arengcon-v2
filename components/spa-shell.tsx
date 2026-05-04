"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { Header } from "./header";
import { ThemeProvider } from "./theme-provider";
import { SpaRouterProvider, useRouterPath } from "./spa-router";
import { resolveView } from "./views";

export function SpaShell({ initialPath }: { initialPath: string }) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.history.state?.spaInit !== true) {
      window.history.replaceState({ spaInit: true }, "", window.location.pathname);
    }
  }, []);

  return (
    <ThemeProvider>
      <SpaRouterProvider initialPath={initialPath}>
        <Header />
        <main className="relative">
          <RouteOutlet />
        </main>
      </SpaRouterProvider>
    </ThemeProvider>
  );
}

function RouteOutlet() {
  const path = useRouterPath();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={path}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.24, ease: [0.4, 0, 0.2, 1] }}
      >
        {resolveView(path)}
      </motion.div>
    </AnimatePresence>
  );
}
