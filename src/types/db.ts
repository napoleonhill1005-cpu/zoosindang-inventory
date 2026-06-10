export type Role = "admin" | "staff";

export type Category = "주류" | "맥주" | "음료" | "소비재" | "식재료";

export const CATEGORIES: Category[] = [
  "주류",
  "맥주",
  "음료",
  "소비재",
  "식재료",
];

export type OrderStatus = "ordered" | "received";

export interface User {
  id: string;
  name: string;
  role: Role;
  is_active: boolean;
  failed_pin_attempts: number;
  locked_until: string | null;
  created_at: string;
}

export interface Item {
  id: string;
  name: string;
  category: Category;
  unit: string;
  min_stock: number;
  current_stock: number;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface StockLog {
  id: string;
  item_id: string;
  quantity: number;
  recorded_by: string;
  recorded_at: string;
}

export interface Order {
  id: string;
  item_id: string;
  quantity: number | null;
  status: OrderStatus;
  ordered_by: string;
  ordered_at: string;
  received_at: string | null;
}
