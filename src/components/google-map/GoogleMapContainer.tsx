"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  useJsApiLoader, 
  GoogleMap, 
  MarkerF, 
  PolylineF, 
  TrafficLayer, 
  InfoWindowF 
} from "@react-google-maps/api";
import { 
  Compass, 
  Crosshair, 
  Layers, 
  ShieldCheck, 
  MapPin, 
  Car, 
  Globe,
  Search,
  AlertTriangle
} from "lucide-react";

const darkMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#1d2c4d" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1a3646" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#8ec3b9" }] },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b687a" }],
  },
  {
    featureType: "administrative.province",
    elementType: "geometry.stroke",
    stylers: [{ color: "#4b687a" }],
  },
  {
    featureType: "landscape.natural",
    elementType: "geometry",
    stylers: [{ color: "#023e8a" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#283d70" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6f9ba5" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#304a7d" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#98a5be" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#2c4568" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2d40" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#b0d5ce" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0e1726" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#4e6d96" }],
  },
];

const containerStyle = {
  width: "100%",
  height: "100%",
  minHeight: "580px",
  borderRadius: "1.5rem",
};

export interface SafetyMarker {
  id: string;
  lat: number;
  lng: number;
  title: string;
  type: string;
  safetyScore?: number;
  address?: string;
}

interface GoogleMapContainerProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  activePlaceName?: string;
  isLocationGranted?: boolean;
  polylinePath?: { lat: number; lng: number }[];
  safetyMarkers?: SafetyMarker[];
  isWomensSafetyEnabled?: boolean;
  onLocateCurrentPosition?: () => void;
}

