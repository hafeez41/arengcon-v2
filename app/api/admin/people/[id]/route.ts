import { NextRequest, NextResponse } from "next/server";
import { deleteFromR2, isR2Url } from "@/lib/r2";
import { redis, RKEYS } from "@/lib/redis";
import { checkSession } from "@/lib/session";
import type { AdminPerson } from "@/lib/admin-store";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await checkSession(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const updated: AdminPerson = await req.json();
  const list = (await redis.get<AdminPerson[]>(RKEYS.people)) ?? [];
  const idx = list.findIndex((p) => p.id === id);
  if (idx >= 0) {
    const prev = list[idx];
    // Free the old portrait from R2 if it was replaced or cleared.
    if (isR2Url(prev.photo) && prev.photo !== updated.photo) {
      await deleteFromR2(prev.photo);
    }
    list[idx] = updated;
  } else {
    list.push(updated);
  }
  await redis.set(RKEYS.people, list);
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  if (!(await checkSession(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const list = (await redis.get<AdminPerson[]>(RKEYS.people)) ?? [];
  const target = list.find((p) => p.id === id);

  if (target?.photo) {
    await deleteFromR2(target.photo); // ignores non-R2 URLs internally
  }

  await redis.set(
    RKEYS.people,
    list.filter((p) => p.id !== id),
  );
  return NextResponse.json({ ok: true });
}
