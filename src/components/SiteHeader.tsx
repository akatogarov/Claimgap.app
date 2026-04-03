import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="print:hidden border-b border-navy/10 bg-white/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link href="/" className="font-display text-xl font-medium tracking-tight text-navy">
          ClaimGap
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm font-semibold text-ink-muted md:gap-2">
          <Link
            href="/#how"
            className="rounded-md px-3 py-2 transition hover:bg-navy/5 hover:text-navy"
          >
            How it works
          </Link>
          <Link
            href="/#pricing"
            className="rounded-md px-3 py-2 transition hover:bg-navy/5 hover:text-navy"
          >
            Pricing
          </Link>
          <Link
            href="/analyze"
            className="ml-1 rounded-lg bg-navy px-4 py-2.5 text-white transition hover:bg-navy-800"
          >
            Check my claim
          </Link>
        </nav>
      </div>
    </header>
  );
}
