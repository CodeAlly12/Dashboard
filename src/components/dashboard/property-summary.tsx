"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BedDouble, CalendarCheck, DoorOpen, Wallet } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnimatedCounter } from "@/components/dashboard/animated-counter";
import { properties } from "@/lib/mock-data";

export function PropertySummary() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Object.values(properties).map((property, i) => (
        <motion.div
          key={property.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <Card className="overflow-hidden p-0">
            <div className="relative h-36 w-full">
              <Image src={property.image} alt={property.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white">
                <h3 className="text-lg font-semibold">{property.name}</h3>
                <p className="text-xs text-white/70">{property.location}</p>
              </div>
              <Badge variant="gold" className="absolute right-3 top-3">
                {property.channels.length} channels
              </Badge>
            </div>
            <CardContent className="grid grid-cols-2 gap-4 pt-5">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarCheck className="size-3.5" /> Occupancy
                </div>
                <div className="mt-1 text-xl font-semibold">
                  <AnimatedCounter value={property.occupancy} suffix="%" />
                </div>
                <Progress value={property.occupancy} className="mt-2" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Wallet className="size-3.5" /> Revenue (MTD)
                </div>
                <div className="mt-1 text-xl font-semibold">
                  <AnimatedCounter value={property.revenue} prefix="$" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <DoorOpen className="size-3.5" /> Upcoming Arrivals
                </div>
                <div className="mt-1 text-xl font-semibold">
                  <AnimatedCounter value={property.upcomingArrivals} />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BedDouble className="size-3.5" /> Available Rooms
                </div>
                <div className="mt-1 text-xl font-semibold">
                  <AnimatedCounter value={property.availableRooms} /> / {property.rooms}
                </div>
              </div>
            </CardContent>
            <div className="border-t border-border/60 px-6 py-3">
              <Link
                href={`/properties/${property.id}`}
                className="flex items-center gap-1 text-sm font-medium text-gold transition-transform hover:translate-x-1"
              >
                View property <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
