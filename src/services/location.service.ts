import axios from "axios";

export interface LocationSearchResult {
  id: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  country: string;
  region: string;
  city: string;
  mapboxPlaceId: string;
  placeType: string[];
}

interface CacheEntry {
  data: LocationSearchResult[];
  timestamp: number;
}

// In-memory short-lived cache (10 minutes)
const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_SIZE = 250;

function cleanCache() {
  const now = Date.now();
  if (searchCache.size > MAX_CACHE_SIZE) {
    for (const [key, entry] of searchCache.entries()) {
      if (now - entry.timestamp > CACHE_TTL_MS) {
        searchCache.delete(key);
      }
    }
  }
}

/**
 * Searches for any location worldwide using Mapbox Geocoding / Search Box.
 * Works dynamically for any city, landmark, address, neighborhood, or POI.
 */
export async function searchLocations(
  query: string,
  options: {
    proximity?: [number, number];
    types?: string;
    limit?: number;
  } = {}
): Promise<{ results: LocationSearchResult[]; source: string }> {
  const trimmed = query?.trim();
  if (!trimmed || trimmed.length < 2) {
    return { results: [], source: "Mapbox Search" };
  }

  const cacheKey = `${trimmed.toLowerCase()}_${options.types || "all"}_${options.proximity?.join(",") || "global"}`;
  const cached = searchCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return { results: cached.data, source: "Cache (Mapbox Search)" };
  }

  const token =
    process.env.MAPBOX_ACCESS_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!token || token.includes("example")) {
    console.warn("Mapbox Access Token is not configured or is an example token.");
    return { results: [], source: "Mapbox Search (Unconfigured Token)" };
  }

  try {
    const encoded = encodeURIComponent(trimmed);
    const limit = options.limit || 8;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json`;

    const params: Record<string, string | number> = {
      access_token: token,
      limit,
      autocomplete: "true",
      language: "en",
    };

    if (options.types) {
      params.types = options.types;
    }

    if (options.proximity && options.proximity.length === 2) {
      params.proximity = `${options.proximity[0]},${options.proximity[1]}`;
    }

    const response = await axios.get(url, { params, timeout: 8000 });
    const features = response.data?.features || [];

    const results: LocationSearchResult[] = features.map((f: any) => {
      const context = f.context || [];
      let country = "";
      let region = "";
      let city = "";

      for (const item of context) {
        const id: string = item.id || "";
        if (id.startsWith("country")) country = item.text || "";
        else if (id.startsWith("region")) region = item.text || "";
        else if (id.startsWith("place") || id.startsWith("locality")) city = item.text || "";
      }

      // If feature itself is a place or country
      const placeTypes: string[] = f.place_type || [];
      if (!city && (placeTypes.includes("place") || placeTypes.includes("locality"))) {
        city = f.text || "";
      }
      if (!country && placeTypes.includes("country")) {
        country = f.text || "";
      }
      if (!region && placeTypes.includes("region")) {
        region = f.text || "";
      }

      const coordinates: [number, number] = f.center || (f.geometry && f.geometry.coordinates) || [0, 0];

      return {
        id: f.id,
        name: f.text || f.place_name?.split(",")[0] || trimmed,
        formattedAddress: f.place_name || f.text || trimmed,
        longitude: coordinates[0],
        latitude: coordinates[1],
        country: country || (f.properties?.country ?? ""),
        region: region || (f.properties?.region ?? ""),
        city: city || (f.properties?.city ?? ""),
        mapboxPlaceId: f.id || "",
        placeType: placeTypes,
      };
    });

    cleanCache();
    searchCache.set(cacheKey, { data: results, timestamp: Date.now() });

    return { results, source: "Mapbox Geocoding API" };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Mapbox search error";
    console.error("Mapbox search failed:", errorMsg);
    return { results: [], source: "Mapbox Search (Live data unavailable)" };
  }
}
