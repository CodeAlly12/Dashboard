// Reservation creation.
//
// The assistant can only ever create a *provisional* hold, and only after
// availability and pricing both verify. Confirmation requires payment and
// stays a human step.

import { getAvailability, invalidateAvailabilityCache } from "./calendar";
import { detectConflicts } from "./calendar";
import { escalate, notifyOwner } from "./notifications";
import { getPricing } from "./pricing";
import { getPropertyConfig, isPropertyId } from "./properties";
import { getBookingStore } from "./store";
import { addDays, today } from "./dates";
import type { BookingChannel, EngineResult, PropertyId, Reservation } from "./types";

/** How long an assistant-created hold stays valid before staff review. */
export const HOLD_DURATION_MINUTES = Number(process.env.BOOKING_HOLD_MINUTES ?? 60);

export interface CreateReservationInput {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  channel?: BookingChannel;
  promoCode?: string | null;
}

export interface CreateReservationResult {
  reservation: Reservation;
  status: "provisional";
  holdExpiresAt: string;
  total: number;
  currency: string;
  nextStep: string;
}

export async function createReservation(
  input: CreateReservationInput
): Promise<EngineResult<CreateReservationResult>> {
  const { propertyId, checkIn, checkOut, guests, guestName } = input;

  if (!isPropertyId(propertyId)) {
    return {
      ok: false,
      escalation: {
        reason: "unknown_property",
        urgency: "normal",
        detail: `Cannot create a reservation for unknown property "${propertyId}".`,
      },
    };
  }

  if (!guestName?.trim()) {
    return {
      ok: false,
      escalation: {
        reason: "owner_approval_required",
        urgency: "normal",
        propertyId,
        checkIn,
        checkOut,
        detail: "Guest name is required before a hold can be created.",
      },
    };
  }

  if (!input.guestEmail && !input.guestPhone) {
    return {
      ok: false,
      escalation: {
        reason: "owner_approval_required",
        urgency: "normal",
        propertyId,
        guestName,
        checkIn,
        checkOut,
        detail: "A hold needs at least one contact method — email or phone.",
      },
    };
  }

  // Availability first, then pricing. Never reversed: a price for nights we
  // cannot sell is worse than no answer.
  const availability = await getAvailability({ propertyId, checkIn, checkOut, guests });
  if (!availability.ok) return availability;

  if (!availability.data.available) {
    return {
      ok: false,
      escalation: {
        reason: "booking_conflict",
        urgency: "normal",
        propertyId,
        guestName,
        checkIn,
        checkOut,
        detail: `Requested dates are not bookable: ${availability.data.reasons
          .map((r) => r.code)
          .join(", ")}.`,
      },
    };
  }

  const pricing = getPricing({
    propertyId,
    checkIn,
    checkOut,
    guests,
    promoCode: input.promoCode,
  });
  if (!pricing.ok) return pricing;

  const store = getBookingStore();
  const property = getPropertyConfig(propertyId);

  let reservation: Reservation;
  try {
    reservation = await store.createReservation({
      propertyId,
      channel: input.channel ?? "direct_website",
      status: "provisional",
      checkIn,
      checkOut,
      guests,
      guestName: guestName.trim(),
      guestEmail: input.guestEmail,
      guestPhone: input.guestPhone,
      totalAmount: pricing.data.total,
      currency: pricing.data.currency,
    });
  } catch (error) {
    return {
      ok: false,
      escalation: {
        reason: "booking_conflict",
        urgency: "high",
        propertyId,
        guestName,
        checkIn,
        checkOut,
        detail: `Reservation write failed: ${error instanceof Error ? error.message : String(error)}`,
      },
    };
  }

  invalidateAvailabilityCache(propertyId);

  // Re-read after the write. Two requests can pass the availability check
  // concurrently; whichever lands second must not keep its hold.
  const active = await store.listReservations({
    propertyId,
    from: today(),
    to: addDays(today(), 365),
    statuses: ["provisional", "confirmed", "checked_in"],
  });
  const conflict = detectConflicts(active).find((c) => c.reservationIds.includes(reservation.id));

  if (conflict) {
    await store.updateReservation(reservation.id, { status: "cancelled" });
    invalidateAvailabilityCache(propertyId);
    return {
      ok: false,
      escalation: {
        reason: "booking_conflict",
        urgency: "critical",
        propertyId,
        guestName,
        checkIn,
        checkOut,
        detail: `Hold released — another reservation claimed the same nights: ${conflict.detail}`,
      },
    };
  }

  const holdExpiresAt = new Date(Date.now() + HOLD_DURATION_MINUTES * 60_000).toISOString();

  await store.appendAudit({
    action: "reservation.provisional_created",
    propertyId,
    actor: "assistant",
    detail: { reservationId: reservation.id, total: pricing.data.total, holdExpiresAt },
  });

  await notifyOwner(
    "new_booking",
    [
      `Property: ${property.name}`,
      `Guest: ${reservation.guestName} (${guests} guests)`,
      `Dates: ${checkIn} → ${checkOut} (${pricing.data.nights} nights)`,
      `Total: ${pricing.data.currency} ${pricing.data.total.toFixed(2)}`,
      `Status: PROVISIONAL — hold expires ${holdExpiresAt}`,
    ],
    "high"
  );

  return {
    ok: true,
    data: {
      reservation,
      status: "provisional",
      holdExpiresAt,
      total: pricing.data.total,
      currency: pricing.data.currency,
      nextStep:
        "Hold created. A team member confirms the reservation once payment terms are settled.",
    },
  };
}

/** Cancels a provisional hold and notifies the owner. */
export async function releaseHold(
  reservationId: string,
  note: string
): Promise<EngineResult<{ released: boolean }>> {
  const store = getBookingStore();
  const reservation = await store.getReservation(reservationId);

  if (!reservation) {
    return {
      ok: false,
      escalation: {
        reason: "owner_approval_required",
        urgency: "normal",
        detail: `No reservation found with id ${reservationId}.`,
      },
    };
  }

  if (reservation.status !== "provisional") {
    // Cancelling a confirmed stay is never an assistant decision.
    await escalate({
      reason: "owner_approval_required",
      urgency: "high",
      propertyId: reservation.propertyId as PropertyId,
      guestName: reservation.guestName,
      checkIn: reservation.checkIn,
      checkOut: reservation.checkOut,
      detail: `Requested release of a ${reservation.status} reservation: ${note}`,
    });
    return {
      ok: false,
      escalation: {
        reason: "owner_approval_required",
        urgency: "high",
        propertyId: reservation.propertyId as PropertyId,
        detail: `Reservation ${reservationId} is ${reservation.status}; only the owner can cancel it.`,
      },
    };
  }

  await store.updateReservation(reservationId, { status: "cancelled" });
  invalidateAvailabilityCache(reservation.propertyId);
  await store.appendAudit({
    action: "reservation.hold_released",
    propertyId: reservation.propertyId,
    actor: "assistant",
    detail: { reservationId, note },
  });

  return { ok: true, data: { released: true } };
}
