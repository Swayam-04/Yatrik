import { NextRequest, NextResponse } from "next/server";
import { getRealWeather } from "@/services/weather.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const latParam = searchParams.get("lat") || searchParams.get("latitude");
    const lngParam = searchParams.get("lng") || searchParams.get("longitude");
    const destination = searchParams.get("destination") || undefined;

    if (!latParam || !lngParam) {
      return NextResponse.json(
        { weather: null, error: "Latitude and longitude query parameters are required" },
        { status: 400 }
      );
    }

    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);

    const { weather, error } = await getRealWeather(lat, lng, destination);

    if (!weather) {
      return NextResponse.json(
        { weather: null, error: error || "Live data unavailable" },
        { status: 200 }
      );
    }

    return NextResponse.json({ weather });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Weather request failed";
    return NextResponse.json(
      { weather: null, error: "Live data unavailable", details: message },
      { status: 500 }
    );
  }
}
