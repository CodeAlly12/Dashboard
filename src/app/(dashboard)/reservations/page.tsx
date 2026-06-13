"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { VariantProps } from "class-variance-authority";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  properties,
  reservations,
  reservationStatusColor,
  type ReservationStatus,
} from "@/lib/mock-data";

const statuses: (ReservationStatus | "All")[] = [
  "All",
  "New Booking",
  "Check-in Today",
  "Check-out Today",
  "Pending Payment",
  "Cancelled",
];

export default function ReservationsPage() {
  const [filter, setFilter] = React.useState<ReservationStatus | "All">("All");

  const filtered = reservations.filter((r) => filter === "All" || r.status === filter);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Reservations"
        description="All bookings across HH Villa and Giant House."
        actions={
          <Button variant="gold" size="sm">
            <Plus className="size-4" /> New Reservation
          </Button>
        }
      />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as ReservationStatus | "All")}>
        <TabsList className="flex-wrap h-auto">
          {statuses.map((s) => (
            <TabsTrigger key={s} value={s}>
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="flex flex-col gap-2">
          {filtered.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ scale: 1.005 }}
              className="grid grid-cols-2 gap-3 rounded-xl border border-border/50 p-3 transition-colors hover:bg-secondary/50 sm:grid-cols-6 sm:items-center"
            >
              <div className="flex items-center gap-3 sm:col-span-2">
                <Avatar>
                  <AvatarFallback className="gold-gradient text-navy font-semibold">{r.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{r.guest}</p>
                  <p className="text-xs text-muted-foreground">{r.id}</p>
                </div>
              </div>
              <div className="text-sm">{properties[r.property].name}</div>
              <div className="text-sm text-muted-foreground">{r.channel}</div>
              <div className="text-sm">
                {format(new Date(r.checkIn), "MMM d")} – {format(new Date(r.checkOut), "MMM d")}
              </div>
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <Badge
                  variant={reservationStatusColor[r.status] as VariantProps<typeof badgeVariants>["variant"]}
                >
                  {r.status}
                </Badge>
                <span className="text-sm font-semibold">${r.total.toLocaleString()}</span>
              </div>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No reservations match this filter.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
