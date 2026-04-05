import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { runFullAnalysis, defaultExtractedFacts } from "@/lib/anthropic";
import { normalizeInsurer } from "@/lib/normalize-insurer";
import type { FullAnalysis, StoredAnalysis } from "@/lib/types";

export const runtime = 'edge';

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  // Verify admin
  const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const session = await verifyAdminToken(token);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const claimId = params.id;
  const supabase = getServiceSupabase();

  const { data: claim, error: fetchErr } = await supabase
    .from("claims")
    .select("*")
    .eq("id", claimId)
    .single();

  if (fetchErr || !claim) {
    return NextResponse.json({ error: "Claim not found" }, { status: 404 });
  }

  // If already paid just return success (idempotent)
  if (claim.status === "paid") {
    return NextResponse.json({ ok: true, already_paid: true });
  }

  const analysis = claim.analysis as StoredAnalysis | null;
  const extracted = analysis?.extracted;
  if (!extracted?.policy_text || !extracted?.settlement_text) {
    return NextResponse.json({ error: "Missing extracted documents — upload docs first." }, { status: 400 });
  }

  const facts = analysis?.extracted_facts ?? defaultExtractedFacts();
  const offerAmt = Number(claim.offer_amount ?? 0) || 0;

  let full: FullAnalysis;
  try {
    full = await runFullAnalysis(
      extracted.policy_text,
      extracted.settlement_text,
      extracted.optional_context ?? "",
      facts,
      offerAmt
    );
  } catch (e) {
    console.error("test-payment full analysis failed:", e);
    await supabase.from("claims").update({ status: "failed" }).eq("id", claimId);
    return NextResponse.json({ error: "Full analysis failed" }, { status: 500 });
  }

  const paidAt = new Date().toISOString();
  const nextAnalysis: StoredAnalysis = {
    preview: analysis?.preview ?? null,
    full,
    extracted,
    extracted_facts: analysis?.extracted_facts,
    paid_at: paidAt,
  };

  const { error: upErr } = await supabase
    .from("claims")
    .update({
      status: "paid",
      analysis: nextAnalysis as unknown as Record<string, unknown>,
      insurer_normalized: normalizeInsurer(claim.insurer ?? ""),
    })
    .eq("id", claimId);

  if (upErr) {
    console.error("test-payment update failed:", upErr);
    return NextResponse.json({ error: "Failed to save result" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
