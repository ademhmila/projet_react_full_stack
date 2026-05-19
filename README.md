# Aura E-Shop - Premium Full-Stack E-Commerce 🛍️

Aura E-Shop is a state-of-the-art, production-ready Full-Stack E-Commerce web application developed as a Capstone Project (Lab 6). It features a highly aesthetic, responsive glassmorphism UI, a real-time shopping cart system, secure role-based access, interactive administrative dashboards, and live PostgreSQL database syncing.

## 🚀 Tech Stack

- **Frontend Core:** React 19, Vite, React Router v6
- **State Management:** Context API, `useReducer`, `localStorage` persistence
- **Backend & Database:** Supabase (BaaS), PostgreSQL, Row Level Security (RLS)
- **File Storage:** Supabase Storage Buckets (Product Images)
- **Data Visualization:** Recharts
- **Testing & QA:** Vitest, React Testing Library, JSDOM, `@vitest/coverage-v8`
- **Styling:** Custom CSS with Glassmorphism tokens, CSS Variables

## 🛠️ Local Setup Instructions

Follow these steps to run the application in your local development environment:

1. **Install Dependencies:**
   Ensure you have Node.js installed, then run:
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the root directory by copying the provided `.env.example` template:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *Note: If these keys are not provided, the application will intelligently fall back to local mock data so the UI remains fully functional for grading.*

3. **Database Initialization (Optional but Recommended):**
   Copy the contents of `supabase_schema.sql` and run it in your Supabase SQL Editor to instantly provision the required tables, triggers, security policies, and seed data.

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Navigate to the local URL provided in your terminal (usually `http://localhost:5173`).

## 🔐 Quick-Login Demo Credentials

To bypass registration and instantly evaluate the application features, use the following built-in helper credentials on the `/login` page:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@example.com` | `admin123` | Unlocks the `/admin` dashboard (Recharts, Inventory Management, Order Fulfillment). |
| **Customer** | `user@example.com` | `user123` | Standard shopping, review submission, and invoice checkout generation. |

## 🧪 Testing & Production Commands

- **Run Test Suite:**
  ```bash
  npm run test
  ```
- **Generate Code Coverage Report:**
  ```bash
  npm run test:coverage
  ```
- **Build for Production:**
  Compiles the application with advanced code-splitting and optimizations:
  ```bash
  npm run build
  ```
