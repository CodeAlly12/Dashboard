// iCal ingestion and calendar reconciliation.
//
// Channel calendars are eventually consistent. Polling pulls each feed, diffs
// it against local state, and applies the newest write. When two sides
// disagree and timestamps cannot settle it, the change is flagged as a
// conflict for the owner — never auto-resolved.

import { rangesOverlap, today, addDays } from "./dates";
import { detectConflicts } from "./calendar";
import { invalidateProperty } from "./cache";
import { getPropertyConfig } from "./properties";
import { withResilience } from "./resilience";
import { getBookingStore } from "./store";
import type {
  BookingChannel,
  CalendarChange,
  EngineResult,
  IsoDate,
  PropertyId,
  Reservation,
  SyncResult,
} from "./types";

export interface IcalEvent {
  uid: string;
  /** Arrival date. */
  start: IsoDate;
  /** Departure date — iCal DTEND is already exclusive, matching our nights. */
  end: IsoDate;
  summary: string;
  /** LAST-MODIFIED, falling back to DTSTAMP. Drives newest-wins. */
  updatedAt: string;
  cancelled: boolean;
}

/** Unfolds RFC 5545 continuation lines (CRLF followed by space or tab). */
function unfold(raw: string): string[] {
  return raw.replace(/\r\n/g, "\n").replace(/\n[ \t]/g, "").split("\n");
}

function icalDateToIso(value: string): IsoDate | null {
  const date = value.trim().slice(0, 8);
  if (!/^\d{8}$/.test(date)) return null;
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}

function icalTimestampToIso(value: string): string | null {
  const match = value.trim().match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/);
  if (!match) {
    const dateOnly = icalDateToIso(value);
    return dateOnly ? `${dateOnly}T00:00:00.000Z` : null;
  }
  const [, y, mo, d, h, mi, s] = match;
  return new Date(`${y}-${mo}-${d}T${h}:${mi}:${s}Z`).toISOString();
}

export function parseIcal(raw: string): IcalEvent[] {
  const events: IcalEvent[] = [];
  let current: Partial<IcalEvent> | null = null;

  for (const line of unfold(raw)) {
    if (line.startsWith("BEGIN:VEVENT")) {
      current = {};
      continue;
    }
    if (line.startsWith("END:VEVENT")) {
      if (current?.uid && current.start && current.end) {
        events.push({
          uid: current.uid,
          start: current.start,
          end: current.end,
          summary: current.summary ?? "",
          updatedAt: current.updatedAt ?? new Date(0).toISOString(),
          cancelled: current.cancelled ?? false,
        });
      }
      current = null;
      continue;
    }
    if (!current) continue;

    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const name = line.slice(0, separator).split(";")[0].toUpperCase();
    const value = line.slice(separator + 1);

    switch (name) {
      case "UID":
        current.uid = value.trim();
        break;
      case "DTSTART":
        current.start = icalDateToIso(value) ?? current.start;
        break;
      case "DTEND":
        current.end = icalDateToIso(value) ?? current.end;
        break;
      case "SUMMARY":
        current.summary = value.trim();
        break;
      case "LAST-MODIFIED":
        current.updatedAt = icalTimestampToIso(value) ?? current.updatedAt;
        break;
      case "DTSTAMP":
        if (!current.updatedAt) current.updatedAt = icalTimestampToIso(value) ?? undefined;
        break;
      case "STATUS":
        current.cancelled = value.trim().toUpperCase() === "CANCELLED";
        break;
    }
  }

  return events;
}

/**
 * Diffs one channel's feed against local reservations for the same channel.
 * Reservations from other channels are passed in as `others` so an incoming
 * booking that lands on occupied nights surfaces as a conflict.
 */
export function compareCalendars(params: {
  propertyId: PropertyId;
  channel: BookingChannel;
  local: Reservation[];
  remote: IcalEvent[];
  others?: Reservation[];
}): CalendarChange[] {
  const { propertyId, channel, local, remote, others = [] } = params;
  const changes: CalendarChange[] = [];

  const localByRef = new Map(
    local.filter((r) => r.externalReference).map((r) => [r.externalReference!, r])
  );
  const remoteByUid = new Map(remote.map((event) => [event.uid, event]));

  for (const event of remote) {
    const match = localByRef.get(event.uid);
    const remoteSide = { checkIn: event.start, checkOut: event.end, updatedAt: event.updatedAt };

    if (event.cancelled) {
      if (match && match.status !== "cancelled") {
        changes.push({
          type: "cancellation",
          propertyId,
          channel,
          externalReference: event.uid,
          local: { checkIn: match.checkIn, checkOut: match.checkOut, updatedAt: match.updatedAt },
          remote: remoteSide,
          detail: `${channel} cancelled ${event.start} → ${event.end}.`,
        });
      }
      continue;
    }

    if (!match) {
      const clashes = others.filter((r) =>
        rangesOverlap(event.start, event.end, r.checkIn, r.checkOut)
      );
      changes.push({
        type: clashes.length > 0 ? "conflict" : "new_booking",
        propertyId,
        channel,
        externalReference: event.uid,
        remote: remoteSide,
        conflictsWith: clashes.length > 0 ? clashes.map((r) => r.id) : undefined,
        detail:
          clashes.length > 0
            ? `Incoming ${channel} booking ${event.start} → ${event.end} overlaps ${clashes.length} existing reservation(s).`
            : `New ${channel} booking ${event.start} → ${event.end}.`,
      });
      continue;
    }

    if (match.checkIn === event.start && match.checkOut === event.end) continue;

    const localTime = Date.parse(match.updatedAt);
    const remoteTime = Date.parse(event.updatedAt);
    const localSide = {
      checkIn: match.checkIn,
      checkOut: match.checkOut,
      updatedAt: match.updatedAt,
    };

    // Newest timestamp wins. Equal or unparseable timestamps cannot settle it.
    if (!Number.isFinite(localTime) || !Number.isFinite(remoteTime) || localTime === remoteTime) {
      changes.push({
        type: "conflict",
        propertyId,
        channel,
        externalReference: event.uid,
        local: localSide,
        remote: remoteSide,
        detail: `${channel} and local records disagree on dates and timestamps cannot resolve which is newer.`,
      });
      continue;
    }

    if (remoteTime > localTime) {
      changes.push({
        type: "modification",
        propertyId,
        channel,
        externalReference: event.uid,
        local: localSide,
        remote: remoteSide,
        detail: `${channel} moved the stay to ${event.start} → ${event.end}.`,
      });
    }
  }

  for (const reservation of local) {
    const ref = reservation.externalReference;
    if (!ref || remoteByUid.has(ref)) continue;
    if (reservation.status === "cancelled") continue;
    changes.push({
      type: "cancellation",
      propertyId,
      channel,
      externalReference: ref,
      local: {
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        updatedAt: reservation.updatedAt,
      },
      detail: `${channel} no longer lists ${reservation.checkIn} → ${reservation.checkOut}.`,
    });
  }

  if (changes.length === 0) {
    changes.push({
      type: "no_change",
      propertyId,
      channel,
      externalReference: "",
      detail: `${channel} calendar matches local state.`,
    });
  }

  return changes;
}

