"use client";

import { materializeUrl } from "@/lib/image-upload";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  type AdminPerson,
  deletePerson,
  newId,
  reorderPeople,
  upsertPerson,
} from "@/lib/admin-store";
import { ImageUploader } from "./image-uploader";
import { useDragReorder } from "./use-drag-reorder";
import { GripIcon } from "./grip-icon";

function emptyPerson(): AdminPerson {
  return {
    id: newId("ppl"),
    name: "",
    role: "",
    bio: "",
    photo: "",
    createdAt: Date.now(),
  };
}

export function PeopleSection({ people }: { people: AdminPerson[] }) {
  const [editing, setEditing] = useState<AdminPerson | null>(null);
  const { containerProps, rowProps } = useDragReorder(
    people,
    (p) => p.id,
    (next) => void reorderPeople(next),
  );

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="font-bank text-3xl font-medium uppercase tracking-tight md:text-4xl">
            People
          </h1>
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink/55">
            {`${people.length} live · placeholders ${
              people.length === 0 ? "shown" : "hidden"
            }`}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing(emptyPerson())}
          className="rounded-full bg-ink px-4 py-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 hover:bg-ink/85"
        >
          + New person
        </button>
      </div>

      <AnimatePresence>
        {people.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="border border-dashed border-line bg-ink/[0.02] px-5 py-6 text-[11px] uppercase tracking-[0.14em] text-ink/55"
          >
            No people yet. Placeholder team members are shown on the site until
            you add at least one entry here.
          </motion.div>
        )}
      </AnimatePresence>

      <ul className="space-y-3" {...containerProps}>
        <AnimatePresence initial={false}>
          {people.map((p, i) => (
            <motion.li
              key={p.id}
              layout
              {...rowProps(p)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{
                duration: 0.32,
                ease: [0.16, 1, 0.3, 1],
                delay: Math.min(i * 0.03, 0.15),
              }}
              className="flex items-center gap-3 border border-line bg-paper px-4 py-3 transition-colors duration-200 hover:border-ink/40 data-[drop-target]:border-dashed data-[drop-target]:border-ink"
            >
              <span
                className="shrink-0 cursor-grab text-ink/30 transition-colors duration-200 hover:text-ink/60 active:cursor-grabbing"
                aria-hidden
                title="Drag to reorder"
              >
                <GripIcon />
              </span>
              <span className="w-7 shrink-0 text-[10px] uppercase tracking-[0.18em] tabnum text-ink/45">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-ink/5">
                {p.photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.photo}
                    alt={p.name}
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-bank text-[14px] font-medium uppercase tracking-tight">
                  {p.name || "Unnamed"}
                </h3>
                <p className="mt-0.5 truncate text-[10.5px] text-ink/55">
                  {p.role || "—"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(p)}
                  className="rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-ink/65 transition-colors duration-200 hover:bg-ink/5"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete "${p.name}"?`))
                      void deletePerson(p.id);
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
          <PersonEditor
            key={editing.id}
            person={editing}
            onClose={() => setEditing(null)}
            onSave={async (p) => {
              const photo = (await materializeUrl(p.photo)) ?? "";
              await upsertPerson({ ...p, photo });
              setEditing(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function PersonEditor({
  person,
  onClose,
  onSave,
}: {
  person: AdminPerson;
  onClose: () => void;
  onSave: (p: AdminPerson) => Promise<void>;
}) {
  const [draft, setDraft] = useState<AdminPerson>(person);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof AdminPerson>(k: K, v: AdminPerson[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const valid = !!draft.name.trim();

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
        className="relative mx-auto my-auto w-full max-w-[680px] border border-line bg-paper px-5 py-8 md:px-10 md:py-10"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bank text-2xl font-medium uppercase tracking-tight">
            {person.name ? "Edit person" : "New person"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[10px] uppercase tracking-[0.18em] text-ink/55 hover:text-ink"
          >
            Cancel
          </button>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.18em] text-ink/55">
                Name <span className="ml-1 text-rose-500">*</span>
              </label>
              <input
                value={draft.name}
                onChange={(e) => set("name", e.target.value)}
                className="mt-1.5 w-full border-b border-line bg-transparent py-2 text-sm uppercase tracking-tight outline-none focus:border-ink"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.18em] text-ink/55">
                Role / title
              </label>
              <input
                value={draft.role}
                onChange={(e) => set("role", e.target.value)}
                placeholder="e.g. Founding Principal"
                className="mt-1.5 w-full border-b border-line bg-transparent py-2 text-sm uppercase tracking-tight outline-none focus:border-ink"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.18em] text-ink/55">
              Bio
            </label>
            <textarea
              value={draft.bio}
              onChange={(e) => set("bio", e.target.value)}
              rows={6}
              placeholder="Blank lines separate paragraphs."
              className="mt-1.5 w-full resize-y border border-line bg-transparent p-3 text-sm leading-relaxed outline-none focus:border-ink"
            />
          </div>

          <ImageUploader
            label="Portrait (optional)"
            value={draft.photo || undefined}
            onChange={(v) => set("photo", v ?? "")}
          />
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
            {saving ? "Saving…" : "Save person"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
