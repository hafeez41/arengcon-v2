import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";

export const metadata: Metadata = {
  title: "Construction",
  description: "Constructed projects by Arengcon.",
};

export default function ConstructionPage() {
  return <SpaShell initialPath="/construction" />;
}
