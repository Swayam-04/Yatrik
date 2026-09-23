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
  Award,
  Layers,
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
      : "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80";

  const isGem = place.hiddenGemEvaluation?.isHiddenGem;
  const gemScore = place.hiddenGemEvaluation?.score ?? 0;

  return (
    <div
      onClick={() => onSelect(place)}
      className="group relative rounded-2xl glass-panel border border-white/10 bg-[#090d16]/75 hover:border-indigo-500/40 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(99,102,241,0.15)] hover:-translate-y-1"
    >
      {/* Media Header */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img
          src={photoUrl}
          alt={place.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src =
              "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-[#090d16]/30 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap max-w-[70%]">
          <span className="px-2.5 py-1 rounded-full bg-[#030712]/80 backdrop-blur-md border border-white/15 text-[10px] font-bold text-gray-200 uppercase tracking-wider">
            {place.displayCategory || place.category}
          </span>
          {place.priceLevel && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-[10px] font-extrabold text-emerald-300">
              {place.priceLevel}
            </span>
          )}
        </div>

        {/* Top Right Save / Gem Status */}
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
                  ? "bg-pink-500/25 border-pink-500/50 text-pink-400 scale-105"
                  : "bg-[#030712]/75 border-white/10 text-gray-300 hover:text-white hover:bg-white/15"
              }`}
              title={isSaved ? "Saved" : "Save to Favorites"}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-pink-500" : ""}`} />
            </button>
          )}
        </div>

        {/* YATRIK Hidden Gem Floating Banner */}
        {isGem && (
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500/30 via-pink-500/20 to-indigo-600/30 backdrop-blur-md border border-amber-400/40 shadow-glow-amber text-[10px] text-amber-200 font-bold">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
              <span>{place.hiddenGemEvaluation.badgeLabel || "YATRIK Hidden Gem"}</span>
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-200 font-extrabold text-[9px]">
              Score {gemScore}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center gap-1 text-amber-400 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{place.rating ? place.rating.toFixed(1) : "New"}</span>
              {place.userRatingCount ? (
                <span className="text-gray-500 text-[11px] font-normal">
                  ({place.userRatingCount.toLocaleString()})
                </span>
              ) : null}
            </div>

            {place.distanceKm !== undefined && (
              <span className="flex items-center gap-1 text-indigo-300 font-semibold text-[11px]">
                <Navigation className="w-3 h-3" />
                {place.distanceKm < 1
                  ? `${Math.round(place.distanceKm * 1000)} m`
                  : `${place.distanceKm.toFixed(1)} km`}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
            {place.name}
          </h3>

          <p className="text-xs text-gray-400 flex items-start gap-1 line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0 mt-0.5" />
            <span>{place.address}</span>
          </p>

          {/* Reason or Summary Snippet */}
          {place.hiddenGemEvaluation?.reason ? (
            <p className="text-[11px] text-amber-200/80 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1 line-clamp-2 leading-relaxed">
              💡 {place.hiddenGemEvaluation.reason}
            </p>
          ) : place.summary ? (
            <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
              {place.summary}
            </p>
          ) : null}
        </div>

        {/* Footer Meta & Actions */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
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
              <span className="text-[10px] text-gray-500 font-medium">Verified Place</span>
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
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                title="View on Map"
              >
                <Compass className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(place);
              }}
              className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/30 text-indigo-200 text-[11px] font-bold transition-all flex items-center gap-1"
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
