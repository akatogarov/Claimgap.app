import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";
import { mergeClarificationIntoExtracted, runPreviewAnalysis, parseOfferNumber } from "@/lib/anthropic";
import type { ClaimRow, StoredAnalysis } from "@/lib/types";

export const runtime = 'edge';

export async function POST(request: Request, context: { params: { id: string } }) {
  const { id } = context.params;
  if (!id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: { answers?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const answers = body.answers ?? {};
  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "Missing answers." }, { status: 400 });
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.from("claims").select("*").eq("id", id).single();
    if (error || !data) {
      return NextResponse.json({ error: "Claim not found." }, { status: 404 });
    }

    const row = data as ClaimRow;
    if (row.status !== "awaiting_clarification") {
      return NextResponse.json({ error: "This claim is not waiting for clarification." }, { status: 400 });
    }

    const analysis = row.analysis as StoredAnalysis | null;
    const ext = analysis?.extracted;
    const facts = analysis?.extracted_facts;
    if (!ext?.policy_text || !ext?.settlement_text || !facts) {
      return NextResponse.json({ error: "Stored documents are incomplete. Please start over." }, { status: 400 });
    }

    const mergedFacts = mergeClarificationIntoExtracted(facts, answers as Record<string, string>);
    const preview = await runPreviewAnalysis(
      ext.policy_text,
      ext.settlement_text,
      ext.optional_context ?? "",
      row.insurance_type,
      mergedFacts,
      answers as Record<string, string>
    );

    const offerNum =
      parseOfferNumber(preview.extracted.amount_offered_or_paid) ||
      parseOfferNumber(mergedFacts.amount_offered_or_paid) ||
      Math.max(100, Math.round(preview.missed_amount_high * 0.4));

    const nextAnalysis: StoredAnalysis = {
      preview,
      full: null,
      extracted: ext,
      extracted_facts: preview.extracted,
    };

    const { error: upErr } = await supabase
      .from("claims")
      .update({
        status: "preview",
        insurer: preview.extracted.insurer_name || row.insurer,
        state: preview.extracted.state || row.state,
        description: preview.teaser_summary.slice(0, 2000),
        offer_amount: offerNum,
        analysis: nextAnalysis as unknown as Record<string, unknown>,
      })
      .eq("id", id);

    if (upErr) {
      console.error(upErr);
      return NextResponse.json({ error: "Could not update claim." }, { status: 500 });
    }

    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e instanceof Error ? e.message : "Failed." }, { status: 500 });
  }
}
