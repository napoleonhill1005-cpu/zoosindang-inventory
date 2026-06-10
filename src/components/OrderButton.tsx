"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Item } from "@/types/db";

export default function OrderButton({ item }: { item: Item }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: item.id,
          quantity: quantity.trim() === "" ? null : Number(quantity),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "발주 처리에 실패했습니다");
        return;
      }

      setOpen(false);
      setQuantity("");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white active:scale-95"
      >
        발주
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full rounded-t-2xl bg-white p-4 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-1 text-lg font-bold">{item.name} 발주</h3>
            <p className="mb-4 text-sm text-gray-600">
              현재 {item.current_stock}{item.unit} / 최소 {item.min_stock}
              {item.unit}
            </p>
            <label className="mb-1 block text-sm text-gray-600">발주 수량 (선택)</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="입력하지 않아도 됩니다"
              className="mb-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-lg"
            />
            {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-gray-300 py-3 font-bold text-gray-600"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="flex-1 rounded-xl bg-emerald-600 py-3 font-bold text-white disabled:bg-gray-300"
              >
                {submitting ? "처리 중..." : "발주 확정"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
