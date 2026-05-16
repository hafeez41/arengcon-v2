"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  type AdminService,
  deleteService,
  newId,
  reorderServices,
  upsertService,
} from "@/lib/admin-store";
import { ImageUploader } from "./image-uploader";
import { useDragReorder } from "./use-drag-reorder";
import { GripIcon } from "./grip-icon";

function emptyService(): AdminService {
  return {
    id: newId("svc"),
    title: "",
    desc: "",
    image: "",
    createdAt: Date.now(),
  };
}

export function ServicesSection({ services }: { services: AdminService[] }) {
  const [editing, setEditing] = useState<AdminService | null>(null);
  const { containerProps, rowProps } = useDragReorder(
    services,
    (s) => s.id,
    (next) => void reorderServices(next),
  );

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="font-bank text-3xl font-medium uppercase tracking-tight md:text-4xl">
            Services
          </h1>
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink/55">
            {`${services.length} live · stock defaults ${
              services.length === 0 ? "shown" : "hidden"
            }`}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setEditing(emptyService())}
          className="rounded-full bg-ink px-4 py-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 hover:bg-ink/85"
        >
          + New service
        </button>
      </div>

      <AnimatePresence>
        {services.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="border border-dashed border-line bg-ink/[0.02] px-5 py-6 text-[11px] uppercase tracking-[0.14em] text-ink/55"
          >
            No services yet. Stock-image defaults are shown on the site until
            you add at least one entry here.
          </motion.div>
        )}
      </AnimatePresence>

      <ul className="space-y-3" {...containerProps}>
        <AnimatePresence initial={false}>
          {services.map((s, i) => (
            <motion.li
              key={s.id}
              layout
              {...rowProps(s)}
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
              <div className="relative h-14 w-20 shrink-0 overflow-hidden bg-ink/5">
                {s.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={s.image}
                    alt={s.title}
                    draggable={false}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-bank text-[14px] font-medium uppercase tracking-tight">
                  {s.title || "Untitled"}
                </h3>
                <p className="mt-0.5 truncate text-[10.5px] text-ink/55">
                  {s.desc || "—"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(s)}
                  className="rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-ink/65 transition-colors duration-200 hover:bg-ink/5"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete "${s.title}"?`))
                      void deleteService(s.id);
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
          <ServiceEditor
            key={editing.id}
            service={editing}
            onClose={() => setEditing(null)}
            onSave={async (s) => {
              await upsertService(s);
              setEditing(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ServiceEditor({
  service,
  onClose,
  onSave,
}: {
  service: AdminService;
  onClose: () => void;
  onSave: (s: AdminService) => Promise<void>;
}) {
  const [draft, setDraft] = useState<AdminService>(service);
  const [saving, setSaving] = useState(false);
  const set = <K extends keyof AdminService>(k: K, v: AdminService[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const valid = !!draft.title && !!draft.desc && !!draft.image;

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
            {service.title ? "Edit service" : "New service"}
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
          <div>
            <label className="block text-[10px] uppercase tracking-[0.18em] text-ink/55">
              Title <span className="ml-1 text-rose-500">*</span>
            </label>
            <input
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
              className="mt-1.5 w-full border-b border-line bg-transparent py-2 text-sm uppercase tracking-tight outline-none focus:border-ink"
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-[0.18em] text-ink/55">
              Description <span className="ml-1 text-rose-500">*</span>
            </label>
            <textarea
              value={draft.desc}
              onChange={(e) => set("desc", e.target.value)}
              rows={4}
              className="mt-1.5 w-full resize-y border border-line bg-transparent p-3 text-sm leading-relaxed outline-none focus:border-ink"
            />
          </div>

          <ImageUploader
            label="Service image"
            value={draft.image || undefined}
            onChange={(v) => set("image", v ?? "")}
            required
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
            {saving ? "Saving…" : "Save service"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
