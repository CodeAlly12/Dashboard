import { HeroBanner } from "@/components/dashboard/hero-banner";
import { PropertySummary } from "@/components/dashboard/property-summary";
import { RevenueAnalytics } from "@/components/dashboard/revenue-analytics";
import { OccupancyAnalytics } from "@/components/dashboard/occupancy-analytics";
import { ReservationFeed } from "@/components/dashboard/reservation-feed";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <HeroBanner />
      <PropertySummary />
      <RevenueAnalytics />
      <div className="grid gap-6 lg:grid-cols-2">
        <OccupancyAnalytics />
        <ReservationFeed />
      </div>
    </div>
  );
}
