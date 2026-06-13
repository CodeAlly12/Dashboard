"use client";

import { motion } from "framer-motion";
import { format } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge, type badgeVariants } from "@/components/ui/badge";
import { VariantProps } from "class-variance-authority";
import {
  properties,
  reservations,
  reservationStatusColor,
} from "@/lib/mock-data";

export function ReservationFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reservation Center</CardTitle>
        <CardDescription>Real-time booking activity across both properties.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {reservations.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.01 }}
            className="flex items-center gap-3 rounded-xl border border-border/50 p-3 transition-colors hover:bg-secondary/50"
          >
            <Avatar>
              <AvatarFallback className="gold-gradient text-navy font-semibold">
                {r.avatar}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-medium">{r.guest}</p>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{r.id}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {properties[r.property].name} · {r.channel} ·{" "}
                {format(new Date(r.checkIn), "MMM d")} – {format(new Date(r.checkOut), "MMM d")}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge
                variant={
                  reservationStatusColor[r.status] as VariantProps<typeof badgeVariants>["variant"]
                }
              >
                {r.status}
              </Badge>
              <span className="text-xs font-medium">${r.total.toLocaleString()}</span>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
