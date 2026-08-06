// Streaming endpoint for the North Star AI assistant panel.
//
// Emits newline-delimited JSON so the client can render text as it arrives and
// show tool progress. Access is gated by Clerk in src/proxy.ts.

import type Anthropic from "@anthropic-ai/sdk";

import { isAssistantConfigured, runAssistantTurn } from "@/lib/ai/orchestrator";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Tool loops can take longer than the default serverless budget. */
export const maxDuration = 60;

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

interface AssistantRequestBody {
  messages?: IncomingMessage[];
  propertyId?: string;
  channel?: string;
}

const MAX_HISTORY = 40;
const MAX_MESSAGE_CHARS = 8000;

function parseMessages(raw: unknown): Anthropic.MessageParam[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  const messages = raw.slice(-MAX_HISTORY).flatMap((entry): Anthropic.MessageParam[] => {
    if (!entry || typeof entry !== "object") return [];
    const { role, content } = entry as IncomingMessage;
    if (role !== "user" && role !== "assistant") return [];
    if (typeof content !== "string" || content.trim().length === 0) return [];
    return [{ role, content: content.slice(0, MAX_MESSAGE_CHARS) }];
  });

  // The API requires the exchange to open on a user turn.
  while (messages.length > 0 && messages[0].role !== "user") messages.shift();
  return messages.length > 0 ? messages : null;
}

export async function POST(request: Request) {
  if (!isAssistantConfigured()) {
    return Response.json(
      {
        error: "assistant_not_configured",
        message: "Set ANTHROPIC_API_KEY to enable the booking assistant.",
      },
      { status: 503 }
    );
  }

  let body: AssistantRequestBody;
  try {
    body = (await request.json()) as AssistantRequestBody;
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const messages = parseMessages(body.messages);
  if (!messages) {
    return Response.json(
      { error: "invalid_messages", message: "Provide at least one user message." },
      { status: 400 }
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of runAssistantTurn({
          messages,
          propertyId: body.propertyId,
          channel: body.channel,
        })) {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        }
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            `${JSON.stringify({
              type: "error",
              message: error instanceof Error ? error.message : "stream failed",
            })}\n`
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
    },
  });
}
