/**
 * Cron endpoint — runs daily at 10:00 UTC via Vercel Cron.
 * Sends Day-7 (letter reminder) and Day-30 (result check) outcome emails
 * to users who paid but haven't responded yet.
 *
 * Secured via CRON_SECRET env var (Vercel sends Authorization: Bearer <secret>).
 */
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getServiceSupabase } from "@/lib/supabase-server";
import { publicSiteOrigin } from "@/lib/public-url";
import type { StoredAnalysis } from "@/lib/types";

export const runtime = "edge";

const DAY = 24 * 60 * 60 * 1000;

function buildStep1Html(outcomeUrl: string, claimId: string): string {
  const sent = `${outcomeUrl}?step=letter&answer=step1_sent`;
  const pending = `${outcomeUrl}?step=letter&answer=step1_pending`;
  const dropped = `${outcomeUrl}?step=letter&answer=step1_dropped`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a2e;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:40px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #e5e2dc;border-radius:8px;overflow:hidden;">
  <tr><td style="background:#1a1a2e;padding:24px 32px;"><p style="margin:0;font-size:18px;font-weight:700;color:#fff;">ClaimGap</p><p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.55);text-transform:uppercase;">Follow-up · Day 7</p></td></tr>
  <tr><td style="padding:36px 32px;">
    <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#1a1a2e;">Did you send the dispute letter?</p>
    <p style="margin:0 0 28px;font-size:15px;color:#555571;line-height:1.6;">It's been about a week. One tap to record your answer — helps us improve ClaimGap.</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:6px 0;"><a href="${sent}" style="display:block;background:#1a1a2e;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:6px;text-align:center;">✓ Yes, I sent it</a></td></tr>
      <tr><td style="padding:6px 0;"><a href="${pending}" style="display:block;background:#fff;color:#1a1a2e;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:6px;text-align:center;border:2px solid #1a1a2e;">○ Not yet — still working on it</a></td></tr>
      <tr><td style="padding:6px 0;"><a href="${dropped}" style="display:block;background:#fff;color:#888;text-decoration:none;font-size:14px;padding:14px 20px;border-radius:6px;text-align:center;border:1px solid #ddd;">I decided not to dispute</a></td></tr>
    </table>
    <p style="margin:24px 0 0;font-size:12px;color:#aaa;">One click records your answer — no account needed.<br/>Claim ID: ${claimId}</p>
  </td></tr>
  <tr><td style="background:#f5f3ef;border-top:1px solid #e5e2dc;padding:20px 32px;"><p style="margin:0;font-size:12px;color:#999;">ClaimGap — Informational analysis only. Not legal advice.</p></td></tr>
</table></td></tr></table></body></html>`;
}

function buildStep2Html(outcomeUrl: string, claimId: string): string {
  const won = `${outcomeUrl}?step=result&answer=step2_won`;
  const waiting = `${outcomeUrl}?step=result&answer=step2_waiting`;
  const denied = `${outcomeUrl}?step=result&answer=step2_denied`;
  const noAction = `${outcomeUrl}?step=result&answer=step2_no_action`;
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a2e;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:40px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #e5e2dc;border-radius:8px;overflow:hidden;">
  <tr><td style="background:#1a1a2e;padding:24px 32px;"><p style="margin:0;font-size:18px;font-weight:700;color:#fff;">ClaimGap</p><p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.55);text-transform:uppercase;">Follow-up · Day 30</p></td></tr>
  <tr><td style="padding:36px 32px;">
    <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#1a1a2e;">What happened with your dispute?</p>
    <p style="margin:0 0 28px;font-size:15px;color:#555571;line-height:1.6;">It's been about a month. One tap to tell us the outcome — it takes 3 seconds.</p>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:6px 0;"><a href="${won}" style="display:block;background:#1a1a2e;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:6px;text-align:center;">💰 The insurer offered more money</a></td></tr>
      <tr><td style="padding:6px 0;"><a href="${waiting}" style="display:block;background:#fff;color:#1a1a2e;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:6px;text-align:center;border:2px solid #1a1a2e;">⏳ Still waiting for their response</a></td></tr>
      <tr><td style="padding:6px 0;"><a href="${denied}" style="display:block;background:#fff;color:#1a1a2e;text-decoration:none;font-size:14px;padding:14px 20px;border-radius:6px;text-align:center;border:1px solid #ddd;">✕ They denied or refused</a></td></tr>
      <tr><td style="padding:6px 0;"><a href="${noAction}" style="display:block;background:#fff;color:#888;text-decoration:none;font-size:14px;padding:14px 20px;border-radius:6px;text-align:center;border:1px solid #ddd;">— I never ended up sending the letter</a></td></tr>
    </table>
    <p style="margin:24px 0 0;font-size:12px;color:#aaa;">One click records your answer — no account needed.<br/>Claim ID: ${claimId}</p>
  </td></tr>
  <tr><td style="background:#f5f3ef;border-top:1px solid #e5e2dc;padding:20px 32px;"><p style="margin:0;font-size:12px;color:#999;">ClaimGap — Informational analysis only. Not legal advice.</p></td></tr>
</table></td></tr></table></body></html>`;
}

