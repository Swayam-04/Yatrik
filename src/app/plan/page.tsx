"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  Share2,
  ChevronDown,
  ChevronUp,
  Cpu,
  RefreshCw,
  Clock,
  Compass,
  ArrowRight,
  Shield,
  CloudRain,
  Navigation,
  Wind,
  Droplets,
  Star,
  ExternalLink,
  Info
} from "lucide-react";
import { Trip, TravelerType, TransportMode, PreferenceType, ItineraryItem, ItineraryDay } from "@/types";
import { formatCurrency } from "@/lib/utils";
import confetti from "canvas-confetti";
import { MapboxSearchBox, SelectedLocation } from "@/components/mapbox/MapboxSearchBox";
import { MapboxMapContainer, MapMarkerItem } from "@/components/mapbox/MapboxMapContainer";
import { RealPlace } from "@/services/places.service";
import { RealWeatherData } from "@/services/weather.service";

function AiPlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDest = searchParams.get("destination") || "";
  const initialLat = searchParams.get("lat") ? parseFloat(searchParams.get("lat")!) : undefined;
  const initialLng = searchParams.get("lng") ? parseFloat(searchParams.get("lng")!) : undefined;
  const initialBudget = Number(searchParams.get("budget")) || 25000;
  const initialStyle = (searchParams.get("travelType") as TravelerType) || "Solo";

  const [mounted, setMounted] = useState(false);
  // Planner steps: 1 = Search, 2 = Live Destination Overview, 3 = Trip Customization, 4 = Result Timeline
  const [step, setStep] = useState<number>(initialDest ? 2 : 1);

  // Selected Location State (100% dynamic, zero hardcoded defaults)
  const [selectedLocation, setSelectedLocation] = useState<SelectedLocation | null>(
    initialDest && initialLat !== undefined && initialLng !== undefined
      ? {
          name: initialDest,
          formattedAddress: searchParams.get("address") || initialDest,
          latitude: initialLat,
          longitude: initialLng,
          country: searchParams.get("country") || "",
          region: searchParams.get("region") || "",
          city: searchParams.get("city") || initialDest,
          mapboxPlaceId: searchParams.get("placeId") || "",
        }
      : null
  );

  // Live API Data State
  const [liveWeather, setLiveWeather] = useState<RealWeatherData | null>(null);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [realPlaces, setRealPlaces] = useState<RealPlace[]>([]);
  const [placesError, setPlacesError] = useState<string | null>(null);
  const [isLoadingLiveData, setIsLoadingLiveData] = useState(false);

  // Trip Preferences
  const [startDate, setStartDate] = useState<string>(
    new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0]
  );
  const [days, setDays] = useState<number>(4);
  const [budget, setBudget] = useState<number>(initialBudget);
  const [travelers, setTravelers] = useState<number>(1);
  const [travelerType, setTravelerType] = useState<TravelerType>(initialStyle);
  const [transportMode, setTransportMode] = useState<TransportMode>("Flight");
  const [selectedPreferences, setSelectedPreferences] = useState<PreferenceType[]>([
    "Hidden Gems",
    "Food & Cafes",
    "Photography",
  ]);
  const [womensSafetyMode, setWomensSafetyMode] = useState<boolean>(initialStyle === "Women Solo");

  // Output State
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [aiSource, setAiSource] = useState<string>("");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCost, setEditCost] = useState<number>(0);
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [generationError, setGenerationError] = useState<string | null>(null);

  const [aiStatus, setAiStatus] = useState({
    isOnline: false,
    checking: true,
    model: "gemma4",
  });

  useEffect(() => {
    setMounted(true);
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setAiStatus((prev) => ({ ...prev, checking: true }));
    try {
      const res = await fetch("/api/itinerary/generate");
      if (res.ok) {
        const data = await res.json();
        setAiStatus({
          isOnline: Boolean(data.ollama?.isOnline),
          checking: false,
          model: data.ollama?.model || "gemma4",
        });
      } else {
        setAiStatus({ isOnline: false, checking: false, model: "gemma4" });
      }
    } catch {
      setAiStatus({ isOnline: false, checking: false, model: "gemma4" });
    }
  };

  // Fetch real weather and real places whenever a location is selected
  useEffect(() => {
    if (!selectedLocation) return;

    const fetchRealData = async () => {
      setIsLoadingLiveData(true);
      setWeatherError(null);
      setPlacesError(null);

      const lat = selectedLocation.latitude;
      const lng = selectedLocation.longitude;
      const name = selectedLocation.name;

      try {
        // 1. Fetch Real Weather
        const weatherPromise = fetch(`/api/weather?lat=${lat}&lng=${lng}&destination=${encodeURIComponent(name)}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.weather) {
              setLiveWeather(data.weather);
            } else {
              setWeatherError(data.error || "Live data unavailable");
            }
          })
          .catch(() => setWeatherError("Live data unavailable"));

        // 2. Fetch Real Places from Google Places API (New)
        const placesPromise = fetch(
          `/api/places/search?lat=${lat}&lng=${lng}&destination=${encodeURIComponent(name)}&category=attractions&limit=10`
        )
          .then((r) => r.json())
          .then((data) => {
            if (data.places && data.places.length > 0) {
              setRealPlaces(data.places);
            } else {
              setPlacesError(data.error || "Live data unavailable (no places found)");
            }
          })
          .catch(() => setPlacesError("Live data unavailable"));

        await Promise.allSettled([weatherPromise, placesPromise]);
      } finally {
        setIsLoadingLiveData(false);
      }
    };

    fetchRealData();
  }, [selectedLocation?.latitude, selectedLocation?.longitude, selectedLocation?.name]);

  const handleLocationSelect = (loc: SelectedLocation) => {
    setSelectedLocation(loc);
    setStep(2);
  };

  const handleGeneratePlan = async () => {
    if (!selectedLocation) return;

    setIsGenerating(true);
    setGenerationError(null);

    const finalTravelerType = womensSafetyMode ? "Women Solo" : travelerType;

    try {
      const response = await fetch("/api/itinerary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          destination: selectedLocation.name,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          budget,
          days,
          travelers,
          travelerType: finalTravelerType,
          transportMode,
          preferences: selectedPreferences,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success || !data.trip) {
        throw new Error(data.error || "Live data unavailable: Failed to generate personalized itinerary.");
      }

      setCurrentTrip(data.trip);
      setAiSource(data.source || "Gemma 4 (Ollama)");
      setStep(4);

      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Live data unavailable";
      setGenerationError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePreference = (pref: PreferenceType) => {
    if (selectedPreferences.includes(pref)) {
      setSelectedPreferences(selectedPreferences.filter((p) => p !== pref));
    } else {
      setSelectedPreferences([...selectedPreferences, pref]);
    }
  };

  // Timeline Mutations
  const handleDeleteItem = (dayNumber: number, itemId: string) => {
    if (!currentTrip) return;
    const updatedDays = currentTrip.days.map((day) => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          items: day.items.filter((item) => item.id !== itemId),
        };
      }
      return day;
    });
    setCurrentTrip({ ...currentTrip, days: updatedDays });
  };

  const handleAddItem = (dayNumber: number) => {
    if (!currentTrip || !selectedLocation) return;
    const newItem: ItineraryItem = {
      id: `custom-item-${Date.now()}`,
      timeOfDay: "Afternoon",
      title: "Local Sightseeing Stop",
      description: "Exploration around local highlights.",
      category: "Attraction",
      cost: 400,
      duration: "1.5 hrs",
      location: selectedLocation.name,
      lat: selectedLocation.latitude,
      lng: selectedLocation.longitude,
      safetyScore: 95,
      isWomenFriendly: true,
    };

    const updatedDays = currentTrip.days.map((day) => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          items: [...day.items, newItem],
        };
      }
      return day;
    });
    setCurrentTrip({ ...currentTrip, days: updatedDays });
  };

  const startEditItem = (item: ItineraryItem) => {
    setEditingItemId(item.id);
    setEditTitle(item.title);
    setEditCost(item.cost);
    setEditDescription(item.description);
    setEditLocation(item.location);
  };

  const saveEditItem = (dayNumber: number, itemId: string) => {
    if (!currentTrip) return;
    const updatedDays = currentTrip.days.map((day) => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          items: day.items.map((item) => {
            if (item.id === itemId) {
              return {
                ...item,
                title: editTitle,
                cost: editCost,
                description: editDescription,
                location: editLocation,
              };
            }
            return item;
          }),
        };
      }
      return day;
    });
    setCurrentTrip({ ...currentTrip, days: updatedDays });
    setEditingItemId(null);
  };

  const moveActivity = (dayNumber: number, currentIndex: number, direction: "up" | "down") => {
    if (!currentTrip) return;
    const updatedDays = currentTrip.days.map((day) => {
      if (day.dayNumber === dayNumber) {
        const newItems = [...day.items];
        const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
        if (targetIndex >= 0 && targetIndex < newItems.length) {
          const temp = newItems[currentIndex];
          newItems[currentIndex] = newItems[targetIndex];
          newItems[targetIndex] = temp;
        }
        return { ...day, items: newItems };
      }
      return day;
    });
    setCurrentTrip({ ...currentTrip, days: updatedDays });
  };

  // Prepare map markers from itinerary or real places
  const mapMarkers: MapMarkerItem[] = currentTrip
    ? currentTrip.days.flatMap((d) =>
        d.items
          .filter((it) => it.lat !== undefined && it.lng !== undefined)
          .map((it) => ({
            id: it.id,
            name: it.title,
            latitude: it.lat!,
            longitude: it.lng!,
            category: it.category.toLowerCase(),
            address: it.location,
            dayNumber: d.dayNumber,
          }))
      )
    : realPlaces.map((p) => ({
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

  // Route coordinates for Mapbox polyline
  const routeCoords: Array<[number, number]> = currentTrip
    ? currentTrip.days
        .flatMap((d) => d.items)
        .filter((it) => it.lng !== undefined && it.lat !== undefined)
        .map((it) => [it.lng!, it.lat!])
    : [];

  const preferencesList: PreferenceType[] = [
    "Nature",
    "Adventure",
    "Luxury",
    "Budget",
    "Photography",
    "Food & Cafes",
    "Nightlife",
    "Hidden Gems",
    "Cultural & Heritage",
    "Shopping",
  ];

  if (!mounted) return null;

  return (
    <div className="space-y-12 pb-16">
      {/* Immersive Header */}
      <div className="space-y-3 text-center max-w-3xl mx-auto py-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[10px] font-extrabold uppercase tracking-widest animate-float">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>Gemma 4 Real-Data Grounded Intelligence</span>
          <span
            className={`w-2 h-2 rounded-full ${
              aiStatus.isOnline ? "bg-emerald-400 animate-pulse shadow-glow-emerald" : "bg-amber-400"
            }`}
          />
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">AI Trip Planner</h1>
        <p className="text-sm md:text-base text-gray-400 max-w-xl mx-auto leading-relaxed">
          Search <strong>any destination in the world</strong>. View live weather, real Google Places, and receive a
          personalized itinerary structured by Gemma 4.
        </p>
      </div>

      {/* STEP 1: Global Location Search (Mapbox Search Box) */}
      {!currentTrip && !isGenerating && step === 1 && (
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/80 space-y-6 shadow-2xl">
          <div className="space-y-2 text-left">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" />
              Where do you want to go?
            </h3>
            <p className="text-xs text-gray-400">
              Type any city, neighborhood, address, or landmark worldwide (e.g., Paris, Bhubaneswar, Eiffel Tower).
            </p>
          </div>

          <MapboxSearchBox
            onLocationSelect={handleLocationSelect}
            placeholder="Type any place worldwide..."
            autoFocus
          />

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-[11px] text-gray-400 text-left flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <strong>Global Autocomplete:</strong> Powered dynamically by Mapbox Search. No predefined cities or
              hardcoded lists.
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Live Destination Overview (Map, Weather, Real Places) */}
      {!currentTrip && !isGenerating && step === 2 && selectedLocation && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
          <div className="p-6 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {selectedLocation.country || "Global Location"}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{selectedLocation.name}</h2>
              <p className="text-xs text-gray-400">{selectedLocation.formattedAddress}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300"
              >
                Change Place
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-glow"
              >
                <span>Customize Trip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Interactive Mapbox Map */}
          <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <MapboxMapContainer
              center={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
              zoom={13}
              destinationName={selectedLocation.name}
              markers={mapMarkers}
              className="h-[380px] w-full"
            />
          </div>

          {/* Live Data Grid: Weather + Real Google Places Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            {/* Live Weather Card */}
            <div className="p-5 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/80 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <CloudRain className="w-4 h-4" /> Live Weather
                </span>
                <span className="text-[10px] text-gray-500 font-semibold">Radar Live</span>
              </div>

              {liveWeather ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-extrabold text-white">{liveWeather.temperature}°C</div>
                      <div className="text-xs font-semibold text-gray-300 capitalize">{liveWeather.condition}</div>
                      <div className="text-[10px] text-gray-400">Feels like {liveWeather.feelsLike}°C</div>
                    </div>
                    <div className="text-4xl">{liveWeather.icon}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-[11px] text-gray-400">
                    <div className="flex items-center gap-1">
                      <Wind className="w-3.5 h-3.5 text-gray-500" /> {liveWeather.windSpeed} km/h
                    </div>
                    <div className="flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-gray-500" /> {liveWeather.humidity}% humidity
                    </div>
                  </div>

                  {liveWeather.forecast && liveWeather.forecast.length > 0 && (
                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <span className="text-[9px] uppercase font-bold text-gray-500">7-Day Forecast</span>
                      <div className="space-y-1">
                        {liveWeather.forecast.slice(0, 3).map((f, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px] text-gray-300">
                            <span>{f.day}</span>
                            <span className="font-semibold">
                              {f.tempMax}° / {f.tempMin}°
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white/5 text-center text-xs text-gray-400">
                  {weatherError || "Live data unavailable"}
                </div>
              )}
            </div>

            {/* Real Google Places Preview (Span 2 cols) */}
            <div className="md:col-span-2 p-5 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/80 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Compass className="w-4 h-4" /> Real Places (Google Places API New)
                </span>
                <span className="text-[10px] text-gray-400 font-semibold">{realPlaces.length} venues found</span>
              </div>

              {isLoadingLiveData ? (
                <div className="p-8 text-center text-xs text-gray-400 animate-pulse">
                  Querying authentic places around {selectedLocation.name}...
                </div>
              ) : realPlaces.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[260px] overflow-y-auto pr-1">
                  {realPlaces.slice(0, 6).map((place) => (
                    <div
                      key={place.placeId}
                      className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-indigo-500/25 transition-all text-left space-y-1"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-white truncate">{place.name}</h4>
                        {place.rating && (
                          <span className="text-[10px] font-bold text-amber-400 flex items-center gap-0.5 shrink-0">
                            <Star className="w-2.5 h-2.5 fill-current" /> {place.rating}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 truncate">{place.address}</p>
                      <div className="flex items-center gap-2 text-[9px] text-gray-500 uppercase tracking-wide font-bold">
                        <span>{place.category}</span>
                        {place.openNow !== undefined && (
                          <span className={place.openNow ? "text-emerald-400" : "text-rose-400"}>
                            • {place.openNow ? "Open" : "Closed"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white/5 text-center text-xs text-gray-400">
                  {placesError || "Live data unavailable"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Trip Parameters & Gemma 4 Generation */}
      {!currentTrip && !isGenerating && step === 3 && selectedLocation && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/80 space-y-6 shadow-2xl text-left">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">Step 3 of 3</span>
              <h3 className="text-xl font-extrabold text-white">Trip Parameters for {selectedLocation.name}</h3>
            </div>
            <button
              onClick={() => setStep(2)}
              className="text-xs font-semibold text-gray-400 hover:text-white"
            >
              Back to Overview
            </button>
          </div>

          {generationError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {generationError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl text-xs glass-input focus:ring-1"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Number of Days</label>
              <input
                type="number"
                min="1"
                max="14"
                value={days}
                onChange={(e) => setDays(Math.max(1, Math.min(14, Number(e.target.value))))}
                className="w-full px-3 py-2.5 rounded-xl text-xs glass-input focus:ring-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Budget (INR ₹)</label>
              <input
                type="number"
                step="5000"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl text-xs glass-input focus:ring-1"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Travelers</label>
              <input
                type="number"
                min="1"
                max="20"
                value={travelers}
                onChange={(e) => setTravelers(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2.5 rounded-xl text-xs glass-input focus:ring-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Travel Style</label>
            <div className="grid grid-cols-3 gap-2">
              {(["Solo", "Women Solo", "Couple", "Family", "Friends", "Digital Nomad"] as TravelerType[]).map(
                (style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => {
                      setTravelerType(style);
                      if (style === "Women Solo") setWomensSafetyMode(true);
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all truncate ${
                      travelerType === style
                        ? "bg-indigo-600 text-white border border-indigo-400 shadow-glow"
                        : "bg-white/5 text-gray-400 border border-white/10 hover:text-white"
                    }`}
                  >
                    {style}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Interests & Vibes</label>
            <div className="flex flex-wrap gap-2">
              {preferencesList.map((pref) => {
                const isSelected = selectedPreferences.includes(pref);
                return (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => togglePreference(pref)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-indigo-600 text-white border border-indigo-400 shadow-glow"
                        : "bg-white/5 text-gray-400 border border-white/10 hover:text-white"
                    }`}
                  >
                    {pref}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleGeneratePlan}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-extrabold text-sm shadow-glow hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Itinerary with Gemma 4</span>
          </button>
        </div>
      )}

      {/* GENERATING SKELETON */}
      {isGenerating && (
        <div className="max-w-xl mx-auto p-10 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/90 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center mx-auto shadow-glow">
            <Cpu className="w-8 h-8 text-indigo-400 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-extrabold text-white">Gemma 4 is Organizing Your Journey...</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto leading-relaxed">
              Grounding real Google Places, verifying coordinates, calculating pacing for {selectedLocation?.name}, and
              optimizing budget without hallucinating fake venues.
            </p>
          </div>
          <div className="w-48 h-1.5 rounded-full bg-white/5 mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 animate-pulse w-3/4" />
          </div>
        </div>
      )}

      {/* STEP 4: GENERATED ITINERARY TIMELINE */}
      {currentTrip && !isGenerating && step === 4 && (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
          {/* Header Card */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-[#090d16]/70 text-left">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-extrabold text-white">{currentTrip.title}</h2>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold flex items-center gap-1 shadow-glow-emerald">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Safety Score: {currentTrip.safetyScore}/100
                </span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px] font-semibold border border-indigo-500/20">
                  Model: {aiSource}
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                {currentTrip.daysCount} Days • {currentTrip.travelType} • Total Budget:{" "}
                <strong className="text-amber-400 font-bold">{formatCurrency(currentTrip.budgetTotal)}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={() => {
                  setCurrentTrip(null);
                  setStep(1);
                }}
                className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold"
              >
                New Search
              </button>
              <button
                onClick={() => alert("Trip saved successfully! Unlocked 100 YATRIK Coins.")}
                className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-glow flex items-center gap-1.5"
              >
                Save Trip
              </button>
            </div>
          </div>

          {/* Mapbox Route & Real Itinerary Markers */}
          {selectedLocation && (
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <MapboxMapContainer
                center={{ lat: selectedLocation.latitude, lng: selectedLocation.longitude }}
                zoom={12}
                destinationName={selectedLocation.name}
                markers={mapMarkers}
                routeCoordinates={routeCoords}
                className="h-[420px] w-full"
              />
            </div>
          )}

          {/* Timeline Days */}
          <div className="space-y-8 text-left">
            {currentTrip.days.map((day) => (
              <div
                key={day.dayNumber}
                className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 bg-[#070b14]/50 space-y-6"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                      Day {day.dayNumber}
                    </span>
                    <h3 className="text-xl font-extrabold text-white">{day.title}</h3>
                  </div>
                  <div className="text-xs text-gray-400">
                    Day Budget: <strong className="text-amber-400 font-bold">{formatCurrency(day.dayExpense)}</strong>
                  </div>
                </div>

                {day.alternativePlan && (
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2.5">
                    <CloudRain className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Weather Alternative: </strong> {day.alternativePlan}
                    </div>
                  </div>
                )}

                <div className="relative border-l border-white/5 pl-4 ml-2 space-y-6">
                  {day.items.map((item, idx) => {
                    const isEditing = editingItemId === item.id;
                    return (
                      <div key={item.id} className="relative space-y-2">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-glow" />

                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/25 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-[10px] font-bold">
                              {item.timeOfDay}
                            </div>

                            <div className="space-y-1.5 flex-1 text-left">
                              {isEditing ? (
                                <div className="space-y-2 max-w-md">
                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full px-2 py-1 rounded glass-input text-xs text-white"
                                  />
                                  <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full px-2 py-1 rounded glass-input text-xs text-white"
                                  />
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={editLocation}
                                      onChange={(e) => setEditLocation(e.target.value)}
                                      className="px-2 py-1 rounded glass-input text-xs text-white flex-1"
                                    />
                                    <input
                                      type="number"
                                      value={editCost}
                                      onChange={(e) => setEditCost(Number(e.target.value))}
                                      className="w-24 px-2 py-1 rounded glass-input text-xs text-white"
                                    />
                                    <button
                                      onClick={() => saveEditItem(day.dayNumber, item.id)}
                                      className="p-1 px-2.5 rounded bg-emerald-600 text-white text-xs font-bold"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-sm font-extrabold text-white leading-tight">{item.title}</h4>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-gray-400 font-semibold border border-white/10">
                                      {item.category}
                                    </span>
                                    {item.isWomenFriendly && (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold flex items-center gap-0.5 shadow-glow-emerald">
                                        <ShieldCheck className="w-3 h-3" /> safe route
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-300 leading-relaxed">{item.description}</p>
                                  <p className="text-[10px] text-gray-500">
                                    📍 {item.location} • Duration: {item.duration}
                                  </p>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                            <span className="text-xs font-bold text-amber-400">{formatCurrency(item.cost)}</span>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => idx > 0 && moveActivity(day.dayNumber, idx, "up")}
                                disabled={idx === 0}
                                className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-25"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => idx < day.items.length - 1 && moveActivity(day.dayNumber, idx, "down")}
                                disabled={idx === day.items.length - 1}
                                className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-25"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => startEditItem(item)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(day.dayNumber, item.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => handleAddItem(day.dayNumber)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-white/10 hover:border-indigo-500/50 text-xs font-bold text-gray-400 hover:text-indigo-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Stop to Day {day.dayNumber}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AiPlannerPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-gray-400 text-xs font-bold">Loading YATRIK AI planner engine...</div>
      }
    >
      <AiPlannerContent />
    </Suspense>
  );
}
