"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./logo";

const HOLD_MS = 1500;
const FADE_MS = 850;

export function IntroSplash({
  onLeaveStart,
  onLeaveEnd,
}: {
  onLeaveStart?: () => void;
  onLeaveEnd?: () => void;
}) {
  const [phase, setPhase] = useState<"in" | "hold" | "leaving">("in");
  const onLeaveStartRef = useRef(onLeaveStart);
  const onLeaveEndRef = useRef(onLeaveEnd);
  onLeaveStartRef.current = onLeaveStart;
  onLeaveEndRef.current = onLeaveEnd;

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const inT = window.setTimeout(() => setPhase("hold"), 50);
    const leaveT = window.setTimeout(() => {
      setPhase("leaving");
      onLeaveStartRef.current?.();
    }, HOLD_MS);
    const endT = window.setTimeout(() => {
      document.body.style.overflow = "";
      onLeaveEndRef.current?.();
    }, HOLD_MS + FADE_MS);

    return () => {
      window.clearTimeout(inT);
      window.clearTimeout(leaveT);
      window.clearTimeout(endT);
    };
  }, []);

  return (
    <>
      <motion.div
        aria-hidden
        data-arengcon-splash
        className="fixed inset-0 z-[99] bg-paper"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "leaving" ? 0 : 1 }}
        transition={{ duration: FADE_MS / 1000, ease: [0.65, 0, 0.35, 1] }}
        style={{ pointerEvents: phase === "leaving" ? "none" : "auto" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: phase === "hold" ? 1 : 0,
            y: phase === "hold" ? 0 : 8,
          }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-10 left-0 right-0 flex items-center justify-center gap-3 font-bank uppercase text-ink/55"
          style={{ fontSize: "10px", letterSpacing: "0.32em" }}
        >
          <span>Arengcon</span>
          <span className="h-px w-6 bg-ink/30" />
          <span>Est. 2008</span>
        </motion.div>
      </motion.div>

      {phase !== "leaving" && (
        <div className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center">
          <motion.div
            layoutId="brand-mark"
            transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[42vmin] w-[42vmin]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{
                opacity: phase === "in" ? 0 : 1,
                scale: phase === "in" ? 0.4 : 1,
              }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-full w-full"
            >
              <Logo className="h-full w-full" priority />
            </motion.div>
          </motion.div>
        </div>
      )}
    </>
  );
}
