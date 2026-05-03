"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { setAuthed, verifyLogin } from "@/lib/auth-store";

export function LoginScreen({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setBusy(true);
    setError("");
    try {
      const ok = await verifyLogin(email, password);
      if (ok) {
        setAuthed(true);
        onSuccess();
      } else {
        setError("Invalid email or password");
      }
    } catch {
      setError("Sign-in failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-5 text-ink">
      <motion.form
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        onSubmit={submit}
        className="w-full max-w-sm space-y-7 border border-line bg-paper px-7 py-8 md:px-9 md:py-10"
      >
        <div>
          <h1 className="font-bank text-2xl font-medium uppercase tracking-tight">
            Admin
          </h1>
          <p className="mt-1.5 text-[10px] uppercase tracking-[0.18em] text-ink/55">
            Sign in to continue
          </p>
        </div>

        <div className="space-y-5">
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              className="w-full border-b border-line bg-transparent py-2 text-sm outline-none transition-colors duration-200 focus:border-ink"
            />
          </Field>
          <Field label="Password">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full border-b border-line bg-transparent py-2 text-sm outline-none transition-colors duration-200 focus:border-ink"
            />
          </Field>
        </div>

        {error && (
          <div className="text-[10px] uppercase tracking-[0.14em] text-rose-500">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={busy || !email || !password}
          className="w-full rounded-full bg-ink py-2.5 text-[11px] font-medium uppercase tracking-[0.14em] text-paper transition-colors duration-200 hover:bg-ink/85 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>

        <a
          href="/"
          className="block text-center text-[10px] uppercase tracking-[0.18em] text-ink/45 transition-colors duration-200 hover:text-ink/65"
        >
          ← Back to site
        </a>
      </motion.form>
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
