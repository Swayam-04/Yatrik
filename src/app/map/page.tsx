"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Compass, 
  Search, 
  RefreshCw, 
  Car, 
  ShieldCheck, 
  Navigation, 
  PhoneCall, 
  Flame, 
  Radio, 
  Layers,
  Globe,
  MapPin,
  Heart,
  Eye,
  Sliders,
  HelpCircle,
  Activity,
  Locate
} from "lucide-react";
import { GoogleMapContainer, SafetyMarker } from "@/components/google-map/GoogleMapContainer";
import { GlobalGoogleSearchBar } from "@/components/google-map/GlobalGoogleSearchBar";
import { GoogleRouteComparisonCards } from "@/components/google-map/GoogleRouteComparisonCards";
import { GoogleNearbyPlacesFilter } from "@/components/google-map/GoogleNearbyPlacesFilter";
import { CircularSafetyMeter } from "@/components/map/CircularSafetyMeter";
import { WomensSafetyToggle } from "@/components/map/WomensSafetyToggle";
import { HeatmapOverlayToggle } from "@/components/map/HeatmapOverlayToggle";
import { MapAiAssistantWidget } from "@/components/map/MapAiAssistantWidget";
import { LiveAlertsFeed } from "@/components/map/LiveAlertsFeed";
import { PlaceBottomSheet, PlaceDetail } from "@/components/map/PlaceBottomSheet";
import { GoogleRouteSummary } from "@/app/api/external/google-routes/route";

