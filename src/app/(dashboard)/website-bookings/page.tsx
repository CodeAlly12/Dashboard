"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Globe, MousePointerClick, ShoppingCart, Percent } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/dashboard/animated-counter";
import { Badge } from "@/components/ui/badge";
import { reservations, properties, websiteTraffic } from "@/lib/mock-data";

export default function WebsiteBookingsPage() {
  const directBookings = reservations.filter((r) => r.channel === "Direct Website");
  const totalVisitors = websiteTraffic.reduce((s, d) => s + d.visitors, 0);
  const totalBookings = websiteTraffic.reduce((s, d) => s + d.bookings, 0);

  const stats = [
    { icon: Globe, label: "Website", value: properties["hh-villa"].website },
    { icon: MousePointerClick, label: "Visitors (7d)", value: totalVisitors },
    { icon: ShoppingCart, label: "Direct Bookings (7d)", value: totalBookings },
    { icon: Percent, label: "Conversion Rate", value: ((totalBookings / totalVisitors) * 100).toFixed(1) + "%" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Website Bookings" description="Direct bookings from www.hhvilla.com and social channels." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-2">
              <s.icon className="mb-2 size-4 text-gold" />
              <div className="text-xl font-semibold">
                {typeof s.value === "number" ? <AnimatedCounter value={s.value} /> : s.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Booking Funnel</CardTitle>
          <CardDescription>Visitors converting into direct bookings over the last 7 days.</CardDescription>
        </CardHeader>
        <CardContent className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={websiteTraffic}>
              <defs>
                <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F172A" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#0F172A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bookingsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
              <Area type="monotone" dataKey="visitors" stroke="#0F172A" fill="url(#visitorsGrad)" strokeWidth={2} animationDuration={900} />
              <Area type="monotone" dataKey="bookings" stroke="#D4AF37" fill="url(#bookingsGrad)" strokeWidth={2} animationDuration={900} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Direct Bookings</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {directBookings.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-xl border border-border/50 p-3 text-sm">
              <div>
                <p className="font-medium">{r.guest}</p>
                <p className="text-xs text-muted-foreground">{properties[r.property].name} · {r.checkIn} → {r.checkOut}</p>
              </div>
              <Badge variant="gold">${r.total.toLocaleString()}</Badge>
            </div>
          ))}
          {directBookings.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">No direct bookings yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
