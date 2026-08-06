// Property registry — capacity, stay rules, fees and seasonal pricing.
//
// This is the single source of truth the engines read. Nothing here is
// inferred at runtime: a property that is missing a field is a configuration
// bug, not something for the assistant to guess around.

import type { PropertyConfig, PropertyId } from "./types";

const STANDARD_SEASONS = [
  { name: "Peak (festive)", start: "12-15", end: "01-10", multiplier: 1.6, minimumStayNights: 5 },
  { name: "High (dry season)", start: "07-01", end: "09-30", multiplier: 1.3 },
  { name: "Low (long rains)", start: "04-15", end: "06-15", multiplier: 0.8 },
];

export const PROPERTIES: Record<PropertyId, PropertyConfig> = {
  "hh-villa": {
    id: "hh-villa",
    name: "HH Villa",
    location: "Oceanfront, Harbour Hills",
    capacity: 12,
    bedrooms: 6,
    amenities: [
      "Private beach access",
      "Infinity pool",
      "Full-time chef",
      "Housekeeping",
      "Air conditioning",
      "Wi-Fi",
      "Airport transfers",
    ],
    checkInFrom: "14:00",
    checkOutBy: "10:00",
    checkInRules:
      "Check-in from 14:00. Arrivals after 21:00 need advance notice so the night guard can be briefed.",
    checkOutRules: "Check-out by 10:00. Late check-out is subject to availability and is an owner decision.",
    noArrivalWeekdays: [],
    houseRules: [
      "No events or parties without written owner approval",
      "No smoking indoors",
      "Quiet hours 22:00–07:00",
    ],
    pricing: {
      baseNightlyRate: 410,
      weekendMultiplier: 1.15,
      seasons: STANDARD_SEASONS,
      minimumStayNights: 2,
      cleaningFee: 180,
      extraGuestFeePerNight: 35,
      includedGuests: 8,
      taxRatePct: 16,
      lengthOfStayDiscounts: [
        { minNights: 7, discountPct: 10 },
        { minNights: 14, discountPct: 15 },
      ],
      currency: "USD",
    },
  },

  "hh-villa-main-house": {
    id: "hh-villa-main-house",
    name: "HH Villa Main House",
    location: "Oceanfront, Harbour Hills",
    capacity: 8,
    bedrooms: 4,
    amenities: [
      "Private beach access",
      "Shared infinity pool",
      "Housekeeping",
      "Air conditioning",
      "Wi-Fi",
    ],
    checkInFrom: "14:00",
    checkOutBy: "10:00",
    checkInRules: "Check-in from 14:00.",
    checkOutRules: "Check-out by 10:00.",
    noArrivalWeekdays: [],
    houseRules: ["No events without owner approval", "No smoking indoors"],
    pricing: {
      baseNightlyRate: 290,
      weekendMultiplier: 1.15,
      seasons: STANDARD_SEASONS,
      minimumStayNights: 2,
      cleaningFee: 120,
      extraGuestFeePerNight: 30,
      includedGuests: 6,
      taxRatePct: 16,
      lengthOfStayDiscounts: [{ minNights: 7, discountPct: 10 }],
      currency: "USD",
    },
  },

  "hh-villa-bungalows": {
    id: "hh-villa-bungalows",
    name: "HH Villa Bungalows",
    location: "Oceanfront, Harbour Hills",
    capacity: 4,
    bedrooms: 2,
    amenities: ["Garden terrace", "Shared pool", "Housekeeping", "Wi-Fi", "Fan-cooled"],
    checkInFrom: "14:00",
    checkOutBy: "10:00",
    checkInRules: "Check-in from 14:00 at the main house reception.",
    checkOutRules: "Check-out by 10:00.",
    noArrivalWeekdays: [],
    houseRules: ["No smoking indoors", "Quiet hours 22:00–07:00"],
    pricing: {
      baseNightlyRate: 145,
      weekendMultiplier: 1.1,
      seasons: STANDARD_SEASONS,
      minimumStayNights: 2,
      cleaningFee: 60,
      extraGuestFeePerNight: 20,
      includedGuests: 2,
      taxRatePct: 16,
      lengthOfStayDiscounts: [{ minNights: 7, discountPct: 8 }],
      currency: "USD",
    },
  },

  "giant-house": {
    id: "giant-house",
    name: "Giant House",
    location: "Hillside Estate, North Ridge",
    capacity: 16,
    bedrooms: 8,
    amenities: [
      "Panoramic valley views",
      "Heated pool",
      "Chef on request",
      "Housekeeping",
      "Wi-Fi",
      "Log fireplace",
    ],
    checkInFrom: "15:00",
    checkOutBy: "11:00",
    checkInRules: "Check-in from 15:00. The access gate closes at 22:00.",
    checkOutRules: "Check-out by 11:00.",
    noArrivalWeekdays: [],
    houseRules: ["No events without owner approval", "No smoking indoors", "Pets by prior arrangement"],
    pricing: {
      baseNightlyRate: 365,
      weekendMultiplier: 1.2,
      seasons: STANDARD_SEASONS,
      minimumStayNights: 2,
      cleaningFee: 200,
      extraGuestFeePerNight: 30,
      includedGuests: 10,
      taxRatePct: 16,
      lengthOfStayDiscounts: [
        { minNights: 7, discountPct: 10 },
        { minNights: 21, discountPct: 18 },
      ],
      currency: "USD",
    },
  },

  "big-tree-house": {
    id: "big-tree-house",
    name: "Big Tree House",
    location: "Forest Edge, North Ridge",
    capacity: 6,
    bedrooms: 3,
    amenities: ["Treetop deck", "Outdoor shower", "Housekeeping", "Wi-Fi"],
    checkInFrom: "15:00",
    checkOutBy: "11:00",
    checkInRules: "Check-in from 15:00. The forest track is 4x4 only after heavy rain.",
    checkOutRules: "Check-out by 11:00.",
    noArrivalWeekdays: [],
    houseRules: ["No open fires outside the fire pit", "No smoking indoors"],
    pricing: {
      baseNightlyRate: 220,
      weekendMultiplier: 1.15,
      seasons: STANDARD_SEASONS,
      minimumStayNights: 2,
      cleaningFee: 90,
      extraGuestFeePerNight: 25,
      includedGuests: 4,
      taxRatePct: 16,
      lengthOfStayDiscounts: [{ minNights: 7, discountPct: 10 }],
      currency: "USD",
    },
  },

  "safari-house": {
    id: "safari-house",
    name: "Safari House",
    location: "Conservancy Boundary, Rift Valley",
    capacity: 10,
    bedrooms: 5,
    amenities: [
      "Game drives on request",
      "Waterhole viewing deck",
      "Full board available",
      "Solar power",
      "Wi-Fi (limited)",
    ],
    checkInFrom: "14:00",
    checkOutBy: "10:00",
    checkInRules:
      "Check-in from 14:00. Conservancy gates close at 18:30 — later arrivals must be pre-arranged with the owner.",
    checkOutRules: "Check-out by 10:00.",
    noArrivalWeekdays: [],
    houseRules: [
      "Guests must be escorted after dark",
      "No feeding wildlife",
      "Conservancy fees are billed separately and confirmed by the owner",
    ],
    pricing: {
      baseNightlyRate: 480,
      weekendMultiplier: 1.1,
      seasons: [
        { name: "Peak (migration)", start: "07-01", end: "10-15", multiplier: 1.7, minimumStayNights: 3 },
        { name: "Peak (festive)", start: "12-15", end: "01-10", multiplier: 1.6, minimumStayNights: 4 },
        { name: "Low (long rains)", start: "04-01", end: "05-31", multiplier: 0.7 },
      ],
      minimumStayNights: 3,
      cleaningFee: 150,
      extraGuestFeePerNight: 40,
      includedGuests: 6,
      taxRatePct: 16,
      lengthOfStayDiscounts: [{ minNights: 7, discountPct: 12 }],
      currency: "USD",
    },
  },

  "villa-latia": {
    id: "villa-latia",
    name: "Villa Latia",
    location: "Cliffside, Harbour Hills",
    capacity: 8,
    bedrooms: 4,
    amenities: ["Clifftop pool", "Sunset terrace", "Housekeeping", "Air conditioning", "Wi-Fi"],
    checkInFrom: "14:00",
    checkOutBy: "10:00",
    checkInRules: "Check-in from 14:00.",
    checkOutRules: "Check-out by 10:00.",
    noArrivalWeekdays: [],
    houseRules: ["Children under 12 must be supervised near the cliff terrace", "No smoking indoors"],
    pricing: {
      baseNightlyRate: 335,
      weekendMultiplier: 1.15,
      seasons: STANDARD_SEASONS,
      minimumStayNights: 2,
      cleaningFee: 140,
      extraGuestFeePerNight: 30,
      includedGuests: 6,
      taxRatePct: 16,
      lengthOfStayDiscounts: [{ minNights: 7, discountPct: 10 }],
      currency: "USD",
    },
  },

  "fig-tree-house": {
    id: "fig-tree-house",
    name: "Fig Tree House",
    location: "Old Town, Harbour Hills",
    capacity: 6,
    bedrooms: 3,
    amenities: ["Courtyard garden", "Rooftop terrace", "Housekeeping", "Wi-Fi", "Walking distance to town"],
    checkInFrom: "14:00",
    checkOutBy: "10:00",
    checkInRules: "Check-in from 14:00. Vehicle access to the lane is restricted on market mornings.",
    checkOutRules: "Check-out by 10:00.",
    noArrivalWeekdays: [],
    houseRules: ["No parties", "No smoking indoors", "Respect neighbours — this is a residential lane"],
    pricing: {
      baseNightlyRate: 195,
      weekendMultiplier: 1.1,
      seasons: STANDARD_SEASONS,
      minimumStayNights: 2,
      cleaningFee: 80,
      extraGuestFeePerNight: 25,
      includedGuests: 4,
      taxRatePct: 16,
      lengthOfStayDiscounts: [{ minNights: 7, discountPct: 10 }],
      currency: "USD",
    },
  },
};

export const PROPERTY_IDS = Object.keys(PROPERTIES) as PropertyId[];

export function isPropertyId(value: unknown): value is PropertyId {
  return typeof value === "string" && value in PROPERTIES;
}

export function getPropertyConfig(id: PropertyId): PropertyConfig {
  return PROPERTIES[id];
}

/**
 * Resolves a free-text property name to an id. Returns `null` rather than a
 * best guess — an unknown property is an escalation, not a coin flip.
 */
export function resolvePropertyId(input: string): PropertyId | null {
  const normalized = input.trim().toLowerCase();
  if (isPropertyId(normalized)) return normalized;

  const slug = normalized.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (isPropertyId(slug)) return slug;

  const byName = PROPERTY_IDS.filter(
    (id) => PROPERTIES[id].name.toLowerCase() === normalized
  );
  if (byName.length === 1) return byName[0];

  // Only accept a partial match when exactly one property matches; "HH Villa"
  // is a prefix of three properties and must not silently pick one.
  const partial = PROPERTY_IDS.filter((id) =>
    PROPERTIES[id].name.toLowerCase().includes(normalized)
  );
  return partial.length === 1 ? partial[0] : null;
}
