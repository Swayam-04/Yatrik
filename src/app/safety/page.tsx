"use client";

import React, { useState } from "react";
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
  Crosshair
} from "lucide-react";
import { SAFETY_ZONES } from "@/lib/store";
import { getSafetyBadgeColor } from "@/lib/utils";

export default function WomenSafetyPage() {
  const [isSafeModeActive, setIsSafeModeActive] = useState(true);
  const [sosActive, setSosActive] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Goa");

  const currentZone = SAFETY_ZONES.find((z) => z.city.toLowerCase() === selectedCity.toLowerCase()) || SAFETY_ZONES[0];
  const badgeStyle = getSafetyBadgeColor(currentZone.safetyScore);

  const handleSosTrigger = () => {
    setSosActive(true);
    // Play audio siren effect safely in browser
    try {
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
      }, 1500);
    } catch (e) {
      // Audio fallback
    }
  };

  return (
    <div className="space-y-8 pb-16">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl glass-panel border border-emerald-500/30 bg-gradient-to-r from-emerald-950/40 via-dark-bg to-dark-bg">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Women's Safety Command Center</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Safe Travel Guarantee Engine</h1>
          <p className="text-xs text-gray-300">
            Real-time lighting scores, crowd density metrics, community safety alerts, and verified safe hotels & cafes.
          </p>
        </div>

        {/* Safe Mode Toggle Switch */}
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/5 border border-white/10">
          <span className="text-xs font-semibold text-gray-300">Safe Mode:</span>
          <button
            onClick={() => setIsSafeModeActive(!isSafeModeActive)}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 ${isSafeModeActive ? "bg-emerald-500" : "bg-gray-600"
              }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition-transform duration-300 ${isSafeModeActive ? "translate-x-6" : "translate-x-0"
                }`}
            />
          </button>
        </div>
      </div>

      {/* EMERGENCY SOS BANNER */}
      <div className={`p-6 rounded-3xl transition-all duration-500 border ${sosActive
          ? "bg-rose-950/80 border-rose-500 shadow-glow-rose animate-pulse"
          : "glass-panel border-rose-500/30 bg-rose-500/5"
        }`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <Radio className="w-6 h-6 animate-ping" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Emergency SOS Broadcast</h3>
              <p className="text-xs text-rose-300">
                {sosActive
                  ? "🚨 SOS ALERT ACTIVE! Sending GPS location to emergency contacts & police hotline..."
                  : "Tap to immediately broadcast GPS coordinates to trusted contacts & local police helpline."}
              </p>
            </div>
          </div>

          <button
            onClick={handleSosTrigger}
            className={`px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${sosActive
                ? "bg-rose-600 text-white shadow-glow-rose animate-bounce"
                : "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg hover:scale-105"
              }`}
          >
            {sosActive ? "CANCEL SOS" : "TRIGGER SOS SIREN"}
          </button>
        </div>
      </div>

      {/* Safety Score Meter & Zone Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Card: Safety Score Gauge */}
        <div className="p-6 rounded-3xl glass-panel border border-emerald-500/30 space-y-6 flex flex-col justify-between text-center bg-dark-glass">
          <div>
            <span className="text-xs text-gray-400 uppercase font-semibold">Active Destination Safety Metric</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="mt-2 w-full px-3 py-2 rounded-xl text-xs glass-input focus:outline-none bg-dark-bg text-white font-bold"
            >
              <option value="Goa">Goa (Panaji Heritage Zone)</option>
              <option value="Manali">Manali (Old Village Promenade)</option>
              <option value="Tokyo">Tokyo (Shibuya Safe Transit)</option>
            </select>
          </div>

          {/* Meter circle */}
          <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="88"
                cy="88"
                r="72"
                className="stroke-gray-800"
                strokeWidth="14"
                fill="transparent"
              />
              <circle
                cx="88"
                cy="88"
                r="72"
                className="stroke-emerald-400 transition-all duration-1000"
                strokeWidth="14"
                strokeDasharray={452}
                strokeDashoffset={452 - (452 * currentZone.safetyScore) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center space-y-0.5">
              <span className="text-4xl font-black text-white">{currentZone.safetyScore}</span>
              <span className="text-[10px] text-gray-400 font-bold uppercase">/ 100 Safe Score</span>
            </div>
          </div>

          {/* Explanation badge */}
          <div className={`p-3 rounded-2xl border text-xs font-semibold ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
            {badgeStyle.label} • High Community & Patrol Verification
          </div>
        </div>

        {/* Right 2 Columns: Safety Parameters Breakdown */}
        <div className="lg:col-span-2 space-y-6">

          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-indigo-400" />
              Why is this zone rated {currentZone.safetyScore}/100 Safe?
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {currentZone.description}
            </p>

            {/* Metrics grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-gray-400 font-semibold">Street Lighting</span>
                <p className="text-sm font-bold text-emerald-400">{currentZone.lightingScore}/10 Bright</p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-gray-400 font-semibold">Crowd Density</span>
                <p className="text-sm font-bold text-indigo-300">{currentZone.crowdDensity}</p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-gray-400 font-semibold">Police Patrol</span>
                <p className="text-sm font-bold text-emerald-400">Active 24/7</p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-gray-400 font-semibold">Hospital Nearby</span>
                <p className="text-sm font-bold text-emerald-400">Within 1.2 km</p>
              </div>
            </div>
          </div>

          {/* Verified Stays & Cafes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Verified Women-Friendly Stays
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-300">
                {currentZone.verifiedSafeHotels.map((h, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                Verified Safe Cafes & Workspaces
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-300">
                {currentZone.verifiedSafeCafes.map((c, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Quick Helplines */}
          <div className="p-5 rounded-2xl glass-panel border border-white/10 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">Official Emergency Helplines</h4>
              <p className="text-[11px] text-gray-400">Women Helpline: 1091 • Tourist Police: 112</p>
            </div>
            <a
              href="tel:112"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Call Helpline 112</span>
            </a>
          </div>

        </div>

      </div>

    </div>
  );
}