export function GoogleMapContainer({
  center,
  zoom = 13,
  activePlaceName,
  isLocationGranted = false,
  polylinePath = [],
  safetyMarkers = [],
  isWomensSafetyEnabled = true,
  onLocateCurrentPosition,
}: GoogleMapContainerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey.includes("EXAMPLE") ? "" : apiKey,
    libraries: ["places", "geometry"],
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [mapTypeId, setMapTypeId] = useState<"roadmap" | "satellite" | "hybrid" | "terrain">("roadmap");
  const [showTraffic, setShowTraffic] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<SafetyMarker | null>(null);

  const worldCenter = { lat: 20, lng: 0 };
  const effectiveCenter = center || (isLocationGranted ? { lat: 28.6139, lng: 77.2090 } : worldCenter);
  const effectiveZoom = center ? zoom : (isLocationGranted ? 13 : 2);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (map && center) {
      map.panTo(center);
      map.setZoom(zoom);
    }
  }, [map, center, zoom]);

  const getMarkerIcon = (type: string) => {
    const lower = type.toLowerCase();
    if (lower.includes("police")) return "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
    if (lower.includes("hospital") || lower.includes("medical")) return "https://maps.google.com/mapfiles/ms/icons/red-dot.png";
    if (lower.includes("women") || lower.includes("shelter")) return "https://maps.google.com/mapfiles/ms/icons/pink-dot.png";
    if (lower.includes("hotel") || lower.includes("stay")) return "https://maps.google.com/mapfiles/ms/icons/purple-dot.png";
    if (lower.includes("restaurant") || lower.includes("dining")) return "https://maps.google.com/mapfiles/ms/icons/orange-dot.png";
    return "https://maps.google.com/mapfiles/ms/icons/green-dot.png";
  };

  return (
    <div className="relative w-full h-full min-h-[580px] rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl bg-dark-bg">
      
      {/* World Map Overlay Notice if Location Denied and No Search Selected */}
      {!center && !isLocationGranted && (
        <div className="absolute top-16 inset-x-4 z-30 pointer-events-none">
          <div className="max-w-md mx-auto p-4 rounded-2xl glass-panel border border-indigo-500/40 bg-dark-bg/90 backdrop-blur-xl shadow-glow text-center space-y-2 pointer-events-auto animate-in fade-in duration-300">
            <div className="flex items-center justify-center gap-2 text-indigo-400 font-bold text-xs">
              <Globe className="w-4 h-4" />
              <span>Worldwide Spatial Map View</span>
            </div>
            <p className="text-xs font-semibold text-white">
              Search for a destination or enable location access.
            </p>
            <p className="text-[10px] text-gray-400">
              Type any city, landmark, restaurant, airport, or address globally into the search bar.
            </p>
          </div>
        </div>
      )}

      {/* Top Controls Overlay */}
      <div className="absolute top-4 inset-x-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        <div className="pointer-events-auto flex items-center gap-2">
          {activePlaceName ? (
            <div className="px-3.5 py-1.5 rounded-full glass-panel border border-indigo-500/40 text-xs font-bold text-indigo-300 flex items-center gap-2 shadow-glow">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{activePlaceName}</span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-full glass-panel border border-emerald-500/40 text-xs font-bold text-emerald-400 flex items-center gap-2 shadow-glow-emerald">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Google Maps Global Engine</span>
            </div>
          )}

          {isWomensSafetyEnabled && (
            <div className="hidden sm:flex px-3 py-1.5 rounded-full glass-panel border border-pink-500/40 text-xs font-bold text-pink-300 items-center gap-1">
              <span>🌸 Women Safety Layer Active</span>
            </div>
          )}
        </div>

        {/* Map Type & Layer Controls */}
        <div className="pointer-events-auto flex items-center gap-2 bg-dark-card/90 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 text-xs">
          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition-colors ${
              showTraffic ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "text-gray-400 hover:text-white"
            }`}
          >
            <Car className="w-3.5 h-3.5" /> Traffic
          </button>

          <select
            value={mapTypeId}
            onChange={(e) => setMapTypeId(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-xl px-2 py-1 text-white focus:outline-none text-xs font-medium cursor-pointer"
          >
            <option value="roadmap" className="bg-dark-bg text-white">Roadmap</option>
            <option value="satellite" className="bg-dark-bg text-white">Satellite</option>
            <option value="hybrid" className="bg-dark-bg text-white">Hybrid</option>
            <option value="terrain" className="bg-dark-bg text-white">Terrain</option>
          </select>
        </div>

      </div>

      {/* Main Google Maps SDK Canvas */}
      {isLoaded && !loadError ? (
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={effectiveCenter}
          zoom={effectiveZoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            styles: mapTypeId === "roadmap" ? darkMapStyle : undefined,
            mapTypeId: mapTypeId as any,
            disableDefaultUI: false,
            zoomControl: true,
            fullscreenControl: true,
            streetViewControl: true,
          }}
        >
          {showTraffic && <TrafficLayer />}

          {/* Active Center Marker */}
          {center && (
            <MarkerF
              position={center}
              title={activePlaceName || "Selected Location"}
              icon={{
                path: google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
                scale: 6,
                fillColor: "#6366f1",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              }}
            />
          )}

          {/* Polyline Path */}
          {polylinePath.length > 0 && (
            <PolylineF
              path={polylinePath}
              options={{
                strokeColor: "#10b981",
                strokeOpacity: 0.9,
                strokeWeight: 6,
              }}
            />
          )}

          {/* Nearby Safety & Category Markers */}
          {safetyMarkers.map((marker) => (
            <MarkerF
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              title={marker.title}
              icon={getMarkerIcon(marker.type)}
              onClick={() => setSelectedMarker(marker)}
            />
          ))}

          {/* Info Window */}
          {selectedMarker && (
            <InfoWindowF
              position={{ lat: selectedMarker.lat, lng: selectedMarker.lng }}
              onCloseClick={() => setSelectedMarker(null)}
            >
              <div className="p-2 text-dark-bg space-y-1">
                <h4 className="font-bold text-xs">{selectedMarker.title}</h4>
                {selectedMarker.address && <p className="text-[10px] text-gray-700">{selectedMarker.address}</p>}
                {selectedMarker.safetyScore !== undefined && (
                  <p className="text-[10px] font-bold text-emerald-700">Safety Rating: {selectedMarker.safetyScore}/100</p>
                )}
              </div>
            </InfoWindowF>
          )}
        </GoogleMap>
      ) : (
        /* Vector Fallback Canvas when Map SDK is initializing / without API key */
        <div className="relative w-full h-full min-h-[580px] flex flex-col justify-between p-6 bg-gradient-to-br from-indigo-950/40 via-dark-bg to-dark-bg">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <div className="w-full h-full bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:28px_28px]" />
          </div>

          <div className="relative z-10 my-auto text-center space-y-4 max-w-md mx-auto">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-glow">
              <Compass className="w-6 h-6 animate-pulse" />
            </div>
            <h3 className="text-lg font-extrabold text-white">Google Maps Interactive Canvas</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {activePlaceName ? (
                <span>Showing spatial markers and live route overview for <strong>{activePlaceName}</strong>.</span>
              ) : (
                <span>Search any location globally to view real-time maps, nearby places, and safety scores.</span>
              )}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-left">
              {safetyMarkers.slice(0, 6).map((m) => (
                <div key={m.id} className="p-2 rounded-xl bg-white/5 border border-white/10 text-[10px] space-y-0.5">
                  <span className="text-emerald-400 font-bold block truncate">📍 {m.title}</span>
                  <span className="text-gray-400 block text-[9px] truncate">{m.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* GPS Locate Me Floating Button */}
      {onLocateCurrentPosition && (
        <button
          type="button"
          onClick={onLocateCurrentPosition}
          className="absolute bottom-6 right-6 z-20 p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-glow hover:scale-105 active:scale-95 transition-all"
          title="Locate Current Position"
        >
          <Crosshair className="w-5 h-5" />
        </button>
      )}

    </div>
  );
}
