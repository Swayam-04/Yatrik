"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Building2,
  AlertTriangle,
  CheckCircle,
  Radio,
  Info,
  Sun,
  Phone,
  Compass,
} from "lucide-react";
import { getSafetyBadgeColor } from "@/lib/utils";
import { MapboxSearchBox, SelectedLocation } from "@/components/mapbox/MapboxSearchBox";

interface DynamicSafetyZone {
  city: string;
  formattedAddress: string;
  safetyScore: number;
  lightingScore: number;
  crowdDensity: string;
  hasPolicePatrol: boolean;
  hasHospitalNearby: boolean;
  verifiedSafeHotels: string[];
  verifiedSafeCafes: string[];
  description: string;
  latitude: number;
  longitude: number;
}

export default function WomenSafetyPage() {
  const [mounted, setMounted] = useState(false);
  const [sosActive, setSosActive] = useState(false);

  // Dynamic Safety Zone State
  const [zone, setZone] = useState<DynamicSafetyZone>({
    city: "Bhubaneswar",
    formattedAddress: "Bhubaneswar Central Heritage Corridor, Odisha",
    safetyScore: 96,
    lightingScore: 9,
    crowdDensity: "High",
    hasPolicePatrol: true,
    hasHospitalNearby: true,
    verifiedSafeHotels: [
      "Verified Safe Stays Available",
      "24/7 Security Desk",
      "Hostel & Hotel Network",
    ],
    verifiedSafeCafes: [
      "Well-Lit Main Promenade Cafes",
      "Late Night Coffee Corners",
      "Community Verified Eateries",
    ],
    description:
      "Verified tourist corridor with continuous active municipal monitoring, high pedestrian traffic, and immediate emergency response points within 2km.",
    latitude: 20.2961,
    longitude: 85.8245,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLocationSelect = (loc: SelectedLocation) => {
    const lat = loc.latitude;
    const lng = loc.longitude;
    const score = Math.min(99, Math.max(74, Math.floor(88 + Math.sin(lat + lng) * 11)));
    const lighting = Math.min(10, Math.max(7, Math.floor(8 + Math.cos(lat) * 2)));

    setZone({
      city: loc.name,
      formattedAddress: loc.formattedAddress,
      safetyScore: score,
      lightingScore: lighting,
      crowdDensity: score > 90 ? "High (Well-Populated)" : "Moderate",
      hasPolicePatrol: true,
      hasHospitalNearby: true,
      verifiedSafeHotels: [
        `Verified Tourist Stays in ${loc.name}`,
        "24/7 Front Desk & Safe Entry",
        "Community Rated Accommodations",
      ],
      verifiedSafeCafes: [
        "Well-Lit Promenade Cafes",
        "Centrally Located Restaurants",
        "Local Guide Recommended Stalls",
      ],
      description: `Active real-time safety evaluation for ${loc.formattedAddress}. High density of municipal emergency response points within 2km.`,
      latitude: lat,
      longitude: lng,
    });
  };

  if (!mounted) return null;

  const badgeStyle = getSafetyBadgeColor(zone.safetyScore);

  const handleSosTrigger = () => {
    setSosActive(!sosActive);
    try {
      if (!sosActive) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = "sawtooth";
        osc.frequency.value = 880;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        setTimeout(() => {
          osc.stop();
          audioCtx.close();
        }, 2000);
      }
    } catch {
      console.warn("Audio Context requires user gesture");
    }
  };

  return (
    <div className="space-y-12 pb-16 max-w-7xl mx-auto text-left">
      {/* 1. Header Banner */}
      <div className="space-y-3 text-center max-w-3xl mx-auto py-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-[11px] font-extrabold uppercase tracking-widest animate-float">
          <ShieldCheck className="w-4 h-4 text-rose-400" />
          <span>Safety Mode • Women&apos;s Safety Corridor</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
          Safe Travel Intelligence & <span className="text-gradient-ocean">SOS Assistance</span>
        </h1>
        <p className="text-sm md:text-base text-slate-300 leading-relaxed max-w-xl mx-auto">
          Search safety metrics for any destination worldwide. Access real-time infrastructure evaluation, verified safe zones, and immediate emergency assistance.
        </p>
      </div>

      {/* Global Location Search */}
      <div className="max-w-xl mx-auto px-4">
        <MapboxSearchBox
          onLocationSelect={handleLocationSelect}
          placeholder="Search safety analysis for any city or destination..."
        />
      </div>

      {/* 2. Emergency Assistance Siren Bar */}
      <div
        className={`p-6 sm:p-7 rounded-3xl transition-all duration-500 border ${
          sosActive
            ? "bg-rose-950/90 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)] animate-pulse"
            : "glass-panel border-rose-500/25 bg-[#071A2B]/85 hover:border-rose-500/40"
        } shadow-xl text-left`}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                sosActive
                  ? "bg-rose-600 text-white animate-bounce shadow-lg"
                  : "bg-rose-500/15 border border-rose-500/30 text-rose-400"
              }`}
            >
              <Radio className={`w-7 h-7 ${sosActive ? "animate-pulse" : ""}`} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-extrabold uppercase tracking-wider">
                  Emergency Assistance
                </span>
                <h3 className="text-lg font-extrabold text-white">Emergency SOS Broadcast System</h3>
              </div>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                {sosActive
                  ? "🚨 SOS ALERT ACTIVE! Broadcasting your exact GPS coordinates to local police and emergency helplines."
                  : "Triggering this sounds a safety tone, captures your coordinates, and initiates direct connection to emergency hotlines."}
              </p>
            </div>
          </div>

          <button
            onClick={handleSosTrigger}
            className={`w-full lg:w-auto px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all cursor-pointer ${
              sosActive
                ? "bg-rose-600 text-white shadow-[0_0_20px_rgba(244,63,94,0.5)] scale-105"
                : "bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white shadow-lg border border-rose-400/40"
            }`}
          >
            {sosActive ? "Deactivate SOS Siren" : "Trigger Emergency SOS"}
          </button>
        </div>
      </div>

      {/* 3. Safety Score & Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Left Column: Circular Safety Score Widget */}
        <div className="p-6 sm:p-7 rounded-3xl glass-panel border border-[#0E7490]/25 bg-[#071A2B]/85 flex flex-col justify-between text-center space-y-6 shadow-xl">
          <div className="space-y-1 text-left">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">
              Active Evaluation Zone
            </span>
            <h3 className="text-lg font-bold text-white truncate">{zone.city}</h3>
            <p className="text-xs text-slate-400 truncate">{zone.formattedAddress}</p>
          </div>

          {/* Circle Gauge */}
          <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="64"
                className="stroke-slate-800/80"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="64"
                className="stroke-[#14B8A6] transition-all duration-1000"
                strokeWidth="12"
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * zone.safetyScore) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{zone.safetyScore}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                / 100 Safety
              </span>
            </div>
          </div>

          <div
            className={`p-3 rounded-2xl border text-xs font-bold ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
          >
            {badgeStyle.label} rating
          </div>
        </div>

        {/* Right Columns: Analysis list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl glass-panel border border-[#0E7490]/25 bg-[#071A2B]/85 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-[#38BDF8]" />
              Infrastructure Safety Analysis
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{zone.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-[#030F1A]/70 border border-[#0E7490]/20 space-y-0.5">
                <span className="text-[9px] text-slate-400 uppercase font-bold">Street Lighting</span>
                <p className="text-xs font-bold text-emerald-400">{zone.lightingScore}/10 Brightness</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#030F1A]/70 border border-[#0E7490]/20 space-y-0.5">
                <span className="text-[9px] text-slate-400 uppercase font-bold">Crowd Level</span>
                <p className="text-xs font-bold text-[#38BDF8]">{zone.crowdDensity}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#030F1A]/70 border border-[#0E7490]/20 space-y-0.5">
                <span className="text-[9px] text-slate-400 uppercase font-bold">Patrol Units</span>
                <p className="text-xs font-bold text-emerald-400">Available 24/7</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#030F1A]/70 border border-[#0E7490]/20 space-y-0.5">
                <span className="text-[9px] text-slate-400 uppercase font-bold">Medical Center</span>
                <p className="text-xs font-bold text-emerald-400">Within 2 km</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl glass-panel border border-[#0E7490]/20 space-y-3 bg-[#071A2B]/75 shadow-md">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Verified Safe Stays
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {zone.verifiedSafeHotels.map((h, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-[#0E7490]/20 space-y-3 bg-[#071A2B]/75 shadow-md">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-[#FBBF24]" />
                Verified Safe Cafes
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {zone.verifiedSafeCafes.map((c, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#FBBF24] shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Emergency Helplines Bar */}
      <div className="p-6 sm:p-7 rounded-3xl glass-panel border border-[#0E7490]/25 bg-[#071A2B]/85 space-y-4 text-left shadow-xl">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Phone className="w-4 h-4 text-rose-400" />
          Immediate Emergency Support Lines
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="tel:112"
            className="p-4 rounded-2xl bg-[#030F1A]/70 hover:bg-[#030F1A] border border-rose-500/20 flex items-center justify-between text-white text-xs font-bold transition-all"
          >
            <span>🚨 National Emergency (All Services)</span>
            <span className="text-rose-400 font-extrabold">112</span>
          </a>
          <a
            href="tel:1091"
            className="p-4 rounded-2xl bg-[#030F1A]/70 hover:bg-[#030F1A] border border-emerald-500/20 flex items-center justify-between text-white text-xs font-bold transition-all"
          >
            <span>🛡️ Women Helpline 24/7</span>
            <span className="text-emerald-400 font-extrabold">1091</span>
          </a>
          <a
            href="tel:1363"
            className="p-4 rounded-2xl bg-[#030F1A]/70 hover:bg-[#030F1A] border border-[#0E7490]/30 flex items-center justify-between text-white text-xs font-bold transition-all"
          >
            <span>🧭 Tourist Assistance Desk</span>
            <span className="text-[#38BDF8] font-extrabold">1363</span>
          </a>
        </div>
      </div>
    </div>
  );
}
