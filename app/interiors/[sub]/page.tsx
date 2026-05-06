import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";
import { SUBCATEGORIES, subcategoryLabel } from "@/lib/projects";

type Params = { sub: string };

export async function generateStaticParams() {
  return SUBCATEGORIES.int.map((s) => ({ sub: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { sub } = await params;
  const label = subcategoryLabel("int", sub);
  return {
    title: label ? `${label} — Interiors` : "Interiors",
  };
}

export default async function IntSubPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { sub } = await params;
  return <SpaShell initialPath={`/interiors/${sub}`} />;
}
