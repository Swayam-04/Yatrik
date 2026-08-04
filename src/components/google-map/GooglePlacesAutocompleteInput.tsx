"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, Building2, Hotel, Plane, Train, Utensils, X, RefreshCw } from "lucide-react";

interface Prediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface GooglePlacesAutocompleteInputProps {
  onSelectPlace: (placeDescription: string) => void;
  initialValue?: string;
}

export function GooglePlacesAutocompleteInput({
  onSelectPlace,
  initialValue = "Panaji, Goa, India",
}: GooglePlacesAutocompleteInputProps) {
  const [value, setValue] = useState(initialValue);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value.trim() || value.length < 2) {
      setPredictions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/external/places/autocomplete?input=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.predictions) {
            setPredictions(data.predictions);
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.error("Autocomplete fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [value]);

  const handleSelect = (pred: Prediction) => {
    setValue(pred.description);
    onSelectPlace(pred.description);
    setIsOpen(false);
  };

  const getIcon = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes("hotel") || lower.includes("resort") || lower.includes("stay")) return Hotel;
    if (lower.includes("airport") || lower.includes("flight")) return Plane;
    if (lower.includes("station") || lower.includes("train") || lower.includes("railway")) return Train;
    if (lower.includes("cafe") || lower.includes("restaurant") || lower.includes("dining")) return Utensils;
    return MapPin;
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex items-center gap-2 glass-input px-4 py-2.5 rounded-2xl border border-white/10 focus-within:border-indigo-500/50">
        <Search className="w-4 h-4 text-indigo-400 shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => predictions.length > 0 && setIsOpen(true)}
          placeholder="Search hotel, restaurant, airport, landmark, city..."
          className="bg-transparent text-xs text-white focus:outline-none w-full placeholder:text-gray-500"
        />
        {isLoading ? (
          <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />
        ) : value ? (
          <button
            onClick={() => {
              setValue("");
              setPredictions([]);
              setIsOpen(false);
            }}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute top-full inset-x-0 mt-2 z-50 rounded-2xl glass-panel border border-white/10 shadow-2xl bg-dark-bg/95 backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-white/5 text-[10px] font-bold text-indigo-400 uppercase tracking-wider px-3">
            Google Places Instant Suggestions
          </div>
          <div className="max-h-60 overflow-y-auto divide-y divide-white/5">
            {predictions.map((pred) => {
              const IconComp = getIcon(pred.description);
              return (
                <button
                  key={pred.placeId}
                  onClick={() => handleSelect(pred)}
                  className="w-full p-3 text-left hover:bg-white/10 flex items-start gap-3 transition-colors text-xs group"
                >
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:scale-105 transition-transform shrink-0 mt-0.5">
                    <IconComp className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {pred.mainText}
                    </h5>
                    <p className="text-[10px] text-gray-400 line-clamp-1">{pred.secondaryText || pred.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
