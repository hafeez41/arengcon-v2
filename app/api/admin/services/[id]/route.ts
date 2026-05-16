import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { redis, RKEYS } from "@/lib/redis";
import { checkSession } from "@/lib/session";
import type { AdminService } from "@/lib/admin-store";

const isBlobUrl = (url: unknown): url is string =>
  typeof url === "string" && url.includes(".public.blob.vercel-storage.com");

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await checkSession(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const updated: AdminService = await req.json();
  const list = (await redis.get<AdminService[]>(RKEYS.services)) ?? [];
  const idx = list.findIndex((s) => s.id === id);

  // If the image was swapped out, free the old Blob object so storage
  // doesn't leak on edits.
  if (idx >= 0) {
    const prev = list[idx];
    if (
      isBlobUrl(prev.image) &&
      prev.image !== updated.image
    ) {
      await del(prev.image);
    }
    list[idx] = updated;
  } else {
    list.push(updated);
  }
  await redis.set(RKEYS.services, list);
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await checkSession(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const list = (await redis.get<AdminService[]>(RKEYS.services)) ?? [];
  const target = list.find((s) => s.id === id);

  if (target && isBlobUrl(target.image)) {
    await del(target.image);
  }

  await redis.set(
    RKEYS.services,
    list.filter((s) => s.id !== id),
  );
  return NextResponse.json({ ok: true });
}
