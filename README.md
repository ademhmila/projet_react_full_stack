# Aura E‑Shop

**Live Production URL:** https://projet-react-full.vercel.app

**GitHub Repository:** https://github.com/ademhmila/projet_react_full_stack

---

## Core Features

- **Dynamic Full‑Stack Catalog** – Products are fetched live from a Supabase PostgreSQL backend via the Supabase JS client.
- **Persistent Cart System** – Global cart managed with `useContext` + `useReducer`; state is synced to `localStorage` for session persistence.
- **Tunisian Dinar (DT) Localization** – All monetary values are formatted with the `Intl.NumberFormat` API for the `fr‑TN` locale.
- **Fluid Dark‑Mode** – Global CSS‑variable theme toggled via a persistent setting stored in `localStorage`; automatically applies a `.dark-theme` class to the document root.
- **Guest Checkout & Invoice Logging** – Users can checkout without an account; orders are recorded in Supabase and an on‑screen invoice is generated.
- **Robust Admin CRUD** – Admin dashboard provides full create/read/update/delete operations for products, orders, and analytics charts.
- **Performance Optimizations** – Code‑splitting with `React.lazy` & `Suspense`, lazy‑loaded admin routes, and Vite‑powered fast bundling.

---

## Local Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ademhmila/projet_react_full_stack.git
   cd projet_react_full_stack
   ```
2. **Install dependencies**
   ```bash
   npm install
   ```
3. **Configure Supabase credentials**
   - Create a `.env` file in the project root (copy from `.env.example` if present).
   - Add your Supabase project URL and anon public key:
   ```dotenv
   VITE_SUPABASE_URL=https://lxhwjhbsmwmmufyctuna.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
   ```
4. **Run the development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`.
5. **Execute the test suite**
   ```bash
   npm run test:coverage
   ```
   Expect a Vitest statement coverage of **≥ 70 %** (current 77.14 %).

---

## Production Deployment

The project is automatically deployed to Vercel. A successful deployment shows the live store at the URL above. The Vercel CI pipeline runs `npm run build` and publishes the static assets.

---

*Feel free to explore, contribute, or raise issues – the storefront is built to be a premium, production‑ready demonstration of modern React + Supabase architecture.*
