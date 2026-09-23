import { NextRequest, NextResponse } from "next/server";
import { searchRealPlaces, RealPlace } from "@/services/places.service";
import { getRealWeather } from "@/services/weather.service";
import { generateGroundedItinerary, checkOllamaHealth } from "@/services/ollama.service";
import { searchLocations } from "@/services/location.service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const destination = body.destination;
    let lat = body.latitude !== undefined ? Number(body.latitude) : undefined;
    let lng = body.longitude !== undefined ? Number(body.longitude) : undefined;

    if (!destination && (lat === undefined || lng === undefined)) {
      return NextResponse.json(
        { error: "Destination name or coordinates are required." },
        { status: 400 }
      );
    }

    // 1. Resolve coordinates if missing via Mapbox Location Search
    if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
      const locRes = await searchLocations(destination, { limit: 1 });
      if (locRes.results.length > 0) {
        lat = locRes.results[0].latitude;
        lng = locRes.results[0].longitude;
      } else {
        return NextResponse.json(
          { error: `Live data unavailable: Could not locate "${destination}" globally.` },
          { status: 404 }
        );
      }
    }

    // 2. Fetch REAL Places from Google Places API (New) across categories
    const [attractionsRes, restaurantsRes, hotelsRes] = await Promise.allSettled([
      searchRealPlaces({
        query: destination,
        latitude: lat,
        longitude: lng,
        category: "attractions",
        maxResults: 8,
      }),
      searchRealPlaces({
        query: destination,
        latitude: lat,
        longitude: lng,
        category: "restaurants",
        maxResults: 6,
      }),
      searchRealPlaces({
        query: destination,
        latitude: lat,
        longitude: lng,
        category: "hotels",
        maxResults: 4,
      }),
    ]);

    const collectedPlaces: RealPlace[] = [];
    const seenPlaceIds = new Set<string>();

    const addPlaces = (res: PromiseSettledResult<{ places: RealPlace[] }>) => {
      if (res.status === "fulfilled" && Array.isArray(res.value?.places)) {
        for (const p of res.value.places) {
          if (!seenPlaceIds.has(p.placeId)) {
            seenPlaceIds.add(p.placeId);
            collectedPlaces.push(p);
          }
        }
      }
    };

    addPlaces(attractionsRes);
    addPlaces(restaurantsRes);
    addPlaces(hotelsRes);

    // 3. Fetch Real Live Weather
    let realWeather = null;
    try {
      const weatherRes = await getRealWeather(lat, lng, destination);
      realWeather = weatherRes.weather;
    } catch (weatherErr) {
      console.warn("Weather fetch failed during itinerary generation:", weatherErr);
    }

    // 4. Send Real Places + Parameters to Gemma 4 (Ollama)
    const tripResult = await generateGroundedItinerary({
      destination,
      latitude: lat,
      longitude: lng,
      budgetTotal: Number(body.budget) || 25000,
      daysCount: Math.min(14, Math.max(1, Number(body.days) || 4)),
      travelersCount: Math.max(1, Number(body.travelers) || 1),
      travelType: body.travelerType || body.travelType || "Solo",
      transportMode: body.transportMode || "Flight",
      preferences: Array.isArray(body.preferences) ? body.preferences : ["Hidden Gems", "Food & Cafes"],
      realPlaces: collectedPlaces,
      realWeather,
    });

    return NextResponse.json({
      success: true,
      trip: tripResult.trip,
      source: tripResult.source,
      weather: realWeather,
      realPlacesCount: collectedPlaces.length,
      realPlaces: collectedPlaces,
      rawAiResponse: tripResult.rawAiResponse,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Itinerary generation failed";
    console.error("Itinerary generation error:", message);
    return NextResponse.json(
      { error: message || "Live data unavailable", success: false },
      { status: 500 }
    );
  }
}

export async function GET() {
  const ollamaHealth = await checkOllamaHealth();
  return NextResponse.json({
    status: "ok",
    ollama: ollamaHealth,
    architecture: "USER REQUEST -> LOCATION SEARCH -> REAL API DATA -> GEMMA 4 -> ITINERARY",
  });
}
