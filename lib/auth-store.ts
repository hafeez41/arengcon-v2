"use client";

const SESSION_KEY = "arengcon-admin-auth";

export async function getAdminEmail(): Promise<string> {
  const res = await fetch("/api/admin/credentials");
  if (!res.ok) return "";
  const data = await res.json();
  return data.email ?? "";
}

export async function verifyLogin(email: string, password: string): Promise<boolean> {
  const res = await fetch("/api/admin/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "login", email, password }),
  });
  const data = await res.json();
  return data.ok === true;
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
  const res = await fetch("/api/admin/credentials", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currentPassword, newEmail, newPassword }),
  });
  return res.json();
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

export async function signOut(): Promise<void> {
  await fetch("/api/admin/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "logout" }),
  });
  setAuthed(false);
}
