import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";

export const metadata: Metadata = {
  title: "Architecture",
  description: "Architectural design projects by Arengcon.",
};

export default function ArchPage() {
  return <SpaShell initialPath="/architecture" />;
}
