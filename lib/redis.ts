import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Drop-in KV shim backed by Cloudflare D1. Keeps the original
 * `redis.get / set / del` surface so call sites don't change.
 *
 * Schema (one-time, run in D1 console):
 *   CREATE TABLE IF NOT EXISTS kv (
 *     k TEXT PRIMARY KEY,
 *     v TEXT NOT NULL,
 *     expires_at INTEGER
 *   );
 */

// Minimal D1 binding shape — only what we use, declared locally so the
// global Workers types don't override DOM Response.json() and break client
// code (same approach as lib/r2.ts).
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<unknown>;
}
interface D1Binding {
  prepare(query: string): D1PreparedStatement;
}

function db(): D1Binding {
  const env = getCloudflareContext().env as { DB?: D1Binding };
  if (!env.DB) throw new Error("D1 binding missing (check wrangler.jsonc)");
  return env.DB;
}

function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}

async function get<T = unknown>(key: string): Promise<T | null> {
  const row = await db()
    .prepare(
      "SELECT v FROM kv WHERE k = ?1 AND (expires_at IS NULL OR expires_at > ?2)",
    )
    .bind(key, nowSec())
    .first<{ v: string }>();
  if (!row) return null;
  try {
    return JSON.parse(row.v) as T;
  } catch {
    return row.v as unknown as T;
  }
}

interface SetOptions {
  ex?: number;
}

async function set(
  key: string,
  value: unknown,
  options?: SetOptions,
): Promise<void> {
  const v = typeof value === "string" ? value : JSON.stringify(value);
  const expiresAt = options?.ex ? nowSec() + options.ex : null;
  await db()
    .prepare("INSERT OR REPLACE INTO kv (k, v, expires_at) VALUES (?1, ?2, ?3)")
    .bind(key, v, expiresAt)
    .run();
}

async function del(key: string): Promise<void> {
  await db().prepare("DELETE FROM kv WHERE k = ?1").bind(key).run();
}

export const redis = { get, set, del };

export const RKEYS = {
  projects:    "arengcon:projects",
  updates:     "arengcon:updates",
  services:    "arengcon:services",
  contact:     "arengcon:contact",
  about:       "arengcon:about",
  people:      "arengcon:people",
  credentials: "arengcon:credentials",
  session:     (token: string) => `arengcon:session:${token}`,
} as const;
