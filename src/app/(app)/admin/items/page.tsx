import { requireAdminVerified } from "@/lib/auth-guard";
import { getSupabaseAdmin } from "@/lib/supabase";
import ItemsAdmin from "@/components/ItemsAdmin";
import type { Item } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function AdminItemsPage() {
  await requireAdminVerified();

  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("items").select("*").order("sort_order");

  return (
    <div className="flex flex-col gap-4 p-4">
      <h1 className="text-lg font-bold">품목 관리</h1>
      <ItemsAdmin items={(data ?? []) as Item[]} />
    </div>
  );
}
