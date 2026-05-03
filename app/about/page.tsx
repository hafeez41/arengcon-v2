import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";

export const metadata: Metadata = {
  title: "About",
  description: "Architects, interior designers, and builders. Founded 2008.",
};

export default function AboutPage() {
  return <SpaShell initialPath="/about" />;
}
