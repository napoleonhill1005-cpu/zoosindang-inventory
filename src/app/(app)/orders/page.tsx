import { requireSession } from "@/lib/auth-guard";
import { getSupabaseAdmin } from "@/lib/supabase";
import { formatKstDateTime } from "@/lib/date";
import OrderButton from "@/components/OrderButton";
import ReceiveButton from "@/components/ReceiveButton";
import type { Item } from "@/types/db";

export const dynamic = "force-dynamic";

interface InProgressOrder {
  id: string;
  item_id: string;
  quantity: number | null;
  ordered_at: string;
  items: { name: string; unit: string } | null;
  users: { name: string } | null;
}

export default async function OrdersPage() {
  const session = await requireSession();
  const isAdmin = session.role === "admin";

  const supabase = getSupabaseAdmin();

  const [needingRes, inProgressRes] = await Promise.all([
    supabase.from("v_items_needing_order").select("*").order("sort_order"),
    supabase
      .from("orders")
      .select("id, item_id, quantity, ordered_at, items(name, unit), users(name)")
      .eq("status", "ordered")
      .order("ordered_at", { ascending: false }),
  ]);

  const needingItems = (needingRes.data ?? []) as Item[];
  const inProgressOrders = (inProgressRes.data ?? []) as unknown as InProgressOrder[];

  return (
    <div className="flex flex-col gap-6 p-4">
      <section>
        <h2 className="mb-2 text-lg font-bold">발주 필요 ({needingItems.length})</h2>
        {needingItems.length === 0 ? (
          <p className="rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-600">
            발주가 필요한 품목이 없습니다
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {needingItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 p-3">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-gray-600">
                    현재 {item.current_stock}{item.unit} / 최소 {item.min_stock}
                    {item.unit}
                  </p>
                </div>
                {isAdmin && <OrderButton item={item} />}
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-2 text-lg font-bold">발주중 ({inProgressOrders.length})</h2>
        {inProgressOrders.length === 0 ? (
          <p className="rounded-xl bg-gray-50 p-4 text-center text-sm text-gray-600">
            진행 중인 발주가 없습니다
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {inProgressOrders.map((order) => {
              const item = order.items;
              const orderedByName = order.users?.name;
              return (
                <div key={order.id} className="flex items-center justify-between gap-3 p-3">
                  <div>
                    <p className="font-medium">{item?.name}</p>
                    <p className="text-xs text-gray-600">
                      {order.quantity != null
                        ? `수량: ${order.quantity}${item?.unit ?? ""} · `
                        : ""}
                      {orderedByName}님이 발주 · {formatKstDateTime(order.ordered_at)}
                    </p>
                  </div>
                  {isAdmin && <ReceiveButton orderId={order.id} />}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
