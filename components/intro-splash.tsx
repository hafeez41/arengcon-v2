"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./logo";

const HOLD_MS = 2200;
const FADE_MS = 1500;
const MORPH = { duration: 2.0, ease: [0.83, 0, 0.17, 1] as const };

export function IntroSplash({
  onLeaveStart,
  onLeaveEnd,
}: {
  onLeaveStart?: () => void;
  onLeaveEnd?: () => void;
}) {
  const [phase, setPhase] = useState<"in" | "hold" | "leaving">("in");
  const startRef = useRef(onLeaveStart);
  const endRef = useRef(onLeaveEnd);
  startRef.current = onLeaveStart;
  endRef.current = onLeaveEnd;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const inT = window.setTimeout(() => setPhase("hold"), 60);
    const leaveT = window.setTimeout(() => {
      setPhase("leaving");
      startRef.current?.();
    }, HOLD_MS);
    const endT = window.setTimeout(() => {
      document.body.style.overflow = "";
      endRef.current?.();
    }, HOLD_MS + FADE_MS);
    return () => {
      window.clearTimeout(inT);
      window.clearTimeout(leaveT);
      window.clearTimeout(endT);
    };
  }, []);

  return (
    <>
      {/* Backdrop softly fades out — does NOT contain the brand mark */}
      <motion.div
        aria-hidden
        data-arengcon-splash
        className="fixed inset-0 z-[99] bg-paper"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "leaving" ? 0 : 1 }}
        transition={{ duration: FADE_MS / 1000, ease: [0.83, 0, 0.17, 1] }}
        style={{ pointerEvents: phase === "leaving" ? "none" : "auto" }}
      />

      {/* Centered brand mark — sized large. Unmounts on "leaving" so the
          header's layoutId="brand-mark" picks up and animates the morph. */}
      {phase !== "leaving" && (
        <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center">
          <motion.div
            layoutId="brand-mark"
            transition={{ layout: MORPH }}
            className="flex items-center gap-4 md:gap-5"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 12 }}
              animate={{
                opacity: phase === "in" ? 0 : 1,
                scale: phase === "in" ? 0.92 : 1,
                y: phase === "in" ? 12 : 0,
              }}
              transition={{ duration: 1.6, ease: [0.83, 0, 0.17, 1] }}
              className="flex items-center gap-4 md:gap-5"
            >
              <Logo className="h-14 w-14 md:h-20 md:w-20" priority />
              <span className="text-[34px] font-medium tracking-tight md:text-[52px]">
                Arengcon
              </span>
            </motion.div>
          </motion.div>
        </div>
      )}
    </>
  );
}