export async function GET(request: Request) {
  // Verify cron secret
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ skipped: "RESEND_API_KEY not set" });
  }

  const supabase = getServiceSupabase();
  const baseUrl = publicSiteOrigin();
  const from = process.env.RESEND_FROM_EMAIL ?? "ClaimGap <onboarding@resend.dev>";
  const resend = new Resend(resendKey);
  const now = Date.now();

  // Load all paid claims
  const { data: claims, error } = await supabase
    .from("claims")
    .select("id, email, analysis")
    .eq("status", "paid");

  if (error || !claims) {
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  // Load all existing outcome records (to skip already-emailed or already-responded claims)
  const claimIds = claims.map((c) => c.id);
  const { data: outcomes } = claimIds.length
    ? await supabase.from("outcomes").select("claim_id, result").in("claim_id", claimIds)
    : { data: [] };

  const outcomesByClaimId: Record<string, string[]> = {};
  for (const o of outcomes ?? []) {
    if (!outcomesByClaimId[o.claim_id]) outcomesByClaimId[o.claim_id] = [];
    outcomesByClaimId[o.claim_id].push(o.result);
  }

  let step1Sent = 0;
  let step2Sent = 0;

  for (const claim of claims) {
    const analysis = claim.analysis as StoredAnalysis | null;
    const paidAt = analysis?.paid_at;
    if (!paidAt) continue;

    const paidMs = new Date(paidAt).getTime();
    if (!Number.isFinite(paidMs)) continue;

    const age = now - paidMs;
    const existing = outcomesByClaimId[claim.id] ?? [];
    const hasStep1Response = existing.some((r) => r.startsWith("step1_"));
    const hasStep1Email = existing.includes("reminder_step1_sent");
    const hasStep2Response = existing.some((r) => r.startsWith("step2_"));
    const hasStep2Email = existing.includes("reminder_step2_sent");

    const outcomeUrl = `${baseUrl}/outcome/${claim.id}`;

    // Send Day-7 email if: ≥7 days old, no step1 response, no step1 reminder sent yet
    if (age >= 7 * DAY && !hasStep1Response && !hasStep1Email) {
      try {
        await resend.emails.send({
          from,
          to: claim.email,
          subject: "Did you send the dispute letter? (ClaimGap follow-up)",
          html: buildStep1Html(outcomeUrl, claim.id),
        });
        await supabase.from("outcomes").insert({
          claim_id: claim.id,
          result: "reminder_step1_sent",
          additional_amount: null,
          reported_at: new Date().toISOString(),
        });
        step1Sent++;
      } catch (e) {
        console.error(`Step-1 email failed for ${claim.id}:`, e);
      }
    }

    // Send Day-30 email if: ≥30 days old, no step2 response, no step2 reminder sent yet
    if (age >= 30 * DAY && !hasStep2Response && !hasStep2Email) {
      try {
        await resend.emails.send({
          from,
          to: claim.email,
          subject: "What happened with your insurance dispute? (ClaimGap follow-up)",
          html: buildStep2Html(outcomeUrl, claim.id),
        });
        await supabase.from("outcomes").insert({
          claim_id: claim.id,
          result: "reminder_step2_sent",
          additional_amount: null,
          reported_at: new Date().toISOString(),
        });
        step2Sent++;
      } catch (e) {
        console.error(`Step-2 email failed for ${claim.id}:`, e);
      }
    }
  }

  return NextResponse.json({ ok: true, step1Sent, step2Sent, checked: claims.length });
}
