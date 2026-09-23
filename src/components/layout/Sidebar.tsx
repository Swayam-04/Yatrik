"use client";

import React from "react";
import Link from "next/link";
import { useClerk, useUser, SignInButton, SignUpButton } from "@clerk/nextjs";
import {
  Compass,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Coins,
  Settings,
  LogOut,
  LogIn,
  UserPlus,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { SidebarNav } from "./SidebarNav";
import { INITIAL_USER } from "@/lib/store";

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLinkClick?: () => void;
}

export function Sidebar({
  isCollapsed,
  onToggleCollapse,
  onLinkClick,
}: SidebarProps) {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();

  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const role = user?.publicMetadata?.role;
  const isAdmin =
    userEmail.toLowerCase().includes("admin") ||
    role === "admin" ||
    role === "ADMIN";

  const displayName =
    user?.fullName ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "") ||
    INITIAL_USER.name;

  const displayAvatar = user?.imageUrl || INITIAL_USER.avatar;

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 h-screen z-40 bg-[#071A2B]/95 backdrop-blur-2xl border-r border-[#0E7490]/25 flex flex-col justify-between transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? "w-[72px]" : "w-[260px]"
      }`}
      aria-label="Application Sidebar"
    >
      {/* 1. Header / Brand & Collapse Toggle */}
      <div className="p-4 border-b border-[#0E7490]/20 flex items-center justify-between shrink-0">
        <Link
          href="/"
          onClick={onLinkClick}
          className="flex items-center gap-3 group overflow-hidden"
          title="YATRIK - Plan Smart • Travel Safe"
        >
          {/* Logo container */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0E7490] via-[#14B8A6] to-[#38BDF8] p-[1.5px] shadow-[0_0_15px_rgba(20,184,166,0.3)] shrink-0 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#071A2B] rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-[#14B8A6] group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>

          {!isCollapsed && (
            <div className="flex-1 overflow-hidden text-left">
              <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5 leading-none">
                YATRIK
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#14B8A6]/15 text-[#38BDF8] font-extrabold border border-[#14B8A6]/30">
                  AI
                </span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide mt-1 truncate">
                Plan Smart • Travel Safe
              </p>
            </div>
          )}
        </Link>

        {/* Desktop Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`hidden md:flex p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-[#0E7490]/20 transition-colors shrink-0 ${
            isCollapsed ? "mx-auto mt-2" : ""
          }`}
          title={isCollapsed ? "Expand sidebar (260px)" : "Collapse sidebar (72px)"}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* 2. Middle Navigation Section (Scrollable if height constrained) */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 custom-scrollbar">
        <SidebarNav isCollapsed={isCollapsed} onItemClick={onLinkClick} />
      </div>

      {/* 3. Bottom Section: Rewards, SOS Emergency & User Profile */}
      <div className="p-3 border-t border-[#0E7490]/20 space-y-2.5 bg-[#030F1A]/85 shrink-0">
        {/* Rewards / Points Indicator */}
        <Link
          href="/rewards"
          onClick={onLinkClick}
          title={isCollapsed ? `Rewards: ${INITIAL_USER.coins} pts` : undefined}
          className={`flex items-center gap-2.5 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 hover:bg-[#F59E0B]/15 text-[#FBBF24] transition-all ${
            isCollapsed ? "justify-center p-2.5" : "px-3.5 py-2.5"
          }`}
        >
          <Coins className="w-4 h-4 text-[#FBBF24] animate-bounce shrink-0" />
          {!isCollapsed && (
            <div className="flex-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Rewards</span>
              <span className="font-extrabold text-[#FBBF24]">
                {INITIAL_USER.coins.toLocaleString()} pts
              </span>
            </div>
          )}
        </Link>

        {/* SOS Emergency Button */}
        <Link
          href="/safety"
          onClick={onLinkClick}
          title={isCollapsed ? "SOS EMERGENCY" : undefined}
          className={`flex items-center gap-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/35 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)] transition-all group ${
            isCollapsed ? "justify-center p-2.5" : "px-3.5 py-2.5"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform shrink-0" />
          {!isCollapsed && (
            <span className="text-xs font-bold tracking-wider uppercase text-rose-300">
              🛡 SOS Emergency
            </span>
          )}
        </Link>

        {/* User Profile / Auth Area */}
        <div className="pt-1.5 border-t border-[#0E7490]/20">
          {!isLoaded ? (
            <div className="flex items-center gap-2.5 p-2 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-white/10" />
              {!isCollapsed && <div className="h-4 bg-white/10 rounded w-24" />}
            </div>
          ) : isSignedIn ? (
            <div
              className={`flex flex-col gap-2 rounded-xl bg-[#071A2B]/60 border border-[#0E7490]/20 ${
                isCollapsed ? "p-1.5 items-center" : "p-2.5"
              }`}
            >
              {/* User Avatar + Name + Role */}
              <div
                className={`flex items-center gap-2.5 ${
                  isCollapsed ? "justify-center" : ""
                }`}
              >
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-[#14B8A6]/40 shrink-0"
                />

                {!isCollapsed && (
                  <div className="flex-1 overflow-hidden text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white truncate max-w-[120px]">
                        {displayName}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                          isAdmin
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-[#14B8A6]/15 text-[#38BDF8] border border-[#14B8A6]/25"
                        }`}
                      >
                        {isAdmin ? "Admin" : "Explorer"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Profile / Settings & Logout links */}
              {!isCollapsed && (
                <div className="flex items-center justify-between pt-1.5 border-t border-[#0E7490]/20 text-[10px] text-slate-400">
                  <Link
                    href="/profile"
                    onClick={onLinkClick}
                    className="flex items-center gap-1 hover:text-[#38BDF8] transition-colors"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Settings</span>
                  </Link>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={onLinkClick}
                      className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors font-bold"
                    >
                      <Shield className="w-3 h-3" />
                      <span>Admin</span>
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => signOut({ redirectUrl: "/" })}
                    className="flex items-center gap-1 hover:text-rose-400 transition-colors"
                    title="Log out"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Logout</span>
                  </button>
                </div>
              )}

              {/* Collapsed logout / profile icon button */}
              {isCollapsed && (
                <button
                  type="button"
                  onClick={() => signOut({ redirectUrl: "/" })}
                  className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            /* Logged out state */
            <div className="space-y-1.5">
              {!isCollapsed ? (
                <div className="flex items-center gap-2">
                  <SignInButton mode="modal">
                    <button className="flex-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#0E7490]/30 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5">
                      <LogIn className="w-3.5 h-3.5 text-[#38BDF8]" />
                      <span>Login</span>
                    </button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <button className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-[#0E7490] to-[#14B8A6] hover:from-[#0E7490]/90 hover:to-[#14B8A6]/90 text-white text-xs font-bold shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all flex items-center justify-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Join</span>
                    </button>
                  </SignUpButton>
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button
                    className="w-full p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#38BDF8] flex items-center justify-center"
                    title="Login"
                  >
                    <LogIn className="w-4 h-4" />
                  </button>
                </SignInButton>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
