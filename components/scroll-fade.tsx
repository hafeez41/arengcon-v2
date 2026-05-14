"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

/**
 * Wraps a row so opacity tracks the user's scroll position — fades in as the
 * row crosses into view. When `disabled` (e.g. for an expanded project row),
 * skips the effect entirely so the row sits at full size at its CSS position.
 */
export function ScrollFade({
  children,
  disabled = false,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 92%", "start 55%"],
  });
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);

  if (disabled) return <>{children}</>;

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className="will-change-transform"
    >
      {children}
    </motion.div>
  );
}
