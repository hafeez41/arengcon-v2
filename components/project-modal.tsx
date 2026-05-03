"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SmartImage as Image } from "./smart-image";
import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  CATEGORY_LABELS,
  type Category,
  type Project,
} from "@/lib/projects";
import { type Update, formatDate } from "@/lib/updates";
import { useModal } from "./modal-context";
import { useLenis } from "./lenis-provider";
import { useNavigate, useRouterPath } from "./spa-router";
import {
  findProject,
  findUpdate,
  projectGallery,
  projectVideo,
  projectsByCategoryFiltered,
  updateVideo,
  useEffectiveProjects,
  useEffectiveUpdates,
} from "@/lib/effective-data";
import { youtubeId } from "@/lib/image-compress";

const TEXT_ONLY_KINDS = new Set(["Talk"]);

const ROUTE_DRIVEN = /^\/(architecture|interior-design|construction|updates|projects\/|updates\/)/;

export function ProjectModal() {
  const { modal, close, setSlug } = useModal();
  const lenis = useLenis();
  const navigate = useNavigate();
  const path = useRouterPath();
  const open = modal !== null;

  const handleClose = useCallback(() => {
    close();
    if (ROUTE_DRIVEN.test(path)) navigate("/");
  }, [close, navigate, path]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.body.style.overflow = "hidden";
    lenis?.stop();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open, handleClose, lenis]);

  return (
    <AnimatePresence>
      {modal?.kind === "project" && (
        <ProjectModalView key={`project-${modal.slug}`} slug={modal.slug} onClose={handleClose} onChangeSlug={setSlug} />
      )}
      {modal?.kind === "update" && (
        <UpdateModalView key={`update-${modal.slug}`} slug={modal.slug} onClose={handleClose} onChangeSlug={setSlug} />
      )}
      {modal?.kind === "category" && (
        <CategoryModalView key={`category-${modal.slug}`} category={modal.slug} onClose={handleClose} />
      )}
      {modal?.kind === "updates" && (
        <UpdatesListModalView key="updates-list" onClose={handleClose} />
      )}
    </AnimatePresence>
  );
}

