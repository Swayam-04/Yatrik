import { NextRequest, NextResponse } from "next/server";
import { getRealPlaceDetails } from "@/services/places.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const placeId = searchParams.get("placeId") || searchParams.get("id");

    if (!placeId) {
      return NextResponse.json({ error: "placeId parameter is required" }, { status: 400 });
    }

    const result = await getRealPlaceDetails(placeId);
    if (!result.place) {
      return NextResponse.json(
        { place: null, error: result.error || "Live data unavailable" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch place details";
    return NextResponse.json({ place: null, error: "Live data unavailable", details: message }, { status: 500 });
  }
}
