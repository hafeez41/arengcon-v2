import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";

export const metadata: Metadata = {
  title: "Architecture",
};

export default function ArchPage() {
  return <SpaShell initialPath="/projects/architecture" />;
}
