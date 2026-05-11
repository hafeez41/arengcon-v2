import { NextRequest, NextResponse } from "next/server";
import { createHash, randomUUID } from "crypto";
import { redis, RKEYS } from "@/lib/redis";
import { COOKIE_NAME, SESSION_TTL } from "@/lib/session";

const DEFAULT_EMAIL = "guyworking2@gmail.com";
const DEFAULT_PASSWORD = "pass123";

type StoredCreds = { email: string; hash: string };

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
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ ok: false });
  const val = await redis.get(RKEYS.session(token));
  return NextResponse.json({ ok: val === "1" });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.action === "logout") {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (token) await redis.del(RKEYS.session(token));
    const res = NextResponse.json({ ok: true });
    res.cookies.delete(COOKIE_NAME);
    return res;
  }

  const { email, password } = body as { email: string; password: string };
  const creds = await getCreds();

  if (
    email.trim().toLowerCase() !== creds.email.toLowerCase() ||
    hash(password) !== creds.hash
  ) {
    return NextResponse.json({ ok: false, error: "Invalid email or password" });
  }

  const token = randomUUID();
  await redis.set(RKEYS.session(token), "1", { ex: SESSION_TTL });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: SESSION_TTL,
    path: "/",
  });
  return res;
}
