// Availability lookup — the same engine the assistant calls, exposed to the
// dashboard UI and to the direct-booking website.

import { getAvailability } from "@/lib/booking/calendar";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;

  const result = await getAvailability({
    propertyId: params.get("propertyId") ?? "",
    checkIn: params.get("checkIn") ?? "",
    checkOut: params.get("checkOut") ?? "",
    guests: Number(params.get("guests") ?? NaN),
  });

  if (!result.ok) {
    // 409 rather than 500: the request was well-formed, the answer is
    // "a human needs to confirm this".
    return Response.json(
      { escalated: true, reason: result.escalation.reason, detail: result.escalation.detail },
      { status: 409 }
    );
  }

  return Response.json(result.data);
}
