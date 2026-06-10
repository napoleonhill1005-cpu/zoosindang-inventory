"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, type Item } from "@/types/db";

export default function StockInputForm({ items }: { items: Item[] }) {
  const router = useRouter();

  const categories = useMemo(
    () => CATEGORIES.filter((c) => items.some((i) => i.category === c)),
    [items]
  );

  const [activeCategory, setActiveCategory] = useState<string>("전체");
  const [search, setSearch] = useState("");
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(items.map((i) => [i.id, i.current_stock]))
  );
  const [baseline, setBaseline] = useState<Record<string, number>>(() =>
    Object.fromEntries(items.map((i) => [i.id, i.current_stock]))
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = items.filter((item) => {
    if (activeCategory !== "전체" && item.category !== activeCategory) return false;
    if (search.trim() && !item.name.includes(search.trim())) return false;
    return true;
  });

  const changedIds = items
    .filter((item) => quantities[item.id] !== baseline[item.id])
    .map((item) => item.id);

  function setQuantity(id: string, value: number) {
    const clamped = Math.max(0, Math.floor(value));
    setQuantities((prev) => ({ ...prev, [id]: clamped }));
    setMessage(null);
  }

  async function handleSave() {
    if (changedIds.length === 0) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logs: changedIds.map((id) => ({ item_id: id, quantity: quantities[id] })),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error ?? "저장에 실패했습니다");
        return;
      }

      setBaseline((prev) => {
        const next = { ...prev };
        for (const id of changedIds) next[id] = quantities[id];
        return next;
      });
      setMessage(`${changedIds.length}개 품목이 저장되었습니다`);
      router.refresh();
    } catch {
      setMessage("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col pb-28">
      <div className="px-4 pt-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="품목 검색"
          className="w-full rounded-xl border border-gray-300 px-4 py-2 text-base"
        />
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {["전체", ...categories].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
              activeCategory === cat
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-col divide-y divide-gray-100 px-4">
        {filtered.map((item) => (
          <div key={item.id} className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-gray-600">
                단위: {item.unit} · 최소: {item.min_stock}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQuantity(item.id, quantities[item.id] - 1)}
                className="h-10 w-10 rounded-lg border border-gray-300 text-xl font-bold active:bg-gray-100"
              >
                −
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={quantities[item.id]}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9]/g, "");
                  setQuantity(item.id, v === "" ? 0 : parseInt(v, 10));
                }}
                className="w-14 rounded-lg border border-gray-300 py-2 text-center text-lg"
              />
              <button
                type="button"
                onClick={() => setQuantity(item.id, quantities[item.id] + 1)}
                className="h-10 w-10 rounded-lg border border-gray-300 text-xl font-bold active:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-600">표시할 품목이 없습니다</p>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-gray-200 bg-white px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
        {message && <p className="mb-2 text-center text-sm text-gray-600">{message}</p>}
        <button
          type="button"
          onClick={handleSave}
          disabled={changedIds.length === 0 || saving}
          className="w-full rounded-2xl bg-blue-600 py-4 text-lg font-bold text-white disabled:bg-gray-300"
        >
          {saving
            ? "저장 중..."
            : changedIds.length > 0
              ? `${changedIds.length}개 품목 저장`
              : "변경된 품목 없음"}
        </button>
      </div>
    </div>
  );
}
