import Link from "next/link";
import type { Metadata } from "next";
import { getPublicStats } from "@/lib/stats";

export const metadata: Metadata = {
  title: "ClaimGap — Is Your Insurance Claim Underpaid?",
  description:
    "Find out if your insurance company underpaid your home, auto, or health claim. AI-powered gap analysis compares your policy against their offer — clause by clause. Free preview, $149 for the full dispute package.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
    title: "ClaimGap — Is Your Insurance Claim Underpaid?",
    description:
      "Most insurers' first offers are too low. Upload your policy and settlement letter — ClaimGap's AI finds the gap in 90 seconds and writes your dispute letter.",
  },
};

/* ── Icons ──────────────────────────────────────────────────────── */

function IconUpload() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconDollar() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-6 w-6">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
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

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* ── Demo card data ────────────────────────────────────────────── */

const DEMO_ISSUES = [
  { label: "Depreciation miscalculated", amount: "$1,200" },
  { label: "Repair cost underestimated", amount: "$1,800" },
  { label: "Policy clause not applied", amount: "$700" },
];

const REPORT_SECTIONS = [
  { n: "01", label: "Gap Analysis", desc: "Exact coverage language versus what was paid — clause by clause." },
  { n: "02", label: "Dollar Breakdown", desc: "What the policy entitles you to, with specific dollar ranges." },
  { n: "03", label: "Recovery Score", desc: "1–10 likelihood of getting more, with detailed reasoning." },
  { n: "04", label: "Counter-Offer Letter", desc: "Professional draft ready to copy-paste and send today." },
  { n: "05", label: "21-Day Action Plan", desc: "Day 7 / 14 / 21 steps if the insurer ignores your appeal." },
  { n: "06", label: "Commissioner Complaint", desc: "Pre-filled formal complaint to your state regulator." },
];

const PAIN_POINTS = [
  "Insurers don't show you the coverage you're entitled to — they hope you won't look",
  "First settlement offers are routinely 20–40% below what policies actually cover",
  "Dispute deadlines are real. Every week you wait narrows your options.",
];

/* ── Page ──────────────────────────────────────────────────────── */

