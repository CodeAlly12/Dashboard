// Booking state access.
//
// One interface, two implementations: Supabase when the service-role key is
// configured, and an in-memory store seeded with demo data otherwise, so the
// dashboard still runs locally without credentials. The engines depend on the
// interface, never on Supabase directly.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { addDays, today } from "./dates";
import { PROPERTY_IDS } from "./properties";
import type {
  BookingChannel,
  CalendarBlock,
  CalendarSource,
  EscalationPayload,
  IsoDate,
  PropertyId,
  Reservation,
  ReservationStatus,
} from "./types";

export interface ReservationQuery {
  propertyId?: PropertyId;
  /** Overlap window — returns stays intersecting `[from, to)`. */
  from?: IsoDate;
  to?: IsoDate;
  statuses?: ReservationStatus[];
}

export interface AuditEntry {
  action: string;
  propertyId?: PropertyId;
  actor: "assistant" | "system" | "staff";
  detail: Record<string, unknown>;
}

export interface BookingStore {
  listReservations(query?: ReservationQuery): Promise<Reservation[]>;
  getReservation(id: string): Promise<Reservation | null>;
  createReservation(
    reservation: Omit<Reservation, "id" | "createdAt" | "updatedAt">
  ): Promise<Reservation>;
  updateReservation(id: string, patch: Partial<Reservation>): Promise<Reservation | null>;
  listBlocks(propertyId?: PropertyId): Promise<CalendarBlock[]>;
  listCalendarSources(propertyId?: PropertyId): Promise<CalendarSource[]>;
  recordSync(sourceId: string, result: { syncedAt: string; error?: string }): Promise<void>;
  recordEscalation(payload: EscalationPayload): Promise<void>;
  appendAudit(entry: AuditEntry): Promise<void>;
}

const ACTIVE_STATUSES: ReservationStatus[] = [
  "provisional",
  "confirmed",
  "checked_in",
  "checked_out",
];

// ---------------------------------------------------------------------------
// In-memory store (default when Supabase is not configured)
// ---------------------------------------------------------------------------

function seedReservations(): Reservation[] {
  const now = new Date().toISOString();
  const base = today();
  const seeds: Array<[PropertyId, number, number, string, BookingChannel, number]> = [
    ["hh-villa", 3, 8, "Amara Okonkwo", "airbnb", 6],
    ["hh-villa", 14, 18, "Daniel Whitfield", "booking_com", 8],
    ["giant-house", 1, 5, "Priya Raman", "direct_website", 10],
    ["villa-latia", 9, 13, "Lucas Meyer", "vrbo", 4],
    ["safari-house", 20, 25, "Nadia Haddad", "booking_com", 6],
  ];

  return seeds.map(([propertyId, startOffset, endOffset, guestName, channel, guests], i) => ({
    id: `res_seed_${i + 1}`,
    propertyId,
    channel,
    status: "confirmed" as ReservationStatus,
    checkIn: addDays(base, startOffset),
    checkOut: addDays(base, endOffset),
    guests,
    guestName,
    guestEmail: `${guestName.split(" ")[0].toLowerCase()}@example.com`,
    totalAmount: 0,
    currency: "USD",
    externalReference: `${channel}-seed-${i + 1}`,
    createdAt: now,
    updatedAt: now,
  }));
}

class MemoryBookingStore implements BookingStore {
  private reservations = seedReservations();
  private blocks: CalendarBlock[] = [
    {
      id: "blk_seed_1",
      propertyId: "hh-villa",
      start: addDays(today(), 10),
      end: addDays(today(), 12),
      reason: "maintenance",
      note: "Pool heater replacement",
    },
  ];
  private sources: CalendarSource[] = PROPERTY_IDS.flatMap((propertyId) => [
    {
      id: `src_${propertyId}_airbnb`,
      propertyId,
      channel: "airbnb" as BookingChannel,
      icalUrl: "",
      lastSyncedAt: new Date().toISOString(),
    },
  ]);
  private counter = 0;

  async listReservations(query: ReservationQuery = {}): Promise<Reservation[]> {
    const statuses = query.statuses ?? ACTIVE_STATUSES;
    return this.reservations
      .filter((r) => !query.propertyId || r.propertyId === query.propertyId)
      .filter((r) => statuses.includes(r.status))
      .filter((r) => (query.to ? r.checkIn < query.to : true))
      .filter((r) => (query.from ? r.checkOut > query.from : true))
      .sort((a, b) => a.checkIn.localeCompare(b.checkIn));
  }

