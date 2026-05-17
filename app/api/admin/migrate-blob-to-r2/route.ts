import { NextRequest, NextResponse } from "next/server";
import { redis, RKEYS } from "@/lib/redis";
import { checkSession } from "@/lib/session";
import { uploadToR2 } from "@/lib/r2";
import type { AdminProject, AdminUpdate, AdminService } from "@/lib/admin-store";

/**
 * One-time migration: copies every Vercel Blob–hosted image referenced in
 * Redis into Cloudflare R2 and rewrites the stored URLs. Idempotent — only
 * touches *.public.blob.vercel-storage.com URLs, so re-running is safe and
 * already-migrated (R2/Unsplash/picsum) URLs are left alone. Blob files are
 * NOT deleted here; delete the whole Blob store manually once verified
 * (safest rollback).
 *
 * Trigger while logged into /admin, from the browser console:
 *   fetch('/api/admin/migrate-blob-to-r2',{method:'POST'})
 *     .then(r=>r.json()).then(console.log)
 *
 * Optional ?only=projects|updates|services to migrate one collection at a
 * time (avoids function timeouts on large galleries).
 */

const isBlobUrl = (u: unknown): u is string =>
  typeof u === "string" && u.includes(".public.blob.vercel-storage.com");

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

export async function POST(req: NextRequest) {
  if (!(await checkSession(req)))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const only = req.nextUrl.searchParams.get("only");
  const summary = {
    projects: 0,
    updates: 0,
    services: 0,
    failed: [] as string[],
  };

  const safeMigrate = async (url: string): Promise<string> => {
    try {
      return await migrateUrl(url);
    } catch (e) {
      summary.failed.push(`${url} :: ${e instanceof Error ? e.message : e}`);
      return url; // keep the old URL so nothing breaks
    }
  };

  if (!only || only === "projects") {
    const projects = (await redis.get<AdminProject[]>(RKEYS.projects)) ?? [];
    for (const p of projects) {
      if (isBlobUrl(p.hero)) {
        p.hero = await safeMigrate(p.hero);
        summary.projects++;
      }
      if (Array.isArray(p.gallery)) {
        for (let i = 0; i < p.gallery.length; i++) {
          if (isBlobUrl(p.gallery[i])) {
            p.gallery[i] = await safeMigrate(p.gallery[i]);
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
      if (isBlobUrl(u.hero)) {
        u.hero = await safeMigrate(u.hero as string);
        summary.updates++;
      }
    }
    await redis.set(RKEYS.updates, updates);
  }

  if (!only || only === "services") {
    const services = (await redis.get<AdminService[]>(RKEYS.services)) ?? [];
    for (const s of services) {
      if (isBlobUrl(s.image)) {
        s.image = await safeMigrate(s.image);
        summary.services++;
      }
    }
    await redis.set(RKEYS.services, services);
  }

  return NextResponse.json({ ok: true, ...summary });
}
