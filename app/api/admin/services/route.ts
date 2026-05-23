import { NextRequest, NextResponse } from "next/server";
import { kv, RKEYS } from "@/lib/db";
import { checkSession } from "@/lib/session";
import type { AdminService } from "@/lib/admin-store";

export async function GET() {
  const services = (await kv.get<AdminService[]>(RKEYS.services)) ?? [];
  return NextResponse.json(services);
}

export async function POST(req: NextRequest) {
  if (!(await checkSession(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const service = (await req.json()) as AdminService;
  const list = (await kv.get<AdminService[]>(RKEYS.services)) ?? [];
  list.push(service); // ordered list — append to the end
  await kv.set(RKEYS.services, list);
  return NextResponse.json(service);
}

// Persist a reordered list.
export async function PUT(req: NextRequest) {
  if (!(await checkSession(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const list = (await req.json()) as AdminService[];
  if (!Array.isArray(list))
    return NextResponse.json({ error: "Expected an array" }, { status: 400 });
  await kv.set(RKEYS.services, list);
  return NextResponse.json({ ok: true });
}
