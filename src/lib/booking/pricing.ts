// Pricing engine — the only source of truth for money.
//
// Deterministic, synchronous, dependency-free. The model calls this and
// explains the breakdown; it never adds, discounts or rounds a figure itself.
// All arithmetic runs in integer cents so repeated multiplication can't drift.

import {
  isIsoDate,
  isWeekendNight,
  nightsBetween,
  stayNights,
  today,
  withinSeasonWindow,
} from "./dates";
import { getPropertyConfig, isPropertyId } from "./properties";
import type {
  EngineResult,
  IsoDate,
  PriceLine,
  PricingResult,
  PricingRules,
  PropertyId,
  SeasonRule,
} from "./types";

export interface PromoCode {
  code: string;
  kind: "percent" | "fixed";
  value: number;
  validFrom: IsoDate;
  validTo: IsoDate;
  minNights: number;
  properties: PropertyId[] | "all";
}

/**
 * Registered promotions. A code that is not in this table is never applied —
 * discretionary discounts are an owner decision and escalate instead.
 */
export const PROMO_CODES: Record<string, PromoCode> = {
  DIRECT10: {
    code: "DIRECT10",
    kind: "percent",
    value: 10,
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    minNights: 3,
    properties: "all",
  },
  RETURNGUEST: {
    code: "RETURNGUEST",
    kind: "percent",
    value: 8,
    validFrom: "2026-01-01",
    validTo: "2026-12-31",
    minNights: 2,
    properties: "all",
  },
};

const toCents = (amount: number) => Math.round(amount * 100);
const fromCents = (cents: number) => Math.round(cents) / 100;
const pctOf = (cents: number, pct: number) => Math.round((cents * pct) / 100);

export interface PricingInput {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  promoCode?: string | null;
}

function seasonFor(date: IsoDate, rules: PricingRules): SeasonRule | null {
  return rules.seasons.find((s) => withinSeasonWindow(date, s.start, s.end)) ?? null;
}

/** The strictest minimum stay that applies across the requested nights. */
export function effectiveMinimumStay(
  propertyId: PropertyId,
  checkIn: IsoDate,
  checkOut: IsoDate
): number {
  const { pricing } = getPropertyConfig(propertyId);
  return stayNights(checkIn, checkOut).reduce((min, night) => {
    const season = seasonFor(night, pricing);
    return Math.max(min, season?.minimumStayNights ?? 0);
  }, pricing.minimumStayNights);
}

export function getPricing(input: PricingInput): EngineResult<PricingResult> {
  const { propertyId, checkIn, checkOut, guests, promoCode } = input;

  if (!isPropertyId(propertyId)) {
    return {
      ok: false,
      escalation: {
        reason: "unknown_property",
        urgency: "normal",
        detail: `No pricing rules configured for "${propertyId}".`,
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
        detail: `Cannot price ${checkIn} → ${checkOut}: dates must be YYYY-MM-DD with check-out after check-in.`,
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
        detail: "Guest count is required and must be a whole number of at least 1.",
      },
    };
  }

  const property = getPropertyConfig(propertyId);
  const rules = property.pricing;

  if (guests > property.capacity) {
    return {
      ok: false,
      escalation: {
        reason: "owner_approval_required",
        urgency: "normal",
        propertyId,
        checkIn,
        checkOut,
        detail: `${guests} guests exceeds the ${property.capacity}-guest capacity of ${property.name}.`,
      },
    };
  }

  const nights = nightsBetween(checkIn, checkOut);
  const baseCents = toCents(rules.baseNightlyRate);

  const nightly: PriceLine[] = stayNights(checkIn, checkOut).map((date) => {
    const season = seasonFor(date, rules);
    const weekend = isWeekendNight(date);
    let cents = baseCents;
    if (season) cents = Math.round(cents * season.multiplier);
    if (weekend) cents = Math.round(cents * rules.weekendMultiplier);
    return { date, rate: fromCents(cents), season: season?.name ?? null, isWeekend: weekend };
  });

  const accommodationCents = nightly.reduce((sum, line) => sum + toCents(line.rate), 0);
  const seasonalAdjustmentCents = accommodationCents - baseCents * nights;

  const extraGuests = Math.max(0, guests - rules.includedGuests);
  const extraGuestCents = toCents(rules.extraGuestFeePerNight) * extraGuests * nights;

  const losTier = rules.lengthOfStayDiscounts
    .filter((tier) => nights >= tier.minNights)
    .sort((a, b) => b.discountPct - a.discountPct)[0];
  const losDiscountCents = losTier ? pctOf(accommodationCents, losTier.discountPct) : 0;

  let promoDiscountCents = 0;
  let appliedPromo: string | null = null;
  if (promoCode) {
    const promo = PROMO_CODES[promoCode.trim().toUpperCase()];
    const eligible =
      promo &&
      nights >= promo.minNights &&
      checkIn >= promo.validFrom &&
      checkIn <= promo.validTo &&
      (promo.properties === "all" || promo.properties.includes(propertyId));

    if (!eligible) {
      return {
        ok: false,
        escalation: {
          reason: "special_discount",
          urgency: "normal",
          propertyId,
          checkIn,
          checkOut,
          detail: promo
            ? `Promo code ${promo.code} does not apply to this stay (min ${promo.minNights} nights, valid ${promo.validFrom} to ${promo.validTo}).`
            : `Unrecognised promo code "${promoCode}". Discounts outside the registered codes need owner approval.`,
        },
      };
    }

    const discountable = accommodationCents - losDiscountCents;
    promoDiscountCents =
      promo.kind === "percent"
        ? pctOf(discountable, promo.value)
        : Math.min(toCents(promo.value), discountable);
    appliedPromo = promo.code;
  }

  const cleaningCents = toCents(rules.cleaningFee);
  const taxableCents =
    accommodationCents - losDiscountCents - promoDiscountCents + extraGuestCents + cleaningCents;
  const taxCents = pctOf(taxableCents, rules.taxRatePct);
  const totalCents = taxableCents + taxCents;

  return {
    ok: true,
    data: {
      propertyId,
      checkIn,
      checkOut,
      guests,
      nights,
      currency: rules.currency,
      nightly,
      accommodationSubtotal: fromCents(accommodationCents),
      seasonalAdjustment: fromCents(seasonalAdjustmentCents),
      extraGuestFee: fromCents(extraGuestCents),
      lengthOfStayDiscount: fromCents(losDiscountCents),
      promoDiscount: fromCents(promoDiscountCents),
      promoCode: appliedPromo,
      cleaningFee: fromCents(cleaningCents),
      taxableSubtotal: fromCents(taxableCents),
      taxes: fromCents(taxCents),
      total: fromCents(totalCents),
      averageNightlyRate: fromCents(Math.round(accommodationCents / nights)),
    },
  };
}

/** Rate calendar for the UI — nightly rates without fees or taxes. */
export function getRateCalendar(
  propertyId: PropertyId,
  from: IsoDate,
  to: IsoDate
): PriceLine[] {
  const rules = getPropertyConfig(propertyId).pricing;
  const start = from < today() ? today() : from;
  return stayNights(start, to).map((date) => {
    const season = seasonFor(date, rules);
    const weekend = isWeekendNight(date);
    let cents = toCents(rules.baseNightlyRate);
    if (season) cents = Math.round(cents * season.multiplier);
    if (weekend) cents = Math.round(cents * rules.weekendMultiplier);
    return { date, rate: fromCents(cents), season: season?.name ?? null, isWeekend: weekend };
  });
}
