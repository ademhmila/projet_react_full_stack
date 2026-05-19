-- 2024-06-01: Create core schema and RLS policies

-- -------------------------------------------------
-- 1️⃣ products
-- -------------------------------------------------
create table public.products (
  id          uuid          primary key default gen_random_uuid(),
  title       text          not null,
  description text,
  category    text,
  price       numeric(10,2) not null,
  stock       int           default 0,
  image_url   text,
  created_at  timestamp     default now(),
  updated_at  timestamp     default now()
);

-- -------------------------------------------------
-- 2️⃣ orders
-- -------------------------------------------------
create table public.orders (
  id          uuid          primary key default gen_random_uuid(),
  user_id     uuid,
  total_price numeric(12,2) not null,
  status      text          default 'pending',
  created_at  timestamp     default now(),
  updated_at  timestamp     default now()
);

-- -------------------------------------------------
-- 3️⃣ order_items (junction table)
-- -------------------------------------------------
create table public.order_items (
  id                uuid          primary key default gen_random_uuid(),
  order_id          uuid          references public.orders(id) on delete cascade,
  product_id        uuid          references public.products(id) on delete set null,
  quantity          int           not null default 1,
  price_at_purchase numeric(10,2) not null,
  created_at        timestamp     default now()
);

-- -------------------------------------------------
-- 4️⃣ reviews
-- -------------------------------------------------
create table public.reviews (
  id          uuid          primary key default gen_random_uuid(),
  product_id  uuid          references public.products(id) on delete cascade,
  user_id     uuid,
  rating      int           not null check (rating between 1 and 5),
  comment     text,
  created_at  timestamp     default now()
);

-- -------------------------------------------------
-- 5️⃣ PUBLIC READ policies (allow anyone to SELECT)
-- -------------------------------------------------
create policy "public read products"   on public.products   for select using (true);
create policy "public read orders"     on public.orders     for select using (true);
create policy "public read order_items" on public.order_items for select using (true);
create policy "public read reviews"    on public.reviews    for select using (true);

-- -------------------------------------------------
-- 6️⃣ PUBLIC WRITE policies (allow anyone to INSERT)
-- -------------------------------------------------
create policy "public insert orders"      on public.orders      for insert with check (true);
create policy "public insert order_items" on public.order_items for insert with check (true);
create policy "public insert reviews"    on public.reviews    for insert with check (true);
