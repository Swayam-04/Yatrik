"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Search, 
  MapPin, 
  Hotel, 
  Plane, 
  Train, 
  Utensils, 
  X, 
  RefreshCw, 
  Mic, 
  MicOff, 
  Pin, 
  Trash2, 
  Star, 
  History, 
  Compass, 
  Building2, 
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useSearchHistory, SearchHistoryItem } from "@/hooks/useSearchHistory";

interface Prediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface GlobalGoogleSearchBarProps {
  onSelectPlace: (place: { description: string; placeId?: string; lat?: number; lng?: number }) => void;
  placeholder?: string;
  className?: string;
}

export function GlobalGoogleSearchBar({
  onSelectPlace,
  placeholder = "Search ANY city, country, hotel, airport, restaurant worldwide...",
  className = "",
}: GlobalGoogleSearchBarProps) {
  const [value, setValue] = useState("");
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [activeTab, setActiveTab] = useState<"autocomplete" | "history">("autocomplete");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    history,
    pinnedItems,
    recentItems,
    addSearch,
    removeSearch,
    togglePin,
    clearHistory,
  } = useSearchHistory();

  // Debounced Autocomplete Search (300ms)
  useEffect(() => {
    if (!value.trim() || value.length < 2) {
      setPredictions([]);
      setErrorMsg(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await fetch(`/api/external/places/autocomplete?input=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.predictions && data.predictions.length > 0) {
            setPredictions(data.predictions);
            setActiveTab("autocomplete");
            setIsOpen(true);
          } else {
            setPredictions([]);
            setErrorMsg("No matching locations found.");
            setIsOpen(true);
          }
        } else {
          setErrorMsg("Search service temporarily unavailable. Click to retry.");
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Autocomplete fetch error:", err);
        setErrorMsg("Failed to load location suggestions.");
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPrediction = async (pred: Prediction) => {
    setValue(pred.description);
    setIsOpen(false);
    setIsLoading(true);

    try {
      // Fetch exact lat/lng place details
      const res = await fetch(`/api/external/places/details?query=${encodeURIComponent(pred.description)}&placeId=${pred.placeId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.place) {
          addSearch(pred.description, pred.mainText, data.place.lat, data.place.lng);
          onSelectPlace({
            description: pred.description,
            placeId: pred.placeId,
            lat: data.place.lat,
            lng: data.place.lng,
          });
          return;
        }
      }
    } catch (err) {
      console.error("Error resolving place details:", err);
    } finally {
      setIsLoading(false);
    }

    addSearch(pred.description, pred.mainText);
    onSelectPlace({ description: pred.description, placeId: pred.placeId });
  };

  const handleSelectHistoryItem = (item: SearchHistoryItem) => {
    setValue(item.query);
    setIsOpen(false);
    addSearch(item.query, item.description, item.lat, item.lng);
    onSelectPlace({
      description: item.query,
      lat: item.lat,
      lng: item.lng,
    });
  };

  // Keyboard Navigation Support (Arrow Up/Down, Enter, Esc)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown") setIsOpen(true);
      return;
    }

    const currentList = activeTab === "autocomplete" ? predictions : [...pinnedItems, ...recentItems];
    const maxIndex = currentList.length - 1;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex <= maxIndex) {
        if (activeTab === "autocomplete") {
          handleSelectPrediction(predictions[selectedIndex]);
        } else {
          const historyList = [...pinnedItems, ...recentItems];
          handleSelectHistoryItem(historyList[selectedIndex]);
        }
      } else if (value.trim()) {
        // Direct search submit
        setIsOpen(false);
        addSearch(value.trim());
        onSelectPlace({ description: value.trim() });
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  // Voice Search Integration (Web Speech API)
  const startVoiceSearch = () => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search is not supported in your browser. Please type your location.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setValue(transcript);
          inputRef.current?.focus();
        }
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      setIsListening(false);
    }
  };

  const getCategoryIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("hotel") || lower.includes("resort") || lower.includes("stay")) return Hotel;
    if (lower.includes("airport") || lower.includes("flight")) return Plane;
    if (lower.includes("station") || lower.includes("train") || lower.includes("railway")) return Train;
    if (lower.includes("cafe") || lower.includes("restaurant") || lower.includes("dining")) return Utensils;
    if (lower.includes("hospital") || lower.includes("clinic") || lower.includes("medical")) return Building2;
    return MapPin;
  };

  const popularCategories = [
    { label: "Hotels", query: "Hotels & Stays" },
    { label: "Restaurants", query: "Top Restaurants" },
    { label: "Attractions", query: "Tourist Attractions" },
    { label: "Airports", query: "Airports" },
    { label: "Hospitals", query: "Emergency Hospitals" },
  ];

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      
      {/* Search Input Bar */}
      <div className="flex items-center gap-2 glass-panel px-4 py-3 rounded-2xl border border-white/20 shadow-glow focus-within:border-indigo-500/60 bg-dark-bg/90 backdrop-blur-xl transition-all">
        <Search className="w-5 h-5 text-indigo-400 shrink-0" />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="bg-transparent text-xs sm:text-sm text-white focus:outline-none w-full placeholder:text-gray-400 font-medium"
        />

        {/* Loading Spinner */}
        {isLoading && (
          <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
        )}

        {/* Voice Search Button */}
        <button
          type="button"
          onClick={startVoiceSearch}
          className={`p-1.5 rounded-xl transition-all ${
            isListening
              ? "bg-rose-500 text-white animate-pulse"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
          title={isListening ? "Listening..." : "Voice Search"}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Clear Button */}
        {value && (
          <button
            type="button"
            onClick={() => {
              setValue("");
              setPredictions([]);
              setErrorMsg(null);
              inputRef.current?.focus();
            }}
            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Clear"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full inset-x-0 mt-2 z-50 rounded-2xl glass-panel border border-white/15 shadow-2xl bg-dark-bg/95 backdrop-blur-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header Switcher */}
          <div className="flex items-center justify-between p-2 border-b border-white/10 bg-white/[0.03]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab("autocomplete")}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  activeTab === "autocomplete"
                    ? "bg-indigo-600 text-white shadow-glow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Suggestions
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all ${
                  activeTab === "history"
                    ? "bg-indigo-600 text-white shadow-glow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <History className="w-3 h-3" />
                History ({history.length})
              </button>
            </div>

            {activeTab === "history" && history.length > 0 && (
              <button
                type="button"
                onClick={clearHistory}
                className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold px-2 py-0.5 rounded hover:bg-rose-500/10 transition-colors"
              >
                Clear History
              </button>
            )}
          </div>

          {/* Autocomplete Predictions List */}
          {activeTab === "autocomplete" && (
            <div>
              {errorMsg ? (
                <div className="p-6 text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-amber-400 mx-auto" />
                  <p className="text-xs text-gray-300 font-semibold">{errorMsg}</p>
                  <p className="text-[10px] text-gray-400">Type any city, landmark, hotel, or street name globally.</p>
                </div>
              ) : predictions.length > 0 ? (
                <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
                  {predictions.map((pred, index) => {
                    const IconComp = getCategoryIcon(pred.description);
                    const isSelected = selectedIndex === index;

                    return (
                      <button
                        key={pred.placeId}
                        type="button"
                        onClick={() => handleSelectPrediction(pred)}
                        className={`w-full p-3 text-left flex items-start gap-3 transition-colors text-xs group ${
                          isSelected ? "bg-indigo-600/30 text-white" : "hover:bg-white/10 text-gray-200"
                        }`}
                      >
                        <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                          <IconComp className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                            {pred.mainText}
                          </h5>
                          <p className="text-[10px] text-gray-400 truncate">{pred.secondaryText || pred.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Popular Quick Searches</div>
                  <div className="flex flex-wrap gap-2">
                    {popularCategories.map((cat, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setValue(cat.query);
                          inputRef.current?.focus();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-indigo-600/20 border border-white/10 text-xs text-indigo-300 hover:text-white font-medium transition-all"
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* History & Pinned Searches List */}
          {activeTab === "history" && (
            <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
              {pinnedItems.length > 0 && (
                <div className="p-2 bg-indigo-500/5">
                  <div className="px-2 py-1 text-[10px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1">
                    <Pin className="w-3 h-3 fill-indigo-400" /> Pinned Locations
                  </div>
                  {pinnedItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 text-xs transition-colors group"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectHistoryItem(item)}
                        className="flex items-center gap-2 flex-1 text-left min-w-0"
                      >
                        <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span className="font-semibold text-white truncate">{item.query}</span>
                      </button>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => togglePin(item.id)}
                          className="p-1 rounded text-indigo-400 hover:text-white"
                          title="Unpin"
                        >
                          <Pin className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSearch(item.id)}
                          className="p-1 rounded text-gray-400 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {recentItems.length > 0 ? (
                <div className="p-2">
                  <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Recent Searches</div>
                  {recentItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 text-xs transition-colors group"
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectHistoryItem(item)}
                        className="flex items-center gap-2 flex-1 text-left min-w-0"
                      >
                        <History className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="text-gray-200 group-hover:text-white truncate">{item.query}</span>
                      </button>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => togglePin(item.id)}
                          className="p-1 rounded text-gray-400 hover:text-indigo-400"
                          title="Pin location"
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSearch(item.id)}
                          className="p-1 rounded text-gray-400 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : pinnedItems.length === 0 ? (
                <div className="p-6 text-center text-xs text-gray-400">
                  No search history yet. Search for any location to save it here.
                </div>
              ) : null}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
