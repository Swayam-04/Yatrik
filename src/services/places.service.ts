import axios from "axios";

export interface RealPlace {
  placeId: string;
  name: string;
  address: string;
  category: string;
  latitude: number;
  longitude: number;
  rating?: number;
  userRatingCount?: number;
  openNow?: boolean;
  openingHours?: string[];
  website?: string;
  phone?: string;
  priceLevel?: string;
  photos?: string[];
  types?: string[];
  summary?: string;
}

export type PlaceCategory =
  | "attractions"
  | "restaurants"
  | "cafes"
  | "hotels"
  | "activities"
  | "tourist_places"
  | "landmarks"
  | "shopping"
  | "entertainment"
  | "family_attractions";

// Map YATRIK categories to Google Places (New) place types
const CATEGORY_TYPE_MAPPING: Record<string, string[]> = {
  attractions: ["tourist_attraction", "historical_landmark", "museum", "art_gallery"],
  tourist_places: ["tourist_attraction", "visitor_center", "scenic_point"],
  landmarks: ["monument", "historical_landmark", "castle"],
  restaurants: ["restaurant", "fine_dining_restaurant", "seafood_restaurant"],
  cafes: ["cafe", "coffee_shop", "bakery"],
  hotels: ["hotel", "resort_hotel", "bed_and_breakfast", "guest_house"],
  activities: ["amusement_park", "park", "hiking_area", "water_park"],
  shopping: ["shopping_mall", "market", "clothing_store"],
  entertainment: ["movie_theater", "bowling_alley", "performing_arts_theater"],
  family_attractions: ["zoo", "aquarium", "theme_park", "amusement_park"],
};

// Field masks for Google Places API (New)
const SEARCH_FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.location",
  "places.rating",
  "places.userRatingCount",
  "places.currentOpeningHours",
  "places.websiteUri",
  "places.nationalPhoneNumber",
  "places.priceLevel",
  "places.photos",
  "places.types",
  "places.editorialSummary",
].join(",");

const DETAILS_FIELD_MASK = [
  "id",
  "displayName",
  "formattedAddress",
  "location",
  "rating",
  "userRatingCount",
  "currentOpeningHours",
  "regularOpeningHours",
  "websiteUri",
  "nationalPhoneNumber",
  "internationalPhoneNumber",
  "priceLevel",
  "photos",
  "reviews",
  "types",
  "editorialSummary",
].join(",");

