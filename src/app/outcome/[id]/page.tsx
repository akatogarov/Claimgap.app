import { OutcomeForm } from "@/components/OutcomeForm";

export const runtime = 'edge';

export const metadata = {
  title: "Outcome — ClaimGap",
};

export default function OutcomePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { step?: string; answer?: string };
}) {
  const step = searchParams.step;
  const answer = searchParams.answer;

  const heading =
    step === "letter"
      ? "One quick question about your report"
      : step === "result"
        ? "How did your dispute go?"
        : "How did it go?";

  const sub =
    step === "letter"
      ? "Takes 5 seconds. Your answer helps us improve ClaimGap."
      : step === "result"
        ? "Your outcome helps us understand what works — and improve our reports."
        : "Quick follow-up on your ClaimGap report. Your answers help us improve and stay accountable.";

  return (
    <div className="mx-auto max-w-lg px-4 py-12 md:px-6 md:py-16">
      <h1 className="font-display text-3xl font-medium text-ink">{heading}</h1>
      <p className="mt-3 text-ink-muted">{sub}</p>
      <OutcomeForm claimId={params.id} step={step} answer={answer} />
    </div>
  );
}
