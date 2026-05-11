import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const RKEYS = {
  projects:    "arengcon:projects",
  updates:     "arengcon:updates",
  contact:     "arengcon:contact",
  credentials: "arengcon:credentials",
  session:     (token: string) => `arengcon:session:${token}`,
} as const;
