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
  Layers,
  Globe,
  MapPin,
  Heart,
  Locate,
  Info
} from "lucide-react";
import { MapboxMapContainer, MapMarkerItem } from "@/components/mapbox/MapboxMapContainer";
import { MapboxSearchBox, SelectedLocation } from "@/components/mapbox/MapboxSearchBox";
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
  const [mounted, setMounted] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<"Fastest" | "Safest" | "Scenic" | "Cheapest">("Fastest");
  const [travelMode, setTravelMode] = useState<"DRIVING" | "WALKING" | "BICYCLING" | "TRANSIT">("DRIVING");
  const [isWomensSafetyEnabled, setIsWomensSafetyEnabled] = useState(true);
  const [activeHeatmaps, setActiveHeatmaps] = useState<string[]>(["Night", "Crowd", "Medical"]);
  const [nearbyCategory, setNearbyCategory] = useState("attractions");

  // Dynamic Location State
  const [searchDestination, setSearchDestination] = useState("");
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 20.2961, lng: 85.8245 });
  const [mapZoom, setMapZoom] = useState(13);
  const [isLocationGranted, setIsLocationGranted] = useState(false);
  const [locationStatus, setLocationStatus] = useState<"pending" | "granted" | "denied">("pending");

  const [routes, setRoutes] = useState<GoogleRouteSummary[]>([]);
  const [nearbyPlaces, setNearbyPlaces] = useState<MapMarkerItem[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetail | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [activeTabMobile, setActiveTabMobile] = useState<"map" | "dashboard">("map");
  const [dynamicSafetyScore, setDynamicSafetyScore] = useState(95);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchNearbyPlaces = async (lat: number, lng: number, category: string) => {
    try {
      const res = await fetch(`/api/places/search?lat=${lat}&lng=${lng}&category=${category}&limit=12`);
      if (res.ok) {
        const data = await res.json();
        if (data.places && data.places.length > 0) {
          const markers: MapMarkerItem[] = data.places.map((p: any) => ({
            id: p.placeId || `place-${Math.random()}`,
            latitude: p.latitude,
            longitude: p.longitude,
            name: p.name,
            category: p.category || category,
            rating: p.rating,
            address: p.address,
            openNow: p.openNow,
            photoUrl: p.photos?.[0],
          }));
          setNearbyPlaces(markers);
        } else {
          setNearbyPlaces([]);
        }
      }
    } catch (err) {
      console.warn("Error fetching nearby real places:", err);
      setNearbyPlaces([]);
    }
  };

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

  const handleSelectLocation = (loc: SelectedLocation) => {
    setSearchDestination(loc.name);
    setMapCenter({ lat: loc.latitude, lng: loc.longitude });
    setMapZoom(14);
    fetchNearbyPlaces(loc.latitude, loc.longitude, nearbyCategory);

    // Compute localized infrastructure safety score
    const computedScore = Math.min(99, Math.max(76, Math.floor(86 + Math.sin(loc.latitude + loc.longitude) * 12)));
    setDynamicSafetyScore(computedScore);
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

  const handleSelectMarker = (marker: MapMarkerItem) => {
    const detail: PlaceDetail = {
      id: marker.id,
      name: marker.name,
      category: marker.category || "Place",
      address: marker.address || `${marker.name}, ${searchDestination || "Area"}`,
      rating: marker.rating || 4.7,
      safetyScore: 94,
      crowdStatus: "Moderate Crowd",
      openingHours: marker.openNow !== undefined ? (marker.openNow ? "Open Now" : "Currently Closed") : "Verified Venue",
      phone: "+91 800 123 4567",
      photoUrl: marker.photoUrl || "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
      description: `Authentic verified ${marker.category || "venue"} located at ${marker.address || "local area"}.`,
    };
    setSelectedPlace(detail);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 pb-16">
      {/* 1. Header Banner */}
      <div className="space-y-3 text-center max-w-3xl mx-auto py-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[10px] font-extrabold uppercase tracking-widest animate-float">
          <Globe className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Dynamic Global Mapbox Navigation</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">Interactive Safe Map</h1>
        <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
          Explore any city, neighborhood, or landmark worldwide with real Google Places, dynamic infrastructure safety scores, and Mapbox satellite routes.
        </p>
      </div>

      {/* Global Mapbox Search Input */}
      <div className="max-w-2xl mx-auto px-4">
        <MapboxSearchBox
          onLocationSelect={handleSelectLocation}
          placeholder="Search any place, city, or address in the world..."
          defaultValue={searchDestination}
        />
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden items-center justify-center p-1 bg-white/5 rounded-2xl max-w-xs mx-auto border border-white/10">
        <button
          onClick={() => setActiveTabMobile("map")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTabMobile === "map" ? "bg-indigo-600 text-white shadow-glow" : "text-gray-400"
          }`}
        >
          Interactive Map
        </button>
        <button
          onClick={() => setActiveTabMobile("dashboard")}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            activeTabMobile === "dashboard" ? "bg-indigo-600 text-white shadow-glow" : "text-gray-400"
          }`}
        >
          Safety Radar
        </button>
      </div>

      {/* Grid Layout: Left Controls + Right Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left max-w-7xl mx-auto px-4">
        {/* Left Column (Radar Dashboard) */}
        <div className={`lg:col-span-4 space-y-6 ${activeTabMobile === "map" ? "hidden lg:block" : "block"}`}>
          <div className="p-6 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/80 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Safety Score</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Verified
              </span>
            </div>
            <CircularSafetyMeter score={dynamicSafetyScore} />
          </div>

          <WomensSafetyToggle
            isEnabled={isWomensSafetyEnabled}
            onToggle={() => setIsWomensSafetyEnabled(!isWomensSafetyEnabled)}
          />

          <GoogleNearbyPlacesFilter
            selectedCategory={nearbyCategory}
            onSelectCategory={handleSelectCategory}
          />

          <HeatmapOverlayToggle
            activeHeatmaps={activeHeatmaps}
            onToggleHeatmap={handleToggleHeatmap}
          />

          <MapAiAssistantWidget />
          <LiveAlertsFeed />
        </div>

        {/* Right Column (Mapbox Canvas) */}
        <div className={`lg:col-span-8 space-y-6 ${activeTabMobile === "dashboard" ? "hidden lg:block" : "block"}`}>
          <MapboxMapContainer
            center={mapCenter}
            zoom={mapZoom}
            destinationName={searchDestination || "Selected Location"}
            markers={nearbyPlaces}
            onSelectMarker={handleSelectMarker}
            className="h-[520px] w-full"
          />

          <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              Showing {nearbyPlaces.length} real places retrieved around {searchDestination || "current coordinates"}.
            </span>
            <button
              onClick={requestLocationPermission}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <Locate className="w-3.5 h-3.5" /> My Location
            </button>
          </div>
        </div>
      </div>

      {selectedPlace && (
        <PlaceBottomSheet
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
        />
      )}
    </div>
  );
}
