import { NextRequest, NextResponse } from "next/server";
import { deleteFromR2 } from "@/lib/r2";
import { redis, RKEYS } from "@/lib/redis";
import { checkSession } from "@/lib/session";
import type { AdminProject } from "@/lib/admin-store";

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await checkSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const updated: AdminProject = await req.json();
  const list = await redis.get<AdminProject[]>(RKEYS.projects) ?? [];
  const idx = list.findIndex((p) => p.id === id);
  if (idx >= 0) list[idx] = updated;
  else list.unshift(updated);
  await redis.set(RKEYS.projects, list);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await checkSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const list = await redis.get<AdminProject[]>(RKEYS.projects) ?? [];
  const target = list.find((p) => p.id === id);

  if (target) {
    // deleteFromR2 internally ignores any non-R2 URLs (old Blob/Unsplash/etc).
    await deleteFromR2([target.hero, ...target.gallery].filter(Boolean));
  }

  await redis.set(RKEYS.projects, list.filter((p) => p.id !== id));
  return NextResponse.json({ ok: true });
}
