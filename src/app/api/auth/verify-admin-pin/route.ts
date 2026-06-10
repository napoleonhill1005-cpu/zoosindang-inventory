import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase";
import { getSession, createAdminVerified } from "@/lib/session";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const pin = body?.pin;
  if (typeof pin !== "string") {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: user, error } = await supabase
    .from("users")
    .select("pin")
    .eq("id", session.sub)
    .maybeSingle();

  if (error || !user) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
  }

  const valid = await bcrypt.compare(pin, user.pin);
  if (!valid) {
    return NextResponse.json({ error: "PIN이 일치하지 않습니다" }, { status: 401 });
  }

  await createAdminVerified();
  return NextResponse.json({ ok: true });
}
