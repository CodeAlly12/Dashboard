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

## Booking assistant (HH Hospitality AI)

The AI panel is backed by a real booking subsystem rather than canned replies.
The split is deliberate: **Claude handles language and decisions; every fact
comes from deterministic TypeScript.**

- `src/lib/booking/pricing.ts` — the only source of prices. Seasonal and weekend
  rates, cleaning and extra-guest fees, length-of-stay and registered promo
  discounts, taxes. Integer-cents arithmetic; unregistered discounts escalate.
- `src/lib/booking/calendar.ts` — the only source of availability. Half-open
  night ranges (a departure and an arrival on the same day don't collide),
  owner blocks, minimum stay, capacity, and pairwise double-booking detection.
- `src/lib/booking/ical.ts` — channel feed parsing and reconciliation. Diffs
  each feed into new booking / cancellation / modification / conflict / no
  change. Newest timestamp wins; ties are flagged, never auto-resolved.
- `src/lib/booking/reservations.ts` — creates **provisional holds only**, after
  availability and pricing both verify, then re-reads to catch a concurrent hold.
- `src/lib/booking/notifications.ts` — owner WhatsApp notifications and the
  escalation path. Owner contact details never leave this module.
- `src/lib/ai/` — the system prompt, tool contracts, and the streaming
  orchestrator (`claude-opus-5`, adaptive thinking, prompt-cached system prefix).

If a lookup fails, times out, or cannot be verified, the assistant escalates:
the guest gets a holding line and the owner gets the full context on WhatsApp.

### Endpoints

| Route | Purpose |
| --- | --- |
| `POST /api/assistant` | Streaming assistant turn (newline-delimited JSON) |
| `GET /api/availability` | `?propertyId=&checkIn=&checkOut=&guests=` |
| `GET /api/pricing` | `?propertyId=&checkIn=&checkOut=&guests=&promoCode=` |
| `POST /api/calendar/sync` | Channel polling; `Authorization: Bearer $CRON_SECRET` |

Point a scheduler at `/api/calendar/sync` every 2 minutes so guest-facing
queries read local state instead of channel APIs. That route is outside Clerk's
session check and authenticates with the shared secret instead.

### Running the engine checks

```bash
npm run test:engines
```

Covers night arithmetic, turnover-day semantics, seasonal pricing, minimum
stays, calendar reconciliation and the concurrent-hold guard. No credentials
needed — it runs against the in-memory store.

## Database

Apply `supabase/schema.sql` to a Supabase project (SQL editor or `supabase db push`)
to create the properties, reservations, guests, revenue, housekeeping, maintenance,
channel manager, messaging and marketing tables, with row-level security and seed
data for HH Villa and Giant House.

Then apply `supabase/booking-schema.sql`, which adds provisional holds, owner
blocks, channel calendar feeds, sync history, escalations and an audit log —
plus a `gist` exclusion constraint that makes a double booking impossible at
the database level, not just in application code.

Without `SUPABASE_SERVICE_ROLE_KEY`, the booking engines fall back to an
in-memory store seeded with demo reservations, so the dashboard and the
assistant still run locally.

## Project Structure

- `src/app/(dashboard)/` — all dashboard routes (sidebar + header + AI assistant layout)
- `src/components/ui/` — base UI primitives (button, card, badge, dialog, etc.)
- `src/components/dashboard/` — dashboard widgets (hero banner, charts, reservation feed)
- `src/components/layout/` — sidebar, header, theme toggle, AI assistant panel
- `src/lib/booking/` — deterministic booking engines (pricing, calendar, iCal
  reconciliation, reservations, notifications)
- `src/lib/ai/` — system prompt, tool contracts and the streaming orchestrator
- `src/app/api/` — assistant, availability, pricing and calendar-sync routes
- `src/lib/mock-data.ts` — sample data used throughout the UI (swap for live Supabase queries)
- `src/lib/supabase/` — Supabase browser/server clients
- `supabase/schema.sql` — full database schema, RLS policies and seed data
- `supabase/booking-schema.sql` — booking subsystem tables and constraints
- `scripts/booking-engine-check.ts` — engine regression suite (`npm run test:engines`)

## Status

The UI is fully built with mock data and Clerk authentication wired in. The
booking subsystem behind the AI assistant is live: pricing, availability,
calendar reconciliation, provisional holds, escalation and owner notifications
all run against real engines, backed by Supabase when configured and an
in-memory store otherwise.

Still to connect: the channel APIs beyond iCal (Booking.com Connectivity,
Airbnb, Expedia, Vrbo), Stripe for payment-gated confirmation, and
Supabase-backed data for the remaining dashboard pages, which still read
`src/lib/mock-data.ts`. Environment variables for each are pre-defined in
`.env.example`.
