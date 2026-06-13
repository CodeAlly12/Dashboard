"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Send, Sparkles } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { messages } from "@/lib/mock-data";

export default function MessagesPage() {
  const [selected, setSelected] = React.useState(messages[0].id);
  const active = messages.find((m) => m.id === selected)!;
  const [reply, setReply] = React.useState("");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Messages" description="Unified inbox for Airbnb, Booking.com, WhatsApp and email." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="flex flex-col gap-2 pt-2">
            {messages.map((m, i) => (
              <motion.button
                key={m.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(m.id)}
                className={cn(
                  "flex items-start gap-3 rounded-xl border border-border/50 p-3 text-left transition-colors hover:bg-secondary/50",
                  selected === m.id && "bg-secondary/70"
                )}
              >
                <Avatar>
                  <AvatarFallback className="gold-gradient text-navy font-semibold">{m.avatar}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{m.guest}</p>
                    {m.unread && <span className="size-2 rounded-full bg-gold" />}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{m.preview}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <Badge variant="outline">{m.channel}</Badge>
                    <span className="text-xs text-muted-foreground">{m.time}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="flex h-full flex-col gap-4 pt-2">
            <div className="flex items-center gap-3 border-b border-border/60 pb-4">
              <Avatar className="size-11">
                <AvatarFallback className="gold-gradient text-navy font-semibold">{active.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{active.guest}</p>
                <Badge variant="outline">{active.channel}</Badge>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="max-w-[80%] self-start rounded-2xl bg-secondary px-4 py-2.5 text-sm">
                {active.preview}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass mt-auto rounded-2xl border border-gold/30 p-4"
            >
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-gold">
                <Sparkles className="size-3.5" /> North Star AI Suggestion
              </div>
              <p className="text-sm text-muted-foreground">{active.aiSuggestion}</p>
              <Button
                variant="gold"
                size="sm"
                className="mt-3"
                onClick={() => setReply(active.aiSuggestion)}
              >
                Use this reply
              </Button>
            </motion.div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setReply("");
              }}
              className="flex items-center gap-2"
            >
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Type a reply…"
                className="flex-1 rounded-xl border border-input bg-transparent px-3.5 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
              />
              <Button type="submit" size="icon" variant="gold" className="rounded-xl">
                <Send className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
