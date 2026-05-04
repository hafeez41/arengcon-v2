"use client";

import { motion } from "framer-motion";
import { ProjectGrid } from "./project-grid";
import { ProjectPage } from "./project-page";
import { SmartImage } from "./smart-image";
import { useNavigate } from "./spa-router";
import { CATEGORY_LABELS, type Category } from "@/lib/projects";
import { formatDate } from "@/lib/updates";
import {
  findProject,
  findUpdate,
  projectGallery,
  projectVideo,
  projectsByCategoryFiltered,
  useEffectiveProjects,
  useEffectiveUpdates,
} from "@/lib/effective-data";
import { ContactForm } from "@/app/contact/contact-form";

const HOME_INTRO =
  "Arengcon is a multidisciplinary practice of architects, interior designers, and builders. We take projects from feasibility through final inspection — civic, infrastructural, and residential.";

export function HomeView() {
  const { list } = useEffectiveProjects();
  return (
    <>
      <section className="px-5 pt-16 md:px-8 md:pt-24">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="grid grid-cols-12 gap-x-6">
            <div className="col-span-12 md:col-span-9">
              <p className="max-w-[34ch] text-display-lg tracking-tight text-balance">
                {HOME_INTRO}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="mb-8 flex items-baseline justify-between gap-4">
            <div className="eyebrow">Selected projects</div>
            <span className="text-[12px] tabnum text-muted">
              {String(list.length).padStart(2, "0")}
            </span>
          </div>
          <ProjectGrid items={list} />
        </div>
      </section>
    </>
  );
}

export function ProjectsIndexView({ category }: { category?: Category | null }) {
  const { list } = useEffectiveProjects();
  const filtered = category ? projectsByCategoryFiltered(list, category) : list;
  const heading = category ? CATEGORY_LABELS[category].name : "All projects";

  return (
    <>
      <section className="border-b border-line px-5 pt-16 pb-12 md:px-8 md:pt-24 md:pb-16">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="eyebrow">Projects</div>
          <h1 className="mt-3 text-display-xl tracking-tight">{heading}</h1>
          {category && (
            <p className="mt-6 max-w-prose text-[18px] leading-[1.5] text-muted">
              {CATEGORY_LABELS[category].tag}.
            </p>
          )}
        </div>
      </section>
      <section className="px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto w-full max-w-[1600px]">
          <ProjectGrid items={filtered} />
        </div>
      </section>
    </>
  );
}

export function ProjectView({ slug }: { slug: string }) {
  const { list, adminProjects } = useEffectiveProjects();
  const project = findProject(list, slug);
  if (!project) return <NotFoundView />;
  const idx = list.findIndex((p) => p.slug === slug);
  const prev = list[(idx - 1 + list.length) % list.length];
  const next = list[(idx + 1) % list.length];
  const gallery = projectGallery(project, adminProjects);
  const videoUrl = projectVideo(project, adminProjects);
  return (
    <ProjectPage
      project={project}
      gallery={gallery}
      videoUrl={videoUrl}
      prev={prev}
      next={next}
    />
  );
}

