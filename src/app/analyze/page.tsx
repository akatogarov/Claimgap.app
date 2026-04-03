import { AnalyzeForm } from "@/components/AnalyzeForm";

export const metadata = {
  title: "Check your claim — ClaimGap",
};

export default function AnalyzePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <div className="mb-6 inline-flex items-center gap-2 border border-rust/30 bg-rust-faint px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-rust">
        Free preview — see results before you pay
      </div>
      <h1 className="font-display text-3xl font-medium tracking-tight text-ink md:text-4xl">
        Check if you&apos;re being underpaid
      </h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-muted">
        Three quick steps: pick your claim type, upload your documents, and enter your email. We read what you upload and show where the numbers may not match your paperwork.
      </p>
      <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-muted">
        <span className="flex items-center gap-2">
          <span className="text-rust font-bold" aria-hidden>→</span>
          About two minutes to upload
        </span>
        <span className="flex items-center gap-2">
          <span className="text-rust font-bold" aria-hidden>→</span>
          PDFs deleted within 24h
        </span>
        <span className="flex items-center gap-2">
          <span className="text-rust font-bold" aria-hidden>→</span>
          Free preview · No card until you see results
        </span>
      </div>
      <AnalyzeForm />
    </div>
  );
}
