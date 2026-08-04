"use client";

import React from "react";
import { Layers, Flame, Car, Users, Moon, CloudRain, Waves, Stethoscope, Check } from "lucide-react";

interface HeatmapOverlayToggleProps {
  activeHeatmaps: string[];
  onToggleHeatmap: (id: string) => void;
}

export function HeatmapOverlayToggle({ activeHeatmaps, onToggleHeatmap }: HeatmapOverlayToggleProps) {
  const heatmaps = [
    { id: "Crime", label: "Crime Heatmap", icon: Flame, color: "text-rose-400" },
    { id: "Traffic", label: "Traffic Density", icon: Car, color: "text-amber-400" },
    { id: "Crowd", label: "Crowd Density", icon: Users, color: "text-indigo-400" },
    { id: "Night", label: "Night Safety", icon: Moon, color: "text-cyan-400" },
    { id: "Weather", label: "Weather Risk", icon: CloudRain, color: "text-blue-400" },
    { id: "Flood", label: "Flood Zones", icon: Waves, color: "text-emerald-400" },
    { id: "Medical", label: "Medical Access", icon: Stethoscope, color: "text-pink-400" },
  ];

  return (
    <div className="p-5 rounded-3xl glass-panel border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          Spatial Heatmap Overlays
        </h3>
        <span className="text-[10px] text-gray-400">{activeHeatmaps.length} Active</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {heatmaps.map((hm) => {
          const isChecked = activeHeatmaps.includes(hm.id);
          const IconComp = hm.icon;

          return (
            <button
              key={hm.id}
              onClick={() => onToggleHeatmap(hm.id)}
              className={`p-2.5 rounded-2xl text-xs font-medium flex items-center justify-between transition-all ${
                isChecked
                  ? "bg-white/10 text-white border border-white/20 shadow-glow-sm"
                  : "bg-white/5 text-gray-400 border border-transparent hover:bg-white/5 hover:text-gray-200"
              }`}
            >
              <span className={`flex items-center gap-2 ${hm.color}`}>
                <IconComp className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold">{hm.label}</span>
              </span>
              {isChecked && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
