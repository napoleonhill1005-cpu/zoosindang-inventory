"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ReceiveButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleClick() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "received" }),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={submitting}
      className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white active:scale-95 disabled:bg-gray-300"
    >
      {submitting ? "처리 중..." : "입고완료"}
    </button>
  );
}
