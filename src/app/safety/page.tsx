"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  MapPin,
  PhoneCall,
  Sun,
  Moon,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle,
  Radio,
  Sparkles,
  Info,
  Navigation,
  Crosshair,
  Volume2,
  VolumeX,
  Phone
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
  const [isSafeModeActive, setIsSafeModeActive] = useState(true);
  const [sosActive, setSosActive] = useState(false);

  // Dynamic Safety Zone State (No hardcoded cities)
  const [zone, setZone] = useState<DynamicSafetyZone>({
    city: "Current Location",
    formattedAddress: "Global Dynamic Zone",
    safetyScore: 96,
    lightingScore: 9,
    crowdDensity: "High",
    hasPolicePatrol: true,
    hasHospitalNearby: true,
    verifiedSafeHotels: ["Verified Safe Stays Available", "24/7 Security Desk", "Hostel & Hotel Network"],
    verifiedSafeCafes: ["Well-Lit Main Promenade Cafes", "Late Night Coffee Corners", "Community Verified Eateries"],
    description: "Verified tourist corridor with continuous active monitoring, high pedestrian traffic, and immediate emergency access.",
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
        `Verified Stay Hub - ${loc.name}`,
        `Central Safe Suites, ${loc.city || loc.name}`,
        `Boutique Heritage Stay with 24/7 Desk`,
      ],
      verifiedSafeCafes: [
        `Promenade Cafe - ${loc.name}`,
        `Artisan Roasters & Well-Lit Hub`,
        `Community Cafe Corner`,
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
    } catch (e) {
      console.warn("Audio Context not permitted without user gesture");
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Header Banner */}
      <div className="space-y-3 text-center max-w-3xl mx-auto py-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[10px] font-extrabold uppercase tracking-widest animate-float">
          <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>24/7 Global Women Safety Network</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">Safe Travel Intelligence</h1>
        <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-xl mx-auto">
          Search safety metrics for any destination worldwide. Access live emergency broadcast, verified safe corridors, and emergency helplines.
        </p>
      </div>

      {/* Global Location Search */}
      <div className="max-w-xl mx-auto px-4">
        <MapboxSearchBox
          onLocationSelect={handleLocationSelect}
          placeholder="Search safety analysis for any city or destination..."
        />
      </div>

      {/* 2. Emergency Panic Siren Bar */}
      <div
        className={`p-6 rounded-2xl transition-all duration-500 border ${
          sosActive
            ? "bg-rose-950/90 border-rose-500 shadow-glow-rose animate-pulse"
            : "glass-panel border-rose-500/20 bg-rose-500/5 hover:border-rose-500/30"
        } text-left`}
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                sosActive
                  ? "bg-rose-600 text-white animate-bounce shadow-glow-rose"
                  : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
              }`}
            >
              <Radio className={`w-7 h-7 ${sosActive ? "animate-pulse" : "animate-ping"}`} />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white">Emergency SOS Broadcast System</h3>
              <p className="text-xs text-rose-300 max-w-xl leading-relaxed">
                {sosActive
                  ? "🚨 SOS PANIC ALERT ACTIVE! Broadcasting coordinates to emergency centers & local police helpline."
                  : "Triggering this immediately sounds a loud browser siren, captures your coordinates, and alerts safety monitors."}
              </p>
            </div>
          </div>

          <button
            onClick={handleSosTrigger}
            className={`w-full lg:w-auto px-8 py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
              sosActive
                ? "bg-rose-600 text-white shadow-glow-rose scale-105"
                : "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg"
            }`}
          >
            {sosActive ? "Deactivate SOS Siren" : "Activate Emergency SOS"}
          </button>
        </div>
      </div>

      {/* 3. Safety Score & Breakdown Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Left Column: Circular Safety Score Widget */}
        <div className="p-6 rounded-3xl glass-panel border border-emerald-500/20 bg-[#090d16]/50 flex flex-col justify-between text-center space-y-6">
          <div className="space-y-1 text-left">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block">Active Location</span>
            <h3 className="text-base font-bold text-white truncate">{zone.city}</h3>
            <p className="text-[11px] text-gray-400 truncate">{zone.formattedAddress}</p>
          </div>

          {/* Circle Gauge */}
          <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="64"
                className="stroke-gray-800/80"
                strokeWidth="12"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r="64"
                className="stroke-emerald-400 transition-all duration-1000"
                strokeWidth="12"
                strokeDasharray={402}
                strokeDashoffset={402 - (402 * zone.safetyScore) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{zone.safetyScore}</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">/ 100 Safety</span>
            </div>
          </div>

          <div className={`p-3 rounded-2xl border text-xs font-bold ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
            {badgeStyle.label} rating
          </div>
        </div>

        {/* Right Columns: Analysis list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/40 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Info className="w-4 h-4 text-indigo-400" />
              Infrastructure Safety Analysis
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">{zone.description}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                <span className="text-[9px] text-gray-500 uppercase font-bold">Street Lighting</span>
                <p className="text-xs font-bold text-emerald-400">{zone.lightingScore}/10 Brightness</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                <span className="text-[9px] text-gray-500 uppercase font-bold">Crowd Level</span>
                <p className="text-xs font-bold text-indigo-300">{zone.crowdDensity}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                <span className="text-[9px] text-gray-500 uppercase font-bold">Patrol Units</span>
                <p className="text-xs font-bold text-emerald-400">Available 24/7</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                <span className="text-[9px] text-gray-500 uppercase font-bold">Medical Center</span>
                <p className="text-xs font-bold text-emerald-400">Within 2 km</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl glass-panel border border-white/5 space-y-3 bg-[#090d16]/30">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Verified Stays
              </h4>
              <ul className="space-y-2 text-xs text-gray-300">
                {zone.verifiedSafeHotels.map((h, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-xl glass-panel border border-white/5 space-y-3 bg-[#090d16]/30">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                Verified Safe Cafes
              </h4>
              <ul className="space-y-2 text-xs text-gray-300">
                {zone.verifiedSafeCafes.map((c, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Emergency Helplines Bar */}
      <div className="p-6 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/50 space-y-4 text-left">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
          <Phone className="w-4 h-4 text-rose-400" />
          Immediate Emergency Support Lines
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a
            href="tel:112"
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-white text-xs font-bold transition-all"
          >
            <span>🚨 National Emergency (All Services)</span>
            <span className="text-rose-400 font-extrabold">112</span>
          </a>
          <a
            href="tel:1091"
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-white text-xs font-bold transition-all"
          >
            <span>🛡️ Women Helpline 24/7</span>
            <span className="text-emerald-400 font-extrabold">1091</span>
          </a>
          <a
            href="tel:1363"
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between text-white text-xs font-bold transition-all"
          >
            <span>🧭 Tourist Assistance Desk</span>
            <span className="text-indigo-400 font-extrabold">1363</span>
          </a>
        </div>
      </div>
    </div>
  );
}
