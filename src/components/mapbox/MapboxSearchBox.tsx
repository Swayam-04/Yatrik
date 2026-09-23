"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, Loader2, Compass } from "lucide-react";
import { LocationSearchResult } from "@/services/location.service";

export interface SelectedLocation {
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  country: string;
  region: string;
  city: string;
  mapboxPlaceId: string;
}

interface MapboxSearchBoxProps {
  onLocationSelect: (location: SelectedLocation) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
}

export function MapboxSearchBox({
  onLocationSelect,
  placeholder = "Where do you want to go? (e.g. Paris, Bhubaneswar, Eiffel Tower)",
  defaultValue = "",
  className = "",
  autoFocus = false,
}: MapboxSearchBoxProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update query if defaultValue changes
  useEffect(() => {
    if (defaultValue) {
      setQuery(defaultValue);
    }
  }, [defaultValue]);

  // Debounced search query
  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.results || []);
          setIsOpen(Boolean(data.results && data.results.length > 0));
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Failed to query location search:", err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: LocationSearchResult) => {
    setQuery(item.formattedAddress);
    setIsOpen(false);
    setHighlightedIndex(-1);

    onLocationSelect({
      name: item.name,
      formattedAddress: item.formattedAddress,
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country,
      region: item.region,
      city: item.city,
      mapboxPlaceId: item.mapboxPlaceId,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const clearInput = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      <div className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-indigo-400">
          <Search className="w-5 h-5" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-12 pr-12 py-3.5 bg-dark-card/90 hover:bg-dark-card border border-white/10 focus:border-indigo-500/50 rounded-2xl text-white text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-lg transition-all"
        />

        <div className="absolute right-3.5 flex items-center gap-1.5">
          {isLoading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
          {query && !isLoading && (
            <button
              type="button"
              onClick={clearInput}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#090d16]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden divide-y divide-white/5 animate-in fade-in-0 zoom-in-95 duration-200">
          <div className="px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-wider text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Compass className="w-3 h-3 text-indigo-400" /> Global Locations (Mapbox)
            </span>
            <span className="text-gray-500">Worldwide Live</span>
          </div>

          <ul className="max-h-72 overflow-y-auto py-1">
            {suggestions.map((item, index) => {
              const isSelected = highlightedIndex === index;
              return (
                <li key={item.id || index}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                      isSelected ? "bg-indigo-600/20 text-white" : "hover:bg-white/5 text-gray-200"
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-white truncate flex items-center gap-2">
                        {item.name}
                        {item.country && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400 font-normal">
                            {item.country}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 truncate mt-0.5">
                        {item.formattedAddress}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
