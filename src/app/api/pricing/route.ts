// Pricing quote — deterministic, and the only endpoint that returns money.

import { getPricing } from "@/lib/booking/pricing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  const result = getPricing({
    propertyId: params.get("propertyId") ?? "",
    checkIn: params.get("checkIn") ?? "",
    checkOut: params.get("checkOut") ?? "",
    guests: Number(params.get("guests") ?? NaN),
    promoCode: params.get("promoCode"),
  });

  if (!result.ok) {
    return Response.json(
      { escalated: true, reason: result.escalation.reason, detail: result.escalation.detail },
      { status: 409 }
    );
  }

  return Response.json(result.data);
}
