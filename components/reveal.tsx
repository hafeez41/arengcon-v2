"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import clsx from "clsx";

export function Reveal({
  children,
  className,
  delay = 0,
  y = 40,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once, margin: "-10% 0px -10% 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ y, opacity: 0 }}
      animate={inView ? { y: 0, opacity: 1 } : { y, opacity: 0 }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

export function MaskReveal({
  text,
  className,
  delay = 0,
  as: Tag = "span",
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: React.ElementType;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });

  return (
    <Tag className={clsx("inline-block overflow-hidden align-bottom leading-[0.95]", className)}>
      <motion.span
        ref={ref}
        className="inline-block"
        initial={{ y: "115%" }}
        animate={inView ? { y: "0%" } : { y: "115%" }}
        transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1], delay }}
      >
        {text}
      </motion.span>
    </Tag>
  );
}

export function WordsReveal({
  text,
  className,
  delay = 0,
  stagger = 0.06,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });
  const words = text.split(" ");

  return (
    <span ref={ref} className={className}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block pr-[0.25em]"
            initial={{ y: "115%" }}
            animate={inView ? { y: "0%" } : { y: "115%" }}
            transition={{
              duration: 0.95,
              ease: [0.16, 1, 0.3, 1],
              delay: delay + i * stagger,
            }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
