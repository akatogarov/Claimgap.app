import { OutcomeForm } from "@/components/OutcomeForm";

export const metadata = {
  title: "Outcome — ClaimGap",
};

export default function OutcomePage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-12 md:px-6 md:py-16">
      <h1 className="font-display text-3xl font-medium text-ink">How did it go?</h1>
      <p className="mt-3 text-ink-muted">
        Quick follow-up (often sent ~7 days after your analysis). Your answers help us improve and
        stay accountable.
      </p>
      <OutcomeForm claimId={params.id} />
    </div>
  );
}
