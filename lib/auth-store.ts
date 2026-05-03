"use client";

import { idbGet, idbSet } from "./idb";

const CREDS_KEY = "admin:credentials";
const SESSION_KEY = "arengcon-admin-auth";

const DEFAULT_EMAIL = "guyworking2@gmail.com";
const DEFAULT_PASSWORD = "pass123";

type StoredCreds = { email: string; hash: string };

async function hashPassword(p: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(p));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getCreds(): Promise<StoredCreds> {
  const stored = await idbGet<StoredCreds>(CREDS_KEY);
  if (stored && stored.email && stored.hash) return stored;
  const fresh: StoredCreds = {
    email: DEFAULT_EMAIL,
    hash: await hashPassword(DEFAULT_PASSWORD),
  };
  await idbSet(CREDS_KEY, fresh);
  return fresh;
}

export async function getAdminEmail(): Promise<string> {
  return (await getCreds()).email;
}

export async function verifyLogin(
  email: string,
  password: string,
): Promise<boolean> {
  const creds = await getCreds();
  if (email.trim().toLowerCase() !== creds.email.toLowerCase()) return false;
  const h = await hashPassword(password);
  return h === creds.hash;
}

export async function updateAdminCreds({
  currentPassword,
  newEmail,
  newPassword,
}: {
  currentPassword: string;
  newEmail?: string;
  newPassword?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const creds = await getCreds();
  const cur = await hashPassword(currentPassword);
  if (cur !== creds.hash) {
    return { ok: false, error: "Current password is incorrect" };
  }
  const next: StoredCreds = {
    email: newEmail?.trim() || creds.email,
    hash: newPassword ? await hashPassword(newPassword) : creds.hash,
  };
  await idbSet(CREDS_KEY, next);
  return { ok: true };
}

export function isAuthed(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function setAuthed(value: boolean) {
  if (typeof window === "undefined") return;
  if (value) sessionStorage.setItem(SESSION_KEY, "1");
  else sessionStorage.removeItem(SESSION_KEY);
}
