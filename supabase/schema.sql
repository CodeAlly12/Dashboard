-- North Star Hospitality OS — Database Schema
-- Target: Supabase (PostgreSQL)
-- Run via the Supabase SQL editor or `supabase db push`.

create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type channel_type as enum (
  'airbnb', 'booking_com', 'expedia', 'vrbo', 'direct_website', 'social_media'
);

create type reservation_status as enum (
  'new', 'confirmed', 'checked_in', 'checked_out', 'pending_payment', 'cancelled'
);

create type room_status as enum ('clean', 'in_progress', 'dirty', 'inspection');

create type maintenance_priority as enum ('critical', 'high', 'medium', 'low');

create type maintenance_status as enum ('open', 'scheduled', 'in_progress', 'resolved');

create type staff_status as enum ('on_duty', 'off_duty', 'on_leave');

create type message_channel as enum ('airbnb', 'booking_com', 'whatsapp', 'email');

-- ============================================================
-- CORE TABLES
-- ============================================================

create table properties (
  id uuid primary key default uuid_generate_v4(),
  slug text unique not null,
  name text not null,
  location text,
  website text,
  image_url text,
  rooms int not null default 0,
  created_at timestamptz not null default now()
);

create table rooms (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references properties (id) on delete cascade,
  name text not null,
  type text,
  max_occupancy int default 2,
  base_rate numeric(10, 2) default 0,
  status room_status not null default 'clean',
  created_at timestamptz not null default now()
);

create table guests (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  email text unique,
  phone text,
  nationality text,
  is_vip boolean not null default false,
  preferences text[] default array[]::text[],
  created_at timestamptz not null default now()
);

