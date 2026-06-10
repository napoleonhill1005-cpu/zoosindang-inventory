import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const logs = body?.logs;

  if (!Array.isArray(logs) || logs.length === 0) {
    return NextResponse.json({ error: "변경된 품목이 없습니다" }, { status: 400 });
  }

  const rows: { item_id: string; quantity: number; recorded_by: string }[] = [];
  for (const log of logs) {
    if (
      typeof log?.item_id !== "string" ||
      typeof log?.quantity !== "number" ||
      !Number.isFinite(log.quantity) ||
      log.quantity < 0
    ) {
      return NextResponse.json({ error: "잘못된 입력입니다" }, { status: 400 });
    }
    rows.push({
      item_id: log.item_id,
      quantity: log.quantity,
      recorded_by: session.sub,
    });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("stock_logs").insert(rows);

  if (error) {
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
