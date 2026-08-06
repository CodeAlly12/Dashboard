// Regression checks for the deterministic booking engines.
//
// Run with `npm run test:engines`. These cover the rules that cause real
// money and real double bookings to go wrong: night arithmetic, turnover-day
// semantics, seasonal and weekend pricing, minimum stays, calendar
// reconciliation, and the concurrent-hold guard.
//
// The suite runs against the in-memory store, so it needs no credentials.

import assert from "node:assert/strict";

import { addDays, rangesOverlap, stayNights, today } from "../src/lib/booking/dates";
import { getPricing, effectiveMinimumStay } from "../src/lib/booking/pricing";
import { getAvailability, detectConflicts } from "../src/lib/booking/calendar";
import { parseIcal, compareCalendars } from "../src/lib/booking/ical";
import { createReservation } from "../src/lib/booking/reservations";
import { getBookingStore } from "../src/lib/booking/store";

const base = today();

// --- dates ---------------------------------------------------------------
assert.equal(stayNights("2026-03-01", "2026-03-04").length, 3, "3 nights");
assert.equal(rangesOverlap("2026-03-01", "2026-03-05", "2026-03-05", "2026-03-08"), false, "turnover day is not an overlap");
assert.equal(rangesOverlap("2026-03-01", "2026-03-05", "2026-03-04", "2026-03-08"), true, "shared night overlaps");
console.log("✓ date semantics");

// --- pricing -------------------------------------------------------------
const quote = getPricing({ propertyId: "hh-villa", checkIn: "2026-03-02", checkOut: "2026-03-06", guests: 6 });
assert.ok(quote.ok, "pricing should succeed");
if (quote.ok) {
  const p = quote.data;
  assert.equal(p.nights, 4);
  assert.equal(p.nightly.length, 4);
  // Nights Mon 2 – Thu 5; Fri 6 is the departure and is not charged.
  const weekendNights = p.nightly.filter((n) => n.isWeekend).length;
  assert.equal(weekendNights, 0, `expected 0 weekend nights, got ${weekendNights}`);
  const sum = p.nightly.reduce((s, n) => s + n.rate, 0);
  assert.equal(Math.round(sum * 100), Math.round(p.accommodationSubtotal * 100), "nightly lines sum to subtotal");
  const expectedTaxable = p.accommodationSubtotal - p.lengthOfStayDiscount - p.promoDiscount + p.extraGuestFee + p.cleaningFee;
  assert.equal(p.taxableSubtotal.toFixed(2), expectedTaxable.toFixed(2), "taxable subtotal is consistent");
  assert.equal(p.total.toFixed(2), (p.taxableSubtotal + p.taxes).toFixed(2), "total = taxable + taxes");
  assert.equal(p.extraGuestFee, 0, "6 guests is within the included 8");
  console.log(`✓ pricing: ${p.currency} ${p.total.toFixed(2)} for ${p.nights} nights`);
}

// Fri + Sat nights carry the weekend multiplier.
const weekend = getPricing({ propertyId: "hh-villa", checkIn: "2026-03-06", checkOut: "2026-03-08", guests: 4 });
assert.ok(weekend.ok);
if (weekend.ok) {
  assert.equal(weekend.data.nightly.filter((n) => n.isWeekend).length, 2, "Fri and Sat are weekend nights");
  assert.equal(weekend.data.nightly[0].rate, Math.round(410 * 1.15 * 100) / 100, "weekend multiplier applied");
}
console.log("✓ weekend uplift");

// Extra guests are charged per guest per night.
const big = getPricing({ propertyId: "hh-villa", checkIn: "2026-03-02", checkOut: "2026-03-06", guests: 10 });
assert.ok(big.ok);
if (big.ok) assert.equal(big.data.extraGuestFee, 2 * 35 * 4, "2 extra guests x $35 x 4 nights");
console.log("✓ extra-guest fee");

// Peak season lifts the rate and the minimum stay.
const peak = getPricing({ propertyId: "hh-villa", checkIn: "2026-12-20", checkOut: "2026-12-27", guests: 4 });
assert.ok(peak.ok);
if (peak.ok) {
  assert.ok(peak.data.seasonalAdjustment > 0, "peak season costs more than base");
  assert.equal(peak.data.nightly[0].season, "Peak (festive)");
}
assert.equal(effectiveMinimumStay("hh-villa", "2026-12-20", "2026-12-27"), 5, "festive minimum stay applies");
console.log("✓ seasonal pricing + minimum stay");

