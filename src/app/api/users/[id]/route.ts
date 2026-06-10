import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession } from "@/lib/session";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const { name, role, is_active, pin } = body ?? {};

  if (
    typeof name !== "string" ||
    !name.trim() ||
    (role !== "admin" && role !== "staff") ||
    typeof is_active !== "boolean" ||
    (pin !== undefined && pin !== null && pin !== "" && !/^\d{4}$/.test(pin))
  ) {
    return NextResponse.json({ error: "잘못된 입력입니다" }, { status: 400 });
  }

  // 본인 계정은 권한 변경/비활성화 불가 (관리자 잠김 방지)
  if (id === session.sub && (role !== "admin" || is_active !== true)) {
    return NextResponse.json(
      { error: "본인 계정의 권한은 변경하거나 비활성화할 수 없습니다" },
      { status: 400 }
    );
  }

  const update: Record<string, unknown> = {
    name: name.trim(),
    role,
    is_active,
  };

  if (typeof pin === "string" && pin !== "") {
    update.pin = await bcrypt.hash(pin, 10);
    update.failed_pin_attempts = 0;
    update.locked_until = null;
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("users").update(update).eq("id", id);

  if (error) {
    return NextResponse.json({ error: "저장 중 오류가 발생했습니다" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
