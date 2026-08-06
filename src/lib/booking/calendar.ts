// Calendar engine — the only source of truth for availability.
//
// Availability is derived from confirmed and provisional reservations plus
// owner blocks. When the calendar cannot be verified (no fresh sync from a
// configured feed) the engine escalates instead of reporting a stay bookable.

import { cached, invalidateProperty } from "./cache";
import {
  addDays,
  isIsoDate,
  nightsBetween,
  rangesOverlap,
  stayNights,
  today,
  weekdayName,
} from "./dates";
import { effectiveMinimumStay } from "./pricing";
import { getPropertyConfig, isPropertyId } from "./properties";
import { getBookingStore } from "./store";
import { withResilience } from "./resilience";
import type {
  AvailabilityReason,
  AvailabilityResult,
  CalendarFreshness,
  DayAvailability,
  EngineResult,
  IsoDate,
  PropertyId,
  Reservation,
} from "./types";

/** A feed that has not synced inside this window can no longer be trusted. */
export const CALENDAR_STALE_AFTER_MS = Number(
  process.env.BOOKING_CALENDAR_STALE_MS ?? 15 * 60_000
);

const AVAILABILITY_CACHE_TTL_MS = Number(process.env.BOOKING_CACHE_TTL_MS ?? 30_000);

/** Blocking statuses — a cancelled stay frees its nights. */
const HOLDS = ["provisional", "confirmed", "checked_in"] as const;

export async function getCalendarFreshness(
  propertyId: PropertyId
): Promise<CalendarFreshness> {
  const sources = await getBookingStore().listCalendarSources(propertyId);
  // Only feeds we actually depend on can go stale. A property with no
  // configured iCal URL has nothing external to reconcile against.
  const active = sources.filter((source) => source.icalUrl);

  if (active.length === 0) {
    return { lastSyncedAt: null, stale: false, failedChannels: [] };
  }

  const timestamps = active
    .map((source) => source.lastSyncedAt)
    .filter((value): value is string => Boolean(value))
    .sort();
  const lastSyncedAt = timestamps.at(-1) ?? null;
  const age = lastSyncedAt ? Date.now() - new Date(lastSyncedAt).getTime() : Infinity;

  return {
    lastSyncedAt,
    stale: age > CALENDAR_STALE_AFTER_MS,
    failedChannels: active.filter((s) => s.lastSyncError).map((s) => s.channel),
  };
}

