"use client";

import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Gauge, CalendarClock, Moon, LineChart as LineIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/dashboard/animated-counter";
import { occupancyTrend, properties } from "@/lib/mock-data";

const avg = (key: keyof typeof properties["hh-villa"]) =>
  ((properties["hh-villa"][key] as number) + (properties["giant-house"][key] as number)) / 2;

const metrics = [
  { icon: Gauge, label: "Occupancy Rate", value: avg("occupancy"), suffix: "%" },
  { icon: LineIcon, label: "Average Daily Rate", value: avg("adr"), prefix: "$" },
  { icon: LineIcon, label: "RevPAR", value: avg("revpar"), prefix: "$" },
  { icon: CalendarClock, label: "Booking Lead Time", value: avg("leadTime"), suffix: " days" },
  { icon: Moon, label: "Avg. Length of Stay", value: avg("lengthOfStay"), suffix: " nights", decimals: 1 },
];

export function OccupancyAnalytics() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Occupancy Analytics</CardTitle>
        <CardDescription>Occupancy, ADR, RevPAR, lead time and length of stay.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ y: -3 }}
              className="rounded-2xl border border-border/60 p-3"
            >
              <m.icon className="mb-2 size-4 text-gold" />
              <div className="text-lg font-semibold">
                <AnimatedCounter value={m.value} prefix={m.prefix} suffix={m.suffix} decimals={m.decimals} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{m.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={occupancyTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} width={40} unit="%" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
              <Legend />
              <Line
                type="monotone"
                dataKey="HH Villa"
                stroke="#D4AF37"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                animationDuration={1000}
              />
              <Line
                type="monotone"
                dataKey="Giant House"
                stroke="#38BDF8"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
