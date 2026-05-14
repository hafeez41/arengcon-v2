"use client";

import Lenis from "lenis";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
  type RefObject,
} from "react";

type LenisCtx = { lenisRef: RefObject<Lenis | null> };
const Ctx = createContext<LenisCtx>({ lenisRef: { current: null } });

export function useLenis() {
  return useContext(Ctx).lenisRef;
}

/**
 * Global smooth-scroll layer. Slow and weighted feel.
 * Mark any nested overflow-x/y scroller with `data-lenis-prevent` so Lenis
 * hands wheel events back to native there.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      smoothWheel: true,
      orientation: "vertical",
      wheelMultiplier: 0.85,
      touchMultiplier: 1.4,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });
    lenisRef.current = lenis;

    let rafId = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <Ctx.Provider value={{ lenisRef }}>{children}</Ctx.Provider>;
}
