"use client";

import React, { useState } from "react";
import {
  PieChart as PieIcon,
  TrendingUp,
  DollarSign,
  ShieldAlert,
  Lightbulb,
  BarChart2,
  Sparkles,
  Wallet,
  Car,
  Home,
  Utensils,
  Ticket,
  ShoppingBag,
  AlertTriangle
} from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

export default function SmartBudgetPage() {
  const [totalBudget, setTotalBudget] = useState<number>(35000);
  const [travelers, setTravelers] = useState<number>(1);
  const [days, setDays] = useState<number>(5);
  const [tier, setTier] = useState<"Budget" | "Standard" | "Luxury">("Standard");

  // Dynamic cost prediction multiplier
  const multiplier = tier === "Budget" ? 0.7 : tier === "Luxury" ? 1.8 : 1.0;

  const transport = Math.round((totalBudget * 0.25) * multiplier);
  const stay = Math.round((totalBudget * 0.35) * multiplier);
  const food = Math.round((totalBudget * 0.20) * multiplier);
  const activities = Math.round((totalBudget * 0.12) * multiplier);
  const shopping = Math.round((totalBudget * 0.05) * multiplier);
  const emergency = Math.round((totalBudget * 0.03) * multiplier);

  const totalPredicted = transport + stay + food + activities + shopping + emergency;

  const categoryData = [
    { name: "Accommodation", value: stay, color: "#6366f1", icon: Home },
    { name: "Transport & Flight", value: transport, color: "#a855f7", icon: Car },
    { name: "Food & Dining", value: food, color: "#10b981", icon: Utensils },
    { name: "Activities & Sightseeing", value: activities, color: "#f59e0b", icon: Ticket },
    { name: "Shopping & Souvenirs", value: shopping, color: "#ec4899", icon: ShoppingBag },
    { name: "Emergency Buffer", value: emergency, color: "#f43f5e", icon: AlertTriangle },
  ];

  const comparisonData = [
    { category: "Transport", Budget: transport * 0.6, Standard: transport, Luxury: transport * 2.2 },
    { category: "Stay", Budget: stay * 0.5, Standard: stay, Luxury: stay * 2.5 },
    { category: "Food", Budget: food * 0.7, Standard: food, Luxury: food * 1.8 },
    { category: "Activities", Budget: activities * 0.8, Standard: activities, Luxury: activities * 1.6 },
  ];

  return (
    <div className="space-y-8 pb-16">

      {/* Top Header */}
      <div className="space-y-2 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
          <Wallet className="w-3.5 h-3.5" />
          <span>AI Cost Predictor & Expense Engine</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white">Smart Budget Predictor</h1>
        <p className="text-sm text-gray-400">
          Predict exact costs before you travel. Compare budget tiers, analyze visual expense distribution, and avoid hidden tourist scams.
        </p>
      </div>

      {/* Input Simulator Panel */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 space-y-6 bg-gradient-to-b from-dark-glass to-dark-bg">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <PieIcon className="w-5 h-5 text-indigo-400" />
          Budget Simulator Parameters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Target Budget (₹)</label>
            <input
              type="number"
              value={totalBudget}
              onChange={(e) => setTotalBudget(Number(e.target.value))}
              step={1000}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Travel Days</label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Number of Travelers</label>
            <input
              type="number"
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-300">Travel Style Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl text-xs glass-input focus:outline-none bg-dark-bg"
            >
              <option value="Budget">Backpacker / Budget</option>
              <option value="Standard">Balanced / Standard</option>
              <option value="Luxury">Premium / Luxury</option>
            </select>
          </div>

        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Recharts Pie Chart Card */}
        <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center justify-between">
              <span>Category Wise Breakdown</span>
              <span className="text-sm font-semibold text-amber-400">{formatCurrency(totalPredicted)}</span>
            </h3>
            <p className="text-xs text-gray-400">Visual percentage allocation across major travel categories</p>
          </div>

          {/* Pie Chart Renderer */}
          <div className="h-64 w-full">
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
                  contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", borderRadius: "12px", fontSize: "12px" }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, 'Predicted']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category List Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {categoryData.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <div key={idx} className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <div className="space-y-0.5 overflow-hidden">
                    <p className="text-[11px] font-semibold text-white truncate">{cat.name}</p>
                    <p className="text-[10px] text-gray-400">{formatCurrency(cat.value)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recharts Bar Chart Tier Comparison Card */}
        <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center justify-between">
              <span>Budget vs Standard vs Luxury</span>
              <BarChart2 className="w-5 h-5 text-indigo-400" />
            </h3>
            <p className="text-xs text-gray-400">Comparative breakdown across different travel comfort tiers</p>
          </div>

          {/* Bar Chart Renderer */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <XAxis dataKey="category" stroke="#9ca3af" fontSize={11} />
                <YAxis stroke="#9ca3af" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", borderColor: "#374151", borderRadius: "12px", fontSize: "12px" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                <Bar dataKey="Budget" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Standard" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Luxury" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>YATRIK Budget Hack:</span>
            </div>
            <p className="text-[11px] text-gray-300 leading-relaxed">
              Booking local scooty/metro pass saves 65% on transportation. Pre-booking verified homestays saves ~₹4,500 over luxury hotels.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