function ProjectModalView({
  slug,
  onClose,
  onChangeSlug,
}: {
  slug: string;
  onClose: () => void;
  onChangeSlug: (slug: string) => void;
}) {
  const { list, adminProjects } = useEffectiveProjects();
  const project = findProject(list, slug);
  const siblings = useMemo(
    () => (project ? projectsByCategoryFiltered(list, project.category) : []),
    [project, list],
  );
  const idx = project ? siblings.findIndex((p) => p.slug === project.slug) : -1;

  const goPrev = useCallback(() => {
    if (siblings.length === 0 || idx < 0) return;
    const next = siblings[(idx - 1 + siblings.length) % siblings.length];
    onChangeSlug(next.slug);
  }, [siblings, idx, onChangeSlug]);

  const goNext = useCallback(() => {
    if (siblings.length === 0 || idx < 0) return;
    const next = siblings[(idx + 1) % siblings.length];
    onChangeSlug(next.slug);
  }, [siblings, idx, onChangeSlug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  if (!project) return null;

  const gallery = projectGallery(project, adminProjects);
  const video = projectVideo(project, adminProjects);

  return (
    <ModalShell onClose={onClose}>
      <ProjectBody
        project={project}
        gallery={gallery}
        videoUrl={video}
        canStep={siblings.length > 1}
        prev={siblings[(idx - 1 + siblings.length) % siblings.length]}
        next={siblings[(idx + 1) % siblings.length]}
        onPrev={goPrev}
        onNext={goNext}
      />
    </ModalShell>
  );
}

function ProjectBody({
  project,
  gallery,
  videoUrl,
  canStep,
  prev,
  next,
  onPrev,
  onNext,
}: {
  project: Project;
  gallery: string[];
  videoUrl: string | null;
  canStep: boolean;
  prev?: Project;
  next?: Project;
  onPrev: () => void;
  onNext: () => void;
}) {
  const cat = CATEGORY_LABELS[project.category];
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="border-b border-line px-5 py-12 md:px-10 md:py-16">
        <div className="mb-5 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-ink/55">
          <span>{cat.name}</span>
          <span>/</span>
          <span className="tabnum">{project.year}</span>
          <span>/</span>
          <span>{project.status}</span>
        </div>
        <h1 className="font-bank text-[10vw] font-medium uppercase leading-[0.95] tracking-tight md:text-[5.5vw]">
          {project.title}
        </h1>
      </div>

      <div className="px-5 py-10 md:px-10 md:py-14">
        <button
          type="button"
          onClick={() => setLightboxIndex(0)}
          data-cursor="hover"
          className="group relative block aspect-[16/9] w-full overflow-hidden bg-ink/5"
        >
          <Image
            src={gallery[0]}
            alt={project.title}
            fill
            sizes="100vw"
            className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
            priority
          />
          <span className="pointer-events-none absolute bottom-4 right-4 bg-ink/80 px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-paper opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Enlarge
          </span>
        </button>
      </div>

      <div className="border-t border-line px-5 py-12 md:px-10 md:py-16">
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-12 gap-5 md:gap-7">
          <div className="col-span-12 md:col-span-3">
            <dl className="grid grid-cols-2 gap-y-5 md:grid-cols-1 md:gap-y-5">
              <Spec label="Client" value={project.client} />
              <Spec label="Location" value={project.location} />
              <Spec label="Year" value={String(project.year)} />
              <Spec label="Size" value={project.size} />
              <Spec label="Status" value={project.status} />
              <Spec label="Discipline" value={cat.name} />
            </dl>
          </div>
          <div className="col-span-12 md:col-span-8 md:col-start-5">
            <p className="font-bank text-2xl font-medium uppercase leading-[1.15] tracking-tight md:text-3xl">
              {project.summary}
            </p>
            <div className="mt-8 max-w-2xl space-y-4">
              {project.description.map((p, i) => (
                <p
                  key={i}
                  className="text-[12px] uppercase leading-[1.7] tracking-[0.14em] text-ink/75"
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-line px-5 py-10 md:px-10 md:py-14">
        <div className="mb-5 flex items-end justify-between gap-3">
          <span className="font-bank text-[10px] uppercase tracking-[0.18em] text-ink/55">
            Gallery — {gallery.length} images
          </span>
          <span className="font-bank text-[10px] uppercase tracking-[0.18em] text-ink/40">
            Click to enlarge
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {gallery.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setLightboxIndex(i)}
              data-cursor="hover"
              className="group relative aspect-[4/3] overflow-hidden bg-ink/5"
            >
              <Image
                src={src}
                alt={`${project.title} ${i + 1}`}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
              />
            </button>
          ))}
        </div>
      </div>

      {videoUrl && <VideoBlock url={videoUrl} title={project.title} />}

      {canStep && (
        <div className="grid grid-cols-2 border-t border-line">
          <button
            type="button"
            onClick={onPrev}
            data-cursor="hover"
            className="group flex flex-col items-start gap-2 border-r border-line px-5 py-7 text-left transition-colors duration-300 hover:bg-ink/5 md:px-10 md:py-9"
          >
            <span className="text-[10px] uppercase tracking-[0.18em] text-ink/55">
              ← Previous
            </span>
            <span className="font-bank text-xl font-medium uppercase tracking-tight md:text-2xl">
              {prev?.title}
            </span>
          </button>
          <button
            type="button"
            onClick={onNext}
            data-cursor="hover"
            className="group flex flex-col items-end gap-2 px-5 py-7 text-right transition-colors duration-300 hover:bg-ink/5 md:px-10 md:py-9"
          >
            <span className="text-[10px] uppercase tracking-[0.18em] text-ink/55">
              Next →
            </span>
            <span className="font-bank text-xl font-medium uppercase tracking-tight md:text-2xl">
              {next?.title}
            </span>
          </button>
        </div>
      )}

      <Lightbox
        gallery={gallery}
        open={lightboxIndex !== null}
        index={lightboxIndex ?? 0}
        onClose={() => setLightboxIndex(null)}
        onChange={(i) => setLightboxIndex(i)}
        title={project.title}
      />
    </>
  );
}

function UpdateModalView({
  slug,
  onClose,
  onChangeSlug,
}: {
  slug: string;
  onClose: () => void;
  onChangeSlug: (slug: string) => void;
}) {
  const { list: updates, adminUpdates } = useEffectiveUpdates();
  const update = findUpdate(updates, slug);
  const idx = update ? updates.findIndex((u) => u.slug === update.slug) : -1;

  const goPrev = useCallback(() => {
    if (idx < 0) return;
    onChangeSlug(updates[(idx - 1 + updates.length) % updates.length].slug);
  }, [idx, onChangeSlug]);

  const goNext = useCallback(() => {
    if (idx < 0) return;
    onChangeSlug(updates[(idx + 1) % updates.length].slug);
  }, [idx, onChangeSlug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  if (!update) return null;

  const video = updateVideo(update, adminUpdates);

  return (
    <ModalShell onClose={onClose}>
      <UpdateBody
        update={update}
        videoUrl={video}
        prev={updates[(idx - 1 + updates.length) % updates.length]}
        next={updates[(idx + 1) % updates.length]}
        onPrev={goPrev}
        onNext={goNext}
      />
    </ModalShell>
  );
}

function UpdateBody({
  update,
  videoUrl,
  prev,
  next,
  onPrev,
  onNext,
}: {
  update: Update;
  videoUrl: string | null;
  prev: Update;
  next: Update;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const hasImage = !!update.image && !TEXT_ONLY_KINDS.has(update.kind);
  const textOnly = !hasImage && !videoUrl;
  const gallery = hasImage ? [update.image] : [];

  return (
    <>
      <div className="border-b border-line px-5 py-12 md:px-10 md:py-16">
        <div className="mb-5 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-ink/55">
          <span>Updates</span>
          <span>/</span>
          <span>{update.kind}</span>
          <span>/</span>
          <span className="tabnum">{formatDate(update.date)}</span>
        </div>
        <h1 className="max-w-5xl font-bank text-[8vw] font-medium uppercase leading-[1.0] tracking-tight md:text-[4vw]">
          {update.title}
        </h1>
      </div>

      {hasImage && (
        <div className="px-5 py-10 md:px-10 md:py-14">
          <button
            type="button"
            onClick={() => setLightboxIndex(0)}
            data-cursor="hover"
            className="group relative block aspect-[16/9] w-full overflow-hidden bg-ink/5"
          >
            <Image
              src={update.image}
              alt={update.title}
              fill
              sizes="100vw"
              className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
              priority
            />
          </button>
        </div>
      )}

      {videoUrl && <VideoBlock url={videoUrl} title={update.title} />}

      <div
        className={clsx(
          "px-5 py-12 md:px-10 md:py-16",
          textOnly ? "" : "border-t border-line",
        )}
      >
        <div className="mx-auto grid w-full max-w-[1400px] grid-cols-12 gap-5 md:gap-7">
          <div className="col-span-12 md:col-span-3">
            <div className="text-[10px] uppercase tracking-[0.18em] text-ink/45">
              {update.kind}
            </div>
            <div className="mt-2 text-[11px] uppercase tracking-[0.18em] tabnum">
              {formatDate(update.date)}
            </div>
            {textOnly && (
              <div className="mt-4 inline-block bg-ink/5 px-2 py-1 text-[9px] uppercase tracking-[0.18em] text-ink/55">
                Text update
              </div>
            )}
          </div>
          <div className="col-span-12 md:col-span-8 md:col-start-5">
            <p className="font-bank text-2xl font-medium uppercase leading-[1.15] tracking-tight md:text-3xl">
              {update.excerpt}
            </p>
            <div className="mt-8 max-w-2xl space-y-4">
              {update.body.map((p, i) => (
                <p
                  key={i}
                  className="text-[12px] uppercase leading-[1.7] tracking-[0.14em] text-ink/75"
                >
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 border-t border-line">
        <button
          type="button"
          onClick={onPrev}
          data-cursor="hover"
          className="flex flex-col items-start gap-2 border-r border-line px-5 py-7 text-left transition-colors duration-300 hover:bg-ink/5 md:px-10 md:py-9"
        >
          <span className="text-[10px] uppercase tracking-[0.18em] text-ink/55">
            ← Previous
          </span>
          <span className="font-bank text-xl font-medium uppercase tracking-tight md:text-2xl">
            {prev.title}
          </span>
        </button>
        <button
          type="button"
          onClick={onNext}
          data-cursor="hover"
          className="flex flex-col items-end gap-2 px-5 py-7 text-right transition-colors duration-300 hover:bg-ink/5 md:px-10 md:py-9"
        >
          <span className="text-[10px] uppercase tracking-[0.18em] text-ink/55">
            Next →
          </span>
          <span className="font-bank text-xl font-medium uppercase tracking-tight md:text-2xl">
            {next.title}
          </span>
        </button>
      </div>

      {gallery.length > 0 && (
        <Lightbox
          gallery={gallery}
          open={lightboxIndex !== null}
          index={lightboxIndex ?? 0}
          onClose={() => setLightboxIndex(null)}
          onChange={(i) => setLightboxIndex(i)}
          title={update.title}
        />
      )}
    </>
  );
}

function ModalShell({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  return (
    <motion.div
      key="modal-shell"
      className="fixed inset-0 z-[120] bg-paper text-ink"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pointer-events-none absolute right-4 top-4 z-20 md:right-8 md:top-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          data-cursor="hover"
          className="pointer-events-auto group flex h-10 w-10 items-center justify-center rounded-full bg-ink/5 transition-colors duration-300 hover:bg-ink/10"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            className="transition-transform duration-300 group-hover:rotate-90"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <motion.div
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -16, opacity: 0 }}
        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        className="h-full overflow-y-auto overscroll-contain"
        data-lenis-prevent
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
        onScroll={(e) => {
          const el = e.currentTarget;
          setScrolled(el.scrollTop > 8);
          setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 8);
        }}
      >
        <div className="pt-12 md:pt-16">{children}</div>
      </motion.div>
      <ScrollHint show={!scrolled && !atBottom} />
    </motion.div>
  );
}

function ScrollHint({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          className="pointer-events-none absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-ink/40"
        >
          <span className="font-bank text-[10px] uppercase tracking-[0.32em]">
            Scroll
          </span>
          <motion.svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ y: [0, 4, 0] }}
            transition={{ duration: 1.6, ease: "easeInOut", repeat: Infinity }}
          >
            <path d="M7 13l5 5 5-5" />
            <path d="M7 6l5 5 5-5" />
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Lightbox({
  gallery,
  open,
  index,
  onClose,
  onChange,
  title,
}: {
  gallery: string[];
  open: boolean;
  index: number;
  onClose: () => void;
  onChange: (i: number) => void;
  title: string;
}) {
  const goPrev = useCallback(
    () => onChange((index - 1 + gallery.length) % gallery.length),
    [index, gallery.length, onChange],
  );
  const goNext = useCallback(
    () => onChange((index + 1) % gallery.length),
    [index, gallery.length, onChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      } else if (e.key === "ArrowLeft") {
        e.stopPropagation();
        goPrev();
      } else if (e.key === "ArrowRight") {
        e.stopPropagation();
        goNext();
      }
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true } as never);
  }, [open, onClose, goPrev, goNext]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[140] bg-ink/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          onClick={onClose}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label="Close gallery"
            data-cursor="hover"
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-paper/10 text-paper transition-colors duration-300 hover:bg-paper/20 md:right-8 md:top-6"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
                aria-label="Previous image"
                data-cursor="hover"
                className="absolute left-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-paper/10 text-paper transition-colors duration-300 hover:bg-paper/20 md:left-8"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
                aria-label="Next image"
                data-cursor="hover"
                className="absolute right-4 top-1/2 z-10 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-paper/10 text-paper transition-colors duration-300 hover:bg-paper/20 md:right-8"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </>
          )}

          <div
            className="relative flex h-full w-full items-center justify-center px-12 py-16 md:px-24 md:py-20"
            onClick={(e) => e.stopPropagation()}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.99 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="relative h-full w-full"
              >
                <Image
                  src={gallery[index]}
                  alt={`${title} ${index + 1}`}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.18em] text-paper/70 tabnum">
              {String(index + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function VideoBlock({ url, title }: { url: string; title: string }) {
  const [playing, setPlaying] = useState(false);
  const id = youtubeId(url);
  if (!id) return null;
  const thumb = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
  return (
    <div className="border-t border-line px-5 py-10 md:px-10 md:py-14">
      <div className="mb-5 flex items-end justify-between gap-3">
        <span className="font-bank text-[10px] uppercase tracking-[0.18em] text-ink/55">
          Video
        </span>
        <span className="font-bank text-[10px] uppercase tracking-[0.18em] text-ink/40">
          YouTube
        </span>
      </div>
      <div className="relative aspect-video w-full overflow-hidden bg-ink/90">
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
            data-cursor="hover"
            className="group absolute inset-0 block"
            aria-label="Play video"
          >
            <span
              className="absolute inset-0 bg-cover bg-center opacity-80 transition-opacity duration-300 group-hover:opacity-100"
              style={{ backgroundImage: `url(${thumb})` }}
            />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-paper/15 ring-1 ring-paper/40 backdrop-blur-sm transition-colors duration-300 group-hover:bg-paper/25">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 text-paper">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.18em] text-ink/45">{label}</dt>
      <dd className="mt-1 text-[12px] uppercase tracking-[0.14em]">{value}</dd>
    </div>
  );
}

const CATEGORY_INTROS: Record<Category, string> = {
  arch: "Architectural design projects — civic, infrastructural, and residential. Each begins with a question about how a place is held together, then resolves into drawings, joints, and crews on site.",
  int: "Interior projects — workplaces, hospitality, cultural rooms. We design the surfaces and the joints between them, working close to the trades that build them.",
  cons: "Constructed projects — bridges, transit works, demountable field stations. We deliver the build, not just the drawing set, and stay on the call after the doors open.",
};

function CategoryModalView({
  category,
  onClose,
}: {
  category: Category;
  onClose: () => void;
}) {
  const cat = CATEGORY_LABELS[category];
  const { list: allProjects } = useEffectiveProjects();
  const list = projectsByCategoryFiltered(allProjects, category);
  const { openProject } = useModal();

  return (
    <ModalShell onClose={onClose}>
      <div className="border-b border-line px-5 py-12 md:px-10 md:py-16">
        <div className="mb-5 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-ink/55">
          <span>Index</span>
          <span>/</span>
          <span>{cat.name}</span>
          <span>/</span>
          <span className="tabnum">{String(list.length).padStart(2, "0")} projects</span>
        </div>
        <h1 className="font-bank text-[10vw] font-medium uppercase leading-[0.95] tracking-tight md:text-[5.5vw]">
          {cat.name}
        </h1>
        <p className="mt-6 max-w-3xl text-[12px] uppercase leading-[1.7] tracking-[0.14em] text-ink/65 md:mt-8">
          {CATEGORY_INTROS[category]}
        </p>
      </div>

      <div className="px-5 py-10 md:px-10 md:py-14">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:gap-8 lg:grid-cols-3">
          {list.map((p, i) => (
            <motion.button
              key={p.slug}
              type="button"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.06 + i * 0.05,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              onClick={() => openProject(p.slug)}
              data-cursor="hover"
              className="group block text-left"
            >
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-ink/5">
                <Image
                  src={p.image}
                  alt={p.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                />
              </div>
              <div className="mt-3 flex items-baseline justify-between gap-3">
                <h3 className="font-bank text-base font-medium uppercase tracking-tight md:text-lg">
                  {p.title}
                </h3>
                <span className="tabnum text-[10px] uppercase tracking-[0.18em] text-ink/55">
                  {p.year}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-ink/55">
                <span>{p.location}</span>
                <span className="opacity-50">·</span>
                <span>{p.status}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="border-t border-line px-5 py-12 md:px-10 md:py-16">
        <span className="text-[10px] uppercase tracking-[0.18em] text-ink/55">
          End of index
        </span>
      </div>
    </ModalShell>
  );
}

function UpdatesListModalView({ onClose }: { onClose: () => void }) {
  const { openUpdate } = useModal();
  const { list: updates } = useEffectiveUpdates();

  return (
    <ModalShell onClose={onClose}>
      <div className="border-b border-line px-5 py-12 md:px-10 md:py-16">
        <div className="mb-5 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-ink/55">
          <span>Updates</span>
          <span>/</span>
          <span className="tabnum">
            {String(updates.length).padStart(2, "0")} entries
          </span>
        </div>
        <h1 className="font-bank text-[10vw] font-medium uppercase leading-[0.95] tracking-tight md:text-[5.5vw]">
          Updates
        </h1>
      </div>

      <ul className="px-5 md:px-10">
        {updates.map((u, i) => {
          const textOnly = TEXT_ONLY_KINDS.has(u.kind) || !u.image;
          return (
            <motion.li
              key={u.slug}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.06 + i * 0.04,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <button
                type="button"
                onClick={() => openUpdate(u.slug)}
                data-cursor="hover"
                className="group flex w-full items-center gap-5 border-b border-line py-5 text-left transition-colors duration-300 hover:bg-ink/[0.025] md:gap-7 md:py-7"
              >
                <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden bg-ink/5 md:w-32">
                  {!textOnly && (
                    <Image
                      src={u.image}
                      alt={u.title}
                      fill
                      sizes="160px"
                      className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04]"
                    />
                  )}
                  {textOnly && (
                    <div className="absolute inset-0 flex items-center justify-center text-[9px] uppercase tracking-[0.18em] text-ink/55">
                      Text
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-bank text-lg font-medium uppercase tracking-tight md:text-2xl">
                    {u.title}
                  </h3>
                  <div className="mt-1.5 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-ink/55">
                    <span>{u.kind}</span>
                    <span className="opacity-50">·</span>
                    <span className="tabnum">{formatDate(u.date)}</span>
                  </div>
                </div>
                <span className="hidden text-[11px] uppercase tracking-[0.18em] text-ink/45 md:inline">
                  →
                </span>
              </button>
            </motion.li>
          );
        })}
      </ul>

      <div className="border-t border-line px-5 py-12 md:px-10 md:py-16">
        <span className="text-[10px] uppercase tracking-[0.18em] text-ink/55">
          End of updates
        </span>
      </div>
    </ModalShell>
  );
}
