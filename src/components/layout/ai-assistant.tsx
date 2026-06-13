"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Send, TrendingUp, CalendarClock, Wand2, Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
}

const suggestions = [
  {
    icon: TrendingUp,
    label: "Forecast revenue",
    prompt: "Forecast next month's revenue for HH Villa and Giant House.",
  },
  {
    icon: CalendarClock,
    label: "Occupancy outlook",
    prompt: "What's the occupancy outlook for the next 30 days?",
  },
  {
    icon: Wand2,
    label: "Pricing tip",
    prompt: "Suggest a pricing adjustment for the upcoming holiday weekend.",
  },
  {
    icon: Wrench,
    label: "Maintenance alerts",
    prompt: "Summarize open maintenance issues by priority.",
  },
];

const aiResponses: Record<string, string> = {
  "Forecast revenue":
    "Based on current pace, HH Villa is trending toward $52K and Giant House toward $39K next month — a combined +9% vs. this month, driven by stronger direct bookings.",
  "Occupancy outlook":
    "Occupancy over the next 30 days is projected at 81% for HH Villa and 71% for Giant House, with a dip mid-week (Tue/Wed). Consider a 10% midweek promo to lift utilization.",
  "Pricing tip":
    "Demand signals suggest raising HH Villa weekend rates by 12% for the upcoming holiday and opening a 2-night minimum stay to maximize RevPAR.",
  "Maintenance alerts":
    "1 critical issue (pool heater at HH Villa, in progress), 2 high priority items awaiting assignment, and 2 scheduled for routine upkeep at Giant House.",
};

export function AIAssistant() {
  const [open, setOpen] = React.useState(false);
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "ai",
      content:
        "Hi Ally, I'm North Star AI — your hospitality concierge. Ask me about revenue forecasts, occupancy, pricing, guest replies, housekeeping or maintenance.",
    },
  ]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text };
    setMessages((m) => [...m, userMsg]);
    setInput("");

    const matched = Object.entries(aiResponses).find(([key]) =>
      text.toLowerCase().includes(key.toLowerCase().split(" ")[0])
    );

    setTimeout(() => {
      const reply: ChatMessage = {
        id: crypto.randomUUID(),
        role: "ai",
        content:
          matched?.[1] ??
          "I've noted that — connect a live data source (Supabase + channel APIs) and I'll generate a tailored recommendation in real time.",
      };
      setMessages((m) => [...m, reply]);
    }, 600);
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileTap={{ scale: 0.94 }}
        className="gold-gradient fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full shadow-xl"
        animate={{ boxShadow: ["0 0 0 0 rgba(212,175,55,0.4)", "0 0 0 14px rgba(212,175,55,0)"] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
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
              <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-white/10">
                <X className="size-4" />
              </button>
            </div>

            <ScrollArea className="flex-1 px-4 py-3">
              <div className="flex flex-col gap-3">
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                      m.role === "ai"
                        ? "self-start bg-secondary"
                        : "gold-gradient self-end text-navy"
                    )}
                  >
                    {m.content}
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            <div className="flex flex-wrap gap-2 px-4 pb-2">
              {suggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => send(s.prompt)}
                  className="flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-xs transition-colors hover:bg-secondary/70"
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
                className="flex-1 rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              />
              <Button type="submit" size="icon" variant="gold" className="rounded-xl">
                <Send className="size-4" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
