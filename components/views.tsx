"use client";

import { useEffectiveProjects } from "@/lib/effective-data";
import { ProjectsList, type FilterKey } from "./projects-list";
import { FILTER_FROM_PATH } from "./header";
import type { Category } from "@/lib/projects";

export function HomeView({ filter = "all" }: { filter?: FilterKey } = {}) {
  const { list } = useEffectiveProjects();
  const total = list.length;

  return (
    <>
      <div className="h-[88px] md:h-[88px]" aria-hidden />
      <section className="pb-32 md:pb-40">
        <div className="mx-auto w-full max-w-[1800px] px-5 pt-12 md:px-8 md:pt-16">
          <div className="grid grid-cols-12 gap-x-6">
            <div className="col-span-12 md:col-span-8 md:col-start-3">
              <p className="max-w-[28ch] text-[28px] leading-[1.15] tracking-tight md:text-[40px]">
                An architecture, interior design, and construction practice.
              </p>
              <p className="mt-3 text-[12px] uppercase tracking-[0.14em] text-muted">
                {total} projects ·{" "}
                {filter === "all" ? "All disciplines" : labelFor(filter)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 md:mt-24">
          <ProjectsList filter={filter} />
        </div>

        <div className="mx-auto mt-32 w-full max-w-[1800px] px-5 md:px-8">
          <div className="grid grid-cols-12 gap-x-6 border-t border-line pt-10">
            <div className="col-span-12 md:col-span-3 md:col-start-3">
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted">
                Studio
              </div>
              <a
                href="mailto:newbiz@arengcon.com"
                className="editorial-link mt-2 block text-[14px]"
              >
                newbiz@arengcon.com
              </a>
            </div>
            <div className="col-span-12 mt-6 text-[10px] uppercase tracking-[0.14em] text-muted md:col-span-6 md:col-start-7 md:mt-0 md:text-right">
              © {new Date().getFullYear()} Arengcon — Established 2008
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function labelFor(f: FilterKey): string {
  if (f === "arch") return "Architecture";
  if (f === "int") return "Interiors";
  if (f === "cons") return "Construction";
  return "All";
}

export function NotFoundView() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center px-5 py-24 md:px-8">
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-[0.14em] text-muted">
          404
        </div>
        <h1 className="mt-3 text-[64px] tracking-tight md:text-[96px]">
          Not found.
        </h1>
        <a
          href="/"
          className="editorial-link mt-8 inline-block text-[14px] tracking-tight"
        >
          Back to projects →
        </a>
      </div>
    </section>
  );
}

export function resolveView(path: string): React.ReactNode {
  const clean = path.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";

  // Project deep link → home with that filter (no special view, list handles expansion)
  const projectMatch = clean.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) {
    return <HomeView filter="all" />;
  }

  const filter = FILTER_FROM_PATH(clean);
  if (clean === "/" || filter !== "all") {
    return <HomeView filter={filter} />;
  }

  // Legacy
  if (clean === "/architecture") return <HomeView filter="arch" />;
  if (clean === "/interior-design") return <HomeView filter="int" />;
  if (clean === "/construction") return <HomeView filter="cons" />;

  return <NotFoundView />;
}
