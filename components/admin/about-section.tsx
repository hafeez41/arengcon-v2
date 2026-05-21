"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  type AdminAbout,
  DEFAULT_ABOUT,
  setAbout,
} from "@/lib/admin-store";
import { ImageUploader } from "./image-uploader";
import { SIZE } from "@/lib/motion";

export function AboutSection({ about }: { about: AdminAbout | null }) {
  const [draft, setDraft] = useState<AdminAbout>(about ?? DEFAULT_ABOUT);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (about) setDraft(about);
  }, [about]);

  useEffect(() => {
    if (!savedAt) return;
    const t = window.setTimeout(() => setSavedAt(null), 2000);
    return () => window.clearTimeout(t);
  }, [savedAt]);

  const set = <K extends keyof AdminAbout>(k: K, v: AdminAbout[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const setValue = (i: number, key: "label" | "body", value: string) =>
    setDraft((d) => ({
      ...d,
      values: d.values.map((v, idx) =>
        idx === i ? { ...v, [key]: value } : v,
      ),
    }));
  const addValue = () =>
    setDraft((d) => ({ ...d, values: [...d.values, { label: "", body: "" }] }));
  const removeValue = (i: number) =>
    setDraft((d) => ({
      ...d,
      values: d.values.filter((_, idx) => idx !== i),
    }));

  const onSave = async () => {
    setSaving(true);
    try {
      const cleaned: AdminAbout = {
        intro: draft.intro.trim(),
        heroImage: draft.heroImage ?? "",
        mission: draft.mission.trim(),
        vision: draft.vision.trim(),
        values: draft.values
          .map((v) => ({ label: v.label.trim(), body: v.body.trim() }))
          .filter((v) => v.label || v.body),
      };
      await setAbout(cleaned);
      setDraft(cleaned);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    if (!confirm("Reset the About page to defaults? Your edits will be lost."))
      return;
    setSaving(true);
    try {
      await setAbout(null);
      setDraft(DEFAULT_ABOUT);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="font-bank text-3xl font-medium uppercase tracking-tight md:text-4xl">
            About
          </h1>
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink/55">
            {about ? "Custom content" : "Showing defaults"}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {savedAt && (
              <motion.span
                key={savedAt}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={SIZE}
                className="text-[10.5px] uppercase tracking-[0.14em] text-emerald-600"
              >
                Saved
              </motion.span>
            )}
          </AnimatePresence>
          {about && (
            <button
              type="button"
              onClick={onReset}
              disabled={saving}
              className="rounded-full border border-line px-4 py-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink/55 transition-colors duration-200 hover:border-ink hover:text-ink disabled:opacity-40"
            >
              Reset to defaults
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-full bg-ink px-4 py-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 hover:bg-ink/85 disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="max-w-3xl space-y-8">
        <div>
          <label className="block text-[10px] uppercase tracking-[0.18em] text-ink/55">
            Intro
          </label>
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-ink/40">
            Blank lines separate paragraphs.
          </p>
          <textarea
            value={draft.intro}
            onChange={(e) => set("intro", e.target.value)}
            rows={7}
            className="mt-2 w-full resize-y border border-line bg-transparent p-3 text-sm leading-relaxed outline-none focus:border-ink"
          />
        </div>

        <ImageUploader
          label="Hero image (optional, shown under the intro as a 16:9 banner)"
          value={draft.heroImage || undefined}
          onChange={(v) => set("heroImage", v ?? "")}
        />

        <div>
          <label className="block text-[10px] uppercase tracking-[0.18em] text-ink/55">
            Mission
          </label>
          <textarea
            value={draft.mission}
            onChange={(e) => set("mission", e.target.value)}
            rows={4}
            className="mt-2 w-full resize-y border border-line bg-transparent p-3 text-sm leading-relaxed outline-none focus:border-ink"
          />
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-[0.18em] text-ink/55">
            Vision
          </label>
          <textarea
            value={draft.vision}
            onChange={(e) => set("vision", e.target.value)}
            rows={4}
            className="mt-2 w-full resize-y border border-line bg-transparent p-3 text-sm leading-relaxed outline-none focus:border-ink"
          />
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="block text-[10px] uppercase tracking-[0.18em] text-ink/55">
              Values
            </label>
            <button
              type="button"
              onClick={addValue}
              className="text-[10px] uppercase tracking-[0.14em] text-ink/65 hover:text-ink"
            >
              + Add value
            </button>
          </div>
          <div className="mt-3 space-y-4">
            {draft.values.map((v, i) => (
              <div
                key={i}
                className="border border-line p-4 transition-colors duration-200 hover:border-ink/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 space-y-3">
                    <input
                      value={v.label}
                      onChange={(e) => setValue(i, "label", e.target.value)}
                      placeholder="Label (e.g. Integrity)"
                      className="w-full border-b border-line bg-transparent py-1.5 text-sm uppercase tracking-tight outline-none focus:border-ink"
                    />
                    <textarea
                      value={v.body}
                      onChange={(e) => setValue(i, "body", e.target.value)}
                      rows={2}
                      placeholder="Description"
                      className="w-full resize-y border-b border-line bg-transparent py-1.5 text-sm leading-relaxed outline-none focus:border-ink"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeValue(i)}
                    className="shrink-0 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.14em] text-rose-500 transition-colors duration-200 hover:bg-rose-500/10"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {draft.values.length === 0 && (
              <div className="border border-dashed border-line bg-ink/[0.02] px-5 py-4 text-[11px] uppercase tracking-[0.14em] text-ink/55">
                No values. The site will skip the Values section.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
