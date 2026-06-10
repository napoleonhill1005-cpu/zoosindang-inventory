"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, type Category, type Item } from "@/types/db";

interface ItemFormState {
  name: string;
  category: Category;
  unit: string;
  min_stock: string;
  current_stock: string;
  sort_order: string;
  is_active: boolean;
}

const emptyForm: ItemFormState = {
  name: "",
  category: CATEGORIES[0],
  unit: "",
  min_stock: "",
  current_stock: "",
  sort_order: "",
  is_active: true,
};

export default function ItemsAdmin({ items }: { items: Item[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Item | "new" | null>(null);
  const [form, setForm] = useState<ItemFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openNew() {
    setForm(emptyForm);
    setError(null);
    setEditing("new");
  }

  function openEdit(item: Item) {
    setForm({
      name: item.name,
      category: item.category,
      unit: item.unit,
      min_stock: String(item.min_stock),
      current_stock: String(item.current_stock),
      sort_order: String(item.sort_order),
      is_active: item.is_active,
    });
    setError(null);
    setEditing(item);
  }

  function close() {
    setEditing(null);
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError("품목명을 입력해주세요");
      return;
    }
    if (!form.unit.trim()) {
      setError("단위를 입력해주세요");
      return;
    }

    setSubmitting(true);
    setError(null);

    const isNew = editing === "new";
    const payload: Record<string, unknown> = {
      name: form.name.trim(),
      category: form.category,
      unit: form.unit.trim(),
      min_stock: Number(form.min_stock) || 0,
      sort_order: Number(form.sort_order) || 0,
    };
    if (isNew) {
      payload.current_stock = Number(form.current_stock) || 0;
    } else {
      payload.is_active = form.is_active;
    }

    try {
      const url = isNew ? "/api/items" : `/api/items/${(editing as Item).id}`;
      const method = isNew ? "POST" : "PATCH";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "저장에 실패했습니다");
        return;
      }

      setEditing(null);
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={openNew}
        className="rounded-xl bg-blue-600 py-3 font-bold text-white"
      >
        + 품목 추가
      </button>

      <div className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openEdit(item)}
            className="flex items-center justify-between p-3 text-left"
          >
            <div>
              <p className={`font-medium ${item.is_active ? "" : "text-gray-600 line-through"}`}>
                {item.name}
              </p>
              <p className="text-xs text-gray-600">
                {item.category} · 단위 {item.unit} · 최소 {item.min_stock} · 현재{" "}
                {item.current_stock}
              </p>
            </div>
            <span className="text-gray-300">›</span>
          </button>
        ))}
        {items.length === 0 && (
          <p className="p-4 text-center text-sm text-gray-600">등록된 품목이 없습니다</p>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={close}>
          <div
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-bold">
              {editing === "new" ? "품목 추가" : "품목 수정"}
            </h3>

            <div className="flex flex-col gap-3">
              <Field label="품목명">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2"
                />
              </Field>

              <Field label="카테고리">
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value as Category }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-2"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="단위 (예: 병, 캔, 박스)">
                <input
                  type="text"
                  value={form.unit}
                  onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2"
                />
              </Field>

              <Field label="최소 재고">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.min_stock}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, min_stock: e.target.value.replace(/[^0-9]/g, "") }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-2"
                />
              </Field>

              {editing === "new" && (
                <Field label="현재 재고">
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={form.current_stock}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        current_stock: e.target.value.replace(/[^0-9]/g, ""),
                      }))
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-2"
                  />
                </Field>
              )}

              <Field label="표시 순서 (작을수록 위에 표시)">
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.sort_order}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sort_order: e.target.value.replace(/[^0-9]/g, "") }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-2"
                />
              </Field>

              {editing !== "new" && (
                <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
                  <span className="text-sm">사용 중 (해제 시 입력 화면에서 숨겨집니다)</span>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    className="h-5 w-5"
                  />
                </label>
              )}
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={close}
                className="flex-1 rounded-xl border border-gray-300 py-3 font-bold text-gray-600"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-xl bg-blue-600 py-3 font-bold text-white disabled:bg-gray-300"
              >
                {submitting ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm text-gray-600">{label}</span>
      {children}
    </label>
  );
}
