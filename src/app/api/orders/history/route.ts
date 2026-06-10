import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, item_id, quantity, status, ordered_at, received_at, items(name, unit), users(name)"
    )
    .order("ordered_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: "조회 중 오류가 발생했습니다" }, { status: 500 });
  }

  return NextResponse.json({ orders: data ?? [] });
}
