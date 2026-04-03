import { PreviewClient } from "@/components/PreviewClient";

export const runtime = "edge";

export const metadata = {
  title: "Preview — ClaimGap",
};

export default function PreviewPage({ params }: { params: { id: string } }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
      <PreviewClient claimId={params.id} />
    </div>
  );
}
