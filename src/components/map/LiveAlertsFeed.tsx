"use client";

import React from "react";
import { AlertOctagon, CloudRain, Car, Construction, Radio, AlertTriangle } from "lucide-react";

export interface LiveAlert {
  id: string;
  type: "Road Closure" | "Accident" | "Heavy Rain" | "Construction" | "Traffic Jam";
  severity: "High" | "Medium" | "Low";
  location: string;
  message: string;
  timestamp: string;
}

export function LiveAlertsFeed() {
  const alerts: LiveAlert[] = [
    {
      id: "alt-1",
      type: "Road Closure",
      severity: "High",
      location: "Mandovi Bridge Northbound",
      message: "Scheduled heritage maintenance corridor. Detour via Chogm Bypass.",
      timestamp: "10 mins ago",
    },
    {
      id: "alt-2",
      type: "Heavy Rain",
      severity: "Medium",
      location: "Baga-Calangute Coastal Stretch",
      message: "Sudden monsoon shower. Drive cautiously on coastal curves.",
      timestamp: "25 mins ago",
    },
    {
      id: "alt-3",
      type: "Construction",
      severity: "Low",
      location: "Panaji Promenade West",
      message: "Pedestrian walkway lighting enhancement in progress.",
      timestamp: "1 hour ago",
    },
  ];

  return (
    <div className="p-5 rounded-3xl glass-panel border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Radio className="w-4 h-4 text-rose-400 animate-pulse" />
          Live Safety & Road Alerts
        </h3>
        <span className="text-[10px] text-gray-400">Real-Time GPS Sync</span>
      </div>

      <div className="space-y-2.5">
        {alerts.map((a) => {
          const isHigh = a.severity === "High";
          const isMed = a.severity === "Medium";

          return (
            <div
              key={a.id}
              className={`p-3 rounded-2xl border text-xs space-y-1 ${
                isHigh
                  ? "bg-rose-500/10 border-rose-500/30 text-rose-200"
                  : isMed
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                  : "bg-white/5 border-white/10 text-gray-300"
              }`}
            >
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  {a.type}
                </span>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase border ${
                    isHigh
                      ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                      : "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  }`}
                >
                  {a.severity} Severity
                </span>
              </div>
              <p className="text-[11px] leading-relaxed opacity-90">{a.message}</p>
              <div className="flex items-center justify-between text-[10px] opacity-75 pt-1">
                <span>📍 {a.location}</span>
                <span>{a.timestamp}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
