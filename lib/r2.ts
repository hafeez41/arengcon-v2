import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Cloudflare R2 storage helper. The bucket is bound natively as `R2` in
 * wrangler.jsonc — no access keys, no SigV4. The only env var still needed
 * is R2_PUBLIC_BASE_URL (the pub-*.r2.dev URL or custom domain) so we can
 * build the public read URLs returned to callers.
 *
 * Public reads cost nothing — R2 egress is free.
 */

// Minimal R2 binding shape — only what we actually call. Avoids pulling
// the full @cloudflare/workers-types global declarations into the project,
// which would override DOM Response.json() and break client fetch code.
interface R2Binding {
  put(
    key: string,
    body: ArrayBuffer | Uint8Array,
    options?: { httpMetadata?: { contentType?: string } },
  ): Promise<unknown>;
  delete(key: string): Promise<void>;
}

function publicBase(): string {
  return (process.env.R2_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");
}

function bucket(): R2Binding {
  const env = getCloudflareContext().env as { R2?: R2Binding };
  if (!env.R2) throw new Error("R2 binding missing (check wrangler.jsonc)");
  return env.R2;
}

function publicUrl(key: string): string {
  return `${publicBase()}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

/** True if the URL is one we host on R2 (so cleanup ignores Unsplash/picsum/etc). */
export function isR2Url(url: unknown): url is string {
  const base = publicBase();
  return typeof url === "string" && base.length > 0 && url.startsWith(base);
}

/** Upload bytes to R2 under `key`; returns the public URL. */
export async function uploadToR2(
  key: string,
  body: ArrayBuffer | Uint8Array,
  contentType: string,
): Promise<string> {
  const bytes = body instanceof Uint8Array ? body : new Uint8Array(body);
  await bucket().put(key, bytes, {
    httpMetadata: { contentType: contentType || "application/octet-stream" },
  });
  return publicUrl(key);
}

/** Delete one or more R2 objects by their public URL. Non-R2 URLs are skipped. */
export async function deleteFromR2(urls: string | string[]): Promise<void> {
  const list = (Array.isArray(urls) ? urls : [urls]).filter(isR2Url);
  if (list.length === 0) return;
  const base = publicBase();
  const b = bucket();
  await Promise.all(
    list.map(async (url) => {
      const key = decodeURIComponent(url.slice(base.length + 1));
      await b.delete(key);
    }),
  );
}
