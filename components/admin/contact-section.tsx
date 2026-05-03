"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  type AdminContact,
  type AdminContactOffice,
  newId,
  setContact,
} from "@/lib/admin-store";

function emptyOffice(): AdminContactOffice {
  return {
    id: newId("o"),
    city: "",
    address: "",
    email: "",
    phone: "",
  };
}

function emptyContact(): AdminContact {
  return { email: "", offices: [emptyOffice()] };
}

export function ContactSection({ contact }: { contact: AdminContact | null }) {
  const [draft, setDraft] = useState<AdminContact>(contact ?? emptyContact());
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!savedAt) return;
    const t = setTimeout(() => setSavedAt(null), 2000);
    return () => clearTimeout(t);
  }, [savedAt]);

  useEffect(() => {
    if (contact) setDraft(contact);
  }, [contact]);

  const setOffice = (i: number, patch: Partial<AdminContactOffice>) => {
    setDraft((d) => ({
      ...d,
      offices: d.offices.map((o, idx) => (idx === i ? { ...o, ...patch } : o)),
    }));
  };

  const removeOffice = (i: number) => {
    setDraft((d) => ({ ...d, offices: d.offices.filter((_, idx) => idx !== i) }));
  };

  const addOffice = () => {
    setDraft((d) => ({ ...d, offices: [...d.offices, emptyOffice()] }));
  };

  const onSave = async () => {
    setSaving(true);
    try {
      await setContact(draft);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="font-bank text-3xl font-medium uppercase tracking-tight md:text-4xl">
            Contact
          </h1>
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink/55">
            {contact ? "Custom contact info live" : "Placeholder contact info shown"}
          </div>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-full bg-ink px-5 py-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 hover:bg-ink/85 disabled:cursor-wait disabled:opacity-50"
        >
          {saving ? "Saving…" : savedAt ? "Saved" : "Save"}
        </button>
      </div>

      <div className="space-y-6">
        <Field label="Primary email">
          <input
            value={draft.email}
            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
            placeholder="hello@arengcon.com"
            className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
          />
        </Field>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
              Offices
            </h2>
            <button
              type="button"
              onClick={addOffice}
              className="text-[10.5px] uppercase tracking-[0.14em] text-ink/65 hover:text-ink"
            >
              + Add office
            </button>
          </div>

          <ul className="space-y-4">
            <AnimatePresence initial={false}>
              {draft.offices.map((o, i) => (
              <motion.li
                key={o.id}
                layout
                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                className="grid gap-4 border border-line p-4 md:grid-cols-2 md:gap-5"
              >
                <Field label="City">
                  <input
                    value={o.city}
                    onChange={(e) => setOffice(i, { city: e.target.value })}
                    className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
                  />
                </Field>
                <Field label="Phone">
                  <input
                    value={o.phone}
                    onChange={(e) => setOffice(i, { phone: e.target.value })}
                    className="w-full border-b border-line bg-transparent py-2 text-sm tabnum outline-none focus:border-ink"
                  />
                </Field>
                <Field label="Address (one per line)" className="md:col-span-2">
                  <textarea
                    rows={2}
                    value={o.address}
                    onChange={(e) => setOffice(i, { address: e.target.value })}
                    className="w-full resize-none border border-line bg-transparent p-3 text-sm leading-relaxed outline-none focus:border-ink"
                  />
                </Field>
                <Field label="Email">
                  <input
                    value={o.email}
                    onChange={(e) => setOffice(i, { email: e.target.value })}
                    className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
                  />
                </Field>
                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() => removeOffice(i)}
                    className="rounded-full px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-rose-500 transition-colors duration-200 hover:bg-rose-500/10"
                  >
                    Remove office
                  </button>
                </div>
              </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="block text-[10px] uppercase tracking-[0.18em] text-ink/55">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
