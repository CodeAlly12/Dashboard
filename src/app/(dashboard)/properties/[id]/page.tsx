import Image from "next/image";
import { notFound } from "next/navigation";
import {
  BedDouble,
  CalendarCheck,
  DoorOpen,
  Globe,
  Wallet,
  Gauge,
  CalendarClock,
  Moon,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AnimatedCounter } from "@/components/dashboard/animated-counter";
import {
  properties,
  type PropertyId,
  reservations,
  channelColors,
} from "@/lib/mock-data";

export function generateStaticParams() {
  return Object.keys(properties).map((id) => ({ id }));
}

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = properties[id as PropertyId];
  if (!property) notFound();

  const propertyReservations = reservations.filter((r) => r.property === property.id);

  const stats = [
    { icon: CalendarCheck, label: "Occupancy", value: property.occupancy, suffix: "%" },
    { icon: Wallet, label: "Revenue (MTD)", value: property.revenue, prefix: "$" },
    { icon: DoorOpen, label: "Upcoming Arrivals", value: property.upcomingArrivals },
    { icon: BedDouble, label: "Available Rooms", value: property.availableRooms },
    { icon: Gauge, label: "ADR", value: property.adr, prefix: "$" },
    { icon: Gauge, label: "RevPAR", value: property.revpar, prefix: "$" },
    { icon: CalendarClock, label: "Lead Time", value: property.leadTime, suffix: " days" },
    { icon: Moon, label: "Length of Stay", value: property.lengthOfStay, suffix: " nights", decimals: 1 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={property.name}
        description={property.location}
        actions={
          property.website ? (
            <Badge variant="gold" className="gap-1.5">
              <Globe className="size-3.5" /> {property.website}
            </Badge>
          ) : undefined
        }
      />

      <div className="relative h-56 w-full overflow-hidden rounded-2xl sm:h-72">
        <Image src={property.image} alt={property.name} fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/10 to-transparent" />
        <div className="absolute bottom-4 left-6 flex flex-wrap gap-2">
          {property.channels.map((c) => (
            <Badge
              key={c}
              className="border-0 text-white"
              style={{ backgroundColor: channelColors[c] }}
            >
              {c}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-2">
              <s.icon className="mb-2 size-4 text-gold" />
              <div className="text-xl font-semibold">
                <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} decimals={s.decimals} />
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Occupancy</CardTitle>
          <CardDescription>{property.rooms} total rooms · {property.availableRooms} available now</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={property.occupancy} className="h-3" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>{property.occupancy}% occupied</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      {propertyReservations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Reservations</CardTitle>
            <CardDescription>Latest bookings for {property.name}.</CardDescription>
          </CardHeader>
          <CardContent>
            <ReservationFeedTable reservations={propertyReservations} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ReservationFeedTable({ reservations: items }: { reservations: typeof reservations }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((r) => (
        <div
          key={r.id}
          className="flex items-center justify-between rounded-xl border border-border/50 p-3 text-sm"
        >
          <div>
            <p className="font-medium">{r.guest}</p>
            <p className="text-xs text-muted-foreground">
              {r.channel} · {r.checkIn} → {r.checkOut}
            </p>
          </div>
          <Badge variant="outline">{r.status}</Badge>
        </div>
      ))}
    </div>
  );
}
