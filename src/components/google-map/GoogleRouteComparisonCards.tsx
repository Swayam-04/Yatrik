"use client";

import React from "react";
import { Zap, ShieldCheck, Mountain, DollarSign, Clock, Fuel, AlertCircle } from "lucide-react";
import { GoogleRouteSummary } from "@/app/api/external/google-routes/route";

interface GoogleRouteComparisonCardsProps {
  routes: GoogleRouteSummary[];
  selectedRouteId: string;
  onSelectRoute: (id: "Fastest" | "Safest" | "Scenic" | "Cheapest") => void;
}

export function GoogleRouteComparisonCards({
  routes = [],
  selectedRouteId,
  onSelectRoute,
}: GoogleRouteComparisonCardsProps) {
  const getIcon = (id: string) => {
    if (id === "Safest") return ShieldCheck;
    if (id === "Fastest") return Zap;
    if (id === "Scenic") return Mountain;
    return DollarSign;
  };

  const getBadgeStyle = (id: string) => {
    if (id === "Safest") return "border-emerald-500/30 bg-emerald-500/10 text-emerald-400";
    if (id === "Fastest") return "border-indigo-500/30 bg-indigo-500/10 text-indigo-400";
    if (id === "Scenic") return "border-pink-500/30 bg-pink-500/10 text-pink-400";
    return "border-amber-500/30 bg-amber-500/10 text-amber-400";
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" />
          Google Live Routes Comparison
        </h3>
        <span className="text-[10px] text-gray-400">{routes.length} Live Routes Evaluated</span>
      </div>

      <div className="space-y-2.5">
        {routes.map((r) => {
          const isSelected = selectedRouteId === r.id;
          const IconComp = getIcon(r.id);
          const badgeStyle = getBadgeStyle(r.id);

          return (
            <div
              key={r.id}
              onClick={() => onSelectRoute(r.id)}
              className={`p-3.5 rounded-2xl glass-panel border transition-all cursor-pointer space-y-2 ${
                isSelected
                  ? "border-indigo-500/60 bg-indigo-950/40 shadow-glow"
                  : "border-white/10 hover:border-white/20 bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-xl border ${badgeStyle}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {r.title}
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-bold border border-indigo-500/30">
                          ACTIVE
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1 font-semibold text-white">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        {r.durationMins}
                      </span>
                      <span>•</span>
                      <span>{r.distanceKm}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-extrabold text-emerald-400">
                    {r.safetyScore}/100 Safety
                  </div>
                  <span
                    className={`text-[10px] font-bold ${
                      r.trafficLevel === "Low" ? "text-emerald-400" : r.trafficLevel === "Moderate" ? "text-amber-400" : "text-rose-400"
                    }`}
                  >
                    Traffic: {r.trafficLevel}
                  </span>
                </div>
              </div>

              {/* Route Summary & Fuel / Toll details */}
              <div className="p-2 rounded-xl bg-white/5 text-[11px] text-gray-300 flex items-center justify-between">
                <span className="line-clamp-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  {r.routeSummary}
                </span>
                <span className="flex items-center gap-2 text-[10px] text-gray-400 shrink-0">
                  <span className="flex items-center gap-0.5">
                    <Fuel className="w-3 h-3 text-amber-400" /> {r.estimatedFuelLiters}L
                  </span>
                  <span>•</span>
                  <span>{r.tollCount > 0 ? `${r.tollCount} Toll` : "No Tolls"}</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
