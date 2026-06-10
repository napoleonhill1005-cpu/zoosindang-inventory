"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Role, User } from "@/types/db";

interface UserFormState {
  name: string;
  role: Role;
  is_active: boolean;
  pin: string;
  pinConfirm: string;
}

const emptyForm: UserFormState = {
  name: "",
  role: "staff",
  is_active: true,
  pin: "",
  pinConfirm: "",
};

export default function UsersAdmin({
  users,
  currentUserId,
}: {
  users: User[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<User | "new" | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSelf = editing !== "new" && editing !== null && editing.id === currentUserId;

  function openNew() {
    setForm(emptyForm);
    setError(null);
    setEditing("new");
  }

  function openEdit(user: User) {
    setForm({
      name: user.name,
      role: user.role,
      is_active: user.is_active,
      pin: "",
      pinConfirm: "",
    });
    setError(null);
    setEditing(user);
  }

  function close() {
    setEditing(null);
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError("이름을 입력해주세요");
      return;
    }

    const isNew = editing === "new";
    const pinChanged = form.pin !== "" || form.pinConfirm !== "";

    if (isNew || pinChanged) {
      if (!/^\d{4}$/.test(form.pin)) {
        setError("PIN은 4자리 숫자로 입력해주세요");
        return;
      }
      if (form.pin !== form.pinConfirm) {
        setError("PIN이 일치하지 않습니다");
        return;
      }
    }

    setSubmitting(true);
    setError(null);

    const payload: Record<string, unknown> = isNew
      ? { name: form.name.trim(), role: form.role, pin: form.pin }
      : {
          name: form.name.trim(),
          role: form.role,
          is_active: form.is_active,
          ...(form.pin ? { pin: form.pin } : {}),
        };

    try {
      const url = isNew ? "/api/users" : `/api/users/${(editing as User).id}`;
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
        + 직원 추가
      </button>

      <div className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
        {users.map((user) => {
          const locked = !!user.locked_until && new Date(user.locked_until) > new Date();
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => openEdit(user)}
              className="flex items-center justify-between p-3 text-left"
            >
              <div>
                <p className={`font-medium ${user.is_active ? "" : "text-gray-600 line-through"}`}>
                  {user.name}
                  {user.id === currentUserId && (
                    <span className="ml-1 text-xs text-gray-600">(나)</span>
                  )}
                </p>
                <p className="text-xs text-gray-600">
                  {user.role === "admin" ? "관리자" : "직원"}
                  {locked && " · PIN 잠김"}
                </p>
              </div>
              <span className="text-gray-300">›</span>
            </button>
          );
        })}
        {users.length === 0 && (
          <p className="p-4 text-center text-sm text-gray-600">등록된 직원이 없습니다</p>
        )}
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/40" onClick={close}>
          <div
            className="max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-lg font-bold">
              {editing === "new" ? "직원 추가" : "직원 정보 수정"}
            </h3>

            <div className="flex flex-col gap-3">
              <Field label="이름">
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2"
                />
              </Field>

              <Field label="권한">
                <select
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
                  disabled={isSelf}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 disabled:bg-gray-100"
                >
                  <option value="staff">직원</option>
                  <option value="admin">관리자</option>
                </select>
              </Field>

              {editing !== "new" && (
                <label
                  className={`flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 ${
                    isSelf ? "opacity-50" : ""
                  }`}
                >
                  <span className="text-sm">사용 중 (해제 시 로그인할 수 없습니다)</span>
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                    disabled={isSelf}
                    className="h-5 w-5"
                  />
                </label>
              )}

              <Field label={editing === "new" ? "PIN (4자리)" : "새 PIN (변경할 때만 입력)"}>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={form.pin}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, pin: e.target.value.replace(/[^0-9]/g, "").slice(0, 4) }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 tracking-[0.5rem]"
                />
              </Field>

              <Field label={editing === "new" ? "PIN 확인" : "새 PIN 확인"}>
                <input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  value={form.pinConfirm}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      pinConfirm: e.target.value.replace(/[^0-9]/g, "").slice(0, 4),
                    }))
                  }
                  className="w-full rounded-xl border border-gray-300 px-4 py-2 tracking-[0.5rem]"
                />
              </Field>

              {isSelf && (
                <p className="text-xs text-gray-600">
                  본인 계정의 권한/사용 여부는 변경할 수 없습니다
                </p>
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
