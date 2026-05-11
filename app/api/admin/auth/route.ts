import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { redis, RKEYS } from "@/lib/redis";
import { COOKIE_NAME, SESSION_TTL } from "@/lib/session";
import { hashPassword, getAdminCreds } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ ok: false });
  const val = await redis.get(RKEYS.session(token));
  return NextResponse.json({ ok: val !== null });
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
  const creds = await getAdminCreds();

  if (!creds || email.trim().toLowerCase() !== creds.email.toLowerCase() || hashPassword(password) !== creds.hash) {
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
