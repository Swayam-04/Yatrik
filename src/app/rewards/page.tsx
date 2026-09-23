"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Coins,
  Award,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  Compass,
  Gift,
  ShieldCheck,
  Plane,
} from "lucide-react";
import { INITIAL_USER } from "@/lib/store";

interface PassportStamp {
  id: string;
  name: string;
  icon: string;
  location: string;
  category: string;
  milesEarned: number;
  unlocked: boolean;
  unlockedDate?: string;
  criteria: string;
}

const PASSPORT_STAMPS: PassportStamp[] = [
  {
    id: "stamp-beach",
    name: "Beach Explorer",
    icon: "🏝️",
    location: "Puri & Konark Coastline",
    category: "Coastal Expeditions",
    milesEarned: 350,
    unlocked: true,
    unlockedDate: "Sep 2026",
    criteria: "Discovered 5 verified coastal viewpoints and beaches",
  },
  {
    id: "stamp-mountain",
    name: "Mountain Seeker",
    icon: "🏔️",
    location: "Daringbadi & Deomali Peaks",
    category: "Altitude Trails",
    milesEarned: 400,
    unlocked: true,
    unlockedDate: "Aug 2026",
    criteria: "Explored 3 mountain peaks and hill trails",
  },
  {
    id: "stamp-food",
    name: "Food Explorer",
    icon: "🍜",
    location: "Old Town Temple Food Corridors",
    category: "Culinary Discoveries",
    milesEarned: 300,
    unlocked: true,
    unlockedDate: "Sep 2026",
    criteria: "Tasted authentic local heritage cuisine at 5 verified spots",
  },
  {
    id: "stamp-local",
    name: "Local Discoverer",
    icon: "🧭",
    location: "Koraput Artisan Villages",
    category: "Hidden Gems",
    milesEarned: 250,
    unlocked: true,
    unlockedDate: "Jul 2026",
    criteria: "Visited 3 off-beat tribal art and coffee estates",
  },
  {
    id: "stamp-safety",
    name: "Safety Champion",
    icon: "🛡️",
    location: "Verified Night Promenades",
    category: "Safe Corridors",
    milesEarned: 150,
    unlocked: true,
    unlockedDate: "Sep 2026",
    criteria: "Submitted verified safety ratings for women travelers",
  },
  {
    id: "stamp-heritage",
    name: "Heritage Curator",
    icon: "🏛️",
    location: "Sun Temple & Buddhist Diamond Triangle",
    category: "World Heritage",
    milesEarned: 500,
    unlocked: false,
    criteria: "Explore 5 UNESCO & ASI protected historic sites (2/5 visited)",
  },
];

