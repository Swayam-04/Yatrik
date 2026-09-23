"use client";

import React from "react";
import {
  Sparkles,
  MapPin,
  Star,
  Heart,
  Clock,
  ExternalLink,
  Navigation,
  Compass,
} from "lucide-react";
import type { ExplorePlaceItem } from "@/services/explore.service";

interface ExplorePlaceCardProps {
  place: ExplorePlaceItem;
  onSelect: (place: ExplorePlaceItem) => void;
  isSaved?: boolean;
  onToggleSave?: (place: ExplorePlaceItem) => void;
  onViewMap?: (place: ExplorePlaceItem) => void;
}

export function ExplorePlaceCard({
  place,
  onSelect,
  isSaved = false,
  onToggleSave,
  onViewMap,
}: ExplorePlaceCardProps) {
  const photoUrl =
    place.photos && place.photos.length > 0
      ? place.photos[0]
      : null;

  const isGem = place.hiddenGemEvaluation?.isHiddenGem;
  const gemScore = place.hiddenGemEvaluation?.score ?? 0;

  return (
    <div
      onClick={() => onSelect(place)}
      className="group relative rounded-2xl glass-panel border border-[#0E7490]/25 bg-[#071A2B]/80 hover:border-[#14B8A6]/50 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between hover:shadow-[0_20px_35px_-10px_rgba(3,15,26,0.8),0_0_20px_rgba(20,184,166,0.18)] hover:-translate-y-1"
    >
      {/* 1. Media Header with Subtle Zoom on Hover */}
      <div className="relative h-48 w-full overflow-hidden bg-[#030F1A]">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={place.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";
            }}
          />
        ) : (
          /* Clean Geographic / Map Fallback Gradient when no image */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#071A2B] via-[#0E7490]/30 to-[#030F1A] p-4 text-center">
            <Compass className="w-8 h-8 text-[#14B8A6]/60 mb-1 group-hover:rotate-45 transition-transform duration-500" />
            <span className="text-[11px] font-semibold text-slate-400">YATRIK Destination Map</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#071A2B] via-[#071A2B]/40 to-transparent" />

        {/* Top Badges (Category & Price) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[70%]">
          <span className="px-2.5 py-1 rounded-full bg-[#030F1A]/85 backdrop-blur-md border border-[#0E7490]/35 text-[10px] font-bold text-[#38BDF8] uppercase tracking-wider">
            {place.displayCategory || place.category}
          </span>
          {place.priceLevel && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/35 text-[10px] font-extrabold text-emerald-300">
              {place.priceLevel}
            </span>
          )}
        </div>

        {/* Top Right Save Button */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {onToggleSave && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(place);
              }}
              className={`p-2 rounded-xl backdrop-blur-md border transition-all ${
                isSaved
                  ? "bg-rose-500/25 border-rose-500/50 text-rose-400 scale-105"
                  : "bg-[#030F1A]/80 border-[#0E7490]/30 text-slate-300 hover:text-white hover:bg-white/15"
              }`}
              title={isSaved ? "Saved in Collection" : "Save to Collection"}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
            </button>
          )}
        </div>

        {/* YATRIK Hidden Gem Warm Sunset Gold Banner */}
        {isGem && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#F59E0B]/30 via-[#FBBF24]/20 to-[#0E7490]/30 backdrop-blur-md border border-[#FBBF24]/40 text-[10px] text-[#FBBF24] font-bold shadow-[0_0_12px_rgba(245,158,11,0.25)]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FBBF24] animate-pulse" />
              <span>{place.hiddenGemEvaluation.badgeLabel || "YATRIK Hidden Gem"}</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-[#FBBF24]/20 text-[#FDE68A] font-extrabold text-[9px]">
              Score {gemScore}
            </span>
          </div>
        )}
      </div>

      {/* 2. Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Rating & Distance */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1 text-[#FBBF24] font-bold">
              <Star className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" />
              <span>{place.rating ? place.rating.toFixed(1) : "Verified"}</span>
              {place.userRatingCount ? (
                <span className="text-slate-400 text-[11px] font-normal">
                  ({place.userRatingCount.toLocaleString()})
                </span>
              ) : null}
            </div>

            {place.distanceKm !== undefined && (
              <span className="flex items-center gap-1 text-[#38BDF8] font-semibold text-[11px]">
                <Navigation className="w-3 h-3" />
                {place.distanceKm < 1
                  ? `${Math.round(place.distanceKm * 1000)} m`
                  : `${place.distanceKm.toFixed(1)} km`}
              </span>
            )}
          </div>

          {/* Place Name */}
          <h3 className="text-base font-bold text-white group-hover:text-[#38BDF8] transition-colors line-clamp-1">
            {place.name}
          </h3>

          {/* Location Address */}
          <p className="text-xs text-slate-400 flex items-start gap-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-[#14B8A6] shrink-0 mt-0.5" />
            <span className="truncate">{place.address}</span>
          </p>

          {/* Short Description or Reason */}
          {place.hiddenGemEvaluation?.reason ? (
            <p className="text-[11px] text-[#FDE68A]/90 bg-[#F59E0B]/10 border border-[#F59E0B]/20 rounded-lg px-2.5 py-1 line-clamp-2 leading-relaxed">
              💡 {place.hiddenGemEvaluation.reason}
            </p>
          ) : place.summary ? (
            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
              {place.summary}
            </p>
          ) : null}
        </div>

        {/* 3. Footer Meta & Explore Action */}
        <div className="pt-3 border-t border-[#0E7490]/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {place.openNow !== undefined ? (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  place.openNow
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                    : "bg-rose-500/15 text-rose-300 border border-rose-500/25"
                }`}
              >
                <Clock className="w-2.5 h-2.5" />
                {place.openNow ? "Open Now" : "Closed"}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">Live Destination</span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onViewMap && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewMap(place);
                }}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                title="View on Map"
              >
                <Compass className="w-3.5 h-3.5 text-[#38BDF8]" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(place);
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0E7490] to-[#14B8A6] hover:from-[#0E7490]/90 hover:to-[#14B8A6]/90 text-white text-[11px] font-bold shadow-[0_0_12px_rgba(20,184,166,0.3)] transition-all flex items-center gap-1"
            >
              <span>Explore</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
