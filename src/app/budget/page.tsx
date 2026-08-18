"use client";

import React, { useState } from "react";
import {
  PieChart as PieIcon,
  TrendingUp,
  DollarSign,
  Lightbulb,
  BarChart2,
  Sparkles,
  Wallet,
  Car,
  Home,
  Utensils,
  Ticket,
  ShoppingBag,
  AlertTriangle,
  ChevronRight,
  TrendingDown,
  ArrowRight
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

export default function SmartBudgetPage() {
  const [totalBudget, setTotalBudget] = useState<number>(35000);
  const [travelers, setTravelers] = useState<number>(1);
  const [days, setDays] = useState<number>(5);
  const [tier, setTier] = useState<"Budget" | "Standard" | "Luxury">("Standard");

  // Cost prediction multipliers
  const multiplier = tier === "Budget" ? 0.65 : tier === "Luxury" ? 1.85 : 1.0;

  const transport = Math.round((totalBudget * 0.25) * multiplier);
  const stay = Math.round((totalBudget * 0.35) * multiplier);
  const food = Math.round((totalBudget * 0.20) * multiplier);
  const activities = Math.round((totalBudget * 0.12) * multiplier);
  const shopping = Math.round((totalBudget * 0.05) * multiplier);
  const emergency = Math.round((totalBudget * 0.03) * multiplier);

  const totalPredicted = transport + stay + food + activities + shopping + emergency;
  const remainingBudget = totalBudget - totalPredicted;
  const isOverBudget = remainingBudget < 0;

  const categoryData = [
    { name: "Accommodation", value: stay, color: "#6366f1", icon: Home },
    { name: "Transport & Flights", value: transport, color: "#a855f7", icon: Car },
    { name: "Food & Fine Dining", value: food, color: "#10b981", icon: Utensils },
    { name: "Sightseeing Tours", value: activities, color: "#f59e0b", icon: Ticket },
    { name: "Shopping", value: shopping, color: "#ec4899", icon: ShoppingBag },
    { name: "Emergency Buffer", value: emergency, color: "#f43f5e", icon: AlertTriangle },
  ];

  const comparisonData = [
    { category: "Transport", Budget: transport * 0.65, Standard: transport, Luxury: transport * 2.1 },
    { category: "Stay", Budget: stay * 0.5, Standard: stay, Luxury: stay * 2.4 },
    { category: "Food", Budget: food * 0.7, Standard: food, Luxury: food * 1.85 },
    { category: "Activities", Budget: activities * 0.8, Standard: activities, Luxury: activities * 1.6 },
  ];

  const aiSuggestions = [
    {
      id: 1,
      saving: "₹4,200",
      title: "Switch to Metro & Local Rail Pass",
      description: "Using standard public metro lines instead of point-to-point taxis in Tokyo reduces transit expenses by 65%.",
      impact: "High Saving"
    },
    {
      id: 2,
      saving: "₹2,800",
      title: "Pre-book Verified Guest Homestays",
      description: "Booking traditional local homestays instead of standard commercial hotels saves up to ₹2,800 over 5 days.",
      impact: "Medium Saving"
    },
    {
      id: 3,
      saving: "₹1,500",
      title: "Dine at Community Recommended Eateries",
      description: "Local street food courts and small family diners have higher safety reviews and cost 45% less than tourist traps.",
      impact: "Medium Saving"
    }
  ];

  return (
    <div className="space-y-12 pb-16">

      {/* 1. Header Banner */}
      <div className="space-y-3 text-center max-w-3xl mx-auto py-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-extrabold uppercase tracking-widest animate-float">
          <Wallet className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>AI Cost Predictor & Budget Engine</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">Smart Budget Predictor</h1>
        <p className="text-sm md:text-base text-gray-400 leading-relaxed max-w-xl mx-auto">
          Forecast travel costs before you pack. Compare luxury tiers, analyze visual expense distribution, and apply live budget hacks.
        </p>
      </div>

      {/* 2. Target vs Predicted Interactive Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {/* Set Budget */}
        <div className="p-6 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/50 text-left space-y-4">
          <div>
            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Set Trip Budget</span>
            <div className="text-3xl font-black text-white pt-1">{formatCurrency(totalBudget)}</div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-gray-400 font-semibold">Simulator Slider (INR)</label>
            <input
              type="range"
              min="5000"
              max="250000"
              step="5000"
              value={totalBudget}
              onChange={(e) => setTotalBudget(Number(e.target.value))}
              className="w-full h-1.5 rounded-full bg-white/10 appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Predicted Expense */}
        <div className="p-6 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/50 text-left space-y-4">
          <div>
            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">Predicted Total Expense</span>
            <div className="text-3xl font-black text-amber-400 pt-1">{formatCurrency(totalPredicted)}</div>
          </div>
          <div className="text-[11px] text-gray-400 flex items-center gap-1.5 pt-2">
            <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
            <span>Based on {days} days, {travelers} traveler(s) ({tier} style)</span>
          </div>
        </div>

        {/* Remaining / Over Budget (Popup notification colors) */}
        <div className={`p-6 rounded-3xl border text-left space-y-4 ${
          isOverBudget 
            ? "bg-rose-500/10 border-rose-500/25 shadow-glow-rose" 
            : "bg-emerald-500/10 border-emerald-500/25 shadow-glow-emerald"
        }`}>
          <div>
            <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider">
              {isOverBudget ? "Over Budget Warning" : "Remaining Buffer Balance"}
            </span>
            <div className={`text-3xl font-black pt-1 ${isOverBudget ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
              {formatCurrency(remainingBudget)}
            </div>
          </div>
          
          <div className="text-[11px] font-semibold flex items-center gap-1.5 pt-2">
            {isOverBudget ? (
              <>
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-300">Apply AI saving suggestions below!</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
                <span className="text-emerald-300">You are safe & within budget target!</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 3. Simulator Control Board */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/75 max-w-7xl mx-auto space-y-6">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4.5 h-4.5 text-indigo-400" />
          Interactive Parameters Simulator
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5 text-left">
            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Target Limit (INR)</label>
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(Number(e.target.value))}
              step={1000}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Days of Trip</label>
            <input
              type="number"
              min="1"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Travelers</label>
            <input
              type="number"
              min="1"
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input focus:outline-none"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Travel Comfort Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input focus:outline-none bg-[#090d16]"
            >
              <option value="Budget">Backpacker / Budget Style</option>
              <option value="Standard">Standard / Balanced Style</option>
              <option value="Luxury">Premium / Luxury Style</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Analytics Visual Charts (Pie & Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        
        {/* Pie Allocation Chart */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 bg-[#070b14]/50 space-y-6 flex flex-col justify-between text-left">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center justify-between">
              <span>Expense Allocation Index</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/25">Pie Chart</span>
            </h3>
            <p className="text-xs text-gray-400">Visual percentage distribution across major categories</p>
          </div>

          {/* Chart Frame */}
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0b0f19", borderColor: "rgba(255,255,255,0.08)", borderRadius: "12px", fontSize: "11px", color: "#f3f4f6" }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Predicted']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend Items Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-4">
            {categoryData.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="text-[10px] font-bold text-white truncate">{cat.name}</p>
                    <p className="text-[10px] text-gray-400">{formatCurrency(cat.value)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bar Comparison Chart */}
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 bg-[#070b14]/50 space-y-6 flex flex-col justify-between text-left">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white flex items-center justify-between">
              <span>Comfort Tier Comparison</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold border border-purple-500/25">Bar Chart</span>
            </h3>
            <p className="text-xs text-gray-400">Comparative category review across budget tiers</p>
          </div>

          {/* Chart Frame */}
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <XAxis dataKey="category" stroke="#9ca3af" fontSize={10} tickLine={false} />
                <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0b0f19", borderColor: "rgba(255,255,255,0.08)", borderRadius: "12px", fontSize: "11px", color: "#f3f4f6" }}
                />
                <Legend wrapperStyle={{ fontSize: "10px", paddingTop: "8px" }} />
                <Bar dataKey="Budget" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Standard" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Luxury" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Static Hint Info panel */}
          <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 flex items-start gap-2 text-xs leading-relaxed">
            <Lightbulb className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>YATRIK Budget Notice:</strong> Accommodations and Flights represent ~60% of total travel cost. Switch style to standard/budget to optimize automatically.
            </div>
          </div>
        </div>

      </div>

      {/* 5. DEDICATED AI BUDGET SUGGESTIONS / SCAM CHECKS */}
      <section className="max-w-7xl mx-auto space-y-6 text-left">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            AI Suggestions to Save Cost
          </h3>
          <p className="text-xs text-gray-400">Live optimized cost-saving insights generated by YATRIK community intelligence</p>
        </div>

        {/* Suggestions Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiSuggestions.map((sug) => (
            <div key={sug.id} className="p-5 rounded-2xl glass-panel border border-white/5 bg-[#090d16]/40 space-y-4 flex flex-col justify-between hover:border-indigo-500/20 transition-all">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-emerald-400">{sug.impact}</span>
                  <span className="text-gradient-amber">Save {sug.saving}</span>
                </div>
                <h4 className="text-sm font-extrabold text-white leading-snug">{sug.title}</h4>
                <p className="text-xs text-gray-300 leading-relaxed">{sug.description}</p>
              </div>
              
              <div className="pt-2 border-t border-white/5 flex justify-end">
                <button 
                  onClick={() => alert(`Applied "${sug.title}" saving hack!`)}
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Apply Saving Hack
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
