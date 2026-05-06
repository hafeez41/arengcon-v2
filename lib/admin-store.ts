"use client";

import { useEffect, useState } from "react";
import { idbGet, idbSet } from "./idb";
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

const KEYS = {
  projects: "admin:projects",
  updates: "admin:updates",
  contact: "admin:contact",
} as const;

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

function migrateContact(raw: unknown): AdminContact | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  // New shape already
  if (Array.isArray(r.emails) && Array.isArray(r.phones) && r.office && r.social) {
    return r as unknown as AdminContact;
  }
  // Old shape: { email: string, offices: [{ city, address, email, phone }] }
  if (typeof r.email === "string" || Array.isArray(r.offices)) {
    const offices = (r.offices as Array<Record<string, string>> | undefined) ?? [];
    const emails = [r.email as string, ...offices.map((o) => o?.email)]
      .filter((e): e is string => !!e && /@/.test(e));
    const phones = offices
      .map((o) => o?.phone)
      .filter((p): p is string => !!p);
    const first = offices[0];
    return {
      emails: emails.length ? Array.from(new Set(emails)) : [],
      phones: phones.length ? phones : [],
      office: {
        location: first?.city ?? "",
        hours: "",
      },
      social: {},
    };
  }
  return null;
}

async function ensureLoaded() {
  if (cache.loaded) return;
  const [projects, updates, contactRaw] = await Promise.all([
    idbGet<AdminProject[]>(KEYS.projects),
    idbGet<AdminUpdate[]>(KEYS.updates),
    idbGet<unknown>(KEYS.contact),
  ]);
  cache.projects = projects ?? [];
  cache.updates = updates ?? [];
  cache.contact = migrateContact(contactRaw);
  cache.loaded = true;
}

async function persistProjects(items: AdminProject[]) {
  cache.projects = items;
  await idbSet(KEYS.projects, items);
  notify();
}

async function persistUpdates(items: AdminUpdate[]) {
  cache.updates = items;
  await idbSet(KEYS.updates, items);
  notify();
}

async function persistContact(value: AdminContact | null) {
  cache.contact = value;
  await idbSet(KEYS.contact, value);
  notify();
}

export async function listProjects(): Promise<AdminProject[]> {
  await ensureLoaded();
  return cache.projects ?? [];
}

export async function listUpdates(): Promise<AdminUpdate[]> {
  await ensureLoaded();
  return cache.updates ?? [];
}

export async function getContact(): Promise<AdminContact | null> {
  await ensureLoaded();
  return cache.contact ?? null;
}

export async function upsertProject(p: AdminProject) {
  await ensureLoaded();
  const list = (cache.projects ?? []).slice();
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx >= 0) list[idx] = p;
  else list.unshift(p);
  await persistProjects(list);
}

export async function deleteProject(id: string) {
  await ensureLoaded();
  await persistProjects((cache.projects ?? []).filter((p) => p.id !== id));
}

export async function upsertUpdate(u: AdminUpdate) {
  await ensureLoaded();
  const list = (cache.updates ?? []).slice();
  const idx = list.findIndex((x) => x.id === u.id);
  if (idx >= 0) list[idx] = u;
  else list.unshift(u);
  await persistUpdates(list);
}

export async function deleteUpdate(id: string) {
  await ensureLoaded();
  await persistUpdates((cache.updates ?? []).filter((u) => u.id !== id));
}

export async function setContact(value: AdminContact | null) {
  await ensureLoaded();
  await persistContact(value);
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
