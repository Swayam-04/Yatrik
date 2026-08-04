"use client";

import React from "react";
import { ShieldCheck, Zap, DollarSign, Mountain, Clock, Navigation, AlertCircle } from "lucide-react";

export interface RouteOption {
  id: "Safest" | "Fastest" | "Cheapest" | "Scenic";
  title: string;
  badgeColor: string;
  icon: React.ElementType;
  time: string;
  distance: string;
  safetyScore: number;
  traffic: "Low" | "Moderate" | "Heavy";
  riskLevel: "Minimal Risk" | "Low Risk" | "Moderate Caution";
  aiExplanation: string;
}

interface AiRouteComparisonProps {
  selectedRouteId: string;
  onSelectRoute: (id: "Safest" | "Fastest" | "Cheapest" | "Scenic") => void;
}

export function AiRouteComparison({ selectedRouteId, onSelectRoute }: AiRouteComparisonProps) {
  const routes: RouteOption[] = [
    {
      id: "Safest",
      title: "Safest Route",
      badgeColor: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
      icon: ShieldCheck,
      time: "24 mins",
      distance: "14.2 km",
      safetyScore: 98,
      traffic: "Low",
      riskLevel: "Minimal Risk",
      aiExplanation: "Passes through continuous high-lighting corridors and 24/7 CCTV police check-posts.",
    },
    {
      id: "Fastest",
      title: "Fastest Route",
      badgeColor: "border-indigo-500/30 bg-indigo-500/10 text-indigo-400",
      icon: Zap,
      time: "18 mins",
      distance: "12.8 km",
      safetyScore: 84,
      traffic: "Moderate",
      riskLevel: "Low Risk",
      aiExplanation: "Takes Panaji Expressway bypass. Faster speed with well-monitored toll plazas.",
    },
    {
      id: "Cheapest",
      title: "Cheapest Route",
      badgeColor: "border-amber-500/30 bg-amber-500/10 text-amber-400",
      icon: DollarSign,
      time: "22 mins",
      distance: "13.5 km",
      safetyScore: 89,
      traffic: "Low",
      riskLevel: "Low Risk",
      aiExplanation: "Avoids toll gates while staying on populated arterial transit roads.",
    },
    {
      id: "Scenic",
      title: "Scenic Route",
      badgeColor: "border-pink-500/30 bg-pink-500/10 text-pink-400",
      icon: Mountain,
      time: "28 mins",
      distance: "16.1 km",
      safetyScore: 92,
      traffic: "Low",
      riskLevel: "Minimal Risk",
      aiExplanation: "Follows coastal Promenade and heritage Latin quarter with scenic river views.",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Navigation className="w-4 h-4 text-indigo-400" />
          AI Route Comparison
        </h3>
        <span className="text-[10px] text-gray-400">4 Optimal Paths Evaluated</span>
      </div>

      <div className="space-y-2.5">
        {routes.map((r) => {
          const isSelected = selectedRouteId === r.id;
          const IconComp = r.icon;

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
                  <div className={`p-1.5 rounded-lg border ${r.badgeColor}`}>
                    <IconComp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {r.title}
                      {isSelected && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[9px] font-bold">
                          ACTIVE
                        </span>
                      )}
                    </h4>
                    <p className="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        {r.time}
                      </span>
                      <span>•</span>
                      <span>{r.distance}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs font-extrabold text-emerald-400">
                    {r.safetyScore}/100 Safe
                  </div>
                  <span className="text-[10px] text-gray-400">Traffic: {r.traffic}</span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/5 text-[11px] text-gray-300 flex items-start gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>"{r.aiExplanation}"</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
