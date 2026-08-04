"use client";

import React, { useState } from "react";
import {
  Sparkles,
  MapPin,
  Star,
  Sun,
  Moon,
  Camera,
  Coffee,
  Compass,
  ShieldCheck,
  Users,
  Heart,
  Eye
} from "lucide-react";
import { INITIAL_GEMS } from "@/lib/store";
import { HiddenGem } from "@/types";

export default function LocalDiscoveryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [gemsList, setGemsList] = useState<HiddenGem[]>(INITIAL_GEMS);

  const categories = ["All", "Secret Cafe", "Secret Beach", "Sunrise Point", "Sunset View", "Photography"];

  const filteredGems = activeCategory === "All"
    ? gemsList
    : gemsList.filter((g) => g.category.toLowerCase().includes(activeCategory.toLowerCase()));

  return (
    <div className="space-y-8 pb-16">

      {/* Top Banner */}
      <div className="space-y-2 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          <span>Local Gem Discovery Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">Hidden Gems & Secret Spots</h1>
        <p className="text-sm text-gray-400">
          Skip tourist crowds. Discover uncrowded cafes, secret beach coves, golden sunrise viewpoints, and authentic traditional food.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full font-semibold transition-all ${activeCategory === cat
                ? "bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-glow border border-indigo-400"
                : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
              }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Hidden Gems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredGems.map((gem) => (
          <div
            key={gem.id}
            className="group rounded-3xl overflow-hidden glass-panel border border-white/10 glass-panel-hover flex flex-col justify-between"
          >
            <div className="relative h-56 overflow-hidden">
              <img
                src={gem.image}
                alt={gem.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-dark-bg/80 backdrop-blur-md border border-white/10 text-xs font-semibold text-pink-400">
                {gem.category}
              </div>
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-dark-bg/80 backdrop-blur-md border border-white/10 text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Women Safe</span>
              </div>
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-md bg-dark-bg/80 backdrop-blur-md text-[11px] text-gray-300 font-medium">
                Crowd: <strong className="text-emerald-400">{gem.crowdLevel}</strong>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-indigo-400 font-semibold">
                  <span>📍 {gem.destination}</span>
                  <span className="flex items-center gap-1 text-amber-400"><Star className="w-3.5 h-3.5 fill-amber-400" /> {gem.rating}</span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {gem.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed">{gem.description}</p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                <span>Best Visit: <strong className="text-white">{gem.bestTime}</strong></span>
                <button
                  onClick={() => alert(`Saved ${gem.title} to your travel wishlist!`)}
                  className="p-2 rounded-xl bg-white/5 hover:bg-pink-500/20 text-pink-400 transition-colors"
                  title="Save Gem"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
