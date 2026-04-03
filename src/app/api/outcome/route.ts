import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";

export const runtime = "edge";

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
    if (!["yes", "no", "negotiating"].includes(result)) {
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

    const { error } = await supabase.from("outcomes").insert({
      claim_id,
      result,
      additional_amount: result === "yes" ? additional_amount : null,
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
