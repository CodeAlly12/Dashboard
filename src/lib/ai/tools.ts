// Tool contracts exposed to the model, and the executor that runs them.
//
// Each tool is a thin, strict wrapper over a deterministic engine. Any engine
// that returns an escalation is escalated here — the owner is notified even if
// the model does not think to call `escalate_to_human` itself.

import type Anthropic from "@anthropic-ai/sdk";

import { findConflicts, getAvailability, getBookings } from "@/lib/booking/calendar";
import { syncCalendars } from "@/lib/booking/ical";
import { escalate, sendWhatsApp } from "@/lib/booking/notifications";
import { getPricing } from "@/lib/booking/pricing";
import { getPropertyConfig, isPropertyId, resolvePropertyId } from "@/lib/booking/properties";
import { createReservation } from "@/lib/booking/reservations";
import type { EscalationPayload, PropertyId, Urgency } from "@/lib/booking/types";
import { GUEST_ESCALATION_MESSAGE } from "@/lib/booking/types";

const propertyIdSchema = {
  type: "string" as const,
  description:
    "Property identifier, e.g. hh-villa, giant-house, safari-house. Use get_property or the property list in your instructions; never invent one.",
};

const dateSchema = {
  type: "string" as const,
  description: "Calendar date as YYYY-MM-DD.",
};

export const TOOLS: Anthropic.Tool[] = [
  {
    name: "get_availability",
    description:
      "Authoritative availability check for one property and one date range. Returns whether the stay can be sold, a per-night breakdown, and the reasons for any rejection (overlapping reservation, owner block, minimum stay, capacity). Call this before quoting a price or discussing a booking. Returns an escalation instead of an answer when the calendar cannot be verified.",
    input_schema: {
      type: "object",
      properties: {
        property_id: propertyIdSchema,
        check_in: { ...dateSchema, description: "Arrival date, YYYY-MM-DD." },
        check_out: {
          ...dateSchema,
          description: "Departure date, YYYY-MM-DD. The departure night is not charged.",
        },
        guests: { type: "number", description: "Total number of guests, including children." },
      },
      required: ["property_id", "check_in", "check_out", "guests"],
    },
  },
  {
    name: "get_pricing",
    description:
      "Authoritative price for a stay. Returns nightly rates with seasonal and weekend adjustments, cleaning fee, extra-guest fees, length-of-stay and promo discounts, taxes and the total. This is the only source of prices — quote its numbers exactly and never compute your own. Unregistered promo codes return an escalation.",
    input_schema: {
      type: "object",
      properties: {
        property_id: propertyIdSchema,
        check_in: dateSchema,
        check_out: dateSchema,
        guests: { type: "number", description: "Total number of guests." },
        promo_code: {
          type: "string",
          description: "Optional promotion code exactly as the guest gave it.",
        },
      },
      required: ["property_id", "check_in", "check_out", "guests"],
    },
  },
  {
    name: "get_property",
    description:
      "Property facts: capacity, bedrooms, amenities, check-in and check-out times and rules, house rules, minimum stay, cleaning fee and base rate. Call this instead of recalling details; anything absent from the result is unknown and must be escalated rather than described.",
    input_schema: {
      type: "object",
      properties: {
        property: {
          type: "string",
          description: "Property id or the name the guest used, e.g. 'Fig Tree House'.",
        },
      },
      required: ["property"],
    },
  },
  {
    name: "get_bookings",
    description:
      "Current reservations, optionally filtered by property and date window. Use for operational questions (who is arriving, is a stay on file) — not for deciding availability, which is get_availability's job.",
    input_schema: {
      type: "object",
      properties: {
        property_id: propertyIdSchema,
        from: { ...dateSchema, description: "Window start. Defaults to today." },
        to: { ...dateSchema, description: "Window end. Defaults to 90 days out." },
      },
      required: [],
    },
  },
  {
    name: "create_reservation",
    description:
      "Creates a PROVISIONAL hold after re-verifying availability and pricing. Never produces a confirmed booking — tell the guest the dates are held and a team member will confirm. Requires the guest's name and at least one contact method.",
    input_schema: {
      type: "object",
      properties: {
        property_id: propertyIdSchema,
        check_in: dateSchema,
        check_out: dateSchema,
        guests: { type: "number" },
        guest_name: { type: "string", description: "Full name as the guest gave it." },
        guest_email: { type: "string" },
        guest_phone: { type: "string", description: "Phone in international format." },
        promo_code: { type: "string" },
      },
      required: ["property_id", "check_in", "check_out", "guests", "guest_name"],
    },
  },
  {
    name: "sync_calendars",
    description:
      "Pulls every channel calendar for a property and reports the differences against local state: new bookings, cancellations, modifications, conflicts, or no change. Set apply=false to inspect the diff without writing anything. Use when a guest or the owner suspects the calendar is out of date.",
    input_schema: {
      type: "object",
      properties: {
        property_id: propertyIdSchema,
        apply: {
          type: "boolean",
          description: "Write the resolved changes to local state. Defaults to false.",
        },
      },
      required: ["property_id"],
    },
  },
  {
    name: "check_conflicts",
    description:
      "Scans reservations for double bookings — two active stays sharing a night on the same property. Returns the reservation pairs and the overlapping dates. Report conflicts and escalate; never choose which booking survives.",
    input_schema: {
      type: "object",
      properties: { property_id: propertyIdSchema },
      required: [],
    },
  },
  {
    name: "send_whatsapp",
    description:
      "Sends an operational notification to the owner on WhatsApp: new booking, cancellation, date change, payment received, conflict, calendar or API failure. For handing a guest question to a human, use escalate_to_human instead — it carries the full context.",
    input_schema: {
      type: "object",
      properties: {
        message: { type: "string", description: "The notification text. No guest PII beyond name." },
        priority: { type: "string", enum: ["low", "normal", "high", "critical"] },
      },
      required: ["message"],
    },
  },
  {
    name: "escalate_to_human",
    description:
      "Hands the conversation to a human and notifies the owner with the guest, question, property, dates, phone and a conversation summary. Call this whenever you cannot verify an answer, or for exceptions, discounts, corporate rates, long-term stays, complaints, refunds, legal questions, damage claims, or anything needing owner approval. Then tell the guest only the holding line this tool returns.",
    input_schema: {
      type: "object",
      properties: {
        reason: {
          type: "string",
          enum: [
            "pricing_unavailable",
            "calendar_unavailable",
            "api_timeout",
            "booking_conflict",
            "unknown_property",
            "invalid_dates",
            "missing_occupancy",
            "guest_exception_request",
            "special_discount",
            "corporate_rate",
            "long_term_rental",
            "complaint",
            "refund_request",
            "legal_question",
            "damage_claim",
            "owner_approval_required",
            "payment_issue",
          ],
        },
        urgency: { type: "string", enum: ["low", "normal", "high", "critical"] },
        property_id: propertyIdSchema,
        guest_name: { type: "string" },
        guest_phone: { type: "string" },
        question: { type: "string", description: "What the guest actually asked." },
        check_in: dateSchema,
        check_out: dateSchema,
        conversation_summary: {
          type: "string",
          description: "Two or three sentences a colleague can act on without reading the thread.",
        },
      },
      required: ["reason", "urgency", "question"],
    },
  },
];

