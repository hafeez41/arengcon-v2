"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  type AdminUpdate,
  deleteUpdate,
  newId,
  upsertUpdate,
} from "@/lib/admin-store";
import { ImageUploader } from "./image-uploader";

const KINDS = ["Studio", "Press", "Project", "Talk"] as const;

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function emptyUpdate(): AdminUpdate {
  return {
    id: newId("u"),
    title: "",
    excerpt: "",
    body: "",
    date: todayISO(),
    kind: "Studio",
    hero: "",
    videoUrl: "",
    createdAt: Date.now(),
  };
}

export function UpdatesSection({ updates }: { updates: AdminUpdate[] }) {
  const [editing, setEditing] = useState<AdminUpdate | null>(null);

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="font-bank text-3xl font-medium uppercase tracking-tight md:text-4xl">
            Updates
          </h1>
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink/55">
            {updates.length} live · placeholders {updates.length === 0 ? "shown" : "hidden"}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing(emptyUpdate())}
          className="rounded-full bg-ink px-4 py-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 hover:bg-ink/85"
        >
          + New update
        </button>
      </div>

      <AnimatePresence>
        {updates.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="border border-dashed border-line bg-ink/[0.02] px-5 py-6 text-[11px] uppercase tracking-[0.14em] text-ink/55"
          >
            No updates yet. Placeholder updates are shown until you add at least one entry.
          </motion.div>
        )}
      </AnimatePresence>

      <ul className="space-y-3">
        <AnimatePresence initial={false}>
          {updates.map((u, i) => (
          <motion.li
            key={u.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{
              duration: 0.32,
              ease: [0.16, 1, 0.3, 1],
              delay: Math.min(i * 0.03, 0.15),
            }}
            className="flex items-center gap-4 border border-line bg-paper px-4 py-3 transition-colors duration-200 hover:border-ink/40"
          >
            <div className="relative h-14 w-20 shrink-0 overflow-hidden bg-ink/5">
              {u.hero ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={u.hero} alt={u.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[8px] uppercase tracking-[0.18em] text-ink/40">
                  Text
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-3">
                <h3 className="truncate font-bank text-[14px] font-medium uppercase tracking-tight">
                  {u.title || "Untitled"}
                </h3>
                <span className="text-[10px] uppercase tracking-[0.18em] text-ink/55">
                  {u.kind}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-ink/55">
                <span className="tabnum">{u.date}</span>
                {u.videoUrl && (
                  <>
                    <span className="opacity-50">·</span>
                    <span>Video</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditing(u)}
                className="rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-ink/65 transition-colors duration-200 hover:bg-ink/5"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete "${u.title}"?`)) void deleteUpdate(u.id);
                }}
                className="rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-rose-500 transition-colors duration-200 hover:bg-rose-500/10"
              >
                Delete
              </button>
            </div>
          </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <AnimatePresence>
        {editing && (
          <UpdateEditor
            key={editing.id}
            update={editing}
            onClose={() => setEditing(null)}
            onSave={async (u) => {
              await upsertUpdate(u);
              setEditing(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function UpdateEditor({
  update,
  onClose,
  onSave,
}: {
  update: AdminUpdate;
  onClose: () => void;
  onSave: (u: AdminUpdate) => Promise<void>;
}) {
  const [draft, setDraft] = useState<AdminUpdate>(update);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof AdminUpdate>(k: K, v: AdminUpdate[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const valid = draft.title && draft.excerpt && draft.body;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-50 flex items-stretch overflow-y-auto bg-ink/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.99 }}
        transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-auto my-auto w-full max-w-[760px] border border-line bg-paper px-5 py-8 md:px-10 md:py-10"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bank text-2xl font-medium uppercase tracking-tight">
            {update.title ? "Edit update" : "New update"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] uppercase tracking-[0.18em] text-ink/55 hover:text-ink"
          >
            Cancel
          </button>
        </div>

        <div className="space-y-5">
          <Field label="Title" required>
            <input
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full border-b border-line bg-transparent py-2 text-sm uppercase tracking-tight outline-none focus:border-ink"
            />
          </Field>

          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Kind">
              <select
                value={draft.kind}
                onChange={(e) => set("kind", e.target.value as AdminUpdate["kind"])}
                className="w-full border-b border-line bg-transparent py-2 text-sm uppercase tracking-tight outline-none focus:border-ink"
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={draft.date}
                onChange={(e) => set("date", e.target.value)}
                className="w-full border-b border-line bg-transparent py-2 text-sm tabnum outline-none focus:border-ink"
              />
            </Field>
          </div>

          <Field label="Excerpt" required>
            <textarea
              value={draft.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              rows={2}
              className="w-full resize-none border border-line bg-transparent p-3 text-sm leading-relaxed outline-none focus:border-ink"
            />
          </Field>

          <Field label="Body (blank line = new paragraph)" required>
            <textarea
              value={draft.body}
              onChange={(e) => set("body", e.target.value)}
              rows={6}
              className="w-full resize-y border border-line bg-transparent p-3 text-sm leading-relaxed outline-none focus:border-ink"
            />
          </Field>

          <ImageUploader
            label="Hero image (optional — leave blank for text-only)"
            value={draft.hero || undefined}
            onChange={(v) => set("hero", v ?? "")}
          />

          <Field label="YouTube video URL (optional)">
            <input
              value={draft.videoUrl ?? ""}
              onChange={(e) => set("videoUrl", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
              className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
            />
          </Field>
        </div>

        <div className="mt-8 flex items-center justify-end gap-3 border-t border-line pt-6">
          <button
            type="button"
            onClick={onClose}
            className="text-[11px] uppercase tracking-[0.14em] text-ink/55 hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!valid || saving}
            onClick={async () => {
              setSaving(true);
              try {
                await onSave(draft);
              } finally {
                setSaving(false);
              }
            }}
            className="rounded-full bg-ink px-5 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save update"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-[10px] uppercase tracking-[0.18em] text-ink/55">
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
