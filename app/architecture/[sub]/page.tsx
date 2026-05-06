import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";
import { SUBCATEGORIES, subcategoryLabel } from "@/lib/projects";

type Params = { sub: string };

export async function generateStaticParams() {
  return SUBCATEGORIES.arch.map((s) => ({ sub: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { sub } = await params;
  const label = subcategoryLabel("arch", sub);
  return {
    title: label ? `${label} — Architecture` : "Architecture",
  };
}

export default async function ArchSubPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { sub } = await params;
  return <SpaShell initialPath={`/architecture/${sub}`} />;
}
