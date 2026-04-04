import { ResultClient } from "@/components/ResultClient";

export const runtime = 'edge';

export const metadata = {
  title: "Your analysis — ClaimGap",
};

export default function ResultPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { session_id?: string };
}) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 md:px-6 md:py-16">
      <ResultClient claimId={params.id} sessionId={searchParams.session_id} />
    </div>
  );
}
