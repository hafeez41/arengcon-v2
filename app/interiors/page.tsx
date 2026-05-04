import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";

export const metadata: Metadata = {
  title: "Interiors",
  description: "Interior projects by Arengcon.",
};

export default function InteriorsPage() {
  return <SpaShell initialPath="/interiors" />;
}
