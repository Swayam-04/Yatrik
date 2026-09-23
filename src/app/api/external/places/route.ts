import { NextRequest, NextResponse } from "next/server";
import { searchRealPlaces } from "@/services/places.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const destination = searchParams.get("destination") || undefined;
    const type = searchParams.get("type") || searchParams.get("category") || "tourist_attraction";
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");

    const latitude = latParam ? parseFloat(latParam) : undefined;
    const longitude = lngParam ? parseFloat(lngParam) : undefined;

    const result = await searchRealPlaces({
      query: destination,
      latitude,
      longitude,
      category: type,
      radiusMeters: 6000,
      maxResults: 12,
    });

    if (result.places.length === 0) {
      return NextResponse.json({
        places: [],
        source: result.source,
        message: result.error || "Live data unavailable",
      });
    }

    // Format for backwards compatibility with components expecting external places schema
    const formatted = result.places.map((p) => ({
      id: p.placeId,
      name: p.name,
      category: p.category,
      address: p.address,
      rating: p.rating ?? 4.5,
      userRatingsTotal: p.userRatingCount ?? 50,
      latitude: p.latitude,
      longitude: p.longitude,
      openNow: p.openNow ?? true,
      photoUrl:
        p.photos?.[0] ||
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    }));

    return NextResponse.json({ places: formatted, source: result.source });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Places API request failed";
    return NextResponse.json(
      { places: [], message: "Live data unavailable", error: message },
      { status: 500 }
    );
  }
}
