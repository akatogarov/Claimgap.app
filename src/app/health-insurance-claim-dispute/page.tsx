import type { Metadata } from "next";
import { ClaimLandingPage } from "@/components/ClaimLandingPage";

export const metadata: Metadata = {
  title: "Health Insurance Claim Denied or Underpaid? Your Appeal Rights",
  description:
    "Health insurers deny or underpay millions of claims every year — and most people never appeal. Learn how to dispute a low EOB, denied procedure, or underpaid medical bill.",
  alternates: { canonical: "/health-insurance-claim-dispute" },
  openGraph: {
    url: "/health-insurance-claim-dispute",
    title: "Health Insurance Claim Denied or Underpaid? Your Appeal Rights",
    description:
      "42% of appealed health insurance denials are overturned. Learn the exact steps to dispute your EOB or denial notice today.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: "Health Insurance Claim Denied or Underpaid? Your Appeal Rights",
      description:
        "A guide to disputing denied or underpaid health insurance claims, including internal appeals and external reviews.",
      url: "https://claimgap.app/health-insurance-claim-dispute",
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
          name: "What percentage of health insurance appeals are successful?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Studies show that 42–60% of health insurance claim appeals that reach an external review are decided in the patient's favor. Most people never appeal — which is exactly what insurers count on.",
          },
        },
        {
          "@type": "Question",
          name: "How long do I have to appeal a health insurance denial?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Under the ACA, most plans must allow at least 180 days (6 months) to file an internal appeal from the date you receive the denial notice. After exhausting internal appeals, you can request an independent external review within 4 months.",
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
        badge="Health Insurance"
        h1="Health insurance claim denied or underpaid? Your appeal rights"
        answer="Health insurers deny or underpay approximately 17% of claims — and more than 99% of policyholders never appeal. Of the ones who do, 42–60% win. If your explanation of benefits (EOB) shows a payment lower than your medical bills, or a service was denied outright, you have a federally protected right to appeal. Deadlines are real: most ACA plans require you to file an internal appeal within 180 days."
        signs={{
          heading: "Signs your health insurance claim was underpaid or wrongly denied",
          items: [
            "Your EOB shows the insurer paid less than your provider's negotiated rate",
            "A procedure was denied as 'not medically necessary' despite your doctor's documentation",
            "Out-of-network charges were applied when the provider is actually in-network",
            "Prescription drug coverage was denied based on a formulary exclusion",
            "A prior authorization was granted but payment was still denied",
            "Your deductible or out-of-pocket calculation appears incorrect",
            "A claim was denied after a billing code error — not a medical review",
          ],
        }}
        steps={{
          heading: "How to appeal a denied or underpaid health insurance claim",
          items: [
            {
              n: "01",
              title: "Request the denial reason in writing",
              desc: "Call the insurer and ask for the specific reason code and clinical criteria used to deny or reduce your claim. You are legally entitled to this information.",
            },
            {
              n: "02",
              title: "Gather supporting medical records",
              desc: "Ask your doctor for a letter of medical necessity, lab results, treatment notes, and any prior authorization approvals. This forms the medical basis of your appeal.",
            },
            {
              n: "03",
              title: "File an internal appeal",
              desc: "Submit a written internal appeal within your plan's deadline (usually 180 days). Reference the specific policy section and include all supporting documentation.",
            },
            {
              n: "04",
              title: "Request an external independent review",
              desc: "If the internal appeal fails, request an Independent Medical Review (IMR) or External Review. An independent reviewer — not employed by the insurer — makes the final decision. This process is free under the ACA.",
            },
            {
              n: "05",
              title: "File a state insurance complaint",
              desc: "File a complaint with your state's Department of Insurance. Regulators track complaint patterns and can pressure insurers to resolve disputes quickly.",
            },
          ],
        }}
        stats={[
          { value: "42–60%", label: "External appeals overturned" },
          { value: "180 days", label: "Typical appeal deadline" },
          { value: "90 sec", label: "ClaimGap analysis time" },
        ]}
        faqs={[
          {
            q: "What percentage of health insurance appeals are successful?",
            a: "Studies show that 42–60% of health insurance claim appeals that reach an external review are decided in the patient's favor. Most people never appeal — which is exactly what insurers count on.",
          },
          {
            q: "How long do I have to appeal a health insurance denial?",
            a: "Under the ACA, most plans must allow at least 180 days (6 months) to file an internal appeal from the date you receive the denial notice. After exhausting internal appeals, you have 4 months to request an independent external review.",
          },
          {
            q: "What is an Explanation of Benefits (EOB)?",
            a: "An EOB is a statement from your insurer showing what a medical claim cost, what they paid, and what you owe. It is not a bill — but comparing it against your actual medical bills often reveals underpayment or incorrect cost-sharing calculations.",
          },
          {
            q: "Can I dispute a health insurance claim myself?",
            a: "Yes. You do not need a lawyer or patient advocate for most appeals. A clear written appeal with supporting medical documentation — especially a physician's letter of medical necessity — is often sufficient for internal appeals.",
          },
        ]}
        cta={{
          heading: "Don't let a denial stand — check your health insurance claim",
          sub: "Upload your policy and denial letter. ClaimGap's AI identifies the exact grounds for dispute and drafts your appeal letter in 90 seconds.",
        }}
      />
    </>
  );
}
