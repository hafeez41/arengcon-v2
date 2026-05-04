import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";

export const metadata: Metadata = {
  title: "News",
  description: "Studio updates, project milestones, talks, and press from Arengcon.",
};

export default function NewsPage() {
  return <SpaShell initialPath="/news" />;
}
