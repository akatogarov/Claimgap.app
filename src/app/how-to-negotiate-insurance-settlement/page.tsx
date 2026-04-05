import type { Metadata } from "next";
import { ClaimLandingPage } from "@/components/ClaimLandingPage";

export const metadata: Metadata = {
  title: "How to Negotiate an Insurance Settlement (Step-by-Step Guide)",
  description:
    "A step-by-step guide to negotiating a higher insurance settlement. Learn how to use your policy language, independent estimates, and formal dispute letters to maximize your payout.",
  alternates: { canonical: "/how-to-negotiate-insurance-settlement" },
  openGraph: {
    url: "/how-to-negotiate-insurance-settlement",
    title: "How to Negotiate an Insurance Settlement (Step-by-Step Guide)",
    description:
      "Most policyholders accept the first offer. The ones who negotiate receive 20–40% more. Here's exactly how to do it.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "HowTo",
      name: "How to Negotiate an Insurance Settlement",
      description:
        "A step-by-step process for disputing and negotiating a higher insurance settlement using policy language and independent evidence.",
      url: "https://claimgap.app/how-to-negotiate-insurance-settlement",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Review your policy coverage language",
          text: "Read every coverage clause relevant to your claim type. Highlight language about replacement cost, coverage limits, exclusions, and dispute rights.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Get independent estimates",
          text: "Collect two or three written estimates from independent contractors, body shops, or appraisers. These establish the true market value of your loss.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Calculate the exact dollar gap",
          text: "Compare the insurer's offer against your independent estimates and policy entitlements line by line. Document every discrepancy with a specific dollar amount.",
        },
        {
          "@type": "HowToStep",
          position: 4,
          name: "Submit a written counter-offer",
          text: "Write a formal dispute letter citing specific policy clauses, your independent estimates, and the total underpayment amount. Request a written response.",
        },
        {
          "@type": "HowToStep",
          position: 5,
          name: "Escalate if necessary",
          text: "If the insurer doesn't respond fairly, invoke the policy's appraisal clause or file a complaint with your state's Department of Insurance.",
        },
      ],
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
          name: "Can you negotiate with insurance companies?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. Insurance settlement offers are not final. You can negotiate by submitting a written counter-offer with supporting documentation. Policyholders who negotiate formally recover an average of 20–40% more than those who accept the first offer.",
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
        badge="Settlement Negotiation"
        h1="How to negotiate an insurance settlement — step by step"
        answer="Insurance settlement offers are negotiable. Policyholders who submit a written counter-offer with supporting documentation recover an average of 20–40% more than those who accept the first offer. The key is knowing what your policy actually promises — and presenting the discrepancy clearly in writing. You don't need a lawyer for most disputes."
        signs={{
          heading: "Situations where negotiating almost always pays off",
          items: [
            "The insurer's repair or replacement estimate is lower than independent quotes",
            "Depreciation was applied but your policy guarantees replacement cost",
            "The offer excludes coverage you can find explicitly in your policy",
            "The insurer settled quickly — within days of filing — without a full inspection",
            "The adjuster's explanation of deductions is vague or impossible to verify",
            "Your state has a 'bad faith' insurance statute (most do) that protects you from lowball tactics",
            "Similar past claims in your area settled for significantly higher amounts",
          ],
        }}
        steps={{
          heading: "How to negotiate an insurance settlement",
          items: [
            {
              n: "01",
              title: "Know your policy before you talk numbers",
              desc: "Read every coverage section relevant to your claim. The insurer's obligation is defined by the policy text — not by the adjuster's verbal explanation. Highlight any clause that the settlement appears to ignore.",
            },
            {
              n: "02",
              title: "Build your evidence base",
              desc: "Collect independent repair estimates, replacement quotes, medical bills, loss documentation, and photos. Two or three independent sources are more persuasive than one.",
            },
            {
              n: "03",
              title: "Calculate the gap precisely",
              desc: "Compare the insurer's offer against your total documented loss, line by line. A specific dollar figure (e.g., '$4,200 below policy entitlement') is far more effective than a general complaint.",
            },
            {
              n: "04",
              title: "Write a formal counter-offer letter",
              desc: "Address the insurer in writing. State the specific coverage clauses, cite your evidence, and request the exact amount you're owed. Written disputes create a paper trail that protects you.",
            },
            {
              n: "05",
              title: "Invoke appraisal or file a complaint if stuck",
              desc: "Most policies include an appraisal clause as an alternative to litigation. If that fails, a complaint to your state's Department of Insurance typically produces a response within 30 days.",
            },
          ],
        }}
        stats={[
          { value: "20–40%", label: "Average negotiated increase" },
          { value: "80%+", label: "Disputes resolved without lawyers" },
          { value: "90 sec", label: "ClaimGap analysis time" },
        ]}
        faqs={[
          {
            q: "Can you negotiate with insurance companies?",
            a: "Yes. Settlement offers are not final. You can submit a written counter-offer with supporting documentation at any time before signing a release. Policyholders who negotiate formally recover 20–40% more on average.",
          },
          {
            q: "What evidence is most effective in an insurance settlement negotiation?",
            a: "Independent professional estimates carry the most weight, followed by specific policy language citations and a clear dollar-by-dollar breakdown of the discrepancy. Vague complaints are easy to dismiss; specific evidence with dollar amounts is not.",
          },
          {
            q: "How many times can you negotiate an insurance settlement?",
            a: "There's no legal limit on rounds of negotiation before you sign a release. You can counter-offer multiple times. Once you sign a final release, however, the claim is closed — so don't sign until you're satisfied.",
          },
          {
            q: "Is it worth hiring a public adjuster to negotiate?",
            a: "For large or complex claims (over $20,000), a public adjuster's expertise can be worth their 10–15% fee. For smaller disputes, a well-documented written counter-offer is usually sufficient and costs nothing.",
          },
        ]}
        cta={{
          heading: "Get your counter-offer letter written in 90 seconds",
          sub: "Upload your policy and settlement letter. ClaimGap finds the exact clause-by-clause gap and drafts your counter-offer letter — ready to send today.",
        }}
      />
    </>
  );
}