export function NewsView() {
  const { list } = useEffectiveUpdates();
  const navigate = useNavigate();
  return (
    <>
      <section className="border-b border-line px-5 pt-16 pb-12 md:px-8 md:pt-24 md:pb-16">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="eyebrow">News</div>
          <h1 className="mt-3 text-display-xl tracking-tight">
            Studio updates, project milestones, talks, and press.
          </h1>
        </div>
      </section>
      <section className="px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto w-full max-w-[1600px]">
          <ul>
            {list.map((u) => (
              <li
                key={u.slug}
                className="border-b border-line"
              >
                <a
                  href={`/news/${u.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/news/${u.slug}`);
                  }}
                  className="grid grid-cols-12 gap-x-6 gap-y-3 py-8 md:py-10"
                >
                  <div className="col-span-12 md:col-span-3">
                    <div className="text-[12px] tabnum tracking-tight text-muted">
                      {formatDate(u.date)}
                    </div>
                    <div className="mt-1 text-[12px] uppercase tracking-[0.14em] text-muted">
                      {u.kind}
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-7">
                    <h3 className="text-[22px] tracking-tight md:text-[28px]">
                      {u.title}
                    </h3>
                    <p className="mt-3 max-w-prose text-[15px] leading-[1.55] text-muted">
                      {u.excerpt}
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-2">
                    {u.image && (
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-ink/[0.04]">
                        <SmartImage
                          src={u.image}
                          alt={u.title}
                          fill
                          sizes="200px"
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

export function NewsItemView({ slug }: { slug: string }) {
  const { list } = useEffectiveUpdates();
  const update = findUpdate(list, slug);
  if (!update) return <NotFoundView />;

  return (
    <article>
      <section className="px-5 pt-16 pb-12 md:px-8 md:pt-24 md:pb-16">
        <div className="mx-auto w-full max-w-[1100px]">
          <div className="flex flex-wrap items-center gap-3 text-[12px] uppercase tracking-[0.14em] text-muted">
            <span>{update.kind}</span>
            <span>·</span>
            <span className="tabnum">{formatDate(update.date)}</span>
          </div>
          <h1 className="mt-6 text-display-lg tracking-tight text-balance">
            {update.title}
          </h1>
          <p className="mt-6 max-w-prose text-[18px] leading-[1.5] text-muted md:text-[20px]">
            {update.excerpt}
          </p>
        </div>
      </section>
      {update.image && (
        <section className="px-5 pb-12 md:px-8 md:pb-16">
          <div className="mx-auto w-full max-w-[1400px]">
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-ink/[0.04]">
              <SmartImage
                src={update.image}
                alt={update.title}
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        </section>
      )}
      <section className="border-t border-line px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto w-full max-w-[1100px]">
          <div className="space-y-6 text-[17px] leading-[1.7]">
            {update.body.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}

const ABOUT_DISCIPLINES = [
  {
    head: "Architecture",
    body: "Buildings outlast clients, briefs, and trends. Every detail we draw answers a question about the next eighty years — material fatigue, climate drift, what gets repaired and by whom.",
    subs: ["Civic+", "Cultural+", "Education+", "Hospitality+", "Residential+", "Workplace+"],
  },
  {
    head: "Interiors",
    body: "Surfaces and the joints between them. We work close to the trades that build the room — millworkers, plasterers, finish electricians.",
    subs: ["Workplace+", "Hospitality+", "Cultural+", "Quiet rooms+"],
  },
  {
    head: "Construction",
    body: "We deliver the build, not just the drawing set. Field stations, bridges, transit works, and tunnel portals. We stay on the call after the doors open.",
    subs: ["Bridges+", "Transit+", "Tunnel works+", "Demountable+"],
  },
  {
    head: "Planning",
    body: "From a single block to a region. Brownfield reclamation, low-line corridors, and master planning that respects existing neighbourhoods.",
    subs: ["Campus+", "City+", "Region+"],
  },
  {
    head: "Vision",
    body: "We believe there is no project manager between you and the people drawing your building. Decisions get made in the room.",
    subs: ["The studio+", "The work+", "The next eighty years+"],
  },
];

export function AboutView() {
  return (
    <>
      <section className="border-b border-line px-5 pt-16 pb-12 md:px-8 md:pt-24 md:pb-16">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="eyebrow">About</div>
          <p className="mt-6 max-w-[26ch] text-display-xl tracking-tight text-balance">
            We are not defined by a style. We are defined by the projects we
            choose to take from feasibility to final inspection.
          </p>
          <div className="mt-12 max-w-prose text-[17px] leading-[1.6] text-muted">
            <p>
              Arengcon was founded in 2008 as a two-person studio in Brooklyn.
              Over the next two decades it became a thirty-person practice
              with offices in Toronto, London, and Copenhagen, working across
              architecture, interior design, and construction.
            </p>
            <p className="mt-4">
              We work in a single open studio with shared drafting tables and
              shared responsibility. Decisions get made in the room.
            </p>
          </div>
        </div>
      </section>

      {ABOUT_DISCIPLINES.map((d, i) => (
        <section
          key={d.head}
          className="border-b border-line px-5 py-16 md:px-8 md:py-24"
        >
          <div className="mx-auto w-full max-w-[1600px]">
            <div className="grid grid-cols-12 gap-x-6 gap-y-8">
              <div className="col-span-12 md:col-span-3">
                <div className="text-[11px] uppercase tracking-[0.18em] tabnum text-muted">
                  {String(i + 1).padStart(2, "0")} / {String(ABOUT_DISCIPLINES.length).padStart(2, "0")}
                </div>
                <h2 className="mt-3 text-display-md uppercase tracking-tight">
                  {d.head}
                </h2>
              </div>
              <div className="col-span-12 md:col-span-5">
                <p className="text-[17px] leading-[1.6]">{d.body}</p>
              </div>
              <div className="col-span-12 md:col-span-3 md:col-start-10">
                <div className="eyebrow">In practice</div>
                <ul className="mt-3 space-y-1.5 text-[14px] leading-[1.55]">
                  {d.subs.map((s) => (
                    <li key={s}>
                      <a href="#" className="editorial-link">
                        {s}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}

const SUSTAINABILITY_PILLARS = [
  {
    head: "Embodied carbon",
    body: "We track embodied carbon for every line on the spec. Material substitutions are evaluated at GWP, not just price.",
    metric: "−42%",
    metricLabel: "vs. 2008 baseline",
  },
  {
    head: "Reuse first",
    body: "We salvage where the building was, before we add to it. Eighty percent of the timber on Harbor Yards was original frame, reinforced.",
    metric: "80%",
    metricLabel: "Original frame retained",
  },
  {
    head: "Operational",
    body: "Geothermal, daylighting, passive ventilation, and the maintenance crew that will outlast the design team. We design for the second decade.",
    metric: "0",
    metricLabel: "Net energy on Summit Residence",
  },
  {
    head: "Reversibility",
    body: "Field Station II was built to be removed. The screw-pile foundations came out intact and the moraine was restored to within 5 cm of pre-construction grade.",
    metric: "3 wk",
    metricLabel: "To remove and restore",
  },
];

export function SustainabilityView() {
  return (
    <>
      <section className="border-b border-line px-5 pt-16 pb-12 md:px-8 md:pt-24 md:pb-16">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="eyebrow">Sustainability</div>
          <p className="mt-6 max-w-[28ch] text-display-xl tracking-tight text-balance">
            The next eighty years are the brief.
          </p>
          <div className="mt-12 max-w-prose text-[17px] leading-[1.6] text-muted">
            <p>
              The most sustainable building is the one already standing.
              Where it cannot be reused, we measure what we add and account
              for what we take away.
            </p>
          </div>
        </div>
      </section>
      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-2 lg:grid-cols-4">
            {SUSTAINABILITY_PILLARS.map((p) => (
              <div key={p.head} className="border-t border-line pt-6">
                <div className="text-display-md tracking-tight tabnum">{p.metric}</div>
                <div className="mt-2 text-[12px] uppercase tracking-[0.14em] text-muted">
                  {p.metricLabel}
                </div>
                <h3 className="mt-8 text-[18px] tracking-tight">{p.head}</h3>
                <p className="mt-3 text-[14px] leading-[1.6] text-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const PEOPLE = [
  { name: "Mira Olshansky", role: "Founding Partner", office: "New York" },
  { name: "Idris Karam", role: "Partner", office: "London" },
  { name: "Anna Plamondon", role: "Partner", office: "Toronto" },
  { name: "Wei Tang", role: "Senior Designer", office: "New York" },
  { name: "Jonas Bekele", role: "Designer", office: "London" },
  { name: "Priya Kothari", role: "Designer", office: "New York" },
  { name: "Marcus Lévesque", role: "Site Director", office: "Toronto" },
  { name: "Ben Otieno", role: "Crew Lead", office: "New York" },
  { name: "Sarah Ahmadi", role: "Drafting", office: "London" },
  { name: "Tomás Restrepo", role: "Drafting", office: "Copenhagen" },
];

export function PeopleView() {
  return (
    <>
      <section className="border-b border-line px-5 pt-16 pb-12 md:px-8 md:pt-24 md:pb-16">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="eyebrow">People</div>
          <p className="mt-6 max-w-[28ch] text-display-xl tracking-tight text-balance">
            A studio of {PEOPLE.length}+ across four offices, sharing one drafting table.
          </p>
        </div>
      </section>
      <section className="px-5 py-16 md:px-8 md:py-24">
        <div className="mx-auto w-full max-w-[1600px]">
          <ul className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {PEOPLE.map((p) => (
              <li key={p.name}>
                <div
                  className="relative aspect-[4/5] w-full overflow-hidden bg-ink/[0.04]"
                  style={{
                    backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.04), rgba(0,0,0,0.08))`,
                  }}
                >
                  <div className="absolute inset-0 flex items-end p-4">
                    <span className="text-[40px] leading-none tabnum text-ink/30">
                      {p.name
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")}
                    </span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-[15px] tracking-tight">{p.name}</div>
                  <div className="mt-1 text-[12px] text-muted">
                    {p.role} · {p.office}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

const ROLES = [
  {
    title: "Project Architect",
    location: "New York",
    type: "Full-time",
    summary: "Civic and cultural projects, 5+ years post-licensure.",
  },
  {
    title: "Senior Designer — Interiors",
    location: "London",
    type: "Full-time",
    summary: "Hospitality and cultural rooms, deep detailing experience.",
  },
  {
    title: "Site Supervisor",
    location: "Toronto",
    type: "Full-time",
    summary: "Bridge and transit works. Field-led role, weekend windows.",
  },
  {
    title: "Drafting Apprentice",
    location: "Copenhagen",
    type: "Apprenticeship · 18 months",
    summary: "Construction documents under a senior architect's bench.",
  },
];

export function CareersView() {
  return (
    <>
      <section className="border-b border-line px-5 pt-16 pb-12 md:px-8 md:pt-24 md:pb-16">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="eyebrow">Careers</div>
          <p className="mt-6 max-w-[28ch] text-display-xl tracking-tight text-balance">
            We hire for craft, judgement, and a tolerance for sites at 6 a.m.
          </p>
          <div className="mt-12 max-w-prose text-[17px] leading-[1.6] text-muted">
            <p>
              We are flat. Designers detail their own projects. Architects
              draft the connections they invent. Site staff ride decisions
              from feasibility through commissioning.
            </p>
          </div>
        </div>
      </section>
      <section className="px-5 py-12 md:px-8 md:py-16">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="mb-8 eyebrow">Open roles</div>
          <ul>
            {ROLES.map((r) => (
              <li key={r.title} className="border-b border-line py-6">
                <a
                  href="mailto:careers@arengcon.com"
                  className="grid grid-cols-12 items-baseline gap-x-6 gap-y-2"
                >
                  <div className="col-span-12 md:col-span-5">
                    <h3 className="text-[20px] tracking-tight">{r.title}</h3>
                  </div>
                  <div className="col-span-6 md:col-span-3 text-[13px] tracking-tight text-muted">
                    {r.location}
                  </div>
                  <div className="col-span-6 md:col-span-3 text-[13px] tracking-tight text-muted">
                    {r.type}
                  </div>
                  <div className="col-span-12 md:col-span-1 text-right text-[13px] tracking-tight">
                    Apply →
                  </div>
                  <p className="col-span-12 mt-2 text-[14px] leading-[1.55] text-muted md:col-span-7 md:col-start-6">
                    {r.summary}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

const PLACEHOLDER_OFFICES = [
  {
    city: "New York",
    address: ["115 Front Street, Studio 4", "Brooklyn, NY 11201"],
    email: "ny@arengcon.com",
    phone: "+1 (212) 555-0148",
  },
  {
    city: "Toronto",
    address: ["210 Adelaide Street W, 12th Fl", "Toronto, ON M5H 1W7"],
    email: "to@arengcon.com",
    phone: "+1 (416) 555-0220",
  },
  {
    city: "London",
    address: ["44 Charlotte Road, Shoreditch", "London EC2A 3PD"],
    email: "ldn@arengcon.com",
    phone: "+44 20 7946 0033",
  },
];

export function ContactView() {
  return (
    <>
      <section className="border-b border-line px-5 pt-16 pb-12 md:px-8 md:pt-24 md:pb-16">
        <div className="mx-auto w-full max-w-[1600px]">
          <div className="eyebrow">Contact</div>
          <p className="mt-6 max-w-[28ch] text-display-xl tracking-tight text-balance">
            Tell us about your project. We come back within two business days.
          </p>
        </div>
      </section>
      <section className="px-5 py-16 md:px-8 md:py-20">
        <div className="mx-auto grid w-full max-w-[1600px] grid-cols-12 gap-x-6 gap-y-10">
          <div className="col-span-12 md:col-span-4">
            <div className="space-y-2 text-[15px] leading-[1.55]">
              <a href="mailto:newbiz@arengcon.com" className="editorial-link">
                newbiz@arengcon.com
              </a>
              <div className="text-muted">For new project enquiries.</div>
            </div>
            <div className="mt-10 grid grid-cols-1 gap-8">
              {PLACEHOLDER_OFFICES.map((o) => (
                <div key={o.city} className="border-t border-line pt-3">
                  <div className="mb-2 text-[12px] uppercase tracking-[0.14em] text-muted">
                    {o.city}
                  </div>
                  <div className="space-y-1 text-[13px] leading-[1.55]">
                    {o.address.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                    <a
                      href={`mailto:${o.email}`}
                      className="editorial-link block pt-1"
                    >
                      {o.email}
                    </a>
                    <div className="text-muted tabnum">{o.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-span-12 md:col-span-7 md:col-start-6">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}

export function NotFoundView() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center px-5 py-24 md:px-8">
      <div className="text-center">
        <div className="eyebrow">404</div>
        <h1 className="mt-3 text-display-xl tracking-tight">Not found.</h1>
        <a
          href="/"
          className="editorial-link mt-8 inline-block text-[14px] tracking-tight"
        >
          Index →
        </a>
      </div>
    </section>
  );
}

const CATEGORY_FROM_PATH: Record<string, Category> = {
  "/projects/architecture": "arch",
  "/projects/interiors": "int",
  "/projects/construction": "cons",
};

export function resolveView(path: string): React.ReactNode {
  const clean = path.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";

  if (clean === "/" || clean === "") return <HomeView />;
  if (clean === "/projects") return <ProjectsIndexView />;
  if (CATEGORY_FROM_PATH[clean])
    return <ProjectsIndexView category={CATEGORY_FROM_PATH[clean]} />;
  if (clean === "/news") return <NewsView />;
  if (clean === "/about") return <AboutView />;
  if (clean === "/sustainability") return <SustainabilityView />;
  if (clean === "/people") return <PeopleView />;
  if (clean === "/careers") return <CareersView />;
  if (clean === "/contact") return <ContactView />;

  const projectMatch = clean.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) {
    const slug = projectMatch[1];
    if (CATEGORY_FROM_PATH[`/projects/${slug}`]) {
      return <ProjectsIndexView category={CATEGORY_FROM_PATH[`/projects/${slug}`]} />;
    }
    return <ProjectView slug={slug} />;
  }

  const newsMatch = clean.match(/^\/news\/([^/]+)$/);
  if (newsMatch) return <NewsItemView slug={newsMatch[1]} />;

  // Legacy redirects: old routes still resolve
  if (clean === "/architecture") return <ProjectsIndexView category="arch" />;
  if (clean === "/interior-design") return <ProjectsIndexView category="int" />;
  if (clean === "/construction") return <ProjectsIndexView category="cons" />;
  if (clean === "/updates") return <NewsView />;
  const updateMatch = clean.match(/^\/updates\/([^/]+)$/);
  if (updateMatch) return <NewsItemView slug={updateMatch[1]} />;

  return <NotFoundView />;
}
