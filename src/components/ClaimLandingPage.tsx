import Link from "next/link";

export interface LandingSign {
  text: string;
}

export interface LandingStep {
  n: string;
  title: string;
  desc: string;
}

export interface LandingFaq {
  q: string;
  a: string;
}

export interface LandingStat {
  value: string;
  label: string;
}

export interface ClaimLandingPageProps {
  badge: string;
  h1: string;
  answer: string;
  signs: {
    heading: string;
    items: string[];
  };
  steps: {
    heading: string;
    items: LandingStep[];
  };
  stats: LandingStat[];
  faqs: LandingFaq[];
  cta: {
    heading: string;
    sub: string;
  };
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 shrink-0 text-navy">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

export function ClaimLandingPage({
  badge,
  h1,
  answer,
  signs,
  steps,
  stats,
  faqs,
  cta,
}: ClaimLandingPageProps) {
  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="border-b border-navy/10 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-20">
          <div className="mb-5 inline-flex items-center gap-2 border border-rust/30 bg-rust-faint px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-rust">
            {badge}
          </div>
          <h1 className="font-display text-balance text-4xl font-medium leading-[1.1] tracking-tight text-ink md:text-5xl">
            {h1}
          </h1>
          <div className="mt-6 rounded-lg border border-navy/10 bg-paper p-5">
            <p className="text-base leading-relaxed text-ink-muted">{answer}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3.5 text-base font-semibold text-white shadow-lift transition hover:bg-navy-800"
            >
              Check my claim free
              <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 opacity-90">
                <path d="M3 8a.5.5 0 01.5-.5h7.793L8.146 4.354a.5.5 0 11.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L11.293 8.5H3.5A.5.5 0 013 8z" />
              </svg>
            </Link>
          </div>
          <div className="mt-5 flex items-start gap-2.5 text-sm text-ink-muted">
            <span className="mt-0.5 text-navy">
              <IconShield />
            </span>
            <span>Free preview · No card until you see results · Full report $149 flat · 30-day refund</span>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────── */}
      <section className="border-b border-navy/10 bg-navy">
        <div className="mx-auto max-w-3xl px-4 py-8 md:px-6">
          <div className="grid grid-cols-3 gap-6 text-center">
            {stats.map((s, i) => (
              <div key={i}>
                <p className="font-display text-2xl font-medium text-white md:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-white/50">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SIGNS ────────────────────────────────────────────────── */}
      <section className="border-b border-navy/10 bg-paper">
        <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
          <h2 className="font-display text-2xl font-medium tracking-tight text-ink md:text-3xl">
            {signs.heading}
          </h2>
          <ul className="mt-6 space-y-3">
            {signs.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1">
                  <IconCheck />
                </span>
                <span className="text-base text-ink-muted">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── STEPS ────────────────────────────────────────────────── */}
      <section className="border-b border-navy/10 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
          <h2 className="font-display text-2xl font-medium tracking-tight text-ink md:text-3xl">
            {steps.heading}
          </h2>
          <ol className="mt-8 space-y-6">
            {steps.items.map((step) => (
              <li key={step.n} className="flex gap-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-navy/15 bg-paper text-sm font-bold text-navy">
                  {step.n}
                </div>
                <div className="pt-1.5">
                  <h3 className="text-base font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="border-b border-navy/10 bg-paper">
        <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
          <h2 className="font-display text-2xl font-medium tracking-tight text-ink md:text-3xl">
            Frequently asked questions
          </h2>
          <dl className="mt-8 divide-y divide-navy/10">
            {faqs.map((faq, i) => (
              <div key={i} className="py-5">
                <dt className="text-base font-semibold text-ink">{faq.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink-muted">{faq.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center md:px-6 md:py-20">
          <h2 className="font-display text-3xl font-medium tracking-tight text-ink md:text-4xl">
            {cta.heading}
          </h2>
          <p className="mt-4 text-base text-ink-muted">{cta.sub}</p>
          <Link
            href="/analyze"
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-navy px-8 py-4 text-base font-semibold text-white shadow-lift transition hover:bg-navy-800"
          >
            Run my free claim check
            <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 opacity-90">
              <path d="M3 8a.5.5 0 01.5-.5h7.793L8.146 4.354a.5.5 0 11.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L11.293 8.5H3.5A.5.5 0 013 8z" />
            </svg>
          </Link>
          <p className="mt-4 text-xs text-ink-faint">
            Insurance appeals have deadlines — don't wait.
          </p>
        </div>
      </section>
    </div>
  );
}
