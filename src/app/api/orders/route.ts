import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }
  if (session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const itemId = body?.item_id;
  const quantity = body?.quantity;

  if (typeof itemId !== "string") {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }
  if (
    quantity !== null &&
    quantity !== undefined &&
    (typeof quantity !== "number" || !Number.isFinite(quantity) || quantity < 0)
  ) {
    return NextResponse.json({ error: "잘못된 수량입니다" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // 이미 발주중인 품목이면 중복 발주 방지
  const { data: existing } = await supabase
    .from("orders")
    .select("id")
    .eq("item_id", itemId)
    .eq("status", "ordered")
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "이미 발주중인 품목입니다" }, { status: 409 });
  }

  const { error } = await supabase.from("orders").insert({
    item_id: itemId,
    quantity: quantity ?? null,
    status: "ordered",
    ordered_by: session.sub,
  });

  if (error) {
    return NextResponse.json({ error: "발주 처리 중 오류가 발생했습니다" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
