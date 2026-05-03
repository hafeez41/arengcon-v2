"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const SCOPES = ["Architecture", "Interior Design", "Construction", "Adaptive Reuse"];
const STAGES = ["Concept", "Feasibility", "Pre-construction", "In construction"];

export function ContactForm() {
  const [scope, setScope] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="border-t border-line pt-8">
      <AnimatePresence mode="wait">
        {!submitted ? (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="space-y-10"
          >
            <Field label="01 — Name">
              <input
                required
                name="name"
                placeholder="Type here"
                className="w-full bg-transparent border-b border-ink/25 py-3 font-bank text-2xl font-medium uppercase tracking-tight outline-none transition-colors placeholder:text-ink/25 focus:border-ink"
              />
            </Field>

            <Field label="02 — Email">
              <input
                required
                type="email"
                name="email"
                placeholder="you@company.com"
                className="w-full bg-transparent border-b border-ink/25 py-3 font-bank text-2xl font-medium uppercase tracking-tight outline-none transition-colors placeholder:text-ink/25 focus:border-ink"
              />
            </Field>

            <Field label="03 — Scope">
              <div className="flex flex-wrap gap-2">
                {SCOPES.map((s) => (
                  <Chip key={s} active={scope === s} onClick={() => setScope(s)}>
                    {s}
                  </Chip>
                ))}
              </div>
            </Field>

            <Field label="04 — Stage">
              <div className="flex flex-wrap gap-2">
                {STAGES.map((s) => (
                  <Chip key={s} active={stage === s} onClick={() => setStage(s)}>
                    {s}
                  </Chip>
                ))}
              </div>
            </Field>

            <Field label="05 — Message">
              <textarea
                required
                name="message"
                rows={4}
                placeholder="A few sentences about the project."
                className="w-full bg-transparent border-b border-ink/25 py-3 text-base leading-relaxed outline-none transition-colors placeholder:text-ink/25 focus:border-ink resize-none"
              />
            </Field>

            <button
              type="submit"
              data-cursor="hover"
              className="group inline-flex items-center gap-3 border border-ink bg-ink px-6 py-3 text-paper transition-colors hover:bg-paper hover:text-ink"
            >
              <span className="font-bank text-[11px] font-medium uppercase tracking-wider2">
                Send the brief
              </span>
              <span className="text-[11px]">→</span>
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="text-[10px] uppercase tracking-wider2 text-ink/55">
              Received
            </div>
            <p className="mt-3 max-w-xl font-bank text-3xl font-medium uppercase leading-[1.15] tracking-tight md:text-5xl">
              Thanks. We'll be in touch within two business days.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-3 text-[10px] uppercase tracking-wider2 text-ink/45">{label}</div>
      {children}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        "border px-3 py-1.5 font-bank text-[11px] font-medium uppercase tracking-wider2 transition-colors",
        active
          ? "border-ink bg-ink text-paper"
          : "border-ink/25 text-ink/65 hover:border-ink hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
