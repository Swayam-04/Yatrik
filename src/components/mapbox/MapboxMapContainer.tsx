"use client";

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Layers, Navigation, ZoomIn, ZoomOut, Maximize2, Star, Clock, Globe } from "lucide-react";
import { RealPlace } from "@/services/places.service";

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
  attractions: "#6366f1", // Indigo
  restaurants: "#f59e0b", // Amber
  cafes: "#10b981", // Emerald
  hotels: "#ec4899", // Pink
  hospital: "#ef4444", // Red
  police: "#3b82f6", // Blue
  destination: "#06b6d4", // Cyan
  itinerary: "#8b5cf6", // Purple
};

export function MapboxMapContainer({
  center = { lat: 20.2961, lng: 85.8245 }, // Default coordinates if unselected
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

  // Update Markers from real API results
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
          <div class="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 animate-ping absolute"></div>
          <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
            📍
          </div>
        </div>
      `;

      const destMarker = new mapboxgl.Marker(el)
        .setLngLat([center.lng, center.lat])
        .addTo(map);

      markersRef.current.push(destMarker);
    }

    // 2. Real Places Markers
    markers.forEach((item) => {
      if (isNaN(item.latitude) || isNaN(item.longitude)) return;

      const category = (item.category || "attractions").toLowerCase();
      const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.itinerary;

      const el = document.createElement("div");
      el.className = "place-marker cursor-pointer transform hover:scale-125 transition-transform duration-200";

      if (item.dayNumber) {
        el.innerHTML = `
          <div class="flex items-center justify-center w-7 h-7 rounded-full shadow-lg border-2 border-white text-white font-extrabold text-xs" style="background-color: ${color};">
            ${item.dayNumber}
          </div>
        `;
      } else {
        el.innerHTML = `
          <div class="w-4 h-4 rounded-full shadow-md border-2 border-white" style="background-color: ${color};"></div>
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
  }, [markers, center.lat, center.lng, destinationName, mapLoaded]);

  // Update Route Polyline if coordinates are supplied
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
          "line-color": "#8b5cf6",
          "line-width": 4,
          "line-dasharray": [1, 2],
        },
      });
    }
  }, [routeCoordinates, mapLoaded]);

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl ${className}`}>
      {/* Mapbox Canvas */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" />

      {/* Floating Category Legend */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-1.5 p-2 rounded-2xl bg-[#090d16]/85 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-gray-300">
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300">
          <span className="w-2 h-2 rounded-full bg-indigo-400"></span> Attractions
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-300">
          <span className="w-2 h-2 rounded-full bg-amber-400"></span> Food & Cafes
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-pink-500/10 text-pink-300">
          <span className="w-2 h-2 rounded-full bg-pink-400"></span> Stays
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Destination
        </span>
      </div>

      {/* Active Selected Place Detail Bottom Sheet */}
      {activePlace && (
        <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-20 p-4 rounded-2xl bg-[#090d16]/95 backdrop-blur-xl border border-white/10 shadow-2xl text-left animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-indigo-400">
                {activePlace.category || "Place"}
              </span>
              <h4 className="text-sm font-bold text-white leading-tight mt-0.5">{activePlace.name}</h4>
            </div>
            <button
              onClick={() => setActivePlace(null)}
              className="text-gray-400 hover:text-white p-1 rounded-lg text-xs"
            >
              ✕
            </button>
          </div>

          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{activePlace.address}</p>

          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-white/5 text-xs text-gray-300">
            {activePlace.rating && (
              <span className="flex items-center gap-1 font-bold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-current" /> {activePlace.rating}
              </span>
            )}
            {activePlace.openNow !== undefined && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  activePlace.openNow
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
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
