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
      className={`fixed left-0 top-0 bottom-0 h-screen z-40 bg-[#090d16]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between transition-all duration-300 ease-in-out select-none ${
        isCollapsed ? "w-[72px]" : "w-[260px]"
      }`}
      aria-label="Application Sidebar"
    >
      {/* 1. Header / Brand & Collapse Toggle */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between shrink-0">
        <Link
          href="/"
          onClick={onLinkClick}
          className="flex items-center gap-3 group overflow-hidden"
          title="YATRIK - Home"
        >
          {/* Logo container */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] shadow-glow shrink-0 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-indigo-400 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>

          {!isCollapsed && (
            <div className="flex-1 overflow-hidden text-left">
              <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5 leading-none">
                YATRIK
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 font-extrabold border border-indigo-500/25">
                  AI
                </span>
              </span>
              <p className="text-[10px] text-gray-400 font-medium tracking-wide mt-1 truncate">
                Plan Smart • Travel Safe
              </p>
            </div>
          )}
        </Link>

        {/* Desktop Collapse / Expand Toggle Button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`hidden md:flex p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5 transition-colors shrink-0 ${
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
      <div className="p-3 border-t border-white/5 space-y-2.5 bg-[#060911]/80 shrink-0">
        {/* Rewards / Points Indicator */}
        <Link
          href="/rewards"
          onClick={onLinkClick}
          title={isCollapsed ? `Rewards: ${INITIAL_USER.coins} pts` : undefined}
          className={`flex items-center gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 text-amber-300 transition-all ${
            isCollapsed ? "justify-center p-2.5" : "px-3.5 py-2.5"
          }`}
        >
          <Coins className="w-4 h-4 text-amber-400 animate-bounce shrink-0" />
          {!isCollapsed && (
            <div className="flex-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-300">Rewards</span>
              <span className="font-extrabold text-amber-400">
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
          className={`flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600/30 via-red-600/20 to-rose-600/30 hover:from-rose-600/40 hover:to-rose-600/40 border border-rose-500/40 text-rose-200 shadow-glow-rose transition-all group ${
            isCollapsed ? "justify-center p-2.5" : "px-3.5 py-2.5"
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform shrink-0" />
          {!isCollapsed && (
            <span className="text-xs font-black tracking-wider uppercase text-rose-300">
              🛡 SOS EMERGENCY
            </span>
          )}
        </Link>

        {/* User Profile / Auth Area */}
        <div className="pt-1.5 border-t border-white/5">
          {!isLoaded ? (
            <div className="flex items-center gap-2.5 p-2 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-white/10" />
              {!isCollapsed && <div className="h-4 bg-white/10 rounded w-24" />}
            </div>
          ) : isSignedIn ? (
            <div
              className={`flex flex-col gap-2 rounded-xl bg-white/[0.03] border border-white/5 ${
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
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-indigo-500/30 shrink-0"
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
                            : "bg-indigo-500/15 text-indigo-300"
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
                <div className="flex items-center justify-between pt-1.5 border-t border-white/5 text-[10px] text-gray-400">
                  <Link
                    href="/profile"
                    onClick={onLinkClick}
                    className="flex items-center gap-1 hover:text-indigo-300 transition-colors"
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
                  className="p-1 rounded text-gray-400 hover:text-rose-400 transition-colors"
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
                    <button className="flex-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all flex items-center justify-center gap-1.5">
                      <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Login</span>
                    </button>
                  </SignInButton>

                  <SignUpButton mode="modal">
                    <button className="flex-1 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-glow transition-all flex items-center justify-center gap-1.5">
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Join</span>
                    </button>
                  </SignUpButton>
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button
                    className="w-full p-2 rounded-xl bg-white/5 hover:bg-white/10 text-indigo-400 flex items-center justify-center"
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
