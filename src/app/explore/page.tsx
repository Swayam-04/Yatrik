"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Sparkles,
  MapPin,
  Search,
  SlidersHorizontal,
  Compass,
  ArrowUpDown,
  RefreshCw,
  Eye,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { MapboxSearchBox, SelectedLocation } from "@/components/mapbox/MapboxSearchBox";
import { MapboxMapContainer, MapMarkerItem } from "@/components/mapbox/MapboxMapContainer";
import { ExplorePlaceCard } from "@/components/explore/ExplorePlaceCard";
import { PlaceDetailsModal } from "@/components/explore/PlaceDetailsModal";
import type { ExplorePlaceItem, ExploreResponse } from "@/services/explore.service";

// Travel Categories with popular ones prioritized
const EXPLORE_CATEGORIES = [
  { id: "nature", label: "Nature", icon: "🌲" },
  { id: "cultural", label: "Culture", icon: "🎭" },
  { id: "local-food", label: "Food", icon: "🍜" },
  { id: "adventure", label: "Adventure", icon: "🧗" },
  { id: "hidden-gems", label: "Hidden Gems", icon: "✨" },
  { id: "beaches", label: "Beaches", icon: "🏖️" },
  { id: "historical", label: "History", icon: "🏰" },
  { id: "photography", label: "Photography", icon: "📸" },
  { id: "all", label: "All Places", icon: "🌐" },
  { id: "attractions", label: "Attractions", icon: "🏛️" },
  { id: "viewpoints", label: "Viewpoints", icon: "🌄" },
  { id: "cafes", label: "Cafes", icon: "☕" },
  { id: "restaurants", label: "Restaurants", icon: "🍽️" },
  { id: "temples", label: "Temples", icon: "🛕" },
  { id: "museums", label: "Museums", icon: "🖼️" },
  { id: "waterfalls", label: "Waterfalls", icon: "🌊" },
  { id: "parks", label: "Parks", icon: "🌳" },
  { id: "markets", label: "Markets", icon: "🛍️" },
  { id: "shopping", label: "Shopping", icon: "🏬" },
  { id: "activities", label: "Activities", icon: "🎯" },
  { id: "family", label: "Family", icon: "👨‍👩‍👧" },
  { id: "nightlife", label: "Nightlife", icon: "🍸" },
];

