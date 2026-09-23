import { NextRequest, NextResponse } from "next/server";
import { searchLocations } from "@/services/location.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("query") || "";
    const types = searchParams.get("types") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 8;

    const proxParam = searchParams.get("proximity");
    let proximity: [number, number] | undefined = undefined;
    if (proxParam) {
      const parts = proxParam.split(",").map(Number);
      if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
        proximity = [parts[0], parts[1]];
      }
    }

    if (!query.trim()) {
      return NextResponse.json({ results: [], source: "Mapbox Search" });
    }

    const { results, source } = await searchLocations(query, {
      types,
      limit,
      proximity,
    });

    return NextResponse.json({ results, source });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Location search failed";
    console.error("Location search endpoint error:", message);
    return NextResponse.json(
      { results: [], error: "Live data unavailable", details: message },
      { status: 500 }
    );
  }
}