export default function GoogleSafeMapPage() {
  const [selectedRouteId, setSelectedRouteId] = useState<"Fastest" | "Safest" | "Scenic" | "Cheapest">("Fastest");
  const [travelMode, setTravelMode] = useState<"DRIVING" | "WALKING" | "BICYCLING" | "TRANSIT">("DRIVING");
  const [isWomensSafetyEnabled, setIsWomensSafetyEnabled] = useState(true);
  const [activeHeatmaps, setActiveHeatmaps] = useState<string[]>(["Night", "Crowd", "Medical"]);
  const [nearbyCategory, setNearbyCategory] = useState("lodging");

  // Location Coordinates State
  const [searchDestination, setSearchDestination] = useState("");
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [mapZoom, setMapZoom] = useState(2);
  const [isLocationGranted, setIsLocationGranted] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"pending" | "granted" | "denied">("pending");

  const [routes, setRoutes] = useState<GoogleRouteSummary[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<SafetyMarker[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetail | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [activeTabMobile, setActiveTabMobile] = useState<"map" | "dashboard">("map");
  const [dynamicSafetyScore, setDynamicSafetyScore] = useState(95);

  const requestLocationPermission = useCallback(() => {
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setCurrentCoords(coords);
          setMapCenter(coords);
          setMapZoom(13);
          setIsLocationGranted(true);
          setLocationStatus("granted");
          fetchNearbyPlaces(coords.lat, coords.lng, nearbyCategory);
        },
        (err) => {
          console.warn("User denied geolocation permission:", err);
          setIsLocationGranted(false);
          setLocationStatus("denied");
        },
        { timeout: 10000 }
      );
    } else {
      setIsLocationGranted(false);
      setLocationStatus("denied");
    }
  }, [nearbyCategory]);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const fetchNearbyPlaces = async (lat: number, lng: number, category: string) => {
    try {
      const res = await fetch(`/api/external/places?lat=${lat}&lng=${lng}&category=${category}`);
      if (res.ok) {
        const data = await res.json();
        if (data.places && data.places.length > 0) {
          const markers: SafetyMarker[] = data.places.map((p: any) => ({
            id: p.id || `place-${Math.random()}`,
            lat: p.latitude || lat + (Math.random() - 0.5) * 0.02,
            lng: p.longitude || lng + (Math.random() - 0.5) * 0.02,
            title: p.name,
            type: category,
            safetyScore: Math.floor(85 + Math.random() * 14),
            address: p.address,
          }));
          setNearbyPlaces(markers);
        }
      }
    } catch (err) {
      console.error("Error fetching nearby places:", err);
    }
  };

  const fetchGoogleRoutes = async (dest: string, originStr?: string) => {
    if (!dest) return;
    setIsLoadingRoutes(true);
    const start = originStr || (currentCoords ? `${currentCoords.lat},${currentCoords.lng}` : "Current Location");
    try {
      const res = await fetch(`/api/external/google-routes?origin=${encodeURIComponent(start)}&destination=${encodeURIComponent(dest)}&mode=${travelMode}`);
      if (res.ok) {
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          setRoutes(data.routes);
        }
      }
    } catch (err) {
      console.error("Google Routes fetch error:", err);
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  useEffect(() => {
    if (searchDestination) {
      fetchGoogleRoutes(searchDestination);
    }
  }, [travelMode]);

  const handleSelectGlobalPlace = async (place: { description: string; placeId?: string; lat?: number; lng?: number }) => {
    setSearchDestination(place.description);

    let lat = place.lat;
    let lng = place.lng;

    if (!lat || !lng) {
      try {
        const res = await fetch(`/api/external/places/details?query=${encodeURIComponent(place.description)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.place) {
            lat = data.place.lat;
            lng = data.place.lng;
          }
        }
      } catch (err) {
        console.error("Error fetching details:", err);
      }
    }

    if (lat && lng) {
      setMapCenter({ lat, lng });
      setMapZoom(14);
      fetchNearbyPlaces(lat, lng, nearbyCategory);
      const computedScore = Math.min(99, Math.max(72, Math.floor(84 + (Math.sin(lat + lng) * 14))));
      setDynamicSafetyScore(computedScore);
    }

    fetchGoogleRoutes(place.description);
  };

  const handleSelectCategory = (catId: string) => {
    setNearbyCategory(catId);
    if (mapCenter) {
      fetchNearbyPlaces(mapCenter.lat, mapCenter.lng, catId);
    }
  };

  const handleToggleHeatmap = (id: string) => {
    if (activeHeatmaps.includes(id)) {
      setActiveHeatmaps(activeHeatmaps.filter((h) => h !== id));
    } else {
      setActiveHeatmaps([...activeHeatmaps, id]);
    }
  };

  const currentRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* 1. Header Control Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/75">
        <div className="space-y-1 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            <span>Mapbox & Google Places Integrated</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">YATRIK Full-Screen Map</h1>
        </div>

        {/* Global Google Search & Travel mode */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          {/* Mode Selector */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold">
            {(["DRIVING", "WALKING", "BICYCLING", "TRANSIT"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setTravelMode(m)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  travelMode === m ? "bg-indigo-600 text-white shadow-glow" : "text-gray-400 hover:text-white"
                }`}
              >
                {m.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="w-full sm:w-80">
            <GlobalGoogleSearchBar
              onSelectPlace={handleSelectGlobalPlace}
              placeholder="Search cities, landmarks, airports..."
            />
          </div>
        </div>
      </div>

      {/* Geolocation Alert Banner */}
      {locationStatus === "denied" && !searchDestination && (
        <div className="popup-banner p-4 text-xs text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-glow">
          <div className="flex items-center gap-2 text-left">
            <Globe className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Location permission disabled. Showing world view. Use the search bar above to look up any destination.</span>
          </div>
          <button
            onClick={requestLocationPermission}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-bg font-extrabold text-[10px] uppercase tracking-wide shrink-0 transition-colors"
          >
            Request Permission
          </button>
        </div>
      )}

      {/* Mobile Tab Toggle */}
      <div className="flex lg:hidden rounded-2xl p-1 bg-white/5 border border-white/10 text-xs font-bold">
        <button
          onClick={() => setActiveTabMobile("map")}
          className={`flex-1 py-2.5 rounded-xl transition-colors ${
            activeTabMobile === "map" ? "bg-indigo-600 text-white" : "text-gray-400"
          }`}
        >
          Google Map Canvas
        </button>
        <button
          onClick={() => setActiveTabMobile("dashboard")}
          className={`flex-1 py-2.5 rounded-xl transition-colors ${
            activeTabMobile === "dashboard" ? "bg-indigo-600 text-white" : "text-gray-400"
          }`}
        >
          Safety Settings
        </button>
      </div>

      {/* Two Column Board Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (Safety and Filters sidebar) */}
        <div className={`lg:col-span-4 space-y-6 ${activeTabMobile === "map" ? "hidden lg:block animate-in slide-in-from-left duration-300" : "block"}`}>
          {/* Circular Safety Meter */}
          <CircularSafetyMeter
            score={isWomensSafetyEnabled ? dynamicSafetyScore : dynamicSafetyScore - 4}
            metrics={{
              crimeRisk: 94,
              lighting: isWomensSafetyEnabled ? 98 : 88,
              crowdDensity: 82,
              womensSafety: dynamicSafetyScore,
              emergencyAvailability: 92,
              medicalAccess: 88,
            }}
          />

          {/* Women's Safety Toggle */}
          <WomensSafetyToggle
            isEnabled={isWomensSafetyEnabled}
            onToggle={(val) => setIsWomensSafetyEnabled(val)}
          />

          {/* Nearby Google Places Filter */}
          <GoogleNearbyPlacesFilter
            selectedCategory={nearbyCategory}
            onSelectCategory={handleSelectCategory}
          />

          {/* Google Route Comparison Cards */}
          {routes.length > 0 && (
            <GoogleRouteComparisonCards
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
            />
          )}

          {/* Heatmap Layer Controls */}
          <HeatmapOverlayToggle
            activeHeatmaps={activeHeatmaps}
            onToggleHeatmap={handleToggleHeatmap}
          />

          {/* Map AI Assistant */}
          <MapAiAssistantWidget />

          {/* Live Alerts Feed */}
          <LiveAlertsFeed />
        </div>

        {/* Right Column (Large Map Canvas) */}
        <div className={`lg:col-span-8 space-y-6 ${activeTabMobile === "dashboard" ? "hidden lg:block" : "block"}`}>
          <div className="rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl relative">
            <GoogleMapContainer
              center={mapCenter}
              zoom={mapZoom}
              activePlaceName={searchDestination}
              isLocationGranted={isLocationGranted}
              polylinePath={currentRoute?.polylinePath || []}
              safetyMarkers={nearbyPlaces}
              isWomensSafetyEnabled={isWomensSafetyEnabled}
              onLocateCurrentPosition={requestLocationPermission}
            />
          </div>

          {/* Active Navigation Summary overlay */}
          {currentRoute && (
            <div className="p-5 rounded-3xl glass-panel border border-emerald-500/20 space-y-4 bg-gradient-to-r from-emerald-950/20 via-[#030712] to-dark-bg text-left">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wide">
                    Safe Routing Mode: {currentRoute.title}
                  </span>
                  <h3 className="text-base font-extrabold text-white">{currentRoute.routeSummary}</h3>
                </div>

                <button
                  onClick={() => alert(`Starting Live navigation directions to ${searchDestination || "destination"}!`)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-glow transition-all shrink-0 hover:scale-105"
                >
                  Start Live Navigation
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2 border-t border-white/5">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Distance</span>
                  <p className="font-extrabold text-white text-sm">{currentRoute.distanceKm}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Duration</span>
                  <p className="font-extrabold text-emerald-400 text-sm">{currentRoute.durationMins}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Fuel Predicted</span>
                  <p className="font-extrabold text-amber-400 text-sm">{currentRoute.estimatedFuelLiters} L</p>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Tolls</span>
                  <p className="font-extrabold text-white text-sm">{currentRoute.tollCount > 0 ? `${currentRoute.tollCount} Tolls` : "No Tolls"}</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Detail bottom sheet */}
      <PlaceBottomSheet
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
      />

    </div>
  );
}
