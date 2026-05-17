import { NextRequest, NextResponse } from "next/server";
import { redis, RKEYS } from "@/lib/redis";
import { checkSession } from "@/lib/session";
import { uploadToR2 } from "@/lib/r2";
import type { AdminProject, AdminUpdate, AdminService } from "@/lib/admin-store";

/**
 * Blob -> R2 migration, with two modes:
 *
 *  - default (migrate): copies every Vercel Blob image referenced in Redis
 *    into R2 and rewrites the stored URLs. Idempotent; only touches
 *    *.public.blob.vercel-storage.com URLs.
 *
 *  - ?mode=reset&blobHost=<your-blob-host>: reverts URLs that a previous
 *    migration already rewrote to R2 back to their original Blob URLs.
 *    Use this if R2 objects were deleted after migration and you want one
 *    clean all-at-once pass. Reconstructs the original Blob URL from the
 *    migration key format. The original Blob files must still exist
 *    (i.e. you haven't deleted the Blob store yet).
 *
 * Trigger from the admin Settings buttons (no console needed).
 */

const PUBLIC_BASE = (process.env.R2_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");

const isBlobUrl = (u: unknown): u is string =>
  typeof u === "string" && u.includes(".public.blob.vercel-storage.com");

const isMigratedR2Url = (u: unknown): u is string =>
  typeof u === "string" &&
  PUBLIC_BASE.length > 0 &&
  u.startsWith(PUBLIC_BASE) &&
  u.includes("/migrated-");

async function migrateUrl(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`fetch ${res.status} for ${url}`);
  const contentType = res.headers.get("content-type") || "image/jpeg";
  const bytes = new Uint8Array(await res.arrayBuffer());
  const base = url.split("/").pop()?.split("?")[0] || "image";
  const safe = base.replace(/[^a-zA-Z0-9._-]/g, "_");
  const key = `arengcon/migrated-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 7)}-${safe}`;
  return uploadToR2(key, bytes, contentType);
}

/** Rebuild the original Blob URL from a migrated R2 URL. */
function resetUrl(url: string, blobHost: string): string {
  const path = decodeURIComponent(url.slice(PUBLIC_BASE.length + 1)); // arengcon/migrated-...-<basename>
  const m = path.match(/^arengcon\/migrated-\d+-[a-z0-9]{5}-(.+)$/);
  if (!m) return url; // not a recognizable migrated key — leave it
  return `https://${blobHost}/arengcon/${m[1]}`;
}

export async function POST(req: NextRequest) {
  if (!(await checkSession(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const mode = req.nextUrl.searchParams.get("mode"); // "reset" | null
  const blobHost = req.nextUrl.searchParams.get("blobHost") || "";
  if (mode === "reset" && !blobHost) {
    return NextResponse.json(
      { error: "reset mode requires ?blobHost=<your *.public.blob.vercel-storage.com host>" },
      { status: 400 },
    );
  }
  const only = req.nextUrl.searchParams.get("only");

  const summary = {
    mode: mode === "reset" ? "reset" : "migrate",
    projects: 0,
    updates: 0,
    services: 0,
    failed: [] as string[],
  };

  // Returns [newUrl, changed]. In migrate mode, blob URLs -> R2 (with error
  // capture). In reset mode, migrated-R2 URLs -> original Blob URLs.
  const transform = async (
    url: string | undefined,
  ): Promise<[string | undefined, boolean]> => {
    if (!url) return [url, false];
    if (mode === "reset") {
      if (!isMigratedR2Url(url)) return [url, false];
      return [resetUrl(url, blobHost), true];
    }
    if (!isBlobUrl(url)) return [url, false];
    try {
      return [await migrateUrl(url), true];
    } catch (e) {
      summary.failed.push(`${url} :: ${e instanceof Error ? e.message : e}`);
      return [url, false];
    }
  };

  if (!only || only === "projects") {
    const projects = (await redis.get<AdminProject[]>(RKEYS.projects)) ?? [];
    for (const p of projects) {
      const [hero, h] = await transform(p.hero);
      if (h) {
        p.hero = hero as string;
        summary.projects++;
      }
      if (Array.isArray(p.gallery)) {
        for (let i = 0; i < p.gallery.length; i++) {
          const [g, c] = await transform(p.gallery[i]);
          if (c) {
            p.gallery[i] = g as string;
            summary.projects++;
          }
        }
      }
    }
    await redis.set(RKEYS.projects, projects);
  }

  if (!only || only === "updates") {
    const updates = (await redis.get<AdminUpdate[]>(RKEYS.updates)) ?? [];
    for (const u of updates) {
      const [hero, c] = await transform(u.hero);
      if (c) {
        u.hero = hero as string;
        summary.updates++;
      }
    }
    await redis.set(RKEYS.updates, updates);
  }

  if (!only || only === "services") {
    const services = (await redis.get<AdminService[]>(RKEYS.services)) ?? [];
    for (const s of services) {
      const [img, c] = await transform(s.image);
      if (c) {
        s.image = img as string;
        summary.services++;
      }
    }
    await redis.set(RKEYS.services, services);
  }

  return NextResponse.json({ ok: true, ...summary });
}
