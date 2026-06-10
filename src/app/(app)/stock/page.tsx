import { requireSession } from "@/lib/auth-guard";
import { getSupabaseAdmin } from "@/lib/supabase";
import StockInputForm from "@/components/StockInputForm";
import type { Item } from "@/types/db";

export const dynamic = "force-dynamic";

export default async function StockPage() {
  await requireSession();

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("items")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return (
    <div className="flex flex-col">
      <h1 className="px-4 pt-4 text-lg font-bold">재고 입력</h1>
      <StockInputForm items={(data ?? []) as Item[]} />
    </div>
  );
}
