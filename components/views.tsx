"use client";

import { ProjectsList, type FilterKey } from "./projects-list";
import { NewsList } from "./news-list";
import { FILTER_FROM_PATH } from "./header";

export function HomeView({ filter = "all" }: { filter?: FilterKey } = {}) {
  return (
    <>
      <div className="h-[72px] md:h-[88px]" aria-hidden />
      <section className="pb-32 md:pb-40">
        <div className="pt-12 md:pt-16">
          {filter === "news" ? <NewsList /> : <ProjectsList filter={filter} />}
        </div>
      </section>
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

  const filter = FILTER_FROM_PATH(clean);
  if (clean === "/" || filter !== "all") return <HomeView filter={filter} />;

  if (clean === "/architecture") return <HomeView filter="arch" />;
  if (clean === "/interior-design") return <HomeView filter="int" />;
  if (clean === "/construction") return <HomeView filter="cons" />;

  return <NotFoundView />;
}
