import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      // Cloudflare R2 public bucket (pub-*.r2.dev or a custom domain).
      { protocol: "https", hostname: "*.r2.dev" },
    ],
    dangerouslyAllowSVG: false,
    unoptimized: true,
  },
};

export default nextConfig;
