"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

/**
 * Wraps a row so its opacity, lift, and scale all track the user's scroll
 * position. Below the viewport: small, faded, slightly down. As the row
 * climbs into view, it grows to its natural size and lifts to opacity 1.
 */
export function ScrollFade({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 92%", "start 55%"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1]);

  return (
    <motion.div
      ref={ref}
      style={{ opacity, scale, transformOrigin: "50% 50%" }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
}
