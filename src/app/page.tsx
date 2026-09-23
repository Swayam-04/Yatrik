"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useAuthModal } from "@/components/auth/AuthModalContext";
import {
  Sparkles,
  Search,
  MapPin,
  ShieldCheck,
  Coins,
  Compass,
  ArrowRight,
  Users,
  Star,
  Shield,
  Heart,
  ChevronRight,
  Calendar,
  Wallet,
  Compass as CompassIcon,
  Flame,
  Gem,
  Award
} from "lucide-react";
import { INITIAL_REVIEWS } from "@/lib/store";
import { MapboxSearchBox, SelectedLocation } from "@/components/mapbox/MapboxSearchBox";

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { requireAuth } = useAuthModal();
  const [activeTab, setActiveTab] = useState<"all" | "beach" | "mountain" | "heritage">("all");

  // Compact Planner Widget State
  const [plannerDates, setPlannerDates] = useState("4");
  const [plannerBudget, setPlannerBudget] = useState("25000");
  const [plannerStyle, setPlannerStyle] = useState("Solo");

  const handleLocationSelect = (loc: SelectedLocation) => {
    requireAuth(() => {
      router.push(
        `/plan?destination=${encodeURIComponent(loc.name)}&lat=${loc.latitude}&lng=${loc.longitude}&address=${encodeURIComponent(loc.formattedAddress)}&budget=${plannerBudget}&travelType=${plannerStyle}`
      );
    });
  };

  const handleFeatureNavigate = (href: string) => {
    requireAuth(() => {
      router.push(href);
    });
  };

  const popularDestinations = [
    {
      name: "Goa, India",
      tag: "Tropical & Nightlife",
      safetyScore: 96,
      rating: 4.8,
      description: "Sun-kissed beaches, historic Portuguese architecture, and vibrant coastal food cultures.",
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80",
      type: "beach",
      estBudget: "₹18,000",
    },
    {
      name: "Tokyo, Japan",
      tag: "Futuristic & Culinary",
      safetyScore: 99,
      rating: 4.9,
      description: "Neon skyscrapers, serene shinto shrines, and world-class street culinary experiences.",
      image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
      type: "heritage",
      estBudget: "₹1,10,000",
    },
    {
      name: "Old Manali, Himachal",
      tag: "Serene & Secret Cafes",
      safetyScore: 93,
      rating: 4.7,
      description: "Snow-covered peaks, rustic log cabins, pine forests, and slow-paced coffee shops.",
      image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80",
      type: "mountain",
      estBudget: "₹12,500",
    },
    {
      name: "Kyoto, Japan",
      tag: "Temples & Tea Gardens",
      safetyScore: 98,
      rating: 4.8,
      description: "Traditional wooden houses, majestic golden pavilions, and tranquil bamboo forests.",
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
      type: "heritage",
      estBudget: "₹95,000",
    },
  ];

  const hiddenGems = [
    {
      title: "Butterfly Beach Cove",
      location: "South Goa",
      description: "A secluded golden sand beach accessible only by a short forest hike or water boat.",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
      tags: ["Secret Beach", "Low Crowd"]
    },
    {
      title: "Sethi Rooftop Library Cafe",
      location: "Old Manali",
      description: "Cozy attic library serving Himalayan herbal tea with 360-degree snow-capped peak views.",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80",
      tags: ["Slow Coffee", "Scenic View"]
    }
  ];

  const filteredDestinations = activeTab === "all" 
    ? popularDestinations 
    : popularDestinations.filter(d => d.type === activeTab);

  return (
    <div className="space-y-24 py-4 md:py-8">
      
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-b from-[#071A2B] via-[#051423] to-[#030F1A] border border-[#14B8A6]/20 p-6 sm:p-14 lg:p-16 shadow-2xl flex flex-col items-center justify-center text-center space-y-10">
        {/* Subtle Travel Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#14B8A6]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-8 right-1/4 w-96 h-96 bg-[#0E7490]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Dynamic Travel Intelligence Banner */}
        <div className="px-4 py-1.5 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/25 flex items-center gap-2 text-[#38BDF8] text-xs font-semibold shadow-sm">
          <Compass className="w-3.5 h-3.5 text-[#14B8A6] animate-spin-slow" />
          <span>YATRIK 2.0: <strong className="text-white">Discover places. Plan smarter. Travel safer.</strong></span>
          <ChevronRight className="w-3.5 h-3.5 text-[#14B8A6]" />
        </div>

        {/* Primary Headline & Copy */}
        <div className="space-y-4 max-w-4xl">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.1]">
            Plan smarter. <br />
            <span className="text-gradient-ocean">Explore fearlessly.</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Real dynamic locations, AI-crafted journey timelines, safety intelligence, and authentic field stories for modern travelers worldwide.
          </p>
        </div>

        {/* Call to Actions (CTAs) */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => handleFeatureNavigate("/plan")}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#14B8A6] via-[#0E7490] to-[#0284C7] hover:brightness-110 text-white font-bold text-sm shadow-[0_4px_20px_rgba(20,184,166,0.35)] transition-all hover:scale-105"
          >
            Start Journey Planner
          </button>
          <button
            onClick={() => handleFeatureNavigate("/explore")}
            className="px-6 py-3.5 rounded-xl bg-[#030F1A]/80 border border-[#14B8A6]/30 hover:border-[#14B8A6]/60 text-white font-bold text-sm transition-all hover:bg-[#071A2B]"
          >
            Explore Global Destinations
          </button>
        </div>

        {/* Compact AI Planning Widget (Inside Hero) */}
        <div className="w-full max-w-4xl p-6 rounded-2xl border border-[#14B8A6]/20 shadow-2xl bg-[#030F1A]/80 backdrop-blur-xl text-left space-y-4">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#38BDF8]" />
            Quick AI Itinerary Builder
          </h3>
          
          <div className="space-y-4">
            {/* Global Mapbox Destination Search */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#14B8A6]" />
                Where do you want to go?
              </label>
              <MapboxSearchBox
                onLocationSelect={handleLocationSelect}
                placeholder="Search any destination worldwide (e.g. Paris, Tokyo, Bhubaneswar, Eiffel Tower)..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              {/* Duration */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#38BDF8]" />
                  Duration (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="14"
                  value={plannerDates}
                  onChange={(e) => setPlannerDates(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#071A2B] border border-white/10 text-white focus:outline-none focus:border-[#14B8A6]/60 focus:ring-1 focus:ring-[#14B8A6]/30"
                />
              </div>

              {/* Budget */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-[#F59E0B]" />
                  Max Budget (₹)
                </label>
                <input
                  type="number"
                  step="5000"
                  value={plannerBudget}
                  onChange={(e) => setPlannerBudget(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#071A2B] border border-white/10 text-white focus:outline-none focus:border-[#14B8A6]/60 focus:ring-1 focus:ring-[#14B8A6]/30"
                />
              </div>

              {/* Travel Style */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1">
                  <Users className="w-3 h-3 text-[#14B8A6]" />
                  Travel Style
                </label>
                <select
                  value={plannerStyle}
                  onChange={(e) => setPlannerStyle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-[#071A2B] border border-white/10 text-white focus:outline-none focus:border-[#14B8A6]/60 focus:ring-1 focus:ring-[#14B8A6]/30"
                >
                  <option value="Solo">Solo Traveler</option>
                  <option value="Women Solo">Women Solo Safe</option>
                  <option value="Couple">Couple / Romantic</option>
                  <option value="Family">Family Adventure</option>
                  <option value="Friends">Friends Group</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRENDING DESTINATIONS */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <Flame className="w-6.5 h-6.5 text-amber-500" />
              Trending Destinations
            </h2>
            <p className="text-sm text-gray-400">Discover popular traveler getaways with integrated budgets and safety indexes</p>
          </div>

          {/* Filter Tab bar */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#030F1A]/80 border border-[#14B8A6]/20 text-xs">
            {(["all", "beach", "mountain", "heritage"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-all ${
                  activeTab === tab
                    ? "bg-[#14B8A6] text-white font-bold shadow-[0_2px_12px_rgba(20,184,166,0.3)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Destination grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDestinations.map((dest, i) => (
            <div
              key={i}
              className="group rounded-2xl overflow-hidden bg-[#071A2B]/70 border border-[#14B8A6]/15 hover:border-[#14B8A6]/40 transition-all duration-300 hover:-translate-y-1 flex flex-col shadow-lg"
            >
              {/* Card Image banner */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Float safety score */}
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#030F1A]/85 backdrop-blur-md border border-emerald-500/30 text-[10px] font-bold text-emerald-400 flex items-center gap-1 shadow-sm">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{dest.safetyScore} Safety</span>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] text-amber-400 font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  {dest.rating}
                </div>
              </div>

              {/* Card Content body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#14B8A6]">{dest.tag}</span>
                  <h3 className="text-base font-extrabold text-white group-hover:text-[#38BDF8] transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {dest.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Average Budget</p>
                    <p className="text-xs font-extrabold text-[#FBBF24]">{dest.estBudget}</p>
                  </div>

                  <button
                    onClick={() => handleFeatureNavigate(`/plan?destination=${encodeURIComponent(dest.name.split(",")[0])}`)}
                    className="p-2 rounded-xl bg-[#14B8A6]/15 hover:bg-[#14B8A6] text-[#38BDF8] hover:text-white transition-all duration-300 hover:scale-105"
                    title="Plan this trip"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. HIDDEN GEMS (Lesser-known Spots) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/25 text-[#FBBF24] text-xs font-bold">
            <Gem className="w-3.5 h-3.5" />
            <span>Off the Beaten Path</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            Uncover Local <br />
            <span className="text-gradient-gold">Hidden Gems</span>
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            Avoid crowded tourist traps. Explore quiet waterfalls, panoramic mountain viewpoints, and secret coffee counters verified by authentic traveler reports.
          </p>
          <div>
            <button
              onClick={() => handleFeatureNavigate("/explore")}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#38BDF8] hover:text-[#14B8A6] transition-colors underline-animated"
            >
              Browse all hidden gems
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Gems Visual Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {hiddenGems.map((gem, index) => (
            <div key={index} className="group rounded-2xl overflow-hidden bg-[#071A2B]/80 border border-[#14B8A6]/20 hover:border-[#14B8A6]/50 transition-all duration-300 relative h-64 flex flex-col justify-end p-5 shadow-lg">
              {/* Background cover image */}
              <div className="absolute inset-0 z-0">
                <img
                  src={gem.image}
                  alt={gem.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-[0.4]"
                />
              </div>

              {/* Details Content Overlay */}
              <div className="relative z-10 space-y-2">
                <div className="flex gap-1.5">
                  {gem.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="px-2 py-0.5 rounded bg-[#F59E0B]/20 text-[9px] font-bold text-[#FBBF24] border border-[#F59E0B]/30">
                      {tag}
                    </span>
                  ))}
                </div>
                
                <h3 className="text-base font-extrabold text-white group-hover:text-[#38BDF8] transition-colors">
                  {gem.title}
                </h3>
                
                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {gem.description}
                </p>

                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#14B8A6]" /> {gem.location}</span>
                  <span className="flex items-center gap-0.5 font-semibold text-[#FBBF24]"><Star className="w-3 h-3 fill-[#FBBF24] text-[#FBBF24]" /> {gem.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. DEDICATED WOMEN'S SAFETY MODE BANNER */}
      <section className="rounded-3xl border border-emerald-500/25 p-8 sm:p-12 bg-gradient-to-r from-[#031E18]/80 via-[#071A2B]/90 to-[#030F1A] relative overflow-hidden space-y-6 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold shadow-sm">
              <Shield className="w-3.5 h-3.5" />
              <span>Dedicated Safety Center</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
              Women's Safety Mode
            </h2>
            
            <p className="text-slate-300 text-sm leading-relaxed">
              Plan and navigate with confidence. Our engine forecasts lighting quality scores, maps crowd densities, identifies local police stations/hospitals, and highlights verified female-solo hotels.
            </p>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 pt-2">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Well-Lit Safe Routing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Crowd Density Sensors</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Community Safety Alerts</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Verified Women-Solo Stays</span>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-6">
            <div className="p-6 rounded-2xl border border-emerald-500/25 text-center space-y-1 bg-[#030F1A]/80 w-full sm:w-56 shadow-lg">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Active Safety Score</p>
              <div className="text-4xl font-black text-emerald-400">97/100</div>
              <p className="text-[10px] text-emerald-300 font-semibold">Panaji Heritage Zone • Very Safe</p>
            </div>

            <button
              onClick={() => handleFeatureNavigate("/safety")}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-[#14B8A6] hover:brightness-110 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Explore Safety Mode</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. COMMUNITY REVIEWS & HACKS */}
      <section className="space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/25 text-[#FBBF24] text-xs font-bold">
            <Users className="w-3.5 h-3.5 animate-pulse" />
            <span>Community Intelligence</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Authentic Reports. Real Travel Expenses.</h2>
          <p className="text-sm text-slate-400">
            Real travelers share cost reports, scam alerts, and local food guides. Earn coins and achievements while helping others.
          </p>
        </div>

        {/* Editorial Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_REVIEWS.map((rev) => (
            <div key={rev.id} className="p-6 rounded-2xl bg-[#071A2B]/75 border border-[#14B8A6]/15 hover:border-[#14B8A6]/40 transition-all duration-300 space-y-4 flex flex-col justify-between shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={rev.userAvatar} alt={rev.userName} className="w-8 h-8 rounded-xl object-cover ring-2 ring-[#14B8A6]/30" />
                    <div>
                      <h4 className="text-xs font-extrabold text-white">{rev.userName}</h4>
                      <p className="text-[9px] text-[#FBBF24] font-bold">{rev.userBadge}</p>
                    </div>
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-[#FBBF24] text-[9px] font-bold">
                    +{rev.coinsEarned} Coins
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-[#14B8A6] font-bold uppercase tracking-widest">{rev.destination}</span>
                  <h3 className="text-sm font-extrabold text-white leading-snug">{rev.placeName}</h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic">"{rev.comment}"</p>

                {rev.scamWarning && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-[10px] leading-relaxed">
                    <span className="font-extrabold text-rose-400">⚠️ Scam Alert: </span>
                    {rev.scamWarning}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>Cost: <strong className="text-white">₹{rev.actualExpense}</strong></span>
                <span className="flex items-center gap-1 text-rose-400 font-bold">
                  <Heart className="w-3.5 h-3.5 fill-rose-400/20 text-rose-400" />
                  {rev.upvotes}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-2">
          <button
            onClick={() => handleFeatureNavigate("/community")}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#38BDF8] hover:text-[#14B8A6] transition-colors underline-animated"
          >
            Explore Community Reviews & Leaderboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER BANNER */}
      <section className="rounded-3xl border border-[#14B8A6]/25 p-10 sm:p-14 text-center space-y-6 bg-gradient-to-tr from-[#030F1A] via-[#071A2B] to-[#0E7490]/25 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.1)_0%,transparent_60%)] pointer-events-none" />
        
        <h2 className="text-3xl sm:text-5xl font-black text-white">
          Ready to Plan Your Next Journey?
        </h2>
        <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
          Create AI itineraries, monitor local budget forecasts, and explore with peace of mind.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => handleFeatureNavigate("/plan")}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#14B8A6] via-[#0E7490] to-[#0284C7] hover:brightness-110 text-white font-bold text-sm shadow-[0_4px_20px_rgba(20,184,166,0.35)] transition-all hover:scale-105"
          >
            Start Free AI Planner
          </button>
          {!isSignedIn && (
            <Link
              href="/sign-in"
              className="px-6 py-3.5 rounded-xl bg-[#030F1A]/80 border border-[#14B8A6]/30 text-white font-bold text-sm hover:bg-[#071A2B] transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      </section>

    </div>
  );
}