create table reservations (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references properties (id) on delete cascade,
  room_id uuid references rooms (id) on delete set null,
  guest_id uuid not null references guests (id) on delete cascade,
  channel channel_type not null,
  status reservation_status not null default 'new',
  check_in date not null,
  check_out date not null,
  guests_count int not null default 1,
  total_amount numeric(10, 2) not null default 0,
  currency text not null default 'USD',
  external_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table reviews (
  id uuid primary key default uuid_generate_v4(),
  reservation_id uuid not null references reservations (id) on delete cascade,
  guest_id uuid not null references guests (id) on delete cascade,
  rating numeric(2, 1) not null check (rating >= 0 and rating <= 5),
  comment text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- REVENUE & ACCOUNTING
-- ============================================================

create table revenue_entries (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references properties (id) on delete cascade,
  reservation_id uuid references reservations (id) on delete set null,
  channel channel_type not null,
  amount numeric(10, 2) not null,
  occurred_on date not null,
  created_at timestamptz not null default now()
);

create table expenses (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties (id) on delete cascade,
  category text not null,
  amount numeric(10, 2) not null,
  occurred_on date not null,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- OPERATIONS
-- ============================================================

create table staff_members (
  id uuid primary key default uuid_generate_v4(),
  full_name text not null,
  role text not null,
  property_id uuid references properties (id) on delete set null,
  status staff_status not null default 'off_duty',
  email text unique,
  phone text,
  created_at timestamptz not null default now()
);

create table housekeeping_tasks (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references rooms (id) on delete cascade,
  assigned_to uuid references staff_members (id) on delete set null,
  status room_status not null default 'dirty',
  inspection_status text default 'n_a',
  scheduled_for timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table maintenance_issues (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references properties (id) on delete cascade,
  room_id uuid references rooms (id) on delete set null,
  title text not null,
  description text,
  priority maintenance_priority not null default 'medium',
  status maintenance_status not null default 'open',
  assigned_to uuid references staff_members (id) on delete set null,
  reported_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table assets (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references properties (id) on delete cascade,
  name text not null,
  category text,
  purchased_on date,
  warranty_expires date,
  notes text
);

-- ============================================================
-- CHANNEL MANAGER
-- ============================================================

create table channel_connections (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid not null references properties (id) on delete cascade,
  channel channel_type not null,
  connected boolean not null default false,
  calendar_sync_status text not null default 'error',
  rate_sync_status text not null default 'error',
  inventory_sync_status text not null default 'error',
  last_synced_at timestamptz,
  credentials jsonb,
  unique (property_id, channel)
);

-- ============================================================
-- MESSAGING
-- ============================================================

create table conversations (
  id uuid primary key default uuid_generate_v4(),
  guest_id uuid not null references guests (id) on delete cascade,
  channel message_channel not null,
  reservation_id uuid references reservations (id) on delete set null,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default uuid_generate_v4(),
  conversation_id uuid not null references conversations (id) on delete cascade,
  sender text not null check (sender in ('guest', 'staff', 'ai')),
  body text not null,
  ai_suggestion text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- MARKETING
-- ============================================================

create table marketing_campaigns (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties (id) on delete cascade,
  name text not null,
  channel text not null,
  spend numeric(10, 2) not null default 0,
  conversions int not null default 0,
  started_on date,
  ended_on date
);

create table website_traffic (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties (id) on delete cascade,
  recorded_on date not null,
  visitors int not null default 0,
  bookings int not null default 0
);

-- ============================================================
-- AI ASSISTANT (North Star AI)
-- ============================================================

create table ai_insights (
  id uuid primary key default uuid_generate_v4(),
  property_id uuid references properties (id) on delete cascade,
  type text not null check (type in (
    'revenue_forecast', 'occupancy_prediction', 'pricing_recommendation',
    'guest_communication', 'housekeeping_schedule', 'maintenance_alert'
  )),
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

create index idx_reservations_property on reservations (property_id);
create index idx_reservations_status on reservations (status);
create index idx_reservations_dates on reservations (check_in, check_out);
create index idx_revenue_entries_property_date on revenue_entries (property_id, occurred_on);
create index idx_housekeeping_room on housekeeping_tasks (room_id);
create index idx_maintenance_property on maintenance_issues (property_id);
create index idx_messages_conversation on messages (conversation_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table properties enable row level security;
alter table rooms enable row level security;
alter table guests enable row level security;
alter table reservations enable row level security;
alter table reviews enable row level security;
alter table revenue_entries enable row level security;
alter table expenses enable row level security;
alter table staff_members enable row level security;
alter table housekeeping_tasks enable row level security;
alter table maintenance_issues enable row level security;
alter table assets enable row level security;
alter table channel_connections enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table marketing_campaigns enable row level security;
alter table website_traffic enable row level security;
alter table ai_insights enable row level security;

-- Authenticated staff/owners (Clerk-issued JWT via Supabase third-party auth)
-- can read and write all operational data. Adjust per-role policies as the
-- staff/owner/guest portal roles are introduced.
create policy "Authenticated users can read properties" on properties
  for select using (auth.role() = 'authenticated');

create policy "Authenticated users can manage operational data" on rooms
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users can manage guests" on guests
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users can manage reservations" on reservations
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users can manage reviews" on reviews
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users can manage revenue" on revenue_entries
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users can manage expenses" on expenses
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users can manage staff" on staff_members
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users can manage housekeeping" on housekeeping_tasks
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users can manage maintenance" on maintenance_issues
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users can manage assets" on assets
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users can manage channel connections" on channel_connections
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users can manage conversations" on conversations
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users can manage messages" on messages
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users can manage marketing campaigns" on marketing_campaigns
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users can manage website traffic" on website_traffic
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users can manage ai insights" on ai_insights
  for all using (auth.role() = 'authenticated');

-- ============================================================
-- SEED DATA
-- ============================================================

insert into properties (slug, name, location, website, rooms) values
  ('hh-villa', 'HH Villa', 'Oceanfront, Harbour Hills', 'www.hhvilla.com', 6),
  ('giant-house', 'Giant House', 'Hillside Estate, North Ridge', null, 8);
