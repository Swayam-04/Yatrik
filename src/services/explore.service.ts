import axios from "axios";
import { RealPlace, searchRealPlaces } from "./places.service";
import { searchLocations } from "./location.service";

export interface HiddenGemEvaluation {
  score: number; // 0 to 100
  isHiddenGem: boolean;
  reason: string;
  badgeLabel: string;
}

export interface ExplorePlaceItem extends RealPlace {
  distanceKm?: number;
  hiddenGemEvaluation: HiddenGemEvaluation;
  displayCategory: string;
  source: string;
}

export type ExploreCategory =
  | "all"
  | "hidden-gems"
  | "attractions"
  | "nature"
  | "historical"
  | "cultural"
  | "temples"
  | "museums"
  | "viewpoints"
  | "beaches"
  | "waterfalls"
  | "parks"
  | "cafes"
  | "restaurants"
  | "local-food"
  | "markets"
  | "shopping"
  | "activities"
  | "adventure"
  | "photography"
  | "family"
  | "nightlife"
  | "local-experiences";

export interface ExploreQueryOptions {
  latitude: number;
  longitude: number;
  destinationName?: string;
  radiusMeters?: number;
  category?: string;
  query?: string;
  page?: number;
  limit?: number;
  sort?: "recommended" | "hidden_gem" | "rating" | "distance" | "popularity" | "price";
  minRating?: number;
  openNow?: boolean;
  priceLevel?: string;
}

export interface ExploreResponse {
  places: ExplorePlaceItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  destination: {
    name: string;
    latitude: number;
    longitude: number;
    formattedAddress?: string;
  };
  appliedCategory: string;
  appliedSort: string;
  source: string;
}

// Category mappings to Google Places API (New) types
export const EXPLORE_CATEGORY_MAPPING: Record<string, string[]> = {
  "hidden-gems": ["scenic_point", "historical_landmark", "cafe", "park", "tourist_attraction", "art_gallery"],
  attractions: ["tourist_attraction", "monument", "landmark", "visitor_center"],
  nature: ["park", "natural_feature", "campground", "hiking_area", "wildlife_park"],
  historical: ["historical_landmark", "monument", "castle", "archaeological_site"],
  cultural: ["cultural_center", "art_gallery", "performing_arts_theater", "community_center"],
  temples: ["place_of_worship", "hindu_temple", "church", "mosque"],
  museums: ["museum", "science_museum", "history_museum"],
  viewpoints: ["scenic_point", "observation_deck"],
  beaches: ["beach", "seaside"],
  waterfalls: ["natural_feature"],
  parks: ["park", "national_park", "botanical_garden"],
  cafes: ["cafe", "coffee_shop", "bakery"],
  restaurants: ["restaurant", "fine_dining_restaurant", "seafood_restaurant"],
  "local-food": ["restaurant", "fast_food_restaurant", "diner"],
  markets: ["market", "flea_market", "grocery_store"],
  shopping: ["shopping_mall", "clothing_store", "department_store"],
  activities: ["amusement_park", "bowling_alley", "recreation_center"],
  adventure: ["hiking_area", "sports_complex", "rafting"],
  photography: ["scenic_point", "historical_landmark", "park"],
  family: ["zoo", "aquarium", "theme_park", "amusement_park"],
  nightlife: ["bar", "pub", "night_club"],
  "local-experiences": ["tourist_attraction", "cultural_center"],
};

// Calculate distance between two coordinates using Haversine formula
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * YATRIK Hidden Gem Ranking Engine
 * Evaluates real visitor signals to separate authentic lesser-known gems
 * from globally famous commercial tourist traps.
 */
