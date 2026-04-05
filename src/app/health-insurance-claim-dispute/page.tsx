import type { Metadata } from "next";
import { SEOPageLayout } from "@/components/SEOPageLayout";

export const metadata: Metadata = {
  title: "Health Insurance Claim Denied or Underpaid? How to Appeal",
  description:
    "Health insurers deny or underpay over 17% of in-network claims. Learn your appeal rights, how to read an Explanation of Benefits (EOB), and how to dispute a denial step by step.",
  alternates: { canonical: "/health-insurance-claim-dispute" },
  openGraph: {
    url: "/health-insurance-claim-dispute",
    title: "Health Insurance Claim Denied or Underpaid? How to Appeal",
    description:
      "Most denied health insurance claims can be overturned on appeal. Here's how to read your EOB, identify wrongful denials, and get the coverage your plan promises.",
  },
};

export default function Page() {
  return (
    <SEOPageLayout
      badge="Health insurance"
      claimType="Health"
      h1="Health insurance claim denied or underpaid? How to appeal and win"
      intro="Health insurers deny over 17% of in-network claims at first submission — but roughly 40% of appealed denials are overturned. If you received a denial letter or an Explanation of Benefits (EOB) that doesn't match what you expected, you have clear rights and a defined process to dispute it."
      sections={[
        {
          heading: "Common reasons health insurance claims are denied or underpaid",
          content: (
            <ul className="mt-3 space-y-2">
              {[
                "Service coded as 'not medically necessary' — often reversed with a doctor's letter",
                "Out-of-network provider treated as in-network emergency (balance billing dispute)",
                "Pre-authorization wasn't obtained — even when the ER didn't allow time to get it",
                "Incorrect billing codes submitted by the provider — not your fault but your problem",
                "Coordination of benefits errors when you have more than one insurance plan",
                "Annual or lifetime benefit limits applied incorrectly (ACA prohibits most lifetime limits)",
                "Mental health parity violations — insurer applied stricter limits than medical benefits",
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
          heading: "How to read your Explanation of Benefits (EOB)",
          content: (
            <div className="space-y-4 text-sm">
              <p>
                Your EOB is not a bill &mdash; it&apos;s the insurer&apos;s accounting of what they paid and why. Key fields to check:
              </p>
              <ul className="space-y-2">
                {[
                  "Billed amount — what the provider charged",
                  "Allowed amount — what the insurer says the service is worth (often much less)",
                  "Plan paid — what the insurer actually paid after your deductible/copay",
                  "Your responsibility — what you allegedly owe",
                  "Reason codes — cryptic codes that explain why a claim was denied or reduced",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-ink-muted">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy" />
                    {item}
                  </li>
                ))}
              </ul>
              <p>
                If the reason codes don&apos;t match your actual situation &mdash; or if the allowed amount is far below what comparable providers charge &mdash; you have grounds for an appeal.
              </p>
            </div>
          ),
        },
        {
          heading: "The health insurance appeal process (internal and external)",
          content: (
            <ol className="space-y-4 text-sm">
              {[
                {
                  step: "Step 1: Internal appeal",
                  detail: "You have the right to an internal appeal within 180 days of receiving the denial. Submit a written appeal letter, your EOB, and supporting documentation (doctor's letter, medical records). The insurer must respond within 30 days for prior-auth disputes or 60 days for post-service claims.",
                },
                {
                  step: "Step 2: Expedited appeal (for urgent care)",
                  detail: "If your health is at risk, you can request an expedited appeal. The insurer must respond within 72 hours.",
                },
                {
                  step: "Step 3: External review",
                  detail: "If the internal appeal fails, you can request an independent external review. Under the ACA, insurers must abide by the external reviewer's decision. Success rates are significant — approximately 40% of external reviews overturn the insurer's decision.",
                },
                {
                  step: "Step 4: State insurance commissioner complaint",
                  detail: "File a complaint with your state's Department of Insurance, especially for bad-faith denials, mental health parity violations, or emergency care disputes.",
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
          heading: "Appeal deadlines you cannot miss",
          content: (
            <div className="space-y-2 text-sm">
              {[
                "Internal appeal: 180 days from denial (ACA standard — your plan may be shorter)",
                "External review request: typically 4 months from internal appeal denial",
                "State complaint: varies by state, typically 1–3 years",
                "Urgent/concurrent care appeal: insurer must respond within 72 hours",
              ].map((d) => (
                <div key={d} className="flex items-start gap-2 text-ink-muted">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rust" />
                  {d}
                </div>
              ))}
            </div>
          ),
        },
      ]}
      ctaHeading="Check if your health insurance claim was underpaid or wrongly denied"
      ctaBody="Upload your insurance card or plan documents and the denial letter or EOB. Our AI identifies the specific coverage language the insurer may have misapplied and generates your appeal letter. Free preview in 90 seconds."
    />
  );
}
