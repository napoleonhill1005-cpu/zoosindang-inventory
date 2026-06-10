import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }
  if (session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (body?.status !== "received") {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("orders")
    .update({ status: "received", received_at: new Date().toISOString() })
    .eq("id", id)
    .eq("status", "ordered");

  if (error) {
    return NextResponse.json({ error: "처리 중 오류가 발생했습니다" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
