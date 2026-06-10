-- 주신당 재고관리 앱 — 스키마 (v1.0)
-- Supabase SQL Editor에서 그대로 실행하세요.

create extension if not exists pgcrypto;

-- 직원
create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null check (role in ('admin', 'staff')) default 'staff',
  pin text not null,                -- bcrypt 해시 저장 (4자리 PIN)
  is_active boolean not null default true,
  failed_pin_attempts int not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);

-- 품목
create table items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('주류', '맥주', '음료', '소비재', '식재료')),
  unit text not null default '개',   -- 병, 캔, 박스, kg 등
  min_stock numeric not null default 0,
  current_stock numeric not null default 0,  -- 최신 재고 캐시 (stock_logs 입력 시 트리거로 갱신)
  sort_order int not null default 0,         -- 입력 화면 표시 순서 (창고 동선 순)
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- 재고 입력 기록
create table stock_logs (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id),
  quantity numeric not null,
  recorded_by uuid not null references users(id),
  recorded_at timestamptz not null default now()
);

-- 발주 기록
create table orders (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references items(id),
  quantity numeric,                 -- 선택 입력 (nullable)
  status text not null check (status in ('ordered', 'received')) default 'ordered',
  ordered_by uuid not null references users(id),
  ordered_at timestamptz not null default now(),
  received_at timestamptz
);

create index idx_stock_logs_item_date on stock_logs(item_id, recorded_at desc);
create index idx_orders_status on orders(status) where status = 'ordered';

-- 발주 필요 판정 뷰
-- 조건: 활성 품목 AND 현재고 < 기준재고 AND 진행중인 발주(ordered)가 없음
create view v_items_needing_order as
select i.*
from items i
where i.is_active = true
  and i.current_stock < i.min_stock
  and not exists (
    select 1 from orders o
    where o.item_id = i.id and o.status = 'ordered'
  );

-- 재고 입력 시 items.current_stock 자동 갱신 트리거
create function update_item_current_stock() returns trigger as $$
begin
  update items set current_stock = new.quantity where id = new.item_id;
  return new;
end;
$$ language plpgsql;

create trigger trg_stock_logs_update_item
after insert on stock_logs
for each row execute function update_item_current_stock();
