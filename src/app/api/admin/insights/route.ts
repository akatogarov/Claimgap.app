/**
 * /api/admin/insights — aggregated, PII-free analytics.
 * Safe for internal use; strip email before any external sharing.
 *
 * Data useful for B2B sale:
 * - Which insurers underpay most (by claim count + avg gap)
 * - Which claim types / states have highest gaps
 * - Preview-to-paid funnel
 * - Outcome rates (letter sent, money recovered)
 * - Preview abandonment reasons
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";
import { normalizeInsurer } from "@/lib/normalize-insurer";
import type { StoredAnalysis } from "@/lib/types";

export const runtime = "edge";
export const dynamic = "force-dynamic";

function bucket(n: number): string {
  if (n <= 0) return "unknown";
  if (n < 5000) return "<$5k";
  if (n < 10000) return "$5k–10k";
  if (n < 25000) return "$10k–25k";
  if (n < 50000) return "$25k–50k";
  return "$50k+";
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
      .select("id,insurance_type,insurer,insurer_normalized,state,status,offer_amount,created_at,analysis");

    if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const { data: outcomes } = await supabase
      .from("outcomes")
      .select("claim_id,result,additional_amount");

    const all = claims ?? [];
    const outs = outcomes ?? [];

    // Index outcomes by claim
    const outcomeMap: Record<string, string[]> = {};
    for (const o of outs) {
      if (!outcomeMap[o.claim_id]) outcomeMap[o.claim_id] = [];
      outcomeMap[o.claim_id].push(o.result);
    }

    // ── Per-insurer aggregation ──────────────────────────────────────────────
    type InsurerAgg = {
      name: string;
      claims: number;
      paid: number;
      gapSum: number;
      gapCount: number;
      wonCount: number;
      recoveredSum: number;
    };
    const byInsurer: Record<string, InsurerAgg> = {};

    for (const c of all) {
      const key = c.insurer_normalized || normalizeInsurer(c.insurer ?? "");
      if (!byInsurer[key]) byInsurer[key] = { name: key, claims: 0, paid: 0, gapSum: 0, gapCount: 0, wonCount: 0, recoveredSum: 0 };
      const agg = byInsurer[key];
      agg.claims++;
      if (c.status === "paid") agg.paid++;

      const analysis = c.analysis as StoredAnalysis | null;
      const gapHigh = analysis?.full?.missed_money?.missed_amount_high
        ?? analysis?.preview?.missed_amount_high ?? 0;
      if (gapHigh > 0) { agg.gapSum += gapHigh; agg.gapCount++; }

      const claimOuts = outcomeMap[c.id] ?? [];
      if (claimOuts.includes("step2_won")) {
        agg.wonCount++;
        const wonRow = outs.find((o) => o.claim_id === c.id && o.result === "step2_won");
        agg.recoveredSum += wonRow?.additional_amount ?? 0;
      }
    }

    const insurerTable = Object.values(byInsurer)
      .filter((a) => a.name !== "Unknown" && a.claims > 0)
      .sort((a, b) => b.claims - a.claims)
      .slice(0, 20)
      .map((a) => ({
        insurer: a.name,
        total_claims: a.claims,
        paid_reports: a.paid,
        avg_gap: a.gapCount > 0 ? Math.round(a.gapSum / a.gapCount) : null,
        disputes_won: a.wonCount,
        total_recovered: a.recoveredSum,
      }));

    // ── By state ─────────────────────────────────────────────────────────────
    type StateAgg = { claims: number; paid: number; gapSum: number; gapCount: number };
    const byState: Record<string, StateAgg> = {};
    for (const c of all) {
      const s = c.state?.trim() || "Unknown";
      if (!byState[s]) byState[s] = { claims: 0, paid: 0, gapSum: 0, gapCount: 0 };
      byState[s].claims++;
      if (c.status === "paid") byState[s].paid++;
      const analysis = c.analysis as StoredAnalysis | null;
      const gh = analysis?.full?.missed_money?.missed_amount_high ?? analysis?.preview?.missed_amount_high ?? 0;
      if (gh > 0) { byState[s].gapSum += gh; byState[s].gapCount++; }
    }
    const stateTable = Object.entries(byState)
      .filter(([s]) => s !== "Unknown")
      .sort((a, b) => b[1].claims - a[1].claims)
      .slice(0, 15)
      .map(([state, a]) => ({
        state,
        total_claims: a.claims,
        paid_reports: a.paid,
        avg_gap: a.gapCount > 0 ? Math.round(a.gapSum / a.gapCount) : null,
      }));

    // ── By insurance type ────────────────────────────────────────────────────
    type TypeAgg = { claims: number; paid: number; gapSum: number; gapCount: number };
    const byType: Record<string, TypeAgg> = {};
    for (const c of all) {
      const t = c.insurance_type ?? "Unknown";
      if (!byType[t]) byType[t] = { claims: 0, paid: 0, gapSum: 0, gapCount: 0 };
      byType[t].claims++;
      if (c.status === "paid") byType[t].paid++;
      const analysis = c.analysis as StoredAnalysis | null;
      const gh = analysis?.full?.missed_money?.missed_amount_high ?? analysis?.preview?.missed_amount_high ?? 0;
      if (gh > 0) { byType[t].gapSum += gh; byType[t].gapCount++; }
    }
    const typeTable = Object.entries(byType).map(([type, a]) => ({
      type,
      total_claims: a.claims,
      paid_reports: a.paid,
      avg_gap: a.gapCount > 0 ? Math.round(a.gapSum / a.gapCount) : null,
      conversion_pct: a.claims > 0 ? Math.round((a.paid / a.claims) * 100) : 0,
    }));

    // ── Gap distribution (offer amount buckets) ──────────────────────────────
    const gapBuckets: Record<string, number> = {};
    for (const c of all) {
      const analysis = c.analysis as StoredAnalysis | null;
      const gh = analysis?.full?.missed_money?.missed_amount_high ?? analysis?.preview?.missed_amount_high ?? 0;
      const b = bucket(gh);
      gapBuckets[b] = (gapBuckets[b] ?? 0) + 1;
    }

    // ── Funnel ───────────────────────────────────────────────────────────────
    const paid = all.filter((c) => c.status === "paid");
    const step1Responses = outs.filter((o) => o.result.startsWith("step1_") && !o.result.startsWith("reminder_"));
    const step2Responses = outs.filter((o) => o.result.startsWith("step2_") && !o.result.startsWith("reminder_"));
    const wonRows = outs.filter((o) => o.result === "step2_won");
    const pfRows = outs.filter((o) => o.result.startsWith("pf_"));

    const funnel = {
      total_previews: all.length,
      paid_reports: paid.length,
      preview_to_paid_pct: all.length > 0 ? Math.round((paid.length / all.length) * 100) : 0,
      letter_sent: step1Responses.filter((o) => o.result === "step1_sent").length,
      letter_response_rate: paid.length > 0 ? Math.round((step1Responses.length / paid.length) * 100) : 0,
      disputes_won: wonRows.length,
      total_recovered: wonRows.reduce((s, o) => s + (o.additional_amount ?? 0), 0),
      avg_recovered: wonRows.length > 0
        ? Math.round(wonRows.reduce((s, o) => s + (o.additional_amount ?? 0), 0) / wonRows.length)
        : 0,
    };

    // ── Preview abandonment reasons ──────────────────────────────────────────
    const pfLabels: Record<string, string> = {
      pf_expensive: "Price too high",
      pf_trust: "Didn't trust estimate",
      pf_not_ready: "Not ready yet",
      pf_resolved: "Already resolved",
      pf_other: "Other",
    };
    const pfBreakdown = Object.entries(pfLabels).map(([key, label]) => ({
      reason: label,
      count: pfRows.filter((o) => o.result === key).length,
    })).filter((r) => r.count > 0);

    // ── Underpayment area frequency ──────────────────────────────────────────
    const areaFreq: Record<string, number> = {};
    for (const c of all) {
      const analysis = c.analysis as StoredAnalysis | null;
      const areas = analysis?.preview?.underpayment_areas ?? [];
      for (const a of areas) {
        if (a.title?.trim()) {
          const t = a.title.trim();
          areaFreq[t] = (areaFreq[t] ?? 0) + 1;
        }
      }
    }
    const topAreas = Object.entries(areaFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([area, count]) => ({ area, count }));

    return NextResponse.json({
      funnel,
      byInsurer: insurerTable,
      byState: stateTable,
      byType: typeTable,
      gapBuckets,
      topUnderpaymentAreas: topAreas,
      previewFeedback: pfBreakdown,
      step2Breakdown: {
        won: step2Responses.filter((o) => o.result === "step2_won").length,
        waiting: step2Responses.filter((o) => o.result === "step2_waiting").length,
        denied: step2Responses.filter((o) => o.result === "step2_denied").length,
        no_action: step2Responses.filter((o) => o.result === "step2_no_action").length,
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
