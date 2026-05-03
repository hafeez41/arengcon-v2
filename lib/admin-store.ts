"use client";

import { useEffect, useState } from "react";
import { idbGet, idbSet } from "./idb";
import type { Category } from "./projects";

export type AdminProject = {
  id: string;
  title: string;
  category: Category;
  client: string;
  location: string;
  year: number;
  status: "Built" | "In Progress" | "Concept";
  size: string;
  summary: string;
  description: string;
  hero: string;
  gallery: string[];
  videoUrl?: string;
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
  videoUrl?: string;
  createdAt: number;
};

export type AdminContactOffice = {
  id: string;
  city: string;
  address: string;
  email: string;
  phone: string;
};

export type AdminContact = {
  email: string;
  offices: AdminContactOffice[];
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

async function ensureLoaded() {
  if (cache.loaded) return;
  const [projects, updates, contact] = await Promise.all([
    idbGet<AdminProject[]>(KEYS.projects),
    idbGet<AdminUpdate[]>(KEYS.updates),
    idbGet<AdminContact>(KEYS.contact),
  ]);
  cache.projects = projects ?? [];
  cache.updates = updates ?? [];
  cache.contact = contact ?? null;
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