export default async function HomePage() {
  const { claimsAnalyzed, averageGapDisplay } = await getPublicStats();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://claimgap.app/#organization",
        name: "ClaimGap",
        url: "https://claimgap.app",
        description:
          "AI-powered insurance claim gap analysis. We compare your policy against the insurer's offer, identify underpayment, and generate a professional dispute letter.",
        contactPoint: {
          "@type": "ContactPoint",
          email: "info@globaldeal.app",
          contactType: "customer support",
          areaServed: "US",
          availableLanguage: "English",
        },
      },
      {
        "@type": "WebApplication",
        "@id": "https://claimgap.app/#webapp",
        name: "ClaimGap",
        url: "https://claimgap.app",
        applicationCategory: "FinanceApplication",
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript",
        description:
          "Upload your insurance policy and settlement letter to get an AI-powered gap analysis, dollar breakdown, recovery score, and ready-to-send dispute letter.",
        offers: {
          "@type": "Offer",
          price: "149.00",
          priceCurrency: "USD",
          description: "Full insurance claim gap analysis report — one-time payment",
          refundType: "FullRefund",
          refundPolicies: "30-day satisfaction guarantee if no material gap is found",
        },
        featureList: [
          "Insurance policy vs. settlement comparison",
          "Clause-by-clause gap analysis",
          "Dollar breakdown of underpayment",
          "Recovery score (1–10)",
          "Professional counter-offer letter",
          "21-Day dispute escalation plan",
          "State insurance commissioner complaint template",
        ],
        screenshot: "https://claimgap.app/og-image.png",
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "How do I know if my insurance claim was underpaid?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Compare what your policy promises against what the insurer offered. Look for depreciation errors, excluded line items, and coverage clauses the adjuster ignored. ClaimGap does this automatically — upload your policy and settlement letter and we flag every discrepancy in under 90 seconds.",
            },
          },
          {
            "@type": "Question",
            name: "What types of insurance claims can I check?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "ClaimGap covers home (property damage, wind, water, fire), auto (total loss, collision, comprehensive), and health (denials, underpayments, EOB disputes) insurance claims across all 50 U.S. states.",
            },
          },
          {
            "@type": "Question",
            name: "How does the AI gap analysis work?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Our AI reads your insurance policy and the insurer's settlement or denial letter, compares them clause by clause, identifies coverage language the insurer misapplied, calculates the dollar difference, and generates a professional dispute letter with your specific policy citations.",
            },
          },
          {
            "@type": "Question",
            name: "How much does ClaimGap cost?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The preview is completely free — you see the gap estimate before paying. The full report costs $149 one-time and includes the dispute letter, dollar breakdown, 21-day escalation plan, and state commissioner complaint template. 30-day refund if no material gap is found.",
            },
          },
          {
            "@type": "Question",
            name: "Is ClaimGap legal advice?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "No. ClaimGap provides informational analysis only — it is not legal advice and does not constitute adjuster or insurance services. The analysis helps you understand your policy and build your own case. For legal action, consult a licensed attorney.",
            },
          },
          {
            "@type": "Question",
            name: "How long does an insurance claim dispute take?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Your ClaimGap analysis is ready in about 90 seconds. Most state insurance regulators require insurers to acknowledge disputes within 10–15 days and resolve them within 30–45 days. Our 21-Day Action Plan guides you through each follow-up step.",
            },
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-navy/10 bg-white">
        <div className="relative mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20 lg:py-24">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 lg:items-start">
            <div className="lg:col-span-7">
              <div className="mb-6 inline-flex items-center gap-2 border border-rust/30 bg-rust-faint px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-rust">
                Most first offers are too low
              </div>

              <h1 className="font-display text-balance text-4xl font-medium leading-[1.1] tracking-tight text-ink md:text-5xl lg:text-[3.25rem]">
                Your insurance claim{" "}
                <span className="text-rust">may be underpaid</span>
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-ink-muted">
                Upload your policy and settlement letter — our AI compares them clause by clause and shows you exactly what the insurer actually owes you. Free preview in 90 seconds.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link
                  href="/analyze"
                  className="inline-flex items-center gap-2 rounded-lg bg-navy px-6 py-3.5 text-base font-semibold text-white shadow-lift transition hover:bg-navy-800"
                >
                  Check my claim — free
                  <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 opacity-90">
                    <path d="M3 8a.5.5 0 01.5-.5h7.793L8.146 4.354a.5.5 0 11.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L11.293 8.5H3.5A.5.5 0 013 8z" />
                  </svg>
                </Link>
                <a
                  href="#how"
                  className="inline-flex items-center rounded-lg border border-navy/20 bg-white px-6 py-3.5 text-base font-semibold text-navy transition hover:border-navy/35"
                >
                  How it works
                </a>
                <Link
                  href="/access"
                  className="inline-flex items-center rounded-lg border border-navy/15 bg-white/60 px-6 py-3.5 text-base font-semibold text-navy/70 transition hover:border-navy/30 hover:text-navy"
                >
                  Already have a report?
                </Link>
              </div>

              <div className="mt-7 flex items-start gap-3 text-sm text-ink-muted">
                <span className="mt-0.5 text-navy">
                  <IconShield />
                </span>
                <span>
                  Free preview · No card until you see results · Full report $149 flat · 30-day refund
                </span>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-navy/10 pt-10 sm:max-w-lg">
                <div>
                  <p className="font-display text-3xl font-medium tabular-nums text-navy">
                    {claimsAnalyzed.toLocaleString()}+
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-ink-faint">
                    Claims reviewed
                  </p>
                </div>
                <div>
                  <p className="font-display text-3xl font-medium tabular-nums text-rust">
                    {averageGapDisplay}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-ink-faint">
                    Avg. gap found
                  </p>
                </div>
                <div>
                  <p className="font-display text-3xl font-medium tabular-nums text-navy">~2m</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-[0.12em] text-ink-faint">
                    To first answer
                  </p>
                </div>
              </div>
            </div>

            {/* Demo card */}
            <div className="mt-14 lg:col-span-5 lg:mt-4">
              <div className="relative rounded-lg border-2 border-navy/15 bg-white p-6 shadow-card">
                <div className="absolute -left-px top-8 bottom-8 w-1 rounded-full bg-rust/80" aria-hidden />

                <div className="flex items-start justify-between gap-3 pl-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded border border-navy/15 bg-paper text-xs font-bold text-navy">
                      MR
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink">M. Rivera, Texas</p>
                      <p className="text-xs text-ink-faint">Home · Wind Damage</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded border border-rust/30 bg-rust-faint px-2.5 py-1 text-xs font-semibold text-rust">
                    Underpaid
                  </span>
                </div>

                <div className="mt-5 pl-3 text-xs font-bold uppercase tracking-wider text-ink-faint mb-2">
                  Settlement comparison
                </div>

                <div className="grid grid-cols-2 gap-3 pl-3">
                  <div className="rounded border border-navy/10 bg-paper/80 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                      They offered
                    </p>
                    <p className="mt-1 font-display text-2xl font-medium text-ink">$4,200</p>
                  </div>
                  <div className="rounded border border-teal-700/20 bg-teal-50/80 p-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-teal-800">
                      Policy suggests
                    </p>
                    <p className="mt-1 font-display text-2xl font-medium text-teal-900">$9,100</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between rounded border border-rust/25 bg-rust-faint px-4 py-3 pl-6">
                  <span className="text-sm font-semibold text-rust">Gap (estimate)</span>
                  <span className="font-display text-2xl font-medium text-rust">$4,900</span>
                </div>

                <div className="mt-5 space-y-2 pl-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                    Underpayment areas
                  </p>
                  {DEMO_ISSUES.map((issue) => (
                    <div
                      key={issue.label}
                      className="flex items-center justify-between border-b border-navy/5 py-2 text-sm last:border-0"
                    >
                      <span className="text-ink-muted">{issue.label}</span>
                      <span className="font-medium tabular-nums text-rust">{issue.amount}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/analyze"
                  className="mt-6 flex w-full items-center justify-center rounded-lg bg-navy py-3 text-sm font-semibold text-white transition hover:bg-navy-800"
                >
                  Check my claim — free preview
                </Link>
                <p className="mt-3 text-center text-xs text-ink-faint">Illustrative example · anonymized</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PROOF STRIP ──────────────────────────────────────────── */}
      <section className="border-b border-navy/10 bg-navy text-white">
        <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">
          <div className="flex flex-col gap-4 text-sm leading-snug text-white/85 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-x-10 md:gap-y-2">
            <span className="flex items-center gap-2">
              <span className="text-rust font-bold">→</span>
              {claimsAnalyzed.toLocaleString()}+ claims analyzed
            </span>
            <span className="hidden h-4 w-px bg-white/20 md:block" aria-hidden />
            <span className="flex items-center gap-2">
              <span className="text-rust font-bold">→</span>
              Average gap found: <strong className="text-white ml-1">{averageGapDisplay}</strong>
            </span>
            <span className="hidden h-4 w-px bg-white/20 md:block" aria-hidden />
            <span className="flex items-center gap-2">
              <span className="text-rust font-bold">→</span>
              Takes 2 minutes · Free preview
            </span>
            <span className="hidden h-4 w-px bg-white/20 md:block" aria-hidden />
            <span className="flex items-center gap-2">
              <span className="text-rust font-bold">→</span>
              30-day refund if not useful
            </span>
          </div>
        </div>
      </section>

      {/* ── PAIN SECTION ─────────────────────────────────────────── */}
      <section className="border-b border-navy/10 bg-paper">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-16">
          <div className="grid gap-8 md:grid-cols-2 md:items-center md:gap-16">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-rust">The problem</p>
              <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink md:text-4xl">
                Why most insurance settlements are too low
              </h2>
              <p className="mt-4 text-lg text-ink-muted">
                Insurance adjusters are paid to minimize claims. Your policy may entitle you to far more than they offered — but they count on you not checking.
              </p>
            </div>
            <div className="space-y-4">
              {PAIN_POINTS.map((point) => (
                <div key={point} className="flex items-start gap-4 border-l-4 border-rust bg-white px-5 py-4 shadow-sm">
                  <span className="mt-0.5 shrink-0 text-rust">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                  <p className="text-sm font-semibold leading-relaxed text-ink">{point}</p>
                </div>
              ))}
              <Link
                href="/analyze"
                className="mt-2 inline-flex items-center gap-2 rounded-lg bg-rust px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Check what you&apos;re actually owed
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M3 8a.5.5 0 01.5-.5h7.793L8.146 4.354a.5.5 0 11.708-.708l4 4a.5.5 0 010 .708l-4 4a.5.5 0 01-.708-.708L11.293 8.5H3.5A.5.5 0 013 8z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section id="how" className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-24">
        <div className="mb-14 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-faint">Process</p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink md:text-4xl">
            How to dispute an underpaid insurance claim
          </h2>
          <p className="mt-4 text-lg text-ink-muted">
            No lawyers. No retainers. Upload your policy and settlement letter — we show you the exact gap and generate your dispute package.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              step: "01",
              Icon: IconUpload,
              title: "Upload your documents",
              body: "Your insurance policy PDF and the insurer's settlement or denial letter. Takes about a minute.",
              tag: "Free",
              border: "border-teal-700/15",
              iconBg: "bg-teal-50 text-teal-900",
            },
            {
              step: "02",
              Icon: IconSearch,
              title: "We analyze the gap",
              body: "Your policy is compared against what was offered — clause by clause, line by line. We find what they didn't tell you.",
              tag: "~90 sec",
              border: "border-navy/15",
              iconBg: "bg-navy/5 text-navy",
            },
            {
              step: "03",
              Icon: IconDollar,
              title: "Get your leverage",
              body: "See the gap in dollars. Unlock the full report — dispute letter, escalation plan, and policy arguments — for $149.",
              tag: "$149 unlock",
              border: "border-rust/25",
              iconBg: "bg-rust-faint text-rust",
            },
          ].map((s) => (
            <div
              key={s.step}
              className={`flex flex-col rounded-lg border bg-white p-7 shadow-sm ${s.border}`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded border border-navy/10 ${s.iconBg}`}
                >
                  <s.Icon />
                </div>
                <span className="font-display text-3xl font-light text-navy/15">{s.step}</span>
              </div>
              <h3 className="mt-6 font-display text-xl font-medium text-ink">{s.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">{s.body}</p>
              <span className="mt-6 inline-flex w-fit rounded border border-navy/10 bg-paper px-3 py-1 text-xs font-semibold text-navy">
                {s.tag}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-14">
          <Link
            href="/analyze"
            className="inline-flex items-center gap-2 rounded-lg bg-navy px-7 py-3.5 text-base font-semibold text-white shadow-lift transition hover:bg-navy-800"
          >
            Check my claim — free preview
          </Link>
          <p className="mt-3 text-sm text-ink-faint">No charge until you choose the full report</p>
        </div>
      </section>

      {/* ── PRICING ───────────────────────────────────────────────── */}
      <section id="pricing" className="border-t border-navy/10 bg-[#15202f] py-20 text-white md:py-24">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <div className="md:grid md:grid-cols-2 md:gap-16 md:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/45">Full report · $149</p>
              <h2 className="mt-3 font-display text-3xl font-medium tracking-tight md:text-4xl">
                Everything you need to dispute — in one document
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-white/70">
                Policy citations, dollar ranges, a ready-to-send dispute letter, and a regulator complaint template if they ignore you.
              </p>

              <div className="mt-8 space-y-3">
                {[
                  "Not useful? Full refund within 30 days",
                  "Preview for free — pay only if you want the full report",
                  "No subscription. One claim, one payment.",
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3 text-sm text-white/80">
                    <span className="mt-0.5 shrink-0 text-teal-400">
                      <IconCheck />
                    </span>
                    {point}
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link
                  href="/analyze"
                  className="inline-flex rounded-lg bg-white px-6 py-3.5 text-base font-semibold text-[#15202f] transition hover:bg-stone-100"
                >
                  Start free — no card required
                </Link>
              </div>

              <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/10 pt-10">
                <div>
                  <p className="font-display text-2xl font-medium text-rust">$149</p>
                  <p className="mt-1 text-xs text-white/45">One-time</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-medium">30 days</p>
                  <p className="mt-1 text-xs text-white/45">Refund window</p>
                </div>
                <div>
                  <p className="font-display text-2xl font-medium">Minutes</p>
                  <p className="mt-1 text-xs text-white/45">Delivery after pay</p>
                </div>
              </div>
            </div>

            <div className="mt-14 md:mt-0">
              <dl className="space-y-2">
                {REPORT_SECTIONS.map((r) => (
                  <div
                    key={r.label}
                    className="flex items-start gap-4 border border-white/10 bg-white/[0.04] px-5 py-4"
                  >
                    <span className="shrink-0 pt-0.5 font-mono text-xs text-white/35">{r.n}</span>
                    <div>
                      <dt className="text-sm font-semibold text-white">{r.label}</dt>
                      <dd className="mt-1 text-xs leading-relaxed text-white/55">{r.desc}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="border-t border-navy/10 bg-paper" aria-labelledby="faq-heading">
        <div className="mx-auto max-w-3xl px-4 py-20 md:px-6 md:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-faint">Common questions</p>
          <h2 id="faq-heading" className="mt-3 font-display text-3xl font-medium tracking-tight text-ink md:text-4xl">
            Insurance claim disputes — what you need to know
          </h2>
          <dl className="mt-12 divide-y divide-navy/10">
            {[
              {
                q: "How do I know if my insurance claim was underpaid?",
                a: "Compare what your policy promises against what the insurer actually offered. Look for depreciation calculations, excluded line items, and coverage clauses the adjuster may have ignored. ClaimGap does this automatically — upload your policy and settlement letter and we'll flag every discrepancy.",
              },
              {
                q: "What types of insurance claims can I check?",
                a: "ClaimGap covers home (property damage, wind, water, fire), auto (total loss, collision, comprehensive), and health (denials, underpayments, EOB disputes) insurance claims across all 50 U.S. states.",
              },
              {
                q: "How does the AI gap analysis work?",
                a: "Our AI reads your insurance policy and the insurer's settlement or denial letter, then compares them clause by clause. It identifies coverage language the insurer may have misapplied, calculates the dollar difference, and generates a professional dispute letter with your policy citations.",
              },
              {
                q: "What documents do I need to check my claim?",
                a: "At minimum: your insurance policy (or declarations page) and the settlement or denial letter from your insurer. Optional supporting documents — contractor estimates, repair quotes, medical bills, photos — help tighten the dollar estimate.",
              },
              {
                q: "How much does ClaimGap cost?",
                a: "The preview is completely free — you see the gap estimate and key findings before paying anything. The full report (including the dispute letter, dollar breakdown, 21-day escalation plan, and state commissioner complaint template) costs $149 one-time. If no material gap is found, we refund you within 30 days.",
              },
              {
                q: "Is ClaimGap legal advice?",
                a: "No. ClaimGap is an informational analysis tool — it is not legal advice and does not constitute adjuster or insurance services. The analysis helps you understand your policy and build your own case. For legal action, consult a licensed attorney.",
              },
              {
                q: "How long does an insurance claim dispute take?",
                a: "Your analysis is ready in about 90 seconds. Most state insurance regulators require insurers to acknowledge disputes within 10–15 days and resolve them within 30–45 days. Our 21-Day Action Plan guides you through each follow-up step.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="py-6">
                <dt className="text-base font-semibold text-ink">{q}</dt>
                <dd className="mt-3 text-sm leading-relaxed text-ink-muted">{a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-24">
        <div className="rounded-lg border-2 border-navy/15 bg-white p-10 shadow-card md:p-14">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-rust">Don&apos;t wait</p>
          <h2 className="mt-4 max-w-2xl font-display text-3xl font-medium tracking-tight text-ink md:text-[2rem]">
            Every day you wait is a day they keep your money
          </h2>
          <p className="mt-4 max-w-xl text-lg text-ink-muted">
            Disputes have deadlines. State statutes of limitation vary. The sooner you check, the more options you have — and the stronger your position.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 rounded-lg bg-navy px-7 py-3.5 text-base font-semibold text-white shadow-lift transition hover:bg-navy-800"
            >
              Check my claim now
            </Link>
            <span className="text-sm text-ink-faint">Free · Takes 2 minutes · No card required</span>
          </div>

          {/* Legal disclaimer before CTA */}
          <div className="mt-10 rounded-lg border border-navy/10 bg-paper px-5 py-4">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">Before you start</p>
            <div className="grid gap-1.5 sm:grid-cols-2">
              {[
                "Not legal advice — informational analysis only",
                "No guarantee of financial recovery",
                "For informational purposes only",
                "Consult a licensed attorney for legal action",
              ].map((d) => (
                <div key={d} className="flex items-center gap-2 text-xs text-ink-faint">
                  <span className="shrink-0 text-navy/50">
                    <IconCheck />
                  </span>
                  {d}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LEGAL ─────────────────────────────────────────────────── */}
      <section className="border-t border-navy/10 bg-paper py-10">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <p className="text-center text-xs leading-relaxed text-ink-faint">
            <strong className="text-ink-muted">Legal notice:</strong> ClaimGap is an informational tool and does not
            constitute legal advice, insurance advice, or adjuster services. Generated analysis may contain errors and
            should be verified independently. Recovery is not guaranteed. Results depend entirely on the documents you
            provide. Consult a licensed attorney before taking legal action. Total liability is limited to amounts paid
            for the service.
          </p>
        </div>
      </section>
    </div>
    </>
  );
}
