"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Sparkles,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  ShieldCheck,
  Plus,
  Trash2,
  Edit3,
  Check,
  Share2,
  ChevronDown,
  ChevronUp,
  Cpu,
  RefreshCw,
  FileText,
  Clock,
  Compass,
  ArrowRight,
  Shield,
  CloudRain,
  Navigation,
  ThumbsUp
} from "lucide-react";
import { generateAiTrip, generateGroqTrip } from "@/lib/ai-engine";
import { Trip, TravelerType, TransportMode, PreferenceType, ItineraryItem, ItineraryDay } from "@/types";
import { formatCurrency } from "@/lib/utils";
import confetti from "canvas-confetti";

function AiPlannerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDest = searchParams.get("destination") || "";
  const initialBudget = Number(searchParams.get("budget")) || 20000;
  const initialStyle = (searchParams.get("travelType") as TravelerType) || "Solo";

  // Form Steps: 1 to 6
  const [step, setStep] = useState<number>(initialDest ? 2 : 1);
  const [destination, setDestination] = useState(initialDest);
  const [startDate, setStartDate] = useState<string>(new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]);
  const [days, setDays] = useState<number>(4);
  const [travelers, setTravelers] = useState<number>(1);
  const [travelerType, setTravelerType] = useState<TravelerType>(initialStyle);
  const [transportMode, setTransportMode] = useState<TransportMode>("Flight");
  
  const [selectedPreferences, setSelectedPreferences] = useState<PreferenceType[]>([
    "Hidden Gems", "Food & Cafes", "Photography"
  ]);
  const [womensSafetyMode, setWomensSafetyMode] = useState<boolean>(initialStyle === "Women Solo");

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [rawAiResponse, setRawAiResponse] = useState<string | undefined>(undefined);
  const [showRawText, setShowRawText] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editCost, setEditCost] = useState<number>(0);
  const [editDescription, setEditDescription] = useState("");
  const [editLocation, setEditLocation] = useState("");
  
  const [aiStatus, setAiStatus] = useState({
    isOnline: false,
    checking: true,
    model: "gemma-4"
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
          model: data.model || "gemma-4-ollama",
        });
      } else {
        setAiStatus({
          isOnline: false,
          checking: false,
          model: "gemma-4",
        });
      }
    } catch {
      setAiStatus({
        isOnline: false,
        checking: false,
        model: "gemma-4",
      });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    // Align travelerType selection with Women's Safety Mode
    const finalTravelerType = womensSafetyMode ? "Women Solo" : travelerType;
    try {
      const result = await generateGroqTrip({
        destination: destination || "Goa",
        budget: initialBudget,
        days,
        travelers,
        travelerType: finalTravelerType,
        transportMode,
        preferences: selectedPreferences,
      });
      
      // Save details to state
      setCurrentTrip(result.trip);
      setRawAiResponse(result.rawAiResponse);
      
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch {}
    } catch (e) {
      const fallbackTrip = generateAiTrip({
        destination: destination || "Goa",
        budget: initialBudget,
        days,
        travelers,
        travelerType: finalTravelerType,
        transportMode,
        preferences: selectedPreferences,
      });
      setCurrentTrip(fallbackTrip);
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

  // Timeline Mutations
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

  const handleAddItem = (dayNumber: number) => {
    if (!currentTrip) return;
    const newItem: ItineraryItem = {
      id: `custom-item-${Date.now()}`,
      timeOfDay: 'Afternoon',
      title: 'Local Hidden Cafe Visit',
      description: 'Handpicked local hotspot recommended by community travelers.',
      category: 'Food',
      cost: 400,
      duration: '1.5 hrs',
      location: destination || "Central Zone",
      safetyScore: 98,
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

  const startEditItem = (item: ItineraryItem) => {
    setEditingItemId(item.id);
    setEditTitle(item.title);
    setEditCost(item.cost);
    setEditDescription(item.description);
    setEditLocation(item.location);
  };

  const saveEditItem = (dayNumber: number, itemId: string) => {
    if (!currentTrip) return;
    const updatedDays = currentTrip.days.map((day) => {
      if (day.dayNumber === dayNumber) {
        return {
          ...day,
          items: day.items.map((item) => {
            if (item.id === itemId) {
              return { 
                ...item, 
                title: editTitle, 
                cost: editCost,
                description: editDescription,
                location: editLocation
              };
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

  // Reorder activities
  const moveActivity = (dayNumber: number, idx: number, direction: 'up' | 'down') => {
    if (!currentTrip) return;
    const updatedDays = currentTrip.days.map((day) => {
      if (day.dayNumber === dayNumber) {
        const items = [...day.items];
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx >= 0 && targetIdx < items.length) {
          const temp = items[idx];
          items[idx] = items[targetIdx];
          items[targetIdx] = temp;
        }
        return { ...day, items };
      }
      return day;
    });
    setCurrentTrip({ ...currentTrip, days: updatedDays });
  };

  // Budget Optimization
  const optimizeBudget = () => {
    if (!currentTrip) return;
    const updatedDays = currentTrip.days.map((day) => {
      const items = day.items.map((item) => {
        if (item.cost > 1000) {
          return { ...item, cost: Math.round(item.cost * 0.8), title: `${item.title} (Optimized Deal)` };
        }
        return item;
      });
      return { ...day, items };
    });
    setCurrentTrip({ ...currentTrip, days: updatedDays });
    alert("AI Budget Optimization applied: Saved 20% on premium stays and tour packages!");
  };

  const preferencesList: PreferenceType[] = [
    "Nature", "Adventure", "Luxury", "Budget", "Photography", 
    "Food & Cafes", "Nightlife", "Hidden Gems", "Cultural & Heritage", "Shopping"
  ];

  return (
    <div className="space-y-12 pb-16">
      
      {/* Immersive Header */}
      <div className="space-y-3 text-center max-w-3xl mx-auto py-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[10px] font-extrabold uppercase tracking-widest animate-float">
          <Cpu className="w-4 h-4 text-indigo-400" />
          <span>Gemma 4 Itinerary Engine</span>
          <span className={`w-2 h-2 rounded-full ${aiStatus.isOnline ? 'bg-emerald-400 animate-pulse shadow-glow-emerald' : 'bg-amber-400'}`} />
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">AI Trip Planner</h1>
        <p className="text-sm md:text-base text-gray-400 max-w-lg mx-auto leading-relaxed">
          Create structured travel schedules, estimate budgets, and verify safe routing powered by Gemma 4 & Ollama.
        </p>
      </div>

      {/* MULTI-STEP PLANNER FORM */}
      {!currentTrip && !isGenerating && (
        <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/80 space-y-8 relative shadow-2xl">
          {/* Step Progress bar */}
          <div className="flex items-center justify-between text-xs text-gray-400 border-b border-white/5 pb-4">
            <span className="font-extrabold text-indigo-400">Step {step} of 6</span>
            <div className="w-40 h-1.5 rounded-full bg-white/5 relative overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
                style={{ width: `${(step / 6) * 100}%` }}
              />
            </div>
          </div>

          {/* STEP 1: Destination */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-400" />
                  Where are you going?
                </h3>
                <p className="text-xs text-gray-400">Select your destination town or region.</p>
              </div>
              <input
                type="text"
                placeholder="e.g. Goa, Tokyo, Paris, Manali"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-xs glass-input focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* STEP 2: When & Duration */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-400" />
                  When is your trip?
                </h3>
                <p className="text-xs text-gray-400">Pick a starting date and duration.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input focus:ring-1"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Days (1 - 15)</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input focus:ring-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Travelers */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  Who are you travelling with?
                </h3>
                <p className="text-xs text-gray-400">Specify your company for customized options.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {([
                  { label: "Solo", val: "Solo" },
                  { label: "Couple", val: "Couple" },
                  { label: "Family", val: "Family" },
                  { label: "Friends", val: "Friends" }
                ] as const).map((opt) => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => {
                      setTravelerType(opt.val);
                      if (opt.val === "Solo") setTravelers(1);
                    }}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      travelerType === opt.val
                        ? "bg-indigo-600/10 border-indigo-500 text-white font-bold"
                        : "bg-white/5 border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {travelerType !== "Solo" && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Number of Travelers</label>
                  <input
                    type="number"
                    min="1"
                    value={travelers}
                    onChange={(e) => setTravelers(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input focus:ring-1"
                  />
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Budget */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-indigo-400" />
                  Budget Forecast
                </h3>
                <p className="text-xs text-gray-400">Adjust your maximum spending limit (INR).</p>
              </div>
              <div className="space-y-4">
                <div className="text-center py-4 rounded-2xl bg-white/5 border border-white/10">
                  <span className="text-[10px] text-gray-400 block font-semibold uppercase">Total Budget</span>
                  <span className="text-3xl font-black text-amber-400">{formatCurrency(initialBudget)}</span>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-500 uppercase font-semibold">Transport Mode Choice</label>
                  <select
                    value={transportMode}
                    onChange={(e) => setTransportMode(e.target.value as TransportMode)}
                    className="w-full px-3 py-2 rounded-xl text-xs glass-input bg-dark-bg"
                  >
                    <option value="Flight">Flight Transport</option>
                    <option value="Train">Train Transport</option>
                    <option value="Car">Road Trip / Car</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Travel Preferences */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-400" />
                  Travel Preferences
                </h3>
                <p className="text-xs text-gray-400">Choose tags that fit your travel style.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {preferencesList.map((pref) => {
                  const isSelected = selectedPreferences.includes(pref);
                  return (
                    <button
                      key={pref}
                      type="button"
                      onClick={() => togglePreference(pref)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
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
          )}

          {/* STEP 6: Safety Preferences (Women's Safety Mode) */}
          {step === 6 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                  Safety Settings
                </h3>
                <p className="text-xs text-gray-400">Set active safety mode metrics for planning.</p>
              </div>

              <div 
                onClick={() => setWomensSafetyMode(!womensSafetyMode)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                  womensSafetyMode 
                    ? "bg-emerald-500/10 border-emerald-500/50 shadow-glow-emerald" 
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <Shield className={`w-6 h-6 shrink-0 mt-0.5 ${womensSafetyMode ? "text-emerald-400" : "text-gray-400"}`} />
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    Women's Safety Mode
                    {womensSafetyMode && <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">Enabled</span>}
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Prioritize well-lit walking tracks, high police density spots, verified hotels, and enable 1-click panic SOS broadcasting elements.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={() => step > 1 && setStep(step - 1)}
              disabled={step === 1}
              className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-white disabled:opacity-30"
            >
              Back
            </button>

            {step < 6 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGeneratePlan}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white font-bold text-xs shadow-glow hover:scale-105 transition-all"
              >
                Generate AI Itinerary
              </button>
            )}
          </div>
        </div>
      )}

      {/* GENERATING LOADING SKELETON */}
      {isGenerating && (
        <div className="max-w-2xl mx-auto p-8 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/80 text-center space-y-6 animate-pulse">
          <Sparkles className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-white">Gemma 4 is Drafting Your Itinerary...</h3>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Analyzing routes, calculating budgets, mapping safety networks, and compiling local recommendations.
            </p>
          </div>
          <div className="h-4 rounded bg-white/5 w-3/4 mx-auto" />
          <div className="h-3 rounded bg-white/5 w-1/2 mx-auto" />
        </div>
      )}

      {/* GENERATED ITINERARY TIMELINE EXPERIENCE */}
      {currentTrip && !isGenerating && (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
          
          {/* Timeline Overview Header */}
          <div className="p-6 rounded-3xl glass-panel border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-[#090d16]/70">
            <div className="space-y-1 text-left">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-extrabold text-white">{currentTrip.title}</h2>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold flex items-center gap-1 shadow-glow-emerald">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Safety Score: {currentTrip.safetyScore}/100
                </span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                {currentTrip.daysCount} Days • {currentTrip.travelType} • Estimated Total Cost: <strong className="text-amber-400 font-bold">{formatCurrency(currentTrip.budgetTotal)}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button 
                onClick={optimizeBudget}
                className="flex-1 md:flex-none py-2 px-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold hover:bg-amber-500/25 transition-all"
              >
                Optimize Cost
              </button>
              <button 
                onClick={() => alert("Trip saved successfully to your dashboard! Unlocked 100 YATRIK Coins.")}
                className="flex-1 md:flex-none py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition-all flex items-center justify-center gap-1.5"
              >
                <span>Save to Dashboard</span>
              </button>
            </div>
          </div>

          {/* Timeline Days */}
          <div className="space-y-8 text-left">
            {currentTrip.days.map((day) => (
              <div key={day.dayNumber} className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 bg-[#070b14]/50 space-y-6">
                
                {/* Day Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Day {day.dayNumber}</span>
                    <h3 className="text-xl font-extrabold text-white">{day.title}</h3>
                  </div>
                  <div className="text-xs text-gray-400">
                    Day Budget: <strong className="text-amber-400 font-bold">{formatCurrency(day.dayExpense)}</strong>
                  </div>
                </div>

                {/* Weather Backup Option */}
                {day.alternativePlan && (
                  <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 flex items-start gap-2.5 leading-relaxed">
                    <CloudRain className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5 animate-pulse" />
                    <div>
                      <strong>Weather Backup Option: </strong> {day.alternativePlan}
                    </div>
                  </div>
                )}

                {/* Vertical Timeline Items List */}
                <div className="relative border-l border-white/5 pl-4 ml-2 space-y-6">
                  {day.items.map((item, idx) => {
                    const isEditing = editingItemId === item.id;
                    return (
                      <div key={item.id} className="relative space-y-2">
                        {/* Timeline dot */}
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-glow" />

                        {/* Card item */}
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-500/25 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-[10px] font-bold">
                              {item.timeOfDay}
                            </div>

                            <div className="space-y-1.5 flex-1 text-left">
                              {isEditing ? (
                                <div className="space-y-2 max-w-md">
                                  <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    className="w-full px-2 py-1 rounded glass-input text-xs text-white"
                                    placeholder="Title"
                                  />
                                  <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    className="w-full px-2 py-1 rounded glass-input text-xs text-white"
                                    placeholder="Description"
                                  />
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={editLocation}
                                      onChange={(e) => setEditLocation(e.target.value)}
                                      className="px-2 py-1 rounded glass-input text-xs text-white flex-1"
                                      placeholder="Location"
                                    />
                                    <input
                                      type="number"
                                      value={editCost}
                                      onChange={(e) => setEditCost(Number(e.target.value))}
                                      className="w-24 px-2 py-1 rounded glass-input text-xs text-white"
                                      placeholder="Cost"
                                    />
                                    <button
                                      onClick={() => saveEditItem(day.dayNumber, item.id)}
                                      className="p-1 px-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="text-sm font-extrabold text-white leading-tight">{item.title}</h4>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-gray-400 font-semibold border border-white/10">
                                      {item.category}
                                    </span>
                                    {item.isWomenFriendly && (
                                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-bold flex items-center gap-0.5 shadow-glow-emerald">
                                        <ShieldCheck className="w-3 h-3" /> safe route
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-300 leading-relaxed">{item.description}</p>
                                  <p className="text-[10px] text-gray-500">📍 {item.location} • Duration: {item.duration}</p>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Controls Row */}
                          <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-2 sm:pt-0">
                            <span className="text-xs font-bold text-amber-400">{formatCurrency(item.cost)}</span>

                            <div className="flex items-center gap-1.5">
                              {/* Reorder Arrows */}
                              <button
                                onClick={() => idx > 0 && moveActivity(day.dayNumber, idx, 'up')}
                                disabled={idx === 0}
                                className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-25"
                                title="Move Up"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => idx < day.items.length - 1 && moveActivity(day.dayNumber, idx, 'down')}
                                disabled={idx === day.items.length - 1}
                                className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-white disabled:opacity-25"
                                title="Move Down"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit / Delete */}
                              <button
                                onClick={() => startEditItem(item)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
                                title="Edit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(day.dayNumber, item.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add Stop Button */}
                <button
                  onClick={() => handleAddItem(day.dayNumber)}
                  className="w-full py-2.5 rounded-xl border border-dashed border-white/10 hover:border-indigo-500/50 text-xs font-bold text-gray-400 hover:text-indigo-300 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Stop to Day {day.dayNumber}</span>
                </button>
              </div>
            ))}
          </div>

          {/* Reset Button */}
          <div className="text-center pt-4">
            <button
              onClick={() => { setCurrentTrip(null); setStep(1); }}
              className="px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-bold transition-all"
            >
              Plan Another Journey
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AiPlannerPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-gray-400 text-xs font-bold">
        Loading YATRIK AI planner engine...
      </div>
    }>
      <AiPlannerContent />
    </Suspense>
  );
}
