create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  address text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text unique,
  unit text not null default 'pcs',
  minimum_stock numeric(12, 3) not null default 0 check (minimum_stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references public.ingredients(id) on delete restrict,
  type text not null check (type in ('stock_in', 'stock_out', 'adjustment_in', 'adjustment_out', 'waste')),
  qty numeric(12, 3) not null check (qty <> 0),
  unit_cost numeric(12, 2) not null default 0 check (unit_cost >= 0),
  total_cost numeric(12, 2) not null default 0 check (total_cost >= 0),
  reference_type text,
  reference_id uuid,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.cash_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('income', 'expense')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (name, type)
);

create table if not exists public.cash_transactions (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.cash_categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric(12, 2) not null check (amount > 0),
  payment_method text not null default 'cash',
  reference_type text,
  reference_id uuid,
  notes text,
  transaction_date date not null default current_date,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_suppliers_is_active on public.suppliers(is_active);
create index if not exists idx_ingredients_is_active on public.ingredients(is_active);
create index if not exists idx_inventory_movements_ingredient_id on public.inventory_movements(ingredient_id);
create index if not exists idx_inventory_movements_type on public.inventory_movements(type);
create index if not exists idx_inventory_movements_created_at on public.inventory_movements(created_at desc);
create index if not exists idx_cash_categories_type on public.cash_categories(type);
create index if not exists idx_cash_transactions_category_id on public.cash_transactions(category_id);
create index if not exists idx_cash_transactions_type on public.cash_transactions(type);
create index if not exists idx_cash_transactions_transaction_date on public.cash_transactions(transaction_date desc);

alter table public.suppliers enable row level security;
alter table public.ingredients enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.cash_categories enable row level security;
alter table public.cash_transactions enable row level security;

drop policy if exists "Authenticated users can manage suppliers" on public.suppliers;
create policy "Authenticated users can manage suppliers"
on public.suppliers
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage ingredients" on public.ingredients;
create policy "Authenticated users can manage ingredients"
on public.ingredients
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage inventory movements" on public.inventory_movements;
create policy "Authenticated users can manage inventory movements"
on public.inventory_movements
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage cash categories" on public.cash_categories;
create policy "Authenticated users can manage cash categories"
on public.cash_categories
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage cash transactions" on public.cash_transactions;
create policy "Authenticated users can manage cash transactions"
on public.cash_transactions
for all
to authenticated
using (true)
with check (true);

insert into public.cash_categories (name, type)
values
  ('Penjualan toko', 'income'),
  ('Modal tambahan', 'income'),
  ('Belanja bahan', 'expense'),
  ('Operasional', 'expense')
on conflict (name, type) do nothing;
