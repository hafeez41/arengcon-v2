import { NextRequest, NextResponse } from "next/server";
import { kv, RKEYS } from "@/lib/db";
import { checkSession } from "@/lib/session";
import type { AdminContact } from "@/lib/admin-store";

export async function GET() {
  const contact = await kv.get<AdminContact>(RKEYS.contact);
  return NextResponse.json(contact ?? null);
}

export async function POST(req: NextRequest) {
  if (!(await checkSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const contact = (await req.json()) as AdminContact;
  await kv.set(RKEYS.contact, contact);
  return NextResponse.json(contact);
}
