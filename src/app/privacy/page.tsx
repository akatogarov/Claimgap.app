export const metadata = {
  title: "Privacy Policy — ClaimGap",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <h1 className="font-display text-3xl font-medium text-ink md:text-4xl">Privacy Policy</h1>
      <p className="mt-3 text-ink-muted">Effective date: April 2026 · GlobalDeal Inc.</p>

      <div className="mt-10 space-y-10 text-ink">
        {/* ── 1. What we collect ────────────────────────────── */}
        <section>
          <h2 className="font-display text-xl font-medium text-navy">1. What we collect and why</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-navy/10">
            <table className="w-full text-sm">
              <thead className="bg-paper text-xs font-semibold uppercase text-ink-faint">
                <tr>
                  <th className="px-4 py-3 text-left">Data</th>
                  <th className="px-4 py-3 text-left">Why we collect it</th>
                  <th className="px-4 py-3 text-left">Deleted when?</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/10">
                {[
                  [
                    "Email address",
                    "Deliver your report, send optional outcome follow-ups",
                    "On request (see Section 5)",
                  ],
                  [
                    "Insurance policy PDF",
                    "AI analysis only — never stored beyond 24 hours",
                    "Within 24 hours of upload",
                  ],
                  [
                    "Settlement letter PDF",
                    "AI analysis only — never stored beyond 24 hours",
                    "Within 24 hours of upload",
                  ],
                  [
                    "Claim description & metadata (insurer, state, claim type, offer amount)",
                    "Improve analysis quality; build anonymized outcome database",
                    "On request or account deletion",
                  ],
                  [
                    "Analysis output (gap estimates, letter text)",
                    "Deliver your report; retained for re-access",
                    "On request or account deletion",
                  ],
                  [
                    "Payment information",
                    "Processed by Stripe — we never see your card number",
                    "Stripe manages retention",
                  ],
                ].map(([data, why, when]) => (
                  <tr key={data}>
                    <td className="px-4 py-3 text-xs font-medium text-ink">{data}</td>
                    <td className="px-4 py-3 text-xs text-ink-muted">{why}</td>
                    <td className="px-4 py-3 text-xs text-ink-muted">{when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 2. Document deletion ──────────────────────────── */}
        <section>
          <h2 className="font-display text-xl font-medium text-navy">2. Your documents are deleted in 24 hours</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            <p>
              Your insurance policy PDF and settlement letter are uploaded to encrypted storage
              (Supabase, hosted in the United States) solely for AI processing. After the analysis
              completes — and in any case within <strong>24 hours of upload</strong> — both files
              are permanently deleted. They cannot be recovered after deletion.
            </p>
            <p>
              The AI provider (Anthropic) processes your document text via its API.{" "}
              <strong>
                Anthropic does not use API-submitted content to train its models
              </strong>
              , per Anthropic&apos;s data usage policy.
            </p>
          </div>
        </section>

        {/* ── 3. How we use your data ───────────────────────── */}
        <section>
          <h2 className="font-display text-xl font-medium text-navy">3. How we use your data</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            <p>We use your data to:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Perform the AI analysis and generate your report</li>
              <li>Deliver your report by email</li>
              <li>Send optional outcome follow-up emails (7, 14, and 30 days post-purchase)</li>
              <li>
                Build an anonymized aggregate outcome database (insurer + state + claim type +
                resolution outcome) to improve future analysis quality — no personal identifiers
                are included
              </li>
            </ul>
            <p>
              We <strong>do not</strong> sell, rent, or share your personal information with third
              parties for marketing purposes.
            </p>
          </div>
        </section>

        {/* ── 4. Third-party services ───────────────────────── */}
        <section>
          <h2 className="font-display text-xl font-medium text-navy">4. Third-party services</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-navy/10">
            <table className="w-full text-sm">
              <thead className="bg-paper text-xs font-semibold uppercase text-ink-faint">
                <tr>
                  <th className="px-4 py-3 text-left">Service</th>
                  <th className="px-4 py-3 text-left">Purpose</th>
                  <th className="px-4 py-3 text-left">What they receive</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy/10">
                {[
                  ["Supabase", "Database & file storage", "Encrypted files and claim metadata"],
                  ["Anthropic (Claude API)", "AI analysis", "Document text (not trained on)"],
                  ["Stripe", "Payment processing", "Payment card details — we never see them"],
                  ["Resend", "Email delivery", "Your email address and report link"],
                  ["Vercel / Cloudflare", "Hosting & CDN", "Request logs (standard)"],
                ].map(([service, purpose, receives]) => (
                  <tr key={service}>
                    <td className="px-4 py-3 text-xs font-medium text-ink">{service}</td>
                    <td className="px-4 py-3 text-xs text-ink-muted">{purpose}</td>
                    <td className="px-4 py-3 text-xs text-ink-muted">{receives}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── 5. Your rights ────────────────────────────────── */}
        <section>
          <h2 className="font-display text-xl font-medium text-navy">5. Your rights (CCPA / GDPR)</h2>
          <div className="mt-4 space-y-3 text-sm leading-relaxed">
            <p>You have the right to:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>
                <strong>Access:</strong> Request a copy of the data we hold about you
              </li>
              <li>
                <strong>Deletion:</strong> Request deletion of your email address and associated
                claim records at any time
              </li>
              <li>
                <strong>Opt-out of outcome emails:</strong> Unsubscribe from follow-up emails via
                the link in any email we send
              </li>
              <li>
                <strong>Non-discrimination:</strong> We will not deny service or charge different
                prices based on the exercise of privacy rights
              </li>
            </ul>
            <p>
              To exercise any of these rights, email{" "}
              <a href="mailto:support@claimgap.app" className="text-navy underline">
                support@claimgap.app
              </a>{" "}
              with &quot;Privacy Request&quot; in the subject line. We will respond within 10 business days.
            </p>
          </div>
        </section>

        {/* ── 6. Cookies ────────────────────────────────────── */}
        <section>
          <h2 className="font-display text-xl font-medium text-navy">6. Cookies</h2>
          <div className="mt-4 text-sm leading-relaxed">
            <p>
              ClaimGap uses minimal cookies: one HTTP-only session cookie for admin authentication
              purposes only. We do not use advertising cookies, tracking pixels, or third-party
              analytics cookies.
            </p>
          </div>
        </section>

        {/* ── 7. Security ───────────────────────────────────── */}
        <section>
          <h2 className="font-display text-xl font-medium text-navy">7. Security</h2>
          <div className="mt-4 text-sm leading-relaxed">
            <p>
              All data is transmitted over HTTPS. Uploaded files are stored with encryption at
              rest. We enforce the principle of minimal data retention — documents are deleted
              within 24 hours and we store only what is necessary to deliver and improve the
              service. In the event of a data breach affecting your personal information, we will
              notify affected users within 72 hours.
            </p>
          </div>
        </section>

        {/* ── 8. Contact ────────────────────────────────────── */}
        <section className="rounded-lg border border-navy/10 bg-paper px-5 py-4">
          <h2 className="font-display font-medium text-navy">Privacy questions or requests</h2>
          <p className="mt-2 text-sm text-ink-muted">
            Contact us at{" "}
            <a href="mailto:support@claimgap.app" className="text-navy underline">
              support@claimgap.app
            </a>{" "}
            — subject line: &quot;Privacy Request&quot;.
            <br />
            GlobalDeal Inc. · Wilmington, Delaware, United States
          </p>
        </section>
      </div>
    </div>
  );
}
