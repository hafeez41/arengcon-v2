"use client";

import { useEffect } from "react";
import { Reveal } from "./reveal";
import { CategoryExplorer } from "./category-explorer";
import { Logo } from "./logo";
import type { Category } from "@/lib/projects";
import { useEffectiveContact } from "@/lib/effective-data";
import { useModal } from "./modal-context";
import { ContactForm } from "@/app/contact/contact-form";

export function HomeView() {
  return (
    <div className="pt-[52px] md:pt-[64px]">
      <CategoryExplorer />
    </div>
  );
}

export function CategoryView({ category }: { category: Category }) {
  const { openCategory } = useModal();
  useEffect(() => {
    openCategory(category);
  }, [category, openCategory]);
  return <HomeView />;
}

export function UpdatesView() {
  const { openUpdates } = useModal();
  useEffect(() => {
    openUpdates();
  }, [openUpdates]);
  return <HomeView />;
}

export function ProjectView({ slug }: { slug: string }) {
  const { openProject } = useModal();
  useEffect(() => {
    openProject(slug);
  }, [slug, openProject]);
  return <HomeView />;
}

export function UpdateView({ slug }: { slug: string }) {
  const { openUpdate } = useModal();
  useEffect(() => {
    openUpdate(slug);
  }, [slug, openUpdate]);
  return <HomeView />;
}

const TIMELINE = [
  { year: "2008", text: "Founded as a two-person studio in Brooklyn." },
  { year: "2012", text: "First completed bridge — a single-span pedestrian crossing." },
  { year: "2016", text: "Toronto studio opens." },
  { year: "2019", text: "Crossed 50 built projects." },
  { year: "2022", text: "London studio opens." },
  { year: "2024", text: "North River Crossing completed." },
];

