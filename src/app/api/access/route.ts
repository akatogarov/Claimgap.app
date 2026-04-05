import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getServiceSupabase } from "@/lib/supabase-server";
import { publicSiteOrigin } from "@/lib/public-url";

export const runtime = "edge";

// Allow re-access for reports up to 90 days old
const ACCESS_WINDOW_DAYS = 90;

export async function POST(request: Request) {
  let body: { email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Enter a valid email address." },
      { status: 400 }
    );
  }

  const supabase = getServiceSupabase();
  const since = new Date(
    Date.now() - ACCESS_WINDOW_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: claims, error } = await supabase
    .from("claims")
    .select("id, created_at, insurance_type, insurer, offer_amount")
    .eq("email", email)
    .eq("status", "paid")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("access lookup:", error);
    return NextResponse.json(
      { error: "Could not look up your account." },
      { status: 500 }
    );
  }

  // Always return ok=true to prevent email enumeration
  if (!claims || claims.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ ok: true });
  }

  const resend = new Resend(resendKey);
  const from =
    process.env.RESEND_FROM_EMAIL ?? "ClaimGap <onboarding@resend.dev>";
  const baseUrl = publicSiteOrigin();

  const reportRows = claims
    .map((c) => {
      const date = new Date(c.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      const url = `${baseUrl}/result/${c.id}`;
      return `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #f0ede8;">
          <a href="${url}" style="font-size:14px;font-weight:600;color:#1a1a2e;text-decoration:none;">
            ${c.insurance_type} claim · ${c.insurer ?? "Unknown insurer"}
          </a>
          <br/>
          <span style="font-size:12px;color:#888;">Created ${date}</span>
        </td>
        <td style="padding:10px 0 10px 16px;border-bottom:1px solid #f0ede8;text-align:right;">
          <a href="${url}" style="display:inline-block;background:#1a1a2e;color:#fff;text-decoration:none;font-size:13px;font-weight:600;padding:8px 16px;border-radius:5px;">
            View report →
          </a>
        </td>
      </tr>`;
    })
    .join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f3ef;font-family:'Helvetica Neue',Arial,sans-serif;color:#1a1a2e;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ef;padding:40px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border:1px solid #e5e2dc;border-radius:8px;overflow:hidden;">
      <tr><td style="background:#1a1a2e;padding:24px 32px;">
        <p style="margin:0;font-size:18px;font-weight:700;color:#fff;">ClaimGap</p>
        <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.55);text-transform:uppercase;letter-spacing:0.05em;">Report Access</p>
      </td></tr>
      <tr><td style="padding:32px;">
        <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#1a1a2e;">Your report link${claims.length > 1 ? "s" : ""}</p>
        <p style="margin:0 0 24px;font-size:14px;color:#555571;line-height:1.6;">
          Here ${claims.length > 1 ? "are your recent ClaimGap reports" : "is your ClaimGap report"}. Click to view or download as PDF.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">${reportRows}</table>
        <p style="margin:24px 0 0;font-size:12px;color:#aaa;line-height:1.6;">
          Keep these links safe &mdash; they&apos;re your access to your reports.<br/>
          Reports are accessible for ${ACCESS_WINDOW_DAYS} days from purchase.
        </p>
      </td></tr>
      <tr><td style="background:#f5f3ef;border-top:1px solid #e5e2dc;padding:20px 32px;">
        <p style="margin:0;font-size:12px;color:#999;">ClaimGap &mdash; Informational analysis only. Not legal advice.<br/>
        Questions? <a href="mailto:info@globaldeal.app" style="color:#1a1a2e;">info@globaldeal.app</a></p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;

  try {
    await resend.emails.send({
      from,
      to: email,
      subject: `Your ClaimGap report link${claims.length > 1 ? "s" : ""}`,
      html,
    });
  } catch (e) {
    console.error("access email send failed:", e);
  }

  return NextResponse.json({ ok: true });
}
