// Shared types for the booking subsystem.
//
// Everything in `src/lib/booking/` is deterministic business logic. The model
// never computes prices or availability — it calls these engines and explains
// the results.

export type PropertyId =
  | "hh-villa"
  | "hh-villa-bungalows"
  | "hh-villa-main-house"
  | "giant-house"
  | "big-tree-house"
  | "safari-house"
  | "villa-latia"
  | "fig-tree-house";

export type BookingChannel =
  | "airbnb"
  | "booking_com"
  | "expedia"
  | "vrbo"
  | "direct_website"
  | "social_media";

export type ReservationStatus =
  | "provisional"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled";

/** ISO calendar date, `YYYY-MM-DD`. Never a `Date` at a boundary — timezones. */
export type IsoDate = string;

export interface Reservation {
  id: string;
  propertyId: PropertyId;
  channel: BookingChannel;
  status: ReservationStatus;
  /** Night of arrival. The stay occupies [checkIn, checkOut). */
  checkIn: IsoDate;
  /** Departure morning. This night is free for the next guest. */
  checkOut: IsoDate;
  guests: number;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  totalAmount: number;
  currency: string;
  /** Channel-side identifier (iCal UID, Booking.com reservation id, …). */
  externalReference?: string;
  createdAt: string;
  updatedAt: string;
}

/** Owner-side date block: maintenance, deep clean, owner stay. */
export interface CalendarBlock {
  id: string;
  propertyId: PropertyId;
  start: IsoDate;
  end: IsoDate;
  reason: "maintenance" | "blocked" | "owner_stay";
  note?: string;
}

/** One external calendar feed for a property (Airbnb iCal, Booking.com, …). */
export interface CalendarSource {
  id: string;
  propertyId: PropertyId;
  channel: BookingChannel;
  icalUrl: string;
  lastSyncedAt?: string;
  lastSyncError?: string;
}

export type DayStatus = "available" | "unavailable" | "blocked" | "maintenance";

export interface DayAvailability {
  date: IsoDate;
  status: DayStatus;
  /** Reservation or block id responsible for a non-available day. */
  heldBy?: string;
}

export interface AvailabilityResult {
  propertyId: PropertyId;
  checkIn: IsoDate;
  checkOut: IsoDate;
  guests: number;
  nights: number;
  available: boolean;
  /** Machine-readable reasons the stay was rejected. Empty when available. */
  reasons: AvailabilityReason[];
  days: DayAvailability[];
  conflictingReservationIds: string[];
  blockIds: string[];
  calendar: CalendarFreshness;
}

export type AvailabilityReason =
  | { code: "dates_overlap_reservation"; reservationIds: string[] }
  | { code: "dates_blocked"; blockIds: string[] }
  | { code: "under_minimum_stay"; minimumNights: number; requestedNights: number }
  | { code: "over_capacity"; capacity: number; requested: number }
  | { code: "check_in_not_allowed"; weekday: string }
  | { code: "past_dates" };

export interface CalendarFreshness {
  lastSyncedAt: string | null;
  /** True when no feed has synced inside the freshness window. */
  stale: boolean;
  /** Feeds that failed on their last attempt. */
  failedChannels: BookingChannel[];
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export interface SeasonRule {
  name: string;
  /** Inclusive `MM-DD`. A window whose end precedes its start wraps the year. */
  start: string;
  end: string;
  /** Applied to the base nightly rate. 1.0 = no change. */
  multiplier: number;
  minimumStayNights?: number;
}

export interface LengthOfStayDiscount {
  minNights: number;
  discountPct: number;
}

export interface PricingRules {
  baseNightlyRate: number;
  /** Applied on Friday and Saturday nights. */
  weekendMultiplier: number;
  seasons: SeasonRule[];
  minimumStayNights: number;
  cleaningFee: number;
  /** Charged per guest per night above `includedGuests`. */
  extraGuestFeePerNight: number;
  includedGuests: number;
  taxRatePct: number;
  lengthOfStayDiscounts: LengthOfStayDiscount[];
  currency: string;
}

export interface PropertyConfig {
  id: PropertyId;
  name: string;
  location: string;
  capacity: number;
  bedrooms: number;
  amenities: string[];
  checkInFrom: string;
  checkOutBy: string;
  checkInRules: string;
  checkOutRules: string;
  /** Weekdays on which arrivals are not accepted, e.g. `["Sunday"]`. */
  noArrivalWeekdays: string[];
  houseRules: string[];
  pricing: PricingRules;
}

export interface PriceLine {
  date: IsoDate;
  /** Nightly rate after season and weekend adjustments, before discounts. */
  rate: number;
  season: string | null;
  isWeekend: boolean;
}

export interface PricingResult {
  propertyId: PropertyId;
  checkIn: IsoDate;
  checkOut: IsoDate;
  guests: number;
  nights: number;
  currency: string;
  nightly: PriceLine[];
  accommodationSubtotal: number;
  seasonalAdjustment: number;
  extraGuestFee: number;
  lengthOfStayDiscount: number;
  promoDiscount: number;
  promoCode: string | null;
  cleaningFee: number;
  taxableSubtotal: number;
  taxes: number;
  total: number;
  averageNightlyRate: number;
}

// ---------------------------------------------------------------------------
// Calendar reconciliation
// ---------------------------------------------------------------------------

export type CalendarChangeType =
  | "new_booking"
  | "cancellation"
  | "modification"
  | "conflict"
  | "no_change";

export interface CalendarChange {
  type: CalendarChangeType;
  propertyId: PropertyId;
  channel: BookingChannel;
  externalReference: string;
  local?: { checkIn: IsoDate; checkOut: IsoDate; updatedAt: string };
  remote?: { checkIn: IsoDate; checkOut: IsoDate; updatedAt: string };
  /** Populated for `conflict`: the other reservations overlapping these dates. */
  conflictsWith?: string[];
  detail: string;
}

export interface SyncResult {
  propertyId: PropertyId;
  syncedAt: string;
  changes: CalendarChange[];
  failedChannels: { channel: BookingChannel; error: string }[];
}

// ---------------------------------------------------------------------------
// Escalation
// ---------------------------------------------------------------------------

export type EscalationReason =
  | "pricing_unavailable"
  | "calendar_unavailable"
  | "api_timeout"
  | "booking_conflict"
  | "unknown_property"
  | "invalid_dates"
  | "missing_occupancy"
  | "guest_exception_request"
  | "special_discount"
  | "corporate_rate"
  | "long_term_rental"
  | "complaint"
  | "refund_request"
  | "legal_question"
  | "damage_claim"
  | "owner_approval_required"
  | "payment_issue";

export type Urgency = "low" | "normal" | "high" | "critical";

export interface EscalationPayload {
  reason: EscalationReason;
  urgency: Urgency;
  propertyId?: PropertyId;
  guestName?: string;
  guestPhone?: string;
  question?: string;
  checkIn?: IsoDate;
  checkOut?: IsoDate;
  conversationSummary?: string;
  detail?: string;
}

/**
 * Every engine returns this shape. Failures never throw across the tool
 * boundary — they come back as `ok: false` so the orchestrator can escalate
 * instead of letting the model improvise.
 */
export type EngineResult<T> =
  | { ok: true; data: T }
  | { ok: false; escalation: EscalationPayload };

export const GUEST_ESCALATION_MESSAGE =
  "I'd like to verify that before giving you an answer. One of our team members will confirm shortly.";
