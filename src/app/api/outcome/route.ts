import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";

export const runtime = 'edge';

const ALLOWED_RESULTS = new Set([
  // Step 1 — letter sent?
  "step1_sent",
  "step1_pending",
  "step1_dropped",
  // Step 2 — what happened?
  "step2_won",
  "step2_waiting",
  "step2_denied",
  "step2_no_action",
  // Preview feedback — why didn't you buy?
  "pf_expensive",
  "pf_trust",
  "pf_not_ready",
  "pf_resolved",
  "pf_other",
  // Legacy values
  "yes",
  "no",
  "negotiating",
]);

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const claim_id = typeof body.claim_id === "string" ? body.claim_id : "";
    const result = typeof body.result === "string" ? body.result : "";
    const additional_amount =
      body.additional_amount === null || body.additional_amount === undefined
        ? null
        : Number(body.additional_amount);

    if (!claim_id) {
      return NextResponse.json({ error: "claim_id required" }, { status: 400 });
    }
    if (!ALLOWED_RESULTS.has(result)) {
      return NextResponse.json({ error: "Invalid result." }, { status: 400 });
    }
    if (additional_amount !== null && (!Number.isFinite(additional_amount) || additional_amount < 0)) {
      return NextResponse.json({ error: "Invalid additional_amount." }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const { data: claim, error: cErr } = await supabase.from("claims").select("id").eq("id", claim_id).single();
    if (cErr || !claim) {
      return NextResponse.json({ error: "Claim not found." }, { status: 404 });
    }

    // Idempotent: if a response for this step already exists, skip duplicate
    const stepPrefix = result.startsWith("step1_") ? "step1_"
      : result.startsWith("step2_") ? "step2_"
      : result.startsWith("pf_") ? "pf_"
      : null;
    if (stepPrefix) {
      const { data: existing } = await supabase
        .from("outcomes")
        .select("id")
        .eq("claim_id", claim_id)
        .like("result", `${stepPrefix}%`)
        .limit(1);
      if (existing && existing.length > 0) {
        return NextResponse.json({ ok: true, already_recorded: true });
      }
    }

    const { error } = await supabase.from("outcomes").insert({
      claim_id,
      result,
      additional_amount: result === "yes" || result === "step2_won" ? additional_amount : null,
      reported_at: new Date().toISOString(),
    });

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Could not save outcome." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Request failed." }, { status: 500 });
  }
}
