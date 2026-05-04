"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import clsx from "clsx";
import { SmartImage } from "./smart-image";
import { ScrollFade } from "./scroll-fade";
import { type Update } from "@/lib/updates";
import { useEffectiveUpdates } from "@/lib/effective-data";

const FLOAT = { duration: 1.4, ease: [0.22, 1, 0.36, 1] as const };
const ENTRY = { duration: 1.2, ease: [0.22, 1, 0.36, 1] as const };

export function UpdatesList() {
  const { list } = useEffectiveUpdates();
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <ul className="flex flex-col gap-y-20 md:gap-y-28">
      <AnimatePresence mode="popLayout" initial={true}>
        {list.map((u) => (
          <motion.li
            key={`updates-${u.slug}`}
            layout="position"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={ENTRY}
          >
            <ScrollFade>
              <UpdateRow
                update={u}
                expanded={expanded === u.slug}
                onClick={() =>
                  setExpanded((cur) => (cur === u.slug ? null : u.slug))
                }
              />
            </ScrollFade>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

function UpdateRow({
  update,
  expanded,
  onClick,
}: {
  update: Update;
  expanded: boolean;
  onClick: () => void;
}) {
  const hasImage = !!update.image;

  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 md:px-8">
      <div className="grid grid-cols-12 items-start gap-x-6 gap-y-6 md:gap-x-8">
        {/* Header column — date, title, kind */}
        <motion.div
          layout
          transition={{ layout: FLOAT }}
          className={clsx(
            "col-span-12 row-start-2 md:row-start-1",
            hasImage
              ? expanded
                ? "md:col-span-3 md:col-start-1"
                : "md:col-span-3 md:col-start-2"
              : "md:col-span-9 md:col-start-2",
          )}
        >
          <button
            type="button"
            onClick={onClick}
            className="block w-full text-left"
            aria-expanded={expanded}
          >
            <DateBlock date={update.date} />
            <h3 className={clsx(
              "mt-4 leading-[1.2] tracking-tight",
              hasImage
                ? "text-[18px] md:text-[20px]"
                : "max-w-[24ch] text-[24px] md:text-[34px]",
            )}>
              {update.title}
            </h3>
            <div className="mt-2 flex items-center gap-3 text-[10.5px] uppercase tracking-[0.14em] text-muted">
              <span>{update.kind}</span>
              {!hasImage && (
                <>
                  <span aria-hidden>·</span>
                  <span>Text update</span>
                </>
              )}
            </div>
            {!hasImage && (
              <p className="mt-5 max-w-[58ch] text-[14px] leading-[1.55] text-muted">
                {update.excerpt}
              </p>
            )}
          </button>
        </motion.div>

        {/* Image — only when present */}
        {hasImage && (
          <motion.button
            layout
            transition={{ layout: FLOAT }}
            type="button"
            onClick={onClick}
            className={clsx(
              "group col-span-12 row-start-1 block",
              expanded
                ? "md:col-span-6 md:col-start-4"
                : "md:col-span-5 md:col-start-5",
            )}
            aria-label={`${expanded ? "Collapse" : "Expand"} ${update.title}`}
          >
            <motion.div
              layout
              transition={{ layout: FLOAT }}
              className="relative aspect-[4/3] w-full overflow-hidden bg-ink/[0.04]"
            >
              <SmartImage
                src={update.image}
                alt={update.title}
                fill
                sizes="(max-width: 768px) 100vw, 600px"
                className="object-cover"
              />
            </motion.div>
          </motion.button>
        )}

        {/* Excerpt + body — opacity-only when has image, height-only when text-only */}
        {hasImage ? (
          <motion.div
            layout
            initial={false}
            animate={{ opacity: expanded ? 1 : 0 }}
            transition={{ ...FLOAT, layout: FLOAT }}
            aria-hidden={!expanded}
            className={clsx(
              "col-span-12 row-start-3 md:col-span-3 md:col-start-10 md:row-start-1",
              !expanded && "pointer-events-none select-none",
            )}
          >
            <p className="text-[13.5px] leading-[1.65]">{update.excerpt}</p>
            <div className="mt-5 space-y-3 text-[13px] leading-[1.65] text-ink/85">
              {update.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={false}
            animate={{
              height: expanded ? "auto" : 0,
              opacity: expanded ? 1 : 0,
            }}
            transition={FLOAT}
            aria-hidden={!expanded}
            style={{ overflow: "hidden" }}
            className="col-span-12 row-start-3 md:col-span-9 md:col-start-2 md:row-start-2"
          >
            <div className="mt-3 max-w-prose space-y-4 text-[14px] leading-[1.65] md:text-[15px]">
              {update.body.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function DateBlock({ date }: { date: string }) {
  const d = new Date(date);
  const long = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const pad = (n: number) => String(n).padStart(2, "0");
  const numeric = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${String(
    d.getFullYear(),
  ).slice(2)}`;
  return (
    <div className="text-[10.5px] uppercase tracking-[0.18em] tabnum text-muted">
      <span className="hidden md:inline">{long}</span>
      <span className="md:hidden">{numeric}</span>
    </div>
  );
}
