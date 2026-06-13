"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Megaphone, MousePointerClick, TrendingUp } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedCounter } from "@/components/dashboard/animated-counter";
import { marketingChannels, websiteTraffic } from "@/lib/mock-data";

export default function MarketingPage() {
  const totalSpend = marketingChannels.reduce((s, c) => s + c.spend, 0);
  const totalConversions = marketingChannels.reduce((s, c) => s + c.conversions, 0);
  const totalVisitors = websiteTraffic.reduce((s, d) => s + d.visitors, 0);
  const conversionRate = ((totalConversions / totalVisitors) * 100).toFixed(1);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Marketing" description="Campaign performance, website traffic and ROI." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-2">
            <Megaphone className="mb-2 size-4 text-gold" />
            <div className="text-2xl font-semibold">
              <AnimatedCounter value={totalSpend} prefix="$" />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Ad Spend (MTD)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-2">
            <MousePointerClick className="mb-2 size-4 text-gold" />
            <div className="text-2xl font-semibold">
              <AnimatedCounter value={totalVisitors} />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">Website Visitors (7d)</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-2">
            <TrendingUp className="mb-2 size-4 text-gold" />
            <div className="text-2xl font-semibold">{conversionRate}%</div>
            <div className="mt-1 text-xs text-muted-foreground">Conversion Rate</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Channel ROI</CardTitle>
          <CardDescription>Spend, conversions and return on investment by channel.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {marketingChannels.map((c) => (
            <div key={c.name} className="flex items-center justify-between rounded-xl border border-border/50 p-3 text-sm">
              <span className="font-medium">{c.name}</span>
              <span className="text-muted-foreground">${c.spend.toLocaleString()} spend</span>
              <span className="text-muted-foreground">{c.conversions} conversions</span>
              <Badge variant="gold">{c.roi === Infinity ? "∞ ROI" : `${c.roi}x ROI`}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Website Traffic vs. Bookings</CardTitle>
          <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={websiteTraffic}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)" }} />
              <Legend />
              <Bar dataKey="visitors" fill="#0F172A" radius={[4, 4, 0, 0]} animationDuration={900} />
              <Bar dataKey="bookings" fill="#D4AF37" radius={[4, 4, 0, 0]} animationDuration={900} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
