import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";

export const metadata: Metadata = {
  title: "Updates",
  description: "Studio updates, project milestones, talks, and press from Arengcon.",
};

export default function UpdatesPage() {
  return <SpaShell initialPath="/updates" />;
}
