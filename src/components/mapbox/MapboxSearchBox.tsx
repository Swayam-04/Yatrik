"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  MapPin,
  X,
  Loader2,
  AlertTriangle,
  Building,
  Landmark,
  Compass,
  Navigation,
} from "lucide-react";

export interface SelectedLocation {
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  country: string;
  region: string;
  city: string;
  mapboxPlaceId: string;
  featureType?: string;
}

export interface MapboxSuggestionItem {
  mapbox_id: string;
  name: string;
  place_formatted?: string;
  full_address?: string;
  feature_type?: string;
  maki?: string;
  context?: {
    country?: { name?: string; country_code?: string };
    region?: { name?: string; region_code?: string };
    place?: { name?: string };
    locality?: { name?: string };
  };
}

interface MapboxSearchBoxProps {
  onLocationSelect: (location: SelectedLocation) => void;
  placeholder?: string;
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
}

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getFeatureIcon(type?: string) {
  switch (type) {
    case "poi":
    case "landmark":
      return <Landmark className="w-4 h-4 text-amber-400 shrink-0" />;
    case "place":
    case "city":
    case "locality":
      return <Building className="w-4 h-4 text-indigo-400 shrink-0" />;
    case "region":
    case "country":
      return <Compass className="w-4 h-4 text-pink-400 shrink-0" />;
    default:
      return <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />;
  }
}

