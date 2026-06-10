import { requireAdminVerified } from "@/lib/auth-guard";
import { getSupabaseAdmin } from "@/lib/supabase";
import UsersAdmin from "@/components/UsersAdmin";
import type { User } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await requireAdminVerified();

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("users")
    .select("id, name, role, is_active, failed_pin_attempts, locked_until, created_at")
    .order("name");

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-lg font-bold">직원 관리</h1>
      <UsersAdmin users={(data ?? []) as User[]} currentUserId={session.sub} />
    </div>
  );
}