async function fetchIcal(url: string, timeoutMs: number): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      cache: "no-store",
      headers: { Accept: "text/calendar" },
    });
    if (!response.ok) throw new Error(`feed returned ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Pulls every configured feed for a property, applies the resulting changes to
 * local state, and reports what moved. Intended to run on a 2-minute cycle.
 */
export async function syncCalendars(
  propertyId: PropertyId,
  options: { apply?: boolean; timeoutMs?: number } = {}
): Promise<EngineResult<SyncResult>> {
  const apply = options.apply ?? true;
  const timeoutMs = options.timeoutMs ?? 10_000;
  const store = getBookingStore();
  const syncedAt = new Date().toISOString();

  return withResilience(
    async () => {
      const sources = (await store.listCalendarSources(propertyId)).filter((s) => s.icalUrl);
      const horizonStart = today();
      const horizonEnd = addDays(horizonStart, 365);
      const reservations = await store.listReservations({
        propertyId,
        from: horizonStart,
        to: horizonEnd,
      });

      const changes: CalendarChange[] = [];
      const failedChannels: { channel: BookingChannel; error: string }[] = [];

      for (const source of sources) {
        try {
          const remote = parseIcal(await fetchIcal(source.icalUrl, timeoutMs));
          const channelChanges = compareCalendars({
            propertyId,
            channel: source.channel,
            local: reservations.filter((r) => r.channel === source.channel),
            remote,
            others: reservations.filter((r) => r.channel !== source.channel),
          });
          changes.push(...channelChanges);

          if (apply) await applyChanges(channelChanges, propertyId, source.channel);
          await store.recordSync(source.id, { syncedAt });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          failedChannels.push({ channel: source.channel, error: message });
          await store.recordSync(source.id, { syncedAt, error: message });
        }
      }

      invalidateProperty(propertyId);

      // A cross-channel double booking can exist even when every feed parsed.
      const conflicts = detectConflicts(
        await store.listReservations({ propertyId, from: horizonStart, to: horizonEnd })
      );
      for (const conflict of conflicts) {
        changes.push({
          type: "conflict",
          propertyId,
          channel: "direct_website",
          externalReference: conflict.reservationIds.join("|"),
          conflictsWith: conflict.reservationIds,
          detail: conflict.detail,
        });
      }

      return { propertyId, syncedAt, changes, failedChannels };
    },
    (error) => ({
      reason: "calendar_unavailable",
      urgency: "critical",
      propertyId,
      detail: `Calendar sync failed for ${getPropertyConfig(propertyId).name}: ${error.message}`,
    }),
    { timeoutMs: timeoutMs * 2, retries: 1 }
  );
}

async function applyChanges(
  changes: CalendarChange[],
  propertyId: PropertyId,
  channel: BookingChannel
) {
  const store = getBookingStore();

  for (const change of changes) {
    // Conflicts are owner decisions; applying either side could destroy a real
    // booking, so local state is left untouched and the change is reported.
    if (change.type === "conflict" || change.type === "no_change") continue;

    const existing = (
      await store.listReservations({
        propertyId,
        statuses: ["provisional", "confirmed", "checked_in", "checked_out"],
      })
    ).find((r) => r.externalReference === change.externalReference);

    if (change.type === "new_booking" && change.remote && !existing) {
      await store.createReservation({
        propertyId,
        channel,
        status: "confirmed",
        checkIn: change.remote.checkIn,
        checkOut: change.remote.checkOut,
        guests: 1,
        guestName: `${channel} guest`,
        totalAmount: 0,
        currency: getPropertyConfig(propertyId).pricing.currency,
        externalReference: change.externalReference,
      });
      continue;
    }

    if (!existing) continue;

    if (change.type === "cancellation") {
      await store.updateReservation(existing.id, { status: "cancelled" });
    } else if (change.type === "modification" && change.remote) {
      await store.updateReservation(existing.id, {
        checkIn: change.remote.checkIn,
        checkOut: change.remote.checkOut,
      });
    }
  }
}
