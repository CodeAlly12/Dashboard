-- North Star Hospitality OS — booking subsystem schema
-- Apply AFTER supabase/schema.sql.
--
-- Adds the tables the reservation engines need: provisional holds, owner
-- blocks, channel calendar feeds, sync history, escalations and an audit log.

create extension if not exists btree_gist;

-- ============================================================
-- RESERVATIONS: provisional holds + double-booking prevention
-- ============================================================

-- Assistant-created holds are provisional until a human confirms payment.
alter type reservation_status add value if not exists 'provisional';

alter table reservations
  add column if not exists hold_expires_at timestamptz;

-- The database, not the application, is the last line of defence against a
-- double booking. Stays are half-open ranges: a departure and an arrival on
-- the same day do not overlap.
alter table reservations
  drop constraint if exists reservations_no_overlap;

alter table reservations
  add constraint reservations_no_overlap
  exclude using gist (
    property_id with =,
    daterange (check_in, check_out, '[)') with &&
  )
  where (status in ('provisional', 'confirmed', 'checked_in'));

create index if not exists idx_reservations_external_reference
  on reservations (external_reference);

-- ============================================================
-- OWNER BLOCKS
-- ============================================================

create table if not exists calendar_blocks (
  id uuid primary key default uuid_generate_v4 (),
  property_id uuid not null references properties (id) on delete cascade,
  start_date date not null,
  end_date date not null,
  reason text not null check (reason in ('maintenance', 'blocked', 'owner_stay')),
  note text,
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);

create index if not exists idx_calendar_blocks_property
  on calendar_blocks (property_id, start_date, end_date);

-- ============================================================
-- CHANNEL CALENDAR FEEDS
-- ============================================================

create table if not exists calendar_sources (
  id uuid primary key default uuid_generate_v4 (),
  property_id uuid not null references properties (id) on delete cascade,
  channel channel_type not null,
  ical_url text not null,
  last_synced_at timestamptz,
  last_sync_error text,
  created_at timestamptz not null default now(),
  unique (property_id, channel)
);

create table if not exists calendar_sync_log (
  id uuid primary key default uuid_generate_v4 (),
  source_id uuid not null references calendar_sources (id) on delete cascade,
  synced_at timestamptz not null default now(),
  error text
);

create index if not exists idx_calendar_sync_log_source
  on calendar_sync_log (source_id, synced_at desc);

-- ============================================================
-- ESCALATIONS & AUDIT
-- ============================================================

create table if not exists escalations (
  id uuid primary key default uuid_generate_v4 (),
  reason text not null,
  urgency text not null check (urgency in ('low', 'normal', 'high', 'critical')),
  payload jsonb not null,
  resolved_at timestamptz,
  resolved_by text,
  created_at timestamptz not null default now()
);

create index if not exists idx_escalations_open
  on escalations (created_at desc)
  where resolved_at is null;

create table if not exists booking_audit_log (
  id uuid primary key default uuid_generate_v4 (),
  action text not null,
  actor text not null check (actor in ('assistant', 'system', 'staff')),
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_booking_audit_created
  on booking_audit_log (created_at desc);

-- ============================================================
-- READ VIEW
-- ============================================================

-- Flattens the reservation → property → guest joins the engines read on every
-- availability check.
create or replace view booking_reservations_view as
select
  r.id,
  p.slug as property_slug,
  r.channel::text as channel,
  r.status::text as status,
  r.check_in,
  r.check_out,
  r.guests_count,
  g.full_name as guest_name,
  g.email as guest_email,
  g.phone as guest_phone,
  r.total_amount,
  r.currency,
  r.external_reference,
  r.hold_expires_at,
  r.created_at,
  r.updated_at
from reservations r
join properties p on p.id = r.property_id
join guests g on g.id = r.guest_id;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table calendar_blocks enable row level security;
alter table calendar_sources enable row level security;
alter table calendar_sync_log enable row level security;
alter table escalations enable row level security;
alter table booking_audit_log enable row level security;

create policy "Authenticated users can manage calendar blocks" on calendar_blocks
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users can read calendar sources" on calendar_sources
  for select using (auth.role() = 'authenticated');
create policy "Authenticated users can read sync log" on calendar_sync_log
  for select using (auth.role() = 'authenticated');
create policy "Authenticated users can manage escalations" on escalations
  for all using (auth.role() = 'authenticated');
create policy "Authenticated users can read audit log" on booking_audit_log
  for select using (auth.role() = 'authenticated');

-- The booking engines connect with the service-role key, which bypasses RLS.
-- `calendar_sources.ical_url` stays unreadable by browser clients on purpose:
-- an iCal URL is a bearer credential for a channel calendar.

-- ============================================================
-- SEED: managed properties
-- ============================================================

insert into properties (slug, name, location, website, rooms) values
  ('hh-villa', 'HH Villa', 'Oceanfront, Harbour Hills', 'www.hhvilla.com', 6),
  ('hh-villa-main-house', 'HH Villa Main House', 'Oceanfront, Harbour Hills', null, 4),
  ('hh-villa-bungalows', 'HH Villa Bungalows', 'Oceanfront, Harbour Hills', null, 2),
  ('giant-house', 'Giant House', 'Hillside Estate, North Ridge', null, 8),
  ('big-tree-house', 'Big Tree House', 'Forest Edge, North Ridge', null, 3),
  ('safari-house', 'Safari House', 'Conservancy Boundary, Rift Valley', null, 5),
  ('villa-latia', 'Villa Latia', 'Cliffside, Harbour Hills', null, 4),
  ('fig-tree-house', 'Fig Tree House', 'Old Town, Harbour Hills', null, 3)
on conflict (slug) do nothing;