export interface AvailabilityInput {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

async function computeAvailability(
  input: AvailabilityInput & { propertyId: PropertyId }
): Promise<AvailabilityResult> {
  const { propertyId, checkIn, checkOut, guests } = input;
  const property = getPropertyConfig(propertyId);
  const store = getBookingStore();

  const [reservations, blocks, calendar] = await Promise.all([
    store.listReservations({
      propertyId,
      from: checkIn,
      to: checkOut,
      statuses: [...HOLDS],
    }),
    store.listBlocks(propertyId),
    getCalendarFreshness(propertyId),
  ]);

  const overlappingReservations = reservations.filter((r) =>
    rangesOverlap(checkIn, checkOut, r.checkIn, r.checkOut)
  );
  const overlappingBlocks = blocks.filter((b) =>
    rangesOverlap(checkIn, checkOut, b.start, b.end)
  );

  const days: DayAvailability[] = stayNights(checkIn, checkOut).map((date) => {
    const held = overlappingReservations.find((r) => date >= r.checkIn && date < r.checkOut);
    if (held) return { date, status: "unavailable", heldBy: held.id };

    const block = overlappingBlocks.find((b) => date >= b.start && date < b.end);
    if (block) {
      return {
        date,
        status: block.reason === "maintenance" ? "maintenance" : "blocked",
        heldBy: block.id,
      };
    }
    return { date, status: "available" };
  });

  const reasons: AvailabilityReason[] = [];
  const nights = nightsBetween(checkIn, checkOut);

  if (checkIn < today()) reasons.push({ code: "past_dates" });

  if (overlappingReservations.length > 0) {
    reasons.push({
      code: "dates_overlap_reservation",
      reservationIds: overlappingReservations.map((r) => r.id),
    });
  }

  if (overlappingBlocks.length > 0) {
    reasons.push({ code: "dates_blocked", blockIds: overlappingBlocks.map((b) => b.id) });
  }

  const minimumNights = effectiveMinimumStay(propertyId, checkIn, checkOut);
  if (nights < minimumNights) {
    reasons.push({ code: "under_minimum_stay", minimumNights, requestedNights: nights });
  }

  if (guests > property.capacity) {
    reasons.push({ code: "over_capacity", capacity: property.capacity, requested: guests });
  }

  const arrivalWeekday = weekdayName(checkIn);
  if (property.noArrivalWeekdays.includes(arrivalWeekday)) {
    reasons.push({ code: "check_in_not_allowed", weekday: arrivalWeekday });
  }

  return {
    propertyId,
    checkIn,
    checkOut,
    guests,
    nights,
    available: reasons.length === 0,
    reasons,
    days,
    conflictingReservationIds: overlappingReservations.map((r) => r.id),
    blockIds: overlappingBlocks.map((b) => b.id),
    calendar,
  };
}

export async function getAvailability(
  input: AvailabilityInput
): Promise<EngineResult<AvailabilityResult>> {
  const { propertyId, checkIn, checkOut, guests } = input;

  if (!isPropertyId(propertyId)) {
    return {
      ok: false,
      escalation: {
        reason: "unknown_property",
        urgency: "normal",
        detail: `No calendar configured for "${propertyId}".`,
      },
    };
  }

  if (!isIsoDate(checkIn) || !isIsoDate(checkOut) || checkOut <= checkIn) {
    return {
      ok: false,
      escalation: {
        reason: "invalid_dates",
        urgency: "normal",
        propertyId,
        detail: `Cannot check ${checkIn} → ${checkOut}: dates must be YYYY-MM-DD with check-out after check-in.`,
      },
    };
  }

  if (!Number.isInteger(guests) || guests < 1) {
    return {
      ok: false,
      escalation: {
        reason: "missing_occupancy",
        urgency: "normal",
        propertyId,
        checkIn,
        checkOut,
        detail: "Guest count is required before availability can be confirmed.",
      },
    };
  }

  const key = `availability:${propertyId}:${checkIn}:${checkOut}:${guests}`;
  const result = await withResilience(
    () =>
      cached(key, AVAILABILITY_CACHE_TTL_MS, () =>
        computeAvailability({ propertyId, checkIn, checkOut, guests })
      ),
    (error) => ({
      reason: "calendar_unavailable",
      urgency: "high",
      propertyId,
      checkIn,
      checkOut,
      detail: `Calendar lookup failed: ${error.message}`,
    })
  );

  if (!result.ok) return result;

  // A stale feed means the local view may be behind a channel booking. Never
  // sell a night we cannot currently verify.
  if (result.data.calendar.stale || result.data.calendar.failedChannels.length > 0) {
    return {
      ok: false,
      escalation: {
        reason: "calendar_unavailable",
        urgency: "high",
        propertyId,
        checkIn,
        checkOut,
        detail: result.data.calendar.stale
          ? `Calendar last synced ${result.data.calendar.lastSyncedAt ?? "never"} — outside the freshness window.`
          : `Channel feeds failing: ${result.data.calendar.failedChannels.join(", ")}.`,
      },
    };
  }

  return result;
}

export interface BookingsQuery {
  propertyId?: string;
  from?: string;
  to?: string;
}

export async function getBookings(
  query: BookingsQuery = {}
): Promise<EngineResult<Reservation[]>> {
  if (query.propertyId && !isPropertyId(query.propertyId)) {
    return {
      ok: false,
      escalation: {
        reason: "unknown_property",
        urgency: "normal",
        detail: `Unknown property "${query.propertyId}".`,
      },
    };
  }

  const from = query.from && isIsoDate(query.from) ? query.from : today();
  const to = query.to && isIsoDate(query.to) ? query.to : addDays(from, 90);

  return withResilience(
    () =>
      getBookingStore().listReservations({
        propertyId: query.propertyId as PropertyId | undefined,
        from,
        to,
      }),
    (error) => ({
      reason: "calendar_unavailable",
      urgency: "high",
      propertyId: query.propertyId as PropertyId | undefined,
      detail: `Booking lookup failed: ${error.message}`,
    })
  );
}

export interface BookingConflict {
  propertyId: PropertyId;
  reservationIds: [string, string];
  overlapStart: IsoDate;
  overlapEnd: IsoDate;
  detail: string;
}

/**
 * Pairwise overlap scan across active reservations. Two stays on the same
 * property sharing a night is a double booking — always owner-notified,
 * never resolved by the assistant.
 */
export function detectConflicts(reservations: Reservation[]): BookingConflict[] {
  const conflicts: BookingConflict[] = [];
  const byProperty = new Map<PropertyId, Reservation[]>();

  for (const reservation of reservations) {
    if (!HOLDS.includes(reservation.status as (typeof HOLDS)[number])) continue;
    const list = byProperty.get(reservation.propertyId) ?? [];
    list.push(reservation);
    byProperty.set(reservation.propertyId, list);
  }

  for (const [propertyId, list] of byProperty) {
    const sorted = [...list].sort((a, b) => a.checkIn.localeCompare(b.checkIn));
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const a = sorted[i];
        const b = sorted[j];
        // Sorted by arrival: once b starts after a ends, no later stay can overlap a.
        if (b.checkIn >= a.checkOut) break;
        if (!rangesOverlap(a.checkIn, a.checkOut, b.checkIn, b.checkOut)) continue;

        const overlapStart = a.checkIn > b.checkIn ? a.checkIn : b.checkIn;
        const overlapEnd = a.checkOut < b.checkOut ? a.checkOut : b.checkOut;
        conflicts.push({
          propertyId,
          reservationIds: [a.id, b.id],
          overlapStart,
          overlapEnd,
          detail: `${a.guestName} (${a.channel}) and ${b.guestName} (${b.channel}) both hold ${overlapStart} → ${overlapEnd}.`,
        });
      }
    }
  }

  return conflicts;
}

export async function findConflicts(
  propertyId?: PropertyId
): Promise<EngineResult<BookingConflict[]>> {
  const from = today();
  return withResilience(
    async () => {
      const reservations = await getBookingStore().listReservations({
        propertyId,
        from,
        to: addDays(from, 365),
        statuses: [...HOLDS],
      });
      return detectConflicts(reservations);
    },
    (error) => ({
      reason: "calendar_unavailable",
      urgency: "high",
      propertyId,
      detail: `Conflict scan failed: ${error.message}`,
    })
  );
}

export function invalidateAvailabilityCache(propertyId: PropertyId) {
  invalidateProperty(propertyId);
}
