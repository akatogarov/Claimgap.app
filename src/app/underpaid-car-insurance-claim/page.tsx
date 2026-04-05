import type { Metadata } from "next";
import { SEOPageLayout } from "@/components/SEOPageLayout";

export const metadata: Metadata = {
  title: "Car Insurance Claim Underpaid? What to Do",
  description:
    "Your auto insurance settlement offer may be 20–40% too low. Learn how to spot a lowball car insurance payout, build your case, and negotiate a fair settlement.",
  alternates: { canonical: "/underpaid-car-insurance-claim" },
  openGraph: {
    url: "/underpaid-car-insurance-claim",
    title: "Car Insurance Claim Underpaid? What to Do",
    description:
      "Auto insurance companies routinely undervalue total loss vehicles and collision claims. Here's how to check if your payout is short — and what to do about it.",
  },
};

export default function Page() {
  return (
    <SEOPageLayout
      badge="Auto insurance"
      claimType="Auto"
      h1="Car insurance claim underpaid? Here's what to do"
      intro="If your auto insurance settlement feels low, it probably is. Insurers use proprietary valuation tools that frequently understate vehicle value by 15–30%. You have the right to dispute — and the policy language to back you up."
      sections={[
        {
          heading: "Signs your car insurance claim was underpaid",
          content: (
            <ul className="mt-3 space-y-2">
              {[
                "The settlement offer arrived within 48 hours — before a proper inspection",
                "Comparable vehicles in the adjuster's list have higher mileage or worse condition than yours",
                "Aftermarket upgrades or recent repairs weren't factored into the valuation",
                "The offer is below what similar vehicles are selling for in your area right now",
                "You were pressured to sign a release quickly",
                "The adjuster applied 'betterment' deductions for parts you recently replaced",
              ].map((s) => (
                <li key={s} className="flex items-start gap-2 text-sm text-ink-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rust" />
                  {s}
                </li>
              ))}
            </ul>
          ),
        },
        {
          heading: "How auto insurers calculate (and minimize) your payout",
          content: (
            <div className="space-y-4 text-sm">
              <p>
                For total loss claims, insurers use Actual Cash Value (ACV) — but they calculate it using internal databases like CCC ONE or Mitchell that often pull comparable vehicles from distant markets or with higher mileage. The result is a baseline that favors the insurer.
              </p>
              <p>
                For collision and repair claims, adjusters use labor rates below what local body shops actually charge, apply depreciation to parts that may be covered as new under your policy, and frequently miss hidden damage that only appears during teardown.
              </p>
              <div className="rounded border-l-4 border-rust bg-rust-faint px-4 py-3">
                <p className="font-semibold text-ink text-sm">Industry data point</p>
                <p className="mt-1 text-ink-muted text-sm">
                  Research by the Consumer Federation of America found total-loss settlements averaging 20–30% below comparable retail values. This gap is a structural practice — not a mistake.
                </p>
              </div>
            </div>
          ),
        },
        {
          heading: "Your rights when disputing an auto insurance settlement",
          content: (
            <div className="space-y-3 text-sm">
              <p>Every state requires insurers to settle claims in good faith. You generally have the right to:</p>
              <ul className="space-y-2">
                {[
                  "Request the complete valuation report and comparable vehicle list",
                  "Submit your own comparables or independent appraisal",
                  "Invoke the appraisal clause in your policy (most policies include one)",
                  "File a complaint with your state's Department of Insurance",
                  "Negotiate before signing any release agreement",
                ].map((r) => (
                  <li key={r} className="flex items-start gap-2 text-ink-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy" />
                    {r}
                  </li>
                ))}
              </ul>
              <p className="pt-2">
                Most disputes are resolved before any formal proceeding. A well-documented counter-offer citing policy language and your own comparable data is usually enough to get a revised offer.
              </p>
            </div>
          ),
        },
        {
          heading: "How to dispute an auto insurance underpayment (step by step)",
          content: (
            <ol className="space-y-4 text-sm">
              {[
                {
                  step: "1. Get the insurer's full valuation in writing",
                  detail: "Ask for the comparable vehicle list and the methodology they used. This is your baseline.",
                },
                {
                  step: "2. Find your own comparables",
                  detail: "Search AutoTrader, CarGurus, and local dealers for vehicles matching your make, model, year, mileage, and condition. Screenshot the listings.",
                },
                {
                  step: "3. Document every discrepancy in your policy",
                  detail: "Match the coverage language in your policy against what was actually paid. Note every clause they ignored.",
                },
                {
                  step: "4. Send a formal counter-offer letter",
                  detail: "Reference your policy clauses, attach comparables, and state the dollar amount you're requesting. Send via certified mail.",
                },
                {
                  step: "5. Escalate if ignored",
                  detail: "Invoke the appraisal clause, file a state complaint, or consult a public adjuster or attorney.",
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
      ctaHeading="Check if your auto claim is underpaid — free"
      ctaBody="Upload your policy and settlement letter. Our AI reads both documents and shows you exactly where the numbers don't match — clause by clause. Free preview in 90 seconds."
    />
  );
}
