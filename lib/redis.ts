import { Redis } from "@upstash/redis";

// Lazy-init the client. On Cloudflare Workers, process.env is populated
// per-request by OpenNext — constructing at module load can capture undefined
// values. A Proxy lets every `redis.*` call resolve the real client on first
// use, after env vars are available.

let _redis: Redis | null = null;

function getClient(): Redis {
  if (_redis) return _redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "Upstash Redis env vars missing (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN)",
    );
  }
  _redis = new Redis({ url, token });
  return _redis;
}

export const redis = new Proxy({} as Redis, {
  get(_t, prop) {
    const c = getClient() as unknown as Record<string | symbol, unknown>;
    const v = c[prop as string];
    return typeof v === "function" ? (v as Function).bind(c) : v;
  },
});

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
