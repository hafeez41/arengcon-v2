"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Header } from "./header";
import { Footer } from "./footer";
import { Cursor } from "./cursor";
import { IntroSplash } from "./intro-splash";
import { LenisProvider } from "./lenis-provider";
import { ThemeProvider } from "./theme-provider";
import { SpaRouterProvider, useRouterPath } from "./spa-router";
import { resolveView } from "./views";
import { IntroProvider } from "./intro-context";
import { ModalProvider } from "./modal-context";
import { ProjectModal } from "./project-modal";

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
      <LenisProvider>
        <SpaRouterProvider initialPath={initialPath}>
          <ModalProvider>
            <IntroProvider done={introDone}>
              {!splashRemoved && (
                <IntroSplash
                  onLeaveStart={() => setIntroDone(true)}
                  onLeaveEnd={() => setSplashRemoved(true)}
                />
              )}
              <Cursor />
              <Header />
              <main className="relative">
                <RouteOutlet />
              </main>
              <Footer />
              <ProjectModal />
            </IntroProvider>
          </ModalProvider>
        </SpaRouterProvider>
      </LenisProvider>
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
        transition={{ duration: 0.32, ease: [0.4, 0, 0.2, 1] }}
      >
        {resolveView(path)}
      </motion.div>
    </AnimatePresence>
  );
}
