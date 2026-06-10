import { NextRequest, NextResponse } from "next/server";
import { kv, RKEYS } from "@/lib/db";
import { checkSession } from "@/lib/session";
import type { AdminProject } from "@/lib/admin-store";

/**
 * One-shot migration: every project whose subcategory is "terraces" gets
 * reassigned to "townhouses". Idempotent — re-running after the first pass
 * does nothing (no terraces remain). Admin-auth gated.
 */
export async function POST(req: NextRequest) {
  if (!(await checkSession(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const list = (await kv.get<AdminProject[]>(RKEYS.projects)) ?? [];
  let reassigned = 0;
  const updated = list.map((p) => {
    if (p.subcategory === "terraces") {
      reassigned++;
      return { ...p, subcategory: "townhouses" };
    }
    return p;
  });

  if (reassigned > 0) {
    await kv.set(RKEYS.projects, updated);
  }

  return NextResponse.json({ ok: true, reassigned, total: list.length });
}
