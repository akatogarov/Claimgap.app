import type { Metadata } from "next";
import { SEOPageLayout } from "@/components/SEOPageLayout";

export const metadata: Metadata = {
  title: "Home Insurance Claim Underpaid? How to Get What Your Policy Promises",
  description:
    "Homeowners insurance settlements are routinely 20–35% below actual repair costs. Learn the signs of an underpaid home claim and how to dispute it with your policy language.",
  alternates: { canonical: "/home-insurance-claim-underpaid" },
  openGraph: {
    url: "/home-insurance-claim-underpaid",
    title: "Home Insurance Claim Underpaid? How to Get What Your Policy Promises",
    description:
      "Adjusters undervalue home repairs by applying excessive depreciation and ignoring code-upgrade requirements. Here's how to check and dispute your settlement.",
  },
};

export default function Page() {
  return (
    <SEOPageLayout
      badge="Homeowners insurance"
      claimType="Home"
      h1="Home insurance claim underpaid? How to get what your policy actually promises"
      intro="After a fire, storm, or water damage, the insurer's first offer is rarely their best. Adjusters routinely understate repair costs, over-apply depreciation, and skip coverage clauses for code upgrades. Most policyholders don't know they can push back — or how."
      sections={[
        {
          heading: "Common reasons home insurance claims are underpaid",
          content: (
            <ul className="mt-3 space-y-2">
              {[
                "Adjuster used national average repair costs instead of local contractor rates",
                "Excessive depreciation applied to roofing, flooring, or HVAC that should be replaced, not depreciated",
                "Code upgrade coverage (Ordinance or Law) ignored when repairs require bringing work up to current building code",
                "Matching coverage ignored — only damaged items replaced, leaving mismatched finishes",
                "Hidden or secondary damage (mold, structural) not included in initial estimate",
                "Contents claim undervalued using replacement cost minus depreciation without ACV documentation",
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
          heading: "The difference between ACV and replacement cost — and why it matters",
          content: (
            <div className="space-y-4 text-sm">
              <p>
                Your policy either pays Actual Cash Value (ACV) or Replacement Cost Value (RCV). The difference is significant:
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded border border-navy/10 bg-paper p-4">
                  <p className="font-semibold text-ink">Actual Cash Value (ACV)</p>
                  <p className="mt-1 text-ink-muted">Replacement cost minus depreciation. A 10-year-old roof gets a fraction of what a new roof costs today.</p>
                </div>
                <div className="rounded border border-teal-700/20 bg-teal-50/60 p-4">
                  <p className="font-semibold text-ink">Replacement Cost Value (RCV)</p>
                  <p className="mt-1 text-ink-muted">Full cost to repair or replace with like materials at current prices. No depreciation deducted.</p>
                </div>
              </div>
              <p>
                Many insurers initially pay ACV and hold back the depreciation &ldquo;recoverable&rdquo; until repairs are complete. If you didn&apos;t complete repairs or didn&apos;t request the holdback, you may have left money on the table.
              </p>
            </div>
          ),
        },
        {
          heading: "How to dispute a home insurance underpayment",
          content: (
            <ol className="space-y-4 text-sm">
              {[
                {
                  step: "1. Get a contractor estimate independently",
                  detail: "Hire a local contractor to estimate the full repair scope. This gives you a credible counter to the adjuster's number.",
                },
                {
                  step: "2. Read your policy's coverage language carefully",
                  detail: "Look for: replacement cost vs. ACV, code upgrade coverage (Ordinance or Law), matching provisions, and extended replacement cost riders.",
                },
                {
                  step: "3. Document all damage with photos and receipts",
                  detail: "Create a line-by-line inventory of damaged property with purchase dates, prices, and current replacement costs.",
                },
                {
                  step: "4. Send a written dispute referencing your policy",
                  detail: "Cite the specific clauses that support your position. Attach the contractor estimate. Request a written response within 10 business days.",
                },
                {
                  step: "5. Request a re-inspection or invoke appraisal",
                  detail: "Most policies include an appraisal clause allowing both sides to hire independent appraisers. This often resolves disputes without legal action.",
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
        {
          heading: "Dispute deadlines you need to know",
          content: (
            <div className="space-y-3 text-sm">
              <p>
                Home insurance dispute windows are real — and missing them can eliminate your options:
              </p>
              <ul className="space-y-2">
                {[
                  "Most policies require you to submit a Proof of Loss within 60 days of the loss",
                  "Appraisal demands typically must be made before the statute of limitations expires (usually 1–3 years by state)",
                  "Some policies have a 12-month suit limitation clause — even shorter than state law",
                  "Recoverable depreciation holdback claims often have a 180-day window after repairs",
                ].map((d) => (
                  <li key={d} className="flex items-start gap-2 text-ink-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy" />
                    {d}
                  </li>
                ))}
              </ul>
              <p className="text-ink-muted pt-1 font-medium">Every week you wait narrows your options.</p>
            </div>
          ),
        },
      ]}
      ctaHeading="Check if your home insurance claim was underpaid"
      ctaBody="Upload your homeowners policy and the insurer's settlement letter. Our AI compares them clause by clause and shows you the gap — what the policy says versus what they paid. Free preview in 90 seconds."
    />
  );
}
