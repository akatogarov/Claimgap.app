import type { Metadata } from "next";
import { SEOPageLayout } from "@/components/SEOPageLayout";

export const metadata: Metadata = {
  title: "Should I Accept the Insurance Settlement Offer?",
  description:
    "Before you accept an insurance settlement, check these 7 things. Signing a release ends your claim — even if the payment turns out to be short. Here's how to evaluate the offer.",
  alternates: { canonical: "/should-i-accept-insurance-settlement" },
  openGraph: {
    url: "/should-i-accept-insurance-settlement",
    title: "Should I Accept the Insurance Settlement Offer?",
    description:
      "Don't sign until you've answered these questions. An accepted insurance settlement is final in most cases — here's how to know if the offer is actually fair.",
  },
};

export default function Page() {
  return (
    <SEOPageLayout
      badge="Before you sign"
      claimType="Home"
      h1="Should I accept the insurance settlement offer?"
      intro="Accepting an insurance settlement is almost always permanent. Once you sign a release, the claim is closed — even if you later discover the payment was short. Before you accept, here's what to check."
      sections={[
        {
          heading: "The most important thing: what a release actually means",
          content: (
            <div className="space-y-3 text-sm">
              <p>
                When you accept a settlement, the insurer typically requires you to sign a release of claims. This document:
              </p>
              <ul className="space-y-2">
                {[
                  "Permanently closes your claim for the specific loss",
                  "Waives your right to seek additional payment later — even if damage is discovered afterward",
                  "Is a legally binding contract in most states",
                  "Cannot usually be undone by claiming you didn't understand it",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-ink-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rust" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="rounded border-l-4 border-rust bg-rust-faint px-4 py-3">
                <p className="font-semibold text-ink text-sm">Bottom line</p>
                <p className="mt-1 text-sm text-ink-muted">
                  If you accept now and later discover the settlement was $5,000 short, you generally have no recourse. Verify first.
                </p>
              </div>
            </div>
          ),
        },
        {
          heading: "7 questions to answer before accepting",
          content: (
            <ol className="space-y-4 text-sm">
              {[
                {
                  q: "1. Does the offer match your policy's coverage type?",
                  a: "If your policy covers Replacement Cost Value (RCV), the offer should cover full replacement — not Actual Cash Value (depreciated). This difference can be 30–50% of the payout.",
                },
                {
                  q: "2. Are there additional coverage clauses that weren't applied?",
                  a: "Code upgrade (Ordinance or Law), loss of use, matching provisions, and contents coverage are frequently omitted from initial offers.",
                },
                {
                  q: "3. Is the damage scope complete?",
                  a: "Initial estimates often miss secondary or hidden damage. For home claims: mold, structural, electrical. For auto: frame damage, hidden mechanical issues.",
                },
                {
                  q: "4. Is the offer based on local prices?",
                  a: "National average repair costs are often lower than what local contractors actually charge. Get a real estimate.",
                },
                {
                  q: "5. Were any depreciation deductions applied to items your policy covers as new?",
                  a: "Some policies explicitly prohibit depreciation on certain items. Check your declarations page.",
                },
                {
                  q: "6. Have all of your out-of-pocket expenses been included?",
                  a: "Temporary housing, rental car, emergency repairs — all may be covered under separate policy provisions.",
                },
                {
                  q: "7. Is the settlement offer in line with what independent experts say it should be?",
                  a: "If a contractor, dealer, or medical billing specialist estimates significantly more than the offer, that gap is worth investigating before you sign.",
                },
              ].map(({ q, a }) => (
                <li key={q} className="border-l-2 border-navy/20 pl-4">
                  <p className="font-semibold text-ink">{q}</p>
                  <p className="mt-1 text-ink-muted">{a}</p>
                </li>
              ))}
            </ol>
          ),
        },
        {
          heading: "When it's probably safe to accept",
          content: (
            <div className="space-y-3 text-sm">
              <p>You can reasonably accept the settlement when:</p>
              <ul className="space-y-2">
                {[
                  "You've verified the offer matches your policy's coverage type (RCV vs ACV)",
                  "An independent estimate is within 10% of the offer",
                  "All damage has been identified and included in the estimate",
                  "All applicable coverage provisions have been applied",
                  "You're not being asked to waive future claims for latent damage (e.g., ongoing mold)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-ink-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-700" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ),
        },
        {
          heading: "When you should not accept (yet)",
          content: (
            <div className="space-y-3 text-sm">
              <p>Hold off on signing if:</p>
              <ul className="space-y-2">
                {[
                  "You haven't read your policy's coverage language and compared it to the offer",
                  "You haven't gotten an independent estimate",
                  "The adjuster is pressuring you to sign quickly or offering a one-time 'bonus' to close",
                  "There are repair categories in the independent estimate that don't appear in the insurer's offer",
                  "You haven't confirmed whether the offer includes all covered expenses (temporary housing, rental car, etc.)",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-ink-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rust" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="pt-2">
                Taking a few days to verify does not jeopardize your claim. Signing before verifying can permanently close it short.
              </p>
            </div>
          ),
        },
      ]}
      ctaHeading="Verify the offer before you sign — takes 90 seconds"
      ctaBody="Upload your insurance policy and the settlement letter. Our AI checks every coverage clause against what the insurer offered and shows you exactly what may be missing — before you sign anything."
    />
  );
}
