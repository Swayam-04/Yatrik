"use client";

import React, { useState } from "react";
import {
  Sparkles,
  MapPin,
  Star,
  ShieldCheck,
  Heart,
  Eye,
  Search,
  Filter,
  Camera,
  Coffee,
  Sun,
  Flame,
  HelpCircle
} from "lucide-react";
import { INITIAL_GEMS } from "@/lib/store";
import { HiddenGem } from "@/types";

export default function LocalDiscoveryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [savedGems, setSavedGems] = useState<string[]>([]);
  const [gemsList] = useState<HiddenGem[]>(INITIAL_GEMS);

  const categories = ["All", "Secret Cafe", "Secret Beach", "Sunrise Point", "Sunset View", "Photography"];

  const handleSaveGem = (id: string, title: string) => {
    if (savedGems.includes(id)) {
      setSavedGems(prev => prev.filter(gId => gId !== id));
    } else {
      setSavedGems(prev => [...prev, id]);
    }
  };

  const filteredGems = gemsList
    .filter((g) => activeCategory === "All" || g.category.toLowerCase().includes(activeCategory.toLowerCase()))
    .filter((g) => g.title.toLowerCase().includes(searchQuery.toLowerCase()) || g.destination.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-12 pb-16">

      {/* Immersive Editorial Header */}
      <div className="space-y-4 text-center max-w-3xl mx-auto py-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-300 text-[10px] font-extrabold uppercase tracking-widest animate-float">
          <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
          <span>Local Gem Discovery Engine</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none">
          Hidden Gems & <span className="text-gradient">Secret Spots</span>
        </h1>
        <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-xl mx-auto">
          Ditch the tourist crowds. Discover cozy local cafes, secluded coastal coves, and epic viewpoints mapped by verified travelers.
        </p>
      </div>

      {/* Floating Spotlight Popup Alert */}
      <div className="popup-banner p-4 max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3 justify-between shadow-glow">
        <div className="flex items-center gap-2.5">
          <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
          <span className="text-xs text-gray-200">
            <strong>Hot Spot Alert:</strong> <span className="text-gradient-amber">Butterfly Beach Cove</span> has low crowds today. Recommended visit before 9:00 AM!
          </span>
        </div>
        <div className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-300 font-bold shrink-0">
          Updated 10m ago
        </div>
      </div>

      {/* Search & Filter Bar Grid */}
      <div className="max-w-4xl mx-auto p-4 rounded-2xl glass-panel border border-white/5 bg-[#090d16]/70 flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="w-full relative flex items-center">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5" />
          <input
            type="text"
            placeholder="Search gems by name or location (e.g. Goa, Cafe)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs glass-input focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Categories Scroller */}
        <div className="w-full md:w-auto flex items-center gap-1.5 overflow-x-auto py-1 shrink-0">
          <Filter className="w-3.5 h-3.5 text-indigo-400 hidden md:block" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-[11px] font-bold tracking-wide transition-all shrink-0 ${
                activeCategory === cat
                  ? "bg-gradient-to-r from-indigo-600 to-pink-600 text-white shadow-glow border border-indigo-500/20"
                  : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Discovery Catalog Grid */}
      {filteredGems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {filteredGems.map((gem) => {
            const isSaved = savedGems.includes(gem.id);
            return (
              <div
                key={gem.id}
                className="group rounded-2xl overflow-hidden glass-panel border border-white/5 glass-panel-hover flex flex-col justify-between"
              >
                {/* Image and dynamic badges */}
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={gem.image}
                    alt={gem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-indigo-600/30 backdrop-blur-md border border-indigo-500/20 text-[9px] font-bold text-indigo-300">
                    {gem.category}
                  </div>
                  
                  {gem.isWomenSafe && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#030712]/85 backdrop-blur-md border border-emerald-500/25 text-[9px] font-bold text-emerald-400 flex items-center gap-1 shadow-glow-emerald">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Women Safe</span>
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-[#030712]/80 backdrop-blur-md text-[10px] text-gray-300 font-bold">
                    Crowd Density: <span className="text-emerald-400">{gem.crowdLevel}</span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-indigo-400 font-bold">
                      <span className="flex items-center gap-1">📍 {gem.destination}</span>
                      <span className="flex items-center gap-0.5 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {gem.rating}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-extrabold text-white group-hover:text-indigo-300 transition-colors">
                      {gem.title}
                    </h3>
                    
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {gem.description}
                    </p>
                  </div>

                  {/* Visit Time and Action triggers */}
                  <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                    <div className="text-left">
                      <span className="block text-[9px] text-gray-500 font-semibold uppercase">Best Hours</span>
                      <strong className="text-white font-bold">{gem.bestTime}</strong>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveGem(gem.id, gem.title)}
                        className={`p-2 rounded-xl border transition-all ${
                          isSaved
                            ? "bg-pink-500/20 border-pink-500/40 text-pink-400 scale-105"
                            : "bg-white/5 border-white/10 hover:bg-white/10 text-gray-400 hover:text-white"
                        }`}
                        title={isSaved ? "Saved" : "Save Spot"}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? "fill-pink-500" : ""}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="p-12 text-center glass-panel border border-white/5 rounded-2xl max-w-xl mx-auto space-y-4">
          <Eye className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Secret Spots Found</h3>
          <p className="text-xs text-gray-400 max-w-xs mx-auto">
            We couldn't find any hidden gems matching your search query. Try clearing filters or searching for another keyword.
          </p>
          <button
            onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
}
