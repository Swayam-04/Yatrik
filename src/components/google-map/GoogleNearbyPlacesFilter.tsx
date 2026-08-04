"use client";

import React from "react";
import { 
  Hotel, 
  Utensils, 
  Stethoscope, 
  ShieldAlert, 
  Fuel, 
  CreditCard, 
  Pill, 
  Bus, 
  Train, 
  Plane, 
  Sparkles,
  Check 
} from "lucide-react";

interface NearbyCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  color: string;
}

interface GoogleNearbyPlacesFilterProps {
  selectedCategory: string;
  onSelectCategory: (id: string) => void;
}

export function GoogleNearbyPlacesFilter({
  selectedCategory,
  onSelectCategory,
}: GoogleNearbyPlacesFilterProps) {
  const categories: NearbyCategory[] = [
    { id: "lodging", label: "Hotels & Stays", icon: Hotel, color: "text-indigo-400" },
    { id: "restaurant", label: "Restaurants", icon: Utensils, color: "text-amber-400" },
    { id: "tourist_attraction", label: "Attractions", icon: Sparkles, color: "text-violet-400" },
    { id: "hospital", label: "Hospitals", icon: Stethoscope, color: "text-rose-400" },
    { id: "police", label: "Police Stations", icon: ShieldAlert, color: "text-cyan-400" },
    { id: "atm", label: "ATMs & Banks", icon: CreditCard, color: "text-emerald-400" },
    { id: "gas_station", label: "Fuel Stations", icon: Fuel, color: "text-emerald-300" },
    { id: "pharmacy", label: "Pharmacies", icon: Pill, color: "text-pink-400" },
    { id: "bus_station", label: "Bus Stops", icon: Bus, color: "text-indigo-300" },
    { id: "train_station", label: "Railway Stations", icon: Train, color: "text-amber-300" },
    { id: "airport", label: "Airports", icon: Plane, color: "text-blue-400" },
  ];

  return (
    <div className="p-4 sm:p-5 rounded-3xl glass-panel border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>Nearby Places Filter</span>
        </h3>
        <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">Google Places API</span>
      </div>

      {/* Responsive Grid / Horizontal Scroll for Mobile */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComp = cat.icon;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`p-2.5 min-h-[44px] rounded-2xl text-xs font-medium flex items-center justify-between transition-all ${
                isSelected
                  ? "bg-indigo-600/30 text-white border border-indigo-500/50 shadow-glow"
                  : "bg-white/5 text-gray-300 border border-white/5 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className={`flex items-center gap-2 ${cat.color}`}>
                <IconComp className="w-4 h-4 shrink-0" />
                <span className="text-[11px] font-semibold truncate">{cat.label}</span>
              </span>
              {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
