"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { compressImage } from "@/lib/image-compress";

async function uploadToBlob(file: File): Promise<string> {
  const compressed = await compressImage(file);
  const res = await fetch(compressed);
  const blob = await res.blob();
  const form = new FormData();
  form.append("file", new File([blob], `${Date.now()}.webp`, { type: "image/webp" }));
  const uploadRes = await fetch("/api/admin/upload", { method: "POST", body: form });
  if (!uploadRes.ok) throw new Error("Upload failed");
  const { url } = await uploadRes.json();
  return url as string;
}

export function ImageUploader({
  label,
  value,
  onChange,
  required = false,
}: {
  label: string;
  value: string | undefined;
  onChange: (url: string | undefined) => void;
  required?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = async (file: File) => {
    setError(null);
    setBusy(true);
    try {
      const url = await uploadToBlob(file);
      onChange(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-[0.18em] text-ink/55">
          {label}
          {required && <span className="ml-1 text-rose-500">*</span>}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-[10px] uppercase tracking-[0.18em] text-ink/45 hover:text-ink/70"
          >
            Remove
          </button>
        )}
      </div>
      <div className="relative aspect-[4/3] w-full overflow-hidden border border-line bg-ink/5">
        {value ? (
          <Image src={value} alt={label} fill sizes="320px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.18em] text-ink/40">
            {busy ? "Uploading…" : "No image"}
          </div>
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="absolute inset-0 flex items-end justify-end p-2 text-[10px] uppercase tracking-[0.18em] text-ink/0 transition-colors duration-300 hover:bg-ink/10 hover:text-ink/70 disabled:cursor-wait"
        >
          {busy ? "" : value ? "Replace" : "Upload"}
        </button>
      </div>
      {error && (
        <div className="text-[10px] uppercase tracking-[0.14em] text-rose-500">
          {error}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void onPick(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

export function GalleryUploader({
  values,
  onChange,
  max = 12,
}: {
  values: string[];
  onChange: (next: string[]) => void;
  max?: number;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onPick = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setBusy(true);
    try {
      const slots = max - values.length;
      const list = Array.from(files).slice(0, slots);
      const urls: string[] = [];
      for (const f of list) {
        urls.push(await uploadToBlob(f));
      }
      onChange([...values, ...urls]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  const removeAt = (i: number) => {
    onChange(values.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-[10px] uppercase tracking-[0.18em] text-ink/55">
          Gallery — {values.length} / {max}
        </label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy || values.length >= max}
          className="text-[10px] uppercase tracking-[0.18em] text-ink/65 hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Uploading…" : values.length >= max ? "Full" : "Add"}
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
        {values.map((src, i) => (
          <div key={`${i}-${src.slice(-16)}`} className="relative aspect-[4/3] overflow-hidden border border-line bg-ink/5">
            <Image src={src} alt={`gallery ${i + 1}`} fill sizes="160px" className="object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-ink/80 text-paper transition-colors duration-200 hover:bg-ink"
              aria-label={`Remove image ${i + 1}`}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
        ))}
        {values.length < max &&
          Array.from({ length: Math.min(max - values.length, 3) }).map((_, i) => (
            <button
              key={`empty-${i}`}
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-[4/3] items-center justify-center border border-dashed border-line bg-ink/[0.02] text-[10px] uppercase tracking-[0.18em] text-ink/35 transition-colors duration-200 hover:border-ink/30 hover:text-ink/55"
            >
              +
            </button>
          ))}
      </div>
      {error && (
        <div className="text-[10px] uppercase tracking-[0.14em] text-rose-500">
          {error}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          void onPick(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
