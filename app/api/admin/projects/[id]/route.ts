import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { redis, RKEYS } from "@/lib/redis";
import { checkSession } from "@/lib/session";
import type { AdminProject } from "@/lib/admin-store";

const isBlobUrl = (url: string) => url.includes(".public.blob.vercel-storage.com");

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
    const blobUrls = [target.hero, ...target.gallery].filter(
      (url): url is string => typeof url === "string" && isBlobUrl(url),
    );
    if (blobUrls.length > 0) await del(blobUrls);
  }

  await redis.set(RKEYS.projects, list.filter((p) => p.id !== id));
  return NextResponse.json({ ok: true });
}
