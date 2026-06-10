import Link from "next/link";
import { requireSession } from "@/lib/auth-guard";
import { getSupabaseAdmin } from "@/lib/supabase";
import { kstDateString, kstDayRangeUTC } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await requireSession();
  const supabase = getSupabaseAdmin();

  const { start: todayStart } = kstDayRangeUTC(kstDateString());

  const [needingOrderRes, orderedRes, todayLogRes] = await Promise.all([
    supabase
      .from("v_items_needing_order")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("status", "ordered"),
    supabase.from("stock_logs").select("id").gte("recorded_at", todayStart).limit(1),
  ]);

  const needingOrderCount = needingOrderRes.count ?? 0;
  const orderedCount = orderedRes.count ?? 0;
  const hasTodayLog = (todayLogRes.data?.length ?? 0) > 0;

  return (
    <div className="flex flex-col gap-6 p-4">
      <section className="grid grid-cols-3 gap-3">
        <StatusCard
          href="/orders"
          label="발주 필요"
          value={`${needingOrderCount}건`}
          highlight={needingOrderCount > 0}
        />
        <StatusCard href="/orders" label="발주중" value={`${orderedCount}건`} />
        <StatusCard
          href="/stock"
          label="오늘 입력"
          value={hasTodayLog ? "완료" : "미완료"}
          highlight={!hasTodayLog}
        />
      </section>

      <section className="flex flex-col gap-3">
        <Link
          href="/stock"
          className="rounded-2xl bg-blue-600 py-6 text-center text-xl font-bold text-white shadow-sm active:scale-95"
        >
          재고 입력
        </Link>
        <Link
          href="/orders"
          className="rounded-2xl bg-emerald-600 py-6 text-center text-xl font-bold text-white shadow-sm active:scale-95"
        >
          발주 확인
        </Link>
      </section>

      <section className="flex flex-col items-center gap-2 text-sm text-gray-500">
        <Link href="/history" className="underline">
          기록 조회
        </Link>
        {session.role === "admin" && (
          <Link href="/admin" className="underline">
            관리자 설정
          </Link>
        )}
      </section>
    </div>
  );
}

function StatusCard({
  href,
  label,
  value,
  highlight,
}: {
  href: string;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-1 rounded-xl border p-3 text-center shadow-sm ${
        highlight ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"
      }`}
    >
      <span className="text-xs text-gray-500">{label}</span>
      <span className={`text-lg font-bold ${highlight ? "text-red-600" : "text-gray-900"}`}>
        {value}
      </span>
    </Link>
  );
}
