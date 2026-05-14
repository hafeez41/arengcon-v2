"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  type AdminContact,
  type SocialKey,
  DEFAULT_CONTACT,
  SOCIAL_PLATFORMS,
  setContact,
} from "@/lib/admin-store";
import { SIZE } from "@/lib/motion";

export function ContactSection({ contact }: { contact: AdminContact | null }) {
  const [draft, setDraft] = useState<AdminContact>(contact ?? DEFAULT_CONTACT);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (contact) setDraft(contact);
  }, [contact]);

  useEffect(() => {
    if (!savedAt) return;
    const t = window.setTimeout(() => setSavedAt(null), 2000);
    return () => window.clearTimeout(t);
  }, [savedAt]);

  const updateField = <K extends keyof AdminContact>(k: K, v: AdminContact[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const setEmail = (i: number, value: string) => {
    setDraft((d) => ({
      ...d,
      emails: d.emails.map((e, idx) => (idx === i ? value : e)),
    }));
  };
  const addEmail = () =>
    setDraft((d) => ({ ...d, emails: [...d.emails, ""] }));
  const removeEmail = (i: number) =>
    setDraft((d) => ({ ...d, emails: d.emails.filter((_, idx) => idx !== i) }));

  const setPhone = (i: number, value: string) => {
    setDraft((d) => ({
      ...d,
      phones: d.phones.map((p, idx) => (idx === i ? value : p)),
    }));
  };
  const addPhone = () =>
    setDraft((d) => ({ ...d, phones: [...d.phones, ""] }));
  const removePhone = (i: number) =>
    setDraft((d) => ({ ...d, phones: d.phones.filter((_, idx) => idx !== i) }));

  const setOffice = (key: "location" | "hours", value: string) =>
    setDraft((d) => ({ ...d, office: { ...d.office, [key]: value } }));

  const setSocial = (key: SocialKey, value: string) =>
    setDraft((d) => ({ ...d, social: { ...d.social, [key]: value } }));

  const onSave = async () => {
    setSaving(true);
    try {
      // Strip empty entries before saving
      const cleaned: AdminContact = {
        emails: draft.emails.map((e) => e.trim()).filter(Boolean),
        phones: draft.phones.map((p) => p.trim()).filter(Boolean),
        office: {
          location: draft.office.location.trim(),
          hours: draft.office.hours.trim(),
        },
        social: Object.fromEntries(
          Object.entries(draft.social ?? {})
            .map(([k, v]) => [k, (v ?? "").trim()])
            .filter(([, v]) => !!v),
        ) as AdminContact["social"],
      };
      await setContact(cleaned);
      setDraft(cleaned);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  const onReset = async () => {
    if (!confirm("Reset contact info to defaults?")) return;
    setSaving(true);
    try {
      await setContact(null);
      setDraft(DEFAULT_CONTACT);
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  const usingDefaults = !contact;

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="font-bank text-3xl font-medium uppercase tracking-tight md:text-4xl">
            Contact
          </h1>
          <div className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted">
            {usingDefaults
              ? "Using default contact info"
              : "Custom contact info live"}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence>
            {savedAt && (
              <motion.span
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={SIZE}
                className="text-[10px] uppercase tracking-[0.14em] text-emerald-600"
              >
                Saved
              </motion.span>
            )}
          </AnimatePresence>
          {!usingDefaults && (
            <button
              type="button"
              onClick={onReset}
              disabled={saving}
              className="rounded-full border border-line px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-muted transition-colors duration-200 hover:bg-ink/[0.04] hover:text-ink"
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="rounded-full bg-ink px-5 py-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 hover:bg-ink/85 disabled:cursor-wait disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {/* Email + phone */}
      <div className="grid gap-12 md:grid-cols-2">
        <Group title="Emails" onAdd={addEmail} addLabel="Add email">
          <ul className="space-y-3">
            {draft.emails.length === 0 && (
              <li className="text-[12px] text-muted">No emails yet.</li>
            )}
            {draft.emails.map((email, i) => (
              <li key={i} className="flex items-center gap-3">
                <input
                  value={email}
                  onChange={(e) => setEmail(i, e.target.value)}
                  type="email"
                  placeholder="email@arengcon.com"
                  className="flex-1 border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
                />
                <button
                  type="button"
                  onClick={() => removeEmail(i)}
                  aria-label="Remove email"
                  className="text-[10.5px] uppercase tracking-[0.14em] text-rose-500 transition-colors duration-200 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </Group>

        <Group title="Phone numbers" onAdd={addPhone} addLabel="Add phone">
          <ul className="space-y-3">
            {draft.phones.length === 0 && (
              <li className="text-[12px] text-muted">No phone numbers yet.</li>
            )}
            {draft.phones.map((phone, i) => (
              <li key={i} className="flex items-center gap-3">
                <input
                  value={phone}
                  onChange={(e) => setPhone(i, e.target.value)}
                  type="tel"
                  placeholder="+234 8000 000 000"
                  className="flex-1 border-b border-line bg-transparent py-2 text-sm tabnum outline-none focus:border-ink"
                />
                <button
                  type="button"
                  onClick={() => removePhone(i)}
                  aria-label="Remove phone"
                  className="text-[10.5px] uppercase tracking-[0.14em] text-rose-500 transition-colors duration-200 hover:underline"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        </Group>
      </div>

      {/* Office */}
      <Group title="Office">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Location">
            <input
              value={draft.office.location}
              onChange={(e) => setOffice("location", e.target.value)}
              placeholder="Abuja, Nigeria"
              className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="Hours">
            <input
              value={draft.office.hours}
              onChange={(e) => setOffice("hours", e.target.value)}
              placeholder="Mon – Sun, 9am – 6pm"
              className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
            />
          </Field>
        </div>
      </Group>

      {/* Social */}
      <Group title="Social">
        <p className="mb-5 text-[12px] leading-relaxed text-muted">
          Paste a profile URL for any platform you use. Leave blank to hide that
          icon on the site.
        </p>
        <div className="grid gap-4 md:grid-cols-2">
          {SOCIAL_PLATFORMS.map((p) => (
            <Field key={p.key} label={p.label}>
              <input
                type="url"
                value={draft.social?.[p.key as SocialKey] ?? ""}
                onChange={(e) =>
                  setSocial(p.key as SocialKey, e.target.value)
                }
                placeholder={`https://${p.key}.com/arengcon`}
                className="w-full border-b border-line bg-transparent py-2 text-[13px] outline-none focus:border-ink"
              />
            </Field>
          ))}
        </div>
      </Group>
    </div>
  );
}

function Group({
  title,
  children,
  onAdd,
  addLabel,
}: {
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-[11px] uppercase tracking-[0.18em] text-muted">
          {title}
        </h2>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="text-[10.5px] uppercase tracking-[0.14em] text-muted transition-colors duration-200 hover:text-ink"
          >
            + {addLabel}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-[0.14em] text-muted">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
