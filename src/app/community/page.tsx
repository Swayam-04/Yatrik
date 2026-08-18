"use client";

import React, { useState } from "react";
import {
  Users,
  Coins,
  Award,
  Sparkles,
  Plus,
  Heart,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  MessageSquare,
  DollarSign,
  Star,
  Trophy,
  X,
  Share2,
  Bookmark,
  MessageCircle
} from "lucide-react";
import { INITIAL_REVIEWS } from "@/lib/store";
import { CommunityReview } from "@/types";
import confetti from "canvas-confetti";

export default function CommunityPage() {
  const [reviews, setReviews] = useState<CommunityReview[]>(INITIAL_REVIEWS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for new review
  const [placeName, setPlaceName] = useState("");
  const [destination, setDestination] = useState("Goa");
  const [category, setCategory] = useState<CommunityReview["category"]>("Hidden Gem");
  const [comment, setComment] = useState("");
  const [actualExpense, setActualExpense] = useState<number>(350);
  const [scamWarning, setScamWarning] = useState("");

  const handleUpvote = (id: string) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, upvotes: r.upvotes + 1 } : r))
    );
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!placeName || !comment) return;

    const newRev: CommunityReview = {
      id: `rev-${Date.now()}`,
      userName: "Ananya Sharma",
      userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80",
      userBadge: "Top Explorer",
      destination,
      placeName,
      category,
      rating: 5.0,
      safetyScore: 97,
      comment,
      photos: ["https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80"],
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
    } catch (e) { }
  };

  const leaderboard = [
    { rank: 1, name: "Sneha Reddy", coins: 4850, title: "Community Hero", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80" },
    { rank: 2, name: "Ananya Sharma", coins: 3450, title: "Top Explorer", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80" },
    { rank: 3, name: "Rohan Malhotra", coins: 2900, title: "Trusted Traveller", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
  ];

  return (
    <div className="space-y-12 pb-16 max-w-7xl mx-auto">

      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-[2rem] glass-panel border border-white/5 bg-hero-gradient text-left">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-extrabold uppercase tracking-widest animate-float">
            <Coins className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Community Intelligence Hub • Earn YATRIK Coins</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-none">
            Traveler Feed & <span className="text-gradient">Hacks</span>
          </h1>
          
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
            Read authentic reviews, trip expenses, and scam alerts posted by verified explorers. Get rewards for contributing.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-indigo-600 hover:opacity-90 text-white font-bold text-xs shadow-glow flex items-center gap-2 transition-all hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Review (+100 Coins)</span>
        </button>
      </div>

      {/* 2. Main Grid Layout (Feed vs Leaderboard) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Editorial Reviews Feed (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-6 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/40 space-y-5 text-left hover:border-indigo-500/25 transition-all">
              
              {/* User header details */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={rev.userAvatar} alt={rev.userName} className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/30 shadow-glow" />
                  <div>
                    <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                      {rev.userName}
                      <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-bold border border-indigo-500/25">
                        {rev.userBadge}
                      </span>
                    </h3>
                    
                    <p className="text-[10px] text-gray-400">📍 {rev.destination} • {rev.createdAt}</p>
                  </div>
                </div>

                <div className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-bold flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>+{rev.coinsEarned} Coins</span>
                </div>
              </div>

              {/* Review Text */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-extrabold text-white">{rev.placeName}</h4>
                  
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold flex items-center gap-1 shadow-glow-emerald">
                    <ShieldCheck className="w-3.5 h-3.5" /> Safety: {rev.safetyScore}/100
                  </span>
                </div>
                
                <p className="text-xs text-gray-300 leading-relaxed italic">"{rev.comment}"</p>
              </div>

              {/* Scam Warning Callout */}
              {rev.scamWarning && (
                <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs text-rose-300 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="font-extrabold text-rose-400">⚠️ Scam Alert: </span>
                    {rev.scamWarning}
                  </div>
                </div>
              )}

              {/* Photos Carousel */}
              {rev.photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto py-1">
                  {rev.photos.map((p, i) => (
                    <img key={i} src={p} alt="Review attachment" className="w-48 h-32 rounded-xl object-cover border border-white/5 hover:scale-[1.02] transition-transform" />
                  ))}
                </div>
              )}

              {/* Cost and Interactions */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                <span>Actual Cost Spend: <strong className="text-white">₹{rev.actualExpense}</strong></span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpvote(rev.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-pink-500/10 text-pink-400 border border-white/10 font-bold transition-all"
                  >
                    <Heart className="w-3.5 h-3.5 fill-pink-500" />
                    <span>{rev.upvotes} Upvotes</span>
                  </button>
                  <button 
                    onClick={() => alert("Review link copied to clipboard!")}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Right Column: Trophy Leaderboard (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-amber-500/25 bg-[#090d16]/50 space-y-5 text-left shadow-glow">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
              Explorer Leaderboard
            </h3>
            
            <p className="text-xs text-gray-400">Top community guides earning coin multipliers this month</p>

            <div className="space-y-3 pt-2">
              {leaderboard.map((user) => (
                <div key={user.rank} className="p-3.5 rounded-2xl bg-[#030712]/50 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-black text-amber-400">#{user.rank}</span>
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-500/30" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{user.name}</h4>
                      <p className="text-[9px] text-gray-400">{user.title}</p>
                    </div>
                  </div>
                  
                  <span className="text-xs font-extrabold text-gradient-amber">{user.coins} Coins</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Post Review Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl glass-panel border border-white/10 bg-[#090d16] space-y-5 text-left animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
                Post Community Review
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full hover:bg-white/5 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddReview} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-gray-300 font-bold">Place / Shop Name</label>
                  <input
                    type="text"
                    value={placeName}
                    onChange={(e) => setPlaceName(e.target.value)}
                    placeholder="e.g. Fontainhas Coffee Spot"
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-white focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-gray-300 font-bold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 mt-1 rounded-xl glass-input text-white bg-[#030712] focus:outline-none"
                  >
                    <option value="Hidden Gem">Hidden Gem</option>
                    <option value="Hotel">Hotel / Stay</option>
                    <option value="Restaurant">Restaurant / Cafe</option>
                    <option value="Scam Alert">Scam Warning</option>
                    <option value="Safety Tip">Safety Tip</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-gray-300 font-bold">Destination City</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-white focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-gray-300 font-bold">Actual Expenses (₹)</label>
                  <input
                    type="number"
                    value={actualExpense}
                    onChange={(e) => setActualExpense(Number(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-xl glass-input text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-300 font-bold">Your Authentic Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell others about costs, crowd, lighting safety, host behavior..."
                  className="w-full px-3 py-2 mt-1 rounded-xl glass-input text-white focus:outline-none h-24"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-300 font-bold">Scam Alert Description (Optional)</label>
                <input
                  type="text"
                  value={scamWarning}
                  onChange={(e) => setScamWarning(e.target.value)}
                  placeholder="e.g. Taxis overcharging 3x standard rate at railway gate"
                  className="w-full px-3 py-2 mt-1 rounded-xl glass-input text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold shadow-glow"
                >
                  Publish & Claim +100 Coins
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
