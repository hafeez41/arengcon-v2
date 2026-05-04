import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";

export const metadata: Metadata = {
  title: "Sustainability",
  description: "How Arengcon thinks about embodied carbon, reuse, operational performance, and reversibility.",
};

export default function SustainabilityPage() {
  return <SpaShell initialPath="/sustainability" />;
}
