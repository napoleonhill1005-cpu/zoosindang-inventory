"use client";

import { useEffect, useState } from "react";
import { kstDateString, formatKstDateTime } from "@/lib/date";

interface StockLogEntry {
  id: string;
  item_id: string;
  quantity: number;
  recorded_at: string;
  items: { name: string; unit: string } | null;
  users: { name: string } | null;
}

interface OrderHistoryEntry {
  id: string;
  item_id: string;
  quantity: number | null;
  status: "ordered" | "received";
  ordered_at: string;
  received_at: string | null;
  items: { name: string; unit: string } | null;
  users: { name: string } | null;
}

export default function HistoryView() {
  const [tab, setTab] = useState<"stock" | "orders">("stock");
  const [date, setDate] = useState(kstDateString());
  const [stockLogs, setStockLogs] = useState<StockLogEntry[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tab !== "stock") return;
    let cancelled = false;
    fetch(`/api/stock/logs?date=${date}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setStockLogs(data.logs ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab, date]);

  useEffect(() => {
    if (tab !== "orders") return;
    let cancelled = false;
    fetch("/api/orders/history")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setOrderHistory(data.orders ?? []);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [tab]);

  function selectTab(next: "stock" | "orders") {
    if (next !== tab) {
      setLoading(true);
      setTab(next);
    }
  }

  function selectDate(next: string) {
    setLoading(true);
    setDate(next);
  }

  return (
    <div className="flex flex-col">
      <div className="flex border-b border-gray-200">
        <TabButton active={tab === "stock"} onClick={() => selectTab("stock")}>
          재고기록
        </TabButton>
        <TabButton active={tab === "orders"} onClick={() => selectTab("orders")}>
          발주기록
        </TabButton>
      </div>

      {tab === "stock" && (
        <div className="flex flex-col gap-3 p-4">
          <input
            type="date"
            value={date}
            max={kstDateString()}
            onChange={(e) => selectDate(e.target.value)}
            className="rounded-xl border border-gray-300 px-4 py-2 text-base"
          />
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-600">불러오는 중...</p>
          ) : stockLogs.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-600">
              해당 날짜에 입력된 기록이 없습니다
            </p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
              {stockLogs.map((log) => {
                const item = log.items;
                const userName = log.users?.name;
                return (
                  <div key={log.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-medium">{item?.name}</p>
                      <p className="text-xs text-gray-600">
                        {userName}님 · {formatKstDateTime(log.recorded_at)}
                      </p>
                    </div>
                    <p className="text-lg font-bold">
                      {log.quantity}
                      {item?.unit}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "orders" && (
        <div className="flex flex-col gap-3 p-4">
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-600">불러오는 중...</p>
          ) : orderHistory.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-600">발주 기록이 없습니다</p>
          ) : (
            <div className="flex flex-col divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
              {orderHistory.map((order) => {
                const item = order.items;
                const userName = order.users?.name;
                return (
                  <div key={order.id} className="flex items-center justify-between p-3">
                    <div>
                      <p className="font-medium">{item?.name}</p>
                      <p className="text-xs text-gray-600">
                        {order.quantity != null
                          ? `수량: ${order.quantity}${item?.unit ?? ""} · `
                          : ""}
                        {userName}님 · {formatKstDateTime(order.ordered_at)}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                        order.status === "received"
                          ? "bg-gray-100 text-gray-500"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {order.status === "received" ? "입고완료" : "발주중"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-3 text-center font-bold ${
        active ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-600"
      }`}
    >
      {children}
    </button>
  );
}
