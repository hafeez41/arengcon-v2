"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  type AdminProject,
  deleteProject,
  newId,
  reorderProjects,
  upsertProject,
} from "@/lib/admin-store";
import {
  CATEGORY_LABELS,
  SUBCATEGORIES,
  type Category,
  categoryHasSubcategories,
} from "@/lib/projects";
import { ImageUploader, GalleryUploader } from "./image-uploader";
import { useDragReorder } from "./use-drag-reorder";
import { GripIcon } from "./grip-icon";

const STATUSES = ["Built", "In Progress", "Concept"] as const;
const CATEGORIES: Category[] = ["arch", "int", "cons", "land"];

function emptyProject(): AdminProject {
  return {
    id: newId("p"),
    title: "",
    category: "arch",
    subcategory: SUBCATEGORIES.arch[0]?.slug,
    client: "",
    location: "",
    year: new Date().getFullYear(),
    status: "Built",
    size: "",
    summary: "",
    description: "",
    hero: "",
    gallery: [],
    createdAt: Date.now(),
  };
}

export function ProjectsSection({ projects }: { projects: AdminProject[] }) {
  const [editing, setEditing] = useState<AdminProject | null>(null);
  const { containerProps, rowProps } = useDragReorder(
    projects,
    (p) => p.id,
    (next) => void reorderProjects(next),
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Projects"
        meta={`${projects.length} live · placeholders ${projects.length === 0 ? "shown" : "hidden"}`}
        action={
          <button
            type="button"
            onClick={() => setEditing(emptyProject())}
            className="rounded-full bg-ink px-4 py-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 hover:bg-ink/85"
          >
            + New project
          </button>
        }
      />
      <AnimatePresence>
        {projects.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="border border-dashed border-line bg-ink/[0.02] px-5 py-6 text-[11px] uppercase tracking-[0.14em] text-ink/55"
          >
            No projects yet. Placeholder projects are shown on the site until you
            add at least one entry here.
          </motion.div>
        )}
      </AnimatePresence>
      <ul className="space-y-3" {...containerProps}>
        <AnimatePresence initial={false}>
          {projects.map((p, i) => (
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
            className="flex items-center gap-3 border border-line bg-paper px-4 py-3 transition-colors duration-200 hover:border-ink/40 data-[drop-target]:border-ink data-[drop-target]:border-dashed"
          >
            <span
              className="shrink-0 cursor-grab text-ink/30 transition-colors duration-200 hover:text-ink/60 active:cursor-grabbing"
              aria-hidden
              title="Drag to reorder"
            >
              <GripIcon />
            </span>
            <div className="relative h-14 w-20 shrink-0 overflow-hidden bg-ink/5">
              {p.hero && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.hero}
                  alt={p.title}
                  draggable={false}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-3">
                <h3 className="truncate font-bank text-[14px] font-medium uppercase tracking-tight">
                  {p.title || "Untitled"}
                </h3>
                <span className="text-[10px] uppercase tracking-[0.18em] text-ink/55">
                  {CATEGORY_LABELS[p.category].name}
                  {p.subcategory && (
                    <>
                      {" · "}
                      {SUBCATEGORIES[p.category].find(
                        (s) => s.slug === p.subcategory,
                      )?.label ?? p.subcategory}
                    </>
                  )}
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-ink/55">
                <span className="tabnum">{p.year}</span>
                <span className="opacity-50">·</span>
                <span>{p.location || "—"}</span>
                <span className="opacity-50">·</span>
                <span>{p.status}</span>
              </div>
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
                  if (confirm(`Delete "${p.title}"?`)) void deleteProject(p.id);
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
          <ProjectEditor
            key={editing.id}
            project={editing}
            onClose={() => setEditing(null)}
            onSave={async (p) => {
              await upsertProject(p);
              setEditing(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProjectEditor({
  project,
  onClose,
  onSave,
}: {
  project: AdminProject;
  onClose: () => void;
  onSave: (p: AdminProject) => Promise<void>;
}) {
  const [draft, setDraft] = useState<AdminProject>(project);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof AdminProject>(k: K, v: AdminProject[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  // When the category changes, reset subcategory to the first available
  // option (or clear it if the new category has no subcategories).
  const setCategory = (next: Category) => {
    const subs = SUBCATEGORIES[next];
    setDraft((d) => ({
      ...d,
      category: next,
      subcategory: subs.length ? subs[0].slug : undefined,
    }));
  };

  const subs = SUBCATEGORIES[draft.category];
  const subRequired = subs.length > 0;
  const subValid = !subRequired || !!draft.subcategory;
  const valid = !!draft.title && !!draft.hero && !!draft.summary && subValid;

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
        className="relative mx-auto my-auto w-full max-w-[840px] border border-line bg-paper px-5 py-8 md:px-10 md:py-10"
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-bank text-2xl font-medium uppercase tracking-tight">
            {project.title ? "Edit project" : "New project"}
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
            <Field label="Title" required>
              <input
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
                className="w-full border-b border-line bg-transparent py-2 text-sm uppercase tracking-tight outline-none focus:border-ink"
              />
            </Field>
            <Field label="Category" required>
              <select
                value={draft.category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full border-b border-line bg-transparent py-2 text-sm uppercase tracking-tight outline-none focus:border-ink"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {CATEGORY_LABELS[c].name}
                  </option>
                ))}
              </select>
            </Field>
            {subRequired && (
              <Field label="Subcategory" required>
                <select
                  value={draft.subcategory ?? ""}
                  onChange={(e) =>
                    set("subcategory", e.target.value || undefined)
                  }
                  className="w-full border-b border-line bg-transparent py-2 text-sm uppercase tracking-tight outline-none focus:border-ink"
                >
                  {subs.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Client">
              <input
                value={draft.client}
                onChange={(e) => set("client", e.target.value)}
                className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
              />
            </Field>
            <Field label="Location">
              <input
                value={draft.location}
                onChange={(e) => set("location", e.target.value)}
                className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
              />
            </Field>
            <Field label="Year">
              <input
                type="number"
                value={draft.year}
                onChange={(e) => set("year", Number(e.target.value) || draft.year)}
                className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink tabnum"
              />
            </Field>
            <Field label="Status">
              <select
                value={draft.status}
                onChange={(e) => set("status", e.target.value as AdminProject["status"])}
                className="w-full border-b border-line bg-transparent py-2 text-sm uppercase tracking-tight outline-none focus:border-ink"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Size / scope" className="md:col-span-2">
              <input
                value={draft.size}
                onChange={(e) => set("size", e.target.value)}
                placeholder="e.g. 92,000 sq ft"
                className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
              />
            </Field>
          </div>

          <Field label="One-line summary" required>
            <textarea
              value={draft.summary}
              onChange={(e) => set("summary", e.target.value)}
              rows={2}
              className="w-full resize-none border border-line bg-transparent p-3 text-sm leading-relaxed outline-none focus:border-ink"
            />
          </Field>

          <Field label="Description (blank line = new paragraph)">
            <textarea
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
              rows={6}
              className="w-full resize-y border border-line bg-transparent p-3 text-sm leading-relaxed outline-none focus:border-ink"
            />
          </Field>

          <ImageUploader
            label="Hero image"
            value={draft.hero || undefined}
            onChange={(v) => set("hero", v ?? "")}
            required
          />

          <GalleryUploader
            values={draft.gallery}
            onChange={(v) => set("gallery", v)}
            max={12}
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
            {saving ? "Saving…" : "Save project"}
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

function SectionHeader({
  title,
  meta,
  action,
}: {
  title: string;
  meta: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
      <div>
        <h1 className="font-bank text-3xl font-medium uppercase tracking-tight md:text-4xl">
          {title}
        </h1>
        <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink/55">
          {meta}
        </div>
      </div>
      {action}
    </div>
  );
}
