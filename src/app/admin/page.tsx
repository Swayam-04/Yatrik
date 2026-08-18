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
  Coins,
  Shield,
  FileText,
  Activity,
  UserCheck
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
      <div className="min-h-[60vh] flex items-center justify-center max-w-7xl mx-auto">
        <div className="flex items-center gap-3 text-indigo-400 text-sm font-bold animate-pulse">
          <ShieldAlert className="w-5 h-5 animate-spin" />
          <span>Verifying Admin Permissions...</span>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  const safetyReports = [
    { id: "rep-1", user: "Priya V.", area: "Anjuna Beach Path", issue: "Low lighting reported after 10 PM on main walking trail", score: 72, status: "PENDING" },
    { id: "rep-2", user: "Rahul S.", area: "Solang Valley Prepay Counter", issue: "Unregistered drivers overcharging tourists by 3x rates", score: 65, status: "VERIFIED" },
  ];

  const adminUsers = [
    { id: "usr-1", name: "Priya Vasi", email: "priya@gmail.com", role: "Contributor", level: 5, status: "ACTIVE" },
    { id: "usr-2", name: "Rahul Sharma", email: "rahul@gmail.com", role: "Explorer", level: 3, status: "ACTIVE" },
    { id: "usr-3", name: "Admin Manager", email: "admin@yatrik.ai", role: "ADMIN", level: 10, status: "ACTIVE" }
  ];

  return (
    <div className="space-y-12 pb-16 max-w-7xl mx-auto text-left">
      
      {/* 1. Admin Header control banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-[2rem] glass-panel border border-white/5 bg-[#090d16]/75">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-[10px] font-extrabold uppercase tracking-wide shadow-glow">
            <ShieldAlert className="w-4 h-4 text-indigo-400" />
            <span>Platform Governance Center</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-none">Admin Panel</h1>
          <p className="text-xs text-gray-400">Moderation center, safety report reviews, and user permission overrides.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold">
          {(["reports", "users", "reviews"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-glow border border-indigo-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Admin Stats grid overlay */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
          <span className="text-[10px] text-gray-500 uppercase font-semibold">Total Users</span>
          <p className="text-2xl font-black text-white pt-1">14,280</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
          <span className="text-[10px] text-gray-500 uppercase font-semibold">Pending Safety Alerts</span>
          <p className="text-2xl font-black text-rose-400 pt-1">12 Queue</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
          <span className="text-[10px] text-gray-500 uppercase font-semibold">Verified Gems</span>
          <p className="text-2xl font-black text-emerald-400 pt-1">1,450 Spots</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-center">
          <span className="text-[10px] text-gray-500 uppercase font-semibold">Rewards Paid</span>
          <p className="text-2xl font-black text-amber-400 pt-1">850K Coins</p>
        </div>
      </div>

      {/* 3. Dynamic Moderator Panel details */}
      {activeTab === "reports" && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/30 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-400" />
              Safety & Scam Validation Queue
            </h3>
            <span className="text-[10px] text-gray-500 font-bold uppercase">Pending verification</span>
          </div>

          <div className="space-y-4">
            {safetyReports.map((rep) => (
              <div key={rep.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/15 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-xs font-bold text-white">📍 {rep.area}</h4>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 font-bold">
                      Reported by {rep.user}
                    </span>
                  </div>
                  
                  <p className="text-xs text-gray-300 leading-relaxed">{rep.issue}</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                  <button 
                    onClick={() => alert(`Report for ${rep.area} verified & published to live map!`)}
                    className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-glow-emerald"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                  
                  <button 
                    onClick={() => alert("Report dismissed.")}
                    className="py-2 px-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-bold"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Moderation Tab */}
      {activeTab === "users" && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/30 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Users className="w-4.5 h-4.5 text-indigo-400" />
              Registered Accounts Dashboard
            </h3>
            <span className="text-[10px] text-gray-500 font-bold uppercase">Clerk database sync</span>
          </div>

          <div className="space-y-3">
            {adminUsers.map((u) => (
              <div key={u.id} className="p-3.5 rounded-xl bg-[#030712]/50 border border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                    {u.name.split(" ").map(w => w[0]).join("")}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">{u.name}</h4>
                    <p className="text-[10px] text-gray-400">{u.email} • Role: {u.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-amber-400 font-bold">Lvl {u.level}</span>
                  <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10">
                    {u.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Moderation Tab */}
      {activeTab === "reviews" && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/5 bg-[#090d16]/30 space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <FileText className="w-4.5 h-4.5 text-indigo-400" />
              Community Posts Moderation
            </h3>
          </div>

          <div className="p-8 text-center rounded-2xl bg-white/5 border border-white/10 max-w-xl mx-auto">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <h4 className="text-sm font-bold text-white pt-3">Moderation Feed Clean</h4>
            <p className="text-xs text-gray-400 max-w-xs mx-auto pt-1">
              All traveler reviews, hidden gem uploads, and photos meet guidelines. No pending flag alerts.
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
