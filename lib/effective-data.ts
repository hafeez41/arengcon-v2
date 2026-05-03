"use client";

import { useMemo } from "react";
import { useAdminData, type AdminProject, type AdminUpdate, type AdminContact } from "./admin-store";
import { type Project, type Category, projects as placeholderProjects } from "./projects";
import { type Update, updates as placeholderUpdates } from "./updates";

function adminProjectToProject(p: AdminProject): Project {
  return {
    slug: p.id,
    title: p.title,
    client: p.client,
    location: p.location,
    year: p.year,
    category: p.category,
    status: p.status,
    size: p.size,
    summary: p.summary,
    description: p.description.split("\n\n").map((s) => s.trim()).filter(Boolean),
    image: p.hero,
    accent: "#2a3d4a",
  };
}

function adminUpdateToUpdate(u: AdminUpdate): Update {
  return {
    slug: u.id,
    title: u.title,
    excerpt: u.excerpt,
    body: u.body.split("\n\n").map((s) => s.trim()).filter(Boolean),
    date: u.date,
    kind: u.kind,
    image: u.hero ?? "",
  };
}

export function useEffectiveProjects() {
  const { projects, loaded } = useAdminData();
  return useMemo(() => {
    const real = projects.map(adminProjectToProject);
    return {
      loaded,
      list: real.length > 0 ? real : placeholderProjects,
      isPlaceholder: real.length === 0,
      adminProjects: projects,
    };
  }, [projects, loaded]);
}

export function useEffectiveUpdates() {
  const { updates, loaded } = useAdminData();
  return useMemo(() => {
    const real = updates.map(adminUpdateToUpdate);
    return {
      loaded,
      list: real.length > 0 ? real : placeholderUpdates,
      isPlaceholder: real.length === 0,
      adminUpdates: updates,
    };
  }, [updates, loaded]);
}

export function useEffectiveContact() {
  const { contact, loaded } = useAdminData();
  return { loaded, contact: contact as AdminContact | null };
}

export function projectsByCategoryFiltered(list: Project[], cat: Category): Project[] {
  return list.filter((p) => p.category === cat);
}

export function findProject(list: Project[], slug: string): Project | undefined {
  return list.find((p) => p.slug === slug);
}

export function findUpdate(list: Update[], slug: string): Update | undefined {
  return list.find((u) => u.slug === slug);
}

export function projectGallery(p: Project, adminProjects: AdminProject[]): string[] {
  const admin = adminProjects.find((ap) => ap.id === p.slug);
  if (admin && admin.gallery.length > 0) {
    return [admin.hero, ...admin.gallery];
  }
  return [
    p.image,
    `https://picsum.photos/seed/${p.slug}-2/1600/1100`,
    `https://picsum.photos/seed/${p.slug}-3/1600/1100`,
    `https://picsum.photos/seed/${p.slug}-4/1600/1100`,
    `https://picsum.photos/seed/${p.slug}-5/1600/1100`,
  ];
}

export function projectVideo(p: Project, adminProjects: AdminProject[]): string | null {
  const admin = adminProjects.find((ap) => ap.id === p.slug);
  return admin?.videoUrl ?? null;
}

export function updateVideo(u: Update, adminUpdates: AdminUpdate[]): string | null {
  const admin = adminUpdates.find((au) => au.id === u.slug);
  return admin?.videoUrl ?? null;
}
