# North Star Hospitality OS

A luxury hospitality management dashboard for **HH Villa** and **Giant House** —
reservations, channel manager, revenue, housekeeping, maintenance, guest CRM,
marketing, and a built-in **North Star AI** concierge.

## Stack

- **Next.js 16** (App Router, Turbopack) + React 19 + TypeScript
- **Tailwind CSS v4** with a custom navy/gold luxury theme, glassmorphism and dark mode
- **shadcn-style UI components** (Radix UI primitives)
- **Framer Motion** animations (hero banner, counters, sidebar, AI assistant, calendar)
- **Recharts** for revenue, occupancy, marketing and accounting charts
- **Clerk** for authentication (sign-in / sign-up, protected routes)
- **Supabase** (PostgreSQL) for data — schema in `supabase/schema.sql`

## Getting Started

1. Copy `.env.example` to `.env.local` and fill in your keys:

   ```bash
   cp .env.example .env.local
   ```

   At minimum you need Clerk keys for the app to run:

   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

2. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) — you'll be redirected to
   `/dashboard` (or `/sign-in` if not authenticated).

## Database

Apply `supabase/schema.sql` to a Supabase project (SQL editor or `supabase db push`)
to create the properties, reservations, guests, revenue, housekeeping, maintenance,
channel manager, messaging and marketing tables, with row-level security and seed
data for HH Villa and Giant House.

## Project Structure

- `src/app/(dashboard)/` — all dashboard routes (sidebar + header + AI assistant layout)
- `src/components/ui/` — base UI primitives (button, card, badge, dialog, etc.)
- `src/components/dashboard/` — dashboard widgets (hero banner, charts, reservation feed)
- `src/components/layout/` — sidebar, header, theme toggle, AI assistant panel
- `src/lib/mock-data.ts` — sample data used throughout the UI (swap for live Supabase queries)
- `src/lib/supabase/` — Supabase browser/server clients
- `supabase/schema.sql` — full database schema, RLS policies and seed data

## Status

The UI is fully built with mock data and Clerk authentication wired in. Live
integrations (Airbnb, Booking.com, Expedia, Vrbo, Stripe, WhatsApp Business,
Google Analytics) and Supabase-backed data fetching are the next steps —
environment variables for each are pre-defined in `.env.example`.
