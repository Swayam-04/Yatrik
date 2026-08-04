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
  TrendingUp, 
  ArrowRight, 
  Users, 
  Star, 
  Shield, 
  Lock,
  Globe,
  Zap,
  CheckCircle,
  Award,
  ChevronRight,
  Heart
} from "lucide-react";
import { INITIAL_REVIEWS } from "@/lib/store";

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { requireAuth } = useAuthModal();
  const [searchDestination, setSearchDestination] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "beach" | "mountain" | "heritage">("all");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requireAuth(() => {
      if (searchDestination.trim()) {
        router.push(`/plan?destination=${encodeURIComponent(searchDestination)}`);
      } else {
        router.push("/plan");
      }
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
      image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80",
      type: "beach",
      estBudget: "₹18,000",
    },
    {
      name: "Tokyo, Japan",
      tag: "Futuristic & Culinary",
      safetyScore: 99,
      image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=600&q=80",
      type: "heritage",
      estBudget: "₹1,10,000",
    },
    {
      name: "Old Manali, Himachal",
      tag: "Serene & Secret Cafes",
      safetyScore: 93,
      image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=600&q=80",
      type: "mountain",
      estBudget: "₹12,500",
    },
    {
      name: "Kyoto, Japan",
      tag: "Temples & Tea Gardens",
      safetyScore: 98,
      image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
      type: "heritage",
      estBudget: "₹95,000",
    },
  ];

  const filteredDestinations = activeTab === "all" 
    ? popularDestinations 
    : popularDestinations.filter(d => d.type === activeTab);

  return (
    <div className="space-y-24 py-6">

      {/* HERO SECTION */}
      <section className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 p-8 sm:p-14 bg-hero-gradient text-center space-y-8 shadow-2xl">
        
        {/* Glow ambient circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Announcement Pill */}
        <Link 
          href="/features"
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 text-indigo-300 text-xs font-semibold backdrop-blur-md hover:border-indigo-500/40 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin-slow" />
          <span>Introducing YATRIK 2.0 • AI Ecosystem & Women's Safety Mode</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>

        {/* Main Title & Tagline */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-tight">
            Plan Smart. Travel Safe. <br className="hidden sm:inline" />
            <span className="text-gradient">Explore Together.</span>
          </h1>
          <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            The next-generation travel platform replacing multiple apps. Experience AI-generated itineraries, real-time budget forecasting, verified safe routing, and authentic community hacks.
          </p>
        </div>

        {/* Search Bar Container */}
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto relative group">
          <div className="p-2 rounded-2xl glass-panel border border-white/20 shadow-glow flex flex-col sm:flex-row items-center gap-2 bg-dark-glass">
            <div className="flex-1 flex items-center gap-3 px-4 py-2 w-full">
              <MapPin className="w-5 h-5 text-indigo-400 shrink-0" />
              <input
                type="text"
                placeholder="Where to next? (e.g., Goa, Tokyo, Paris, Manali...)"
                value={searchDestination}
                onChange={(e) => setSearchDestination(e.target.value)}
                className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate AI Plan</span>
            </button>
          </div>
        </form>

        {/* Quick Action Badges / Auth CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <button
            onClick={() => handleFeatureNavigate("/dashboard")}
            className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold flex items-center gap-2 shadow-glow transition-all hover:scale-105"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Open Explorer Dashboard</span>
          </button>
          <div className="flex items-center gap-2 text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero Booking Fees • Mandatory Clerk Auth Protected</span>
          </div>
        </div>

        {/* Feature Highlights Stats Row */}
        <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-white/10 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-2xl font-bold text-white">50,000+</p>
            <p className="text-xs text-gray-400">AI Itineraries Generated</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-2xl font-bold text-emerald-400">98.4%</p>
            <p className="text-xs text-gray-400">Safety Score Accuracy</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-2xl font-bold text-amber-400">12,400+</p>
            <p className="text-xs text-gray-400">Verified Hidden Gems</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-2xl font-bold text-pink-400">₹4.2M+</p>
            <p className="text-xs text-gray-400">Traveler Scam Savings</p>
          </div>
        </div>

      </section>

      {/* POPULAR DESTINATIONS & CATEGORIES */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <Compass className="w-7 h-7 text-indigo-400" />
              Popular Destinations & AI Estimates
            </h2>
            <p className="text-sm text-gray-400">Trending spots curated with live budgets and safety ratings</p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-white/5 border border-white/10 text-xs">
            {(["all", "beach", "mountain", "heritage"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                  activeTab === tab 
                    ? "bg-indigo-600 text-white font-semibold" 
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Destination Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredDestinations.map((dest, i) => (
            <div
              key={i}
              className="group rounded-2xl overflow-hidden glass-panel border border-white/10 glass-panel-hover flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-dark-bg/80 backdrop-blur-md border border-white/10 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{dest.safetyScore}/100</span>
                </div>
                <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-dark-bg/80 backdrop-blur-md text-[11px] text-gray-300 font-medium">
                  {dest.tag}
                </div>
              </div>
              
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Est. Avg. Trip: <span className="text-amber-400 font-semibold">{dest.estBudget}</span></p>
                </div>

                <button
                  onClick={() => handleFeatureNavigate(`/plan?destination=${encodeURIComponent(dest.name.split(",")[0])}`)}
                  className="w-full py-2 rounded-xl bg-white/5 hover:bg-indigo-600/30 border border-white/10 text-xs font-semibold text-gray-200 hover:text-white flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Plan This Trip</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WOMEN'S SAFETY MODE BANNER */}
      <section className="rounded-3xl glass-panel border border-emerald-500/30 p-8 sm:p-12 bg-gradient-to-r from-emerald-950/40 via-dark-bg to-dark-bg relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Flagship Safety Feature</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Dedicated Women's Safety Engine
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Travel with absolute confidence. YATRIK calculates live **Safety Scores (0-100)**, recommends well-lit nighttime routes, filters verified female-friendly hotels, and includes a 1-tap Emergency SOS broadcast.
            </p>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300 pt-2">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Well-Lit Safe Routing</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>24/7 Emergency SOS Siren</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Verified Women-Solo Stays</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Crowd Density Sensors</span>
              </li>
            </ul>
          </div>

          <div className="w-full md:w-auto flex flex-col items-center gap-4">
            <div className="p-6 rounded-2xl glass-panel border border-emerald-500/30 text-center space-y-2 bg-dark-glass w-full max-w-xs shadow-glow-emerald">
              <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Current Safety Rating</p>
              <div className="text-5xl font-black text-emerald-400">97/100</div>
              <p className="text-xs text-emerald-300 font-medium">Panaji Heritage Zone • Very Safe</p>
            </div>

            <button
              onClick={() => handleFeatureNavigate("/safety")}
              className="w-full py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Shield className="w-4 h-4" />
              <span>Explore Women Safety Center</span>
            </button>
          </div>
        </div>
      </section>

      {/* COMMUNITY INTELLIGENCE USP SECTION */}
      <section className="space-y-8">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Coins className="w-4 h-4" />
            <span>Community Intelligence USP</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Real Traveler Data. Zero Fake Reviews.</h2>
          <p className="text-sm text-gray-400">
            Real travelers upload actual expenses, scam alerts, and hidden spots. Earn YATRIK Coins and level up while helping others travel smarter.
          </p>
        </div>

        {/* Community Reviews Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {INITIAL_REVIEWS.map((rev) => (
            <div key={rev.id} className="p-6 rounded-2xl glass-panel border border-white/10 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={rev.userAvatar} alt={rev.userName} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{rev.userName}</h4>
                      <p className="text-[10px] text-amber-400 font-semibold">{rev.userBadge}</p>
                    </div>
                  </div>
                  <div className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-bold">
                    +{rev.coinsEarned} Coins
                  </div>
                </div>

                <div>
                  <span className="text-xs text-indigo-400 font-semibold">{rev.destination}</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{rev.placeName}</h3>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed italic">"{rev.comment}"</p>

                {rev.scamWarning && (
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px]">
                    <strong>⚠️ Scam Alert:</strong> {rev.scamWarning}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <span>Spent: <strong className="text-white">₹{rev.actualExpense}</strong></span>
                <span className="flex items-center gap-1 text-pink-400"><Heart className="w-3.5 h-3.5 fill-pink-400" /> {rev.upvotes}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => handleFeatureNavigate("/community")}
            className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            <span>View All Community Traveler Reviews & Leaderboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="rounded-3xl glass-panel border border-indigo-500/30 p-10 sm:p-14 text-center space-y-6 bg-gradient-to-tr from-indigo-950/60 via-dark-bg to-violet-950/60 shadow-2xl relative overflow-hidden">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white">
          Ready to Plan Your Dream Journey?
        </h2>
        <p className="text-gray-300 text-sm max-w-xl mx-auto leading-relaxed">
          Join thousands of smart travelers using YATRIK for AI itineraries, budget predictions, and safe local discovery.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <button
            onClick={() => handleFeatureNavigate("/plan")}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 hover:opacity-90 text-white font-bold text-sm shadow-glow transition-all hover:scale-105"
          >
            Start Free AI Trip Planner
          </button>
          {!isSignedIn && (
            <Link
              href="/sign-in"
              className="px-6 py-3.5 rounded-xl glass-panel border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-all"
            >
              Sign In to Account
            </Link>
          )}
        </div>
      </section>

    </div>
  );
}
