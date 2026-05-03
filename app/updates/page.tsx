import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";

export const metadata: Metadata = {
  title: "Updates",
  description: "Studio updates, projects, press, and talks.",
};

export default function UpdatesPage() {
  return <SpaShell initialPath="/updates" />;
}
