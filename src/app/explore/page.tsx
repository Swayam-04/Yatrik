"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import {
  Sparkles,
  MapPin,
  Search,
  Filter,
  SlidersHorizontal,
  Compass,
  Star,
  Clock,
  Heart,
  Layers,
  ArrowUpDown,
  RefreshCw,
  Eye,
  Loader2,
  ChevronDown,
  Navigation,
} from "lucide-react";
import { MapboxSearchBox, SelectedLocation } from "@/components/mapbox/MapboxSearchBox";
import { MapboxMapContainer, MapMarkerItem } from "@/components/mapbox/MapboxMapContainer";
import { ExplorePlaceCard } from "@/components/explore/ExplorePlaceCard";
import { PlaceDetailsModal } from "@/components/explore/PlaceDetailsModal";
import type { ExplorePlaceItem, ExploreResponse } from "@/services/explore.service";

// 22 Dynamic Categories
const EXPLORE_CATEGORIES = [
  { id: "all", label: "All Places", icon: "🌐" },
  { id: "hidden-gems", label: "Hidden Gems", icon: "✨" },
  { id: "attractions", label: "Attractions", icon: "🏛️" },
  { id: "nature", label: "Nature", icon: "🌲" },
  { id: "historical", label: "Historical", icon: "🏰" },
  { id: "cultural", label: "Cultural", icon: "🎭" },
  { id: "temples", label: "Temples", icon: "🛕" },
  { id: "museums", label: "Museums", icon: "🖼️" },
  { id: "viewpoints", label: "Viewpoints", icon: "🌄" },
  { id: "beaches", label: "Beaches", icon: "🏖️" },
  { id: "waterfalls", label: "Waterfalls", icon: "🌊" },
  { id: "parks", label: "Parks", icon: "🌳" },
  { id: "cafes", label: "Cafes", icon: "☕" },
  { id: "restaurants", label: "Restaurants", icon: "🍽️" },
  { id: "local-food", label: "Local Food", icon: "🍲" },
  { id: "markets", label: "Markets", icon: "🛍️" },
  { id: "shopping", label: "Shopping", icon: "🏬" },
  { id: "activities", label: "Activities", icon: "🎯" },
  { id: "adventure", label: "Adventure", icon: "🧗" },
  { id: "photography", label: "Photography", icon: "📸" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧" },
  { id: "nightlife", label: "Nightlife", icon: "🍸" },
];

export default function ExplorePage() {
  // Current active location (Defaults to Bhubaneswar or user choice, 100% dynamic)
  const [currentLocation, setCurrentLocation] = useState<SelectedLocation>({
    name: "Bhubaneswar",
    formattedAddress: "Bhubaneswar, Odisha, India",
    latitude: 20.2961,
    longitude: 85.8245,
    country: "India",
    region: "Odisha",
    city: "Bhubaneswar",
    mapboxPlaceId: "default-bhubaneswar",
  });

  // Query & Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("hidden-gems");
  const [sortBy, setSortBy] = useState<
    "recommended" | "hidden_gem" | "rating" | "distance" | "popularity" | "price"
  >("hidden_gem");
  const [radiusKm, setRadiusKm] = useState(15);
  const [minRating, setMinRating] = useState(0);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState("all");

  // UI View Modes
  const [viewMode, setViewMode] = useState<"grid" | "split">("grid");
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Places Data
  const [places, setPlaces] = useState<ExplorePlaceItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selected place for modal
  const [selectedPlace, setSelectedPlace] = useState<ExplorePlaceItem | null>(null);

  // Saved bookmarks
  const [savedPlaceIds, setSavedPlaceIds] = useState<string[]>([]);

  // Load saved bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("yatrik_saved_places");
      if (stored) setSavedPlaceIds(JSON.parse(stored));
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleToggleSave = (place: ExplorePlaceItem) => {
    setSavedPlaceIds((prev) => {
      const updated = prev.includes(place.placeId)
        ? prev.filter((id) => id !== place.placeId)
        : [...prev, place.placeId];
      try {
        localStorage.setItem("yatrik_saved_places", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Fetch places from GET /api/explore
  const fetchPlaces = useCallback(
    async (pageNum = 1, append = false) => {
      if (pageNum === 1) {
        setIsLoading(true);
      } else {
        setIsLoadingMore(true);
      }
      setError(null);

      try {
        const params = new URLSearchParams({
          lat: currentLocation.latitude.toString(),
          lng: currentLocation.longitude.toString(),
          destination: currentLocation.name,
          radius: (radiusKm * 1000).toString(),
          category: activeCategory,
          sort: sortBy,
          page: pageNum.toString(),
          limit: "20",
        });

        if (searchQuery.trim()) {
          params.append("query", searchQuery.trim());
        }
        if (minRating > 0) {
          params.append("minRating", minRating.toString());
        }
        if (openNowOnly) {
          params.append("openNow", "true");
        }
        if (priceFilter !== "all") {
          params.append("priceLevel", priceFilter);
        }

        const res = await fetch(`/api/explore?${params.toString()}`);
        if (!res.ok) {
          throw new Error(`Failed to load places (${res.status})`);
        }

        const data: ExploreResponse = await res.json();

        if (append) {
          setPlaces((prev) => [...prev, ...data.places]);
        } else {
          setPlaces(data.places);
        }
        setTotalCount(data.total);
        setHasMore(data.hasMore);
        setPage(pageNum);
      } catch (err: any) {
        console.error("Error fetching explore places:", err);
        setError(err.message || "Failed to retrieve real places");
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [
      currentLocation,
      radiusKm,
      activeCategory,
      sortBy,
      searchQuery,
      minRating,
      openNowOnly,
      priceFilter,
    ]
  );

  // Trigger search on filter / location changes
  useEffect(() => {
    fetchPlaces(1, false);
  }, [fetchPlaces]);

  // Handle location selection from MapboxSearchBox
  const handleLocationSelect = (loc: SelectedLocation) => {
    setCurrentLocation(loc);
  };

  // Convert places to map markers for MapboxMapContainer
  const mapMarkers: MapMarkerItem[] = places.map((p) => ({
    id: p.placeId,
    name: p.name,
    latitude: p.latitude,
    longitude: p.longitude,
    category: p.category,
    rating: p.rating,
    address: p.address,
    photoUrl: p.photos?.[0],
    openNow: p.openNow,
  }));

  return (
    <div className="space-y-8 pb-20">
      {/* Editorial Header & Search Banner */}
      <div className="space-y-6 text-center max-w-4xl mx-auto pt-4 px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-[11px] font-extrabold uppercase tracking-widest animate-float">
          <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span>Global Real-Time Discovery Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none">
          Explore Any Destination & <br />
          <span className="text-gradient">Real Hidden Gems</span>
        </h1>

        <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-2xl mx-auto">
          Search anywhere on Earth. Powered by real live POI data, Google Places New, and YATRIK’s
          intelligent Hidden Gem ranking algorithms.
        </p>

        {/* Global Location Autocomplete Search Box */}
        <div className="max-w-2xl mx-auto text-left">
          <label className="block text-xs font-semibold text-gray-400 mb-2 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Search Any Location Worldwide:</span>
          </label>
          <MapboxSearchBox
            onLocationSelect={handleLocationSelect}
            placeholder="Type any city, attraction, address (e.g. Paris, Tokyo, Bhubaneswar, Koraput)..."
            defaultValue={currentLocation.formattedAddress}
            className="w-full shadow-2xl"
          />
        </div>
      </div>

      {/* Floating Active Location Badge */}
      <div className="max-w-4xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl glass-panel border border-white/10 bg-[#090d16]/80 text-xs">
        <div className="flex items-center gap-2 text-gray-300">
          <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
          <span>
            Exploring around:{" "}
            <strong className="text-white font-bold">{currentLocation.name}</strong>{" "}
            <span className="text-gray-400">({currentLocation.region || currentLocation.country})</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 font-bold text-[11px]">
            {totalCount} Real Places Found
          </span>
          <button
            onClick={() => fetchPlaces(1, false)}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            title="Refresh Places"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Natural Search & Quick Filter Bar */}
      <div className="max-w-7xl mx-auto px-4 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Natural language query input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder='Try "hidden gems in Bhubaneswar", "secret cafes", "scenic viewpoints"...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchPlaces(1, false);
              }}
              className="w-full pl-10 pr-24 py-3 rounded-2xl text-xs glass-input focus:ring-1 focus:ring-indigo-500 border border-white/10 bg-[#090d16]/80 text-white placeholder-gray-500"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  fetchPlaces(1, false);
                }}
                className="absolute right-14 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 hover:text-white"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => fetchPlaces(1, false)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition-all"
            >
              Search
            </button>
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none pl-8 pr-8 py-3 rounded-2xl bg-[#090d16]/90 border border-white/10 text-xs font-bold text-gray-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="hidden_gem">Sort: YATRIK Hidden Gem Score</option>
                <option value="recommended">Sort: Recommended</option>
                <option value="rating">Sort: Highest Rating</option>
                <option value="distance">Sort: Nearest Distance</option>
                <option value="popularity">Sort: Most Reviews</option>
                <option value="price">Sort: Price Level</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFiltersModal(!showFiltersModal)}
              className={`px-3.5 py-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                showFiltersModal || minRating > 0 || openNowOnly || priceFilter !== "all"
                  ? "bg-indigo-600/30 border-indigo-500/50 text-indigo-300"
                  : "bg-[#090d16]/80 border-white/10 text-gray-300 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {/* View Mode Toggle (Grid vs Split Map) */}
            <div className="hidden lg:flex items-center rounded-2xl border border-white/10 bg-[#090d16]/80 p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "grid"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "split"
                    ? "bg-indigo-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Map Split
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {showFiltersModal && (
          <div className="p-4 rounded-2xl glass-panel border border-white/10 bg-[#090d16]/95 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-150">
            {/* Radius Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300 flex justify-between">
                <span>Search Radius</span>
                <span className="text-indigo-400">{radiusKm} km</span>
              </label>
              <input
                type="range"
                min="2"
                max="50"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Minimum Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">Min Rating</label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              >
                <option value="0">Any Rating</option>
                <option value="4.0">⭐ 4.0 & above</option>
                <option value="4.5">⭐ 4.5 & above (Top Rated)</option>
                <option value="4.8">⭐ 4.8 & above (Exceptional)</option>
              </select>
            </div>

            {/* Price Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-300">Price Level</label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white"
              >
                <option value="all">All Prices</option>
                <option value="PRICE_LEVEL_INEXPENSIVE">$ / ₹ (Budget)</option>
                <option value="PRICE_LEVEL_MODERATE">$$ / ₹₹ (Moderate)</option>
                <option value="PRICE_LEVEL_EXPENSIVE">$$$ / ₹₹₹ (Premium)</option>
              </select>
            </div>

            {/* Open Now Toggle */}
            <div className="flex items-center justify-between sm:justify-center gap-3 pt-4">
              <label className="text-xs font-bold text-gray-300 cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={openNowOnly}
                  onChange={(e) => setOpenNowOnly(e.target.checked)}
                  className="rounded accent-indigo-500 w-4 h-4 cursor-pointer"
                />
                <span>Open Now Only</span>
              </label>
              <button
                onClick={() => {
                  setRadiusKm(15);
                  setMinRating(0);
                  setOpenNowOnly(false);
                  setPriceFilter("all");
                }}
                className="text-xs text-gray-400 hover:text-white underline underline-offset-4"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* 22 Dynamic Category Badges Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 custom-scrollbar">
          {EXPLORE_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 via-pink-600 to-amber-600 text-white shadow-glow border border-indigo-500/30 scale-105"
                    : "bg-[#090d16]/80 text-gray-400 hover:text-white border border-white/10 hover:border-white/20"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area (Grid or Split View) */}
      <div className="max-w-7xl mx-auto px-4">
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl glass-panel border border-white/5 p-4 space-y-3 animate-pulse bg-white/5"
              >
                <div className="h-44 bg-white/10 rounded-xl" />
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
                <div className="h-8 bg-white/10 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="p-12 text-center glass-panel border border-white/10 rounded-3xl max-w-lg mx-auto space-y-4">
            <Eye className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">Discovery Unavailable</h3>
            <p className="text-xs text-gray-400">{error}</p>
            <button
              onClick={() => fetchPlaces(1, false)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
            >
              Retry
            </button>
          </div>
        ) : places.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center glass-panel border border-white/10 rounded-3xl max-w-lg mx-auto space-y-4">
            <Compass className="w-12 h-12 text-gray-600 mx-auto animate-pulse" />
            <h3 className="text-lg font-bold text-white">No Places Found</h3>
            <p className="text-xs text-gray-400">
              No matching locations found for {currentLocation.name} in category &quot;
              {activeCategory}&quot;. Try broadening your radius or switching category.
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
                setRadiusKm(30);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
            >
              Reset to All Places
            </button>
          </div>
        ) : viewMode === "split" ? (
          /* Split View: Left List, Right Map */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-6 space-y-4 max-h-[85vh] overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {places.map((place) => (
                  <ExplorePlaceCard
                    key={place.placeId}
                    place={place}
                    onSelect={(p) => setSelectedPlace(p)}
                    isSaved={savedPlaceIds.includes(place.placeId)}
                    onToggleSave={handleToggleSave}
                  />
                ))}
              </div>
              {hasMore && (
                <div className="pt-4 text-center">
                  <button
                    onClick={() => fetchPlaces(page + 1, true)}
                    disabled={isLoadingMore}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
                  >
                    {isLoadingMore ? "Loading..." : "Load More Places"}
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-6 sticky top-24 h-[80vh] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <MapboxMapContainer
                center={{ lat: currentLocation.latitude, lng: currentLocation.longitude }}
                zoom={12}
                destinationName={currentLocation.name}
                markers={mapMarkers}
                onSelectMarker={(m) => {
                  const found = places.find((p) => p.placeId === m.id);
                  if (found) setSelectedPlace(found);
                }}
                className="h-full w-full"
              />
            </div>
          </div>
        ) : (
          /* Standard Responsive Grid View */
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {places.map((place) => (
                <ExplorePlaceCard
                  key={place.placeId}
                  place={place}
                  onSelect={(p) => setSelectedPlace(p)}
                  isSaved={savedPlaceIds.includes(place.placeId)}
                  onToggleSave={handleToggleSave}
                />
              ))}
            </div>

            {/* Pagination Load More */}
            {hasMore && (
              <div className="text-center pt-6">
                <button
                  onClick={() => fetchPlaces(page + 1, true)}
                  disabled={isLoadingMore}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-sm font-bold shadow-glow border border-indigo-500/30 transition-all disabled:opacity-50 inline-flex items-center gap-2"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading more places...</span>
                    </>
                  ) : (
                    <span>Load 20 More Places ({places.length} of {totalCount})</span>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Place Details & Gemma 4 AI Modal */}
      <PlaceDetailsModal
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
        isSaved={selectedPlace ? savedPlaceIds.includes(selectedPlace.placeId) : false}
        onToggleSave={handleToggleSave}
      />
    </div>
  );
}
