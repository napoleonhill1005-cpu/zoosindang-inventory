"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPinForm() {
  const router = useRouter();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitPin(value: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/verify-admin-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: value }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "PIN이 일치하지 않습니다");
        setPin("");
        return;
      }

      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
      setPin("");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(value: string) {
    const digits = value.replace(/[^0-9]/g, "").slice(0, 4);
    setPin(digits);
    setError(null);
    if (digits.length === 4) {
      void submitPin(digits);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <input
        type="password"
        inputMode="numeric"
        pattern="[0-9]*"
        autoFocus
        maxLength={4}
        value={pin}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
        className="w-40 rounded-xl border border-gray-300 px-4 py-3 text-center text-3xl tracking-[1rem]"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
