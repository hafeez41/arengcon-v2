import { NextRequest, NextResponse } from "next/server";
import { redis, RKEYS } from "@/lib/redis";
import { checkSession } from "@/lib/session";
import { hashPassword, getAdminCreds, type StoredCreds } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  if (!(await checkSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const creds = await getAdminCreds();
  return NextResponse.json({ email: creds?.email ?? "" });
}

export async function PUT(req: NextRequest) {
  if (!(await checkSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { currentPassword, newEmail, newPassword } = await req.json();
  const creds = await getAdminCreds();
  if (!creds || hashPassword(currentPassword) !== creds.hash) {
    return NextResponse.json({ ok: false, error: "Current password is incorrect" });
  }
  const next: StoredCreds = {
    email: newEmail?.trim() || creds.email,
    hash: newPassword ? hashPassword(newPassword) : creds.hash,
  };
  await redis.set(RKEYS.credentials, next);
  return NextResponse.json({ ok: true });
}
