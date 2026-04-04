export const metadata = {
  title: "Terms of Service — ClaimGap",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="font-display text-3xl font-medium text-ink md:text-4xl">Terms of Service</h1>
      <p className="mt-3 text-ink-muted">Effective date: April 2026 · GlobalDeal Inc.</p>

      <div className="mt-10 space-y-10 text-ink">
        {/* ── 1. Service description ─────────────────────────── */}
        <section>
          <h2 className="font-display text-xl font-medium text-navy">1. What ClaimGap does</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            <p>
              ClaimGap is an <strong>informational analysis tool</strong>. It uses AI to compare
              your insurance policy document against a settlement offer, identify potential
              coverage gaps, and generate a draft counter-offer letter for your review.
            </p>
            <p>
              The product may be used with common personal-lines claims (for example auto, homeowners,
              and health benefit disputes). In the United States, insurance is regulated primarily at
              the state level; health coverage can also involve federal rules. ClaimGap does not sell
              insurance or perform services that require an insurance producer license, public
              adjuster license, or legal licensure.
            </p>
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-900">
              <p className="font-bold">ClaimGap is NOT:</p>
              <ul className="mt-2 space-y-1">
                <li>• A law firm or attorney and does not provide legal advice</li>
                <li>• A licensed public adjuster or insurance adjuster in any state</li>
                <li>• A financial or insurance advisor</li>
                <li>• A guarantee of any recovery or outcome</li>
              </ul>
              <p className="mt-3">
                Always consult a licensed attorney or public adjuster for legal or regulatory guidance
                specific to your situation.
              </p>
            </div>
          </div>
        </section>

        {/* ── 2. Payment & refunds ───────────────────────────── */}
        <section>
          <h2 className="font-display text-xl font-medium text-navy">2. Payment and refund policy</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            <p>
              The current price for a full analysis is <strong>$149 USD</strong>, charged as a
              one-time payment at the time of purchase. No subscription is created.
            </p>
            <p>
              <strong>Satisfaction guarantee:</strong> If the full report identifies no material
              underpayment gap in your claim, you are entitled to a full refund. Email{" "}
              <a href="mailto:info@globaldeal.app" className="text-navy underline">
                info@globaldeal.app
              </a>{" "}
              within 30 days of purchase with your claim ID. We will review and process eligible
              refunds within 5 business days.
            </p>
            <p>
              Refunds are not available for reports where an underpayment gap was identified,
              regardless of whether you ultimately recover additional funds from your insurer.
              Recovery outcomes depend entirely on your negotiations with your insurer.
            </p>
            <p>
              All payments are processed by Stripe. ClaimGap does not store your payment card
              details.
            </p>
          </div>
        </section>

        {/* ── 3. Accuracy and limitations ───────────────────── */}
        <section>
          <h2 className="font-display text-xl font-medium text-navy">3. Accuracy and limitations</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            <p>
              Our AI analysis is based solely on the documents you upload. The quality and
              completeness of your policy PDF and settlement letter directly affect the accuracy
              of the output.
            </p>
            <p>
              ClaimGap AI is instructed to reference only text present in your uploaded documents.
              However, <strong>AI systems can make errors</strong>, misinterpret ambiguous policy
              language, or fail to identify all relevant clauses. You should independently verify
              any specific policy language or dollar amounts cited in the report.
            </p>
            <p>
              The probability score and gap estimates are illustrative and should not be treated as
              a guarantee of recovery. Actual outcomes depend on your insurer, state law, and
              negotiation strategy.
            </p>
          </div>
        </section>

        {/* ── 4. Acceptable use ─────────────────────────────── */}
        <section>
          <h2 className="font-display text-xl font-medium text-navy">4. Acceptable use</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            <p>You agree to use ClaimGap only for lawful purposes and only with:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Insurance policy documents to which you are a named insured or authorized representative</li>
              <li>Settlement letters or explanation-of-benefits documents issued to you</li>
            </ul>
            <p>
              You may not use ClaimGap to analyze documents belonging to other parties without
              their written authorization, to generate fraudulent counter-offer letters, or for any
              purpose that violates applicable law.
            </p>
          </div>
        </section>

        {/* ── 5. Data handling ──────────────────────────────── */}
        <section>
          <h2 className="font-display text-xl font-medium text-navy">5. Data handling and deletion</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            <p>
              <strong>Document deletion:</strong> Your uploaded PDF files (policy and settlement
              letter) are stored in encrypted form solely for the purpose of AI analysis. They are
              permanently deleted from our servers within 24 hours of upload, regardless of whether
              you complete payment.
            </p>
            <p>
              <strong>Analysis results:</strong> The structured analysis output (gap estimates,
              counter-offer letter text, etc.) is retained in our database to enable you to access
              your report and to improve our aggregate analysis models over time. This data is
              anonymized before any aggregation.
            </p>
            <p>
              <strong>Your email address</strong> is retained to deliver your report and optional
              outcome follow-up emails. It is never sold to third parties. See our{" "}
              <a href="/privacy" className="text-navy underline">
                Privacy Policy
              </a>{" "}
              for full details.
            </p>
          </div>
        </section>

        {/* ── 6. Limitation of liability ────────────────────── */}
        <section>
          <h2 className="font-display text-xl font-medium text-navy">6. Limitation of liability</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            <p>
              To the maximum extent permitted by law, ClaimGap and GlobalDeal Inc. are not liable
              for:
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Any failure to recover additional insurance funds</li>
              <li>Decisions made by you or your insurer based on the analysis</li>
              <li>Inaccuracies in the AI analysis resulting from incomplete or ambiguous documents</li>
              <li>Any consequential, indirect, or punitive damages arising from use of this service</li>
            </ul>
            <p>
              Our maximum aggregate liability to you for any claim arising from your use of
              ClaimGap shall not exceed the amount you paid for the specific analysis at issue
              ($149).
            </p>
          </div>
        </section>

        {/* ── 7. Governing law ──────────────────────────────── */}
        <section>
          <h2 className="font-display text-xl font-medium text-navy">7. Governing law</h2>
          <div className="mt-4 text-sm leading-relaxed">
            <p>
              These Terms are governed by the laws of the State of Delaware, United States, without
              regard to conflict of law principles. Any dispute arising under these Terms shall be
              resolved through binding arbitration under the rules of the American Arbitration
              Association, except that either party may seek injunctive relief in a court of
              competent jurisdiction for violations of intellectual property rights.
            </p>
          </div>
        </section>

        {/* ── 8. Changes ────────────────────────────────────── */}
        <section>
          <h2 className="font-display text-xl font-medium text-navy">8. Changes to these Terms</h2>
          <div className="mt-4 text-sm leading-relaxed">
            <p>
              We may update these Terms from time to time. Material changes will be notified via
              email to registered users. Continued use of ClaimGap after changes constitutes
              acceptance of the revised Terms.
            </p>
          </div>
        </section>

        {/* ── Contact ───────────────────────────────────────── */}
        <section className="rounded-xl border border-navy/10 bg-slate-50 px-5 py-4">
          <h2 className="font-display text-xl font-medium text-navy">Questions?</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Email us at{" "}
            <a href="mailto:info@globaldeal.app" className="text-navy underline">
              info@globaldeal.app
            </a>
            . We typically respond within 1–2 business days.
          </p>
        </section>
      </div>
    </div>
  );
}
