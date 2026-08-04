import React from "react";
import Link from "next/link";
import { Check, Sparkles, Compass, ShieldCheck, Zap } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="space-y-16 py-8">
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Simple, Transparent Plans</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Choose Your Travel Plan
        </h1>
        <p className="text-gray-300 text-base leading-relaxed">
          Start for free and get access to core AI travel recommendations and Women's Safety tools.
        </p>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <div className="p-8 rounded-3xl glass-panel border border-white/10 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-gray-300">
              Explorer (Free)
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">₹0</span>
              <span className="text-xs text-gray-400">/ forever</span>
            </div>
            <p className="text-xs text-gray-400">Ideal for occasional solo travelers and weekend trip planning.</p>
            <ul className="space-y-3 pt-4 border-t border-white/10 text-xs text-gray-300">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> AI Itinerary Generation (5/mo)</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Women's Safety Mode & SOS Alert</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> Interactive Safe Map Navigation</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400" /> 250 YATRIK Welcome Coins</li>
            </ul>
          </div>
          <Link
            href="/sign-up"
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs text-center transition-all"
          >
            Get Started Free
          </Link>
        </div>

        {/* Pro Plan */}
        <div className="p-8 rounded-3xl glass-panel border border-indigo-500/40 space-y-6 flex flex-col justify-between bg-gradient-to-b from-indigo-950/40 via-dark-bg to-dark-bg relative shadow-glow">
          <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold">
            RECOMMENDED
          </div>
          <div className="space-y-4">
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
              Pro Nomad
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">₹499</span>
              <span className="text-xs text-gray-400">/ month</span>
            </div>
            <p className="text-xs text-gray-400">For frequent travelers, digital nomads, and group leaders.</p>
            <ul className="space-y-3 pt-4 border-t border-white/10 text-xs text-gray-300">
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Unlimited AI Trip Planning & Re-generation</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Unlimited AI Assistant Conversations</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Priority Emergency SOS & Live Tracking</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> 1,000 Monthly YATRIK Bonus Coins</li>
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-indigo-400" /> Offline PDF Downloads & Route Export</li>
            </ul>
          </div>
          <Link
            href="/sign-up"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs text-center shadow-glow transition-all"
          >
            Upgrade to Pro
          </Link>
        </div>
      </section>
    </div>
  );
}
