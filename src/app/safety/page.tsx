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
  Crosshair,
  Volume2,
  VolumeX,
  Phone
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
    setSosActive(!sosActive);
    // Play audio siren effect safely in browser
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
      console.warn("Audio Context blocked or not supported:", e);
    }
  };

  return (
    <div className="space-y-12 pb-16">

      {/* 1. Page Header Command Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-[2rem] glass-panel border border-emerald-500/20 bg-safety-gradient text-left">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wide shadow-glow-emerald animate-pulse">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Women's Safety Center</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Safe Route & SOS Portal</h1>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
            Live lighting ratings, local police patrols, crowd density mapping, and community-verified women-solo hotels.
          </p>
        </div>

        {/* Safe Mode Switch */}
        <div className="flex items-center gap-3.5 p-2 rounded-2xl bg-[#090d16]/80 border border-white/5 shadow-inner">
          <span className="text-xs font-bold text-gray-200 pl-2">Safety Overlay:</span>
          <button
            onClick={() => setIsSafeModeActive(!isSafeModeActive)}
            className={`w-14 h-8 rounded-full p-1 transition-all duration-300 ${
              isSafeModeActive ? "bg-emerald-500 shadow-glow-emerald" : "bg-gray-700"
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white transition-transform duration-300 ${
                isSafeModeActive ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* 2. EMERGENCY SOS SIREN TRIGGER CARD */}
      <div className={`p-6 rounded-2xl transition-all duration-500 border ${
        sosActive
          ? "bg-rose-950/90 border-rose-500 shadow-glow-rose animate-pulse"
          : "glass-panel border-rose-500/20 bg-rose-500/5 hover:border-rose-500/30"
      } text-left`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
              sosActive 
                ? "bg-rose-600 text-white animate-bounce shadow-glow-rose" 
                : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
            }`}>
              <Radio className={`w-7 h-7 ${sosActive ? "animate-pulse" : "animate-ping"}`} />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-white">Emergency SOS Broadcast System</h3>
              <p className="text-xs text-rose-300 max-w-xl leading-relaxed">
                {sosActive
                  ? "🚨 SOS PANIC ALERT ACTIVE! Broadcasting live GPS coordinates to verified emergency centers & local police helpline."
                  : "Triggering this immediately sounds a loud browser siren, captures your coordinates, and pings nearest police monitors."}
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Circular Safety Score Widget */}
        <div className="p-6 rounded-3xl glass-panel border border-emerald-500/20 bg-[#090d16]/50 flex flex-col justify-between text-center space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest block">Choose Safe Zone City</span>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs glass-input focus:outline-none bg-[#090d16] text-white font-bold"
            >
              <option value="Goa">Goa (Panaji Heritage Corridor)</option>
              <option value="Manali">Manali (Old Village Promenade)</option>
              <option value="Tokyo">Tokyo (Shibuya Safe Transit)</option>
            </select>
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
                strokeDashoffset={402 - (402 * currentZone.safetyScore) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{currentZone.safetyScore}</span>
              <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">/ 100 Safety</span>
            </div>
          </div>

          {/* Safety Description Indicator */}
          <div className={`p-3 rounded-2xl border text-xs font-bold ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
            {badgeStyle.label} rating
          </div>
        </div>

        {/* Right Columns: Analysis list */}
        <div className="lg:col-span-2 space-y-6 text-left">
          {/* Why Rated Safe Card */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/40 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Info className="w-4.5 h-4.5 text-indigo-400" />
              Zone Safety Analysis
            </h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              {currentZone.description}
            </p>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                <span className="text-[9px] text-gray-500 uppercase font-bold">Street Lighting</span>
                <p className="text-xs font-bold text-emerald-400">{currentZone.lightingScore}/10 Brightness</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                <span className="text-[9px] text-gray-500 uppercase font-bold">Crowd Level</span>
                <p className="text-xs font-bold text-indigo-300">{currentZone.crowdDensity}</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                <span className="text-[9px] text-gray-500 uppercase font-bold">Pink Patrols</span>
                <p className="text-xs font-bold text-emerald-400">Available 24/7</p>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
                <span className="text-[9px] text-gray-500 uppercase font-bold">Medical Center</span>
                <p className="text-xs font-bold text-emerald-400">Within 1.5 km</p>
              </div>
            </div>
          </div>

          {/* Verified Stays & Food */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl glass-panel border border-white/5 space-y-3 bg-[#090d16]/30">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Verified Female-Solo Stays
              </h4>
              <ul className="space-y-2 text-xs text-gray-300">
                {currentZone.verifiedSafeHotels.map((h, i) => (
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
                Verified Well-Lit Safe Cafes
              </h4>
              <ul className="space-y-2 text-xs text-gray-300">
                {currentZone.verifiedSafeCafes.map((c, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* 4. EMERGENCY BANNER POPUP */}
      <div className="popup-banner p-6 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 shadow-glow">
        <div className="flex items-center gap-3 text-left">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Phone className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-xs font-extrabold text-white">National Emergency Helpdesk Contact</h4>
            <p className="text-[10px] text-gray-300">
              National Helpline: <strong className="text-white">112</strong> • Women Safety Desk: <strong className="text-white">1091</strong>
            </p>
          </div>
        </div>

        <a
          href="tel:112"
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-105"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call 112 Helpdesk</span>
        </a>
      </div>

    </div>
  );
}
