# Harpreet Regreens - Artisan Planters Shop

A React-based e-commerce application for selling unique, hand-crafted planters. This project uses **Supabase** for the backend (Database, Auth, Realtime) and **React** with **TypeScript** for the frontend.

## 🛠 Tech Stack

- **Frontend Framework**: [React](https://react.dev/) (bootstrapped with [Vite](https://vitejs.dev/))
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📂 Project Structure

For a backend developer, here is how the project is organized:

```
src/
├── components/      # Reusable UI components (Navbar, PlanterCard, etc.)
├── contexts/        # Global state management (AuthContext for user sessions)
├── hooks/           # Custom hooks for data fetching & logic (usePlanters, useReservations)
├── lib/             # Backend configuration (supabase.ts client setup)
├── pages/           # Main application views (Home, Admin, Cart)
├── App.tsx          # Main application component & routing logic
└── main.tsx         # Entry point
```

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### 2. Environment Setup
Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Installation & Running
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## 💾 Database Schema (Supabase)

The application relies on the following tables in Supabase (PostgreSQL):

### `planters`
Stores inventory items.
- `id`: uuid (PK)
- `name`: text
- `description`: text
- `price`: number
- `image_url`: text
- `status`: enum ('available', 'reserved', 'sold')
- `created_at`: timestamp

### `reservations`
Handles temporary holds on items.
- `id`: uuid (PK)
- `user_id`: uuid (FK to auth.users)
- `planter_id`: uuid (FK to planters)
- `reserved_at`: timestamp
- `expires_at`: timestamp
- `status`: enum ('active', 'expired')

### `orders`
Finalized purchases.
- `id`: uuid (PK)
- `user_id`: uuid (FK)
- `planter_id`: uuid (FK)
- `total_price`: number
- `status`: enum ('completed', 'cancelled')

## 💡 Key Concepts for Backend Developers

1.  **Client-Side Data Fetching**:
    - Unlike traditional MVC apps where the server renders HTML, this app fetches JSON data from Supabase directly in the browser using the `supabase-js` client.
    - Check `src/hooks/usePlanters.ts` to see how data is queried (`supabase.from('planters').select('*')`).

2.  **Real-time Updates**:
    - The app subscribes to database changes using Supabase Realtime.
    - When a planter is reserved or sold, the UI updates instantly without a page refresh.
    - See the `.on('postgres_changes', ...)` listener in `src/hooks/usePlanters.ts`.

3.  **Authentication**:
    - Auth is handled by Supabase Auth (GoTrue).
    - The `AuthContext.tsx` manages the user session globally across the app.
    - Row Level Security (RLS) policies in Postgres should be used to secure data (e.g., only admins can update planter status).
