"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  X,
  Star,
  MapPin,
  Clock,
  Globe,
  Phone,
  Sparkles,
  Bot,
  Send,
  Navigation,
  Compass,
  Heart,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Loader2,
} from "lucide-react";
import type { ExplorePlaceItem } from "@/services/explore.service";
import { MapboxMapContainer } from "@/components/mapbox/MapboxMapContainer";

interface PlaceDetailsModalProps {
  place: ExplorePlaceItem | null;
  onClose: () => void;
  isSaved?: boolean;
  onToggleSave?: (place: ExplorePlaceItem) => void;
}

export function PlaceDetailsModal({
  place,
  onClose,
  isSaved = false,
  onToggleSave,
}: PlaceDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "ai">("overview");
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Gemma 4 AI Chat State
  const [userQuestion, setUserQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!place) return null;

  const photos =
    place.photos && place.photos.length > 0
      ? place.photos
      : [
          "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80",
        ];

  const isGem = place.hiddenGemEvaluation?.isHiddenGem;
  const gemScore = place.hiddenGemEvaluation?.score ?? 0;

  const handleAskAi = async (question: string) => {
    if (!question.trim()) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/explore/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ place, question }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const tipsText =
          data.tips && Array.isArray(data.tips) && data.tips.length > 0
            ? "\n\n💡 Insider Tips:\n" + data.tips.map((t: string) => `• ${t}`).join("\n")
            : "";
        const fullAnswer = (data.explanation || data.answer || "") + tipsText;
        setAiAnswer(fullAnswer);
      } else {
        setAiError(data.error || "Failed to generate Gemma 4 AI response.");
      }
    } catch (err: any) {
      setAiError(err.message || "Failed to communicate with AI.");
    } finally {
      setAiLoading(false);
    }
  };

  const sampleQuestions = [
    "What makes this place a hidden gem?",
    "When is the best time of day to visit?",
    "What should I keep in mind regarding safety?",
    "What are some insider tips for travelers?",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] rounded-3xl glass-panel border border-white/10 bg-[#090d16]/95 text-white flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold uppercase tracking-wider">
              {place.displayCategory || place.category}
            </span>
            {isGem && (
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Score {gemScore}/100
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onToggleSave && (
              <button
                type="button"
                onClick={() => onToggleSave(place)}
                className={`p-2 rounded-xl border transition-all ${
                  isSaved
                    ? "bg-pink-500/25 border-pink-500/50 text-pink-400"
                    : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                }`}
                title={isSaved ? "Saved" : "Save Spot"}
              >
                <Heart className={`w-4 h-4 ${isSaved ? "fill-pink-500" : ""}`} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-white/5 shrink-0 bg-[#090d16]">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === "overview"
                ? "border-indigo-500 text-white"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            Overview & Facts
          </button>
          <button
            onClick={() => {
              setActiveTab("ai");
              if (!aiAnswer && !aiLoading) {
                handleAskAi("What makes this place special and how should I plan my visit?");
              }
            }}
            className={`pb-3 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "ai"
                ? "border-pink-500 text-pink-300"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Bot className="w-4 h-4 text-pink-400" />
            <span>Gemma 4 Travel Guide</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {activeTab === "overview" ? (
            <>
              {/* Media Section */}
              <div className="space-y-3">
                <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
                  <img
                    src={photos[activePhotoIndex]}
                    alt={place.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-transparent opacity-80" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                      {place.name}
                    </h2>
                    <p className="text-sm text-gray-300 flex items-center gap-1.5 mt-1">
                      <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>{place.address}</span>
                    </p>
                  </div>
                </div>

                {photos.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {photos.map((url, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                          activePhotoIndex === idx
                            ? "border-indigo-500 scale-105"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={url}
                          alt={`${place.name} thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Core Badges & Key Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="block text-[11px] text-gray-400 font-semibold uppercase">Rating</span>
                  <div className="flex items-center gap-1.5 mt-1 text-amber-400 font-extrabold text-lg">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{place.rating ? place.rating.toFixed(1) : "N/A"}</span>
                    {place.userRatingCount ? (
                      <span className="text-xs text-gray-400 font-normal">
                        ({place.userRatingCount} reviews)
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="block text-[11px] text-gray-400 font-semibold uppercase">Price Level</span>
                  <div className="mt-1 text-white font-extrabold text-lg">
                    {place.priceLevel || "Standard"}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="block text-[11px] text-gray-400 font-semibold uppercase">Status</span>
                  <div className="mt-1 font-bold text-sm">
                    {place.openNow !== undefined ? (
                      <span
                        className={`inline-flex items-center gap-1 ${
                          place.openNow ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {place.openNow ? "Open Now" : "Closed"}
                      </span>
                    ) : (
                      <span className="text-gray-400">Hours Unlisted</span>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                  <span className="block text-[11px] text-gray-400 font-semibold uppercase">Distance</span>
                  <div className="mt-1 text-indigo-300 font-extrabold text-base flex items-center gap-1">
                    <Navigation className="w-3.5 h-3.5" />
                    <span>
                      {place.distanceKm !== undefined
                        ? place.distanceKm < 1
                          ? `${Math.round(place.distanceKm * 1000)} m`
                          : `${place.distanceKm.toFixed(1)} km`
                        : "Nearby"}
                    </span>
                  </div>
                </div>
              </div>

              {/* YATRIK Hidden Gem Breakdown */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-pink-500/10 to-indigo-600/15 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
                    <h3 className="text-base font-bold text-white">
                      YATRIK Hidden Gem Evaluation
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 font-extrabold text-xs">
                    Score: {gemScore} / 100
                  </span>
                </div>

                <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      gemScore >= 75
                        ? "bg-gradient-to-r from-amber-400 to-pink-500"
                        : "bg-indigo-500"
                    }`}
                    style={{ width: `${gemScore}%` }}
                  />
                </div>

                <p className="text-xs text-gray-200 leading-relaxed">
                  {place.hiddenGemEvaluation?.reason ||
                    "Evaluated with YATRIK's dynamic scoring engine balancing genuine crowd sentiment against high tourist congestion."}
                </p>
              </div>

              {/* Summary and Description */}
              {place.summary && (
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                    Place Overview
                  </h4>
                  <p className="text-sm text-gray-200 leading-relaxed">
                    {place.summary}
                  </p>
                </div>
              )}

              {/* Hours of Operation */}
              {place.openingHours && place.openingHours.length > 0 && (
                <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Operating Hours</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-300">
                    {place.openingHours.map((schedule, idx) => (
                      <div key={idx} className="flex justify-between py-1 border-b border-white/5">
                        <span>{schedule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact and Links */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {place.website && (
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Visit Website</span>
                    <ExternalLink className="w-3 h-3 text-gray-500" />
                  </a>
                )}
                {place.phone && (
                  <a
                    href={`tel:${place.phone}`}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-200 flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{place.phone}</span>
                  </a>
                )}
                <Link
                  href={`/map?lat=${place.latitude}&lng=${place.longitude}&name=${encodeURIComponent(
                    place.name
                  )}`}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white flex items-center gap-1.5 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Open Full Map Navigation</span>
                </Link>
              </div>

              {/* Mapbox Mini Preview */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                  <span>Geographic Location</span>
                  <span>
                    {place.latitude.toFixed(4)}, {place.longitude.toFixed(4)}
                  </span>
                </div>
                <div className="h-56 rounded-2xl overflow-hidden border border-white/10">
                  <MapboxMapContainer
                    center={{ lat: place.latitude, lng: place.longitude }}
                    zoom={14}
                    destinationName={place.name}
                    markers={[
                      {
                        id: place.placeId,
                        name: place.name,
                        latitude: place.latitude,
                        longitude: place.longitude,
                        category: place.category,
                        rating: place.rating,
                        address: place.address,
                      },
                    ]}
                    className="h-full w-full"
                  />
                </div>
              </div>
            </>
          ) : (
            /* Gemma 4 AI Assistant Tab */
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-pink-500/10 border border-pink-500/20 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-pink-500/20 border border-pink-500/30 text-pink-300">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-pink-200">
                    Gemma 4 Grounded Travel Intelligence
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Ask Gemma 4 anything about <strong>{place.name}</strong>. Answers are
                    grounded strictly in real verified location details, pricing, and operating status.
                  </p>
                </div>
              </div>

              {/* Quick Questions Chips */}
              <div className="space-y-2">
                <span className="text-xs text-gray-400 font-semibold">Suggested Questions:</span>
                <div className="flex flex-wrap gap-2">
                  {sampleQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setUserQuestion(q);
                        handleAskAi(q);
                      }}
                      disabled={aiLoading}
                      className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 hover:text-white transition-all text-left"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Ask a question about ${place.name}...`}
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAskAi(userQuestion);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
                <button
                  type="button"
                  onClick={() => handleAskAi(userQuestion)}
                  disabled={aiLoading || !userQuestion.trim()}
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold text-xs disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0"
                >
                  {aiLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <span>Ask AI</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* AI Response Card */}
              {aiLoading ? (
                <div className="p-8 rounded-2xl glass-panel border border-white/10 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-pink-400 animate-spin mx-auto" />
                  <p className="text-xs text-gray-400">
                    Gemma 4 is synthesizing grounded place facts for {place.name}...
                  </p>
                </div>
              ) : aiError ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                  {aiError}
                </div>
              ) : aiAnswer ? (
                <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-3 bg-[#0c121e]">
                  <div className="flex items-center justify-between text-xs text-pink-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      Gemma 4 Intelligence
                    </span>
                    <span className="text-[10px] text-gray-500">Verified Grounded</span>
                  </div>
                  <div className="text-xs text-gray-200 leading-relaxed whitespace-pre-line space-y-2">
                    {aiAnswer}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
