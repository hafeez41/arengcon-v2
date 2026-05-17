import { AwsClient } from "aws4fetch";

/**
 * Cloudflare R2 (S3-compatible) storage helper. Credentials come from env:
 *   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY,
 *   R2_BUCKET, R2_PUBLIC_BASE_URL
 *
 * Uploads/deletes are signed SigV4 via aws4fetch (tiny, zero-dep). Public
 * reads happen over R2_PUBLIC_BASE_URL (the pub-*.r2.dev URL or a custom
 * domain) and cost nothing — egress on R2 is free.
 */

const PUBLIC_BASE = (process.env.R2_PUBLIC_BASE_URL ?? "").replace(/\/$/, "");

function client() {
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials missing (R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY)");
  }
  return new AwsClient({
    accessKeyId,
    secretAccessKey,
    region: "auto",
    service: "s3",
  });
}

function objectEndpoint(key: string): string {
  const account = process.env.R2_ACCOUNT_ID;
  const bucket = process.env.R2_BUCKET;
  if (!account || !bucket) {
    throw new Error("R2 config missing (R2_ACCOUNT_ID / R2_BUCKET)");
  }
  const safeKey = key.split("/").map(encodeURIComponent).join("/");
  return `https://${account}.r2.cloudflarestorage.com/${bucket}/${safeKey}`;
}

/** True if the URL is one we host on R2 (so cleanup ignores Unsplash/picsum/etc). */
export function isR2Url(url: unknown): url is string {
  return (
    typeof url === "string" && PUBLIC_BASE.length > 0 && url.startsWith(PUBLIC_BASE)
  );
}

/** Upload bytes to R2 under `key`; returns the public URL. */
export async function uploadToR2(
  key: string,
  body: ArrayBuffer | Uint8Array,
  contentType: string,
): Promise<string> {
  const res = await client().fetch(objectEndpoint(key), {
    method: "PUT",
    body,
    headers: { "Content-Type": contentType || "application/octet-stream" },
  });
  if (!res.ok) {
    throw new Error(`R2 upload failed (${res.status}): ${await res.text()}`);
  }
  return `${PUBLIC_BASE}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

/** Delete one or more R2 objects by their public URL. Non-R2 URLs are skipped. */
export async function deleteFromR2(urls: string | string[]): Promise<void> {
  const list = (Array.isArray(urls) ? urls : [urls]).filter(isR2Url);
  if (list.length === 0) return;
  const aws = client();
  await Promise.all(
    list.map(async (url) => {
      const key = decodeURIComponent(url.slice(PUBLIC_BASE.length + 1));
      const res = await aws.fetch(objectEndpoint(key), { method: "DELETE" });
      // 404 is fine — already gone.
      if (!res.ok && res.status !== 404) {
        throw new Error(`R2 delete failed (${res.status}) for ${key}`);
      }
    }),
  );
}