export function calculateHiddenGemScore(
  place: RealPlace,
  distanceKm?: number
): HiddenGemEvaluation {
  let score = 50; // Neutral baseline
  const rating = place.rating ?? 4.0;
  const reviews = place.userRatingCount ?? 15;
  const types = place.types || [];
  const nameLower = place.name.toLowerCase();

  // 1. Rating Quality Signal (4.3 to 5.0 is the prime sweet spot)
  if (rating >= 4.8) score += 25;
  else if (rating >= 4.5) score += 18;
  else if (rating >= 4.2) score += 10;
  else if (rating < 3.8) score -= 20;

  // 2. Review Count Volume Sweet-Spot & Mainstream Penalty
  // A true hidden gem has strong verification (20 - 450 reviews), but is NOT an overrun tourist trap.
  if (reviews >= 25 && reviews <= 350) {
    score += 25; // Authentic local discovery sweet-spot
  } else if (reviews > 350 && reviews <= 800) {
    score += 15;
  } else if (reviews > 800 && reviews <= 2000) {
    score += 5;
  } else if (reviews > 2000 && reviews <= 5000) {
    score -= 15; // Moderately mainstream
  } else if (reviews > 5000) {
    score -= 35; // Heavily mainstream commercial tourist attraction
  } else if (reviews < 10) {
    score -= 10; // Low verification signal
  }

  // 3. Category Intimacy & Place Type Signals
  const intimateKeywords = [
    "scenic_point",
    "viewpoint",
    "cafe",
    "bakery",
    "park",
    "natural_feature",
    "art_gallery",
    "historical_landmark",
    "hiking_area",
    "cultural_center",
  ];
  const commercialKeywords = [
    "shopping_mall",
    "airport",
    "train_station",
    "transit_station",
    "atm",
    "gas_station",
  ];

  let hasIntimate = types.some((t) => intimateKeywords.includes(t));
  let hasCommercial = types.some((t) => commercialKeywords.includes(t));

  if (nameLower.includes("secret") || nameLower.includes("hidden") || nameLower.includes("cove") || nameLower.includes("viewpoint")) {
    hasIntimate = true;
  }

  if (hasIntimate) score += 12;
  if (hasCommercial) score -= 25;

  // Clamp score between 10 and 99
  const finalScore = Math.min(99, Math.max(12, Math.round(score)));
  const isHiddenGem = finalScore >= 75;

  let reason = "";
  if (finalScore >= 88) {
    reason = `Exceptional local gem: High rating (${rating}★) with intimate visitor volume (${reviews} reviews), off the mainstream tourist radar.`;
  } else if (finalScore >= 75) {
    reason = `Verified hidden gem: Strong community rating (${rating}★) with balanced local footfall without commercial overcrowding.`;
  } else if (reviews > 3000) {
    reason = `Major popular landmark with heavy tourist footfall (${reviews} reviews). Famous highlight rather than a secret spot.`;
  } else {
    reason = `Recognized local venue with standard community visit distribution (${rating}★ rating).`;
  }

  return {
    score: finalScore,
    isHiddenGem,
    reason,
    badgeLabel: isHiddenGem ? "YATRIK Hidden Gem" : "Popular Spot",
  };
}

/**
 * Natural query parser: detects semantic intent from queries like
 * "hidden gems in Bhubaneswar", "quiet places near Paris", "secret cafes in Kolkata".
 */
export function parseNaturalQuery(query: string): {
  inferredCategory?: string;
  cleanSearchText: string;
  biasSort?: "hidden_gem" | "rating" | "distance";
} {
  const q = query.toLowerCase().trim();
  let inferredCategory: string | undefined = undefined;
  let biasSort: "hidden_gem" | "rating" | "distance" | undefined = undefined;

  if (q.includes("hidden gem") || q.includes("secret") || q.includes("less crowded") || q.includes("quiet")) {
    inferredCategory = "hidden-gems";
    biasSort = "hidden_gem";
  } else if (q.includes("cafe") || q.includes("coffee") || q.includes("bakery")) {
    inferredCategory = "cafes";
  } else if (q.includes("food") || q.includes("restaurant") || q.includes("eat") || q.includes("culinary")) {
    inferredCategory = "local-food";
  } else if (q.includes("view") || q.includes("sunset") || q.includes("sunrise") || q.includes("scenic")) {
    inferredCategory = "viewpoints";
  } else if (q.includes("nature") || q.includes("waterfall") || q.includes("hike") || q.includes("lake")) {
    inferredCategory = "nature";
  } else if (q.includes("history") || q.includes("monument") || q.includes("heritage") || q.includes("fort")) {
    inferredCategory = "historical";
  } else if (q.includes("temple") || q.includes("shrine") || q.includes("spiritual")) {
    inferredCategory = "temples";
  } else if (q.includes("shopping") || q.includes("market") || q.includes("bazaar")) {
    inferredCategory = "markets";
  }

  // Strip query stop-words for clean Google Places text search
  const cleanSearchText = query
    .replace(/\b(in|near|around|places|best|top|secret|hidden|gems|quiet)\b/gi, "")
    .trim();

  return { inferredCategory, cleanSearchText, biasSort };
}

