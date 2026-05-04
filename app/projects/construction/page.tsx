import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";

export const metadata: Metadata = {
  title: "Construction",
};

export default function ConstructionPage() {
  return <SpaShell initialPath="/projects/construction" />;
}
