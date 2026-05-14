"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Logo } from "./logo";

const HOLD_MS = 3000;
const FADE_MS = 800;
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

  const show = phase === "hold";

  return (
    <>
      {/* Dark full-screen backdrop */}
      <motion.div
        aria-hidden
        data-arengcon-splash
        className="fixed inset-0 z-[99] bg-[#0c0c0a]"
        initial={{ opacity: 1 }}
        animate={{ opacity: phase === "leaving" ? 0 : 1 }}
        transition={{ duration: FADE_MS / 1000, ease: [0.76, 0, 0.24, 1] }}
        style={{ pointerEvents: phase === "leaving" ? "none" : "auto" }}
      />

      {/* Subtle vertical grid lines */}
      {phase !== "leaving" && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
          style={{ opacity: 0.06 }}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute bottom-0 top-0 w-px bg-[#eeebe5]"
              style={{ left: `${(i + 1) * (100 / 6)}%` }}
            />
          ))}
        </div>
      )}

      {/* Centered content — unmounts on "leaving" so header layoutId picks up the morph */}
      {phase !== "leaving" && (
        <div className="pointer-events-none fixed inset-0 z-[101] flex flex-col items-center justify-center px-6">
          {/* Logo + wordmark inside layoutId for the morph into the header */}
          <motion.div
            layoutId="brand-mark"
            transition={{ layout: MORPH }}
            className="flex flex-col items-center"
          >
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: show ? 1 : 0.3, opacity: show ? 1 : 0 }}
              transition={{ duration: 0.65, ease: [0.34, 1.56, 0.64, 1] }}
              className="flex flex-col items-center"
            >
              <Logo
                className="h-24 w-24 sm:h-36 sm:w-36"
                invert
                priority
              />
              <div className="mt-7 overflow-hidden">
                <motion.span
                  initial={{ y: "100%" }}
                  animate={{ y: show ? "0%" : "100%" }}
                  transition={{ delay: 0.42, duration: 0.75, ease: [0.76, 0, 0.24, 1] }}
                  className="block font-bank font-medium uppercase leading-none tracking-[0.22em] text-[#eeebe5]"
                  style={{ fontSize: "clamp(2.2rem, 10vw, 6.5rem)" }}
                >
                  Arengcon
                </motion.span>
              </div>
            </motion.div>
          </motion.div>

          {/* Tagline — outside layoutId so it doesn't participate in the morph */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: show ? 1 : 0, y: show ? 0 : 8 }}
            transition={{ delay: 0.85, duration: 0.6 }}
            className="mt-5 text-center text-[10px] uppercase tracking-[0.38em] text-[#9a9690] sm:text-[12px]"
          >
            A Design &amp; Construction Company
          </motion.p>

          {/* Gold progress line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: show ? 1 : 0 }}
            transition={{ delay: 0.1, duration: 2.5, ease: "linear" }}
            className="mt-10 h-px w-[120px] origin-left bg-[#c4a877]"
          />
        </div>
      )}
    </>
  );
}
