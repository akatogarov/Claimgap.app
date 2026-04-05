import type { Metadata } from "next";
import { ClaimLandingPage } from "@/components/ClaimLandingPage";

export const metadata: Metadata = {
  title: "Should I Accept the Insurance Settlement Offer? When to Say No",
  description:
    "Not sure whether to accept your insurance settlement? Learn the 7 questions to ask before signing, and what accepting too early could cost you.",
  alternates: { canonical: "/should-i-accept-insurance-settlement" },
  openGraph: {
    url: "/should-i-accept-insurance-settlement",
    title: "Should I Accept the Insurance Settlement Offer? When to Say No",
    description:
      "Once you sign a settlement release, you can't reopen the claim. Ask these 7 questions before you accept any insurance offer.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "Should I Accept the Insurance Settlement Offer? When to Say No",
      description:
        "A guide to evaluating an insurance settlement offer before signing, including key questions and red flags to consider.",
      url: "https://claimgap.app/should-i-accept-insurance-settlement",
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
          name: "What happens after you accept an insurance settlement?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "After you sign a settlement release, the claim is closed. In most cases you cannot reopen it or request additional payment, even if you discover new damage later. This is why evaluating the offer carefully before signing is critical.",
          },
        },
        {
          "@type": "Question",
          name: "Can you reopen an insurance claim after settlement?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Generally no. Once you sign a final release, the claim is closed. Some exceptions exist for fraud or if the release contained a material error, but these are rare and difficult to prove. Never sign until you are fully satisfied with the settlement.",
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
        badge="Settlement Decision"
        h1="Should I accept the insurance settlement offer? 7 questions to ask first"
        answer="Once you sign an insurance settlement release, your claim is closed — permanently. Most people accept the first offer without knowing they had the right to more. Before you sign anything, check whether the offer actually matches your policy's coverage. If it doesn't, you have every right to push back. The questions below take under five minutes to answer and could be worth thousands."
        signs={{
          heading: "7 questions to ask before accepting any insurance settlement",
          items: [
            "Does the settlement amount match what your policy's coverage language promises?",
            "Is the offer based on Replacement Cost Value — or the lower Actual Cash Value?",
            "Have all categories of covered loss been included (not just the most obvious damage)?",
            "Do two or more independent estimates agree with the insurer's dollar figures?",
            "Was the settlement offer made within days — before a full investigation was possible?",
            "Is there a release clause in the acceptance paperwork closing the claim permanently?",
            "Have you checked whether your state gives you additional protections under insurance codes?",
          ],
        }}
        steps={{
          heading: "How to evaluate an insurance settlement offer",
          items: [
            {
              n: "01",
              title: "Read the settlement release carefully",
              desc: "The acceptance document often contains a release clause that permanently closes your claim. Don't sign anything until you understand exactly what rights you're waiving.",
            },
            {
              n: "02",
              title: "Compare the offer against your policy",
              desc: "Find the coverage sections relevant to your claim. The insurer must honor the policy's exact terms. If the offer is less than what the policy language promises, it's underpaid.",
            },
            {
              n: "03",
              title: "Get independent estimates before deciding",
              desc: "For property or auto claims, get written estimates from two or three independent contractors or appraisers. If their numbers are significantly higher, do not accept the offer.",
            },
            {
              n: "04",
              title: "Check for hidden concessions in the paperwork",
              desc: "Some settlement letters ask you to waive future claims for related damage not yet discovered. If your repairs might reveal additional damage (like water damage behind walls), wait until work is complete.",
            },
            {
              n: "05",
              title: "If in doubt, dispute first — then accept",
              desc: "You lose nothing by submitting a written dispute before accepting. If the insurer's re-evaluation confirms the original offer, you can accept then. If they increase it, you've recovered more money.",
            },
          ],
        }}
        stats={[
          { value: "85%", label: "Who accept without checking" },
          { value: "$4,200", label: "Average underpayment found" },
          { value: "90 sec", label: "ClaimGap analysis time" },
        ]}
        faqs={[
          {
            q: "What happens after you accept an insurance settlement?",
            a: "After you sign a settlement release, the claim is closed. In most cases you cannot reopen it or request additional payment, even if you discover new damage later. This is why evaluating the offer carefully before signing is critical.",
          },
          {
            q: "Can you reopen an insurance claim after settlement?",
            a: "Generally no. Once you sign a final release, the claim is closed. Some exceptions exist for fraud or material errors in the release, but these are rare and difficult to prove. Never sign until you are fully satisfied.",
          },
          {
            q: "How long do I have to decide whether to accept an insurance settlement?",
            a: "The insurer cannot force you to accept immediately. Take the time you need to compare the offer against your policy and independent estimates. Most state insurance codes prohibit pressure tactics. Deadlines only apply to reopening a closed claim — not to your initial decision.",
          },
          {
            q: "Is a verbal agreement on a settlement binding?",
            a: "Generally no. A settlement is binding when you sign a written release. Verbal agreements or verbal acceptance over the phone rarely constitute a final settlement. Always get the full terms in writing before agreeing to anything.",
          },
        ]}
        cta={{
          heading: "Check your offer before you sign — it takes 90 seconds",
          sub: "Upload your policy and settlement letter. ClaimGap's AI tells you whether the offer matches your coverage and exactly how much more you're entitled to.",
        }}
      />
    </>
  );
}
