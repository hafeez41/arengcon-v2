import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { redis, RKEYS } from "@/lib/redis";
import { checkSession } from "@/lib/session";

type StoredCreds = { email: string; hash: string };

const DEFAULT_EMAIL = "guyworking2@gmail.com";
const DEFAULT_PASSWORD = "pass123";

function hash(p: string) {
  return createHash("sha256").update(p).digest("hex");
}

async function getCreds(): Promise<StoredCreds> {
  const stored = await redis.get<StoredCreds>(RKEYS.credentials);
  if (stored) return stored;
  const fresh: StoredCreds = { email: DEFAULT_EMAIL, hash: hash(DEFAULT_PASSWORD) };
  await redis.set(RKEYS.credentials, fresh);
  return fresh;
}

export async function GET(req: NextRequest) {
  if (!(await checkSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const creds = await getCreds();
  return NextResponse.json({ email: creds.email });
}

export async function PUT(req: NextRequest) {
  if (!(await checkSession(req))) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { currentPassword, newEmail, newPassword } = await req.json();
  const creds = await getCreds();
  if (hash(currentPassword) !== creds.hash) {
    return NextResponse.json({ ok: false, error: "Current password is incorrect" });
  }
  const next: StoredCreds = {
    email: newEmail?.trim() || creds.email,
    hash: newPassword ? hash(newPassword) : creds.hash,
  };
  await redis.set(RKEYS.credentials, next);
  return NextResponse.json({ ok: true });
}
