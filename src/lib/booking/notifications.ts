// Owner notifications and human handover.
//
// Escalation is the safety valve for the whole system: whenever the assistant
// cannot verify something, the guest gets a holding line and the owner gets
// the full context on WhatsApp. Owner contact details never leave this module.

import { getPropertyConfig, isPropertyId } from "./properties";
import { withResilience } from "./resilience";
import { getBookingStore } from "./store";
import type { EngineResult, EscalationPayload, Urgency } from "./types";
import { GUEST_ESCALATION_MESSAGE } from "./types";

const GRAPH_VERSION = process.env.WHATSAPP_GRAPH_VERSION ?? "v21.0";

export interface WhatsAppResult {
  delivered: boolean;
  /** Set when delivery was skipped because WhatsApp is not configured. */
  queuedReason?: string;
  messageId?: string;
}

function whatsappConfig() {
  const token = process.env.WHATSAPP_BUSINESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const owner = process.env.OWNER_WHATSAPP_NUMBER;
  return token && phoneNumberId && owner ? { token, phoneNumberId, owner } : null;
}

export async function sendWhatsApp(
  message: string,
  priority: Urgency = "normal"
): Promise<EngineResult<WhatsAppResult>> {
  const config = whatsappConfig();

  if (!config) {
    // Not configured is not a failure — the notification is recorded so it can
    // be replayed, and the caller still gets a successful, honest result.
    await getBookingStore().appendAudit({
      action: "whatsapp.skipped",
      actor: "system",
      detail: { priority, message },
    });
    return {
      ok: true,
      data: {
        delivered: false,
        queuedReason: "WhatsApp Business credentials are not configured; notification logged only.",
      },
    };
  }

  const body = priority === "critical" || priority === "high" ? `🚨 ${message}` : message;

  return withResilience(
    async () => {
      const response = await fetch(
        `https://graph.facebook.com/${GRAPH_VERSION}/${config.phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: config.owner,
            type: "text",
            text: { preview_url: false, body },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`WhatsApp API returned ${response.status}`);
      }

      const payload = (await response.json()) as { messages?: { id: string }[] };
      await getBookingStore().appendAudit({
        action: "whatsapp.sent",
        actor: "system",
        detail: { priority, messageId: payload.messages?.[0]?.id },
      });
      return { delivered: true, messageId: payload.messages?.[0]?.id };
    },
    (error) => ({
      reason: "api_timeout",
      urgency: "high",
      detail: `WhatsApp delivery failed: ${error.message}`,
    }),
    { timeoutMs: 5000, retries: 2 }
  );
}

export function formatEscalation(payload: EscalationPayload): string {
  const property =
    payload.propertyId && isPropertyId(payload.propertyId)
      ? getPropertyConfig(payload.propertyId).name
      : "Unspecified";

  const dates =
    payload.checkIn && payload.checkOut ? `${payload.checkIn} → ${payload.checkOut}` : "Not specified";

  return [
    `HH Hospitality AI — handover (${payload.urgency.toUpperCase()})`,
    `Reason: ${payload.reason.replace(/_/g, " ")}`,
    `Property: ${property}`,
    `Dates: ${dates}`,
    `Guest: ${payload.guestName ?? "Not provided"}`,
    `Phone: ${payload.guestPhone ?? "Not provided"}`,
    `Question: ${payload.question ?? "—"}`,
    `Summary: ${payload.conversationSummary ?? "—"}`,
    payload.detail ? `Detail: ${payload.detail}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export interface EscalationOutcome {
  escalated: true;
  guestMessage: string;
  ownerNotified: boolean;
  reason: string;
  urgency: Urgency;
}

/**
 * Records the escalation, notifies the owner, and returns the exact line the
 * assistant should say to the guest. Always resolves — a failed notification
 * downgrades `ownerNotified`, it does not break the conversation.
 */
export async function escalate(payload: EscalationPayload): Promise<EscalationOutcome> {
  const store = getBookingStore();

  await store.recordEscalation(payload).catch(() => {
    /* recording is best-effort; notification below is the real signal */
  });

  const notification = await sendWhatsApp(formatEscalation(payload), payload.urgency);

  await store.appendAudit({
    action: "escalation.raised",
    propertyId: payload.propertyId,
    actor: "assistant",
    detail: { ...payload, ownerNotified: notification.ok && notification.data.delivered },
  });

  return {
    escalated: true,
    guestMessage: GUEST_ESCALATION_MESSAGE,
    ownerNotified: notification.ok && notification.data.delivered,
    reason: payload.reason,
    urgency: payload.urgency,
  };
}

export const OWNER_NOTIFY_EVENTS = [
  "new_booking",
  "cancellation",
  "date_change",
  "payment_received",
  "conflict",
  "calendar_failure",
  "api_failure",
  "urgent_guest_escalation",
] as const;

export type OwnerNotifyEvent = (typeof OWNER_NOTIFY_EVENTS)[number];

export async function notifyOwner(
  event: OwnerNotifyEvent,
  lines: string[],
  priority: Urgency = "normal"
) {
  const message = [`HH Hospitality AI — ${event.replace(/_/g, " ")}`, ...lines].join("\n");
  return sendWhatsApp(message, priority);
}
