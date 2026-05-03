import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";
import { getUpdate, updates } from "@/lib/updates";

type Params = { slug: string };

export async function generateStaticParams() {
  return updates.map((u) => ({ slug: u.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const u = getUpdate(slug);
  if (!u) return {};
  return { title: u.title, description: u.excerpt };
}

export default async function UpdateDetail({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  return <SpaShell initialPath={`/updates/${slug}`} />;
}
