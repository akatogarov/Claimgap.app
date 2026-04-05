import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="print:hidden mt-12 border-t border-navy/10 bg-navy text-white">
      <div className="border-b border-white/10 px-4 py-4">
        <p className="mx-auto max-w-6xl text-center text-xs leading-relaxed text-white/75 md:px-6">
          <strong className="text-white">Not legal advice.</strong> ClaimGap provides informational analysis only — not
          legal, adjuster, or insurance advice. Consult a licensed attorney when you need legal guidance. Uploaded
          documents are encrypted and permanently deleted within 24 hours.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12 md:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="font-display text-lg font-medium text-white">ClaimGap</p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-white/60">
              Claim document analysis for policyholders. Informational use only. Not a law firm or licensed insurance
              adjuster.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm font-medium text-white/75">
            <Link href="/analyze" className="transition hover:text-white">
              Analyze
            </Link>
            <Link href="/access" className="transition hover:text-white">
              Access my report
            </Link>
            <Link href="/terms" className="transition hover:text-white">
              Terms of Service
            </Link>
            <Link href="/privacy" className="transition hover:text-white">
              Privacy Policy
            </Link>
            <a href="mailto:info@globaldeal.app" className="transition hover:text-white">
              Contact
            </a>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-8 text-xs text-white/45">
          <p>© {new Date().getFullYear()} GlobalDeal Inc. All rights reserved.</p>
          <p className="mt-2 max-w-2xl leading-relaxed">
            Results are not a guarantee of recovery. Accuracy depends on the documents you provide. See{" "}
            <Link href="/terms" className="underline decoration-white/30 underline-offset-2 hover:text-white">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline decoration-white/30 underline-offset-2 hover:text-white">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
