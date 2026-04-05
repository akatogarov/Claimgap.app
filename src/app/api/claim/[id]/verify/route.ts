import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getServiceSupabase } from "@/lib/supabase-server";
import { publicSiteOrigin } from "@/lib/public-url";
import {
  mergeClarificationIntoExtracted,
  runPreviewAnalysis,
  parseOfferNumber,
} from "@/lib/anthropic";
import { normalizeInsurer } from "@/lib/normalize-insurer";
import type { ClaimRow, StoredAnalysis } from "@/lib/types";

export const runtime = "edge";

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  if (!id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { confirmed_facts?: Record<string, string> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const confirmedFacts = body.confirmed_facts ?? {};

  try {
    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("claims")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Claim not found." }, { status: 404 });
    }

    const row = data as ClaimRow;
    if (
      row.status !== "awaiting_verification" &&
      row.status !== "awaiting_clarification"
    ) {
      // Already has preview — just redirect
      return NextResponse.json({ ok: true, id });
    }

    const analysis = row.analysis as StoredAnalysis | null;
    const ext = analysis?.extracted;
    const facts = analysis?.extracted_facts;

    if (!ext?.policy_text || !ext?.settlement_text || !facts) {
      return NextResponse.json(
        { error: "Stored documents are incomplete. Please start over." },
        { status: 400 }
      );
    }

    // Merge user-confirmed fields on top of AI-extracted facts
    const mergedFacts =
      Object.keys(confirmedFacts).length > 0
        ? mergeClarificationIntoExtracted(facts, confirmedFacts)
        : facts;

    const preview = await runPreviewAnalysis(
      ext.policy_text,
      ext.settlement_text,
      ext.optional_context ?? "",
      row.insurance_type,
      mergedFacts,
      Object.keys(confirmedFacts).length > 0 ? confirmedFacts : undefined
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
        insurer_normalized: normalizeInsurer(
          preview.extracted.insurer_name || row.insurer || ""
        ),
        state: preview.extracted.state || row.state,
        description: preview.teaser_summary.slice(0, 2000),
        offer_amount: offerNum,
        analysis: nextAnalysis as unknown as Record<string, unknown>,
      })
      .eq("id", id);

    if (upErr) {
      console.error("verify update:", upErr);
      return NextResponse.json(
        { error: "Could not update claim." },
        { status: 500 }
      );
    }

    // Schedule 24h abandonment email
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        const from =
          process.env.RESEND_FROM_EMAIL ?? "ClaimGap <onboarding@resend.dev>";
        const baseUrl = publicSiteOrigin();
        const outcomeUrl = `${baseUrl}/outcome/${id}`;
        const at24h = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        const gapHigh = preview.missed_amount_high ?? 0;
        const gapRange =
          gapHigh > 0
            ? `up to $${gapHigh.toLocaleString("en-US")}`
            : "a potential gap";

        await (resend.emails.send as Function)({
          from,
          to: row.email,
          subject: "Quick question about your ClaimGap preview",
          html: buildPreviewFeedbackEmail(outcomeUrl, id, gapRange),
          scheduledAt: at24h,
        });
      } catch (mailErr) {
        console.error("Preview feedback email failed:", mailErr);
      }
    }

    return NextResponse.json({ ok: true, id });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed." },
      { status: 500 }
    );
  }
}

function buildPreviewFeedbackEmail(
  outcomeBase: string,
  claimId: string,
  gapRange: string
): string {
  const opts = [
    { value: "pf_expensive", label: "The price ($149) felt too high" },
    { value: "pf_trust", label: "I wasn't sure the estimate was accurate" },
    { value: "pf_not_ready", label: "I need more time to decide" },
    { value: "pf_resolved", label: "I already resolved my claim" },
    { value: "pf_other", label: "Something else" },
  ];
  const buttons = opts
    .map(
      (o) =>
        `<tr><td style="padding:5px 0;"><a href="${outcomeBase}?step=preview_feedback&answer=${o.value}" style="display:block;background:#fff;color:#1a1a2e;text-decoration:none;font-size:14px;padding:13px 20px;border-radius:6px;text-align:left;border:1px solid #dde;">${o.label}</a></td></tr>`
    )
    .join("");

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a2e;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:40px 16px;"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #e5e2dc;border-radius:8px;overflow:hidden;">
  <tr><td style="background:#1a1a2e;padding:24px 32px;"><p style="margin:0;font-size:18px;font-weight:700;color:#fff;">ClaimGap</p></td></tr>
  <tr><td style="padding:32px;">
    <p style="margin:0 0 8px;font-size:19px;font-weight:600;color:#1a1a2e;">What stopped you from getting the full report?</p>
    <p style="margin:0 0 24px;font-size:14px;color:#555571;line-height:1.6;">
      Yesterday we found ${gapRange} in potential underpayment in your claim. You haven&apos;t unlocked the full report yet &mdash; totally fine, but we&apos;d love to understand why. One tap:
    </p>
    <table width="100%" cellpadding="0" cellspacing="0">${buttons}</table>
    <p style="margin:20px 0 0;font-size:12px;color:#aaa;">One click is all it takes &mdash; no account needed.<br/>Claim ID: ${claimId}</p>
  </td></tr>
  <tr><td style="background:#f5f3ef;border-top:1px solid #e5e2dc;padding:16px 32px;">
    <p style="margin:0;font-size:12px;color:#999;">ClaimGap &mdash; Informational analysis only. Not legal advice.<br/>Questions? <a href="mailto:info@globaldeal.app" style="color:#1a1a2e;">info@globaldeal.app</a></p>
  </td></tr>
</table></td></tr></table>
</body></html>`;
}
