create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'staff',
  created_at timestamptz not null default now()
);

create table if not exists public.product_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text unique,
  category_id uuid references public.product_categories(id) on delete set null,
  selling_price numeric(12, 2) not null check (selling_price >= 0),
  hpp numeric(12, 2) not null default 0 check (hpp >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  cashier_id uuid not null references public.profiles(id) on delete restrict,
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  total numeric(12, 2) not null check (total >= 0),
  payment_method text not null default 'cash',
  created_at timestamptz not null default now()
);

create table if not exists public.sales_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.sales(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  qty integer not null check (qty > 0),
  price numeric(12, 2) not null check (price >= 0),
  hpp numeric(12, 2) not null default 0 check (hpp >= 0),
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  phone text,
  address text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text unique,
  unit text not null default 'pcs',
  supplier_id uuid references public.suppliers(id) on delete set null,
  min_stock numeric(12, 3) not null default 0 check (min_stock >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  ingredient_id uuid not null references public.ingredients(id) on delete restrict,
  movement_type text not null check (movement_type in ('in', 'out', 'adjustment')),
  quantity_delta numeric(12, 3) not null check (quantity_delta <> 0),
  reference_type text,
  reference_id uuid,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_products_is_active on public.products(is_active);
create index if not exists idx_sales_cashier_id on public.sales(cashier_id);
create index if not exists idx_sales_created_at on public.sales(created_at desc);
create index if not exists idx_sales_items_sale_id on public.sales_items(sale_id);
create index if not exists idx_sales_items_product_id on public.sales_items(product_id);
create index if not exists idx_ingredients_supplier_id on public.ingredients(supplier_id);
create index if not exists idx_ingredients_is_active on public.ingredients(is_active);
create index if not exists idx_inventory_movements_ingredient_id on public.inventory_movements(ingredient_id);
create index if not exists idx_inventory_movements_created_at on public.inventory_movements(created_at desc);
create index if not exists idx_inventory_movements_reference on public.inventory_movements(reference_type, reference_id);

alter table public.profiles enable row level security;
alter table public.product_categories enable row level security;
alter table public.products enable row level security;
alter table public.sales enable row level security;
alter table public.sales_items enable row level security;
alter table public.suppliers enable row level security;
alter table public.ingredients enable row level security;
alter table public.inventory_movements enable row level security;

drop policy if exists "Authenticated users can read profiles" on public.profiles;
create policy "Authenticated users can read profiles"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Authenticated users can manage product categories" on public.product_categories;
create policy "Authenticated users can manage product categories"
on public.product_categories
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage products" on public.products;
create policy "Authenticated users can manage products"
on public.products
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage sales" on public.sales;
create policy "Authenticated users can manage sales"
on public.sales
for all
to authenticated
using (true)
with check (true);

drop policy if exists "Authenticated users can manage sales items" on public.sales_items;
create policy "Authenticated users can manage sales items"
on public.sales_items
for all
to authenticated
using (true)
with check (true);

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
