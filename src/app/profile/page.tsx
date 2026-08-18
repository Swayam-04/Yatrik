"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useSearchParams, useRouter } from "next/navigation";
import { 
  User, 
  Award, 
  Coins, 
  Globe, 
  MapPin, 
  Compass, 
  Bookmark, 
  ShieldCheck, 
  Share2, 
  CheckCircle2,
  Zap,
  Heart,
  Bell,
  Settings,
  History,
  Plane,
  Eye,
  Camera,
  Calendar,
  Lock,
  LogOut,
  Sliders
} from "lucide-react";
import { INITIAL_USER } from "@/lib/store";

interface ProfilePageProps {
  defaultTab?: string;
}

function ProfilePageContent({ defaultTab = "overview" }: ProfilePageProps) {
  const { user, isLoaded } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  
  const [activeTab, setActiveTab] = useState(tabParam || defaultTab);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  if (!isLoaded) {
    return (
      <div className="space-y-8 pb-16 animate-pulse max-w-7xl mx-auto">
        <div className="h-64 rounded-3xl bg-white/5 border border-white/10" />
        <div className="h-48 rounded-3xl bg-white/5 border border-white/10" />
      </div>
    );
  }

  const userName = user?.fullName || user?.firstName || INITIAL_USER.name;
  const userEmail = user?.primaryEmailAddress?.emailAddress || INITIAL_USER.email;
  const userAvatar = user?.imageUrl || INITIAL_USER.avatar;

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "rewards", label: "Rewards & Coins", icon: Coins },
    { id: "bookmarks", label: "Bookmarks", icon: Bookmark },
    { id: "trips", label: "Saved Trips", icon: Plane },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "history", label: "Travel History", icon: History },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto text-left">
      
      {/* 1. Passport Style Header Card */}
      <div className="p-8 rounded-[2rem] glass-panel border border-white/5 space-y-6 bg-gradient-to-r from-indigo-950/40 via-[#030712] to-purple-950/20 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
          <img
            src={userAvatar}
            alt={userName}
            className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-glow"
          />

          <div className="space-y-2 flex-1 w-full">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-extrabold text-white tracking-tight leading-none">{userName}</h1>
                <p className="text-xs text-indigo-400 font-bold pt-1.5">{userEmail}</p>
              </div>

              <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold flex items-center gap-1.5 shadow-glow-amber">
                <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
                <span className="text-gradient-amber">{INITIAL_USER.coins} YATRIK Coins</span>
              </div>
            </div>

            <p className="text-xs text-gray-300">
              Verified Explorer • <strong className="text-emerald-400">Level {INITIAL_USER.level} ({INITIAL_USER.rankTitle})</strong>
            </p>
          </div>
        </div>

        {/* Tab Links Scroller */}
        <div className="flex items-center gap-1.5 pt-6 border-t border-white/5 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-glow border border-indigo-500/20"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Overview Tab (Passport Stats and Unlocked Badges) */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
              <span className="text-[10px] text-gray-500 uppercase font-semibold">Completed Trips</span>
              <p className="text-2xl font-black text-white pt-1">{INITIAL_USER.tripsCompleted}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
              <span className="text-[10px] text-gray-500 uppercase font-semibold">Countries Visited</span>
              <p className="text-2xl font-black text-indigo-400 pt-1">{INITIAL_USER.countriesVisited}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
              <span className="text-[10px] text-gray-500 uppercase font-semibold">Cities Explored</span>
              <p className="text-2xl font-black text-emerald-400 pt-1">{INITIAL_USER.citiesVisited}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
              <span className="text-[10px] text-gray-500 uppercase font-semibold">Travel Distance</span>
              <p className="text-2xl font-black text-pink-400 pt-1">{INITIAL_USER.distanceKm.toLocaleString()} km</p>
            </div>
          </div>

          {/* Badges Box */}
          <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/50 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400 animate-pulse" />
                Unlocked explorer badges
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {INITIAL_USER.badges.map((b, i) => (
                <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/20 transition-all text-center space-y-2.5">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 shadow-glow-amber">
                    <Award className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-extrabold text-white leading-snug">{b.name}</h3>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{b.description}</p>
                  <span className="text-[9px] text-indigo-400 block pt-1 font-semibold">Unlocked: {b.unlockedAt}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Rewards Tab */}
      {activeTab === "rewards" && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/50 space-y-6 animate-in fade-in duration-300">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              YATRIK Rewards & Coin Milestones
            </h2>
            <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold shadow-glow-amber">
              Balance: {INITIAL_USER.coins} Coins
            </div>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed max-w-xl">
            Claim discounts, free safe routes, and homestay upgrades by contributing verified reviews and local spot details.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Homestay Deal</span>
              <h4 className="text-sm font-bold text-white">10% Off Verified Goa Homestays</h4>
              <p className="text-[11px] text-gray-400">Claim coupon for 500 YATRIK Coins balance.</p>
              <button 
                onClick={() => alert("Reward Coupon claimed successfully!")}
                className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-dark-bg transition-all text-xs font-bold"
              >
                Claim Coupon
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3">
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Transport Deal</span>
              <h4 className="text-sm font-bold text-white">₹1,500 Domestic Flight Discount</h4>
              <p className="text-[11px] text-gray-400">Claim coupon for 1,000 YATRIK Coins balance.</p>
              <button 
                onClick={() => alert("Reward Coupon claimed successfully!")}
                className="w-full py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-dark-bg transition-all text-xs font-bold"
              >
                Claim Coupon
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-3 opacity-60">
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">Premium Mode</span>
              <h4 className="text-sm font-bold text-white">Unrestricted AI Travel Assistant</h4>
              <p className="text-[11px] text-gray-400">Unlocked automatically for Level 4+ explorers.</p>
              <div className="w-full py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-xs font-bold text-center">
                Active & Unlocked
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Bookmarks Tab */}
      {activeTab === "bookmarks" && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/50 space-y-6 animate-in fade-in duration-300">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-400 animate-pulse" />
            Your Bookmarks & Saved Spots
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            All your bookmarked destinations, safety points, and local secrets will appear here for fast retrieval.
          </p>

          {/* Bookmarks Empty state */}
          <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10 max-w-xl mx-auto space-y-4">
            <Bookmark className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-sm font-extrabold text-white">No Bookmarks Saved Yet</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Inspect hidden gems or safety zones and tap the bookmark icon to save them for easy access on the go.
            </p>
            <button 
              onClick={() => router.push("/discover")}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
            >
              Browse Local Spots
            </button>
          </div>
        </div>
      )}

      {/* 5. Trips Tab */}
      {activeTab === "trips" && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/50 space-y-6 animate-in fade-in duration-300">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Plane className="w-5 h-5 text-emerald-400" />
            Saved AI Itineraries
          </h2>
          
          {/* Empty State */}
          <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10 max-w-xl mx-auto space-y-4">
            <Plane className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-sm font-extrabold text-white">No Saved Trips Found</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              You haven't saved any AI-generated itineraries yet. Try generating a trip using our planning wizard.
            </p>
            <button 
              onClick={() => router.push("/plan")}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
            >
              Open AI planner
            </button>
          </div>
        </div>
      )}

      {/* 6. Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/50 space-y-4 animate-in fade-in duration-300">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" />
            Safety Notifications & System Messages
          </h2>
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/25 text-xs text-indigo-300 flex items-center justify-between">
            <span>Welcome to YATRIK AI! Required Clerk account sync active.</span>
            <span className="text-[10px] text-gray-400">Just now</span>
          </div>
        </div>
      )}

      {/* 7. Travel History Tab */}
      {activeTab === "history" && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/50 space-y-6 animate-in fade-in duration-300">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-purple-400 animate-pulse" />
            Travel Log & Activity History
          </h2>

          <div className="p-12 text-center rounded-2xl bg-white/5 border border-white/10 max-w-xl mx-auto space-y-4">
            <History className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-sm font-extrabold text-white">No Travel History Recorded</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Your completed trips and traveler milestones will appear here once verified.
            </p>
          </div>
        </div>
      )}

      {/* 8. Settings Tab */}
      {activeTab === "settings" && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/50 space-y-6 animate-in fade-in duration-300">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400 animate-spin-slow" />
            Security & Authentication Preferences
          </h2>
          
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 text-xs leading-relaxed max-w-2xl">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 font-semibold">Session Status</span>
              <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Active & Verified
              </span>
            </div>
            <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
              <span className="text-gray-300 font-semibold">Authentication Method</span>
              <span className="text-gray-400 font-semibold">Clerk Sync (Google / Password)</span>
            </div>
            <div className="flex items-center justify-between pt-2.5 border-t border-white/5">
              <span className="text-gray-300 font-semibold">Verified Email Address</span>
              <span className="text-indigo-400 font-bold">{userEmail}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ProfilePage(props: ProfilePageProps) {
  return (
    <React.Suspense fallback={<div className="animate-pulse p-12 text-center text-xs text-gray-400">Loading Profile...</div>}>
      <ProfilePageContent {...props} />
    </React.Suspense>
  );
}
