"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  X,
  Send,
  CalendarCheck,
  Tag,
  RefreshCw,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  escalated?: boolean;
}

const suggestions = [
  {
    icon: CalendarCheck,
    label: "Check availability",
    prompt: "Is HH Villa free for 6 guests over the first weekend of next month?",
  },
  {
    icon: Tag,
    label: "Quote a stay",
    prompt: "What would 5 nights at Giant House cost for 8 guests starting the 12th?",
  },
  {
    icon: RefreshCw,
    label: "Reconcile calendars",
    prompt: "Sync the channel calendars for Safari House and tell me what changed.",
  },
  {
    icon: AlertTriangle,
    label: "Find conflicts",
    prompt: "Are there any double bookings across the portfolio right now?",
  },
];

/** One streamed event from /api/assistant. */
type AssistantEvent =
  | { type: "text"; text: string }
  | { type: "tool_start"; name: string }
  | { type: "tool_end"; name: string; ok: boolean }
  | { type: "escalation"; reason: string; urgency: string }
  | { type: "done"; stopReason: string | null }
  | { type: "error"; message: string };

const TOOL_LABELS: Record<string, string> = {
  get_availability: "Checking the calendar",
  get_pricing: "Pricing the stay",
  get_property: "Reading property details",
  get_bookings: "Looking up reservations",
  create_reservation: "Holding the dates",
  sync_calendars: "Syncing channel calendars",
  check_conflicts: "Scanning for conflicts",
  send_whatsapp: "Notifying the owner",
  escalate_to_human: "Handing over to the team",
};

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "ai",
  content:
    "Hi Ally, I'm North Star AI. Ask me about availability, pricing, reservations or calendar conflicts — I check the live booking system before answering.",
};

export function AIAssistant() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [activeTool, setActiveTool] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<ChatMessage[]>([WELCOME]);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, activeTool]);

  React.useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const replyId = crypto.randomUUID();

    // Snapshot the history sent to the server: the welcome line is UI copy,
    // not part of the conversation the model should answer against.
    const history = [...messages, userMessage]
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role === "ai" ? ("assistant" as const) : ("user" as const), content: m.content }));

    setMessages((m) => [...m, userMessage, { id: replyId, role: "ai", content: "" }]);
    setInput("");
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    const appendToReply = (chunk: string, escalated?: boolean) =>
      setMessages((m) =>
        m.map((message) =>
          message.id === replyId
            ? {
                ...message,
                content: message.content + chunk,
                escalated: escalated ?? message.escalated,
              }
            : message
        )
      );

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const detail = await response.json().catch(() => null);
        appendToReply(
          detail?.message ??
            "I can't reach the booking system right now. A team member will follow up."
        );
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          let event: AssistantEvent;
          try {
            event = JSON.parse(line) as AssistantEvent;
          } catch {
            continue;
          }

          switch (event.type) {
            case "text":
              appendToReply(event.text);
              break;
            case "tool_start":
              setActiveTool(TOOL_LABELS[event.name] ?? "Checking the booking system");
              break;
            case "tool_end":
              setActiveTool(null);
              break;
            case "escalation":
              appendToReply("", true);
              break;
            case "error":
              appendToReply(
                "\n\nI hit a problem reaching the booking system. The team has been notified."
              );
              break;
          }
        }
      }
    } catch (error) {
      if ((error as Error).name !== "AbortError") {
        appendToReply("\n\nThe connection dropped before I finished. Please try again.");
      }
    } finally {
      setActiveTool(null);
      setBusy(false);
      abortRef.current = null;
    }
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.94 }}
        className="gold-gradient fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-xl"
        animate={{ boxShadow: ["0 0 0 0 rgba(212,175,55,0.4)", "0 0 0 14px rgba(212,175,55,0)"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        aria-label="Open North Star AI"
      >
        <Sparkles className="size-6 text-navy" />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="glass fixed bottom-24 right-6 z-40 flex h-[32rem] w-[23rem] flex-col overflow-hidden rounded-2xl shadow-2xl"
          >
            <div className="navy-gradient flex items-center justify-between px-4 py-3 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-gold" />
                <span className="text-sm font-semibold">North Star AI</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-full p-1 hover:bg-white/10"
                aria-label="Close assistant"
              >
                <X className="size-4" />
              </button>
            </div>

            <ScrollArea className="flex-1 px-4 py-3" viewportRef={scrollRef}>
              <div className="flex flex-col gap-3">
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed",
                      m.role === "ai"
                        ? "self-start bg-secondary"
                        : "gold-gradient self-end text-navy",
                      m.escalated && "border border-amber-500/60"
                    )}
                  >
                    {m.content || (m.role === "ai" && busy ? "…" : "")}
                    {m.escalated && (
                      <span className="mt-1.5 flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="size-3" />
                        Handed to the team
                      </span>
                    )}
                  </motion.div>
                ))}

                {activeTool && (
                  <div className="flex items-center gap-2 self-start text-xs text-muted-foreground">
                    <Loader2 className="size-3 animate-spin" />
                    {activeTool}…
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => send(s.prompt)}
                  disabled={busy}
                  className="flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-xs transition-colors hover:bg-secondary/70 disabled:opacity-50"
                >
                  <s.icon className="size-3.5 text-gold" />
                  {s.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-border/60 p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask North Star AI…"
                disabled={busy}
                className="flex-1 rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:opacity-60"
              />
              <Button
                type="submit"
                size="icon"
                variant="gold"
                className="rounded-xl"
                disabled={busy}
                aria-label="Send message"
              >
                {busy ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
