import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";

export const metadata: Metadata = {
  title: "Interior Design",
  description: "Interior design projects.",
};

export default function InteriorDesignPage() {
  return <SpaShell initialPath="/interior-design" />;
}
