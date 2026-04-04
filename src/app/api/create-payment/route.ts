import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getServiceSupabase } from "@/lib/supabase-server";
import { publicSiteOrigin } from "@/lib/public-url";

export const runtime = 'edge';

function stripeClient() {
  const raw = process.env.STRIPE_SECRET_KEY;
  if (!raw?.trim()) {
    throw new Error("Missing STRIPE_SECRET_KEY — add it in your host env (e.g. Cloudflare Pages → Settings → Environment variables).");
  }
  const key = raw.trim().replace(/^["']|["']$/g, "");
  if (!key.startsWith("sk_")) {
    throw new Error(
      "STRIPE_SECRET_KEY must be a Secret key starting with sk_test_ or sk_live_ (not pk_ publishable, not a restricted key without Checkout permissions)."
    );
  }
  return new Stripe(key, {
    apiVersion: "2025-02-24.acacia",
    httpClient: Stripe.createFetchHttpClient(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const claimId = typeof body.claim_id === "string" ? body.claim_id : "";
    if (!claimId) {
      return NextResponse.json({ error: "claim_id required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();
    const { data: claim, error } = await supabase.from("claims").select("id,status,email").eq("id", claimId).single();
    if (error || !claim) {
      return NextResponse.json({ error: "Claim not found." }, { status: 404 });
    }
    if (claim.status !== "preview") {
      return NextResponse.json({ error: "This claim is not awaiting payment." }, { status: 400 });
    }

    const baseUrl = publicSiteOrigin();

    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: 14900,
            product_data: {
              name: "ClaimGap — Full claim analysis",
              description: "Unlock full policy analysis, counter-offer letter, and escalation plan.",
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/result/${claimId}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/preview/${claimId}`,
      customer_email: claim.email ?? undefined,
      metadata: { claim_id: claimId },
      payment_intent_data: {
        metadata: { claim_id: claimId },
      },
    });

    await supabase.from("claims").update({ stripe_session_id: session.id }).eq("id", claimId);

    return NextResponse.json({ url: session.url });
  } catch (e) {
    console.error(e);
    const authFail = e instanceof Stripe.errors.StripeAuthenticationError;
    const msg = authFail
      ? "Stripe rejected the secret key. Copy a fresh Secret key from Stripe Dashboard → Developers → API keys (same mode: Test vs Live). Remove spaces/quotes in Cloudflare env."
      : e instanceof Error
        ? e.message
        : "Payment could not be started.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