export default function ExplorePage() {
  // Current active location (Defaults to dynamic search)
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
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedPlaceIds(parsed.map((p: any) => p.placeId || p.id));
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save / Bookmark handler
  const handleToggleSave = (place: ExplorePlaceItem) => {
    try {
      const stored = localStorage.getItem("yatrik_saved_places");
      let list = stored ? JSON.parse(stored) : [];
      const exists = list.some((p: any) => (p.placeId || p.id) === place.placeId);

      if (exists) {
        list = list.filter((p: any) => (p.placeId || p.id) !== place.placeId);
      } else {
        list.push({
          id: place.placeId,
          placeId: place.placeId,
          name: place.name,
          address: place.address,
          category: place.category,
          rating: place.rating,
          photoUrl: place.photos?.[0],
          photos: place.photos,
          summary: place.summary,
          latitude: place.latitude,
          longitude: place.longitude,
          hiddenGemEvaluation: place.hiddenGemEvaluation,
          savedAt: new Date().toISOString(),
        });
      }

      localStorage.setItem("yatrik_saved_places", JSON.stringify(list));
      setSavedPlaceIds(list.map((p: any) => p.placeId || p.id));
    } catch {
      // ignore
    }
  };

  // Fetch explore places dynamically
  const fetchPlaces = useCallback(
    async (targetPage = 1, append = false) => {
      if (targetPage === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      setError(null);

      try {
        const params = new URLSearchParams({
          lat: String(currentLocation.latitude),
          lng: String(currentLocation.longitude),
          radius: String(radiusKm),
          category: activeCategory,
          sort: sortBy,
          page: String(targetPage),
          limit: "20",
          destination: currentLocation.name,
        });

        if (searchQuery.trim()) {
          params.set("q", searchQuery.trim());
        }
        if (minRating > 0) {
          params.set("minRating", String(minRating));
        }
        if (openNowOnly) {
          params.set("openNow", "true");
        }
        if (priceFilter !== "all") {
          params.set("priceLevel", priceFilter);
        }

        const res = await fetch(`/api/explore?${params.toString()}`);
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Failed to fetch places (${res.status})`);
        }

        const data: ExploreResponse = await res.json();

        if (append) {
          setPlaces((prev) => [...prev, ...data.places]);
        } else {
          setPlaces(data.places);
        }

        setTotalCount(data.total ?? 0);
        setHasMore(data.hasMore);
        setPage(targetPage);
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
      {/* 1. Centerpiece Travel Hero Section */}
      <div className="space-y-6 text-center max-w-4xl mx-auto pt-6 px-4">
        {/* Travel Intelligence Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#14B8A6]/15 border border-[#14B8A6]/30 text-[#38BDF8] text-[11px] font-extrabold uppercase tracking-widest animate-float shadow-[0_0_15px_rgba(20,184,166,0.25)]">
          <Compass className="w-3.5 h-3.5 text-[#14B8A6] animate-pulse" />
          <span>Global Real-Time Discovery Engine</span>
        </div>

        {/* Editorial Heading */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
          Where will you <br className="hidden sm:inline" />
          <span className="text-gradient-ocean">explore next?</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
          Discover places worth remembering. Search any city, landmark, or hidden gem with real-time POI data.
        </p>

        {/* Large Destination Search Bar */}
        <div className="max-w-2xl mx-auto text-left space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#14B8A6]" />
            <span>Search Any Location Worldwide:</span>
          </label>
          <MapboxSearchBox
            onLocationSelect={handleLocationSelect}
            placeholder="Search a city, landmark, hidden gem..."
            defaultValue={currentLocation.formattedAddress}
            className="w-full shadow-2xl"
          />
        </div>

        {/* Popular Categories: Rounded Travel Chips below search */}
        <div className="pt-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Popular Travel Categories
          </p>
          <div className="flex items-center justify-center flex-wrap gap-2 max-w-3xl mx-auto">
            {EXPLORE_CATEGORIES.slice(0, 8).map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-[#0E7490] to-[#14B8A6] text-white shadow-[0_0_15px_rgba(20,184,166,0.35)] border border-[#38BDF8] scale-105"
                      : "bg-[#071A2B]/80 text-slate-300 hover:text-white border border-[#0E7490]/30 hover:border-[#14B8A6]/50 hover:bg-[#0E7490]/15"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Floating Active Location Card */}
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-panel border border-[#0E7490]/25 bg-[#071A2B]/80 text-xs shadow-lg">
          <div className="flex items-center gap-2.5 text-slate-300">
            <div className="w-7 h-7 rounded-lg bg-[#0E7490]/25 border border-[#14B8A6]/30 flex items-center justify-center text-[#14B8A6] shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <span>
              Exploring around:{" "}
              <strong className="text-white font-bold text-sm">{currentLocation.name}</strong>{" "}
              <span className="text-slate-400">
                ({currentLocation.region || currentLocation.country})
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl bg-[#0E7490]/25 border border-[#14B8A6]/35 text-[#38BDF8] font-bold text-[11px]">
              {totalCount} Real Places Discovered
            </span>
            <button
              onClick={() => fetchPlaces(1, false)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-[#0E7490]/25 transition-colors"
              title="Refresh Places"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-[#14B8A6]" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Search Bar, Sort, View Controls */}
      <div className="max-w-7xl mx-auto px-4 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Natural Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder='Try "scenic viewpoints", "artisan cafes", "hidden trails"...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchPlaces(1, false);
              }}
              className="w-full pl-10 pr-24 py-3 rounded-2xl text-xs glass-input focus:ring-1 focus:ring-[#14B8A6] border border-[#0E7490]/25 bg-[#030F1A]/70 text-white placeholder-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  fetchPlaces(1, false);
                }}
                className="absolute right-16 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-white"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => fetchPlaces(1, false)}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#0E7490] to-[#14B8A6] hover:from-[#0E7490]/90 hover:to-[#14B8A6]/90 text-white text-[11px] font-bold shadow-[0_0_10px_rgba(20,184,166,0.3)] transition-all"
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
                className="appearance-none pl-8 pr-8 py-3 rounded-2xl bg-[#071A2B] border border-[#0E7490]/30 text-xs font-bold text-slate-200 focus:outline-none focus:border-[#14B8A6]"
              >
                <option value="hidden_gem">Sort: YATRIK Hidden Gem Score</option>
                <option value="recommended">Sort: Recommended</option>
                <option value="rating">Sort: Highest Rating</option>
                <option value="distance">Sort: Nearest Distance</option>
                <option value="popularity">Sort: Most Reviews</option>
                <option value="price">Sort: Price Level</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFiltersModal(!showFiltersModal)}
              className={`px-3.5 py-3 rounded-2xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                showFiltersModal || minRating > 0 || openNowOnly || priceFilter !== "all"
                  ? "bg-[#0E7490]/30 border-[#14B8A6]/50 text-[#38BDF8]"
                  : "bg-[#071A2B] border-[#0E7490]/30 text-slate-300 hover:text-white"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            {/* View Mode Toggle (Grid vs Split Map) */}
            <div className="hidden lg:flex items-center rounded-2xl border border-[#0E7490]/30 bg-[#071A2B] p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "grid"
                    ? "bg-gradient-to-r from-[#0E7490] to-[#14B8A6] text-white shadow-[0_0_10px_rgba(20,184,166,0.25)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("split")}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === "split"
                    ? "bg-gradient-to-r from-[#0E7490] to-[#14B8A6] text-white shadow-[0_0_10px_rgba(20,184,166,0.25)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Map Split
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {showFiltersModal && (
          <div className="p-4 rounded-2xl glass-panel border border-[#0E7490]/30 bg-[#071A2B]/95 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-150">
            {/* Radius Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex justify-between">
                <span>Search Radius</span>
                <span className="text-[#38BDF8]">{radiusKm} km</span>
              </label>
              <input
                type="range"
                min="2"
                max="50"
                step="1"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-[#14B8A6] cursor-pointer"
              />
            </div>

            {/* Min Rating Filter */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 flex justify-between">
                <span>Min Rating</span>
                <span className="text-[#FBBF24]">
                  {minRating > 0 ? `★ ${minRating.toFixed(1)}+` : "Any"}
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="4.5"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full accent-[#F59E0B] cursor-pointer"
              />
            </div>

            {/* Price Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">Price Level</label>
              <select
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#030F1A] border border-[#0E7490]/30 text-xs text-white"
              >
                <option value="all">All Prices</option>
                <option value="PRICE_LEVEL_INEXPENSIVE">$ / ₹ (Budget)</option>
                <option value="PRICE_LEVEL_MODERATE">$$ / ₹₹ (Moderate)</option>
                <option value="PRICE_LEVEL_EXPENSIVE">$$$ / ₹₹₹ (Premium)</option>
              </select>
            </div>

            {/* Open Now Toggle */}
            <div className="flex items-center justify-between sm:justify-center gap-3 pt-4">
              <label className="text-xs font-bold text-slate-300 cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={openNowOnly}
                  onChange={(e) => setOpenNowOnly(e.target.checked)}
                  className="rounded accent-[#14B8A6] w-4 h-4 cursor-pointer"
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
                className="text-xs text-slate-400 hover:text-white underline underline-offset-4"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* All Dynamic Categories Scroller */}
        <div className="flex items-center gap-2 overflow-x-auto py-2 custom-scrollbar">
          {EXPLORE_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-[#0E7490] to-[#14B8A6] text-white shadow-[0_0_12px_rgba(20,184,166,0.35)] border border-[#38BDF8] scale-105"
                    : "bg-[#071A2B]/85 text-slate-400 hover:text-white border border-[#0E7490]/25 hover:border-[#14B8A6]/40"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Main Content Area (Grid or Split View) */}
      <div className="max-w-7xl mx-auto px-4">
        {isLoading ? (
          /* Loading Skeletons */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl glass-panel border border-[#0E7490]/20 p-4 space-y-3 animate-pulse bg-[#071A2B]/60"
              >
                <div className="h-44 bg-white/5 rounded-xl" />
                <div className="h-4 bg-white/5 rounded w-3/4" />
                <div className="h-3 bg-white/5 rounded w-1/2" />
                <div className="h-8 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          /* Error State */
          <div className="p-12 text-center glass-panel border border-[#0E7490]/25 rounded-3xl max-w-lg mx-auto space-y-4 bg-[#071A2B]/90">
            <Eye className="w-12 h-12 text-rose-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Discovery Unavailable</h3>
            <p className="text-xs text-slate-400">{error}</p>
            <button
              onClick={() => fetchPlaces(1, false)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0E7490] to-[#14B8A6] text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(20,184,166,0.3)]"
            >
              Retry
            </button>
          </div>
        ) : places.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center glass-panel border border-[#0E7490]/25 rounded-3xl max-w-lg mx-auto space-y-4 bg-[#071A2B]/90">
            <Compass className="w-12 h-12 text-slate-500 mx-auto animate-pulse" />
            <h3 className="text-lg font-bold text-white">No Places Found</h3>
            <p className="text-xs text-slate-400">
              No matching destinations found for {currentLocation.name} in category &quot;
              {activeCategory}&quot;. Try broadening your radius or switching category.
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
                setRadiusKm(30);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0E7490] to-[#14B8A6] text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(20,184,166,0.3)]"
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
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0E7490] to-[#14B8A6] text-white text-xs font-bold shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all"
                  >
                    {isLoadingMore ? "Loading..." : "Load More Places"}
                  </button>
                </div>
              )}
            </div>

            <div className="lg:col-span-6 sticky top-24 h-[80vh] rounded-3xl overflow-hidden border border-[#0E7490]/30 shadow-2xl">
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
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#0E7490] to-[#14B8A6] hover:from-[#0E7490]/90 hover:to-[#14B8A6]/90 text-white text-sm font-bold shadow-[0_0_20px_rgba(20,184,166,0.3)] border border-[#38BDF8]/40 transition-all disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
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
