import { NextRequest, NextResponse } from "next/server";
import { kv, RKEYS } from "@/lib/db";
import { checkSession } from "@/lib/session";
import type { AdminPerson } from "@/lib/admin-store";

export async function GET() {
  const people = (await kv.get<AdminPerson[]>(RKEYS.people)) ?? [];
  return NextResponse.json(people);
}

export async function POST(req: NextRequest) {
  if (!(await checkSession(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const person = (await req.json()) as AdminPerson;
  const list = (await kv.get<AdminPerson[]>(RKEYS.people)) ?? [];
  list.push(person);
  await kv.set(RKEYS.people, list);
  return NextResponse.json(person);
}

// Reorder — admin drag-reorder sends the whole array.
export async function PUT(req: NextRequest) {
  if (!(await checkSession(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const list = (await req.json()) as AdminPerson[];
  await kv.set(RKEYS.people, list);
  return NextResponse.json({ ok: true });
}
