import { NextResponse } from "next/server";
import { getAdminEmails, ADMIN_COOKIE_NAME, signAdminToken } from "@/lib/admin-auth";

export const runtime = "edge";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const secret = typeof body.secret === "string" ? body.secret : "";

    const expected = process.env.ADMIN_SECRET;
    if (!expected || secret !== expected) {
      return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
    }

    const allowed = getAdminEmails();
    if (!allowed.length) {
      return NextResponse.json({ error: "Admin emails not configured." }, { status: 500 });
    }
    if (!allowed.includes(email)) {
      return NextResponse.json({ error: "Email not authorized." }, { status: 403 });
    }

    const token = await signAdminToken(email);

    const res = NextResponse.json({ ok: true });
    res.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
