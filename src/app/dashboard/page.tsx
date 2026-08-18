"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { 
  Compass, 
  Sparkles, 
  Coins, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Plus, 
  CloudSun, 
  Bookmark, 
  Award, 
  ArrowRight, 
  Clock,
  MessageSquare,
  Bell,
  RefreshCw,
  Sliders,
  AlertTriangle,
  Flame,
  Activity
} from "lucide-react";
import { INITIAL_USER, DEFAULT_TRIPS } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

interface DbTrip {
  id: string;
  title: string;
  destination: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
  budget: number;
  spentTotal: number;
  daysCount?: number;
  travelType: string;
  transportMode: string;
  status: string;
}

interface DbBookmark {
  id: string;
  place: {
    name: string;
    category: string;
  };
}

interface DbReward {
  id: string;
  points: number;
  badgeName?: string;
  description?: string;
}

interface DbNotification {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

interface DbChat {
  id: string;
  title: string;
  updatedAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useUser();

  const [trips, setTrips] = useState<DbTrip[]>([]);
  const [bookmarks, setBookmarks] = useState<DbBookmark[]>([]);
  const [rewards, setRewards] = useState<DbReward[]>([]);
  const [chats, setChats] = useState<DbChat[]>([]);
  const [notifications, setNotifications] = useState<DbNotification[]>([]);
  const [coins, setCoins] = useState(250);
  const [level, setLevel] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const userName = user?.fullName || user?.firstName || INITIAL_USER.name;
  const userAvatar = user?.imageUrl || INITIAL_USER.avatar;

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [tripsRes, bookmarksRes, rewardsRes, chatsRes, notifsRes] = await Promise.all([
        fetch("/api/trips").then((r) => r.ok ? r.json() : { trips: [] }),
        fetch("/api/bookmarks").then((r) => r.ok ? r.json() : { bookmarks: [] }),
        fetch("/api/rewards").then((r) => r.ok ? r.json() : { rewards: [], userStats: { coins: 250, level: 1 } }),
        fetch("/api/chat").then((r) => r.ok ? r.json() : { chats: [] }),
        fetch("/api/notifications").then((r) => r.ok ? r.json() : { notifications: [] }),
      ]);

      if (tripsRes.trips && tripsRes.trips.length > 0) {
        setTrips(tripsRes.trips);
      } else {
        setTrips(DEFAULT_TRIPS.map(t => ({
          id: t.id,
          title: t.title,
          destination: t.destination,
          coverImage: t.coverImage,
          startDate: t.startDate,
          endDate: t.endDate,
          budget: t.budgetTotal,
          spentTotal: t.spentTotal,
          daysCount: t.daysCount,
          travelType: t.travelType,
          transportMode: t.transportMode,
          status: t.status,
        })));
      }

      if (bookmarksRes.bookmarks) setBookmarks(bookmarksRes.bookmarks);
      if (rewardsRes.rewards) setRewards(rewardsRes.rewards);
      if (rewardsRes.userStats) {
        setCoins(rewardsRes.userStats.coins || 250);
        setLevel(rewardsRes.userStats.level || 1);
      }
      if (chatsRes.chats) setChats(chatsRes.chats);
      if (notifsRes.notifications) setNotifications(notifsRes.notifications);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const activeTrip = trips[0];
  const upcomingTrips = trips.slice(1);

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-500 max-w-7xl mx-auto">
      
