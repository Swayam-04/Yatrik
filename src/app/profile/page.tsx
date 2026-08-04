"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
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
  Plane
} from "lucide-react";
import { INITIAL_USER } from "@/lib/store";

interface ProfilePageProps {
  defaultTab?: string;
}

export default function ProfilePage({ defaultTab = "overview" }: ProfilePageProps) {
  const { user, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState(defaultTab);

  if (!isLoaded) {
    return (
      <div className="space-y-8 pb-16 animate-pulse">
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
    <div className="space-y-8 pb-16">
      
      {/* Profile Header Passport Card */}
      <div className="p-8 rounded-3xl glass-panel border border-white/10 space-y-6 bg-gradient-to-r from-indigo-950/50 via-dark-bg to-dark-bg relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <img
            src={userAvatar}
            alt={userName}
            className="w-24 h-24 rounded-3xl object-cover ring-4 ring-indigo-500/50 shadow-glow"
          />

          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{userName}</h1>
                <p className="text-xs text-indigo-400 font-semibold">{userEmail}</p>
              </div>

              <div className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5">
                <Coins className="w-4 h-4" />
                <span>{INITIAL_USER.coins} YATRIK Coins</span>
              </div>
            </div>

            <p className="text-xs text-gray-300">
              Verified Explorer • <strong className="text-emerald-400">Level {INITIAL_USER.level} ({INITIAL_USER.rankTitle})</strong>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-4 border-t border-white/10 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-glow"
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

      {/* Overview View */}
      {(activeTab === "overview" || activeTab === "rewards") && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Unlocked Badges & YATRIK Rewards
            </h2>
            <div className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-bold">
              Balance: {INITIAL_USER.coins} Coins
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {INITIAL_USER.badges.map((b, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-center">
                <div className="w-10 h-10 mx-auto rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-white">{b.name}</h3>
                <p className="text-xs text-gray-400">{b.description}</p>
                <span className="text-[10px] text-indigo-400 block pt-1">Unlocked: {b.unlockedAt}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookmarks View */}
      {activeTab === "bookmarks" && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-400" />
            Your Saved Bookmarks
          </h2>
          <p className="text-xs text-gray-400">All your saved destinations, safe routes, and local hidden gems appear here.</p>
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
            <Bookmark className="w-8 h-8 text-gray-500 mx-auto" />
            <p className="text-sm text-gray-300 font-semibold">No Bookmarks Saved Yet</p>
            <p className="text-xs text-gray-400">Browse Local Gems or Safe Routes and click the bookmark icon to save them for easy access.</p>
          </div>
        </div>
      )}

      {/* Saved Trips View */}
      {activeTab === "trips" && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Plane className="w-5 h-5 text-emerald-400" />
            Saved Itineraries & Trips
          </h2>
          <p className="text-xs text-gray-400">View and manage your AI-generated travel itineraries.</p>
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 text-center space-y-2">
            <Compass className="w-8 h-8 text-gray-500 mx-auto" />
            <p className="text-sm text-gray-300 font-semibold">No Saved Trips Found</p>
            <p className="text-xs text-gray-400">Use our AI Trip Planner to create your custom itinerary.</p>
          </div>
        </div>
      )}

      {/* Notifications View */}
      {activeTab === "notifications" && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Safety & System Notifications
          </h2>
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-300 flex items-center justify-between">
            <span>Welcome to YATRIK AI! Account mandatory protection active.</span>
            <span className="text-[10px] text-gray-400">Just now</span>
          </div>
        </div>
      )}

      {/* History View */}
      {activeTab === "history" && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-violet-400" />
            Travel History & Activity Log
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
              <p className="text-2xl font-bold text-white">{INITIAL_USER.tripsCompleted}</p>
              <p className="text-xs text-gray-400">Trips Completed</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
              <p className="text-2xl font-bold text-indigo-400">{INITIAL_USER.countriesVisited}</p>
              <p className="text-xs text-gray-400">Countries Visited</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
              <p className="text-2xl font-bold text-emerald-400">{INITIAL_USER.citiesVisited}</p>
              <p className="text-xs text-gray-400">Cities Visited</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center space-y-1">
              <p className="text-2xl font-bold text-pink-400">{INITIAL_USER.distanceKm.toLocaleString()} km</p>
              <p className="text-xs text-gray-400">Distance Traveled</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings View */}
      {activeTab === "settings" && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-300" />
            Account & Security Settings
          </h2>
          <p className="text-xs text-gray-400">Manage your profile, authentication preferences, and notification alerts.</p>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-200 font-semibold">Clerk Session Authentication</span>
              <span className="text-emerald-400 font-bold">Active & Verified</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10">
              <span className="text-gray-200 font-semibold">Primary Email</span>
              <span className="text-gray-400">{userEmail}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
