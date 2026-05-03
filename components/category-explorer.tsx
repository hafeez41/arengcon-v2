"use client";

import { AnimatePresence, motion } from "framer-motion";
import { SmartImage as Image } from "./smart-image";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { CATEGORY_LABELS, type Category } from "@/lib/projects";
import { formatDate } from "@/lib/updates";
import {
  projectsByCategoryFiltered,
  useEffectiveProjects,
  useEffectiveUpdates,
} from "@/lib/effective-data";
import { Logo } from "./logo";
import { useIntroDone } from "./intro-context";
import { useModal } from "./modal-context";

type TileKey = Category | "updates";

const TILES: {
  key: TileKey;
  name: string;
  tag: string;
  href: string;
}[] = [
  { key: "arch", ...CATEGORY_LABELS.arch },
  { key: "int", ...CATEGORY_LABELS.int },
  { key: "cons", ...CATEGORY_LABELS.cons },
  { key: "updates", name: "Updates", tag: "Studio updates", href: "/updates" },
];

const CLOSE_DELAY_MS = 180;

export function CategoryExplorer() {
  const [active, setActive] = useState<TileKey | null>(null);
  const closeTimer = useRef<number | null>(null);
  const introDone = useIntroDone();
  const { openCategory, openUpdates } = useModal();

  const openTile = (key: TileKey) => {
    if (key === "updates") openUpdates();
    else openCategory(key);
  };

  const cancelClose = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = window.setTimeout(() => setActive(null), CLOSE_DELAY_MS);
  };

  useEffect(() => () => cancelClose(), []);

  return (
    <section className="relative grid h-[calc(100svh-64px-57px)] min-h-[480px] grid-cols-12 border-t border-line">
      {introDone && (
        <div className="pointer-events-none absolute inset-0 z-0 hidden items-center justify-center md:flex">
          <motion.div
            layoutId="brand-mark"
            transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[42vmin] w-[42vmin]"
          >
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: active ? 0.06 : 0.14 }}
              transition={{ delay: 0.45, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="relative h-full w-full"
            >
              <Logo className="h-full w-full" priority />
            </motion.div>
          </motion.div>
        </div>
      )}
      <div
        className="relative z-10 col-span-12 flex flex-col border-line md:col-span-5 md:border-r lg:col-span-4"
        onMouseLeave={scheduleClose}
      >
        {TILES.map((tile, i) => (
          <Tile
            key={tile.key}
            tile={tile}
            index={i}
            isActive={active === tile.key}
            anyActive={active !== null}
            onEnter={() => {
              cancelClose();
              setActive(tile.key);
            }}
            onClick={() => openTile(tile.key)}
          >
            <AnimatePresence>
              {active === tile.key && (
                <Flyout
                  tileKey={tile.key}
                  anchor={i >= TILES.length - 1 ? "bottom" : "top"}
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                />
              )}
            </AnimatePresence>
          </Tile>
        ))}
      </div>

      <div className="relative col-span-12 hidden md:col-span-7 md:block lg:col-span-8" />
    </section>
  );
}

