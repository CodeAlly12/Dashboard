"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  addDays,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { VariantProps } from "class-variance-authority";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calendarEntries, properties } from "@/lib/mock-data";

const typeColor: Record<string, VariantProps<typeof badgeVariants>["variant"]> = {
  reservation: "info",
  checkin: "success",
  checkout: "warning",
  blocked: "secondary",
  maintenance: "destructive",
};

const typeLabel: Record<string, string> = {
  reservation: "Booking",
  checkin: "Check-in",
  checkout: "Check-out",
  blocked: "Blocked",
  maintenance: "Maintenance",
};

export default function CalendarPage() {
  const [month, setMonth] = React.useState(new Date(2026, 5, 1));

  const start = startOfWeek(startOfMonth(month));
  const end = endOfWeek(endOfMonth(month));
  const days: Date[] = [];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Calendar"
        description="Reservations, check-ins, check-outs, blocked dates and maintenance."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setMonth((m) => addMonths(m, -1))}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="min-w-32 text-center text-sm font-medium">{format(month, "MMMM yyyy")}</span>
            <Button variant="outline" size="icon" onClick={() => setMonth((m) => addMonths(m, 1))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {Object.entries(typeLabel).map(([key, label]) => (
          <Badge key={key} variant={typeColor[key]}>
            {label}
          </Badge>
        ))}
      </div>

      <Card>
        <CardContent className="p-2 sm:p-4">
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs font-medium text-muted-foreground">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d} className="py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day, i) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const entries = calendarEntries.filter((e) => e.date === dateStr);
              return (
                <motion.div
                  key={dateStr}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.008 }}
                  whileHover={{ scale: 1.02 }}
                  className={`min-h-24 rounded-xl border border-border/50 p-1.5 ${
                    !isSameMonth(day, month) ? "opacity-40" : ""
                  } ${isToday(day) ? "border-gold ring-1 ring-gold" : ""}`}
                >
                  <div className="mb-1 text-right text-xs text-muted-foreground">{format(day, "d")}</div>
                  <div className="flex flex-col gap-1">
                    {entries.map((e, ei) => (
                      <div
                        key={ei}
                        className="truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium text-white"
                        style={{
                          backgroundColor:
                            e.type === "checkin"
                              ? "#34D399"
                              : e.type === "checkout"
                              ? "#F59E0B"
                              : e.type === "blocked"
                              ? "#64748B"
                              : e.type === "maintenance"
                              ? "#EF4444"
                              : "#38BDF8",
                        }}
                        title={`${properties[e.property].name}: ${e.label}`}
                      >
                        {properties[e.property].name.split(" ")[0]} · {e.label}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
