"use client";

import React from "react";
import { X, Star, Clock, ShieldCheck, Users, PhoneCall, MapPin, ExternalLink } from "lucide-react";

export interface PlaceDetail {
  id: string;
  name: string;
  category: string;
  address: string;
  rating: number;
  safetyScore: number;
  crowdStatus: "Low Crowd" | "Moderate Crowd" | "Busy";
  openingHours: string;
  phone: string;
  photoUrl: string;
  description: string;
}

interface PlaceBottomSheetProps {
  place: PlaceDetail | null;
  onClose: () => void;
}

export function PlaceBottomSheet({ place, onClose }: PlaceBottomSheetProps) {
  if (!place) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6 bg-dark-bg/90 backdrop-blur-xl border-t border-white/10 shadow-2xl rounded-t-3xl max-w-3xl mx-auto animate-in slide-in-from-bottom duration-300">
      <div className="space-y-4">
        {/* Handle & Close Header */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-1 rounded-full bg-white/20 mx-auto absolute inset-x-0 top-3" />
          <div className="flex items-center gap-2 pt-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
              {place.category}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Safety {place.safetyScore}/100
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex flex-col sm:flex-row gap-4">
          <img
            src={place.photoUrl}
            alt={place.name}
            className="w-full sm:w-44 h-36 rounded-2xl object-cover ring-1 ring-white/10 shadow-glow"
          />

          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-extrabold text-white">{place.name}</h3>
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              {place.address}
            </p>
            <p className="text-xs text-gray-300 leading-relaxed">{place.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs">
              <div className="p-2 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Rating
                </span>
                <span className="font-bold text-white">{place.rating} / 5.0</span>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Users className="w-3 h-3 text-indigo-400" /> Crowd
                </span>
                <span className="font-bold text-emerald-400">{place.crowdStatus}</span>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/5 space-y-0.5 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-cyan-400" /> Hours
                </span>
                <span className="font-bold text-white line-clamp-1">{place.openingHours}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-white/10">
          <a
            href={`tel:${place.phone}`}
            className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-glow transition-colors"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Call Verified Place ({place.phone})</span>
          </a>

          <button
            onClick={() => alert(`Starting turn-by-turn safe navigation to ${place.name}!`)}
            className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <span>Navigate</span>
            <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
