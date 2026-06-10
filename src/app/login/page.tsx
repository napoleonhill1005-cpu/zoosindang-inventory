import { getSupabaseAdmin } from "@/lib/supabase";
import LoginForm from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const supabase = getSupabaseAdmin();
  const { data: users } = await supabase
    .from("users")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-4 py-8">
      <h1 className="text-2xl font-bold">주신당 재고관리</h1>
      <LoginForm users={users ?? []} />
    </div>
  );
}