export interface ToolOutcome {
  /** JSON payload handed back to the model as the tool result. */
  result: unknown;
  isError?: boolean;
  /** Set when this call escalated, so the transport can surface it in the UI. */
  escalation?: { reason: string; urgency: Urgency };
}

type Args = Record<string, unknown>;

const str = (args: Args, key: string): string | undefined =>
  typeof args[key] === "string" ? (args[key] as string) : undefined;
const num = (args: Args, key: string): number =>
  typeof args[key] === "number" ? (args[key] as number) : NaN;

async function raiseEscalation(payload: EscalationPayload): Promise<ToolOutcome> {
  const outcome = await escalate(payload);
  return {
    result: {
      escalated: true,
      say_to_guest: outcome.guestMessage,
      reason: outcome.reason,
      owner_notified: outcome.ownerNotified,
    },
    escalation: { reason: outcome.reason, urgency: outcome.urgency },
  };
}

export async function executeTool(name: string, args: Args): Promise<ToolOutcome> {
  switch (name) {
    case "get_availability": {
      const result = await getAvailability({
        propertyId: str(args, "property_id") ?? "",
        checkIn: str(args, "check_in") ?? "",
        checkOut: str(args, "check_out") ?? "",
        guests: num(args, "guests"),
      });
      if (!result.ok) return raiseEscalation(result.escalation);

      const { available, nights, reasons, calendar } = result.data;
      return {
        result: {
          available,
          nights,
          reasons,
          last_calendar_sync: calendar.lastSyncedAt,
          nights_detail: result.data.days,
        },
      };
    }

    case "get_pricing": {
      const result = getPricing({
        propertyId: str(args, "property_id") ?? "",
        checkIn: str(args, "check_in") ?? "",
        checkOut: str(args, "check_out") ?? "",
        guests: num(args, "guests"),
        promoCode: str(args, "promo_code") ?? null,
      });
      if (!result.ok) return raiseEscalation(result.escalation);
      return { result: result.data };
    }

    case "get_property": {
      const raw = str(args, "property") ?? "";
      const id = isPropertyId(raw) ? raw : resolvePropertyId(raw);
      if (!id) {
        return raiseEscalation({
          reason: "unknown_property",
          urgency: "normal",
          detail: `Could not resolve "${raw}" to exactly one managed property.`,
        });
      }
      const config = getPropertyConfig(id);
      return {
        result: {
          id: config.id,
          name: config.name,
          location: config.location,
          capacity: config.capacity,
          bedrooms: config.bedrooms,
          amenities: config.amenities,
          check_in_from: config.checkInFrom,
          check_out_by: config.checkOutBy,
          check_in_rules: config.checkInRules,
          check_out_rules: config.checkOutRules,
          house_rules: config.houseRules,
          minimum_stay_nights: config.pricing.minimumStayNights,
          cleaning_fee: config.pricing.cleaningFee,
          base_nightly_rate: config.pricing.baseNightlyRate,
          currency: config.pricing.currency,
        },
      };
    }

    case "get_bookings": {
      const result = await getBookings({
        propertyId: str(args, "property_id"),
        from: str(args, "from"),
        to: str(args, "to"),
      });
      if (!result.ok) return raiseEscalation(result.escalation);
      return {
        result: {
          count: result.data.length,
          reservations: result.data.map((r) => ({
            property_id: r.propertyId,
            guest_name: r.guestName,
            check_in: r.checkIn,
            check_out: r.checkOut,
            guests: r.guests,
            status: r.status,
            channel: r.channel,
          })),
        },
      };
    }

    case "create_reservation": {
      const result = await createReservation({
        propertyId: str(args, "property_id") ?? "",
        checkIn: str(args, "check_in") ?? "",
        checkOut: str(args, "check_out") ?? "",
        guests: num(args, "guests"),
        guestName: str(args, "guest_name") ?? "",
        guestEmail: str(args, "guest_email"),
        guestPhone: str(args, "guest_phone"),
        promoCode: str(args, "promo_code") ?? null,
      });
      if (!result.ok) return raiseEscalation(result.escalation);
      return {
        result: {
          status: result.data.status,
          hold_expires_at: result.data.holdExpiresAt,
          total: result.data.total,
          currency: result.data.currency,
          next_step: result.data.nextStep,
        },
      };
    }

    case "sync_calendars": {
      const propertyId = str(args, "property_id") ?? "";
      if (!isPropertyId(propertyId)) {
        return raiseEscalation({
          reason: "unknown_property",
          urgency: "normal",
          detail: `sync_calendars called with unknown property "${propertyId}".`,
        });
      }
      const result = await syncCalendars(propertyId as PropertyId, {
        apply: args.apply === true,
      });
      if (!result.ok) return raiseEscalation(result.escalation);

      const conflicts = result.data.changes.filter((c) => c.type === "conflict");
      if (conflicts.length > 0) {
        await escalate({
          reason: "booking_conflict",
          urgency: "critical",
          propertyId: propertyId as PropertyId,
          detail: conflicts.map((c) => c.detail).join(" | "),
        });
      }
      return {
        result: {
          synced_at: result.data.syncedAt,
          changes: result.data.changes.map((c) => ({ type: c.type, detail: c.detail })),
          failed_channels: result.data.failedChannels,
        },
        escalation:
          conflicts.length > 0 ? { reason: "booking_conflict", urgency: "critical" } : undefined,
      };
    }

    case "check_conflicts": {
      const propertyId = str(args, "property_id");
      if (propertyId && !isPropertyId(propertyId)) {
        return raiseEscalation({
          reason: "unknown_property",
          urgency: "normal",
          detail: `check_conflicts called with unknown property "${propertyId}".`,
        });
      }
      const result = await findConflicts(propertyId as PropertyId | undefined);
      if (!result.ok) return raiseEscalation(result.escalation);
      if (result.data.length > 0) {
        await escalate({
          reason: "booking_conflict",
          urgency: "critical",
          propertyId: propertyId as PropertyId | undefined,
          detail: result.data.map((c) => c.detail).join(" | "),
        });
      }
      return {
        result: {
          conflict_count: result.data.length,
          conflicts: result.data.map((c) => ({
            property_id: c.propertyId,
            dates: `${c.overlapStart} → ${c.overlapEnd}`,
            detail: c.detail,
          })),
        },
        escalation:
          result.data.length > 0
            ? { reason: "booking_conflict", urgency: "critical" }
            : undefined,
      };
    }

    case "send_whatsapp": {
      const message = str(args, "message");
      if (!message) return { result: { error: "message is required" }, isError: true };
      const priority = (str(args, "priority") as Urgency) ?? "normal";
      const result = await sendWhatsApp(message, priority);
      if (!result.ok) return raiseEscalation(result.escalation);
      return {
        result: { delivered: result.data.delivered, note: result.data.queuedReason ?? null },
      };
    }

    case "escalate_to_human":
      return raiseEscalation({
        reason: (str(args, "reason") ?? "owner_approval_required") as EscalationPayload["reason"],
        urgency: (str(args, "urgency") ?? "normal") as Urgency,
        propertyId: (str(args, "property_id") as PropertyId | undefined) ?? undefined,
        guestName: str(args, "guest_name"),
        guestPhone: str(args, "guest_phone"),
        question: str(args, "question"),
        checkIn: str(args, "check_in"),
        checkOut: str(args, "check_out"),
        conversationSummary: str(args, "conversation_summary"),
      });

    default:
      return {
        result: { error: `Unknown tool "${name}". Say: ${GUEST_ESCALATION_MESSAGE}` },
        isError: true,
      };
  }
}
