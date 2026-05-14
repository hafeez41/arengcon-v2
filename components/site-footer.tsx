"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import clsx from "clsx";
import { useEffectiveContact } from "@/lib/effective-data";
import { SOCIAL_PLATFORMS, type SocialKey } from "@/lib/admin-store";
import { SIZE } from "@/lib/motion";

export function SiteFooter() {
  const { contact } = useEffectiveContact();
  const activeSocial = SOCIAL_PLATFORMS.filter(
    (p) => !!contact.social[p.key as SocialKey],
  );
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    const handler = () => setContactOpen(true);
    window.addEventListener("arengcon:open-contact", handler);
    return () => window.removeEventListener("arengcon:open-contact", handler);
  }, []);

  return (
    <footer id="site-footer" className="border-t border-line">
      <div className="mx-auto w-full max-w-[1100px] px-5 py-12 md:px-8 md:py-16">
        <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-3 sm:gap-x-10 sm:gap-y-4">
          <Section label="Contact" forceOpen={contactOpen}>
            <ul className="space-y-1.5">
              {contact.emails.map((e) => (
                <li key={e}>
                  <a
                    href={`mailto:${e}`}
                    className="text-[12.5px] tracking-tight text-ink hover:underline"
                  >
                    {e}
                  </a>
                </li>
              ))}
              {contact.phones.length > 0 && (
                <li className="pt-2">
                  <div className="text-[10px] uppercase tracking-[0.14em] text-muted">
                    Phone
                  </div>
                  <ul className="mt-1.5 space-y-1">
                    {contact.phones.map((p) => (
                      <li key={p}>
                        <a
                          href={`tel:${p.replace(/\s+/g, "")}`}
                          className="text-[12.5px] tabnum tracking-tight text-ink hover:underline"
                        >
                          {p}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              )}
            </ul>
          </Section>

          <Section label="Office">
            <div className="space-y-3 text-[12.5px] tracking-tight">
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted">
                  Location
                </div>
                <div className="mt-1.5">{contact.office.location}</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.14em] text-muted">
                  Hours
                </div>
                <div className="mt-1.5">{contact.office.hours}</div>
              </div>
            </div>
          </Section>

          <Section label="Social" disabled={activeSocial.length === 0}>
            {activeSocial.length === 0 ? (
              <div className="text-[12px] text-muted">No social links yet.</div>
            ) : (
              <ul className="flex flex-wrap items-center gap-2">
                {activeSocial.map((p) => (
                  <li key={p.key}>
                    <a
                      href={contact.social[p.key as SocialKey]}
                      target="_blank"
                      rel="noreferrer noopener"
                      aria-label={p.label}
                      className="grid h-9 w-9 place-items-center rounded-full bg-ink/[0.06] text-ink transition-colors duration-200 hover:bg-ink hover:text-paper"
                    >
                      <SocialGlyph platform={p.key as SocialKey} />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </Section>

        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-[10.5px] uppercase tracking-[0.14em] text-muted md:mt-16 md:flex-row md:items-center md:pt-8">
          <div>© {new Date().getFullYear()} Arengcon</div>
          <div className="tracking-[0.14em]">An Abuja studio · Established 2013</div>
        </div>
      </div>
    </footer>
  );
}

function Section({
  label,
  children,
  disabled = false,
  forceOpen = false,
}: {
  label: string;
  children: ReactNode;
  disabled?: boolean;
  forceOpen?: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (forceOpen) setOpen(true);
  }, [forceOpen]);

  return (
    <div className="col-span-1 border-b border-line/0 md:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className={clsx(
          "group flex w-full items-center justify-between gap-3 py-3 text-left transition-colors duration-200",
          "text-[11px] uppercase tracking-[0.18em]",
          disabled
            ? "cursor-default text-muted/50"
            : open
              ? "text-ink"
              : "text-muted hover:text-ink",
        )}
        aria-expanded={open}
      >
        <span>{label}</span>
        <motion.span
          aria-hidden
          animate={{ rotate: open ? 45 : 0 }}
          transition={SIZE}
          className="text-[16px] leading-none"
        >
          +
        </motion.span>
      </button>

      <div
        aria-hidden={!open}
        className={clsx(
          "grid transition-[grid-template-rows,opacity] duration-[780ms] ease-[cubic-bezier(0.45,0,0.55,1)]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pb-5 pt-2">{children}</div>
        </div>
      </div>
    </div>
  );
}

function SocialGlyph({ platform }: { platform: SocialKey }) {
  const common = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24",
    fill: "currentColor" as const,
  };
  if (platform === "instagram") {
    return (
      <svg {...common}>
        <path d="M12 2.2c2.7 0 3 .01 4.05.06 .98.04 1.5.21 1.86.34.47.18.8.4 1.15.75.35.35.57.68.75 1.15.13.36.3.88.34 1.86.05 1.06.06 1.37.06 4.05s-.01 3-.06 4.05c-.04.98-.21 1.5-.34 1.86-.18.47-.4.8-.75 1.15-.35.35-.68.57-1.15.75-.36.13-.88.3-1.86.34-1.06.05-1.37.06-4.05.06s-3-.01-4.05-.06c-.98-.04-1.5-.21-1.86-.34-.47-.18-.8-.4-1.15-.75-.35-.35-.57-.68-.75-1.15-.13-.36-.3-.88-.34-1.86C2.21 15 2.2 14.7 2.2 12s.01-3 .06-4.05c.04-.98.21-1.5.34-1.86.18-.47.4-.8.75-1.15.35-.35.68-.57 1.15-.75.36-.13.88-.3 1.86-.34C9 2.21 9.3 2.2 12 2.2zM12 0C9.26 0 8.93.01 7.85.06 6.78.11 6.04.28 5.4.53c-.66.26-1.22.6-1.78 1.16C3.06 2.25 2.72 2.81 2.46 3.47 2.21 4.11 2.04 4.85 2 5.92.94 7 .92 7.34.92 10.08v3.84c0 2.74.01 3.07.06 4.16.05 1.06.22 1.8.47 2.44.26.66.6 1.22 1.16 1.78.56.56 1.12.9 1.78 1.16.64.25 1.38.42 2.44.47 1.09.05 1.42.06 4.16.06s3.07-.01 4.16-.06c1.06-.05 1.8-.22 2.44-.47.66-.26 1.22-.6 1.78-1.16.56-.56.9-1.12 1.16-1.78.25-.64.42-1.38.47-2.44.05-1.09.06-1.42.06-4.16v-3.84c0-2.74-.01-3.07-.06-4.16-.05-1.06-.22-1.8-.47-2.44-.26-.66-.6-1.22-1.16-1.78C20.75 1.06 20.19.72 19.53.46 18.89.21 18.15.04 17.08-.01 15.99-.04 15.66 0 12 0z" />
        <path d="M12 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8z" />
        <circle cx="18.41" cy="5.59" r="1.44" />
      </svg>
    );
  }
  if (platform === "x") {
    return (
      <svg {...common}>
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  if (platform === "linkedin") {
    return (
      <svg {...common}>
        <path d="M19 0H5C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5zM7.27 18.27H4.5V9.73h2.77v8.54zM5.88 8.45c-.89 0-1.6-.72-1.6-1.6s.72-1.6 1.6-1.6c.89 0 1.6.72 1.6 1.6s-.71 1.6-1.6 1.6zm13.27 9.82h-2.77V14c0-.95-.02-2.18-1.33-2.18-1.33 0-1.53 1.04-1.53 2.11v4.34h-2.77V9.73h2.66v1.16h.04c.37-.7 1.27-1.43 2.62-1.43 2.81 0 3.33 1.85 3.33 4.25v4.56z" />
      </svg>
    );
  }
  if (platform === "facebook") {
    return (
      <svg {...common}>
        <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07c0 6.02 4.39 11 10.13 11.93v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.69 4.53-4.69 1.31 0 2.69.23 2.69.23v2.96H15.83c-1.49 0-1.96.93-1.96 1.89v2.27h3.33l-.53 3.49h-2.8V24C19.61 23.07 24 18.09 24 12.07z" />
      </svg>
    );
  }
  if (platform === "vimeo") {
    return (
      <svg {...common}>
        <path d="M23.98 6.39c-.1 2.34-1.74 5.55-4.91 9.62-3.28 4.26-6.05 6.39-8.31 6.39-1.4 0-2.59-1.3-3.55-3.88L5.3 11.49c-.71-2.59-1.46-3.88-2.27-3.88-.18 0-.79.37-1.85 1.1L0 7.29c1.16-1.02 2.31-2.04 3.43-3.07 1.55-1.34 2.71-2.05 3.49-2.12 1.83-.18 2.96 1.07 3.39 3.75.46 2.89.79 4.69.97 5.4.55 2.46 1.16 3.69 1.83 3.69.52 0 1.31-.83 2.36-2.49 1.05-1.66 1.61-2.92 1.69-3.79.15-1.42-.41-2.13-1.69-2.13-.6 0-1.21.14-1.85.41 1.23-4.04 3.59-6.01 7.06-5.89 2.58.07 3.79 1.74 3.65 5z" />
      </svg>
    );
  }
  if (platform === "youtube") {
    return (
      <svg {...common}>
        <path d="M23.5 6.2a3.02 3.02 0 0 0-2.13-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.37.56A3.02 3.02 0 0 0 .5 6.2C0 8.07 0 12 0 12s0 3.93.5 5.8a3.02 3.02 0 0 0 2.13 2.14c1.87.56 9.37.56 9.37.56s7.5 0 9.37-.56a3.02 3.02 0 0 0 2.13-2.14c.5-1.87.5-5.8.5-5.8s0-3.93-.5-5.8zM9.6 15.6V8.4l6.24 3.6-6.24 3.6z" />
      </svg>
    );
  }
  if (platform === "tiktok") {
    return (
      <svg {...common}>
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.7 9.7c0 .1.01.3.01.5 0 4.7-3.5 10.1-10.1 10.1A10 10 0 0 1 2.4 18.7c.3 0 .5.1.7.1 1.6 0 3.1-.5 4.4-1.4-1.5 0-2.8-1-3.3-2.4.2 0 .5.1.7.1.3 0 .6 0 .9-.1-1.6-.3-2.8-1.7-2.8-3.4 0 0 0-.1.01-.1.5.3 1 .4 1.6.5C3.7 11.5 3 10.4 3 9.1c0-.7.2-1.3.5-1.8 1.7 2.1 4.3 3.5 7.2 3.6 0-.3-.1-.5-.1-.8 0-2 1.6-3.5 3.5-3.5 1 0 1.9.4 2.5 1.1.8-.2 1.5-.4 2.2-.8-.3.8-.8 1.5-1.5 1.9.7-.1 1.4-.3 2-.5-.5.7-1.1 1.3-1.6 1.7z" />
    </svg>
  );
}
