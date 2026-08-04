"use client";

import React from "react";
import { ShieldCheck, AlertTriangle, Moon, Users, HeartHandshake, Stethoscope } from "lucide-react";

interface CircularSafetyMeterProps {
  score: number; // 0 to 100
  metrics?: {
    crimeRisk: number;
    lighting: number;
    crowdDensity: number;
    womensSafety: number;
    emergencyAvailability: number;
    medicalAccess: number;
  };
}

export function CircularSafetyMeter({
  score = 92,
  metrics = {
    crimeRisk: 94,
    lighting: 88,
    crowdDensity: 78,
    womensSafety: 96,
    emergencyAvailability: 90,
    medicalAccess: 86,
  },
}: CircularSafetyMeterProps) {
  // Score Color Mapping
  let strokeColor = "#10b981"; // Green
  let badgeBg = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
  let statusText = "Highly Safe Zone";

  if (score >= 90) {
    strokeColor = "#10b981";
    badgeBg = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
    statusText = "Verified Highly Safe";
  } else if (score >= 70) {
    strokeColor = "#3b82f6";
    badgeBg = "bg-blue-500/10 border-blue-500/30 text-blue-400";
    statusText = "Moderately Safe";
  } else if (score >= 50) {
    strokeColor = "#f97316";
    badgeBg = "bg-orange-500/10 border-orange-500/30 text-orange-400";
    statusText = "Exercise Caution";
  } else {
    strokeColor = "#ef4444";
    badgeBg = "bg-rose-500/10 border-rose-500/30 text-rose-400";
    statusText = "High Risk Area";
  }

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const metricItems = [
    { label: "Crime Risk Index", value: metrics.crimeRisk, icon: ShieldCheck, color: "text-emerald-400" },
    { label: "Street Lighting Score", value: metrics.lighting, icon: Moon, color: "text-amber-400" },
    { label: "Crowd Density", value: metrics.crowdDensity, icon: Users, color: "text-indigo-400" },
    { label: "Women's Safety", value: metrics.womensSafety, icon: HeartHandshake, color: "text-pink-400" },
    { label: "Emergency Availability", value: metrics.emergencyAvailability, icon: AlertTriangle, color: "text-cyan-400" },
    { label: "Medical Access", value: metrics.medicalAccess, icon: Stethoscope, color: "text-rose-400" },
  ];

  return (
    <div className="p-5 rounded-3xl glass-panel border border-white/10 space-y-5 bg-gradient-to-br from-indigo-950/20 via-dark-bg to-dark-bg">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          AI Safety Meter
        </h3>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeBg}`}>
          {statusText}
        </span>
      </div>

      {/* SVG Circular Meter & Score Display */}
      <div className="flex items-center gap-6 justify-center py-2">
        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              className="stroke-white/10"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Animated Gauge */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={strokeColor}
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-out"
            />
          </svg>

          {/* Central Score Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-2xl font-extrabold text-white tracking-tight">{score}</span>
            <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">/ 100</span>
          </div>
        </div>

        <div className="space-y-1.5 text-xs">
          <p className="font-bold text-white">Zone Safety Rating</p>
          <p className="text-gray-400 text-[11px] leading-relaxed">
            Calculated via real-time police feeds, CCTV density, street lighting sensors & community reports.
          </p>
        </div>
      </div>

      {/* Breakdown Metrics Grid */}
      <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-white/10">
        {metricItems.map((m, i) => (
          <div key={i} className="p-2.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-gray-300 font-medium">
                <m.icon className={`w-3.5 h-3.5 ${m.color}`} />
                {m.label}
              </span>
              <span className="font-bold text-white">{m.value}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-700"
                style={{ width: `${m.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
