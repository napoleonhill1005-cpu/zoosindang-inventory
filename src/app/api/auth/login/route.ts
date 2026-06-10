import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "@/lib/supabase";
import { createSession } from "@/lib/session";

const MAX_ATTEMPTS = 5;
const LOCK_SECONDS = 60;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const userId = body?.user_id;
  const pin = body?.pin;

  if (typeof userId !== "string" || typeof pin !== "string") {
    return NextResponse.json({ error: "잘못된 요청입니다" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: user, error } = await supabase
    .from("users")
    .select("id, name, role, pin, is_active, failed_pin_attempts, locked_until")
    .eq("id", userId)
    .maybeSingle();

  if (error || !user || !user.is_active) {
    return NextResponse.json({ error: "사용자를 찾을 수 없습니다" }, { status: 404 });
  }

  if (user.locked_until && new Date(user.locked_until) > new Date()) {
    return NextResponse.json(
      { error: "PIN을 5회 잘못 입력하여 잠시 잠겼습니다. 잠시 후 다시 시도해주세요." },
      { status: 423 }
    );
  }

  const valid = await bcrypt.compare(pin, user.pin);

  if (!valid) {
    const attempts = user.failed_pin_attempts + 1;
    const update: { failed_pin_attempts: number; locked_until?: string } = {
      failed_pin_attempts: attempts,
    };
    if (attempts >= MAX_ATTEMPTS) {
      update.failed_pin_attempts = 0;
      update.locked_until = new Date(Date.now() + LOCK_SECONDS * 1000).toISOString();
    }
    await supabase.from("users").update(update).eq("id", user.id);

    return NextResponse.json({ error: "PIN이 일치하지 않습니다" }, { status: 401 });
  }

  await supabase
    .from("users")
    .update({ failed_pin_attempts: 0, locked_until: null })
    .eq("id", user.id);

  await createSession({ sub: user.id, name: user.name, role: user.role });

  return NextResponse.json({ ok: true });
}
