import { NextRequest, NextResponse } from "next/server";
import { redis, RKEYS } from "@/lib/redis";
import { checkSession } from "@/lib/session";
import type { AdminUpdate } from "@/lib/admin-store";

export async function GET() {
  const updates = await redis.get<AdminUpdate[]>(RKEYS.updates) ?? [];
  return NextResponse.json(updates);
}

export async function POST(req: NextRequest) {
  if (!(await checkSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const update = (await req.json()) as AdminUpdate;
  const list = await redis.get<AdminUpdate[]>(RKEYS.updates) ?? [];
  list.unshift(update);
  await redis.set(RKEYS.updates, list);
  return NextResponse.json(update);
}

// Persist a reordered list (admin-only; public site sorts by createdAt).
export async function PUT(req: NextRequest) {
  if (!(await checkSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const list = (await req.json()) as AdminUpdate[];
  if (!Array.isArray(list)) return NextResponse.json({ error: "Expected an array" }, { status: 400 });
  await redis.set(RKEYS.updates, list);
  return NextResponse.json({ ok: true });
}
