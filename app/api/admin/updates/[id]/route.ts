import { NextRequest, NextResponse } from "next/server";
import { deleteFromR2 } from "@/lib/r2";
import { kv, RKEYS } from "@/lib/db";
import { checkSession } from "@/lib/session";
import type { AdminUpdate } from "@/lib/admin-store";

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await checkSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const updated = (await req.json()) as AdminUpdate;
  const list = await kv.get<AdminUpdate[]>(RKEYS.updates) ?? [];
  const idx = list.findIndex((u) => u.id === id);
  if (idx >= 0) list[idx] = updated;
  else list.unshift(updated);
  await kv.set(RKEYS.updates, list);
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!(await checkSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await context.params;
  const list = await kv.get<AdminUpdate[]>(RKEYS.updates) ?? [];
  const target = list.find((u) => u.id === id);

  if (target?.hero) {
    await deleteFromR2(target.hero); // ignores non-R2 URLs internally
  }

  await kv.set(RKEYS.updates, list.filter((u) => u.id !== id));
  return NextResponse.json({ ok: true });
}
