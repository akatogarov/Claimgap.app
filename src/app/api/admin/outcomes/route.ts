import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = await verifyAdminToken(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = getServiceSupabase();

    // All paid claims + preview claims (we track preview feedback too)
    const { data: claims, error: cErr } = await supabase
      .from("claims")
      .select("id,email,insurance_type,insurer,state,status,offer_amount,created_at")
      .in("status", ["paid", "preview"])
      .order("created_at", { ascending: false })
      .limit(500);

    if (cErr) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const claimIds = (claims ?? []).map((c) => c.id);
    const { data: outcomes } = claimIds.length
      ? await supabase
          .from("outcomes")
          .select("claim_id,result,additional_amount,reported_at")
          .in("claim_id", claimIds)
          .order("reported_at", { ascending: true })
      : { data: [] };

    // Group outcomes by claim
    type OutcomeItem = { claim_id: string; result: string; additional_amount: number | null; reported_at: string };
    const outcomeMap: Record<string, OutcomeItem[]> = {};
    for (const o of (outcomes ?? []) as OutcomeItem[]) {
      if (!outcomeMap[o.claim_id]) outcomeMap[o.claim_id] = [];
      outcomeMap[o.claim_id].push(o);
    }

    const rows = (claims ?? []).map((c) => {
      const outs = outcomeMap[c.id] ?? [];
      const step1 = outs.find((o) => o.result.startsWith("step1_")) ?? null;
      const step2 = outs.find((o) => o.result.startsWith("step2_")) ?? null;
      const feedback = outs.find((o) => o.result.startsWith("pf_")) ?? null;
      const reminderStep1 = outs.some((o) => o.result === "reminder_step1_sent");
      const reminderStep2 = outs.some((o) => o.result === "reminder_step2_sent");

      return {
        id: c.id,
        email: c.email,
        insurance_type: c.insurance_type,
        insurer: c.insurer,
        state: c.state,
        status: c.status,
        offer_amount: c.offer_amount,
        created_at: c.created_at,
        step1_result: step1?.result ?? null,
        step1_at: step1?.reported_at ?? null,
        step2_result: step2?.result ?? null,
        step2_at: step2?.reported_at ?? null,
        step2_recovered: step2?.result === "step2_won" ? step2.additional_amount : null,
        preview_feedback: feedback?.result ?? null,
        feedback_at: feedback?.reported_at ?? null,
        reminder_step1_sent: reminderStep1,
        reminder_step2_sent: reminderStep2,
      };
    });

    return NextResponse.json({ rows });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
