import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ admin: false });
    const session = await verifyAdminToken(token);
    if (!session) return NextResponse.json({ admin: false });
    return NextResponse.json({ admin: true, email: session.email });
  } catch {
    return NextResponse.json({ admin: false });
  }
}
