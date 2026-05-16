import { NextRequest, NextResponse } from "next/server";
import { redis, RKEYS } from "@/lib/redis";
import { checkSession } from "@/lib/session";
import type { AdminProject } from "@/lib/admin-store";

export async function GET() {
  const projects = await redis.get<AdminProject[]>(RKEYS.projects) ?? [];
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  if (!(await checkSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const project: AdminProject = await req.json();
  const list = await redis.get<AdminProject[]>(RKEYS.projects) ?? [];
  list.unshift(project);
  await redis.set(RKEYS.projects, list);
  return NextResponse.json(project);
}

// Persist a reordered list (admin-only organization; the public site sorts
// by createdAt so this never changes what visitors see).
export async function PUT(req: NextRequest) {
  if (!(await checkSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const list: AdminProject[] = await req.json();
  if (!Array.isArray(list)) return NextResponse.json({ error: "Expected an array" }, { status: 400 });
  await redis.set(RKEYS.projects, list);
  return NextResponse.json({ ok: true });
}
