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
  Trophy
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
    <div className="space-y-8 pb-16">

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-dark-bg to-dark-bg">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Coins className="w-4 h-4" />
            <span>Community Intelligence Hub • Earn YATRIK Coins</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Authentic Traveler Reviews & Hacks</h1>
          <p className="text-xs text-gray-300">
            Real expenses, scam warnings, and safety ratings uploaded by travelers. Earn rewards for every verified contribution.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-bold text-xs shadow-glow flex items-center gap-2 hover:scale-105 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post Review (+100 Coins)</span>
        </button>
      </div>

      {/* Main Grid: Reviews Feed vs Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left 2 Columns: Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          {reviews.map((rev) => (
            <div key={rev.id} className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img src={rev.userAvatar} alt={rev.userName} className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-500/40" />
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      {rev.userName}
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                        {rev.userBadge}
                      </span>
                    </h3>
                    <p className="text-[10px] text-gray-400">Posted {rev.createdAt} • 📍 {rev.destination}</p>
                  </div>
                </div>

                <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5" />
                  <span>+{rev.coinsEarned} Coins</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white">{rev.placeName}</h4>
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Safety {rev.safetyScore}/100
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-2 leading-relaxed italic">"{rev.comment}"</p>
              </div>

              {rev.scamWarning && (
                <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>⚠️ Scam Warning:</strong> {rev.scamWarning}
                  </div>
                </div>
              )}

              {/* Photos if any */}
              {rev.photos.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pt-1">
                  {rev.photos.map((p, i) => (
                    <img key={i} src={p} alt="Review attachment" className="w-36 h-24 rounded-xl object-cover border border-white/10" />
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <span>Actual Spend: <strong className="text-white">₹{rev.actualExpense}</strong></span>

                <button
                  onClick={() => handleUpvote(rev.id)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-pink-500/20 text-pink-400 border border-white/10 font-medium transition-colors"
                >
                  <Heart className="w-3.5 h-3.5 fill-pink-400" />
                  <span>{rev.upvotes} Upvotes</span>
                </button>
              </div>

            </div>
          ))}
        </div>

        {/* Right Column: Global Leaderboard */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-amber-500/30 space-y-4 bg-dark-glass">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Global Explorer Leaderboard
            </h3>
            <p className="text-xs text-gray-400">Top contributors earning YATRIK Rewards this month</p>

            <div className="space-y-3 pt-2">
              {leaderboard.map((user) => (
                <div key={user.rank} className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs font-black text-amber-400">#{user.rank}</span>
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-white">{user.name}</h4>
                      <p className="text-[10px] text-gray-400">{user.title}</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-amber-400">{user.coins} Coins</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Post Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl glass-panel border border-white/20 space-y-4 bg-dark-bg">
            <h3 className="text-lg font-bold text-white">Post Community Review & Earn Coins</h3>

            <form onSubmit={handleAddReview} className="space-y-3 text-xs">
              <div>
                <label className="text-gray-300 font-semibold">Place / Hotel / Cafe Name</label>
                <input
                  type="text"
                  value={placeName}
                  onChange={(e) => setPlaceName(e.target.value)}
                  placeholder="e.g. Fontainhas Coffee Roasters"
                  className="w-full px-3 py-2 mt-1 rounded-xl glass-input text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-gray-300 font-semibold">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 mt-1 rounded-xl glass-input text-white bg-dark-bg focus:outline-none"
                >
                  <option value="Hidden Gem">Hidden Gem</option>
                  <option value="Hotel">Hotel / Stay</option>
                  <option value="Restaurant">Restaurant / Cafe</option>
                  <option value="Scam Alert">Scam Warning</option>
                  <option value="Safety Tip">Safety Tip</option>
                </select>
              </div>

              <div>
                <label className="text-gray-300 font-semibold">Your Authentic Experience / Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share costs, safety details, host behavior..."
                  className="w-full px-3 py-2 mt-1 rounded-xl glass-input text-white focus:outline-none h-24"
                  required
                />
              </div>

              <div>
                <label className="text-gray-300 font-semibold">Scam Alert (If any to avoid)</label>
                <input
                  type="text"
                  value={scamWarning}
                  onChange={(e) => setScamWarning(e.target.value)}
                  placeholder="e.g. Taxi drivers overcharging at main gate"
                  className="w-full px-3 py-2 mt-1 rounded-xl glass-input text-white focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
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