// Unknown promo codes escalate rather than silently applying nothing.
const promo = getPricing({ propertyId: "hh-villa", checkIn: "2026-03-02", checkOut: "2026-03-06", guests: 4, promoCode: "FRIENDSDEAL" });
assert.equal(promo.ok, false);
if (!promo.ok) assert.equal(promo.escalation.reason, "special_discount");
const known = getPricing({ propertyId: "hh-villa", checkIn: "2026-03-02", checkOut: "2026-03-06", guests: 4, promoCode: "direct10" });
assert.ok(known.ok && known.data.promoDiscount > 0, "registered promo applies, case-insensitively");
console.log("✓ promo handling");

// Unknown property / bad dates escalate.
assert.equal(getPricing({ propertyId: "nope", checkIn: "2026-03-02", checkOut: "2026-03-06", guests: 2 }).ok, false);
assert.equal(getPricing({ propertyId: "hh-villa", checkIn: "2026-03-06", checkOut: "2026-03-02", guests: 2 }).ok, false);
console.log("✓ pricing input validation");

// --- availability --------------------------------------------------------
// Seed data holds hh-villa from +3 to +8 and blocks maintenance +10 to +12.
const clash = await getAvailability({ propertyId: "hh-villa", checkIn: addDays(base, 4), checkOut: addDays(base, 6), guests: 2 });
assert.ok(clash.ok);
if (clash.ok) {
  assert.equal(clash.data.available, false, "overlapping the seeded stay is unavailable");
  assert.ok(clash.data.reasons.some((r) => r.code === "dates_overlap_reservation"));
}

const turnover = await getAvailability({ propertyId: "hh-villa", checkIn: addDays(base, 8), checkOut: addDays(base, 10), guests: 2 });
assert.ok(turnover.ok);
if (turnover.ok) assert.equal(turnover.data.available, true, "arriving on the departure day is bookable");

const blocked = await getAvailability({ propertyId: "hh-villa", checkIn: addDays(base, 10), checkOut: addDays(base, 12), guests: 2 });
assert.ok(blocked.ok);
if (blocked.ok) assert.ok(blocked.data.reasons.some((r) => r.code === "dates_blocked"), "maintenance blocks the dates");

const tooMany = await getAvailability({ propertyId: "hh-villa", checkIn: addDays(base, 40), checkOut: addDays(base, 43), guests: 30 });
assert.ok(tooMany.ok);
if (tooMany.ok) assert.ok(tooMany.data.reasons.some((r) => r.code === "over_capacity"));

const shortStay = await getAvailability({ propertyId: "safari-house", checkIn: addDays(base, 40), checkOut: addDays(base, 41), guests: 2 });
assert.ok(shortStay.ok);
if (shortStay.ok) assert.ok(shortStay.data.reasons.some((r) => r.code === "under_minimum_stay"));

const missingGuests = await getAvailability({ propertyId: "hh-villa", checkIn: addDays(base, 40), checkOut: addDays(base, 43), guests: NaN });
assert.equal(missingGuests.ok, false, "missing occupancy escalates");
console.log("✓ availability rules");

// --- iCal ----------------------------------------------------------------
const ics = `BEGIN:VCALENDAR
BEGIN:VEVENT
UID:abnb-001
DTSTART;VALUE=DATE:20260401
DTEND;VALUE=DATE:20260405
SUMMARY:Reserved
LAST-MODIFIED:20260301T101500Z
END:VEVENT
BEGIN:VEVENT
UID:abnb-002
DTSTART;VALUE=DATE:20260410
DTEND;VALUE=DATE:20260412
SUMMARY:Reserved (long summ
 ary folded across lines)
DTSTAMP:20260302T090000Z
END:VEVENT
END:VCALENDAR`;

const events = parseIcal(ics);
assert.equal(events.length, 2);
assert.equal(events[0].start, "2026-04-01");
assert.equal(events[0].end, "2026-04-05");
assert.ok(events[1].summary.includes("folded across lines"), "line folding is unwrapped");
console.log("✓ iCal parsing");

const now = new Date().toISOString();
const localStay = {
  id: "r1", propertyId: "hh-villa" as const, channel: "airbnb" as const, status: "confirmed" as const,
  checkIn: "2026-04-01", checkOut: "2026-04-04", guests: 2, guestName: "A", totalAmount: 0,
  currency: "USD", externalReference: "abnb-001", createdAt: now, updatedAt: "2026-02-01T00:00:00.000Z",
};

