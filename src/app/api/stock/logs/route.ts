import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { kstDateString, kstDayRangeUTC } from "@/lib/date";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") ?? kstDateString();
  const { start, end } = kstDayRangeUTC(date);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("stock_logs")
    .select("id, item_id, quantity, recorded_at, items(name, unit), users(name)")
    .gte("recorded_at", start)
    .lt("recorded_at", end)
    .order("recorded_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "조회 중 오류가 발생했습니다" }, { status: 500 });
  }

  return NextResponse.json({ logs: data ?? [] });
}
