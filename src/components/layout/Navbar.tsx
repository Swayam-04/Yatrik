"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useUser
} from "@clerk/nextjs";
import {
  Compass,
  MapPin,
  ShieldCheck,
  Sparkles,
  Bot,
  Coins,
  User as UserIcon,
  Search,
  Menu,
  X,
  Users,
  Settings,
  LogIn,
  UserPlus,
  Home,
  Info,
  Layers,
  Phone,
  Bookmark,
  Award,
  Bell,
  Calendar
} from "lucide-react";
import { INITIAL_USER } from "@/lib/store";

export function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isSignedIn, user, isLoaded } = useUser();

  interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    highlight?: boolean;
  }

  // Public Nav Items (When Logged Out)
  const publicNavItems: NavItem[] = [
    { label: "Home", href: "/", icon: Home },
    { label: "Features", href: "/features", icon: Layers },
    { label: "About", href: "/about", icon: Info },
    { label: "Contact", href: "/contact", icon: Phone },
  ];

  // Protected Nav Items (When Logged In)
  const protectedNavItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: Compass },
    { label: "AI Assistant", href: "/assistant", icon: Bot },
    { label: "Trip Planner", href: "/plan", icon: Sparkles },
    { label: "Safe Map", href: "/safety", icon: ShieldCheck, highlight: true },
    { label: "Community", href: "/community", icon: Users },
    { label: "Rewards", href: "/rewards", icon: Award },
    { label: "Bookmarks", href: "/bookmarks", icon: Bookmark },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Profile", href: "/profile", icon: UserIcon },
  ];

  const currentNavItems = isSignedIn ? protectedNavItems : publicNavItems;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 backdrop-blur-xl bg-dark-bg/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">

        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 p-0.5 shadow-glow group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-dark-bg rounded-[10px] flex items-center justify-center">
              <Compass className="w-6 h-6 text-indigo-400 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
              YATRIK <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">AI</span>
            </span>
            <p className="text-[10px] text-gray-400 font-medium hidden sm:block">Plan Smart • Travel Safe</p>
          </div>
        </Link>

        {/* Search Bar - Desktop */}
        {isSignedIn && (
          <div className="hidden lg:flex items-center relative w-64 xl:w-72">
            <Search className="w-4 h-4 absolute left-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search Goa, Tokyo, Cafes, Safe Routes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-full text-xs glass-input focus:w-80 transition-all duration-300 placeholder:text-gray-500"
            />
          </div>
        )}

        {/* Desktop Navigation */}
        {!isLoaded ? (
          /* Loading Skeleton */
          <div className="hidden md:flex items-center gap-2 animate-pulse">
            <div className="w-16 h-7 rounded-lg bg-white/10" />
            <div className="w-16 h-7 rounded-lg bg-white/10" />
            <div className="w-16 h-7 rounded-lg bg-white/10" />
            <div className="w-16 h-7 rounded-lg bg-white/10" />
          </div>
        ) : (
          <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 shrink-0 ${isActive
                      ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-glow"
                      : item.highlight
                        ? "text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/30"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${item.highlight ? "text-emerald-400" : ""}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Right Action Widgets & Auth State */}
        <div className="flex items-center gap-3 shrink-0">

          {!isLoaded ? (
            <div className="w-20 h-8 rounded-xl bg-white/10 animate-pulse" />
          ) : isSignedIn ? (
            <>
              {/* YATRIK Coins Counter */}
              <Link
                href="/rewards"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold hover:scale-105 transition-transform"
                title="YATRIK Rewards Balance"
              >
                <Coins className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>{INITIAL_USER.coins}</span>
              </Link>

              {/* Quick SOS Trigger Pill */}
              <Link
                href="/safety"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/20 transition-all shadow-glow-rose"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                <span>SOS</span>
              </Link>

              {/* Clerk Custom User Profile Button */}
              <div className="flex items-center gap-2 pl-1">
                <UserButton
                  userProfileMode="navigation"
                  userProfileUrl="/profile"
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-8 h-8 rounded-full ring-2 ring-indigo-500/50 shadow-glow",
                    }
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Link
                      label="My Passport & Rewards"
                      labelIcon={<UserIcon className="w-4 h-4 text-indigo-400" />}
                      href="/profile"
                    />
                    <UserButton.Link
                      label="Account Settings"
                      labelIcon={<Settings className="w-4 h-4 text-indigo-400" />}
                      href="/settings"
                    />
                  </UserButton.MenuItems>
                </UserButton>
                {user && (
                  <span className="text-xs font-semibold text-gray-200 hidden lg:inline">
                    {user.firstName || user.fullName?.split(" ")[0] || "Yatri"}
                  </span>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all flex items-center gap-1.5">
                  <LogIn className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Login</span>
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-glow transition-all flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Sign Up</span>
                </button>
              </SignUpButton>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-white/10 px-4 py-4 space-y-2 animate-in slide-in-from-top">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                    ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                    : "text-gray-300 hover:bg-white/5"
                  }`}
              >
                <Icon className="w-5 h-5 text-indigo-400" />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
