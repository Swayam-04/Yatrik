"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Sparkles, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  Navigation, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  Share2, 
  Download, 
  Sun, 
  CloudRain, 
  Clock, 
  Compass,
  Zap,
  ArrowRight,
  Heart,
  ChevronDown,
  Cpu,
  RefreshCw,
  Terminal,
  FileText
} from "lucide-react";
import { generateAiTrip, generateGroqTrip } from "@/lib/ai-engine";
import { Trip, TravelerType, TransportMode, PreferenceType, ItineraryItem } from "@/types";
import { formatCurrency, getSafetyBadgeColor } from "@/lib/utils";
import confetti from "canvas-confetti";

function AiPlannerContent() {
  const searchParams = useSearchParams();
  const initialDest = searchParams.get("destination") || "Goa";

  const [destination, setDestination] = useState(initialDest);
  const [budget, setBudget] = useState<number>(25000);
  const [days, setDays] = useState<number>(4);
  const [travelers, setTravelers] = useState<number>(1);
  const [travelerType, setTravelerType] = useState<TravelerType>("Women Solo");
  const [transportMode, setTransportMode] = useState<TransportMode>("Flight");
  const [selectedPreferences, setSelectedPreferences] = useState<PreferenceType[]>([
    "Hidden Gems", "Food & Cafes", "Photography", "Nightlife"
  ]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [rawAiResponse, setRawAiResponse] = useState<string | undefined>(undefined);
  const [showRawText, setShowRawText] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCost, setEditCost] = useState<number>(0);

  const [aiStatus, setAiStatus] = useState<{
    isOnline: boolean;
    checking: boolean;
    model: string;
    error?: string;
  }>({
    isOnline: false,
    checking: true,
    model: "llama-3.3-70b-versatile"
  });

  const checkHealth = async () => {
    setAiStatus(prev => ({ ...prev, checking: true }));
    try {
      const res = await fetch("/api/ai/status");
      if (res.ok) {
        const data = await res.json();
        setAiStatus({
          isOnline: data.isOnline,
          checking: false,
          model: data.model || "llama-3.3-70b-versatile",
          error: data.error
        });
      } else {
        const data = await res.json().catch(() => ({}));
        setAiStatus({
          isOnline: false,
          checking: false,
          model: "llama-3.3-70b-versatile",
          error: data.error || "Groq Service Standby"
        });
      }
    } catch {
      setAiStatus({
        isOnline: false,
        checking: false,
        model: "llama-3.3-70b-versatile",
        error: "Network Error"
      });
    }
  };

  useEffect(() => {
    checkHealth();
    handleGeneratePlan();
  }, []);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const result = await generateGroqTrip({
        destination,
        budget,
        days,
        travelers,
        travelerType,
        transportMode,
        preferences: selectedPreferences,
      });
      setCurrentTrip(result.trip);
      setRawAiResponse(result.rawAiResponse);
      try {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      } catch (e) {
        // Fallback
      }
    } catch {
      const trip = generateAiTrip({
        destination,
        budget,
        days,
        travelers,
        travelerType,
        transportMode,
        preferences: selectedPreferences,
      });
      setCurrentTrip(trip);
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePreference = (pref: PreferenceType) => {
    if (selectedPreferences.includes(pref)) {
      setSelectedPreferences(selectedPreferences.filter((p) => p !== pref));
    } else {
      setSelectedPreferences([...selectedPreferences, pref]);
    }
  };

  // Item deletion
  const handleDeleteItem = (dayNumber: number, itemId: string) => {
    if (!currentTrip) return;
    const updatedDays = currentTrip.days.map((day) => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          items: day.items.filter((item) => item.id !== itemId),
        };
      }
      return day;
    });
    setCurrentTrip({ ...currentTrip, days: updatedDays });
  };

  // Add new item
  const handleAddItem = (dayNumber: number) => {
    if (!currentTrip) return;
    const newItem: ItineraryItem = {
      id: `custom-item-${Date.now()}`,
      timeOfDay: 'Evening',
      title: 'Custom Local Activity',
      description: 'User added custom stop.',
      category: 'Activity',
      cost: 500,
      duration: '1 hr',
      location: destination,
      safetyScore: 95,
      isWomenFriendly: true,
    };

    const updatedDays = currentTrip.days.map((day) => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          items: [...day.items, newItem],
        };
      }
      return day;
    });
    setCurrentTrip({ ...currentTrip, days: updatedDays });
  };

  // Start inline editing
  const startEditItem = (item: ItineraryItem) => {
    setEditingItemId(item.id);
    setEditTitle(item.title);
    setEditCost(item.cost);
  };

  // Save inline edit
  const saveEditItem = (dayNumber: number, itemId: string) => {
    if (!currentTrip) return;
    const updatedDays = currentTrip.days.map((day) => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          items: day.items.map((item) => {
            if (item.id === itemId) {
              return { ...item, title: editTitle, cost: editCost };
            }
            return item;
          }),
        };
      }
      return day;
    });
    setCurrentTrip({ ...currentTrip, days: updatedDays });
    setEditingItemId(null);
  };

  const preferencesList: PreferenceType[] = [
    "Nature", "Adventure", "Luxury", "Budget", "Photography", 
    "Food & Cafes", "Nightlife", "Hidden Gems", "Cultural & Heritage", "Shopping"
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Banner */}
      <div className="space-y-3 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>Groq LLaMA 3.3 Itinerary Engine</span>
          <span className={`w-2 h-2 rounded-full ${aiStatus.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">AI Trip Planner</h1>
        <p className="text-sm text-gray-400">
          Personalized day-wise itinerary, budget breakdown, alternative backup plans, and women safety validation powered by Groq API.
        </p>
      </div>

      {/* Connection Notification if Offline */}
      {!aiStatus.isOnline && !aiStatus.checking && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex flex-col sm:flex-row items-center justify-between gap-3 max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Groq AI Status: <code className="px-1.5 py-0.5 bg-black/40 rounded text-amber-200 font-mono">{aiStatus.error || 'API Key Required'}</code>. Configure <code className="px-1.5 py-0.5 bg-black/40 rounded text-amber-200 font-mono">GROQ_API_KEY</code> in <code className="px-1.5 py-0.5 bg-black/40 rounded text-amber-200 font-mono">.env</code> to enable live Groq LLM generations.</span>
          </div>
          <button onClick={checkHealth} className="px-3 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold shrink-0 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Retry Check
          </button>
        </div>
      )}

      {/* Input Wizard Drawer / Panel */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6 bg-gradient-to-b from-dark-glass to-dark-bg">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Compass className="w-5 h-5 text-indigo-400" />
          Trip Parameters & Custom Preferences
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Destination */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Destination
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input focus:outline-none"
              placeholder="e.g. Goa, Tokyo, Paris"
            />
          </div>

          {/* Budget */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Target Budget (INR)
            </label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input focus:outline-none"
              step={1000}
            />
          </div>

          {/* Travel Days */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Duration (Days)
            </label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              min={1}
              max={15}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input focus:outline-none"
            />
          </div>

          {/* Traveler Type */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-pink-400" /> Traveler Type
            </label>
            <select
              value={travelerType}
              onChange={(e) => setTravelerType(e.target.value as TravelerType)}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input focus:outline-none bg-dark-bg"
            >
              <option value="Women Solo">Women Solo (High Safety Focus)</option>
              <option value="Solo">Solo Traveler</option>
              <option value="Couple">Couple</option>
              <option value="Family">Family</option>
              <option value="Friends">Friends Group</option>
            </select>
          </div>

        </div>

        {/* Preferences Tags Selection */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <label className="text-xs font-semibold text-gray-300">Select Travel Preferences</label>
          <div className="flex flex-wrap gap-2">
            {preferencesList.map((pref) => {
              const isSelected = selectedPreferences.includes(pref);
              return (
                <button
                  key={pref}
                  onClick={() => togglePreference(pref)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-indigo-600 text-white border border-indigo-400 shadow-glow"
                      : "bg-white/5 text-gray-400 border border-white/10 hover:text-white"
                  }`}
                >
                  {pref}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-pink-500 text-white font-bold text-xs shadow-glow hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Gemma 4 is Drafting Itinerary...' : 'Generate Itinerary with Gemma 4'}</span>
          </button>
        </div>
      </div>

      {/* Generated Itinerary Display */}
      {currentTrip && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* Trip Overview Header Card */}
          <div className="p-6 rounded-3xl glass-panel border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-dark-glass">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-extrabold text-white">{currentTrip.title}</h2>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Safety Score: {currentTrip.safetyScore}/100
                </span>
                {rawAiResponse && (
                  <button
                    onClick={() => setShowRawText(!showRawText)}
                    className="px-2.5 py-1 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{showRawText ? 'Hide Gemma 4 Markdown' : 'View Gemma 4 Markdown'}</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400">
                {currentTrip.daysCount} Days • {currentTrip.travelType} • Estimated Total Cost: <strong className="text-amber-400">{formatCurrency(currentTrip.budgetTotal)}</strong>
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button 
                onClick={() => alert("Trip saved to your YATRIK Dashboard!")}
                className="flex-1 md:flex-none py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Trip</span>
              </button>
              <button 
                onClick={() => alert("Travel Pass Card & QR code link generated!")}
                className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4 text-indigo-400" />
                <span>Share Card</span>
              </button>
            </div>
          </div>

          {/* Raw Groq LLM Response Drawer */}
          {showRawText && rawAiResponse && (
            <div className="p-6 rounded-3xl glass-panel border border-indigo-500/30 bg-dark-card/90 space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  Raw Output from Groq Model ({aiStatus.model})
                </h3>
                <span className="text-[10px] text-indigo-300">Direct Groq Stream Response</span>
              </div>
              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-xs text-gray-200 whitespace-pre-wrap font-mono max-h-96 overflow-y-auto leading-relaxed">
                {rawAiResponse}
              </div>
            </div>
          )}

          {/* Days Timeline */}
          <div className="space-y-8">
            {currentTrip.days.map((day) => (
              <div key={day.dayNumber} className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6">
                
                {/* Day Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Day {day.dayNumber}</span>
                    <h3 className="text-xl font-extrabold text-white">{day.title}</h3>
                  </div>
                  <div className="text-xs text-gray-400 flex items-center gap-4">
                    <span>Estimated Spend: <strong className="text-amber-400">{formatCurrency(day.dayExpense)}</strong></span>
                  </div>
                </div>

                {/* Weather Backup Box */}
                {day.alternativePlan && (
                  <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2">
                    <CloudRain className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>Gemma 4 Weather Backup Plan:</strong> {day.alternativePlan}
                    </div>
                  </div>
                )}

                {/* Items List */}
                <div className="space-y-4">
                  {day.items.map((item) => {
                    const isEditing = editingItemId === item.id;

                    return (
                      <div
                        key={item.id}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4 flex-1">
                          <div className="px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold shrink-0">
                            {item.timeOfDay}
                          </div>

                          <div className="space-y-1 flex-1">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  className="px-2 py-1 rounded glass-input text-xs text-white flex-1"
                                />
                                <input
                                  type="number"
                                  value={editCost}
                                  onChange={(e) => setEditCost(Number(e.target.value))}
                                  className="w-24 px-2 py-1 rounded glass-input text-xs text-white"
                                />
                                <button
                                  onClick={() => saveEditItem(day.dayNumber, item.id)}
                                  className="p-1 rounded bg-emerald-600 text-white"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-medium">
                                    {item.category}
                                  </span>
                                  {item.isWomenFriendly && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-medium flex items-center gap-0.5">
                                      <ShieldCheck className="w-3 h-3" /> Safe Zone
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-400">{item.description}</p>
                                <p className="text-[11px] text-gray-500">📍 {item.location} • Duration: {item.duration}</p>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                          <span className="text-xs font-bold text-amber-400">{formatCurrency(item.cost)}</span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => startEditItem(item)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
                              title="Edit Activity"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(day.dayNumber, item.id)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10"
                              title="Delete Activity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Activity Button */}
                <button
                  onClick={() => handleAddItem(day.dayNumber)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-white/20 hover:border-indigo-500/50 text-xs font-semibold text-gray-400 hover:text-indigo-300 flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Stop or Activity to Day {day.dayNumber}</span>
                </button>

              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}

export default function AiPlannerPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-gray-400 text-sm">
        Loading YATRIK Gemma 4 Itinerary Engine...
      </div>
    }>
      <AiPlannerContent />
    </Suspense>
  );
}
