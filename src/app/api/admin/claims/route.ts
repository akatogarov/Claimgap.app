import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";

export const runtime = "edge";

export async function GET() {
  try {
    const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const session = await verifyAdminToken(token);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceSupabase();
    const { data, error } = await supabase
      .from("claims")
      .select("id,email,insurance_type,insurer,state,status,offer_amount,created_at")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Could not load claims." }, { status: 500 });
    }

    return NextResponse.json({ claims: data ?? [], admin: session.email });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
