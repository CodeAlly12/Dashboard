// Booking orchestrator.
//
// Claude handles language and decisions; every fact comes from a tool. This is
// a manual streaming loop rather than the SDK tool runner so tool results can
// be surfaced to the UI as they land and escalations can be reported mid-turn.

import Anthropic from "@anthropic-ai/sdk";

import { today } from "@/lib/booking/dates";
import { escalate } from "@/lib/booking/notifications";
import { GUEST_ESCALATION_MESSAGE, type Urgency } from "@/lib/booking/types";

import { SYSTEM_PROMPT, runtimeContext } from "./system-prompt";
import { TOOLS, executeTool } from "./tools";

export const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5";

/**
 * Effort trades intelligence against latency. `medium` keeps typical replies
 * inside the ~2s budget; raise it for owner-facing analysis where a slower,
 * more thorough answer is worth it.
 */
const EFFORT = (process.env.BOOKING_AI_EFFORT ?? "medium") as
  | "low"
  | "medium"
  | "high"
  | "xhigh"
  | "max";

const MAX_TURNS = Number(process.env.BOOKING_AI_MAX_TURNS ?? 6);

export type AssistantEvent =
  | { type: "text"; text: string }
  | { type: "tool_start"; name: string }
  | { type: "tool_end"; name: string; ok: boolean }
  | { type: "escalation"; reason: string; urgency: Urgency }
  | { type: "done"; stopReason: string | null }
  | { type: "error"; message: string };

export interface AssistantTurnInput {
  messages: Anthropic.MessageParam[];
  propertyId?: string;
  channel?: string;
}

let client: Anthropic | null = null;

function getClient(): Anthropic {
  // Resolves ANTHROPIC_API_KEY (or an `ant auth login` profile) from the env.
  if (!client) client = new Anthropic();
  return client;
}

export function isAssistantConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

/**
 * Runs one assistant turn to completion, streaming text and tool progress.
 * Never throws — failures arrive as `error` events after the owner has been
 * notified, so the caller only has to render.
 */
export async function* runAssistantTurn(
  input: AssistantTurnInput
): AsyncGenerator<AssistantEvent> {
  const messages: Anthropic.MessageParam[] = [
    ...input.messages,
    // Volatile context lives here, after the cached system prefix, and in the
    // system role so guest text can never spoof it.
    {
      role: "system",
      content: runtimeContext({
        today: today(),
        propertyId: input.propertyId,
        channel: input.channel,
      }),
    } as Anthropic.MessageParam,
  ];

  try {
    for (let turn = 0; turn < MAX_TURNS; turn++) {
      const stream = getClient().messages.stream({
        model: MODEL,
        max_tokens: 16000,
        system: [
          { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
        ],
        thinking: { type: "adaptive" },
        output_config: { effort: EFFORT },
        tools: TOOLS,
        messages,
      });

      for await (const event of stream) {
        if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
          yield { type: "text", text: event.delta.text };
        }
      }

      const message = await stream.finalMessage();
      messages.push({ role: "assistant", content: message.content });

      if (message.stop_reason === "refusal") {
        // A refused turn is a handover, not an error the guest should see.
        const outcome = await escalate({
          reason: "owner_approval_required",
          urgency: "high",
          propertyId: input.propertyId as never,
          detail: "The assistant declined to answer; routing to a human.",
        });
        yield { type: "text", text: outcome.guestMessage };
        yield { type: "escalation", reason: outcome.reason, urgency: outcome.urgency };
        yield { type: "done", stopReason: "refusal" };
        return;
      }

      if (message.stop_reason === "pause_turn") {
        continue;
      }

      const toolUses = message.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );

      if (toolUses.length === 0) {
        yield { type: "done", stopReason: message.stop_reason };
        return;
      }

      for (const call of toolUses) yield { type: "tool_start", name: call.name };

      // Independent lookups run concurrently; all results go back in one turn.
      const outcomes = await Promise.all(
        toolUses.map(async (call) => {
          try {
            return await executeTool(call.name, (call.input ?? {}) as Record<string, unknown>);
          } catch (error) {
            return {
              result: {
                error: error instanceof Error ? error.message : String(error),
                say_to_guest: GUEST_ESCALATION_MESSAGE,
              },
              isError: true,
            };
          }
        })
      );

      const results: Anthropic.ToolResultBlockParam[] = [];
      for (const [index, call] of toolUses.entries()) {
        const outcome = outcomes[index];
        yield { type: "tool_end", name: call.name, ok: !outcome.isError };
        if (outcome.escalation) {
          yield {
            type: "escalation",
            reason: outcome.escalation.reason,
            urgency: outcome.escalation.urgency,
          };
        }
        results.push({
          type: "tool_result",
          tool_use_id: call.id,
          content: JSON.stringify(outcome.result),
          is_error: outcome.isError,
        });
      }

      messages.push({ role: "user", content: results });
    }

    // Turn budget exhausted with tools still pending — hand over rather than
    // letting the loop run indefinitely.
    const outcome = await escalate({
      reason: "api_timeout",
      urgency: "high",
      detail: `Assistant did not settle within ${MAX_TURNS} tool turns.`,
    });
    yield { type: "text", text: outcome.guestMessage };
    yield { type: "escalation", reason: outcome.reason, urgency: outcome.urgency };
    yield { type: "done", stopReason: "max_turns" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await escalate({
      reason: "api_timeout",
      urgency: "critical",
      detail: `Assistant turn failed: ${message}`,
    }).catch(() => undefined);
    yield { type: "error", message };
  }
}
