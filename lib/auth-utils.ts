import { createHash } from "crypto";
import { redis, RKEYS } from "./redis";

export type StoredCreds = { email: string; hash: string };

export function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export async function getAdminCreds(): Promise<StoredCreds | null> {
  const stored = await redis.get<StoredCreds>(RKEYS.credentials);
  if (stored) return stored;

  const email = process.env.ADMIN_DEFAULT_EMAIL;
  const password = process.env.ADMIN_DEFAULT_PASSWORD;
  if (!email || !password) return null;

  const fresh: StoredCreds = { email, hash: hashPassword(password) };
  await redis.set(RKEYS.credentials, fresh);
  return fresh;
}
