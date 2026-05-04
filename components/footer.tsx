"use client";

import { useEffect, useState } from "react";
import { useEffectiveContact } from "@/lib/effective-data";

const PLACEHOLDER_OFFICES = [
  {
    city: "New York",
    address: "115 Front Street, Studio 4\nBrooklyn, NY 11201",
    phone: "+1 (212) 555-0148",
    email: "ny@arengcon.com",
  },
  {
    city: "Toronto",
    address: "210 Adelaide Street W, 12th Fl\nToronto, ON M5H 1W7",
    phone: "+1 (416) 555-0220",
    email: "to@arengcon.com",
  },
  {
    city: "London",
    address: "44 Charlotte Road, Shoreditch\nLondon EC2A 3PD",
    phone: "+44 20 7946 0033",
    email: "ldn@arengcon.com",
  },
  {
    city: "Copenhagen",
    address: "Sølvgade 14\n1307 København K",
    phone: "+45 33 13 99 88",
    email: "cph@arengcon.com",
  },
];

const CONTACT_LINES = [
  { label: "New business", email: "newbiz@arengcon.com" },
  { label: "Press", email: "press@arengcon.com" },
  { label: "Lectures", email: "lectures@arengcon.com" },
  { label: "Exhibitions", email: "exhibitions@arengcon.com" },
];

const SOCIAL = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "X", href: "https://x.com" },
  { label: "Vimeo", href: "https://vimeo.com" },
  { label: "Facebook", href: "https://facebook.com" },
];

const LEGAL = [
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Anti-Slavery Statement", href: "/legal/anti-slavery" },
  { label: "Whistleblower Policy", href: "/legal/whistleblower" },
  { label: "Sustainability Report", href: "/sustainability/report" },
];

export function Footer() {
  const { contact } = useEffectiveContact();
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const offices =
    contact && contact.offices.length > 0
      ? contact.offices.map((o) => ({
          city: o.city,
          address: o.address,
          phone: o.phone,
          email: o.email,
        }))
      : PLACEHOLDER_OFFICES;

  return (
    <footer className="border-t border-line bg-paper">
      <div className="mx-auto w-full max-w-[1600px] px-5 py-16 md:px-8 md:py-20">
        <div className="grid grid-cols-12 gap-x-6 gap-y-12">
          <div className="col-span-12 md:col-span-3">
            <div className="text-[20px] tracking-tight">Arengcon</div>
            <p className="mt-4 max-w-prose text-[14px] leading-[1.55] text-muted">
              An architecture, interior design, and construction practice.
              Working from feasibility through final inspection across civic,
              infrastructural, and residential scales.
            </p>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="eyebrow">Contact</div>
            <ul className="mt-3 space-y-1.5">
              {CONTACT_LINES.map((c) => (
                <li key={c.email} className="text-[14px] tracking-tight">
                  <span className="text-muted">{c.label}</span>{" "}
                  <a
                    href={`mailto:${c.email}`}
                    className="editorial-link"
                  >
                    {c.email}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="eyebrow">Social</div>
            <ul className="mt-3 grid grid-cols-2 gap-y-1.5 md:grid-cols-1">
              {SOCIAL.map((s) => (
                <li key={s.label} className="text-[14px] tracking-tight">
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="editorial-link"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-12 md:col-span-3">
            <div className="eyebrow">Legal</div>
            <ul className="mt-3 space-y-1.5">
              {LEGAL.map((l) => (
                <li key={l.label} className="text-[14px] tracking-tight">
                  <a href={l.href} className="editorial-link">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-12 mt-4 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-line pt-12 md:grid-cols-4">
            {offices.map((o) => (
              <div key={o.city}>
                <div className="text-[13px] font-medium tracking-tight">
                  {o.city}
                </div>
                <div className="mt-2 whitespace-pre-line text-[13px] leading-[1.5] text-muted">
                  {o.address}
                </div>
                {o.phone && (
                  <div className="mt-2 text-[13px] tabnum text-muted">
                    {o.phone}
                  </div>
                )}
                {o.email && (
                  <a
                    href={`mailto:${o.email}`}
                    className="editorial-link mt-1 inline-block text-[13px]"
                  >
                    {o.email}
                  </a>
                )}
              </div>
            ))}
          </div>

          <div className="col-span-12 mt-4 flex flex-col items-start justify-between gap-3 border-t border-line pt-6 text-[12px] text-muted md:flex-row md:items-center">
            <div>© {year ?? ""} Arengcon. All rights reserved.</div>
            <div className="tracking-tight">
              Established 2008 — A practice in continuous studio.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