  async getReservation(id: string) {
    return this.reservations.find((r) => r.id === id) ?? null;
  }

  async createReservation(reservation: Omit<Reservation, "id" | "createdAt" | "updatedAt">) {
    const now = new Date().toISOString();
    const created: Reservation = {
      ...reservation,
      id: `res_${Date.now()}_${++this.counter}`,
      createdAt: now,
      updatedAt: now,
    };
    this.reservations.push(created);
    return created;
  }

  async updateReservation(id: string, patch: Partial<Reservation>) {
    const index = this.reservations.findIndex((r) => r.id === id);
    if (index === -1) return null;
    this.reservations[index] = {
      ...this.reservations[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    return this.reservations[index];
  }

  async listBlocks(propertyId?: PropertyId) {
    return this.blocks.filter((b) => !propertyId || b.propertyId === propertyId);
  }

  async listCalendarSources(propertyId?: PropertyId) {
    return this.sources.filter((s) => !propertyId || s.propertyId === propertyId);
  }

  async recordSync(sourceId: string, result: { syncedAt: string; error?: string }) {
    const source = this.sources.find((s) => s.id === sourceId);
    if (!source) return;
    source.lastSyncedAt = result.syncedAt;
    source.lastSyncError = result.error;
  }

  async recordEscalation(payload: EscalationPayload) {
    console.info("[escalation]", JSON.stringify(payload));
  }

  async appendAudit(entry: AuditEntry) {
    console.info("[booking-audit]", JSON.stringify(entry));
  }
}

// ---------------------------------------------------------------------------
// Supabase store
// ---------------------------------------------------------------------------

interface ReservationRow {
  id: string;
  property_slug: string;
  channel: string;
  status: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  guest_name: string;
  guest_email: string | null;
  guest_phone: string | null;
  total_amount: number;
  currency: string;
  external_reference: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Reads through `booking_reservations_view` (see supabase/booking-schema.sql),
 * which flattens the reservation → property → guest joins the engines need.
 */
class SupabaseBookingStore implements BookingStore {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  private toReservation(row: ReservationRow): Reservation {
    return {
      id: row.id,
      propertyId: row.property_slug as PropertyId,
      channel: row.channel as BookingChannel,
      status: row.status as ReservationStatus,
      checkIn: row.check_in,
      checkOut: row.check_out,
      guests: row.guests_count,
      guestName: row.guest_name,
      guestEmail: row.guest_email ?? undefined,
      guestPhone: row.guest_phone ?? undefined,
      totalAmount: Number(row.total_amount),
      currency: row.currency,
      externalReference: row.external_reference ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async listReservations(query: ReservationQuery = {}): Promise<Reservation[]> {
    let q = this.client
      .from("booking_reservations_view")
      .select("*")
      .in("status", query.statuses ?? ACTIVE_STATUSES);

    if (query.propertyId) q = q.eq("property_slug", query.propertyId);
    if (query.to) q = q.lt("check_in", query.to);
    if (query.from) q = q.gt("check_out", query.from);

    const { data, error } = await q.order("check_in", { ascending: true });
    if (error) throw new Error(`reservation lookup failed: ${error.message}`);
    return (data as ReservationRow[]).map((row) => this.toReservation(row));
  }

  async getReservation(id: string): Promise<Reservation | null> {
    const { data, error } = await this.client
      .from("booking_reservations_view")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (error) throw new Error(`reservation lookup failed: ${error.message}`);
    return data ? this.toReservation(data as ReservationRow) : null;
  }

  private async propertyUuid(slug: PropertyId): Promise<string> {
    const { data, error } = await this.client
      .from("properties")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (error || !data) throw new Error(`property "${slug}" is not present in the database`);
    return data.id as string;
  }

  private async guestUuid(reservation: {
    guestName: string;
    guestEmail?: string;
    guestPhone?: string;
  }): Promise<string> {
    if (reservation.guestEmail) {
      const { data } = await this.client
        .from("guests")
        .select("id")
        .eq("email", reservation.guestEmail)
        .maybeSingle();
      if (data) return data.id as string;
    }

    const { data, error } = await this.client
      .from("guests")
      .insert({
        full_name: reservation.guestName,
        email: reservation.guestEmail ?? null,
        phone: reservation.guestPhone ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(`guest record failed: ${error.message}`);
    return data.id as string;
  }

  async createReservation(
    reservation: Omit<Reservation, "id" | "createdAt" | "updatedAt">
  ): Promise<Reservation> {
    const [propertyId, guestId] = await Promise.all([
      this.propertyUuid(reservation.propertyId),
      this.guestUuid(reservation),
    ]);

    const { data, error } = await this.client
      .from("reservations")
      .insert({
        property_id: propertyId,
        guest_id: guestId,
        channel: reservation.channel,
        status: reservation.status,
        check_in: reservation.checkIn,
        check_out: reservation.checkOut,
        guests_count: reservation.guests,
        total_amount: reservation.totalAmount,
        currency: reservation.currency,
        external_reference: reservation.externalReference ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(`reservation insert failed: ${error.message}`);

    const created = await this.getReservation(data.id as string);
    if (!created) throw new Error("reservation insert succeeded but read-back failed");
    return created;
  }

  async updateReservation(id: string, patch: Partial<Reservation>): Promise<Reservation | null> {
    const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.status) row.status = patch.status;
    if (patch.checkIn) row.check_in = patch.checkIn;
    if (patch.checkOut) row.check_out = patch.checkOut;
    if (patch.guests) row.guests_count = patch.guests;
    if (patch.totalAmount !== undefined) row.total_amount = patch.totalAmount;

    const { error } = await this.client.from("reservations").update(row).eq("id", id);
    if (error) throw new Error(`reservation update failed: ${error.message}`);
    return this.getReservation(id);
  }

  async listBlocks(propertyId?: PropertyId): Promise<CalendarBlock[]> {
    let q = this.client.from("calendar_blocks").select("*, properties(slug)");
    if (propertyId) q = q.eq("properties.slug", propertyId);
    const { data, error } = await q;
    if (error) throw new Error(`calendar block lookup failed: ${error.message}`);
    return (data ?? []).map((row: Record<string, never>) => ({
      id: row.id as unknown as string,
      propertyId: (row.properties as unknown as { slug: string }).slug as PropertyId,
      start: row.start_date as unknown as string,
      end: row.end_date as unknown as string,
      reason: row.reason as unknown as CalendarBlock["reason"],
      note: (row.note as unknown as string) ?? undefined,
    }));
  }

  async listCalendarSources(propertyId?: PropertyId): Promise<CalendarSource[]> {
    let q = this.client.from("calendar_sources").select("*, properties(slug)");
    if (propertyId) q = q.eq("properties.slug", propertyId);
    const { data, error } = await q;
    if (error) throw new Error(`calendar source lookup failed: ${error.message}`);
    return (data ?? []).map((row: Record<string, never>) => ({
      id: row.id as unknown as string,
      propertyId: (row.properties as unknown as { slug: string }).slug as PropertyId,
      channel: row.channel as unknown as BookingChannel,
      icalUrl: row.ical_url as unknown as string,
      lastSyncedAt: (row.last_synced_at as unknown as string) ?? undefined,
      lastSyncError: (row.last_sync_error as unknown as string) ?? undefined,
    }));
  }

  async recordSync(sourceId: string, result: { syncedAt: string; error?: string }) {
    await this.client
      .from("calendar_sources")
      .update({ last_synced_at: result.syncedAt, last_sync_error: result.error ?? null })
      .eq("id", sourceId);
    await this.client
      .from("calendar_sync_log")
      .insert({ source_id: sourceId, synced_at: result.syncedAt, error: result.error ?? null });
  }

  async recordEscalation(payload: EscalationPayload) {
    await this.client.from("escalations").insert({
      reason: payload.reason,
      urgency: payload.urgency,
      payload,
    });
  }

  async appendAudit(entry: AuditEntry) {
    await this.client.from("booking_audit_log").insert({
      action: entry.action,
      actor: entry.actor,
      detail: entry.detail,
    });
  }
}

// ---------------------------------------------------------------------------

let store: BookingStore | null = null;

export function getBookingStore(): BookingStore {
  if (store) return store;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  store =
    url && serviceKey
      ? new SupabaseBookingStore(
          createClient(url, serviceKey, { auth: { persistSession: false } })
        )
      : new MemoryBookingStore();

  return store;
}

/** Test seam — lets suites and previews swap in a fixture store. */
export function setBookingStore(next: BookingStore | null) {
  store = next;
}

export function isUsingLiveStore(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
