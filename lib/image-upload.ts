"use client";

/**
 * Client-side helper: materialize any base64 `data:` URLs into real R2
 * URLs by uploading them via /api/admin/upload. Anything already-uploaded
 * (an https URL) passes through unchanged.
 *
 * Used by admin save handlers so picking an image only stages a local
 * preview — R2 is only written to when the user actually hits Save.
 */

async function uploadDataUrl(dataUrl: string): Promise<string> {
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const form = new FormData();
  form.append(
    "file",
    new File([blob], `${Date.now()}.webp`, {
      type: blob.type || "image/webp",
    }),
  );
  const uploadRes = await fetch("/api/admin/upload", {
    method: "POST",
    body: form,
  });
  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({ error: "Upload failed" }));
    throw new Error((err as { error?: string }).error ?? "Upload failed");
  }
  const { url } = (await uploadRes.json()) as { url: string };
  return url;
}

export async function materializeUrl(
  input: string | undefined,
): Promise<string | undefined> {
  if (!input) return input;
  if (!input.startsWith("data:")) return input;
  return await uploadDataUrl(input);
}

export async function materializeUrls(inputs: string[]): Promise<string[]> {
  return await Promise.all(
    inputs.map(async (u) => {
      if (!u.startsWith("data:")) return u;
      return await uploadDataUrl(u);
    }),
  );
}
