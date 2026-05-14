"use client";

import { SiteFooter } from "./site-footer";

export function AboutView() {
  return (
    <>
      <div className="h-[72px] desk:h-[120px]" aria-hidden />
      <section className="mx-auto max-w-[1100px] px-5 py-16 desk:px-8 desk:py-24">
        <h1 className="font-bank text-[48px] font-medium uppercase leading-none tracking-tight desk:text-[80px]">
          About
        </h1>

        <div className="mt-12 grid gap-8 desk:grid-cols-2 desk:gap-20">
          <p className="text-[14px] leading-[1.8] tracking-tight text-ink/85">
            Arengcon is a full-service design and construction firm founded in Abuja in 2013.
            We operate at the intersection of architecture, interiors, landscape, and construction —
            delivering projects that are formally rigorous and deeply responsive to their context.
          </p>
          <p className="text-[14px] leading-[1.8] tracking-tight text-ink/85">
            Our practice is built on the belief that great environments require the sustained
            attention of a single committed team from concept through completion. We do not hand
            projects off — we see them through.
          </p>
        </div>

        <div className="mt-16 aspect-[16/9] w-full bg-ink/[0.04] desk:mt-24" />

        <div className="mt-20 space-y-16 desk:mt-28">
          <AboutSection title="Mission">
            To advance the built environment in West Africa through the disciplined practice of
            architecture and construction — creating places that endure in both form and purpose,
            and that genuinely serve the people who inhabit them.
          </AboutSection>

          <AboutSection title="Vision">
            A continent whose cities are shaped by intention, where every building is a considered
            act of civic investment, and where local expertise leads its own transformation.
          </AboutSection>

          <AboutSection title="Values">
            <div className="mt-6 grid gap-8 desk:grid-cols-3">
              {[
                {
                  label: "Integrity",
                  body: "We do what we say, and we say what we mean. Every promise is a contract.",
                },
                {
                  label: "Craft",
                  body: "We hold the quality of execution to the same standard as the quality of ideas.",
                },
                {
                  label: "Commitment",
                  body: "We are fully present on every project, at every scale, at every stage.",
                },
              ].map(({ label, body }) => (
                <div key={label}>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted">{label}</div>
                  <p className="mt-3 text-[13.5px] leading-[1.75] text-ink/85">{body}</p>
                </div>
              ))}
            </div>
          </AboutSection>
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
          <p className="text-[14px] leading-[1.8] tracking-tight text-ink/85">{children}</p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
