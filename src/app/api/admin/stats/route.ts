import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = await verifyAdminToken(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = getServiceSupabase();

    const { data: claims, error } = await supabase
      .from("claims")
      .select("id,status,offer_amount,insurance_type,state,created_at,analysis")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });

    const all = claims ?? [];
    const total = all.length;
    const paid = all.filter((c) => c.status === "paid");
    const preview = all.filter((c) => c.status === "preview");
    const failed = all.filter((c) => c.status === "failed");

    const revenue = paid.length * 149;

    // Average gap from paid claims
    let gapSum = 0;
    let gapCount = 0;
    for (const c of paid) {
      const max = c.analysis?.full?.gap_analysis?.estimated_gap_max;
      if (typeof max === "number" && !Number.isNaN(max)) {
        gapSum += max;
        gapCount++;
      }
    }
    const avgGap = gapCount > 0 ? Math.round(gapSum / gapCount) : 0;

    // By insurance type
    const byType: Record<string, number> = {};
    for (const c of all) {
      const t = c.insurance_type ?? "Unknown";
      byType[t] = (byType[t] ?? 0) + 1;
    }

    // By state (top 10)
    const byState: Record<string, number> = {};
    for (const c of all) {
      const s = c.state ?? "Unknown";
      byState[s] = (byState[s] ?? 0) + 1;
    }
    const topStates = Object.entries(byState)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([state, count]) => ({ state, count }));

    // Last 7 days daily signups
    const now = Date.now();
    const daily: Record<string, { total: number; paid: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const key = d.toISOString().slice(0, 10);
      daily[key] = { total: 0, paid: 0 };
    }
    for (const c of all) {
      const key = c.created_at?.slice(0, 10);
      if (key && daily[key]) {
        daily[key].total++;
        if (c.status === "paid") daily[key].paid++;
      }
    }
    const dailyChart = Object.entries(daily).map(([date, v]) => ({ date, ...v }));

    // Health checks
    const health = {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      supabase: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      stripe: !!process.env.STRIPE_SECRET_KEY,
      stripeWebhook: !!process.env.STRIPE_WEBHOOK_SECRET,
      resend: !!process.env.RESEND_API_KEY,
      resendFrom: !!process.env.RESEND_FROM_EMAIL,
      adminSecret: !!process.env.ADMIN_SECRET,
      adminJwt: !!process.env.ADMIN_JWT_SECRET,
      publicUrl: process.env.NEXT_PUBLIC_URL ?? null,
    };

    return NextResponse.json({
      stats: {
        total,
        paid: paid.length,
        preview: preview.length,
        failed: failed.length,
        revenue,
        avgGap,
        conversionRate: total > 0 ? Math.round((paid.length / total) * 100) : 0,
        byType,
        topStates,
        dailyChart,
      },
      health,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
