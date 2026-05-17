import { NextRequest, NextResponse } from "next/server";
import { deleteFromR2, isR2Url } from "@/lib/r2";
import { redis, RKEYS } from "@/lib/redis";
import { checkSession } from "@/lib/session";
import type { AdminService } from "@/lib/admin-store";

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
    if (isR2Url(prev.image) && prev.image !== updated.image) {
      await deleteFromR2(prev.image);
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

  if (target?.image) {
    await deleteFromR2(target.image); // ignores non-R2 URLs internally
  }

  await redis.set(
    RKEYS.services,
    list.filter((s) => s.id !== id),
  );
  return NextResponse.json({ ok: true });
}
