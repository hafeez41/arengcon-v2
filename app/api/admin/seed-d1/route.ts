import { NextResponse } from "next/server";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import seedData from "@/lib/seed-data.json";

/**
 * One-shot D1 seed endpoint. Idempotent: creates the kv table if needed,
 * then inserts the dumped Upstash data only when the table is empty.
 * Hit once after the Worker is deployed and the D1 binding is wired up.
 * Safe to leave in place — re-hitting after the first run is a no-op.
 */

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(): Promise<T | null>;
  run(): Promise<unknown>;
}
interface D1Binding {
  prepare(query: string): D1PreparedStatement;
}

export async function GET() {
  const env = getCloudflareContext().env as { DB?: D1Binding };
  if (!env.DB) {
    return NextResponse.json(
      { ok: false, error: "D1 binding missing" },
      { status: 500 },
    );
  }
  const db = env.DB;

  await db
    .prepare(
      "CREATE TABLE IF NOT EXISTS kv (k TEXT PRIMARY KEY, v TEXT NOT NULL, expires_at INTEGER)",
    )
    .run();

  const existing = await db
    .prepare("SELECT COUNT(*) AS n FROM kv WHERE k LIKE 'arengcon:%' AND k NOT LIKE 'arengcon:session:%'")
    .first<{ n: number }>();

  if (existing && existing.n > 0) {
    return NextResponse.json({ ok: true, status: "already_seeded", keys: existing.n });
  }

  const data = seedData as Record<string, string>;
  let inserted = 0;
  for (const [k, v] of Object.entries(data)) {
    await db
      .prepare("INSERT OR REPLACE INTO kv (k, v, expires_at) VALUES (?1, ?2, NULL)")
      .bind(k, v)
      .run();
    inserted++;
  }

  return NextResponse.json({ ok: true, status: "seeded", inserted });
}
