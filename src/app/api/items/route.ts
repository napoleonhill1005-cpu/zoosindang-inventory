import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { CATEGORIES } from "@/types/db";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const { name, category, unit, min_stock, current_stock, sort_order } = body ?? {};

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof category !== "string" ||
    !(CATEGORIES as string[]).includes(category) ||
    typeof unit !== "string" ||
    !unit.trim() ||
    typeof min_stock !== "number" ||
    !Number.isFinite(min_stock) ||
    min_stock < 0 ||
    typeof current_stock !== "number" ||
    !Number.isFinite(current_stock) ||
    current_stock < 0 ||
    typeof sort_order !== "number" ||
    !Number.isFinite(sort_order)
  ) {
    return NextResponse.json({ error: "잘못된 입력입니다" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("items").insert({
    name: name.trim(),
    category,
    unit: unit.trim(),
    min_stock,
    current_stock,
    sort_order,
  });

  if (error) {
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
