"use client";

import { useEffect, useState } from "react";
import type { Category } from "./projects";

export type AdminProject = {
  id: string;
  title: string;
  category: Category;
  subcategory?: string;
  client: string;
  location: string;
  year: number;
  status: "Built" | "In Progress" | "Concept";
  size: string;
  summary: string;
  description: string;
  hero: string;
  gallery: string[];
  createdAt: number;
};

export type AdminUpdate = {
  id: string;
  title: string;
  excerpt: string;
  body: string;
  date: string;
  kind: "Studio" | "Press" | "Project" | "Talk";
  hero?: string;
  createdAt: number;
};

export const SOCIAL_PLATFORMS = [
  { key: "instagram", label: "Instagram" },
  { key: "x", label: "X" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "facebook", label: "Facebook" },
  { key: "vimeo", label: "Vimeo" },
  { key: "youtube", label: "YouTube" },
  { key: "tiktok", label: "TikTok" },
  { key: "pinterest", label: "Pinterest" },
] as const;

export type SocialKey = (typeof SOCIAL_PLATFORMS)[number]["key"];

export type AdminContact = {
  emails: string[];
  phones: string[];
  office: { location: string; hours: string };
  social: Partial<Record<SocialKey, string>>;
};

export const DEFAULT_CONTACT: AdminContact = {
  emails: ["arengconlimited@gmail.com", "arengconoffice@gmail.com"],
  phones: ["+234 8066163163"],
  office: { location: "Abuja, Nigeria", hours: "Mon – Sun, 9am – 6pm" },
  social: {},
};

type Listener = () => void;

const listeners = new Set<Listener>();

function notify() {
  for (const l of listeners) l();
}

let cache: {
  projects?: AdminProject[];
  updates?: AdminUpdate[];
  contact?: AdminContact | null;
  loaded?: boolean;
} = {};

async function ensureLoaded() {
  if (cache.loaded) return;
  const [projects, updates, contact] = await Promise.all([
    fetch("/api/admin/projects").then((r) => (r.ok ? r.json() : [])),
    fetch("/api/admin/updates").then((r) => (r.ok ? r.json() : [])),
    fetch("/api/admin/contact").then((r) => (r.ok ? r.json() : null)),
  ]);
  cache.projects = projects ?? [];
  cache.updates = updates ?? [];
  cache.contact = contact;
  cache.loaded = true;
}

export async function upsertProject(p: AdminProject) {
  await ensureLoaded();
  const list = (cache.projects ?? []).slice();
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx >= 0) {
    await fetch(`/api/admin/projects/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    list[idx] = p;
  } else {
    await fetch("/api/admin/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(p),
    });
    list.unshift(p);
  }
  cache.projects = list;
  notify();
}

export async function deleteProject(id: string) {
  await ensureLoaded();
  await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
  cache.projects = (cache.projects ?? []).filter((p) => p.id !== id);
  notify();
}

export async function upsertUpdate(u: AdminUpdate) {
  await ensureLoaded();
  const list = (cache.updates ?? []).slice();
  const idx = list.findIndex((x) => x.id === u.id);
  if (idx >= 0) {
    await fetch(`/api/admin/updates/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(u),
    });
    list[idx] = u;
  } else {
    await fetch("/api/admin/updates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(u),
    });
    list.unshift(u);
  }
  cache.updates = list;
  notify();
}

export async function deleteUpdate(id: string) {
  await ensureLoaded();
  await fetch(`/api/admin/updates/${id}`, { method: "DELETE" });
  cache.updates = (cache.updates ?? []).filter((u) => u.id !== id);
  notify();
}

export async function setContact(value: AdminContact | null) {
  await ensureLoaded();
  await fetch("/api/admin/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(value),
  });
  cache.contact = value;
  notify();
}

function subscribe(fn: Listener): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function useAdminData() {
  const [tick, setTick] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    ensureLoaded().then(() => {
      if (alive) setLoaded(true);
    });
    return subscribe(() => setTick((n) => n + 1));
  }, []);

  return {
    loaded,
    projects: cache.projects ?? [],
    updates: cache.updates ?? [],
    contact: cache.contact ?? null,
    tick,
  };
}

export function newId(prefix = "x"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
