import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected work across architecture, interiors, and construction.",
};

export default function ProjectsPage() {
  return <SpaShell initialPath="/projects" />;
}
