"use client";

import React from "react";
import { HeartHandshake, ShieldCheck, Moon, Users, Check } from "lucide-react";

interface WomensSafetyToggleProps {
  isEnabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function WomensSafetyToggle({ isEnabled, onToggle }: WomensSafetyToggleProps) {
  return (
    <div
      onClick={() => onToggle(!isEnabled)}
      className={`p-4 rounded-3xl glass-panel border transition-all cursor-pointer space-y-3 ${
        isEnabled
          ? "border-pink-500/50 bg-gradient-to-r from-pink-950/40 via-dark-bg to-dark-bg shadow-glow-pink"
          : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`p-2.5 rounded-2xl border transition-colors ${
              isEnabled
                ? "bg-pink-500/20 text-pink-400 border-pink-500/40"
                : "bg-white/5 text-gray-400 border-white/10"
            }`}
          >
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
              Women's Safety Mode
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${
                  isEnabled
                    ? "bg-pink-500/20 text-pink-300 border-pink-500/40"
                    : "bg-white/5 text-gray-400 border-white/10"
                }`}
              >
                {isEnabled ? "ACTIVE" : "OFF"}
              </span>
            </h4>
            <p className="text-[10px] text-gray-400">
              Filters for well-lit corridors, active CCTV & female-verified stays
            </p>
          </div>
        </div>

        {/* Custom Toggle Switch */}
        <div
          className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center ${
            isEnabled ? "bg-pink-600 justify-end" : "bg-white/10 justify-start"
          }`}
        >
          <div className="w-4 h-4 rounded-full bg-white shadow-md flex items-center justify-center">
            {isEnabled && <Check className="w-3 h-3 text-pink-600 font-bold" />}
          </div>
        </div>
      </div>

      {isEnabled && (
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-pink-500/20 text-[10px] text-pink-200">
          <div className="flex items-center gap-1.5">
            <Moon className="w-3 h-3 text-amber-400" />
            <span>Lighting Score &gt; 8.5/10</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Avoid Unlit Alleys</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 text-indigo-400" />
            <span>High Crowd Density</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HeartHandshake className="w-3 h-3 text-pink-400" />
            <span>Verified Stays</span>
          </div>
        </div>
      )}
    </div>
  );
}
