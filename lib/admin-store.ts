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

export type AdminService = {
  id: string;
  title: string;
  desc: string;
  image: string;
  createdAt: number;
};

// Shown on the public Services page until the admin adds their own. Images
// are stock Unsplash; once a real service is added these disappear entirely
// (same placeholder behaviour as projects/updates).
export const DEFAULT_SERVICES: AdminService[] = [
  { id: "svc-d1", title: "Architectural Solutions", desc: "From concept through technical documentation to construction administration — comprehensive architectural services at every stage of a project's life.", image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=640&q=70", createdAt: 1 },
  { id: "svc-d2", title: "Construction", desc: "Full-service construction management and contracting, delivering projects on programme and to specification across all typologies.", image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=640&q=70", createdAt: 2 },
  { id: "svc-d3", title: "Interior Solutions", desc: "Interior design that goes beyond surface — material selection, spatial planning, lighting, and joinery resolved with the same rigour as the building envelope.", image: "https://images.unsplash.com/photo-1618219740975-d40978bb7378?auto=format&fit=crop&w=640&q=70", createdAt: 3 },
  { id: "svc-d4", title: "Landscape", desc: "Landscape architecture and planting design rooted in ecological knowledge and local material culture, from intimate courtyards to large-scale ground planes.", image: "https://images.unsplash.com/photo-1558904541-efa843a96f01?auto=format&fit=crop&w=640&q=70", createdAt: 4 },
  { id: "svc-d5", title: "Civil Engineering", desc: "Site infrastructure, drainage, roads, and earthworks — engineered to support the built fabric above and around it.", image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=640&q=70", createdAt: 5 },
  { id: "svc-d6", title: "Electrical Engineering", desc: "Integrated electrical systems design, from power distribution and lighting controls to renewable energy installations.", image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=640&q=70", createdAt: 6 },
  { id: "svc-d7", title: "Mechanical Engineering", desc: "HVAC, plumbing, and fire suppression systems designed for tropical climates and coordinated with the architectural intent.", image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=640&q=70", createdAt: 7 },
  { id: "svc-d8", title: "Infrastructural Solutions", desc: "Large-scale infrastructure planning and delivery — roads, utilities, and public realm — for developers and municipal clients.", image: "https://images.unsplash.com/photo-1473042904451-00171c69419d?auto=format&fit=crop&w=640&q=70", createdAt: 8 },
];

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
  services?: AdminService[];
  contact?: AdminContact | null;
  loaded?: boolean;
} = {};

async function ensureLoaded() {
  if (cache.loaded) return;
  const [projects, updates, services, contact] = await Promise.all([
    fetch("/api/admin/projects").then((r) => (r.ok ? r.json() : [])),
    fetch("/api/admin/updates").then((r) => (r.ok ? r.json() : [])),
    fetch("/api/admin/services").then((r) => (r.ok ? r.json() : [])),
    fetch("/api/admin/contact").then((r) => (r.ok ? r.json() : null)),
  ]);
  cache.projects = projects ?? [];
  cache.updates = updates ?? [];
  cache.services = services ?? [];
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

// Admin-only reorder. Updates the cache + UI immediately, then persists the
// new array order. The public site sorts by createdAt so this is invisible
// to visitors — purely for organizing the admin list.
export async function reorderProjects(list: AdminProject[]) {
  await ensureLoaded();
  cache.projects = list.slice();
  notify();
  await fetch("/api/admin/projects", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(list),
  });
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

// Admin-only reorder (see reorderProjects). Invisible to the public site.
export async function reorderUpdates(list: AdminUpdate[]) {
  await ensureLoaded();
  cache.updates = list.slice();
  notify();
  await fetch("/api/admin/updates", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(list),
  });
}

export async function upsertService(s: AdminService) {
  await ensureLoaded();
  const list = (cache.services ?? []).slice();
  const idx = list.findIndex((x) => x.id === s.id);
  if (idx >= 0) {
    await fetch(`/api/admin/services/${s.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    list[idx] = s;
  } else {
    await fetch("/api/admin/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    });
    list.push(s); // services are an ordered list; append to the end
  }
  cache.services = list;
  notify();
}

export async function deleteService(id: string) {
  await ensureLoaded();
  await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
  cache.services = (cache.services ?? []).filter((s) => s.id !== id);
  notify();
}

// Admin-only reorder of the services list (it IS the public order here —
// services are an inherently ordered 01..N list, unlike projects).
export async function reorderServices(list: AdminService[]) {
  await ensureLoaded();
  cache.services = list.slice();
  notify();
  await fetch("/api/admin/services", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(list),
  });
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
    services: cache.services ?? [],
    contact: cache.contact ?? null,
    tick,
  };
}

export function newId(prefix = "x"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
