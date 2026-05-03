"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";

type Ctx = { lenis: Lenis | null };
const LenisCtx = createContext<Ctx>({ lenis: null });

export function useLenis() {
  return useContext(LenisCtx).lenis;
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      lerp: 0.1,
    });
    setLenis(instance);

    let raf = 0;
    const tick = (time: number) => {
      instance.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <LenisCtx.Provider value={{ lenis }}>{children}</LenisCtx.Provider>
  );
}
