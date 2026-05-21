"use client";

import { SmartImage } from "./smart-image";
import { SiteFooter } from "./site-footer";
import { useEffectiveAbout } from "@/lib/effective-data";

export function AboutView() {
  const { about } = useEffectiveAbout();
  const introParas = about.intro
    .split("\n\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      <div className="h-[72px] desk:h-[120px]" aria-hidden />
      <section className="mx-auto max-w-[1100px] px-5 py-16 desk:px-8 desk:py-24">
        <h1 className="font-bank text-[48px] font-medium uppercase leading-none tracking-tight desk:text-[80px]">
          About
        </h1>

        {introParas.length > 0 && (
          <div className="mt-12 grid gap-8 desk:grid-cols-2 desk:gap-20">
            {introParas.map((para, i) => (
              <p
                key={i}
                className="text-[14px] leading-[1.8] tracking-tight text-ink/85"
              >
                {para}
              </p>
            ))}
          </div>
        )}

        <div className="relative mt-16 aspect-[16/9] w-full overflow-hidden bg-ink/[0.04] desk:mt-24">
          {about.heroImage && (
            <SmartImage
              src={about.heroImage}
              alt="About hero"
              fill
              sizes="(max-width: 1400px) 100vw, 1100px"
              className="object-cover"
            />
          )}
        </div>

        <div className="mt-20 space-y-16 desk:mt-28">
          {about.mission && (
            <AboutSection title="Mission">{about.mission}</AboutSection>
          )}

          {about.vision && (
            <AboutSection title="Vision">{about.vision}</AboutSection>
          )}

          {about.values.length > 0 && (
            <AboutSection title="Values">
              <div className="mt-6 grid gap-8 desk:grid-cols-3">
                {about.values.map(({ label, body }, i) => (
                  <div key={`${label}-${i}`}>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted">
                      {label}
                    </div>
                    <p className="mt-3 text-[13.5px] leading-[1.75] text-ink/85">
                      {body}
                    </p>
                  </div>
                ))}
              </div>
            </AboutSection>
          )}
        </div>
      </section>
      <SiteFooter />
    </>
  );
}

function AboutSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line pt-10">
      <h2 className="font-bank text-[11px] font-medium uppercase tracking-[0.22em] text-muted">
        {title}
      </h2>
      <div className="mt-6 max-w-[700px]">
        {typeof children === "string" ? (
          <p className="text-[14px] leading-[1.8] tracking-tight text-ink/85">
            {children}
          </p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
