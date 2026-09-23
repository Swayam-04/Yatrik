import { NextRequest, NextResponse } from "next/server";
import { getRealWeather } from "@/services/weather.service";
import { searchLocations } from "@/services/location.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const destination = searchParams.get("destination");
    const latParam = searchParams.get("lat");
    const lngParam = searchParams.get("lng");

    let lat = latParam ? parseFloat(latParam) : NaN;
    let lng = lngParam ? parseFloat(lngParam) : NaN;

    // If destination name was provided without coordinates, resolve coordinates dynamically
    if ((isNaN(lat) || isNaN(lng)) && destination) {
      const locRes = await searchLocations(destination, { limit: 1 });
      if (locRes.results.length > 0) {
        lat = locRes.results[0].latitude;
        lng = locRes.results[0].longitude;
      }
    }

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { weather: null, message: "Live data unavailable (Destination coordinates could not be resolved)" },
        { status: 200 }
      );
    }

    const { weather, error } = await getRealWeather(lat, lng, destination || undefined);

    if (!weather) {
      return NextResponse.json(
        { weather: null, message: error || "Live data unavailable" },
        { status: 200 }
      );
    }

    return NextResponse.json({ weather, source: weather.source });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Weather request failed";
    return NextResponse.json(
      { weather: null, message: "Live data unavailable", error: message },
      { status: 500 }
    );
  }
}
