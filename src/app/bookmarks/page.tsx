"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  MapPin,
  Star,
  Trash2,
  Route,
  Compass,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface SavedPlace {
  id: string;
  placeId?: string;
  name: string;
  address: string;
  category?: string;
  rating?: number;
  photoUrl?: string;
  summary?: string;
  savedAt?: string;
  collection?: string;
}

const COLLECTIONS = [
  { id: "all", label: "All Saved", icon: "❤️" },
  { id: "weekend", label: "Weekend Trips", icon: "🎒" },
  { id: "beach", label: "Beach Escapes", icon: "🌊" },
  { id: "mountain", label: "Mountain Trips", icon: "🏔" },
  { id: "food", label: "Food Trails", icon: "🍜" },
];

export default function BookmarksPage() {
  const [mounted, setMounted] = useState(false);
  const [activeCollection, setActiveCollection] = useState("all");
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("yatrik_saved_places");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedPlaces(parsed);
        }
      } else {
        // Sample starter collection items if none saved yet
        const initialSaved: SavedPlace[] = [
          {
            id: "place-puri-1",
            placeId: "place-puri-1",
            name: "Golden Beach & Sun Temple Corridor",
            address: "Puri Beach Road, Odisha",
            category: "beaches",
            rating: 4.8,
            photoUrl:
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
            summary: "Pristine coastline with golden sand dunes and vibrant artisan seafood shacks.",
            collection: "beach",
          },
          {
            id: "place-daringbadi-2",
            placeId: "place-daringbadi-2",
            name: "Pine Forest & Valley Viewpoint",
            address: "Daringbadi Hill Station, Kandhamal",
            category: "nature",
            rating: 4.7,
            photoUrl:
              "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
            summary: "Mist-covered valleys and aromatic pine trees in the Kashmir of Odisha.",
            collection: "mountain",
          },
          {
            id: "place-food-3",
            placeId: "place-food-3",
            name: "Old Town Temple Chhappan Bhog Trail",
            address: "Lingaraj Temple Road, Bhubaneswar",
            category: "food",
            rating: 4.9,
            photoUrl:
              "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
            summary: "Centuries-old authentic clay-pot sweets, chena poda, and local delicacies.",
            collection: "food",
          },
        ];
        setSavedPlaces(initialSaved);
        localStorage.setItem("yatrik_saved_places", JSON.stringify(initialSaved));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleRemove = (id: string) => {
    const updated = savedPlaces.filter((p) => (p.placeId || p.id) !== id);
    setSavedPlaces(updated);
    try {
      localStorage.setItem("yatrik_saved_places", JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const filteredPlaces = savedPlaces.filter((p) => {
    if (activeCollection === "all") return true;
    if (activeCollection === "beach")
      return (
        p.collection === "beach" ||
        p.category?.toLowerCase().includes("beach") ||
        p.name.toLowerCase().includes("beach")
      );
    if (activeCollection === "mountain")
      return (
        p.collection === "mountain" ||
        p.category?.toLowerCase().includes("nature") ||
        p.name.toLowerCase().includes("hill") ||
        p.name.toLowerCase().includes("mountain")
      );
    if (activeCollection === "food")
      return (
        p.collection === "food" ||
        p.category?.toLowerCase().includes("food") ||
        p.category?.toLowerCase().includes("cafe")
      );
    if (activeCollection === "weekend")
      return p.collection === "weekend" || true;
    return true;
  });

  if (!mounted) return null;

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto text-left">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-[2rem] glass-panel border border-[#0E7490]/25 bg-hero-gradient space-y-3 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14B8A6]/15 border border-[#14B8A6]/30 text-[#38BDF8] text-[10px] font-extrabold uppercase tracking-widest animate-float">
          <Bookmark className="w-3.5 h-3.5 text-[#14B8A6]" />
          <span>Curated Travel Collections</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          My Saved <span className="text-gradient-ocean">Places</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
          Organize your bucket list by travel vibes. Save hidden gems from Explore or community journals and turn them into itineraries.
        </p>
      </div>

      {/* 2. Collections Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-2 custom-scrollbar">
        {COLLECTIONS.map((col) => {
          const isActive = activeCollection === col.id;
          return (
            <button
              key={col.id}
              onClick={() => setActiveCollection(col.id)}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-[#0E7490] to-[#14B8A6] text-white border border-[#38BDF8] shadow-[0_0_15px_rgba(20,184,166,0.35)] scale-105"
                  : "bg-[#071A2B]/80 text-slate-300 hover:text-white border border-[#0E7490]/30 hover:border-[#14B8A6]/50"
              }`}
            >
              <span>{col.icon}</span>
              <span>{col.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Saved Places Cards Grid */}
      {filteredPlaces.length === 0 ? (
        <div className="p-12 text-center glass-panel border border-[#0E7490]/25 rounded-3xl max-w-md mx-auto space-y-4 bg-[#071A2B]/80 shadow-xl">
          <Compass className="w-12 h-12 text-slate-500 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-white">No Saved Places Here Yet</h3>
          <p className="text-xs text-slate-400">
            Browse the Explore page or Community field journals and tap the heart icon to save places into this collection.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#0E7490] to-[#14B8A6] text-white text-xs font-bold shadow-[0_0_12px_rgba(20,184,166,0.3)]"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Places to Save</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPlaces.map((place) => {
            const placeId = place.placeId || place.id;
            return (
              <div
                key={placeId}
                className="group relative rounded-2xl glass-panel border border-[#0E7490]/25 bg-[#071A2B]/85 hover:border-[#14B8A6]/50 transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xl hover:-translate-y-1"
              >
                {/* Image */}
                <div className="relative h-44 w-full overflow-hidden bg-[#030F1A]">
                  <img
                    src={
                      place.photoUrl ||
                      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80"
                    }
                    alt={place.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#071A2B] via-transparent to-transparent" />

                  {/* Category Pill */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-[#030F1A]/85 backdrop-blur-md border border-[#0E7490]/35 text-[10px] font-bold text-[#38BDF8] uppercase tracking-wider">
                      {place.category || "Destination"}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(placeId)}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-[#030F1A]/80 border border-[#0E7490]/30 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    {place.rating && (
                      <div className="flex items-center gap-1 text-[#FBBF24] text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" />
                        <span>{place.rating.toFixed(1)}</span>
                      </div>
                    )}
                    <h3 className="text-base font-bold text-white group-hover:text-[#38BDF8] transition-colors line-clamp-1">
                      {place.name}
                    </h3>
                    <p className="text-xs text-slate-400 flex items-start gap-1 line-clamp-1">
                      <MapPin className="w-3.5 h-3.5 text-[#14B8A6] shrink-0 mt-0.5" />
                      <span className="truncate">{place.address}</span>
                    </p>
                    {place.summary && (
                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed pt-1">
                        {place.summary}
                      </p>
                    )}
                  </div>

                  {/* Actions: Plan Trip Here & Explore */}
                  <div className="pt-3 border-t border-[#0E7490]/20 flex items-center justify-between gap-2">
                    <Link
                      href={`/plan?destination=${encodeURIComponent(place.name)}`}
                      className="flex-1 py-1.5 px-3 rounded-xl bg-gradient-to-r from-[#0E7490] to-[#14B8A6] hover:from-[#0E7490]/90 hover:to-[#14B8A6]/90 text-white text-[11px] font-bold shadow-[0_0_10px_rgba(20,184,166,0.3)] flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Route className="w-3.5 h-3.5" />
                      <span>Plan Trip Here</span>
                    </Link>

                    <Link
                      href={`/explore?q=${encodeURIComponent(place.name)}`}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-[#0E7490]/25 transition-colors"
                      title="Explore in detail"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