// In-memory short-lived cache (15 minutes)
const placesCache = new Map<string, { data: RealPlace[]; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

function getCached(key: string): RealPlace[] | null {
  const item = placesCache.get(key);
  if (item && Date.now() - item.timestamp < CACHE_TTL_MS) {
    return item.data;
  }
  return null;
}

function setCache(key: string, data: RealPlace[]) {
  if (placesCache.size > 200) {
    placesCache.clear();
  }
  placesCache.set(key, { data, timestamp: Date.now() });
}

function formatPriceLevel(level?: string): string {
  switch (level) {
    case "PRICE_LEVEL_FREE":
      return "Free";
    case "PRICE_LEVEL_INEXPENSIVE":
      return "₹ (Budget)";
    case "PRICE_LEVEL_MODERATE":
      return "₹₹ (Moderate)";
    case "PRICE_LEVEL_EXPENSIVE":
      return "₹₹₹ (Expensive)";
    case "PRICE_LEVEL_VERY_EXPENSIVE":
      return "₹₹₹₹ (Luxury)";
    default:
      return "Standard";
  }
}

function transformGooglePlace(p: any, fallbackCategory: string): RealPlace {
  const photoRefs = (p.photos || []).slice(0, 3).map((ph: any) => {
    // Generate secure proxy photo URL through backend
    return `/api/places/photos?name=${encodeURIComponent(ph.name)}`;
  });

  return {
    placeId: p.id,
    name: p.displayName?.text || p.displayName || "Unknown Location",
    address: p.formattedAddress || "Local Area",
    category: fallbackCategory,
    latitude: p.location?.latitude ?? 0,
    longitude: p.location?.longitude ?? 0,
    rating: typeof p.rating === "number" ? Math.round(p.rating * 10) / 10 : undefined,
    userRatingCount: p.userRatingCount,
    openNow: p.currentOpeningHours?.openNow,
    openingHours: p.currentOpeningHours?.weekdayDescriptions,
    website: p.websiteUri,
    phone: p.nationalPhoneNumber,
    priceLevel: formatPriceLevel(p.priceLevel),
    photos: photoRefs.length > 0 ? photoRefs : undefined,
    types: p.types,
    summary: p.editorialSummary?.text,
  };
}

/**
 * Searches real places around given coordinates or text query using Google Places API (New).
 * Never synthesizes fake places on failure; returns empty list with explicit error status.
 */
export async function searchRealPlaces(params: {
  query?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  radiusMeters?: number;
  maxResults?: number;
}): Promise<{ places: RealPlace[]; source: string; error?: string }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey.includes("EXAMPLE")) {
    return {
      places: [],
      source: "Google Places API (New)",
      error: "Live data unavailable (GOOGLE_MAPS_API_KEY not configured)",
    };
  }

  const category = (params.category || "attractions").toLowerCase();
  const radius = params.radiusMeters || 8000;
  const maxResults = params.maxResults || 10;

  const cacheKey = `${params.query || ""}_${params.latitude?.toFixed(3) || ""}_${params.longitude?.toFixed(3) || ""}_${category}`;
  const cached = getCached(cacheKey);
  if (cached) {
    return { places: cached, source: "Cache (Google Places API New)" };
  }

  try {
    let places: RealPlace[] = [];

    // 1. Nearby Search by coordinates (preferred when coordinates are supplied)
    if (params.latitude !== undefined && params.longitude !== undefined) {
      const types = CATEGORY_TYPE_MAPPING[category] || ["tourist_attraction"];

      const url = "https://places.googleapis.com/v1/places:searchNearby";
      const payload = {
        includedTypes: types,
        maxResultCount: maxResults,
        locationRestriction: {
          circle: {
            center: {
              latitude: params.latitude,
              longitude: params.longitude,
            },
            radius,
          },
        },
      };

      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": SEARCH_FIELD_MASK,
        },
        timeout: 9000,
      });

      const rawPlaces = response.data?.places || [];
      places = rawPlaces.map((p: any) => transformGooglePlace(p, category));
    }

    // 2. Text Search if Nearby Search returned empty or query string was supplied
    if (places.length === 0 && (params.query || params.latitude !== undefined)) {
      const textQuery = params.query
        ? `${category.replace(/_/g, " ")} in ${params.query}`
        : `${category.replace(/_/g, " ")}`;

      const url = "https://places.googleapis.com/v1/places:searchText";
      const payload: Record<string, any> = {
        textQuery,
        maxResultCount: maxResults,
      };

      if (params.latitude !== undefined && params.longitude !== undefined) {
        payload.locationBias = {
          circle: {
            center: {
              latitude: params.latitude,
              longitude: params.longitude,
            },
            radius,
          },
        };
      }

      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": SEARCH_FIELD_MASK,
        },
        timeout: 9000,
      });

      const rawPlaces = response.data?.places || [];
      places = rawPlaces.map((p: any) => transformGooglePlace(p, category));
    }

    if (places.length > 0) {
      setCache(cacheKey, places);
    }

    return {
      places,
      source: "Google Places API (New)",
      error: places.length === 0 ? "Live data unavailable (no places found)" : undefined,
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Places request failed";
    console.warn("Google Places API (New) call failed:", errorMsg);
    return {
      places: [],
      source: "Google Places API (New)",
      error: "Live data unavailable",
    };
  }
}

/**
 * Retrieves detailed information for a single place using Google Places API (New).
 */
export async function getRealPlaceDetails(placeId: string): Promise<{ place: RealPlace | null; error?: string }> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey.includes("EXAMPLE")) {
    return { place: null, error: "Live data unavailable (GOOGLE_MAPS_API_KEY not configured)" };
  }

  try {
    const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`;
    const response = await axios.get(url, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": DETAILS_FIELD_MASK,
      },
      timeout: 8000,
    });

    const p = response.data;
    if (!p || !p.id) {
      return { place: null, error: "Live data unavailable" };
    }

    const place = transformGooglePlace(p, p.types?.[0] || "Location");
    return { place };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Place details error";
    console.warn("Google Place Details call failed:", errorMsg);
    return { place: null, error: "Live data unavailable" };
  }
}
