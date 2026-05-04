import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";

export const metadata: Metadata = {
  title: "People",
  description: "The studio at Arengcon — partners, designers, and crew across four offices.",
};

export default function PeoplePage() {
  return <SpaShell initialPath="/people" />;
}
