import React from "react";
import Link from "next/link";
import { Compass, ShieldCheck, Sparkles, Heart, Globe, Users, Award, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-16 py-8">
      {/* Header */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Compass className="w-4 h-4 text-indigo-400" />
          <span>About YATRIK AI</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Empowering Every Traveler with Smart AI & Safe Journeys
        </h1>
        <p className="text-gray-300 text-base leading-relaxed">
          YATRIK is your all-in-one AI travel recommendation & itinerary ecosystem. Designed for modern global explorers, solo travelers, and community members, YATRIK merges real-time artificial intelligence with verified safety features and community wisdom.
        </p>
      </section>

      {/* Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl glass-panel border border-white/10 space-y-4 bg-gradient-to-b from-indigo-950/30 to-transparent">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">AI-Powered Intelligence</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            Hyper-personalized multi-day itineraries, smart budget calculations, real-time weather, and local hidden gem suggestions generated in seconds.
          </p>
        </div>

        <div className="p-8 rounded-3xl glass-panel border border-white/10 space-y-4 bg-gradient-to-b from-emerald-950/30 to-transparent">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Women's Safety First</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            Safety scores for destinations, illuminated safe routes, instant emergency SOS alerts, and live location sharing built directly into your travel companion.
          </p>
        </div>

        <div className="p-8 rounded-3xl glass-panel border border-white/10 space-y-4 bg-gradient-to-b from-amber-950/30 to-transparent">
          <div className="w-12 h-12 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Community & Rewards</h3>
          <p className="text-gray-400 text-xs leading-relaxed">
            Earn YATRIK Coins for writing reviews, sharing scam warnings, and exploring destinations. Unlock travel perks and level up your traveler rank.
          </p>
        </div>
      </section>

      {/* Mission Banner */}
      <section className="rounded-3xl glass-panel border border-white/10 p-8 sm:p-12 text-center space-y-6 bg-hero-gradient">
        <h2 className="text-3xl font-extrabold text-white">Ready to start your next adventure?</h2>
        <p className="text-gray-300 text-sm max-w-xl mx-auto">
          Sign up today and unlock complete access to AI planning, safe maps, community insights, and rewards.
        </p>
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm shadow-glow transition-all"
        >
          <span>Get Started Free</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
