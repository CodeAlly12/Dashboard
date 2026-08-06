// Calendar polling entry point.
//
// Run this every 2 minutes (Vercel Cron, GitHub Actions, or any scheduler) so
// guest-facing queries read local state instead of hitting channel APIs. The
// route is outside Clerk's session check — see src/proxy.ts — so it
// authenticates with a shared secret instead.

import { syncCalendars } from "@/lib/booking/ical";
import { notifyOwner } from "@/lib/booking/notifications";
import { PROPERTY_IDS, isPropertyId } from "@/lib/booking/properties";
import type { PropertyId } from "@/lib/booking/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const requested = new URL(request.url).searchParams.get("propertyId");
  if (requested && !isPropertyId(requested)) {
    return Response.json({ error: "unknown_property" }, { status: 400 });
  }

  const targets: PropertyId[] = requested ? [requested as PropertyId] : PROPERTY_IDS;

  const results = await Promise.all(
    targets.map(async (propertyId) => {
      const result = await syncCalendars(propertyId, { apply: true });
      if (!result.ok) {
        await notifyOwner(
          "calendar_failure",
          [`Property: ${propertyId}`, result.escalation.detail ?? "Sync failed."],
          "critical"
        );
        return { propertyId, ok: false as const, detail: result.escalation.detail };
      }

      const conflicts = result.data.changes.filter((c) => c.type === "conflict");
      if (conflicts.length > 0) {
        await notifyOwner(
          "conflict",
          [`Property: ${propertyId}`, ...conflicts.map((c) => c.detail)],
          "critical"
        );
      }

      return {
        propertyId,
        ok: true as const,
        syncedAt: result.data.syncedAt,
        changes: result.data.changes.filter((c) => c.type !== "no_change").length,
        conflicts: conflicts.length,
        failedChannels: result.data.failedChannels,
      };
    })
  );

  return Response.json({ results }, { headers: { "Cache-Control": "no-store" } });
}
