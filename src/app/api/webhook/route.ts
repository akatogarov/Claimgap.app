import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { getServiceSupabase } from "@/lib/supabase-server";
import { publicSiteOrigin } from "@/lib/public-url";
import { runFullAnalysis, defaultExtractedFacts } from "@/lib/anthropic";
import { normalizeInsurer } from "@/lib/normalize-insurer";
import type { FullAnalysis, StoredAnalysis } from "@/lib/types";

export const runtime = 'edge';

function stripeClient() {
  const raw = process.env.STRIPE_SECRET_KEY;
  if (!raw?.trim()) throw new Error("Missing STRIPE_SECRET_KEY");
  const key = raw.trim().replace(/^["']|["']$/g, "");
  if (!key.startsWith("sk_")) throw new Error("STRIPE_SECRET_KEY must be a secret key (sk_…)");
  return new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    httpClient: Stripe.createFetchHttpClient(),
  });
}

function buildEmailHtml({
  resultUrl,
  insurer,
  insuranceType,
  gapRange,
}: {
  resultUrl: string;
  insurer: string;
  insuranceType: string;
  gapRange: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Your ClaimGap analysis is ready</title>
</head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a2e;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:40px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e5e2dc;border-radius:8px;overflow:hidden;">

      <!-- Header -->
      <tr>
        <td style="background:#1a1a2e;padding:24px 32px;">
          <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">ClaimGap</p>
          <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.55);letter-spacing:0.05em;text-transform:uppercase;">Full Paid Report</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:36px 32px;">
          <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#1a1a2e;line-height:1.3;">Your analysis is ready.</p>
          <p style="margin:0 0 24px;font-size:15px;color:#555571;line-height:1.6;">
            We reviewed your <strong style="color:#1a1a2e;">${insuranceType}</strong> claim with <strong style="color:#1a1a2e;">${insurer}</strong> and found potential underpayment.
          </p>

          <!-- Gap callout -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td style="background:#fdf2f0;border:1px solid rgba(194,76,60,0.25);border-radius:6px;padding:20px 24px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#c24c3c;letter-spacing:0.1em;text-transform:uppercase;">Estimated underpayment range</p>
                <p style="margin:0;font-size:28px;font-weight:700;color:#c24c3c;letter-spacing:-0.5px;">${gapRange}</p>
                <p style="margin:6px 0 0;font-size:12px;color:#9a5c56;">Conservative estimate from your documents — not a guarantee.</p>
              </td>
            </tr>
          </table>

          <!-- What's inside -->
          <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#1a1a2e;letter-spacing:0.05em;text-transform:uppercase;">Your full report includes:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            ${[
              "Ready-to-send dispute letter",
              "Step-by-step 21-day escalation plan",
              "Evidence checklist for your case",
              "State-specific rights & regulator contacts",
              "Full policy gap analysis with citations",
            ].map(item => `
            <tr>
              <td style="padding:6px 0;border-bottom:1px solid #f0ede8;">
                <span style="color:#2d7a6e;font-weight:bold;margin-right:10px;">✓</span>
                <span style="font-size:14px;color:#1a1a2e;">${item}</span>
              </td>
            </tr>`).join("")}
          </table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr>
              <td align="center">
                <a href="${resultUrl}" style="display:inline-block;background:#1a1a2e;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:16px 40px;border-radius:6px;letter-spacing:-0.2px;">
                  View my full report →
                </a>
              </td>
            </tr>
          </table>

          <p style="margin:0;font-size:13px;color:#888899;line-height:1.6;">
            Keep this link safe — it's your permanent access to the report. You can also print or save it as a PDF from the report page.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f5f3ef;border-top:1px solid #e5e2dc;padding:20px 32px;">
          <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
            <strong style="color:#555;">ClaimGap</strong> — Informational analysis only. Not legal, insurance, or financial advice.<br/>
            Questions? <a href="mailto:info@globaldeal.app" style="color:#1a1a2e;text-decoration:underline;">info@globaldeal.app</a>
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function buildOutcomeEmailStep1(outcomeBaseUrl: string, claimId: string): string {
  const sent = `${outcomeBaseUrl}?step=letter&answer=step1_sent`;
  const pending = `${outcomeBaseUrl}?step=letter&answer=step1_pending`;
  const dropped = `${outcomeBaseUrl}?step=letter&answer=step1_dropped`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>Quick follow-up — ClaimGap</title></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a2e;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:40px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e5e2dc;border-radius:8px;overflow:hidden;">
      <tr><td style="background:#1a1a2e;padding:24px 32px;">
        <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">ClaimGap</p>
        <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.05em;">Follow-up · Day 7</p>
      </td></tr>
      <tr><td style="padding:36px 32px;">
        <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#1a1a2e;">Quick question about your dispute</p>
        <p style="margin:0 0 28px;font-size:15px;color:#555571;line-height:1.6;">It&apos;s been about a week since you received your ClaimGap report. Did you send the dispute letter?</p>
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#1a1a2e;text-transform:uppercase;letter-spacing:0.05em;">Tap your answer:</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:6px 0;">
            <a href="${sent}" style="display:block;background:#1a1a2e;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:6px;text-align:center;">✓ Yes, I sent it</a>
          </td></tr>
          <tr><td style="padding:6px 0;">
            <a href="${pending}" style="display:block;background:#ffffff;color:#1a1a2e;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:6px;text-align:center;border:2px solid #1a1a2e;">○ Not yet — still working on it</a>
          </td></tr>
          <tr><td style="padding:6px 0;">
            <a href="${dropped}" style="display:block;background:#ffffff;color:#888;text-decoration:none;font-size:14px;padding:14px 20px;border-radius:6px;text-align:center;border:1px solid #ddd;">I decided not to dispute</a>
          </td></tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;color:#aaa;">One click records your answer — no account needed.<br/>Claim ID: ${claimId}</p>
      </td></tr>
      <tr><td style="background:#f5f3ef;border-top:1px solid #e5e2dc;padding:20px 32px;">
        <p style="margin:0;font-size:12px;color:#999;">ClaimGap — Informational analysis only. Not legal advice.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

function buildOutcomeEmailStep2(outcomeBaseUrl: string, claimId: string): string {
  const won = `${outcomeBaseUrl}?step=result&answer=step2_won`;
  const waiting = `${outcomeBaseUrl}?step=result&answer=step2_waiting`;
  const denied = `${outcomeBaseUrl}?step=result&answer=step2_denied`;
  const noAction = `${outcomeBaseUrl}?step=result&answer=step2_no_action`;
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>What happened? — ClaimGap</title></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a2e;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:40px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e5e2dc;border-radius:8px;overflow:hidden;">
      <tr><td style="background:#1a1a2e;padding:24px 32px;">
        <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">ClaimGap</p>
        <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.05em;">Follow-up · Day 30</p>
      </td></tr>
      <tr><td style="padding:36px 32px;">
        <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#1a1a2e;">What happened with your dispute?</p>
        <p style="margin:0 0 28px;font-size:15px;color:#555571;line-height:1.6;">It&apos;s been about a month since you received your ClaimGap report. What was the outcome with your insurer?</p>
        <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#1a1a2e;text-transform:uppercase;letter-spacing:0.05em;">Tap your answer:</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr><td style="padding:6px 0;">
            <a href="${won}" style="display:block;background:#1a1a2e;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:6px;text-align:center;">💰 The insurer offered more money</a>
          </td></tr>
          <tr><td style="padding:6px 0;">
            <a href="${waiting}" style="display:block;background:#ffffff;color:#1a1a2e;text-decoration:none;font-size:14px;font-weight:600;padding:14px 20px;border-radius:6px;text-align:center;border:2px solid #1a1a2e;">⏳ Still waiting for their response</a>
          </td></tr>
          <tr><td style="padding:6px 0;">
            <a href="${denied}" style="display:block;background:#ffffff;color:#1a1a2e;text-decoration:none;font-size:14px;padding:14px 20px;border-radius:6px;text-align:center;border:1px solid #ddd;">✕ They denied or refused</a>
          </td></tr>
          <tr><td style="padding:6px 0;">
            <a href="${noAction}" style="display:block;background:#ffffff;color:#888;text-decoration:none;font-size:14px;padding:14px 20px;border-radius:6px;text-align:center;border:1px solid #ddd;">— I never ended up sending the letter</a>
          </td></tr>
        </table>
        <p style="margin:24px 0 0;font-size:12px;color:#aaa;">One click records your answer — no account needed.<br/>Claim ID: ${claimId}</p>
      </td></tr>
      <tr><td style="background:#f5f3ef;border-top:1px solid #e5e2dc;padding:20px 32px;">
        <p style="margin:0;font-size:12px;color:#999;">ClaimGap — Informational analysis only. Not legal advice.</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export async function POST(request: Request) {
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!whSecret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const stripe = stripeClient();
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, whSecret);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const resolvedClaimId =
      typeof session.metadata?.claim_id === "string"
        ? session.metadata.claim_id
        : typeof session.client_reference_id === "string"
          ? session.client_reference_id
          : null;

    if (!resolvedClaimId) {
      console.error("No claim_id on session", session.id);
      return NextResponse.json({ received: true });
    }

    const supabase = getServiceSupabase();
    const { data: claim, error: fetchErr } = await supabase
      .from("claims")
      .select("*")
      .eq("id", resolvedClaimId)
      .single();

    if (fetchErr || !claim) {
      console.error(fetchErr);
      return NextResponse.json({ received: true });
    }

    if (claim.status === "paid") {
      return NextResponse.json({ received: true });
    }

    const analysis = claim.analysis as StoredAnalysis | null;
    const extracted = analysis?.extracted;
    if (!extracted?.policy_text || !extracted?.settlement_text) {
      await supabase
        .from("claims")
        .update({ status: "failed" })
        .eq("id", resolvedClaimId);
      return NextResponse.json({ received: true });
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
      console.error(e);
      await supabase
        .from("claims")
        .update({ status: "failed" })
        .eq("id", resolvedClaimId);
      return NextResponse.json({ received: true });
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
      .eq("id", resolvedClaimId);

    if (upErr) {
      console.error(upErr);
      return NextResponse.json({ received: true });
    }

    const baseUrl = publicSiteOrigin();
    const resultUrl = `${baseUrl}/result/${resolvedClaimId}`;

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      const from = process.env.RESEND_FROM_EMAIL ?? "ClaimGap <onboarding@resend.dev>";
      const insurer = claim.insurer ?? "your insurer";
      const insuranceType = claim.insurance_type ?? "Insurance";
      const gapMin = full.missed_money?.missed_amount_low ?? 0;
      const gapMax = full.missed_money?.missed_amount_high ?? 0;
      const gapRange = gapMax > 0
        ? `$${gapMin.toLocaleString("en-US")} – $${gapMax.toLocaleString("en-US")}`
        : "See your report";
      const outcomeUrl = `${baseUrl}/outcome/${resolvedClaimId}`;
      const DAY = 24 * 60 * 60 * 1000;
      const at = (days: number) => new Date(Date.now() + days * DAY).toISOString();

      // Immediate: report ready
      try {
        await resend.emails.send({
          from,
          to: claim.email,
          subject: "Your ClaimGap analysis is ready — here's what we found",
          html: buildEmailHtml({ resultUrl, insurer, insuranceType, gapRange }),
        });
        // Mark email as sent in DB
        await supabase
          .from("claims")
          .update({ email_sent_at: new Date().toISOString() })
          .eq("id", resolvedClaimId);
      } catch (e) { console.error("Email Day-0 failed:", e); }

      // Full outcome sequence — scheduled. If user responds early, outcome page
      // shows "already recorded" and the response is ignored (idempotent API).
      const step1Emails: Array<{ days: number; subject: string }> = [
        { days: 7,  subject: "Did you send the dispute letter? (ClaimGap follow-up)" },
        { days: 14, subject: "Quick reminder — did you send your dispute letter?" },
        { days: 21, subject: "Last chance to tell us — did the letter go out?" },
        { days: 28, subject: "Final check — did you dispute your claim?" },
      ];
      for (const { days, subject } of step1Emails) {
        try {
          await (resend.emails.send as Function)({
            from, to: claim.email, subject,
            html: buildOutcomeEmailStep1(outcomeUrl, resolvedClaimId),
            scheduledAt: at(days),
          });
        } catch (e) { console.error(`Email Day-${days} step1 failed:`, e); }
      }

      const step2Emails: Array<{ days: number; subject: string }> = [
        { days: 35, subject: "What happened with your insurance dispute? (ClaimGap)" },
        { days: 60, subject: "Final follow-up — what was the outcome of your claim?" },
      ];
      for (const { days, subject } of step2Emails) {
        try {
          await (resend.emails.send as Function)({
            from, to: claim.email, subject,
            html: buildOutcomeEmailStep2(outcomeUrl, resolvedClaimId),
            scheduledAt: at(days),
          });
        } catch (e) { console.error(`Email Day-${days} step2 failed:`, e); }
      }
    }
  }

  return NextResponse.json({ received: true });
}
