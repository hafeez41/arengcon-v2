import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";

export const metadata: Metadata = {
  title: "Landscaping",
  description: "Landscape projects by Arengcon.",
};

export default function LandscapingPage() {
  return <SpaShell initialPath="/landscaping" />;
}
