"use client";

import Image, { type ImageProps } from "next/image";

export function SmartImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const isData = src.startsWith("data:");
  if (isData) {
    return <Image {...props} unoptimized />;
  }
  return <Image {...props} />;
}
