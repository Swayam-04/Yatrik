"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Star, Clock, Compass, MapPin } from "lucide-react";

export interface MapMarkerItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  category?: string;
  rating?: number;
  address?: string;
  photoUrl?: string;
  openNow?: boolean;
  dayNumber?: number;
}

interface MapboxMapContainerProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  destinationName?: string;
  markers?: MapMarkerItem[];
  routeCoordinates?: Array<[number, number]>; // [lng, lat]
  onSelectMarker?: (marker: MapMarkerItem) => void;
  className?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  attractions: "#0E7490", // Ocean Blue
  restaurants: "#F59E0B", // Sunset Orange
  cafes: "#14B8A6",       // Travel Teal
  hotels: "#38BDF8",      // Sky Blue
  nature: "#10B981",      // Emerald
  "hidden-gems": "#FBBF24", // Warm Gold
  hospital: "#EF4444",    // Emergency Red
  police: "#0284C7",      // Police Blue
  destination: "#14B8A6", // Travel Teal
  itinerary: "#0E7490",   // Ocean Navy
};

export function MapboxMapContainer({
  center = { lat: 20.2961, lng: 85.8245 },
  zoom = 12,
  destinationName,
  markers = [],
  routeCoordinates = [],
  onSelectMarker,
  className = "h-[480px] w-full",
}: MapboxMapContainerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [activePlace, setActivePlace] = useState<MapMarkerItem | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Mapbox GL JS map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const token =
      process.env.NEXT_PUBLIC_MAPBOX_TOKEN ||
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
      process.env.MAPBOX_ACCESS_TOKEN ||
      "pk.eyJ1IjoieWF0cmlrLXRyYXZlbCIsImEiOiJjbTdiaXJuMnUwMXBwMnFzYnMydW81aDJvIn0.example";

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [center.lng, center.lat],
      zoom,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-right");

    map.on("load", () => {
      setMapLoaded(true);
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update center & zoom when center changes
  useEffect(() => {
    if (!mapRef.current || !center) return;
    mapRef.current.flyTo({
      center: [center.lng, center.lat],
      zoom,
      essential: true,
      duration: 1800,
    });
  }, [center.lat, center.lng, zoom]);

  // Update Markers from real API results with Travel-Tech circular cream + teal/sunset pins
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // 1. Destination Marker (if center provided)
    if (center && destinationName) {
      const el = document.createElement("div");
      el.className = "destination-pin flex items-center justify-center cursor-pointer";
      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="w-9 h-9 rounded-full bg-[#14B8A6]/20 border border-[#38BDF8] animate-ping absolute"></div>
          <div class="w-8 h-8 rounded-full bg-[#F5EBDD] border-2 border-[#14B8A6] shadow-xl flex items-center justify-center text-white text-xs font-bold">
            <div class="w-4 h-4 rounded-full bg-gradient-to-tr from-[#0E7490] to-[#14B8A6] flex items-center justify-center text-[10px]">
              📍
            </div>
          </div>
        </div>
      `;

      const destMarker = new mapboxgl.Marker(el)
        .setLngLat([center.lng, center.lat])
        .addTo(map);

      markersRef.current.push(destMarker);
    }

    // 2. Real Places Markers: Circular cream base with teal/ocean pin (or sunset orange for selected)
    markers.forEach((item) => {
      if (isNaN(item.latitude) || isNaN(item.longitude)) return;

      const isSelected = activePlace?.id === item.id;
      const el = document.createElement("div");
      el.className = "place-marker cursor-pointer transform hover:scale-125 transition-transform duration-200";

      if (item.dayNumber) {
        // Day Itinerary Marker
        el.innerHTML = `
          <div class="flex items-center justify-center w-7 h-7 rounded-full bg-[#F5EBDD] shadow-xl border-2 ${
            isSelected ? "border-[#F59E0B]" : "border-[#14B8A6]"
          }">
            <div class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold text-white ${
              isSelected ? "bg-[#F59E0B]" : "bg-[#0E7490]"
            }">
              ${item.dayNumber}
            </div>
          </div>
        `;
      } else {
        // Standard Travel Marker: circular white/cream base with teal/ocean pin
        el.innerHTML = `
          <div class="flex items-center justify-center w-6 h-6 rounded-full bg-[#F5EBDD] shadow-lg border-2 ${
            isSelected ? "border-[#F59E0B] shadow-[0_0_12px_rgba(245,158,11,0.5)]" : "border-white"
          }">
            <div class="w-3.5 h-3.5 rounded-full ${
              isSelected
                ? "bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24]"
                : "bg-gradient-to-tr from-[#0E7490] to-[#14B8A6]"
            }"></div>
          </div>
        `;
      }

      el.addEventListener("click", () => {
        setActivePlace(item);
        if (onSelectMarker) onSelectMarker(item);
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([item.longitude, item.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Fit bounds if multiple markers exist
    if (markers.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([center.lng, center.lat]);
      markers.forEach((m) => {
        if (!isNaN(m.latitude) && !isNaN(m.longitude)) {
          bounds.extend([m.longitude, m.latitude]);
        }
      });
      map.fitBounds(bounds, { padding: 60, maxZoom: 15 });
    }
  }, [markers, center.lat, center.lng, destinationName, mapLoaded, activePlace?.id]);

  // Update Route Polyline with Ocean Teal & Sky Blue styling
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const sourceId = "itinerary-route-source";
    const layerId = "itinerary-route-layer";

    if (map.getSource(sourceId)) {
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      map.removeSource(sourceId);
    }

    if (routeCoordinates && routeCoordinates.length >= 2) {
      map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: routeCoordinates,
          },
        },
      });

      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#14B8A6",
          "line-width": 4,
          "line-opacity": 0.85,
          "line-dasharray": [1.5, 2],
        },
      });
    }
  }, [routeCoordinates, mapLoaded]);

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-[#0E7490]/30 shadow-2xl ${className}`}>
      {/* Mapbox Canvas */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" />

      {/* Floating Travel Category Legend */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5 p-2 rounded-2xl bg-[#071A2B]/90 backdrop-blur-md border border-[#0E7490]/30 text-[10px] font-semibold text-slate-300">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#0E7490]/25 text-[#38BDF8]">
          <span className="w-2 h-2 rounded-full bg-[#38BDF8]"></span> Attractions
        </span>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#F59E0B]/20 text-[#FBBF24]">
          <span className="w-2 h-2 rounded-full bg-[#FBBF24]"></span> Food & Cafes
        </span>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#14B8A6]/20 text-[#14B8A6]">
          <span className="w-2 h-2 rounded-full bg-[#14B8A6]"></span> Route / Day
        </span>
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#F59E0B]/20 text-[#F59E0B]">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]"></span> Selected Pin
        </span>
      </div>

      {/* Active Selected Place Detail Bottom Sheet */}
      {activePlace && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-20 p-4 rounded-2xl bg-[#071A2B]/95 backdrop-blur-xl border border-[#0E7490]/35 shadow-2xl text-left animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#38BDF8]">
                {activePlace.category || "Destination"}
              </span>
              <h4 className="text-sm font-bold text-white leading-tight mt-0.5">{activePlace.name}</h4>
            </div>
            <button
              onClick={() => setActivePlace(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg text-xs"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{activePlace.address}</p>

          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-[#0E7490]/20 text-xs text-slate-300">
            {activePlace.rating && (
              <span className="flex items-center gap-1 font-bold text-[#FBBF24]">
                <Star className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" /> {activePlace.rating}
              </span>
            )}
            {activePlace.openNow !== undefined && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activePlace.openNow
                    ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/25"
                    : "bg-rose-500/15 text-rose-300 border border-rose-500/25"
                }`}
              >
                {activePlace.openNow ? "Open Now" : "Closed"}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
