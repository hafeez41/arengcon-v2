import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";

export const metadata: Metadata = {
  title: "Contact",
  description: "Tell us about your project.",
};

export default function ContactPage() {
  return <SpaShell initialPath="/contact" />;
}
