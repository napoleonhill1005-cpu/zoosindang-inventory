import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const { name, role, pin } = body ?? {};

  if (
    typeof name !== "string" ||
    !name.trim() ||
    (role !== "admin" && role !== "staff") ||
    typeof pin !== "string" ||
    !/^\d{4}$/.test(pin)
  ) {
    return NextResponse.json({ error: "잘못된 입력입니다" }, { status: 400 });
  }

  const hash = await bcrypt.hash(pin, 10);

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("users").insert({
    name: name.trim(),
    role,
    pin: hash,
  });

  if (error) {
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
