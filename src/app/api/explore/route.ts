import { NextRequest, NextResponse } from "next/server";
import { queryExplorePlaces } from "@/services/explore.service";
import { searchLocations } from "@/services/location.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latStr = searchParams.get("lat") || searchParams.get("latitude");
    const lngStr = searchParams.get("lng") || searchParams.get("longitude");
    const destination = searchParams.get("destination") || undefined;
    const category = searchParams.get("category") || "all";
    const query = searchParams.get("query") || searchParams.get("q") || undefined;
    const radiusStr = searchParams.get("radius");
    const pageStr = searchParams.get("page");
    const limitStr = searchParams.get("limit");
    const sort = (searchParams.get("sort") as any) || "recommended";
    const minRatingStr = searchParams.get("minRating");
    const openNow = searchParams.get("openNow") === "true";
    const priceLevel = searchParams.get("priceLevel") || undefined;

    let latitude = latStr ? parseFloat(latStr) : NaN;
    let longitude = lngStr ? parseFloat(lngStr) : NaN;
    let resolvedName = destination || query || "Selected Location";

    // Dynamic Location Resolution if coordinates are missing
    if ((isNaN(latitude) || isNaN(longitude)) && (destination || query)) {
      const locRes = await searchLocations(destination || query!, { limit: 1 });
      if (locRes.results.length > 0) {
        latitude = locRes.results[0].latitude;
        longitude = locRes.results[0].longitude;
        resolvedName = locRes.results[0].name;
      }
    }

    // Default to global coordinates if neither was provided
    if (isNaN(latitude) || isNaN(longitude)) {
      latitude = 20.2961;
      longitude = 85.8245;
      resolvedName = "Bhubaneswar";
    }

    const radiusMeters = radiusStr ? parseInt(radiusStr) : 10000;
    const page = pageStr ? Math.max(1, parseInt(pageStr)) : 1;
    const limit = limitStr ? Math.min(50, Math.max(1, parseInt(limitStr))) : 20;
    const minRating = minRatingStr ? parseFloat(minRatingStr) : 0;

    const result = await queryExplorePlaces({
      latitude,
      longitude,
      destinationName: resolvedName,
      radiusMeters,
      category,
      query,
      page,
      limit,
      sort,
      minRating,
      openNow,
      priceLevel,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Explore request failed";
    console.error("GET /api/explore error:", message);
    return NextResponse.json(
      {
        places: [],
        total: 0,
        page: 1,
        limit: 20,
        hasMore: false,
        error: "Live data unavailable",
        details: message,
      },
      { status: 500 }
    );
  }
}
