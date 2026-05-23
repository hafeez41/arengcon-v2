import { Redis } from "@upstash/redis";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Read env from the Cloudflare context (Worker bindings/secrets), not
// process.env — the latter isn't reliably populated at request time under
// OpenNext. Client is lazy-constructed per request via a Proxy.

let _redis: Redis | null = null;

function readEnv(): { url?: string; token?: string } {
  const env = getCloudflareContext().env as {
    UPSTASH_REDIS_REST_URL?: string;
    UPSTASH_REDIS_REST_TOKEN?: string;
  };
  return {
    url: env.UPSTASH_REDIS_REST_URL ?? process.env.UPSTASH_REDIS_REST_URL,
    token: env.UPSTASH_REDIS_REST_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN,
  };
}

function getClient(): Redis {
  if (_redis) return _redis;
  const { url, token } = readEnv();
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
