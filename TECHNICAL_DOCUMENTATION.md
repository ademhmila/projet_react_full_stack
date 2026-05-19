# Technical Documentation: Architecture Blueprint 🏗️

This document outlines the advanced architectural strategies and modular patterns implemented in the Aura E-Shop Capstone Project.

## 📂 1. Modular Directory Structure

The project strictly follows a domain-driven, modular folder architecture to ensure high scalability and seamless unit testing:

- **`src/api/`**: Contains `supabaseClient.js`, establishing a centralized, secure connection to the Supabase backend with intelligent fallback placeholders to prevent crashes during initial developer boot.
- **`src/components/`**: Houses highly reusable UI components. Features `Navbar.jsx` (with dynamic cart notification badges and role-based links) and `ProtectedRoute.jsx` (an HOC enforcing role-based authentication barriers).
- **`src/contexts/`**: The core of the application's global state. Contains `AuthContext.jsx` and `CartContext.jsx`.
- **`src/pages/`**: The view layer mapped to React Router. Heavily code-split to ensure minimal initial bundle delivery.

## 🧠 2. State Management Architecture

The application eschews heavy external libraries like Redux in favor of native, highly optimized React Contexts:

### CartContext (`useReducer` + `localStorage`)
- Employs a `useReducer` engine to predictably handle complex state mutations (`ADD_ITEM`, `REMOVE_ITEM`, `UPDATE_QUANTITY`, `CLEAR_CART`).
- Enforces business logic limits (e.g., preventing users from adding more items than the available `stock`).
- Implements a caching synchronization layer: every state mutation automatically persists the cart array to `localStorage`, ensuring data survives hard refreshes.

### AuthContext (Supabase Event Listeners)
- Listens to active Supabase session states via `supabase.auth.onAuthStateChange`.
- Cross-references authenticated UUIDs with the `profiles` table to securely fetch custom user roles (`'admin'` or `'customer'`).
- Contains a built-in mock bypass for demo accounts to guarantee seamless evaluation even without active network connections.

## 🗄️ 3. Relational Database Schema (PostgreSQL)

The database is built on robust relational principles with strict Row Level Security (RLS) enforcement. The 5 core tables are:

1. **`profiles`**: Linked directly to `auth.users`. Contains the crucial `role` column.
2. **`products`**: The main catalog inventory. Tracks pricing, dynamic stock limits, and image URLs mapped to Supabase Storage Buckets.
3. **`orders`**: Parent transactional records tracking total ticket prices, fulfillment status, and the buyer's UUID.
4. **`order_items`**: Child records linked to an order via foreign keys. Captures historical pricing (`price_at_purchase`) and quantities to ensure invoice integrity even if product prices change later.
5. **`reviews`**: Stores customer feedback and 1-5 star ratings linked to specific products.

### Automated Trigger Integration
A PostgreSQL trigger (`on_auth_user_created`) and associated function are deployed to automate profile generation. When a new user signs up via Supabase Auth, a row is automatically inserted into the `profiles` table, extracting their name and intelligently assigning the `'admin'` role if their email matches `admin@example.com`.

## ⚡ 4. Performance Optimization (Code Splitting)

To achieve maximum Lighthouse performance scores and minimize initial load weight, the application implements advanced routing optimizations:

- **`React.lazy()` & `Suspense`**: Heavy administrative modules (`AdminDashboard.jsx` carrying the `recharts` library) and checkout flows (`Invoice.jsx`, `ProductDetails.jsx`) are lazily loaded.
- **Impact**: This architectural decision reduces the initial `index.js` JavaScript bundle size by **~50%** (dropping from ~880 kB to ~460 kB), drastically improving Time to Interactive (TTI) and First Contentful Paint (FCP) metrics.
- A custom, premium glassmorphic spinner serves as the `Suspense` fallback to maintain a luxurious UX during asynchronous chunk loading.
