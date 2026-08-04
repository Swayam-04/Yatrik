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
  RefreshCw
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

  const [weatherData, setWeatherData] = useState<{
    temperature: number;
    condition: string;
    description: string;
    humidity: number;
    windSpeed: number;
    packingTips: string;
  } | null>(null);
  const [recommendedPlaces, setRecommendedPlaces] = useState<{ id: string; name: string; category: string; rating: number }[]>([]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [tripsRes, bookmarksRes, rewardsRes, chatsRes, notifsRes, weatherRes, placesRes] = await Promise.all([
        fetch("/api/trips").then((r) => r.ok ? r.json() : { trips: [] }),
        fetch("/api/bookmarks").then((r) => r.ok ? r.json() : { bookmarks: [] }),
        fetch("/api/rewards").then((r) => r.ok ? r.json() : { rewards: [], userStats: { coins: 250, level: 1 } }),
        fetch("/api/chat").then((r) => r.ok ? r.json() : { chats: [] }),
        fetch("/api/notifications").then((r) => r.ok ? r.json() : { notifications: [] }),
        fetch("/api/external/weather?destination=Goa").then((r) => r.ok ? r.json() : null),
        fetch("/api/external/places?destination=Goa").then((r) => r.ok ? r.json() : null),
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
      if (weatherRes?.weather) setWeatherData(weatherRes.weather);
      if (placesRes?.places) setRecommendedPlaces(placesRes.places);
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
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      
      {/* Top Welcome Header & Rewards Overview */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 glass-panel border border-white/10 p-6 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-dark-bg to-dark-bg">
        <div className="flex items-center gap-4">
          <img
            src={userAvatar}
            alt={userName}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/50 shadow-glow"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">Welcome back, {userName}!</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                Level {level} • YATRIK Explorer
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {user?.primaryEmailAddress?.emailAddress || INITIAL_USER.email} • {trips.length} Active Trips in Database
            </p>
          </div>
        </div>

        {/* Coins & Quick Action CTA */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="p-3 px-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
            <Coins className="w-6 h-6 text-amber-400 animate-pulse" />
            <div>
              <p className="text-xs text-gray-400 font-medium">Prisma Balance</p>
              <p className="text-lg font-bold text-amber-400">{coins} Coins</p>
            </div>
          </div>

          <button
            onClick={fetchDashboardData}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            href="/plan"
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs flex items-center gap-2 shadow-glow transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Plan New Trip</span>
          </Link>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Active & Upcoming Trips */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active / Current Trip Featured Card */}
          {activeTrip && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-400" />
                  Active / Next Planned Trip (Prisma Live)
                </h2>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {activeTrip.status}
                </span>
              </div>

              <div className="rounded-3xl overflow-hidden glass-panel border border-white/10 glass-panel-hover flex flex-col md:flex-row">
                <div className="relative md:w-2/5 h-56 md:h-auto">
                  <img
                    src={activeTrip.coverImage || "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80"}
                    alt={activeTrip.destination}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-dark-bg/80 backdrop-blur-md border border-white/10 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Destination</span>
                  </div>
                </div>

                <div className="p-6 md:w-3/5 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold mb-1">
                      <span>{activeTrip.daysCount || 3} Days • {activeTrip.travelType}</span>
                      <span>{activeTrip.transportMode}</span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{activeTrip.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      {activeTrip.destination} {activeTrip.startDate ? `• ${activeTrip.startDate} to ${activeTrip.endDate}` : ''}
                    </p>
                  </div>

                  {/* Budget bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Total Budget: <strong className="text-white">{formatCurrency(activeTrip.budget)}</strong></span>
                      <span className="text-emerald-400 font-semibold">Spent: {formatCurrency(activeTrip.spentTotal || 0)}</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full w-[35%]" />
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Link
                      href={`/plan?tripId=${activeTrip.id}`}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>View Itinerary</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/budget"
                      className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-colors"
                    >
                      Expenses
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Trips List */}
          <div className="space-y-4">
            <h3 className="text-md font-bold text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Saved PostgreSQL Trips ({upcomingTrips.length})
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingTrips.map((trip) => (
                <div key={trip.id} className="p-5 rounded-2xl glass-panel border border-white/10 glass-panel-hover space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-indigo-400 font-semibold">{trip.destination}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium">
                      {trip.status}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{trip.title}</h4>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-white/5">
                    <span>{trip.travelType}</span>
                    <span className="font-bold text-white">{formatCurrency(trip.budget)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent AI Chats */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                Recent AI Travel Chats
              </h3>
              <Link href="/assistant" className="text-xs text-indigo-400 hover:underline">Open AI Assistant</Link>
            </div>

            <div className="space-y-2">
              {chats.length > 0 ? (
                chats.slice(0, 3).map((chat) => (
                  <Link
                    key={chat.id}
                    href="/assistant"
                    className="p-3.5 rounded-2xl glass-panel border border-white/10 flex items-center justify-between hover:border-indigo-500/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                        <MessageSquare className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">{chat.title}</h4>
                        <p className="text-[10px] text-gray-400">Updated {new Date(chat.updatedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                  </Link>
                ))
              ) : (
                <div className="p-4 rounded-2xl glass-panel text-center text-xs text-gray-400 border border-white/10">
                  No active chat sessions yet. Ask YATRIK AI Assistant to start!
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right 1 Column: Widgets, Weather, Notifications, Rewards */}
        <div className="space-y-6">
          
          {/* Notifications Widget */}
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-indigo-400" />
                Notifications ({notifications.filter(n => !n.isRead).length})
              </h3>
              <span className="text-[10px] text-indigo-400">Live</span>
            </div>

            <div className="space-y-2.5">
              {notifications.length > 0 ? (
                notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-1">
                    <h4 className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                      {n.title}
                    </h4>
                    <p className="text-[11px] text-gray-300 pl-3">{n.body}</p>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-xl bg-white/5 text-center text-xs text-gray-400">
                  No new notifications.
                </div>
              )}
            </div>
          </div>

          {/* Unlocked Explorer Badges */}
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Unlocked Rewards ({rewards.length})
              </h3>
              <Link href="/profile" className="text-xs text-indigo-400 hover:underline">View All</Link>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {rewards.length > 0 ? (
                rewards.slice(0, 4).map((r) => (
                  <div key={r.id} className="p-3 rounded-xl bg-white/5 border border-white/10 text-center space-y-1">
                    <div className="w-8 h-8 mx-auto rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                      🏆
                    </div>
                    <h4 className="text-xs font-bold text-white">{r.badgeName || "Explorer Badge"}</h4>
                    <p className="text-[10px] text-gray-400 line-clamp-1">+{r.points} Points</p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 p-3 rounded-xl bg-white/5 text-center text-xs text-gray-400">
                  Complete trips to earn badges & rewards!
                </div>
              )}
            </div>
          </div>

          {/* Saved Wishlist Widget */}
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-pink-400" />
                Saved Bookmarks ({bookmarks.length})
              </h3>
            </div>

            <ul className="space-y-2">
              {bookmarks.length > 0 ? (
                bookmarks.map((bm) => (
                  <li key={bm.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 text-xs text-gray-200">
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      {bm.place?.name || "Saved Location"}
                    </span>
                    <span className="text-[10px] text-indigo-300 font-semibold px-2 py-0.5 rounded bg-indigo-500/20">
                      {bm.place?.category || "Saved"}
                    </span>
                  </li>
                ))
              ) : (
                <li className="p-3 rounded-xl bg-white/5 text-center text-xs text-gray-400">
                  No saved bookmarks yet.
                </li>
              )}
            </ul>
          </div>

        </div>

      </div>

    </div>
  );
}
