import type { Metadata } from "next";
import { ClaimLandingPage } from "@/components/ClaimLandingPage";

export const metadata: Metadata = {
  title: "Car Insurance Claim Underpaid? What to Do",
  description:
    "Find out if your car insurance payout is too low. Insurers routinely underestimate repair costs and miscalculate depreciation. Learn how to dispute and recover 15–35% more.",
  alternates: { canonical: "/underpaid-car-insurance-claim" },
  openGraph: {
    url: "/underpaid-car-insurance-claim",
    title: "Car Insurance Claim Underpaid? What to Do",
    description:
      "Most auto insurance first offers are 15–35% below what your policy covers. See the 5 signs your car claim was underpaid and how to dispute it today.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "Car Insurance Claim Underpaid? What to Do",
      description:
        "How to identify and dispute an underpaid car insurance claim, including signs of underpayment and step-by-step dispute instructions.",
      url: "https://claimgap.app/underpaid-car-insurance-claim",
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
          name: "How do I know if my car insurance claim was underpaid?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Compare the insurer's estimate against two or three independent body shop quotes. If the insurer's figure is more than 10% lower, the claim is likely underpaid. Also check for depreciation errors and missing line items like rental car coverage or diminished value.",
          },
        },
        {
          "@type": "Question",
          name: "Can I negotiate my car insurance settlement?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. You have the right to dispute any settlement offer in writing. Provide your own repair estimates, cite specific policy language, and request a formal re-evaluation. Most states require insurers to respond within 30 days.",
          },
        },
        {
          "@type": "Question",
          name: "What is diminished value on a car insurance claim?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Diminished value is the reduction in your car's resale value after an accident, even after full repairs. Most at-fault states allow you to claim this from the other driver's liability insurer. Many people never claim it — leaving hundreds or thousands on the table.",
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
        badge="Auto Insurance"
        h1="Car insurance claim underpaid? Here's what to do"
        answer="If your car insurance payout feels low, it probably is. Insurers' first settlement offers are routinely 15–35% below what policies actually cover — through depreciation errors, underpriced repair estimates, and ignored coverage clauses. You have the legal right to dispute, and most policyholders who do recover significantly more."
        signs={{
          heading: "Signs your car insurance claim is underpaid",
          items: [
            "The repair estimate is lower than two or more independent body shop quotes",
            "Depreciation was applied without a clear methodology or Actual Cash Value calculation",
            "Rental car reimbursement was capped below your policy limit",
            "Diminished value (resale loss after repair) was never offered",
            "OEM parts were replaced with aftermarket parts without your consent",
            "The total-loss valuation is below comparable vehicles in your area",
            "The insurer settled quickly and pressured you to accept within days",
          ],
        }}
        steps={{
          heading: "How to dispute an underpaid car insurance claim",
          items: [
            {
              n: "01",
              title: "Get two independent repair estimates",
              desc: "Visit two or three body shops and collect written estimates. A gap of more than 10% between their numbers and the insurer's figure is strong evidence of underpayment.",
            },
            {
              n: "02",
              title: "Pull your policy's exact coverage language",
              desc: "Find the clauses covering collision, comprehensive, rental reimbursement, and diminished value. Highlight every benefit the insurer ignored or underapplied.",
            },
            {
              n: "03",
              title: "Write a formal dispute letter",
              desc: "Address the insurer in writing, cite the specific policy clauses and dollar discrepancies, and demand a re-evaluation. Reference your state's insurance code if applicable.",
            },
            {
              n: "04",
              title: "Escalate if ignored",
              desc: "If the insurer doesn't respond within 30 days, file a complaint with your state's Department of Insurance. Regulators can compel a response and even mandate payment.",
            },
            {
              n: "05",
              title: "Use ClaimGap to find the exact gap",
              desc: "Upload your policy and settlement letter. ClaimGap's AI compares them clause by clause, calculates the dollar discrepancy, and drafts your dispute letter — in 90 seconds.",
            },
          ],
        }}
        stats={[
          { value: "20–40%", label: "Typical underpayment range" },
          { value: "30 days", label: "State deadline to respond" },
          { value: "90 sec", label: "ClaimGap analysis time" },
        ]}
        faqs={[
          {
            q: "How do I know if my car insurance claim was underpaid?",
            a: "Compare the insurer's estimate against two or three independent body shop quotes. If the gap is more than 10%, the claim is likely underpaid. Also check for depreciation errors and missing coverage like rental reimbursement or diminished value.",
          },
          {
            q: "Can I negotiate my car insurance settlement?",
            a: "Yes. You have the right to dispute any settlement offer in writing. Provide your own repair estimates, cite specific policy language, and request a formal re-evaluation. Most states require insurers to respond within 30 days.",
          },
          {
            q: "What is diminished value and can I claim it?",
            a: "Diminished value is the reduction in your car's resale value after an accident, even after repairs. Most at-fault states allow you to claim it from the at-fault driver's liability insurer. Many policyholders never claim it, leaving hundreds or thousands uncollected.",
          },
          {
            q: "How long do I have to dispute a car insurance settlement?",
            a: "Deadlines vary by state, but most statutes of limitations are 2–4 years from the date of loss. However, the sooner you dispute, the stronger your position — evidence is fresh and adjusters are still assigned.",
          },
        ]}
        cta={{
          heading: "See exactly how much your car insurer owes you",
          sub: "Upload your policy and settlement letter. ClaimGap's AI finds every underpaid dollar and drafts your dispute letter in 90 seconds.",
        }}
      />
    </>
  );
}
