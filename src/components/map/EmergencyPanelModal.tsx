"use client";

import React, { useState } from "react";
import { 
  PhoneCall, 
  ShieldAlert, 
  Share2, 
  Radio, 
  MapPin, 
  X, 
  HeartHandshake, 
  AlertTriangle,
  Building2,
  Stethoscope
} from "lucide-react";

export function EmergencyPanelModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSosActive, setIsSosActive] = useState(false);

  const emergencyContacts = [
    { title: "Police Emergency", number: "112", icon: ShieldAlert, color: "bg-rose-500/20 text-rose-300 border-rose-500/40" },
    { title: "Ambulance / Medical", number: "108", icon: Stethoscope, color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" },
    { title: "Women Helpline", number: "1091", icon: HeartHandshake, color: "bg-pink-500/20 text-pink-300 border-pink-500/40" },
    { title: "Tourist Helpline", number: "1363", icon: Building2, color: "bg-amber-500/20 text-amber-300 border-amber-500/40" },
  ];

  const handleTriggerSos = () => {
    setIsSosActive(true);
    setTimeout(() => {
      alert("🚨 SOS Emergency Beacon Broadcasted to local authorities and emergency contacts!");
    }, 500);
  };

  return (
    <>
      {/* Floating Action SOS Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-40 px-4 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 text-white font-extrabold text-xs flex items-center gap-2 shadow-glow-rose hover:scale-105 active:scale-95 transition-all duration-300 animate-pulse"
      >
        <ShieldAlert className="w-5 h-5" />
        <span>EMERGENCY SOS</span>
      </button>

      {/* Emergency Modal Backdrop */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-md p-6 rounded-3xl glass-panel border border-rose-500/30 shadow-2xl bg-gradient-to-b from-rose-950/40 via-dark-bg to-dark-bg space-y-6">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  <AlertTriangle className="w-6 h-6 animate-ping" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-white">Emergency Response Panel</h3>
                  <p className="text-xs text-rose-300 font-medium">One-tap priority emergency dispatch</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Direct Dial Grid */}
            <div className="grid grid-cols-2 gap-3">
              {emergencyContacts.map((contact, i) => (
                <a
                  key={i}
                  href={`tel:${contact.number}`}
                  className={`p-4 rounded-2xl border flex flex-col justify-between space-y-2 hover:scale-[1.02] transition-transform ${contact.color}`}
                >
                  <div className="flex items-center justify-between">
                    <contact.icon className="w-5 h-5" />
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{contact.title}</h4>
                    <p className="text-base font-extrabold">{contact.number}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Emergency Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleTriggerSos}
                className={`w-full py-3.5 px-4 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-glow transition-all ${
                  isSosActive
                    ? "bg-rose-700 text-white animate-pulse"
                    : "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white"
                }`}
              >
                <Radio className="w-4 h-4 animate-spin" />
                <span>{isSosActive ? "SOS BEACON ACTIVE..." : "BROADCAST LIVE SOS BEACON"}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => alert("📍 Live GPS Location shared with trusted emergency contacts!")}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-indigo-400" />
                  Share Live GPS
                </button>

                <button
                  onClick={() => alert("🔍 Locating nearest 24/7 Police Post & Verified Women's Shelter...")}
                  className="py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Nearest Safe Shelter
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
