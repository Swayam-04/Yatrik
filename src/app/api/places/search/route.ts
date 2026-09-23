import { NextRequest, NextResponse } from "next/server";
import { searchRealPlaces } from "@/services/places.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || searchParams.get("destination") || undefined;
    const category = searchParams.get("category") || searchParams.get("type") || "attractions";
    const latStr = searchParams.get("lat") || searchParams.get("latitude");
    const lngStr = searchParams.get("lng") || searchParams.get("longitude");
    const radiusStr = searchParams.get("radius");
    const limitStr = searchParams.get("limit");

    const latitude = latStr ? parseFloat(latStr) : undefined;
    const longitude = lngStr ? parseFloat(lngStr) : undefined;
    const radiusMeters = radiusStr ? parseInt(radiusStr) : 8000;
    const maxResults = limitStr ? parseInt(limitStr) : 10;

    const result = await searchRealPlaces({
      query,
      latitude,
      longitude,
      category,
      radiusMeters,
      maxResults,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Places search failed";
    return NextResponse.json(
      { places: [], error: "Live data unavailable", details: message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await searchRealPlaces({
      query: body.query || body.destination,
      latitude: body.latitude ?? body.lat,
      longitude: body.longitude ?? body.lng,
      category: body.category || body.type || "attractions",
      radiusMeters: body.radiusMeters || body.radius || 8000,
      maxResults: body.maxResults || body.limit || 12,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Places search failed";
    return NextResponse.json(
      { places: [], error: "Live data unavailable", details: message },
      { status: 500 }
    );
  }
}