export function AboutView() {
  return (
    <>
      <section className="px-5 pb-10 pt-32 md:px-10 md:pt-40">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="mb-6 text-[10px] uppercase tracking-wider2 text-ink/55">
            About
          </div>
          <h1 className="font-bank text-[14vw] font-medium uppercase leading-[0.92] tracking-tight md:text-[8vw]">
            The work speaks.
          </h1>
        </div>
      </section>

      <section className="border-t border-line px-5 py-12 md:px-10 md:py-20">
        <div className="mx-auto grid w-full max-w-[1800px] grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 md:col-span-3">
            <span className="text-[10px] uppercase tracking-wider2 text-ink/45">
              Statement
            </span>
          </div>
          <div className="col-span-12 md:col-span-9">
            <Reveal>
              <p className="max-w-3xl font-bank text-2xl font-medium uppercase leading-[1.15] tracking-tight md:text-4xl">
                Arengcon is a multidisciplinary practice of architects, interior designers, and builders. We take projects from feasibility to final inspection.
              </p>
            </Reveal>
            <Reveal delay={0.15} className="mt-12 grid max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
              <p className="text-[12px] uppercase tracking-wider2 leading-[1.7] text-ink/75">
                We work in a single open studio with shared drafting tables and shared responsibility. There is no project manager between you and the people drawing your building. Decisions get made in the room.
              </p>
              <p className="text-[12px] uppercase tracking-wider2 leading-[1.7] text-ink/75">
                Buildings outlast clients, briefs, and trends. Every detail we draw answers a question about the next eighty years — material fatigue, climate drift, what gets repaired and by whom.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-line px-5 py-16 md:px-10 md:py-24">
        <div className="mx-auto grid w-full max-w-[1800px] grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 md:col-span-3">
            <span className="text-[10px] uppercase tracking-wider2 text-ink/45">
              Logo
            </span>
          </div>
          <div className="col-span-12 md:col-span-9">
            <Reveal>
              <Logo className="h-[34vmin] w-[34vmin]" />
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-ink px-5 py-16 text-paper md:px-10 md:py-24">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="mb-10 text-[10px] uppercase tracking-wider2 text-paper/60">
            Timeline · 2008 — Present
          </div>
          <div>
            {TIMELINE.map((t) => (
              <Reveal key={t.year}>
                <div className="grid grid-cols-12 items-baseline gap-4 border-t border-paper/15 py-6 md:gap-6 md:py-8">
                  <span className="col-span-3 font-bank tabnum text-2xl font-medium uppercase tracking-tight md:col-span-2 md:text-4xl">
                    {t.year}
                  </span>
                  <p className="col-span-9 max-w-2xl text-[12px] uppercase tracking-wider2 leading-[1.6] text-paper/85 md:col-span-10 md:text-base">
                    {t.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line px-5 py-24 md:px-10 md:py-32">
        <div className="mx-auto w-full max-w-[1800px]">
          <Reveal>
            <p className="max-w-4xl font-bank text-3xl font-medium uppercase leading-[1.1] tracking-tight md:text-6xl">
              Want to work with us?{" "}
              <a
                href="/contact"
                className="underline decoration-1 underline-offset-4"
                data-cursor="hover"
              >
                Get in touch →
              </a>
            </p>
          </Reveal>
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
  const { contact } = useEffectiveContact();
  const offices =
    contact && contact.offices.length > 0
      ? contact.offices.map((o) => ({
          city: o.city,
          address: o.address.split("\n").map((s) => s.trim()).filter(Boolean),
          email: o.email,
          phone: o.phone,
        }))
      : PLACEHOLDER_OFFICES;
  const primaryEmail = contact?.email || "hello@arengcon.com";

  return (
    <>
      <section className="px-5 pb-10 pt-32 md:px-10 md:pt-40">
        <div className="mx-auto w-full max-w-[1800px]">
          <div className="mb-6 text-[10px] uppercase tracking-wider2 text-ink/55">
            Contact
          </div>
          <h1 className="font-bank text-[14vw] font-medium uppercase leading-[0.92] tracking-tight md:text-[8vw]">
            Start a project.
          </h1>
        </div>
      </section>

      <section className="border-t border-line px-5 py-12 md:px-10 md:py-16">
        <div className="mx-auto grid w-full max-w-[1800px] grid-cols-12 gap-4 md:gap-6">
          <div className="col-span-12 md:col-span-4">
            <Reveal>
              <p className="font-bank text-xl font-medium uppercase leading-[1.2] tracking-tight md:text-2xl">
                Tell us about your project. We come back within two business days.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="mt-8">
              <a
                href={`mailto:${primaryEmail}`}
                data-spa-skip
                className="hover-line text-[12px] uppercase tracking-wider2"
                data-cursor="hover"
              >
                {primaryEmail}
              </a>
            </Reveal>

            <div className="mt-12 grid grid-cols-1 gap-8">
              {offices.map((o, i) => (
                <Reveal key={`${o.city}-${i}`} delay={0.15 + i * 0.05}>
                  <div className="border-t border-line pt-3">
                    <div className="mb-2 text-[10px] uppercase tracking-wider2 text-ink/45">
                      {o.city}
                    </div>
                    <div className="space-y-1 text-[11px] uppercase tracking-wider2">
                      {o.address.map((line) => (
                        <div key={line}>{line}</div>
                      ))}
                      <a
                        href={`mailto:${o.email}`}
                        data-spa-skip
                        className="hover-line block pt-1"
                      >
                        {o.email}
                      </a>
                      <div className="text-ink/55 tabnum">{o.phone}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <div className="col-span-12 md:col-span-7 md:col-start-6">
            <Reveal delay={0.05}>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

export function NotFoundView() {
  return (
    <section className="flex min-h-[80vh] items-center justify-center px-5 md:px-10">
      <div className="text-center">
        <div className="text-[10px] uppercase tracking-wider2 text-ink/55">
          404
        </div>
        <h1 className="mt-4 font-bank text-[14vw] font-medium uppercase leading-[0.92] tracking-tight md:text-[7vw]">
          Not found.
        </h1>
        <a
          href="/"
          className="mt-8 inline-block text-[11px] uppercase tracking-wider2 hover-line"
          data-cursor="hover"
        >
          Index →
        </a>
      </div>
    </section>
  );
}

export function resolveView(path: string): React.ReactNode {
  const clean = path.split("?")[0].split("#")[0].replace(/\/$/, "") || "/";

  if (clean === "/" || clean === "") return <HomeView />;
  if (clean === "/architecture") return <CategoryView category="arch" />;
  if (clean === "/interior-design") return <CategoryView category="int" />;
  if (clean === "/construction") return <CategoryView category="cons" />;
  if (clean === "/updates") return <UpdatesView />;
  if (clean === "/about") return <AboutView />;
  if (clean === "/contact") return <ContactView />;

  const projectMatch = clean.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) return <ProjectView slug={projectMatch[1]} />;

  const updateMatch = clean.match(/^\/updates\/([^/]+)$/);
  if (updateMatch) return <UpdateView slug={updateMatch[1]} />;

  return <NotFoundView />;
}
