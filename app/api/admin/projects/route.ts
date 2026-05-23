import { NextRequest, NextResponse } from "next/server";
import { kv, RKEYS } from "@/lib/db";
import { checkSession } from "@/lib/session";
import type { AdminProject } from "@/lib/admin-store";

export async function GET() {
  const projects = await kv.get<AdminProject[]>(RKEYS.projects) ?? [];
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  if (!(await checkSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const project = (await req.json()) as AdminProject;
  const list = await kv.get<AdminProject[]>(RKEYS.projects) ?? [];
  list.unshift(project);
  await kv.set(RKEYS.projects, list);
  return NextResponse.json(project);
}

// Persist a reordered list (admin-only organization; the public site sorts
// by createdAt so this never changes what visitors see).
export async function PUT(req: NextRequest) {
  if (!(await checkSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const list = (await req.json()) as AdminProject[];
  if (!Array.isArray(list)) return NextResponse.json({ error: "Expected an array" }, { status: 400 });
  await kv.set(RKEYS.projects, list);
  return NextResponse.json({ ok: true });
}
