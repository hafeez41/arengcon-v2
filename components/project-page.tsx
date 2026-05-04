"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { SmartImage } from "./smart-image";
import { useNavigate } from "./spa-router";
import { CATEGORY_LABELS, type Project } from "@/lib/projects";
import { DesignMoves, type DesignMove } from "./design-moves";
import { youtubeId } from "@/lib/image-compress";

const DEFAULT_MOVES: { label: string; description: string }[] = [
  {
    label: "Site",
    description:
      "Reading the parcel — what comes in, what goes out, and how the existing fabric carries weight.",
  },
  {
    label: "Section",
    description:
      "A vertical decision is made before a plan: how the levels stack, how light enters, and where the structural force lands.",
  },
  {
    label: "Structure",
    description:
      "The frame chosen for the eighty-year question — material, span, and what gets repaired and by whom.",
  },
  {
    label: "Envelope",
    description:
      "Skin, opening, and shadow. Calibrated to the climate and the maintenance crew that will outlast the design team.",
  },
  {
    label: "Program",
    description:
      "Rooms made to hold both the brief and what the brief did not anticipate. Generosity engineered in.",
  },
  {
    label: "Public",
    description:
      "What the building gives back to the street — sometimes a step, sometimes a passage, sometimes only a shoulder.",
  },
];

function makeMoves(p: Project): DesignMove[] {
  return DEFAULT_MOVES.map((m, i) => ({
    label: m.label,
    description: m.description,
    image: `https://picsum.photos/seed/${p.slug}-move-${i + 1}/1600/1000`,
  }));
}

const PULL_QUOTES: Record<string, string> = {
  arch: "We came in with a brief and walked out with a building that took our brief somewhere we hadn't asked it to go.",
  int: "The room reads as a room before it reads as a design — that is the highest compliment we can offer.",
  cons: "Forty-two months on site, no surprises on the call. The drawings matched the steel.",
};

function pullQuoteFor(p: Project): { body: string; attribution: string } {
  return {
    body: PULL_QUOTES[p.category],
    attribution: `${p.client}`,
  };
}

const ESSAY: Record<string, string[]> = {
  arch: [
    "The project began with a question about how this place is held together — what carries the load now, what could carry the next eighty years, and what could be left alone.",
    "We worked the section before the plan. The vertical move did the heavy lifting; the plan settled in around it. The structure sits on the ground in a way that makes the ground feel chosen.",
  ],
  int: [
    "Interior projects start with the surfaces and the joints between them. Every detail we drew answered a question about the room, not the drawing.",
    "We worked close to the trades — millworkers, plasterers, finish electricians — because the room is built by their hands and the credit goes to them.",
  ],
  cons: [
    "The build was scheduled in weekend windows around live operations. Every component was sized to fit a forty-foot rotor sling, prefabricated off-site, and erected on a fixed Saturday schedule.",
    "We stayed on the call after the doors opened. Construction is the part of the practice that does not end when the ribbon is cut.",
  ],
};

const CREDITS_TEAM = [
  "Project Director · Mira Olshansky",
  "Project Architect · Idris Karam",
  "Technical Lead · Anna Plamondon",
  "Senior Designer · Wei Tang",
  "Designer · Jonas Bekele",
  "Designer · Priya Kothari",
  "Site Supervisor · Marcus Lévesque",
  "Crew Lead · Ben Otieno",
  "Drafting · Sarah Ahmadi",
  "Drafting · Tomás Restrepo",
];

const CREDITS_CONSULTANTS = [
  "Structural · North Atlantic Engineering",
  "MEP · Reinhardt + Vega",
  "Civil · Hartcourt Civil",
  "Acoustics · Roomwork Acoustic",
  "Landscape · Verdant Studio",
  "Lighting · Filament Lighting Design",
  "Code · Frieze + Bell",
  "Sustainability · Carbon Ledger",
];