// In-memory cache for explore results (15 min TTL)
const exploreCache = new Map<string, { data: ExplorePlaceItem[]; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;

/**
 * Dynamic Explore Engine
 * Queries real places around coordinates, computes YATRIK Hidden Gem Scores,
 * applies filters, and returns paginated results.
 */
export async function queryExplorePlaces(
  options: ExploreQueryOptions
): Promise<ExploreResponse> {
  const {
    latitude,
    longitude,
    destinationName,
    radiusMeters = 10000,
    page = 1,
    limit = 20,
    sort = "recommended",
    minRating = 0,
    openNow = false,
    priceLevel,
  } = options;

  let category = (options.category || "all").toLowerCase();
  let textQuery = options.query || "";

  // 1. Natural Language Query Intent Parsing
  if (textQuery) {
    const parsed = parseNaturalQuery(textQuery);
    if (!options.category || options.category === "all") {
      if (parsed.inferredCategory) category = parsed.inferredCategory;
    }
  }

  const cacheKey = `${latitude.toFixed(3)}_${longitude.toFixed(3)}_${category}_${textQuery}_${radiusMeters}`;
  let allPlaces: ExplorePlaceItem[] = [];

  const cached = exploreCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    allPlaces = cached.data;
  } else {
    // 2. Fetch Real Places from Google Places API (New)
    const placeCategoriesToQuery: string[] = [];

    if (category === "all" || category === "hidden-gems") {
      placeCategoriesToQuery.push("attractions", "cafes", "restaurants", "activities");
    } else {
      placeCategoriesToQuery.push(category);
    }

    const fetchedMap = new Map<string, RealPlace>();

    // Parallel multi-category queries
    const queryPromises = placeCategoriesToQuery.map((cat) =>
      searchRealPlaces({
        query: textQuery || destinationName,
        latitude,
        longitude,
        category: cat,
        radiusMeters,
        maxResults: 15,
      })
    );

    const settled = await Promise.allSettled(queryPromises);

    settled.forEach((res) => {
      if (res.status === "fulfilled" && res.value?.places) {
        res.value.places.forEach((p) => {
          if (!fetchedMap.has(p.placeId)) {
            fetchedMap.set(p.placeId, p);
          }
        });
      }
    });

    // 3. Process each place: Calculate Distance and YATRIK Hidden Gem Score
    allPlaces = Array.from(fetchedMap.values()).map((p) => {
      const distance = calculateHaversineDistanceKm(
        latitude,
        longitude,
        p.latitude,
        p.longitude
      );
      const hiddenGemEval = calculateHiddenGemScore(p, distance);

      return {
        ...p,
        distanceKm: distance,
        hiddenGemEvaluation: hiddenGemEval,
        displayCategory: p.category.replace(/_/g, " "),
        source: "Google Places API (New)",
      };
    });

    if (allPlaces.length > 0) {
      if (exploreCache.size > 150) exploreCache.clear();
      exploreCache.set(cacheKey, { data: allPlaces, timestamp: Date.now() });
    }
  }

  // 4. Apply Dynamic Filters
  let filtered = allPlaces.filter((p) => {
    // Min Rating Filter
    if (minRating > 0 && (p.rating === undefined || p.rating < minRating)) {
      return false;
    }
    // Open Now Filter
    if (openNow && p.openNow === false) {
      return false;
    }
    // Price Level Filter
    if (priceLevel && priceLevel !== "all") {
      if (p.priceLevel && !p.priceLevel.toLowerCase().includes(priceLevel.toLowerCase())) {
        return false;
      }
    }
    // Category Filter (if explicit and not 'all')
    if (category === "hidden-gems") {
      return p.hiddenGemEvaluation.isHiddenGem;
    }

    return true;
  });

  // 5. Apply Multi-Mode Sorting
  filtered.sort((a, b) => {
    switch (sort) {
      case "hidden_gem":
        return b.hiddenGemEvaluation.score - a.hiddenGemEvaluation.score;
      case "rating":
        return (b.rating ?? 0) - (a.rating ?? 0);
      case "distance":
        return (a.distanceKm ?? 0) - (b.distanceKm ?? 0);
      case "popularity":
        return (b.userRatingCount ?? 0) - (a.userRatingCount ?? 0);
      case "price":
        return (a.priceLevel || "").localeCompare(b.priceLevel || "");
      case "recommended":
      default: {
        // Balanced score: Rating (50%) + Hidden Gem appeal (30%) + Proximity (20%)
        const aScore =
          (a.rating ?? 4.0) * 12 +
          a.hiddenGemEvaluation.score * 0.3 -
          Math.min(20, a.distanceKm ?? 5);
        const bScore =
          (b.rating ?? 4.0) * 12 +
          b.hiddenGemEvaluation.score * 0.3 -
          Math.min(20, b.distanceKm ?? 5);
        return bScore - aScore;
      }
    }
  });

  // 6. Pagination (20 per page default)
  const total = filtered.length;
  const startIndex = (page - 1) * limit;
  const paginatedPlaces = filtered.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < total;

  return {
    places: paginatedPlaces,
    total,
    page,
    limit,
    hasMore,
    destination: {
      name: destinationName || "Selected Area",
      latitude,
      longitude,
    },
    appliedCategory: category,
    appliedSort: sort,
    source: "YATRIK Dynamic Explore Engine",
  };
}
