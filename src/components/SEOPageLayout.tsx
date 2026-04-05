import Link from "next/link";

interface SEOPageLayoutProps {
  badge: string;
  h1: string;
  intro: string;
  sections: {
    heading: string;
    content: React.ReactNode;
  }[];
  claimType: "Home" | "Auto" | "Health";
  ctaHeading: string;
  ctaBody: string;
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 shrink-0">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 opacity-90">
      <path d="M3 8a.5.5 0 01.5-.5h7.793L8.146 4.354a.5.5 0 11.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L11.293 8.5H3.5A.5.5 0 013 8z" />
    </svg>
  );
}

export function SEOPageLayout({
  badge,
  h1,
  intro,
  sections,
  ctaHeading,
  ctaBody,
}: SEOPageLayoutProps) {
  return (
    <div>
      {/* Hero */}
      <section className="border-b border-navy/10 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
          <div className="mb-5 inline-flex items-center gap-2 border border-rust/30 bg-rust-faint px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-rust">
            {badge}
          </div>
          <h1 className="font-display text-3xl font-medium leading-[1.15] tracking-tight text-ink md:text-4xl lg:text-[2.6rem]">
            {h1}
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-ink-muted max-w-2xl">
            {intro}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3.5 text-base font-semibold text-white shadow-lift transition hover:bg-navy-800"
            >
              Check my claim — free
              <IconArrow />
            </Link>
          </div>
          <p className="mt-3 text-sm text-ink-faint">Free preview · No card required · 90 seconds</p>
        </div>
      </section>

      {/* Content */}
      <article className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-16">
        <div className="prose-claimgap space-y-14">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2 className="font-display text-2xl font-medium tracking-tight text-ink md:text-3xl">
                {s.heading}
              </h2>
              <div className="mt-4 text-base leading-relaxed text-ink-muted">
                {s.content}
              </div>
            </section>
          ))}
        </div>
      </article>

      {/* Mid CTA */}
      <section className="border-t border-b border-navy/10 bg-paper">
        <div className="mx-auto max-w-3xl px-4 py-14 md:px-6">
          <h2 className="font-display text-2xl font-medium tracking-tight text-ink md:text-3xl">
            {ctaHeading}
          </h2>
          <p className="mt-4 text-base text-ink-muted max-w-xl">{ctaBody}</p>
          <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 rounded-lg bg-rust px-6 py-3.5 text-base font-semibold text-white transition hover:opacity-90"
            >
              Check my claim — free preview
              <IconArrow />
            </Link>
            <span className="text-sm text-ink-faint">$149 for full report · 30-day refund guarantee</span>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="mx-auto max-w-3xl px-4 py-14 md:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-faint">What&apos;s included</p>
        <h2 className="mt-3 font-display text-2xl font-medium tracking-tight text-ink">
          Your full dispute package — $149
        </h2>
        <ul className="mt-6 space-y-3">
          {[
            "Clause-by-clause gap analysis — policy language vs. what was paid",
            "Dollar breakdown showing exactly what your policy entitles you to",
            "Recovery Score (1–10) with reasoning",
            "Professional counter-offer letter — ready to copy and send",
            "21-Day Action Plan if the insurer ignores your appeal",
            "State insurance commissioner complaint template",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 text-sm text-ink-muted">
              <span className="mt-0.5 text-teal-700">
                <IconCheck />
              </span>
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8 rounded-lg border border-navy/10 bg-white p-5">
          <p className="text-sm font-semibold text-ink">Free preview before you pay</p>
          <p className="mt-1 text-sm text-ink-muted">
            Upload your documents and see your gap estimate for free. Only pay the $149 if you want the full dispute package — with a 30-day refund if no material underpayment is found.
          </p>
          <Link
            href="/analyze"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-navy px-5 py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
          >
            Start free check
            <IconArrow />
          </Link>
        </div>
        <p className="mt-8 text-xs text-ink-faint leading-relaxed">
          <strong>Legal notice:</strong> ClaimGap is an informational tool and does not constitute legal advice, insurance advice, or adjuster services. Recovery is not guaranteed. Consult a licensed attorney before taking legal action.
        </p>
      </section>
    </div>
  );
}