export function ProjectPage({
  project,
  gallery,
  videoUrl,
  prev,
  next,
}: {
  project: Project;
  gallery: string[];
  videoUrl?: string | null;
  prev?: Project;
  next?: Project;
}) {
  const cat = CATEGORY_LABELS[project.category];
  const moves = makeMoves(project);
  const quote = pullQuoteFor(project);
  const essay = ESSAY[project.category] ?? [];
  const navigate = useNavigate();

  return (
    <article className="bg-paper">
      {/* Title block */}
      <section className="px-5 pt-16 pb-12 md:px-8 md:pt-24 md:pb-16">
        <div className="mx-auto w-full max-w-[1600px]">
          <nav className="mb-8 flex flex-wrap items-center gap-2 text-[12px] tracking-tight text-muted">
            <a
              href="/projects"
              onClick={(e) => {
                e.preventDefault();
                navigate("/projects");
              }}
              className="editorial-link"
            >
              Projects
            </a>
            <span>/</span>
            <a
              href={cat.href}
              onClick={(e) => {
                e.preventDefault();
                navigate(cat.href);
              }}
              className="editorial-link"
            >
              {cat.name}
            </a>
            <span>/</span>
            <span>{project.title}</span>
          </nav>
          <h1 className="text-display-xl tracking-tight text-balance">
            {project.title}
          </h1>
          <p className="mt-6 max-w-prose text-[18px] leading-[1.5] text-muted md:text-[20px]">
            {project.summary}
          </p>
        </div>
      </section>

      {/* Hero image */}
      <section className="px-5 pb-12 md:px-8 md:pb-16">
        <div className="mx-auto w-full max-w-[1600px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[16/9] w-full overflow-hidden bg-ink/[0.04]"
          >
            <SmartImage
              src={gallery[0] ?? project.image}
              alt={project.title}
              fill
              sizes="100vw"
              className="object-cover"
              priority
            />
          </motion.div>
        </div>
      </section>

      {/* Metadata strip */}
      <section className="border-y border-line">
        <div className="mx-auto w-full max-w-[1600px] px-5 py-8 md:px-8">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-6">
            <Meta label="Location" value={project.location} />
            <Meta label="Client" value={project.client} />
            <Meta label="Typology" value={cat.name} />
            <Meta label="Scale" value={project.size} />
            <Meta label="Status" value={project.status} />
            <Meta label="Year" value={String(project.year)} />
          </dl>
        </div>
      </section>

      {/* Pull quote */}
      <section className="border-b border-line">
        <div className="mx-auto w-full max-w-[1100px] px-5 py-20 md:px-8 md:py-28">
          <blockquote>
            <p className="text-display-md tracking-tight text-balance">
              “{quote.body}”
            </p>
            <footer className="mt-8 text-[13px] uppercase tracking-[0.14em] text-muted">
              — {quote.attribution}
            </footer>
          </blockquote>
        </div>
      </section>

      {/* Design moves */}
      <DesignMoves moves={moves} />

      {/* Essay */}
      <section className="border-t border-line">
        <div className="mx-auto w-full max-w-[1600px] px-5 py-20 md:px-8 md:py-28">
          <div className="grid grid-cols-12 gap-x-6 gap-y-6">
            <div className="col-span-12 md:col-span-3">
              <div className="eyebrow">From the studio</div>
              <div className="mt-2 text-[14px] tracking-tight">
                Bjarke Ingels never wrote this. We did.
              </div>
            </div>
            <div className="col-span-12 max-w-prose md:col-span-8 md:col-start-5">
              <div className="space-y-6 text-[17px] leading-[1.65]">
                {essay.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {gallery.length > 1 && (
        <section className="border-t border-line">
          <div className="mx-auto w-full max-w-[1600px] px-5 py-16 md:px-8 md:py-24">
            <div className="mb-8 eyebrow">Gallery</div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-5">
              {gallery.slice(1).map((src, i) => (
                <div
                  key={`${i}-${src.slice(0, 32)}`}
                  className="relative aspect-[4/3] w-full overflow-hidden bg-ink/[0.04]"
                >
                  <SmartImage
                    src={src}
                    alt={`${project.title} ${i + 2}`}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Video */}
      {videoUrl && <VideoBlock url={videoUrl} title={project.title} />}

      {/* Credits */}
      <section className="border-t border-line">
        <div className="mx-auto w-full max-w-[1600px] px-5 py-16 md:px-8 md:py-24">
          <div className="grid grid-cols-12 gap-x-6 gap-y-10">
            <div className="col-span-12 md:col-span-3">
              <div className="eyebrow">Credits</div>
            </div>
            <div className="col-span-12 md:col-span-4">
              <div className="text-[13px] tracking-tight">Studio</div>
              <ul className="mt-3 space-y-1.5 text-[13px] leading-[1.55] text-muted">
                {CREDITS_TEAM.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            <div className="col-span-12 md:col-span-4 md:col-start-9">
              <div className="text-[13px] tracking-tight">Collaborators</div>
              <ul className="mt-3 space-y-1.5 text-[13px] leading-[1.55] text-muted">
                {CREDITS_CONSULTANTS.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Share + bookend */}
      <section className="border-t border-line">
        <div className="mx-auto w-full max-w-[1600px] px-5 py-12 md:px-8 md:py-14">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="text-[13px] tracking-tight text-muted">
              Share —{" "}
              <a
                href={`mailto:?subject=${encodeURIComponent(project.title)}`}
                className="editorial-link text-ink"
              >
                Email
              </a>
              {" · "}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="editorial-link text-ink"
              >
                LinkedIn
              </a>
              {" · "}
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="editorial-link text-ink"
              >
                X
              </a>
            </div>
            <div className="flex items-center gap-6 text-[13px] tracking-tight">
              {prev && (
                <a
                  href={`/projects/${prev.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/projects/${prev.slug}`);
                  }}
                  className="editorial-link"
                >
                  ← {prev.title}
                </a>
              )}
              {next && (
                <a
                  href={`/projects/${next.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/projects/${next.slug}`);
                  }}
                  className="editorial-link"
                >
                  {next.title} →
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10.5px] uppercase tracking-[0.14em] text-muted">
        {label}
      </dt>
      <dd className="mt-1.5 text-[13.5px] tracking-tight">{value}</dd>
    </div>
  );
}

function VideoBlock({ url, title }: { url: string; title: string }) {
  const id = youtubeId(url);
  const [playing, setPlaying] = useState(false);
  if (!id) return null;
  const thumb = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  return (
    <section className="border-t border-line">
      <div className="mx-auto w-full max-w-[1600px] px-5 py-16 md:px-8 md:py-24">
        <div className="mb-6 eyebrow">Video</div>
        <div className="relative aspect-video w-full overflow-hidden bg-ink">
          {playing ? (
            <iframe
              src={`https://www.youtube.com/embed/${id}?autoplay=1&rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="group absolute inset-0 block"
              aria-label="Play video"
            >
              <span
                className="absolute inset-0 bg-cover bg-center transition-opacity duration-300 group-hover:opacity-90"
                style={{ backgroundImage: `url(${thumb})` }}
              />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-paper/15 ring-1 ring-paper/40 backdrop-blur-sm transition-colors duration-300 group-hover:bg-paper/25">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="ml-0.5 text-paper"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
