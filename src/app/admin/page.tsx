"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { 
  ShieldAlert, 
  Users, 
  CheckCircle, 
  XCircle, 
  BarChart2, 
  Sparkles, 
  Building2, 
  AlertTriangle,
  Coins
} from "lucide-react";

export default function AdminPanelPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"reports" | "users" | "reviews">("reports");
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push("/sign-in?redirect_url=/admin");
        return;
      }

      const email = user.primaryEmailAddress?.emailAddress || "";
      const role = user.publicMetadata?.role;
      const isAdmin = email.toLowerCase().includes("admin") || role === "admin" || role === "ADMIN";

      if (!isAdmin) {
        setIsAuthorized(false);
        router.push("/unauthorized");
      } else {
        setIsAuthorized(true);
      }
    }
  }, [user, isLoaded, router]);

  if (!isLoaded || isAuthorized === null) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex items-center gap-3 text-indigo-400 text-sm font-semibold animate-pulse">
          <ShieldAlert className="w-6 h-6 animate-spin" />
          <span>Verifying Admin Permissions...</span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const safetyReports = [
    { id: "rep-1", user: "Priya V.", area: "Anjuna Beach Path", issue: "Low lighting reported after 10 PM", score: 72, status: "PENDING" },
    { id: "rep-2", user: "Rahul S.", area: "Solang Valley Taxi Counter", issue: "Unregistered overcharging taxis", score: 65, status: "VERIFIED" },
  ];

  return (
    <div className="space-y-8 pb-16">
      
      {/* Admin Header */}
      <div className="flex items-center justify-between p-6 rounded-3xl glass-panel border border-white/10 bg-dark-glass">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <span>Platform Governance & Content Moderation</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">YATRIK Admin Panel</h1>
        </div>

        <div className="flex gap-2">
          {(["reports", "users", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-glow"
                  : "bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Admin Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-1">
          <p className="text-xs text-gray-400">Total Users</p>
          <p className="text-2xl font-bold text-white">14,280</p>
        </div>
        <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-1">
          <p className="text-xs text-gray-400">Pending Safety Reports</p>
          <p className="text-2xl font-bold text-rose-400">12 Pending</p>
        </div>
        <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-1">
          <p className="text-xs text-gray-400">Verified Gems</p>
          <p className="text-2xl font-bold text-emerald-400">1,450 Verified</p>
        </div>
        <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-1">
          <p className="text-xs text-gray-400">Coins Distributed</p>
          <p className="text-2xl font-bold text-amber-400">850,000 Coins</p>
        </div>
      </div>

      {/* Reports Table */}
      <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-white">Community Safety & Scam Reports Queue</h3>

        <div className="space-y-3">
          {safetyReports.map((rep) => (
            <div key={rep.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-white">{rep.area}</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/30">
                    Reported by {rep.user}
                  </span>
                </div>
                <p className="text-xs text-gray-300">{rep.issue}</p>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => alert("Report verified and published to safety map!")}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
                >
                  <CheckCircle className="w-3.5 h-3.5" /> Verify & Publish
                </button>
                <button 
                  onClick={() => alert("Report dismissed.")}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 text-xs font-semibold flex items-center gap-1"
                >
                  <XCircle className="w-3.5 h-3.5" /> Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
