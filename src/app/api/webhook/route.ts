import { NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { getServiceSupabase } from "@/lib/supabase-server";
import { runFullAnalysis, defaultExtractedFacts } from "@/lib/anthropic";
import type { FullAnalysis, StoredAnalysis } from "@/lib/types";

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
    event = stripe.webhooks.constructEvent(rawBody, sig, whSecret);
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

    const nextAnalysis: StoredAnalysis = {
      preview: analysis?.preview ?? null,
      full,
      extracted,
      extracted_facts: analysis?.extracted_facts,
    };

    const { error: upErr } = await supabase
      .from("claims")
      .update({
        status: "paid",
        analysis: nextAnalysis as unknown as Record<string, unknown>,
      })
      .eq("id", resolvedClaimId);

    if (upErr) {
      console.error(upErr);
      return NextResponse.json({ received: true });
    }

    const baseUrl = (process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000").replace(/\/$/, "");
    const resultUrl = `${baseUrl}/result/${resolvedClaimId}`;

    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      const resend = new Resend(resendKey);
      try {
        const from = process.env.RESEND_FROM_EMAIL ?? "ClaimGap <onboarding@resend.dev>";
        await resend.emails.send({
          from,
          to: claim.email,
          subject: "Your ClaimGap analysis is ready",
          html: `<p>Hi,</p><p>Your full claim analysis is ready. View it here:</p><p><a href="${resultUrl}">${resultUrl}</a></p><p>— ClaimGap</p>`,
        });
      } catch (mailErr) {
        console.error(mailErr);
      }
    }
  }

  return NextResponse.json({ received: true });
}