      {/* 1. Welcoming passport header bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-[2rem] glass-panel border border-white/5 bg-hero-gradient text-left">
        <div className="flex items-center gap-4">
          <img
            src={userAvatar}
            alt={userName}
            className="w-16 h-16 rounded-xl object-cover ring-2 ring-indigo-500/30 shadow-glow shrink-0"
          />
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-none">Welcome back, {userName}!</h1>
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[10px] font-bold">
                Level {level} Explorer
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {user?.primaryEmailAddress?.emailAddress || INITIAL_USER.email} • {trips.length} Active trips monitored
            </p>
          </div>
        </div>

        {/* Coins counter & plan button */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 border-white/5 pt-4 lg:pt-0">
          <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 shadow-glow-amber">
            <Coins className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
            <div className="text-left">
              <span className="block text-[8px] text-gray-500 font-bold uppercase">Prisma Sync</span>
              <strong className="text-sm font-black text-amber-400 leading-none">{coins} Coins</strong>
            </div>
          </div>

          <button
            onClick={fetchDashboardData}
            className="p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors"
            title="Refresh Database Feed"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/plan"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-glow transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Plan Trip</span>
          </Link>
        </div>
      </div>

      {/* 2. Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Itineraries & Chats (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Active Featured Trip */}
          {activeTrip && (
            <div className="space-y-4 text-left">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-indigo-400" />
                Active / Next Planned Trip
              </h2>

              <div className="rounded-3xl overflow-hidden glass-panel border border-white/5 glass-panel-hover flex flex-col md:flex-row bg-[#090d16]/30">
                {/* Cover Image banner */}
                <div className="relative md:w-2/5 h-48 md:h-auto overflow-hidden shrink-0">
                  <img
                    src={activeTrip.coverImage || "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80"}
                    alt={activeTrip.destination}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-[#030712]/80 backdrop-blur-md border border-white/10 text-[9px] font-bold text-emerald-400 flex items-center gap-0.5 shadow-glow-emerald">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified</span>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-6 md:w-3/5 space-y-4 flex flex-col justify-between text-left">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">
                      {activeTrip.daysCount || 3} Days • {activeTrip.travelType}
                    </span>
                    
                    <h3 className="text-lg font-extrabold text-white pt-1">{activeTrip.title}</h3>
                    
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{activeTrip.destination}</span>
                    </p>
                  </div>

                  {/* Budget tracking slider bar */}
                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Max Budget: <strong className="text-white">{formatCurrency(activeTrip.budget)}</strong></span>
                      <span className="text-emerald-400 font-bold">Spent: {formatCurrency(activeTrip.spentTotal || 0)}</span>
                    </div>
                    
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full w-[35%]" />
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-3 pt-2">
                    <Link
                      href={`/plan?destination=${encodeURIComponent(activeTrip.destination)}`}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <span>Open Itinerary</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    
                    <Link
                      href="/budget"
                      className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-colors"
                    >
                      Cost Breakdown
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Saved list */}
          {upcomingTrips.length > 0 && (
            <div className="space-y-4 text-left">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4.5 h-4.5 text-indigo-400" />
                Other Planned Trips ({upcomingTrips.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {upcomingTrips.map((trip) => (
                  <div key={trip.id} className="p-5 rounded-2xl glass-panel border border-white/5 bg-[#090d16]/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-indigo-400 font-bold">📍 {trip.destination}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                        {trip.status}
                      </span>
                    </div>
                    
                    <h4 className="text-sm font-bold text-white">{trip.title}</h4>
                    
                    <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
                      <span>{trip.travelType}</span>
                      <span className="font-extrabold text-white">{formatCurrency(trip.budget)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent AI Chats */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4.5 h-4.5 text-indigo-400" />
                Recent AI Chats
              </h3>
              <Link href="/assistant" className="text-xs text-indigo-400 font-bold hover:text-indigo-300">Open Assistant</Link>
            </div>

            <div className="space-y-2">
              {chats.length > 0 ? (
                chats.slice(0, 3).map((chat) => (
                  <Link
                    key={chat.id}
                    href="/assistant"
                    className="p-4 rounded-xl glass-panel border border-white/5 bg-[#090d16]/30 flex items-center justify-between hover:border-indigo-500/30 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{chat.title}</h4>
                        <p className="text-[9px] text-gray-400">Updated: {new Date(chat.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <ArrowRight className="w-4 h-4 text-gray-500" />
                  </Link>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-gray-400 glass-panel border border-white/5 rounded-2xl">
                  No active assistant chats found. Open the chat widget below to start.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Alerts and widgets (4 Cols) */}
        <div className="lg:col-span-4 space-y-6 text-left">
          
          {/* Notifications Alerts */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/50 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-indigo-400" />
                Live Feed Notifications
              </h3>
              
              <span className="text-[9px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/25 animate-pulse">
                {notifications.filter(n => !n.isRead).length} New
              </span>
            </div>

            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs space-y-1">
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      {n.title}
                    </h4>
                    <p className="text-[10px] text-gray-300 pl-3 leading-relaxed">{n.body}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-[11px] text-gray-500">
                  No new safety or system notifications.
                </div>
              )}
            </div>
          </div>

          {/* Badges Trophy Widget */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/50 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500 animate-bounce" />
                Trophy Achievements
              </h3>
              <Link href="/profile" className="text-[10px] text-indigo-400 font-bold hover:underline">View Passport</Link>
            </div>

            <div className="grid grid-cols-2 gap-3.5">
              {rewards.length > 0 ? (
                rewards.slice(0, 4).map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center space-y-1 hover:border-indigo-500/20 transition-all">
                    <span className="text-lg block">🏆</span>
                    <h4 className="text-[10px] font-bold text-white truncate">{r.badgeName || "Badge"}</h4>
                    <p className="text-[9px] text-gray-500">+{r.points} coins</p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-4 text-center text-xs text-gray-400">
                  Unlocked achievements appear here after travel verification.
                </div>
              )}
            </div>
          </div>

          {/* Bookmarks Wishlist Widget */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/50 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-pink-400" />
                Saved Wishlist
              </h3>
            </div>

            <ul className="space-y-2">
              {bookmarks.length > 0 ? (
                bookmarks.map((bm) => (
                  <li key={bm.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#030712]/50 border border-white/5 text-xs text-gray-200">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span className="truncate max-w-[120px]">{bm.place?.name || "Saved Point"}</span>
                    </span>
                    
                    <span className="text-[9px] text-indigo-300 font-bold px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/25">
                      {bm.place?.category || "Saved"}
                    </span>
                  </li>
                ))
              ) : (
                <li className="p-4 text-center text-xs text-gray-500">
                  Your bookmarked locations will appear here.
                </li>
              )}
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
