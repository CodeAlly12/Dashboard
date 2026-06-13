import { PageHeader } from "@/components/dashboard/page-header";
import { RevenueAnalytics } from "@/components/dashboard/revenue-analytics";
import { OccupancyAnalytics } from "@/components/dashboard/occupancy-analytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AnimatedCounter } from "@/components/dashboard/animated-counter";
import { properties } from "@/lib/mock-data";

export default function RevenuePage() {
  const total = Object.values(properties).reduce((sum, p) => sum + p.revenue, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Revenue" description="Performance across channels, properties and time periods." />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Combined Revenue (MTD)</CardTitle>
            <CardDescription>HH Villa + Giant House</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold">
            <AnimatedCounter value={total} prefix="$" />
          </CardContent>
        </Card>
        {Object.values(properties).map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="text-base">{p.name}</CardTitle>
              <CardDescription>ADR ${p.adr} · RevPAR ${p.revpar}</CardDescription>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">
              <AnimatedCounter value={p.revenue} prefix="$" />
            </CardContent>
          </Card>
        ))}
      </div>

      <RevenueAnalytics />
      <OccupancyAnalytics />
    </div>
  );
}
