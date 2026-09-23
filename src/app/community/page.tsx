"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Users,
  Coins,
  Award,
  Plus,
  Heart,
  ShieldCheck,
  AlertTriangle,
  Star,
  Trophy,
  Share2,
  Bookmark,
  Compass,
  MapPin,
  Route,
  Camera,
} from "lucide-react";
import { INITIAL_REVIEWS } from "@/lib/store";
import { CommunityReview } from "@/types";
import confetti from "canvas-confetti";

export default function CommunityPage() {
  const [mounted, setMounted] = useState(false);
  const [reviews, setReviews] = useState<CommunityReview[]>(INITIAL_REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedStories, setSavedStories] = useState<string[]>([]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Form states for new travel story
  const [placeName, setPlaceName] = useState("");
  const [destination, setDestination] = useState("Goa");
  const [category, setCategory] = useState<CommunityReview["category"]>("Hidden Gem");
  const [comment, setComment] = useState("");
  const [actualExpense, setActualExpense] = useState<number>(350);
  const [scamWarning, setScamWarning] = useState("");

  if (!mounted) return null;

  const handleUpvote = (id: string) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
  };

  const handleToggleSaveStory = (id: string) => {
    if (savedStories.includes(id)) {
      setSavedStories(savedStories.filter((s) => s !== id));
    } else {
      setSavedStories([...savedStories, id]);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeName || !comment) return;

    const newRev: CommunityReview = {
      id: `rev-${Date.now()}`,
      userName: "Ananya Sharma",
      userAvatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80",
      userBadge: "Top Explorer",
      destination,
      placeName,
      category,
      rating: 5.0,
      safetyScore: 97,
      comment,
      photos: [
        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80",
      ],
      actualExpense,
      scamWarning: scamWarning.trim() || undefined,
      upvotes: 1,
      coinsEarned: 100,
      createdAt: "Just now",
    };

    setReviews([newRev, ...reviews]);
    setIsModalOpen(false);
    setPlaceName("");
    setComment("");
    setScamWarning("");

    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.5 } });
    } catch {
      // ignore
    }
  };

  const leaderboard = [
    {
      rank: 1,
      name: "Sneha Reddy",
      coins: 4850,
      title: "Community Hero",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    },
    {
      rank: 2,
      name: "Ananya Sharma",
      coins: 3450,
      title: "Top Explorer",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80",
    },
    {
      rank: 3,
      name: "Rohan Malhotra",
      coins: 2900,
      title: "Trusted Traveller",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
  ];

  return (
    <div className="space-y-12 pb-16 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-[2rem] glass-panel border border-[#0E7490]/25 bg-hero-gradient text-left shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#FBBF24] text-[10px] font-extrabold uppercase tracking-widest animate-float">
            <Coins className="w-4 h-4 text-[#FBBF24] animate-bounce" />
            <span>Traveler Field Journals • Earn YATRIK Miles</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Traveler Stories & <span className="text-gradient-ocean">Field Journals</span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Authentic travel journals, local recommendations, trip expenses, and hidden corner guides posted by verified explorers.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#0E7490] to-[#14B8A6] hover:from-[#0E7490]/90 hover:to-[#14B8A6]/90 text-white font-bold text-xs shadow-[0_0_20px_rgba(20,184,166,0.35)] border border-[#38BDF8]/40 flex items-center gap-2 transition-all hover:scale-105 shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Write Travel Journal (+100 Miles)</span>
        </button>
      </div>

      {/* 2. Main Grid Layout (Stories Feed vs Leaderboard) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Travel Stories Feed (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {reviews.map((rev) => {
            const isSaved = savedStories.includes(rev.id);
            return (
              <div
                key={rev.id}
                className="group p-6 sm:p-7 rounded-3xl glass-panel border border-[#0E7490]/25 bg-[#071A2B]/85 space-y-5 text-left hover:border-[#14B8A6]/45 transition-all shadow-xl"
              >
                {/* Author & Meta */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.userAvatar}
                      alt={rev.userName}
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-[#14B8A6]/40 shadow-md"
                    />
                    <div>
                      <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                        {rev.userName}
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#14B8A6]/15 text-[#38BDF8] font-bold border border-[#14B8A6]/30">
                          {rev.userBadge}
                        </span>
                      </h3>

                      <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#14B8A6]" />
                        <span>{rev.destination}</span>
                        <span>•</span>
                        <span>{rev.createdAt}</span>
                      </p>
                    </div>
                  </div>

                  <div className="px-3 py-1 rounded-full bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#FBBF24] text-[10px] font-bold flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-[#FBBF24]" />
                    <span>+{rev.coinsEarned} Miles</span>
                  </div>
                </div>

                {/* Journal Title & Safety Score */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-lg font-extrabold text-white group-hover:text-[#38BDF8] transition-colors">
                      {rev.placeName}
                    </h4>

                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-[#FBBF24] text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" />
                        <span>{rev.rating.toFixed(1)}</span>
                      </span>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Safety: {rev.safetyScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Travel Experience Narrative */}
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {rev.comment}
                  </p>
                </div>

                {/* Scam Alert Callout */}
                {rev.scamWarning && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <span className="font-extrabold text-rose-300">⚠️ Traveler Warning: </span>
                      {rev.scamWarning}
                    </div>
                  </div>
                )}

                {/* Photos */}
                {rev.photos.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto py-1 custom-scrollbar">
                    {rev.photos.map((p, i) => (
                      <img
                        key={i}
                        src={p}
                        alt="Journal photo"
                        className="w-56 h-36 rounded-2xl object-cover border border-[#0E7490]/30 hover:scale-105 transition-transform duration-300"
                      />
                    ))}
                  </div>
                )}

                {/* Action Footer: Save this place, Add to trip, Upvotes */}
                <div className="pt-3 border-t border-[#0E7490]/20 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                  <span>
                    Actual Spent: <strong className="text-white font-bold">₹{rev.actualExpense}</strong>
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Save this place */}
                    <button
                      onClick={() => handleToggleSaveStory(rev.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isSaved
                          ? "bg-[#14B8A6]/20 border-[#14B8A6]/50 text-[#38BDF8]"
                          : "bg-white/5 border-[#0E7490]/25 text-slate-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? "fill-[#38BDF8]" : ""}`} />
                      <span>{isSaved ? "Saved" : "Save this place"}</span>
                    </button>

                    {/* Add to Trip */}
                    <Link
                      href={`/plan?destination=${encodeURIComponent(rev.destination)}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0E7490] to-[#14B8A6] hover:from-[#0E7490]/90 hover:to-[#14B8A6]/90 text-white font-bold text-xs shadow-[0_0_10px_rgba(20,184,166,0.3)] transition-all cursor-pointer"
                    >
                      <Route className="w-3.5 h-3.5" />
                      <span>Add to trip</span>
                    </Link>

                    {/* Upvote */}
                    <button
                      onClick={() => handleUpvote(rev.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/10 text-rose-300 border border-[#0E7490]/25 font-bold transition-all cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 fill-rose-500" />
                      <span>{rev.upvotes}</span>
                    </button>

                    <button
                      onClick={() => alert("Story link copied to clipboard!")}
                      className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white"
                      title="Share story"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Explorer Leaderboard (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 sm:p-7 rounded-3xl glass-panel border border-[#F59E0B]/30 bg-[#071A2B]/85 space-y-5 text-left shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#FBBF24] animate-bounce" />
              Explorer Leaderboard
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              Top global guides earning coin multipliers and passport stamps this month
            </p>

            <div className="space-y-3 pt-2">
              {leaderboard.map((u) => (
                <div
                  key={u.rank}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#030F1A]/70 border border-[#0E7490]/25 hover:border-[#14B8A6]/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        u.rank === 1
                          ? "bg-[#FBBF24] text-[#071A2B]"
                          : u.rank === 2
                          ? "bg-slate-300 text-[#071A2B]"
                          : "bg-[#F59E0B]/50 text-white"
                      }`}
                    >
                      {u.rank}
                    </span>
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-[#14B8A6]/40"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{u.name}</h4>
                      <p className="text-[10px] text-slate-400">{u.title}</p>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-[#FBBF24] flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5" />
                    {u.coins.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