export default function RewardsPage() {
  const [mounted, setMounted] = useState(false);
  const currentMiles = INITIAL_USER.coins || 1450;
  const targetMiles = 2000;
  const progressPercent = Math.min(100, Math.round((currentMiles / targetMiles) * 100));

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-10 pb-20 max-w-7xl mx-auto text-left">
      {/* 1. Header Banner */}
      <div className="p-6 sm:p-8 rounded-[2rem] glass-panel border border-[#F59E0B]/30 bg-hero-gradient space-y-3 shadow-2xl">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/35 text-[#FBBF24] text-[10px] font-extrabold uppercase tracking-widest animate-float">
          <Trophy className="w-3.5 h-3.5 text-[#FBBF24]" />
          <span>YATRIK Frequent Explorer Loyalty Program</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Explorer Miles & <span className="text-gradient-gold">Passport Stamps</span>
        </h1>

        <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
          Collect digital passport stamps on every journey, earn travel miles, and unlock verified explorer privileges.
        </p>
      </div>

      {/* 2. Loyalty Status & Miles Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tier Card */}
        <div className="p-6 rounded-3xl glass-panel border border-[#F59E0B]/30 bg-[#071A2B]/85 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#FBBF24]">
              Current Status
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FBBF24]/20 border border-[#FBBF24]/40 text-[#FBBF24] text-[10px] font-extrabold">
              Silver Explorer
            </span>
          </div>

          <div>
            <div className="text-4xl font-extrabold text-white flex items-center gap-2">
              <span>{currentMiles.toLocaleString()}</span>
              <span className="text-lg text-[#FBBF24] font-semibold">Miles</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              550 more miles to reach <strong>Gold Explorer Status</strong>
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
              <span>Progress to Gold Tier</span>
              <span className="text-[#FBBF24]">{progressPercent}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#030F1A] border border-[#0E7490]/30 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F59E0B] via-[#FBBF24] to-[#14B8A6] rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Benefits Card */}
        <div className="p-6 rounded-3xl glass-panel border border-[#0E7490]/25 bg-[#071A2B]/85 space-y-3 shadow-xl">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#38BDF8]">
            Tier Privileges
          </span>
          <h3 className="text-lg font-bold text-white">Silver Tier Perks</h3>
          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0" />
              <span>Unlimited Gemma 4 itinerary generation</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0" />
              <span>Exclusive Hidden Gem access badges</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#14B8A6] shrink-0" />
              <span>Priority verified women safety routing</span>
            </li>
          </ul>
        </div>

        {/* How to Earn */}
        <div className="p-6 rounded-3xl glass-panel border border-[#0E7490]/25 bg-[#071A2B]/85 space-y-3 shadow-xl">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#14B8A6]">
            Ways to Earn Miles
          </span>
          <h3 className="text-lg font-bold text-white">Fast-Track Points</h3>
          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#030F1A]/70 border border-[#0E7490]/20">
              <span>Generate AI Journey</span>
              <strong className="text-[#FBBF24] font-bold">+100 Miles</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#030F1A]/70 border border-[#0E7490]/20">
              <span>Write Field Journal</span>
              <strong className="text-[#FBBF24] font-bold">+100 Miles</strong>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#030F1A]/70 border border-[#0E7490]/20">
              <span>Verify Place Safety</span>
              <strong className="text-[#FBBF24] font-bold">+50 Miles</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Passport Stamps Collection Showcase */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#0E7490]/20 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
              <span>Digital Passport Stamps</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30 font-bold">
                5 Unlocked
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Stamps automatically minted when exploring real destinations
            </p>
          </div>

          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#38BDF8] hover:text-[#14B8A6] transition-colors"
          >
            <span>Discover more destinations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Passport Stamp Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PASSPORT_STAMPS.map((stamp) => (
            <div
              key={stamp.id}
              className={`p-6 rounded-3xl glass-panel border transition-all duration-300 space-y-4 relative overflow-hidden text-left ${
                stamp.unlocked
                  ? "bg-[#071A2B]/85 border-[#F59E0B]/40 hover:border-[#FBBF24] shadow-[0_0_20px_rgba(245,158,11,0.15)]"
                  : "bg-[#030F1A]/70 border-white/10 opacity-70"
              }`}
            >
              {/* Top Meta */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {stamp.category}
                </span>

                {stamp.unlocked ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FBBF24]/15 border border-[#FBBF24]/40 text-[#FBBF24] text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Stamped • {stamp.unlockedDate}</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[10px] font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Locked</span>
                  </span>
                )}
              </div>

              {/* Stamp Visual Emblem */}
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg border-2 ${
                    stamp.unlocked
                      ? "bg-[#F5EBDD] border-[#F59E0B] shadow-[0_0_15px_rgba(245,158,11,0.25)]"
                      : "bg-[#030F1A] border-white/10 grayscale"
                  }`}
                >
                  {stamp.icon}
                </div>

                <div className="space-y-0.5">
                  <h3 className="text-base font-extrabold text-white">{stamp.name}</h3>
                  <p className="text-xs text-slate-400">{stamp.location}</p>
                  <span className="inline-block text-[11px] font-bold text-[#FBBF24]">
                    +{stamp.milesEarned} Miles
                  </span>
                </div>
              </div>

              {/* Criteria */}
              <p className="text-xs text-slate-300 leading-relaxed border-t border-[#0E7490]/20 pt-3">
                {stamp.criteria}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
