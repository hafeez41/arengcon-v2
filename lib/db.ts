import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * KV shim backed by Cloudflare D1. Exposes the small surface the app uses —
 * `kv.get / set / del` — over a single `kv(k, v, expires_at)` table.
 *
 * Schema (one-time, run in D1 console):
 *   CREATE TABLE IF NOT EXISTS kv (
 *     k TEXT PRIMARY KEY,
 *     v TEXT NOT NULL,
 *     expires_at INTEGER
 *   );
 */

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

async function sweepExpired(): Promise<void> {
  // Cheap opportunistic cleanup — runs when a TTL row is set, deletes a
  // capped batch of expired rows. D1 has no native TTL so we sweep manually.
  await db()
    .prepare(
      "DELETE FROM kv WHERE k IN (SELECT k FROM kv WHERE expires_at IS NOT NULL AND expires_at < ?1 LIMIT 100)",
    )
    .bind(nowSec())
    .run();
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
  if (expiresAt !== null) {
    // Fire-and-forget: don't block the response on sweep.
    sweepExpired().catch(() => {});
  }
}

async function del(key: string): Promise<void> {
  await db().prepare("DELETE FROM kv WHERE k = ?1").bind(key).run();
}

export const kv = { get, set, del };

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
