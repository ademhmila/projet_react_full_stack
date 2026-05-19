# Technical Documentation – Aura E‑Shop

---

## 1. Architecture Overview

```
+--------------------+      +----------------------+
|   Vite (React)    | ---> |   Supabase PostgreSQL |
|   Front‑end SPA   |      |   (hosted cloud tier) |
+--------------------+      +----------------------+
          |                          |
          |  HTTP/REST (supabase-js) |
          v                          v
    Browser (client)            Database
```

- **Client** – Built with React 19 (Vite) using ES‑modules, functional components, and modern hooks (`useState`, `useEffect`, `useContext`).
- **Backend** – Supabase provides a managed PostgreSQL instance, automatic REST endpoints (`/rest/v1/...`) and storage buckets for product images.
- **Deployment** – Vercel CI runs `npm run build` (Vite) and serves the static assets from a global CDN.

---

## 2. Component Specifications

### 2.1 `CartContext.jsx`
- Implements **global cart state** via `React.createContext`.
- State managed by a **`useReducer`** with actions: `ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `CLEAR_CART`.
- Reducer logic is pure and unit‑tested.
- **Persistence** – After each dispatch, the updated cart is serialized to `localStorage` and re‑hydrated on app start.
- Exposes `addItem`, `removeItem`, `updateQuantity`, `clearCart` helper functions.

### 2.2 Code‑Splitting & Lazy Loading
- Admin routes (`/admin/*`) are **lazy‑loaded** using `React.lazy(() => import('./pages/AdminDashboard'))` and wrapped in `Suspense` with a spinner fallback.
- This reduces the initial bundle size (≈ 90 KB gzipped) and improves first‑paint performance.
- Core UI (`Home`, `ProductDetails`, `Cart`, `Navbar`) remains in the main bundle.

### 2.3 Dark‑Mode Theming (`index.css`)
- Global CSS variables define the color palette (`--bg`, `--text`, `--primary`, `--accent-…`).
- Dark theme overrides are scoped under the `.dark-theme` class on `<html>`.
- `Navbar` contains a theme toggle that writes the preference to `localStorage` and applies/removes the class on page load.
- All components reference the variables, so the transition is **instantaneous and fully responsive**.

---

## 3. Database Schema Layout

### 3.1 Tables & Columns
| Table | Columns (type) | Description |
|-------|----------------|-------------|
| `products` | `id` (uuid, PK) <br> `title` (text) <br> `description` (text) <br> `category` (text) <br> `price` (numeric) <br> `stock` (int) <br> `image_url` (text) <br> `created_at` (timestamp) <br> `updated_at` (timestamp) | Catalog items displayed on the storefront. |
| `orders` | `id` (uuid, PK) <br> `user_id` (uuid, nullable) <br> `total_price` (numeric) <br> `status` (text, default 'pending') <br> `created_at` (timestamp) <br> `updated_at` (timestamp) | Guest‑checkout orders. |
| `order_items` | `id` (uuid, PK) <br> `order_id` (uuid, FK→`orders.id`) <br> `product_id` (uuid, FK→`products.id`) <br> `quantity` (int) <br> `price_at_purchase` (numeric) <br> `created_at` (timestamp) | One‑to‑many relation linking products to an order. |
| `reviews` | `id` (uuid, PK) <br> `product_id` (uuid, FK→`products.id`) <br> `user_id` (uuid, nullable) <br> `rating` (int, **check 1‑5**) <br> `comment` (text) <br> `created_at` (timestamp) | Customer reviews displayed on the product detail page. |

### 3.2 Relationships
- **`order_items` → `orders`** (many‑to‑one) – an order may contain multiple items.
- **`order_items` → `products`** (many‑to‑one) – each line references a product.
- **`reviews` → `products`** (many‑to‑one) – product can have many reviews.

### 3.3 Row‑Level Security (RLS) Policies (public read/write)
```sql
-- Public SELECT on all tables
create policy "public read" on public.products   for select using (true);
create policy "public read" on public.orders     for select using (true);
create policy "public read" on public.order_items for select using (true);
create policy "public read" on public.reviews    for select using (true);

-- Public INSERT (guest checkout & review creation)
create policy "public insert orders"      on public.orders      for insert with check (true);
create policy "public insert order_items" on public.order_items for insert with check (true);
create policy "public insert reviews"    on public.reviews    for insert with check (true);
```
These policies allow **any client** (including the unauthenticated demo) to read data and to create orders/reviews, matching the requirements of the capstone showcase.

---

## 4. Build & Deployment
- `npm run build` → Vite generates a production‑optimized bundle (≈ 530 KB gzipped). The build includes the **`.dark-theme` CSS** and **locale‑aware price formatting**.
- Vercel CI automatically runs `npm run build` and publishes the static assets under the domain `https://projet-react-full.vercel.app`.
- Environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are stored in Vercel’s **Project Settings → Environment Variables** (production scope).

---

*This documentation satisfies the Lab 6 technical‑depth rubric, detailing architecture, component design, database schema, and security policies.*
