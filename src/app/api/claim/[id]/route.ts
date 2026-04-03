import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase-server";
import type { ClaimRow, StoredAnalysis } from "@/lib/types";

export const runtime = "edge";

export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  if (!id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase.from("claims").select("*").eq("id", id).single();
    if (error || !data) {
      return NextResponse.json({ error: "Claim not found." }, { status: 404 });
    }

    const row = data as ClaimRow;
    const analysis = row.analysis as StoredAnalysis | null;

    if (row.status === "awaiting_clarification") {
      return NextResponse.json({
        id: row.id,
        status: row.status,
        insurance_type: row.insurance_type,
        insurer: row.insurer,
        state: row.state,
        offer_amount: row.offer_amount,
        clarification: analysis?.clarification ?? null,
        preview: null,
        created_at: row.created_at,
      });
    }

    if (row.status === "preview") {
      return NextResponse.json({
        id: row.id,
        status: row.status,
        insurance_type: row.insurance_type,
        insurer: row.insurer,
        state: row.state,
        offer_amount: row.offer_amount,
        preview: analysis?.preview ?? null,
        created_at: row.created_at,
      });
    }

    if (row.status === "failed") {
      return NextResponse.json({
        id: row.id,
        status: row.status,
        error:
          "We could not complete the full analysis. Please contact support for a refund or retry.",
      });
    }

    return NextResponse.json({
      id: row.id,
      status: row.status,
      email: row.email,
      insurance_type: row.insurance_type,
      insurer: row.insurer,
      state: row.state,
      description: row.description,
      offer_amount: row.offer_amount,
      analysis,
      created_at: row.created_at,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not load claim." }, { status: 500 });
  }
}
