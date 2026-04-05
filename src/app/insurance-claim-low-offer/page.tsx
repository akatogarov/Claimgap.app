import type { Metadata } from "next";
import { SEOPageLayout } from "@/components/SEOPageLayout";

export const metadata: Metadata = {
  title: "Insurance Company Gave You a Low Offer? Don't Accept It Yet",
  description:
    "A low insurance settlement offer is not final. Learn why insurers start low, what your policy actually entitles you to, and exactly how to counter a lowball offer.",
  alternates: { canonical: "/insurance-claim-low-offer" },
  openGraph: {
    url: "/insurance-claim-low-offer",
    title: "Insurance Company Gave You a Low Offer? Don't Accept It Yet",
    description:
      "First offers from insurance companies are designed to close claims cheaply. Here's how to know if you're being lowballed — and how to push back.",
  },
};

export default function Page() {
  return (
    <SEOPageLayout
      badge="Know your rights"
      claimType="Home"
      h1="Insurance company gave you a low offer? Don't accept it yet"
      intro={`The first settlement offer from an insurance company is almost never their best one. Adjusters are trained to close claims quickly and cheaply. "Quick and low" benefits the insurer — not you. Here's what you need to know before signing anything.`}
      sections={[
        {
          heading: "Why insurance companies start with a low offer",
          content: (
            <div className="space-y-4 text-sm">
              <p>
                Insurance adjusters work for the insurance company — not for you. Their job is to settle claims as efficiently as possible, which means minimizing payouts. The tactics are systematic:
              </p>
              <ul className="space-y-2">
                {[
                  "First offers are calculated to be acceptable to most policyholders without a fight",
                  "Adjusters know most people don't re-read their policy after buying it",
                  "Settlement pressure is applied early, while you're still dealing with the underlying loss",
                  "Signing a release ends the claim — even if you later discover the payment was short",
                  "Internal scoring systems reward adjusters for closing claims below reserve amounts",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-ink-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rust" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ),
        },
        {
          heading: "How to know if the offer is actually too low",
          content: (
            <div className="space-y-4 text-sm">
              <p>
                The only reliable way to know if an offer is fair is to compare it against your policy language — not against what you hoped to receive. Specifically:
              </p>
              <ul className="space-y-2">
                {[
                  "Does the offer reflect replacement cost, or did they apply depreciation when your policy promises replacement cost value?",
                  "Are there coverage clauses (code upgrade, matching, loss of use) that weren't applied?",
                  "Does the dollar amount match independent contractor or dealer estimates for the same damage?",
                  "Were any damage categories simply omitted from the estimate?",
                  "Is the calculation methodology documented and verifiable?",
                ].map((q) => (
                  <li key={q} className="flex items-start gap-2 text-ink-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy" />
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          ),
        },
        {
          heading: "What to do when you receive a low settlement offer",
          content: (
            <ol className="space-y-4 text-sm">
              {[
                {
                  step: "1. Do not sign anything yet",
                  detail: "A signed release is generally final. You usually cannot reopen a claim after signing. Take time to evaluate the offer properly.",
                },
                {
                  step: "2. Request the full claim file",
                  detail: "Ask for the adjuster's worksheet, the damage estimate, and the methodology used. You have the right to see what you're settling.",
                },
                {
                  step: "3. Get an independent estimate",
                  detail: "For home or auto claims, get a contractor or dealer estimate independently. For health claims, verify the billing codes used and the 'allowed amount' against your plan's published fee schedule.",
                },
                {
                  step: "4. Identify your policy's actual coverage language",
                  detail: "Read the relevant coverage sections carefully. Look for replacement cost provisions, additional coverage clauses, and any riders or endorsements you may have forgotten about.",
                },
                {
                  step: "5. Make a written counter-offer",
                  detail: "Cite the specific policy language, attach supporting documentation, and state clearly what amount you're requesting and why. Do not just say 'it's too low' — make a specific, documented counter.",
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
          heading: "What happens after you counter",
          content: (
            <div className="space-y-3 text-sm">
              <p>
                In most cases, a documented counter-offer prompts the insurer to revise upward. Adjusters have authority to increase offers &mdash; they just won&apos;t do it unless pushed with evidence.
              </p>
              <p>
                If the insurer refuses to negotiate, your escalation options include:
              </p>
              <ul className="space-y-2">
                {[
                  "Invoking the appraisal or arbitration clause in your policy",
                  "Filing a complaint with your state Department of Insurance",
                  "Hiring a public adjuster (typically on contingency)",
                  "Consulting a bad faith insurance attorney (often no upfront cost)",
                ].map((o) => (
                  <li key={o} className="flex items-start gap-2 text-ink-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          ),
        },
      ]}
      ctaHeading="Find out if the offer you received is actually fair"
      ctaBody="Upload your insurance policy and settlement letter. Our AI reads both — clause by clause — and shows you every place the offer falls short of what your policy actually requires. Free in 90 seconds."
    />
  );
}
