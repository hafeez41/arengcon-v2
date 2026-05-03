"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { getAdminEmail, updateAdminCreds, setAuthed } from "@/lib/auth-store";

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
    if (newPassword && newPassword.length < 4) {
      setMessage({ kind: "err", text: "New password is too short." });
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

  const onSignOutClick = () => {
    setAuthed(false);
    onSignOut();
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