function Tile({
  tile,
  index,
  isActive,
  anyActive,
  onEnter,
  onClick,
  children,
}: {
  tile: (typeof TILES)[number];
  index: number;
  isActive: boolean;
  anyActive: boolean;
  onEnter: () => void;
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col">
      <button
        onMouseEnter={onEnter}
        onFocus={onEnter}
        onClick={onClick}
        data-cursor="hover"
        className={clsx(
          "group relative flex flex-1 w-full flex-col justify-center border-b border-line px-5 py-5 text-left transition-colors duration-500 md:px-7 md:py-6 lg:px-9 lg:py-7",
          isActive
            ? "bg-ink text-paper"
            : anyActive
              ? "bg-paper text-ink/55"
              : "bg-paper text-ink",
        )}
      >
        <div className="flex items-baseline gap-3 md:gap-4">
          <span className="font-bank tabnum text-[10px] uppercase tracking-[0.18em] opacity-50">
            {String(index + 1).padStart(2, "0")}
          </span>
          <motion.span
            animate={{ x: isActive ? 6 : 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="block min-w-0 font-bank text-[1.35rem] font-medium uppercase leading-[1.05] tracking-tight md:text-[1.55rem] lg:text-[1.8rem] xl:text-[2.05rem]"
          >
            {tile.name}
          </motion.span>
        </div>

        <div className="mt-2.5 flex items-baseline justify-between gap-4 pl-[calc(0.625rem+1ch)]">
          <span className="font-bank text-[10px] uppercase tracking-[0.18em] opacity-55">
            {tile.tag}
          </span>
          <motion.span
            aria-hidden
            animate={{ x: isActive ? 0 : -6, opacity: isActive ? 1 : 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-[11px] uppercase tracking-[0.18em] opacity-80"
          >
            →
          </motion.span>
        </div>
      </button>
      {children}
    </div>
  );
}

function Flyout({
  tileKey,
  anchor,
  onMouseEnter,
  onMouseLeave,
}: {
  tileKey: TileKey;
  anchor: "top" | "bottom";
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  return (
    <motion.div
      key={tileKey}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={clsx(
        "pointer-events-auto absolute left-full z-30 hidden pl-3 md:block lg:pl-5",
        anchor === "bottom" ? "bottom-0" : "top-0",
      )}
    >
      <div
        className="pointer-events-auto bg-paper/95 px-3 py-2.5 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.3)] ring-1 ring-line backdrop-blur-md lg:px-4 lg:py-3"
        data-lenis-prevent
      >
        {tileKey === "updates" ? <UpdatesFlyout /> : <ProjectsFlyout category={tileKey} />}
      </div>
    </motion.div>
  );
}

function ProjectsFlyout({ category }: { category: Category }) {
  const { list } = useEffectiveProjects();
  const items = projectsByCategoryFiltered(list, category).slice(0, 5);
  const { openProject } = useModal();

  return (
    <div className="flex items-stretch gap-3 lg:gap-4">
      {items.map((p, i) => (
        <motion.button
          key={p.slug}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.04 + i * 0.05,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          onClick={() => openProject(p.slug)}
          data-cursor="hover"
          className="group relative block shrink-0 text-left"
        >
          <motion.div
            layoutId={`project-image-${p.slug}`}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative aspect-[3/4] w-[88px] overflow-hidden bg-ink/5 lg:w-[104px]"
          >
            <Image
              src={p.image}
              alt={p.title}
              fill
              sizes="160px"
              className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.05]"
            />
          </motion.div>
          <div className="mt-2 flex items-baseline justify-between gap-2">
            <span className="truncate font-bank text-[10.5px] font-medium uppercase tracking-tight">
              {p.title}
            </span>
            <span className="tabnum text-[9px] uppercase tracking-[0.18em] text-ink/55">
              {p.year}
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

function UpdatesFlyout() {
  const { list } = useEffectiveUpdates();
  const items = list.slice(0, 3);
  const { openUpdate } = useModal();

  return (
    <ul className="flex w-[260px] flex-col lg:w-[300px]">
      {items.map((u, i) => (
        <motion.li
          key={u.slug}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            delay: 0.04 + i * 0.05,
            duration: 0.5,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <button
            onClick={() => openUpdate(u.slug)}
            data-cursor="hover"
            className="group flex w-full items-center gap-3 border-b border-line py-2 text-left transition-opacity hover:opacity-70 last:border-b-0"
          >
            <motion.div
              layoutId={`update-image-${u.slug}`}
              transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[4/3] w-12 shrink-0 overflow-hidden bg-ink/5"
            >
              {u.image ? (
                <Image
                  src={u.image}
                  alt={u.title}
                  fill
                  sizes="80px"
                  className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[8px] uppercase tracking-[0.18em] text-ink/40">
                  Text
                </div>
              )}
            </motion.div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-bank text-[11px] font-medium uppercase tracking-tight">
                {u.title}
              </h3>
              <div className="mt-0.5 flex items-center gap-2 text-[9px] uppercase tracking-[0.18em] text-ink/55">
                <span>{u.kind}</span>
                <span className="tabnum">{formatDate(u.date)}</span>
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-[0.18em] text-ink/55">→</span>
          </button>
        </motion.li>
      ))}
    </ul>
  );
}