export function MapboxSearchBox({
  onLocationSelect,
  placeholder = "Where do you want to go? (e.g. Puri, Bhubaneswar, Paris, Tokyo, Eiffel Tower)",
  defaultValue = "",
  className = "",
  autoFocus = false,
}: MapboxSearchBoxProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<MapboxSuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Session Token: Shared for all /suggest calls in a session and the following /retrieve call
  const [sessionToken, setSessionToken] = useState<string>(() => generateUUID());

  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const token =
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
    "";

  // Sync defaultValue if changed externally
  useEffect(() => {
    if (defaultValue) {
      setQuery(defaultValue);
    }
  }, [defaultValue]);

  // Debounced search query requesting Mapbox Search Box API v1 /suggest
  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed || trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setErrorMessage(null);
      return;
    }

    if (!token || token.includes("example")) {
      setErrorMessage("Location search is unavailable. Configure the Mapbox access token.");
      setIsOpen(true);
      setIsLoading(false);
      return;
    }

    // Cancel in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const url = `https://api.mapbox.com/search/searchbox/v1/suggest?q=${encodeURIComponent(
          trimmed
        )}&language=en&session_token=${sessionToken}&access_token=${token}`;

        if (process.env.NODE_ENV === "development") {
          console.log(`[Mapbox SearchBox] Requesting /suggest for: "${trimmed}"`);
        }

        const res = await fetch(url, { signal: controller.signal });

        if (process.env.NODE_ENV === "development") {
          console.log(`[Mapbox SearchBox] /suggest HTTP status: ${res.status}`);
        }

        if (!res.ok) {
          let errData: any = null;
          try {
            errData = await res.json();
          } catch {}

          if (process.env.NODE_ENV === "development") {
            console.error("[Mapbox SearchBox] /suggest error details:", res.status, errData);
          }

          if (res.status === 401) {
            setErrorMessage("Mapbox access token is invalid.");
          } else if (res.status === 403) {
            setErrorMessage(
              "Mapbox access is restricted. Check token restrictions and account settings."
            );
          } else if (res.status === 400) {
            setErrorMessage("Invalid location search request.");
          } else if (res.status === 429) {
            setErrorMessage("Location search limit reached. Please try again.");
          } else {
            setErrorMessage(
              errData?.message || `Location search error (${res.status}).`
            );
          }
          setSuggestions([]);
          setIsOpen(true);
          return;
        }

        const data = await res.json();
        const items: MapboxSuggestionItem[] = data.suggestions || [];
        setSuggestions(items);
        setIsOpen(true);
      } catch (err: any) {
        if (err.name === "AbortError") {
          // Stale request aborted, ignore
          return;
        }
        if (process.env.NODE_ENV === "development") {
          console.error("[Mapbox SearchBox] Network failure:", err);
        }
        setErrorMessage("Unable to connect to location search.");
        setSuggestions([]);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, sessionToken, token]);

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

  // Retrieve full place data when suggestion is clicked
  const handleSelect = async (item: MapboxSuggestionItem) => {
    setIsLoading(true);
    setIsOpen(false);
    setQuery(item.name);

    if (!token || token.includes("example")) {
      setErrorMessage("Location search is unavailable. Configure the Mapbox access token.");
      setIsLoading(false);
      return;
    }

    try {
      const retrieveUrl = `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(
        item.mapbox_id
      )}?session_token=${sessionToken}&access_token=${token}`;

      if (process.env.NODE_ENV === "development") {
        console.log(`[Mapbox SearchBox] Requesting /retrieve for mapbox_id: ${item.mapbox_id}`);
      }

      const res = await fetch(retrieveUrl);

      if (process.env.NODE_ENV === "development") {
        console.log(`[Mapbox SearchBox] /retrieve HTTP status: ${res.status}`);
      }

      if (!res.ok) {
        let errData: any = null;
        try {
          errData = await res.json();
        } catch {}
        if (process.env.NODE_ENV === "development") {
          console.error("[Mapbox SearchBox] /retrieve error details:", res.status, errData);
        }
        throw new Error(`Retrieve failed (${res.status})`);
      }

      const data = await res.json();
      const feature = data.features?.[0];

      if (!feature) {
        throw new Error("No feature found in retrieve response");
      }

      const coordinates = feature.geometry?.coordinates || [0, 0];
      const lng = coordinates[0];
      const lat = coordinates[1];

      const properties = feature.properties || {};
      const context = properties.context || {};

      const country = context.country?.name || "";
      const region = context.region?.name || "";
      const city =
        context.place?.name ||
        context.locality?.name ||
        item.name;

      const fullAddress =
        properties.full_address ||
        (properties.place_formatted
          ? `${properties.name}, ${properties.place_formatted}`
          : item.place_formatted
          ? `${item.name}, ${item.place_formatted}`
          : item.name);

      const selected: SelectedLocation = {
        name: properties.name || item.name,
        formattedAddress: fullAddress,
        latitude: lat,
        longitude: lng,
        country,
        region,
        city,
        mapboxPlaceId: item.mapbox_id,
        featureType: properties.feature_type || item.feature_type || "place",
      };

      onLocationSelect(selected);
    } catch (err: any) {
      console.error("[Mapbox SearchBox] Retrieval failed:", err);
      setErrorMessage("Failed to retrieve location coordinates. Please try again.");
      setIsOpen(true);
    } finally {
      setIsLoading(false);
      // Generate a new session token for subsequent search sessions
      setSessionToken(generateUUID());
    }
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

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Search Input Container */}
      <div className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none flex items-center">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-gray-400" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-11 pr-10 py-3.5 rounded-2xl glass-input border border-white/10 bg-[#090d16]/80 text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500/50 shadow-inner transition-all duration-200"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          role="combobox"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setIsOpen(false);
              setErrorMessage(null);
              inputRef.current?.focus();
            }}
            className="absolute right-3.5 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl glass-panel border border-white/10 bg-[#090d16]/95 backdrop-blur-2xl shadow-2xl overflow-hidden max-h-80 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Loading State */}
          {isLoading ? (
            <div className="p-4 text-center text-xs text-gray-400 flex items-center justify-center gap-2.5">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Searching locations...</span>
            </div>
          ) : errorMessage ? (
            /* Explicit Error State */
            <div className="p-4 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 m-2 rounded-xl flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          ) : suggestions.length === 0 ? (
            /* Zero Results State */
            <div className="p-5 text-center text-xs text-gray-400 space-y-1">
              <div className="font-bold text-gray-200">No matching locations found.</div>
              <p className="text-[11px] text-gray-500">
                Try another city, address, landmark, or destination.
              </p>
            </div>
          ) : (
            /* Results List */
            <div className="py-1 divide-y divide-white/5" role="listbox">
              <div className="px-3.5 py-1.5 text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center justify-between">
                <span>Mapbox Locations</span>
                <span className="text-indigo-400">Select to Plan</span>
              </div>

              {suggestions.map((item, index) => {
                const isHighlighted = index === highlightedIndex;

                return (
                  <button
                    key={item.mapbox_id || index}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full px-4 py-3 text-left flex items-start gap-3 transition-colors ${
                      isHighlighted
                        ? "bg-indigo-600/20 text-white border-l-2 border-indigo-500"
                        : "hover:bg-white/5 text-gray-300 border-l-2 border-transparent"
                    }`}
                    role="option"
                    aria-selected={isHighlighted}
                  >
                    <div className="mt-0.5">{getFeatureIcon(item.feature_type)}</div>

                    <div className="flex-1 overflow-hidden">
                      {/* PRIMARY: Place Name */}
                      <div className="text-sm font-bold text-white truncate flex items-center gap-2">
                        <span>{item.name}</span>
                        {item.feature_type && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-gray-300 font-semibold uppercase tracking-wider">
                            {item.feature_type}
                          </span>
                        )}
                      </div>

                      {/* SECONDARY: Formatted Location / Address */}
                      <div className="text-xs text-gray-400 truncate mt-0.5">
                        {item.place_formatted || item.full_address || "Worldwide Destination"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default MapboxSearchBox;
