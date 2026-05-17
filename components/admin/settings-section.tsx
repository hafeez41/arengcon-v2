"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getAdminEmail, updateAdminCreds, signOut } from "@/lib/auth-store";

export function SettingsSection({ onSignOut }: { onSignOut: () => void }) {
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    let alive = true;
    getAdminEmail().then((e) => {
      if (alive) {
        setCurrentEmail(e);
        setNewEmail(e);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (message?.kind !== "ok") return;
    const t = setTimeout(() => setMessage(null), 2200);
    return () => clearTimeout(t);
  }, [message]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    if (!currentPassword) {
      setMessage({ kind: "err", text: "Enter your current password." });
      return;
    }
    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ kind: "err", text: "New passwords don't match." });
      return;
    }
    if (newPassword && newPassword.length < 8) {
      setMessage({ kind: "err", text: "Password must be at least 8 characters." });
      return;
    }

    setBusy(true);
    try {
      const result = await updateAdminCreds({
        currentPassword,
        newEmail: newEmail !== currentEmail ? newEmail : undefined,
        newPassword: newPassword || undefined,
      });
      if (result.ok) {
        setCurrentEmail(newEmail);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setMessage({ kind: "ok", text: "Saved." });
      } else {
        setMessage({ kind: "err", text: result.error || "Save failed." });
      }
    } finally {
      setBusy(false);
    }
  };

  const onSignOutClick = async () => {
    await signOut();
    onSignOut();
  };

  const [migrating, setMigrating] = useState(false);
  const [migrateResult, setMigrateResult] = useState<string | null>(null);
  const [migrateErrors, setMigrateErrors] = useState<string[]>([]);

  const runMigration = async () => {
    if (
      !confirm(
        "Copy all existing Vercel Blob images to Cloudflare R2 and rewrite their URLs? Safe to run more than once.",
      )
    )
      return;
    setMigrating(true);
    setMigrateResult(null);
    setMigrateErrors([]);
    try {
      const res = await fetch("/api/admin/migrate-blob-to-r2", {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setMigrateResult(`Error: ${data.error || res.status}`);
      } else {
        const failed = data.failed?.length
          ? ` · ${data.failed.length} failed`
          : "";
        setMigrateResult(
          `Done — projects: ${data.projects}, updates: ${data.updates}, services: ${data.services}${failed}`,
        );
        setMigrateErrors(Array.isArray(data.failed) ? data.failed : []);
      }
    } catch (e) {
      setMigrateResult(
        `Error: ${e instanceof Error ? e.message : "request failed"}`,
      );
    } finally {
      setMigrating(false);
    }
  };

  const dirty =
    newEmail !== currentEmail || newPassword.length > 0;

  return (
    <div className="space-y-10">
      <div className="flex items-end justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="font-bank text-3xl font-medium uppercase tracking-tight md:text-4xl">
            Settings
          </h1>
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink/55">
            Account credentials and session
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOutClick}
          className="rounded-full border border-line px-4 py-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink/65 transition-colors duration-200 hover:border-ink hover:text-ink"
        >
          Sign out
        </button>
      </div>

      <form onSubmit={onSave} className="max-w-xl space-y-6">
        <div>
          <h2 className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
            Account
          </h2>
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink/40">
            Current sign-in: {currentEmail}
          </div>
        </div>

        <Field label="Email">
          <input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            autoComplete="email"
            className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
          />
        </Field>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label="New password (leave blank to keep)">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
            />
          </Field>
          <Field label="Confirm new password">
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              disabled={!newPassword}
              className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink disabled:opacity-40"
            />
          </Field>
        </div>

        <div className="border-t border-line pt-6">
          <Field label="Current password (required to save)">
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
            />
          </Field>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              key={message.text + message.kind}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={
                "text-[10.5px] uppercase tracking-[0.14em] " +
                (message.kind === "ok" ? "text-emerald-600" : "text-rose-500")
              }
            >
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>


        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={!dirty || busy || !currentPassword}
            className="rounded-full bg-ink px-5 py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>

      <div className="max-w-xl border-t border-line pt-8">
        <h2 className="text-[11px] uppercase tracking-[0.18em] text-ink/55">
          Maintenance
        </h2>
        <p className="mt-2 max-w-md text-[11px] leading-relaxed text-ink/45">
          One-time: copy every image still hosted on Vercel Blob into
          Cloudflare R2 and rewrite the stored URLs. Idempotent — safe to run
          again. Run this, confirm images load, then delete the Vercel Blob
          store.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <button
            type="button"
            onClick={runMigration}
            disabled={migrating}
            className="rounded-full border border-line px-4 py-2 text-[10.5px] font-medium uppercase tracking-[0.14em] text-ink/65 transition-colors duration-200 hover:border-ink hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            {migrating ? "Migrating…" : "Migrate Blob → R2"}
          </button>
          {migrateResult && (
            <span
              className={
                "text-[10.5px] uppercase tracking-[0.14em] " +
                (migrateResult.startsWith("Error") ||
                migrateResult.includes("failed")
                  ? "text-rose-500"
                  : "text-emerald-600")
              }
            >
              {migrateResult}
            </span>
          )}
        </div>
        {migrateErrors.length > 0 && (
          <div className="mt-4 max-h-64 overflow-y-auto border border-line bg-ink/[0.02] p-3">
            <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-rose-500">
              First failures (read the reason after “::”)
            </div>
            <ul className="space-y-1.5">
              {migrateErrors.slice(0, 5).map((err, i) => (
                <li
                  key={i}
                  className="break-all font-mono text-[10.5px] leading-relaxed text-ink/70"
                >
                  {err}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
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
      <label className="block text-[10px] uppercase tracking-[0.18em] text-ink/55">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
