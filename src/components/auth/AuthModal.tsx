"use client";

import React from "react";
import { useClerk } from "@clerk/nextjs";
import { Lock, LogIn, UserPlus, X, Sparkles } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { openSignIn, openSignUp } = useClerk();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    if (openSignIn) {
      openSignIn();
    } else {
      window.location.href = "/sign-in";
    }
  };

  const handleCreateAccount = () => {
    onClose();
    if (openSignUp) {
      openSignUp();
    } else {
      window.location.href = "/sign-up";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md rounded-3xl glass-panel border border-white/15 p-6 sm:p-8 bg-hero-gradient shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Icon Header */}
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 p-0.5 shadow-glow">
          <div className="w-full h-full bg-dark-bg rounded-[14px] flex items-center justify-center">
            <Lock className="w-8 h-8 text-indigo-400" />
          </div>
        </div>

        {/* Modal Text Content */}
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-white flex items-center justify-center gap-2">
            <span>Login Required</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed">
            Please sign in to access YATRIK's AI-powered travel features.
          </p>
        </div>

        {/* Feature Badges */}
        <div className="grid grid-cols-2 gap-2 pt-2 text-left">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-gray-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            AI Itineraries
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-gray-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Safe Routes & SOS
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-gray-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            Smart Budget
          </div>
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-gray-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-400" />
            Rewards & Coins
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleLogin}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold shadow-glow transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </button>

          <button
            onClick={handleCreateAccount}
            className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4 text-indigo-400" />
            <span>Create Account</span>
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 px-4 rounded-xl text-xs text-gray-400 hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
