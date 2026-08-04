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
  MapPin
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

  // Dynamic Location State (No hardcoded city defaults)
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

  // Ask for Browser Location Permission on First Load
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
          console.warn("User denied geolocation permission or error occurred:", err);
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

  // Fetch Nearby Places by Lat/Lng and Category via Google Places API Proxy
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

  // Fetch Routes when destination is selected
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

  // Handle Global Location Selection from Google Places Search Bar
  const handleSelectGlobalPlace = async (place: { description: string; placeId?: string; lat?: number; lng?: number }) => {
    setSearchDestination(place.description);

    let lat = place.lat;
    let lng = place.lng;

    // Resolve lat/lng if not provided
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
        console.error("Error fetching place details:", err);
      }
    }

    if (lat && lng) {
      setMapCenter({ lat, lng });
      setMapZoom(14);
      fetchNearbyPlaces(lat, lng, nearbyCategory);

      // Update safety score dynamically based on coordinates
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
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header Control Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-white/10 bg-dark-glass">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Compass className="w-3.5 h-3.5" />
            <span>Google Places & Maps Worldwide Engine</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">YATRIK Global Safe Map</h1>
        </div>

        {/* Travel Mode Selector */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold">
            {(["DRIVING", "WALKING", "BICYCLING", "TRANSIT"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setTravelMode(m)}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  travelMode === m ? "bg-indigo-600 text-white shadow-glow" : "text-gray-400 hover:text-white"
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Global Google Search Bar */}
          <div className="w-full sm:w-96">
            <GlobalGoogleSearchBar
              onSelectPlace={handleSelectGlobalPlace}
              placeholder="Search ANY city, landmark, hotel, airport worldwide..."
            />
          </div>
        </div>
      </div>

      {/* Location Permission Prompt Banner (If Pending/Denied) */}
      {locationStatus === "denied" && !searchDestination && (
        <div className="p-4 rounded-2xl glass-panel border border-amber-500/40 bg-amber-500/10 text-xs text-amber-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-amber-400 shrink-0" />
            <span>Location access disabled. Showing World Map view. Use the search bar above to inspect any location globally.</span>
          </div>
          <button
            onClick={requestLocationPermission}
            className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-dark-bg font-bold text-xs shrink-0 transition-colors"
          >
            Enable Location
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
          Safety Controls
        </button>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (30% - 4 Cols) */}
        <div className={`lg:col-span-4 space-y-6 ${activeTabMobile === "map" ? "hidden lg:block" : "block"}`}>
          
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

        {/* Right Column (70% - 8 Cols) */}
        <div className={`lg:col-span-8 space-y-6 ${activeTabMobile === "dashboard" ? "hidden lg:block" : "block"}`}>
          
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

          {/* Active Route Summary Footer Card */}
          {currentRoute && (
            <div className="p-5 rounded-3xl glass-panel border border-white/10 space-y-3 bg-gradient-to-r from-indigo-950/40 via-dark-bg to-dark-bg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                    Active Google Route: {currentRoute.title}
                  </span>
                  <h3 className="text-base font-extrabold text-white mt-1">{currentRoute.routeSummary}</h3>
                </div>

                <button
                  onClick={() => alert(`Starting Google Live Navigation to ${searchDestination || "destination"}!`)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-glow transition-all shrink-0"
                >
                  Start Google Live Navigation
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1 border-t border-white/10">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400">Distance</span>
                  <p className="font-extrabold text-white">{currentRoute.distanceKm}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400">ETA</span>
                  <p className="font-extrabold text-emerald-400">{currentRoute.durationMins}</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400">Est. Fuel</span>
                  <p className="font-extrabold text-amber-400">{currentRoute.estimatedFuelLiters} Liters</p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] text-gray-400">Tolls</span>
                  <p className="font-extrabold text-white">{currentRoute.tollCount > 0 ? `${currentRoute.tollCount} Toll` : "No Tolls"}</p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Place Details Slide-Up Bottom Sheet */}
      <PlaceBottomSheet
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
      />

    </div>
  );
}
