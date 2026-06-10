"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface UserOption {
  id: string;
  name: string;
}

export default function LoginForm({ users }: { users: UserOption[] }) {
  const router = useRouter();
  const [selected, setSelected] = useState<UserOption | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitPin(value: string) {
    if (!selected) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: selected.id, pin: value }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "로그인에 실패했습니다");
        setPin("");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      setPin("");
    } finally {
      setLoading(false);
    }
  }

  function handlePinChange(value: string) {
    const digits = value.replace(/[^0-9]/g, "").slice(0, 4);
    setPin(digits);
    setError(null);
    if (digits.length === 4) {
      void submitPin(digits);
    }
  }

  if (!selected) {
    return (
      <div className="grid w-full max-w-sm grid-cols-2 gap-3">
        {users.map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => setSelected(u)}
            className="rounded-2xl border border-gray-200 bg-white py-6 text-lg font-semibold shadow-sm active:scale-95"
          >
            {u.name}
          </button>
        ))}
        {users.length === 0 && (
          <p className="col-span-2 text-center text-sm text-gray-500">
            등록된 직원이 없습니다. 관리자에게 문의하세요.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-4">
      <div className="text-lg">
        <span className="font-bold">{selected.name}</span>님, PIN을 입력하세요
      </div>
      <input
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        autoFocus
        maxLength={4}
        value={pin}
        onChange={(e) => handlePinChange(e.target.value)}
        disabled={loading}
        className="w-40 rounded-xl border border-gray-300 px-4 py-3 text-center text-3xl tracking-[1rem]"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={() => {
          setSelected(null);
          setPin("");
          setError(null);
        }}
        className="text-sm text-gray-500 underline"
      >
        다른 사람으로 로그인
      </button>
    </div>
  );
}
