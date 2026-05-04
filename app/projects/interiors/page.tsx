import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";

export const metadata: Metadata = {
  title: "Interiors",
};

export default function InteriorsPage() {
  return <SpaShell initialPath="/projects/interiors" />;
}
