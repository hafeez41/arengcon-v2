"use client";

import { useMemo } from "react";
import {
  useAdminData,
  type AdminProject,
  type AdminUpdate,
  type AdminContact,
  DEFAULT_CONTACT,
} from "./admin-store";
import { type Project, projects as placeholderProjects } from "./projects";
import { type Update, updates as placeholderUpdates } from "./updates";

function adminProjectToProject(p: AdminProject): Project {
  return {
    slug: p.id,
    title: p.title,
    client: p.client,
    location: p.location,
    year: p.year,
    category: p.category,
    subcategory: p.subcategory,
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
    // Public order is fixed to newest-first by createdAt, independent of the
    // stored array order — so admin drag-reordering never affects the site.
    const real = [...projects]
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(adminProjectToProject);
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
    const real = [...updates]
      .sort((a, b) => b.createdAt - a.createdAt)
      .map(adminUpdateToUpdate);
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
  // Always return a usable contact — admin overrides individual fields,
  // defaults fill in anything left blank.
  const merged: AdminContact = useMemo(() => {
    if (!contact) return DEFAULT_CONTACT;
    return {
      emails: contact.emails?.length ? contact.emails : DEFAULT_CONTACT.emails,
      phones: contact.phones?.length ? contact.phones : DEFAULT_CONTACT.phones,
      office: {
        location: contact.office?.location || DEFAULT_CONTACT.office.location,
        hours: contact.office?.hours || DEFAULT_CONTACT.office.hours,
      },
      social: contact.social ?? {},
    };
  }, [contact]);
  return { loaded, contact: merged, isCustom: !!contact };
}

export function projectGallery(p: Project, adminProjects: AdminProject[]): string[] {
  const admin = adminProjects.find((ap) => ap.id === p.slug);
  if (admin && admin.gallery.length > 0) {
    return [admin.hero, ...admin.gallery];
  }
  // No admin gallery — render the hero only. Avoid third-party placeholder
  // images leaking into production.
  return [p.image];
}

