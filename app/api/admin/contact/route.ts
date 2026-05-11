import { NextRequest, NextResponse } from "next/server";
import { redis, RKEYS } from "@/lib/redis";
import { checkSession } from "@/lib/session";
import type { AdminContact } from "@/lib/admin-store";

export async function GET() {
  const contact = await redis.get<AdminContact>(RKEYS.contact);
  return NextResponse.json(contact ?? null);
}

export async function POST(req: NextRequest) {
  if (!(await checkSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const contact: AdminContact = await req.json();
  await redis.set(RKEYS.contact, contact);
  return NextResponse.json(contact);
}
