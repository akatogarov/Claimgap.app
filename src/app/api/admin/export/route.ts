import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import type { StoredAnalysis } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";

function esc(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v).replace(/"/g, '""');
  return `"${s}"`;
}

function row(cells: unknown[]): string {
  return cells.map(esc).join(",");
}

export async function GET() {
  try {
    const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = await verifyAdminToken(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = getServiceSupabase();

    const { data: claims, error } = await supabase
      .from("claims")
      .select("id,email,insurance_type,insurer,state,status,offer_amount,created_at,analysis")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });

    // Load all outcomes
    const claimIds = (claims ?? []).map((c) => c.id);
    const { data: outcomes } = claimIds.length
      ? await supabase.from("outcomes").select("claim_id,result,additional_amount,reported_at").in("claim_id", claimIds)
      : { data: [] };

    const outcomeMap: Record<string, { result: string; additional_amount: number | null; reported_at: string }[]> = {};
    for (const o of outcomes ?? []) {
      if (!outcomeMap[o.claim_id]) outcomeMap[o.claim_id] = [];
      outcomeMap[o.claim_id].push(o);
    }

    const headers = [
      "id", "email", "insurance_type", "insurer", "state", "status",
      "offer_amount", "created_at",
      "gap_low", "gap_high", "teaser_summary",
      "underpayment_areas",
      "full_report_strength",
      "outcome_step1", "outcome_step2", "outcome_recovered",
      "preview_feedback",
    ];

    const lines: string[] = [headers.join(",")];

    for (const c of claims ?? []) {
      const analysis = c.analysis as StoredAnalysis | null;
      const preview = analysis?.preview;
      const full = analysis?.full;

      const gapLow = preview?.missed_amount_low ?? full?.missed_money?.missed_amount_low ?? "";
      const gapHigh = preview?.missed_amount_high ?? full?.missed_money?.missed_amount_high ?? "";
      const teaserSummary = preview?.teaser_summary ?? "";
      const areasTitles = (preview?.underpayment_areas ?? []).map((a) => a.title).join(" | ");
      const strength = full?.missed_money?.strength_of_case ?? "";

      const claimOutcomes = outcomeMap[c.id] ?? [];
      const step1 = claimOutcomes.find((o) => o.result.startsWith("step1_"))?.result ?? "";
      const step2 = claimOutcomes.find((o) => o.result.startsWith("step2_"))?.result ?? "";
      const recovered = claimOutcomes.find((o) => o.result === "step2_won")?.additional_amount ?? "";
      const feedback = claimOutcomes.find((o) => o.result.startsWith("pf_"))?.result ?? "";

      lines.push(row([
        c.id, c.email, c.insurance_type, c.insurer, c.state, c.status,
        c.offer_amount, c.created_at,
        gapLow, gapHigh, teaserSummary,
        areasTitles,
        strength,
        step1, step2, recovered,
        feedback,
      ]));
    }

    const csv = lines.join("\r\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="claimgap-claims-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Export failed." }, { status: 500 });
  }
}
