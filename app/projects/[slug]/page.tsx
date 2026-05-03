import type { Metadata } from "next";
import { SpaShell } from "@/components/spa-shell";
import { getProject, projects } from "@/lib/projects";

type Params = { slug: string };

export async function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
  };
}

export default async function ProjectDetail({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  return <SpaShell initialPath={`/projects/${slug}`} />;
}
