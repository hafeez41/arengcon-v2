"use client";

import clsx from "clsx";
import { ProjectsList } from "./projects-list";
import { UpdatesList } from "./updates-list";
import { SiteFooter } from "./site-footer";
import { parseRouteFilter, type FilterKey } from "./header";
import { AboutView } from "./about-view";
import { PeopleView } from "./people-view";
import { ServicesView } from "./services-view";
import { useProjectExpanded } from "./project-expanded-context";

export function HomeView({
  filter = "all",
  subcategory,
}: {
  filter?: FilterKey;
  subcategory?: string;
} = {}) {
  const { anyExpanded } = useProjectExpanded();
  return (
    <>
      <div className="h-[72px] desk:h-[120px]" aria-hidden />
      <section className="pb-24 desk:pb-32">
        <div className={clsx("pt-12", anyExpanded ? "desk:pt-0" : "desk:pt-16")}>
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

  if (clean === "/about") return <AboutView />;
  if (clean === "/people") return <PeopleView />;
  if (clean === "/services") return <ServicesView />;

  const projectMatch = clean.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) return <HomeView filter="all" />;

  const { category, subcategory } = parseRouteFilter(clean);
  return <HomeView filter={category} subcategory={subcategory} />;
}
