"use client";

import { SmartImage } from "./smart-image";
import { SiteFooter } from "./site-footer";
import { useEffectivePeople } from "@/lib/effective-data";
import type { AdminPerson } from "@/lib/admin-store";

export function PeopleView() {
  const { list } = useEffectivePeople();

  return (
    <>
      <div className="h-[72px] desk:h-[120px]" aria-hidden />
      <section className="mx-auto max-w-[1100px] px-5 py-16 desk:px-8 desk:py-24">
        <h1 className="font-bank text-[48px] font-medium uppercase leading-none tracking-tight desk:text-[80px]">
          People
        </h1>

        <div className="mt-16 divide-y divide-line">
          {list.map((person) => (
            <TeamMember key={person.id} person={person} />
          ))}
        </div>
      </section>
      <SiteFooter />
    </>
  );
}

function TeamMember({ person }: { person: AdminPerson }) {
  const paras = person.bio
    .split("\n\n")
    .map((s) => s.trim())
    .filter(Boolean);
  return (
    <div className="flex flex-col gap-8 py-14 desk:flex-row desk:gap-16">
      <div className="shrink-0">
        <div className="relative h-36 w-36 overflow-hidden rounded-full bg-ink/[0.06] desk:h-48 desk:w-48">
          {person.photo && (
            <SmartImage
              src={person.photo}
              alt={person.name}
              fill
              sizes="192px"
              className="object-cover"
            />
          )}
        </div>
      </div>
      <div className="max-w-[560px]">
        <h2 className="font-bank text-[22px] font-medium uppercase leading-none tracking-tight desk:text-[28px]">
          {person.name}
        </h2>
        {person.role && (
          <div className="mt-2 text-[10.5px] uppercase tracking-[0.18em] text-muted">
            {person.role}
          </div>
        )}
        {paras.length > 0 && (
          <div className="mt-6 space-y-3">
            {paras.map((para, i) => (
              <p
                key={i}
                className="text-[13.5px] leading-[1.75] tracking-tight text-ink/85"
              >
                {para}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
