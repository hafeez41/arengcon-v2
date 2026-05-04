import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";

export const metadata: Metadata = {
  title: "Careers",
  description: "Open roles at Arengcon — architects, designers, site supervisors, and apprentices.",
};

export default function CareersPage() {
  return <SpaShell initialPath="/careers" />;
}
