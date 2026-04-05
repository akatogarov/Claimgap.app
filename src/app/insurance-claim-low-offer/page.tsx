import type { Metadata } from "next";
import { ClaimLandingPage } from "@/components/ClaimLandingPage";

export const metadata: Metadata = {
  title: "Insurance Offered Too Little? 5 Steps to Get a Fair Settlement",
  description:
    "Received a low insurance settlement offer? You don't have to accept it. Learn the 5 steps to negotiate a higher payout and what to do if the insurer refuses.",
  alternates: { canonical: "/insurance-claim-low-offer" },
  openGraph: {
    url: "/insurance-claim-low-offer",
    title: "Insurance Offered Too Little? 5 Steps to Get a Fair Settlement",
    description:
      "Most first insurance offers are below what your policy covers. Here's the proven process for negotiating a higher settlement — without a lawyer.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "Insurance Offered Too Little? 5 Steps to Get a Fair Settlement",
      description:
        "How to respond to a low insurance settlement offer and negotiate a higher payout using your policy language.",
      url: "https://claimgap.app/insurance-claim-low-offer",
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
          name: "What happens if I reject an insurance settlement offer?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Nothing bad automatically happens. Rejecting an offer starts a negotiation. The insurer cannot cancel your policy solely because you dispute a settlement. You remain in your policy and can continue the dispute process through internal appeal, appraisal, or state complaint.",
          },
        },
        {
          "@type": "Question",
          name: "Should I accept the first insurance settlement offer?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "In most cases, no. First offers are typically 15–40% below what policies cover. Once you sign a settlement release, you generally cannot reopen the claim. Always compare the offer against your policy's coverage language before signing.",
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
        badge="Low Settlement Offer"
        h1="Insurance offered too little? Here's how to negotiate a fair settlement"
        answer="Receiving a low insurance settlement offer doesn't mean you're stuck with it. Insurers build lowball offers into their process — expecting most policyholders to accept without checking. Your policy is a legal contract, and the insurer is obligated to pay exactly what it promises. If the offer doesn't match the coverage, you have every right to dispute in writing."
        signs={{
          heading: "Signs the settlement offer is too low",
          items: [
            "The offer arrived within days of filing — faster than a thorough investigation takes",
            "The adjuster couldn't explain how specific dollar amounts were calculated",
            "Your own repair or replacement estimates are significantly higher",
            "Certain damage categories or coverage line items are missing entirely",
            "The letter includes language pressuring you to 'accept quickly' or citing a deadline",
            "The offer is below the insurer's own previous settlement for similar claims",
            "You were told this is 'the maximum under your policy' without written documentation",
          ],
        }}
        steps={{
          heading: "5 steps to negotiate a higher insurance settlement",
          items: [
            {
              n: "01",
              title: "Don't sign anything yet",
              desc: "A signed release typically closes your claim permanently. Take time to review the offer against your policy before accepting or rejecting anything in writing.",
            },
            {
              n: "02",
              title: "Request a written breakdown of the calculation",
              desc: "Ask the adjuster to provide a line-by-line written explanation of how the settlement amount was calculated. Any missing line items or unexplained deductions are your leverage.",
            },
            {
              n: "03",
              title: "Compare your policy language word for word",
              desc: "Find every coverage clause relevant to your claim type. The insurer must honor the exact terms of your policy — if the language says 'replacement cost,' they cannot pay 'actual cash value.'",
            },
            {
              n: "04",
              title: "Submit a counter-offer in writing",
              desc: "Write a formal counter-offer letter citing specific policy clauses, your own estimates, and the exact dollar difference. Keep all communication in writing — phone calls are not binding.",
            },
            {
              n: "05",
              title: "Escalate to your state's Department of Insurance",
              desc: "If the insurer refuses to negotiate in good faith, file a complaint with your state regulator. Insurers take regulatory complaints seriously — it often resolves disputes within weeks.",
            },
          ],
        }}
        stats={[
          { value: "15–40%", label: "Typical first-offer gap" },
          { value: "30 days", label: "Average dispute resolution" },
          { value: "90 sec", label: "ClaimGap analysis time" },
        ]}
        faqs={[
          {
            q: "What happens if I reject an insurance settlement offer?",
            a: "Nothing bad automatically happens. Rejecting an offer starts a negotiation. The insurer cannot cancel your policy solely because you dispute a settlement. You remain in your policy and can continue the dispute process through internal appeal, appraisal, or state complaint.",
          },
          {
            q: "Should I accept the first insurance settlement offer?",
            a: "In most cases, no. First offers are typically 15–40% below what policies cover. Once you sign a settlement release, you generally cannot reopen the claim. Always compare the offer against your policy's coverage language before signing.",
          },
          {
            q: "How long does insurance settlement negotiation take?",
            a: "Most states require insurers to respond to a written dispute within 10–30 business days. If you invoke the appraisal clause, independent review typically takes 4–8 weeks. Filing a state complaint can accelerate the process significantly.",
          },
          {
            q: "Do I need a lawyer to dispute a low insurance offer?",
            a: "Not for most disputes. A well-written counter-offer letter citing your policy language and supported by independent estimates resolves the majority of underpayment disputes. Lawyers become necessary for very large claims, bad faith allegations, or litigation.",
          },
        ]}
        cta={{
          heading: "Find out exactly how much more you're owed",
          sub: "Upload your policy and settlement letter. ClaimGap's AI finds the gap and writes your counter-offer letter — ready to send in 90 seconds.",
        }}
      />
    </>
  );
}
