import { NextRequest, NextResponse } from "next/server";
import { deleteFromR2 } from "@/lib/r2";
import { kv, RKEYS } from "@/lib/db";
import { checkSession } from "@/lib/session";
import type { AdminProject } from "@/lib/admin-store";

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await checkSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const updated = (await req.json()) as AdminProject;
  const list = await kv.get<AdminProject[]>(RKEYS.projects) ?? [];
  const idx = list.findIndex((p) => p.id === id);

  if (idx >= 0) {
    // Free any R2 images that this edit replaced — hero swap + any gallery
    // items removed/replaced. Avoids leaking storage on every edit.
    const prev = list[idx];
    const stale: string[] = [];
    if (prev.hero && prev.hero !== updated.hero) stale.push(prev.hero);
    const nextGallery = new Set(updated.gallery);
    for (const g of prev.gallery) if (!nextGallery.has(g)) stale.push(g);
    if (stale.length > 0) await deleteFromR2(stale);
    list[idx] = updated;
  } else {
    list.unshift(updated);
  }
  await kv.set(RKEYS.projects, list);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await checkSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const list = await kv.get<AdminProject[]>(RKEYS.projects) ?? [];
  const target = list.find((p) => p.id === id);

  if (target) {
    // deleteFromR2 internally ignores any non-R2 URLs (old Blob/Unsplash/etc).
    await deleteFromR2([target.hero, ...target.gallery].filter(Boolean));
  }

  await kv.set(RKEYS.projects, list.filter((p) => p.id !== id));
  return NextResponse.json({ ok: true });
}
