import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";
import { getServiceSupabase } from "@/lib/supabase-server";

export const runtime = "edge";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const token = cookies().get(ADMIN_COOKIE_NAME)?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const session = await verifyAdminToken(token);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const supabase = getServiceSupabase();
    const { error } = await supabase.from("claims").delete().eq("id", id);
    if (error) {
      console.error(error);
      return NextResponse.json({ error: "Delete failed." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
