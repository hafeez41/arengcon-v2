import type { NextRequest } from "next/server";
import { kv, RKEYS } from "./db";

export const COOKIE_NAME = "arengcon-admin-session";
export const SESSION_TTL = 60 * 60 * 24; // 24 h

export async function checkSession(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const val = await kv.get(RKEYS.session(token));
  return val !== null;
}
