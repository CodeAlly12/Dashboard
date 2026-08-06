// Date helpers for the booking engines.
//
// Every stay boundary is an ISO `YYYY-MM-DD` string. Dates are parsed at UTC
// noon so that no host timezone can shift a night into the previous or next
// day — a class of bug that silently produces double bookings.

import type { IsoDate } from "./types";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function isIsoDate(value: unknown): value is IsoDate {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  // Rejects impossible dates that Date silently rolls over (2026-02-31).
  return toIsoDate(parsed) === value;
}

export function toIsoDate(date: Date): IsoDate {
  return date.toISOString().slice(0, 10);
}

export function parseIsoDate(date: IsoDate): Date {
  return new Date(`${date}T12:00:00Z`);
}

export function addDays(date: IsoDate, days: number): IsoDate {
  const next = parseIsoDate(date);
  next.setUTCDate(next.getUTCDate() + days);
  return toIsoDate(next);
}

export function nightsBetween(checkIn: IsoDate, checkOut: IsoDate): number {
  const ms = parseIsoDate(checkOut).getTime() - parseIsoDate(checkIn).getTime();
  return Math.round(ms / 86_400_000);
}

/** The nights a stay occupies: `[checkIn, checkOut)`. Departure day excluded. */
export function stayNights(checkIn: IsoDate, checkOut: IsoDate): IsoDate[] {
  const nights: IsoDate[] = [];
  for (let d = checkIn; d < checkOut; d = addDays(d, 1)) nights.push(d);
  return nights;
}

/**
 * Half-open interval overlap. A departure on the 10th and an arrival on the
 * 10th do not overlap — the room turns over that morning.
 */
export function rangesOverlap(
  aStart: IsoDate,
  aEnd: IsoDate,
  bStart: IsoDate,
  bEnd: IsoDate
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function weekdayName(date: IsoDate): (typeof WEEKDAYS)[number] {
  return WEEKDAYS[parseIsoDate(date).getUTCDay()];
}

/** Friday and Saturday nights carry the weekend rate. */
export function isWeekendNight(date: IsoDate): boolean {
  const day = parseIsoDate(date).getUTCDay();
  return day === 5 || day === 6;
}

export function today(): IsoDate {
  return toIsoDate(new Date());
}

/**
 * Matches a date against an `MM-DD` window. Windows whose end precedes their
 * start wrap the new year (e.g. high season 12-15 → 01-10).
 */
export function withinSeasonWindow(
  date: IsoDate,
  start: string,
  end: string
): boolean {
  const monthDay = date.slice(5);
  return start <= end
    ? monthDay >= start && monthDay <= end
    : monthDay >= start || monthDay <= end;
}
