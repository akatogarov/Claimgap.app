import type { Metadata } from "next";
import { ClaimLandingPage } from "@/components/ClaimLandingPage";

export const metadata: Metadata = {
  title: "Home Insurance Claim Underpaid? How to Dispute and Recover More",
  description:
    "Is your homeowners insurance settlement too low? Learn the signs of an underpaid property damage claim and the exact steps to dispute and recover what your policy owes you.",
  alternates: { canonical: "/home-insurance-claim-underpaid" },
  openGraph: {
    url: "/home-insurance-claim-underpaid",
    title: "Home Insurance Claim Underpaid? How to Dispute and Recover More",
    description:
      "Property insurers routinely pay ACV instead of RCV, exclude code upgrades, and underestimate contractor costs. See how to fight back.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "Home Insurance Claim Underpaid? How to Dispute and Recover More",
      description:
        "A complete guide to identifying underpaid homeowners insurance claims and disputing them effectively.",
      url: "https://claimgap.app/home-insurance-claim-underpaid",
      publisher: {
        "@type": "Organization",
        name: "ClaimGap",
        url: "https://claimgap.app",
      },
    },
    {
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is the difference between ACV and RCV in a home insurance claim?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Actual Cash Value (ACV) is the depreciated value of damaged property. Replacement Cost Value (RCV) is the full cost to repair or replace at today's prices. Many policies promise RCV but insurers initially pay ACV, withholding the recoverable depreciation until repairs are complete.",
          },
        },
        {
          "@type": "Question",
          name: "Can I dispute a homeowners insurance settlement?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Submit a written dispute citing the specific policy language and your own contractor estimates. Most policies include an appraisal clause allowing you to hire an independent appraiser if you and the insurer disagree on the amount.",
          },
        },
      ],
    },
  ],
};

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ClaimLandingPage
        badge="Homeowners Insurance"
        h1="Home insurance claim underpaid? How to get what your policy owes"
        answer="Property insurers regularly pay less than policies require — by defaulting to Actual Cash Value instead of Replacement Cost, excluding code-upgrade expenses, and underpricing contractor labor. If your settlement feels low compared to contractor quotes, it almost certainly is. Homeowners who dispute formally recover an average of 20–40% more."
        signs={{
          heading: "Signs your homeowners insurance claim is underpaid",
          items: [
            "Settlement is based on Actual Cash Value (ACV) when your policy guarantees Replacement Cost Value (RCV)",
            "The insurer's repair estimate is below quotes from two or more local contractors",
            "Building code upgrade costs were excluded even though local code requires them",
            "Temporary housing and living expenses were denied or capped below policy limits",
            "Damage categories — like mold remediation or debris removal — are missing from the estimate",
            "The adjuster used out-of-state labor rates instead of local market rates",
            "You were pressured to sign a quick-settlement agreement before repairs were complete",
          ],
        }}
        steps={{
          heading: "How to dispute an underpaid home insurance claim",
          items: [
            {
              n: "01",
              title: "Get a detailed contractor estimate",
              desc: "Hire a licensed local contractor to provide a line-by-line written estimate. This is your primary evidence of what repairs actually cost in your area.",
            },
            {
              n: "02",
              title: "Check ACV vs. RCV in your policy",
              desc: "Find your policy's Loss Settlement provision. If it says 'Replacement Cost,' the insurer must pay the full repair cost — not the depreciated value. Many adjusters default to ACV hoping you won't notice.",
            },
            {
              n: "03",
              title: "Document all damage in writing and photos",
              desc: "Create a complete inventory: photos, videos, written descriptions, serial numbers. Include damage the adjuster may have missed during the initial inspection.",
            },
            {
              n: "04",
              title: "Submit a written dispute with policy citations",
              desc: "Write a formal letter citing the specific policy clauses and the dollar discrepancy between their offer and your contractor's estimate. Keep all communication in writing.",
            },
            {
              n: "05",
              title: "Invoke the appraisal clause if needed",
              desc: "Most homeowners policies include an appraisal clause. Both parties hire independent appraisers, who choose an umpire to resolve disputes. This bypasses litigation and often resolves in weeks.",
            },
          ],
        }}
        stats={[
          { value: "20–40%", label: "Average underpayment gap" },
          { value: "2 yrs", label: "Typical dispute deadline" },
          { value: "90 sec", label: "ClaimGap analysis time" },
        ]}
        faqs={[
          {
            q: "What is the difference between ACV and RCV in a home insurance claim?",
            a: "Actual Cash Value (ACV) is the depreciated value of damaged property. Replacement Cost Value (RCV) is the full cost to repair or replace at today's prices. Many policies promise RCV but insurers initially pay ACV, withholding recoverable depreciation until repairs are complete.",
          },
          {
            q: "Can I dispute a homeowners insurance settlement?",
            a: "Yes. Submit a written dispute citing the specific policy language and your own contractor estimates. Most policies include an appraisal clause allowing you to hire an independent appraiser if you and the insurer disagree on the amount.",
          },
          {
            q: "Do I need a public adjuster to dispute my home insurance claim?",
            a: "Not necessarily. Many policyholders successfully dispute on their own with contractor estimates and a formal dispute letter. A public adjuster can help on large or complex claims — they typically charge 10–15% of the additional settlement. For smaller disputes, a strong written dispute letter is often sufficient.",
          },
          {
            q: "How long does a home insurance dispute take?",
            a: "Most states require insurers to acknowledge disputes within 10–15 business days and resolve within 30–45 days. If you invoke the appraisal clause, the process typically takes 4–8 weeks. Filing a state complaint can accelerate slow responses.",
          },
        ]}
        cta={{
          heading: "Find out exactly what your home insurance owes you",
          sub: "Upload your policy and settlement letter. ClaimGap compares them clause by clause, finds every underpaid dollar, and generates your dispute letter.",
        }}
      />
    </>
  );
}
