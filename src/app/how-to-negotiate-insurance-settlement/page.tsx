import type { Metadata } from "next";
import { SEOPageLayout } from "@/components/SEOPageLayout";

export const metadata: Metadata = {
  title: "How to Negotiate an Insurance Settlement (Step-by-Step Guide)",
  description:
    "A practical guide to negotiating a higher insurance settlement. Learn what evidence to gather, how to write a counter-offer letter, and when to escalate — for home, auto, and health claims.",
  alternates: { canonical: "/how-to-negotiate-insurance-settlement" },
  openGraph: {
    url: "/how-to-negotiate-insurance-settlement",
    title: "How to Negotiate an Insurance Settlement (Step-by-Step Guide)",
    description:
      "Most insurance settlements can be negotiated. Here's exactly how — from building your case to writing the dispute letter and escalating if the insurer ignores you.",
  },
};

export default function Page() {
  return (
    <SEOPageLayout
      badge="Dispute guide"
      claimType="Home"
      h1="How to negotiate an insurance settlement — a step-by-step guide"
      intro="Insurance settlements are negotiable. The first offer is rarely final — it's an opening position. Policyholders who push back with documented evidence regularly receive 20–50% more than the initial offer. Here's exactly how to do it."
      sections={[
        {
          heading: "Before you negotiate: what you need",
          content: (
            <ul className="mt-3 space-y-2">
              {[
                "Your complete insurance policy (declarations page + full policy document)",
                "The insurer's settlement or denial letter (in writing — request it if they only called)",
                "An independent repair estimate or valuation (contractor, dealer, or medical billing review)",
                "Photos and documentation of all damage",
                "A record of all communications with the adjuster (dates, names, what was said)",
                "Any receipts or records relevant to the loss",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-ink-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy" />
                  {item}
                </li>
              ))}
            </ul>
          ),
        },
        {
          heading: "Step 1: Understand what your policy actually covers",
          content: (
            <div className="space-y-3 text-sm">
              <p>
                Most policyholders negotiate from a general sense that the offer is too low. The most effective approach is policy-specific: find the exact language that supports a higher payment.
              </p>
              <p>
                Common coverage provisions that get missed:
              </p>
              <ul className="space-y-1">
                {[
                  "Replacement cost vs. actual cash value — major difference in payout",
                  "Ordinance or Law (code upgrade) coverage — required when renovations trigger code compliance",
                  "Loss of use / additional living expenses — if you couldn't use your property",
                  "Extended replacement cost riders — pay above your coverage limit for unexpected cost increases",
                  "Matching provisions — insurer must match undamaged sections to replaced ones",
                ].map((c) => (
                  <li key={c} className="flex items-start gap-2 text-ink-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rust" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          ),
        },
        {
          heading: "Step 2: Calculate what you're actually owed",
          content: (
            <div className="space-y-3 text-sm">
              <p>
                Don&apos;t negotiate a vague &ldquo;more&rdquo; &mdash; negotiate a specific dollar amount you can defend. Build a line-by-line comparison:
              </p>
              <div className="rounded border border-navy/10 bg-paper p-4 font-mono text-xs">
                <div className="grid grid-cols-3 gap-2 font-bold text-ink border-b border-navy/10 pb-2 mb-2">
                  <span>Item</span>
                  <span>Insurer paid</span>
                  <span>You claim</span>
                </div>
                {[
                  ["Roof replacement", "$8,400", "$12,200"],
                  ["Code upgrade (electrical)", "$0", "$2,100"],
                  ["Water damage (secondary)", "$0", "$1,800"],
                  ["Matching siding", "$0", "$3,400"],
                ].map(([item, paid, claim]) => (
                  <div key={item} className="grid grid-cols-3 gap-2 text-ink-muted py-1 border-b border-navy/5">
                    <span>{item}</span>
                    <span>{paid}</span>
                    <span className="text-teal-700 font-semibold">{claim}</span>
                  </div>
                ))}
              </div>
            </div>
          ),
        },
        {
          heading: "Step 3: Write the counter-offer letter",
          content: (
            <div className="space-y-3 text-sm">
              <p>An effective counter-offer letter does four things:</p>
              <ol className="space-y-2">
                {[
                  "States the specific dollar amount you are requesting",
                  "Cites the exact policy clauses that support each item",
                  "Attaches independent documentation (contractor estimates, comparables, medical records)",
                  "Sets a response deadline (10–15 business days is standard)",
                ].map((item, i) => (
                  <li key={item} className="flex items-start gap-2 text-ink-muted">
                    <span className="shrink-0 font-semibold text-navy">{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ol>
              <p>
                Send via certified mail (creates legal proof of delivery). Keep a copy of everything you send.
              </p>
            </div>
          ),
        },
        {
          heading: "Step 4: What to do if the insurer doesn't respond or refuses",
          content: (
            <ol className="space-y-3 text-sm">
              {[
                {
                  step: "Invoke the appraisal clause",
                  detail: "Most policies allow you to demand an independent appraisal. Both sides hire appraisers; an umpire decides if they disagree. Insurers often settle before this process concludes.",
                },
                {
                  step: "File a state insurance complaint",
                  detail: "A complaint to your state Department of Insurance costs nothing and often prompts quick resolution. Insurers don't want a regulatory record of disputes.",
                },
                {
                  step: "Hire a public adjuster",
                  detail: "Public adjusters work on your behalf (typically 10–15% contingency) and know the policy language and insurer tactics in detail.",
                },
                {
                  step: "Consult a bad faith insurance attorney",
                  detail: "If the insurer acted in bad faith — unreasonable delay, lowball without basis, ignoring policy language — you may be entitled to damages beyond the original claim amount.",
                },
              ].map(({ step, detail }) => (
                <li key={step} className="border-l-2 border-navy/20 pl-4">
                  <p className="font-semibold text-ink">{step}</p>
                  <p className="mt-1 text-ink-muted">{detail}</p>
                </li>
              ))}
            </ol>
          ),
        },
      ]}
      ctaHeading="Start your negotiation with a full gap analysis"
      ctaBody="Upload your policy and settlement letter. Our AI identifies every clause the insurer may have missed or misapplied, calculates the dollar gap, and generates a ready-to-send dispute letter with your specific policy citations."
    />
  );
}
