"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { CATEGORY_LABELS } from "@/lib/projects";
import { useEffectiveProjects, useEffectiveUpdates } from "@/lib/effective-data";
import { useNavigate } from "./spa-router";

type Result = {
  type: "Project" | "Update";
  href: string;
  title: string;
  meta: string;
  haystack: string;
};

export function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { list: projectList } = useEffectiveProjects();
  const { list: updateList } = useEffectiveUpdates();

  useEffect(() => {
    if (open) {
      setQ("");
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [open]);

  const results: Result[] = useMemo(() => {
    const projectResults: Result[] = projectList.map((p) => {
      const cat = CATEGORY_LABELS[p.category]?.name ?? p.category;
      return {
        type: "Project",
        href: `/projects/${p.slug}`,
        title: p.title,
        meta: `${cat} · ${p.location} · ${p.year}`,
        haystack: [
          p.title,
          cat,
          p.subcategory,
          p.location,
          p.client,
          p.status,
          p.size,
          String(p.year),
          p.summary,
          ...(p.description ?? []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase(),
      };
    });
    const updateResults: Result[] = updateList.map((u) => ({
      type: "Update",
      href: `/updates/${u.slug}`,
      title: u.title,
      meta: `${u.kind} · ${new Date(u.date).getFullYear()}`,
      haystack: [
        u.title,
        u.kind,
        u.excerpt,
        ...(u.body ?? []),
        new Date(u.date).getFullYear().toString(),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase(),
    }));
    const all = [...projectResults, ...updateResults];
    const needle = q.trim().toLowerCase();
    if (!needle) return all;
    // Match every whitespace-separated term (AND search) anywhere in the
    // record's combined text — title, category, location, client, status,
    // summary, body, etc. — not just the title.
    const terms = needle.split(/\s+/);
    return all.filter((r) => terms.every((t) => r.haystack.includes(t)));
  }, [q, projectList, updateList]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[90] bg-paper"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto flex h-full w-full max-w-[1100px] flex-col px-5 pb-10 pt-20 md:px-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider2 text-ink/55">
                Search
              </span>
              <button
                onClick={onClose}
                aria-label="Close search"
                className="text-[10px] uppercase tracking-wider2"
                data-cursor="hover"
              >
                Close · Esc
              </button>
            </div>

            <div className="mt-6 flex items-center gap-4 border-b border-ink pb-4">
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Type to search…"
                className="w-full bg-transparent font-bank text-2xl font-medium uppercase tracking-tight outline-none placeholder:text-ink/25 md:text-4xl"
              />
              <span className="tabnum text-[11px] uppercase tracking-wider2 text-ink/55">
                {String(results.length).padStart(2, "0")}
              </span>
            </div>

            <div className="mt-2 flex-1 overflow-y-auto pr-1" data-lenis-prevent>
              {results.length === 0 ? (
                <div className="py-16 text-[11px] uppercase tracking-wider2 text-ink/45">
                  No matches
                </div>
              ) : (
                <ul className="divide-y divide-line">
                  {results.map((r) => (
                    <li key={r.href}>
                      <button
                        onClick={() => {
                          onClose();
                          navigate(r.href);
                        }}
                        data-cursor="hover"
                        className="grid w-full grid-cols-12 items-baseline gap-4 py-4 text-left transition-opacity hover:opacity-60"
                      >
                        <span className="col-span-2 text-[10px] uppercase tracking-wider2 text-ink/55 md:col-span-1">
                          {r.type}
                        </span>
                        <span className="col-span-10 truncate font-bank text-base font-medium uppercase tracking-tight md:col-span-7 md:text-xl">
                          {r.title}
                        </span>
                        <span className="col-span-12 text-[10px] uppercase tracking-wider2 text-ink/55 md:col-span-4 md:text-right">
                          {r.meta}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
