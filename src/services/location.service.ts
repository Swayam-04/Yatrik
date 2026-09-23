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
    sessionToken?: string;
  } = {}
): Promise<{ results: LocationSearchResult[]; source: string; error?: string }> {
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
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
    process.env.MAPBOX_ACCESS_TOKEN;

  if (!token || token.includes("example")) {
    console.warn("Mapbox Access Token is not configured or is an example token.");
    return {
      results: [],
      source: "Mapbox Search (Unconfigured Token)",
      error: "Location search is unavailable. Configure the Mapbox access token.",
    };
  }

  const sessionToken = options.sessionToken || "yatrik-session-" + Date.now();

  try {
    const encoded = encodeURIComponent(trimmed);
    const limit = options.limit || 8;

    // Use current Mapbox Search Box API v1 /suggest
    const url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encoded}&language=en&session_token=${sessionToken}&access_token=${token}&limit=${limit}`;

    const response = await axios.get(url, { timeout: 8000 });
    const suggestions = response.data?.suggestions || [];

    const results: LocationSearchResult[] = suggestions.map((s: any) => {
      const context = s.context || {};
      const country = context.country?.name || "";
      const region = context.region?.name || "";
      const city = context.place?.name || context.locality?.name || s.name;

      return {
        id: s.mapbox_id,
        name: s.name,
        formattedAddress: s.place_formatted
          ? `${s.name}, ${s.place_formatted}`
          : s.full_address || s.name,
        longitude: 0, // Retrieved via /retrieve
        latitude: 0,
        country,
        region,
        city,
        mapboxPlaceId: s.mapbox_id,
        placeType: s.feature_type ? [s.feature_type] : ["place"],
      };
    });

    cleanCache();
    searchCache.set(cacheKey, { data: results, timestamp: Date.now() });

    return { results, source: "Mapbox Search Box API v1" };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Mapbox search error";
    console.error("Mapbox search failed:", errorMsg);
    return { results: [], source: "Mapbox Search", error: errorMsg };
  }
}

/**
 * Retrieves full place details and coordinates from Mapbox Search Box API v1.
 */
export async function retrieveMapboxPlace(
  mapboxId: string,
  sessionToken: string
): Promise<LocationSearchResult | null> {
  const token =
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
    process.env.MAPBOX_ACCESS_TOKEN;

  if (!token || token.includes("example")) return null;

  try {
    const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(
      mapboxId
    )}?session_token=${sessionToken}&access_token=${token}`;

    const res = await axios.get(url, { timeout: 8000 });
    const feature = res.data?.features?.[0];
    if (!feature) return null;

    const coordinates = feature.geometry?.coordinates || [0, 0];
    const properties = feature.properties || {};
    const context = properties.context || {};

    const country = context.country?.name || "";
    const region = context.region?.name || "";
    const city = context.place?.name || context.locality?.name || properties.name;

    return {
      id: properties.mapbox_id || mapboxId,
      name: properties.name,
      formattedAddress:
        properties.full_address ||
        (properties.place_formatted
          ? `${properties.name}, ${properties.place_formatted}`
          : properties.name),
      longitude: coordinates[0],
      latitude: coordinates[1],
      country,
      region,
      city,
      mapboxPlaceId: mapboxId,
      placeType: [properties.feature_type || "place"],
    };
  } catch (err) {
    console.error("Failed to retrieve Mapbox place:", err);
    return null;
  }
}