const diff = compareCalendars({ propertyId: "hh-villa", channel: "airbnb", local: [localStay], remote: events });
const types = diff.map((c) => c.type).sort();
assert.deepEqual(types, ["modification", "new_booking"], `unexpected diff: ${types}`);
console.log("✓ compareCalendars: newest remote wins, unseen UID is a new booking");

// A remote change older than the local record must not win.
const staleRemote = compareCalendars({
  propertyId: "hh-villa", channel: "airbnb",
  local: [{ ...localStay, updatedAt: "2026-05-01T00:00:00.000Z" }],
  remote: [events[0]],
});
assert.ok(!staleRemote.some((c) => c.type === "modification"), "older remote edit is ignored");

// Identical timestamps cannot settle a disagreement → conflict.
const tie = compareCalendars({
  propertyId: "hh-villa", channel: "airbnb",
  local: [{ ...localStay, updatedAt: events[0].updatedAt }],
  remote: [events[0]],
});
assert.ok(tie.some((c) => c.type === "conflict"), "tied timestamps flag a conflict");

// An incoming booking on nights another channel already holds is a conflict.
const crossChannel = compareCalendars({
  propertyId: "hh-villa", channel: "airbnb", local: [], remote: [events[0]],
  others: [{ ...localStay, id: "r9", channel: "booking_com", externalReference: "bcom-1" }],
});
assert.equal(crossChannel[0].type, "conflict");

// Local stay missing from the feed is a cancellation.
const dropped = compareCalendars({ propertyId: "hh-villa", channel: "airbnb", local: [localStay], remote: [] });
assert.equal(dropped[0].type, "cancellation");

const unchanged = compareCalendars({
  propertyId: "hh-villa", channel: "airbnb",
  local: [{ ...localStay, checkOut: "2026-04-05" }], remote: [events[0]],
});
assert.equal(unchanged[0].type, "no_change");
console.log("✓ compareCalendars: stale, tie, cross-channel, cancellation, no-change");

// --- conflict detection --------------------------------------------------
const conflicts = detectConflicts([
  localStay,
  { ...localStay, id: "r2", checkIn: "2026-04-03", checkOut: "2026-04-06", externalReference: "bcom-2" },
  { ...localStay, id: "r3", checkIn: "2026-04-04", checkOut: "2026-04-08", externalReference: "vrbo-3" },
]);
assert.equal(conflicts.length, 2, `expected 2 overlapping pairs, got ${conflicts.length}`);
console.log("✓ conflict detection");

// --- reservations --------------------------------------------------------
const held = await createReservation({
  propertyId: "fig-tree-house", checkIn: addDays(base, 30), checkOut: addDays(base, 34),
  guests: 4, guestName: "Test Guest", guestEmail: "test@example.com",
});
assert.ok(held.ok, "hold should be created");
if (held.ok) {
  assert.equal(held.data.status, "provisional", "assistant holds are never confirmed");
  assert.ok(held.data.total > 0);
}

const doubleBook = await createReservation({
  propertyId: "fig-tree-house", checkIn: addDays(base, 31), checkOut: addDays(base, 33),
  guests: 2, guestName: "Second Guest", guestEmail: "second@example.com",
});
assert.equal(doubleBook.ok, false, "overlapping hold must be refused");
if (!doubleBook.ok) assert.equal(doubleBook.escalation.reason, "booking_conflict");

const noContact = await createReservation({
  propertyId: "fig-tree-house", checkIn: addDays(base, 60), checkOut: addDays(base, 63),
  guests: 2, guestName: "No Contact",
});
assert.equal(noContact.ok, false, "a hold needs a contact method");

// The hold is visible to the calendar engine immediately (cache invalidated).
const after = await getAvailability({
  propertyId: "fig-tree-house", checkIn: addDays(base, 31), checkOut: addDays(base, 33), guests: 2,
});
assert.ok(after.ok && after.data.available === false, "held nights are no longer available");

const all = await getBookingStore().listReservations({ propertyId: "fig-tree-house" });
assert.equal(all.filter((r) => r.status === "provisional").length, 1, "exactly one surviving hold");
console.log("✓ reservations: hold, double-book refusal, contact requirement, cache invalidation");

console.log("\nAll booking engine checks passed.");
