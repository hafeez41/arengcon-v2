"use client";

import { ProjectsList } from "./projects-list";
import { UpdatesList } from "./updates-list";
import { SiteFooter } from "./site-footer";
import { parseRouteFilter, type FilterKey } from "./header";

export function HomeView({
  filter = "all",
  subcategory,
}: {
  filter?: FilterKey;
  subcategory?: string;
} = {}) {
  return (
    <>
      <div className="h-[72px] lg:h-[120px]" aria-hidden />
      <section className="pb-24 lg:pb-32">
        <div className="pt-12 lg:pt-16">
          {filter === "updates" ? (
            <UpdatesList />
          ) : (
            <ProjectsList filter={filter} subcategory={subcategory} />
          )}
        </div>
      </section>
      <SiteFooter />
    </>
  );
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

  const projectMatch = clean.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) return <HomeView filter="all" />;

  const { category, subcategory } = parseRouteFilter(clean);
  return <HomeView filter={category} subcategory={subcategory} />;
}
