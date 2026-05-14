"use client";

import Lenis from "lenis";
import { useEffect, type ReactNode } from "react";

/**
 * Global smooth-scroll layer. Tuned for "slow and weighted" — wheelMultiplier
 * under 1 means each tick travels slightly LESS than native, then glides to
 * settle. Cubic ease-out lands soft. No JS scrollTo-on-expand (intentionally).
 *
 * Mark any nested overflow-x-auto / overflow-y-auto scroller with
 * `data-lenis-prevent` so Lenis hands wheel events back to native there.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      smoothWheel: true,
      orientation: "vertical",
      wheelMultiplier: 0.85,
      touchMultiplier: 1.4,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });

    let rafId = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
