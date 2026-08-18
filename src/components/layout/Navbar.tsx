"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
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
  Bookmark,
  Bell,
  Award
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
    { label: "Explore", href: "/discover", icon: Compass },
    { label: "Community", href: "/community", icon: Users },
  ];

  // Protected Nav Items (When Logged In)
  const protectedNavItems: NavItem[] = [
    { label: "Explore", href: "/discover", icon: Compass },
    { label: "Plan Trip", href: "/plan", icon: Sparkles },
    { label: "My Trips", href: "/dashboard", icon: Home },
    { label: "Community", href: "/community", icon: Users },
    { label: "Saved", href: "/bookmarks", icon: Bookmark },
    { label: "Rewards", href: "/rewards", icon: Award },
    { label: "AI Assistant", href: "/assistant", icon: Bot },
    { label: "Profile", href: "/profile", icon: UserIcon },
  ];

  // Mobile Bottom Bar Navigation Items (When Logged In)
  const mobileTabbarItems = [
    { label: "Home", href: "/dashboard", icon: Home },
    { label: "Explore", href: "/discover", icon: Compass },
    { label: "Plan", href: "/plan", icon: Sparkles },
    { label: "Assistant", href: "/assistant", icon: Bot },
    { label: "Profile", href: "/profile", icon: UserIcon },
  ];

  const currentNavItems = isSignedIn ? protectedNavItems : publicNavItems;

  return (
    <>
      {/* Top Header Navigation (Desktop & Mobile) */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 backdrop-blur-xl bg-[#030712]/75">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          
          {/* Brand Logo & Creative Title */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] shadow-glow group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Compass className="w-5.5 h-5.5 text-indigo-400 group-hover:rotate-45 transition-transform duration-500" />
              </div>
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1">
                YATRIK <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/25">AI</span>
              </span>
              <p className="text-[9px] text-gray-400 font-medium tracking-wide hidden sm:block">Plan Smart • Travel Safe</p>
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          {isSignedIn && (
            <div className="hidden lg:flex items-center relative w-64 xl:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search destinations, local gems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-full text-xs glass-input focus:w-80 transition-all duration-300 placeholder:text-gray-500"
              />
            </div>
          )}

          {/* Desktop Navigation Link Menu */}
          {!isLoaded ? (
            <div className="hidden md:flex items-center gap-2 animate-pulse">
              <div className="w-14 h-6 rounded bg-white/5" />
              <div className="w-14 h-6 rounded bg-white/5" />
              <div className="w-14 h-6 rounded bg-white/5" />
            </div>
          ) : (
            <nav className="hidden md:flex items-center gap-0.5 overflow-x-auto py-1">
              {currentNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shrink-0 ${
                      isActive
                        ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-glow"
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {!isLoaded ? (
              <div className="w-16 h-8 rounded-xl bg-white/5 animate-pulse" />
            ) : isSignedIn ? (
              <>
                {/* Rewards Balance counter (Glow text pop) */}
                <Link
                  href="/rewards"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/5 border border-amber-500/20 text-amber-400 text-xs font-bold hover:bg-amber-500/10 transition-colors"
                >
                  <Coins className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
                  <span className="text-gradient-amber">{INITIAL_USER.coins}</span>
                </Link>

                {/* Emergency SOS Badge */}
                <Link
                  href="/safety"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-400 text-xs font-extrabold hover:bg-rose-500/20 transition-all shadow-glow-rose"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                  <span>SOS</span>
                </Link>

                {/* Profile Auth button */}
                <div className="flex items-center gap-2 pl-1">
                  <UserButton
                    userProfileMode="navigation"
                    userProfileUrl="/profile"
                    appearance={{
                      elements: {
                        userButtonAvatarBox: "w-8 h-8 rounded-xl ring-2 ring-indigo-500/30 shadow-glow",
                      }
                    }}
                  >
                    <UserButton.MenuItems>
                      <UserButton.Link
                        label="Passport Overview"
                        labelIcon={<UserIcon className="w-4 h-4 text-indigo-400" />}
                        href="/profile"
                      />
                      <UserButton.Link
                        label="My Settings"
                        labelIcon={<Settings className="w-4 h-4 text-indigo-400" />}
                        href="/profile?tab=settings"
                      />
                    </UserButton.MenuItems>
                  </UserButton>
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
                  <button className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-glow transition-all flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Sign Up</span>
                  </button>
                </SignUpButton>
              </div>
            )}

            {/* Mobile Burger Menu Button (Only for Logged Out or fallback) */}
            {!isSignedIn && (
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Drawer (Logged Out only) */}
        {!isSignedIn && mobileMenuOpen && (
          <div className="md:hidden glass-panel border-t border-white/5 px-4 py-4 space-y-2 animate-in slide-in-from-top duration-300">
            {currentNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-indigo-600/10 text-indigo-300 border border-indigo-500/20"
                      : "text-gray-300 hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-5 h-5 text-indigo-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* --- Native Bottom Navigation Bar for Mobile --- */}
      {isSignedIn && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-panel border-t border-white/5 px-6 py-2 pb-4 flex items-center justify-between bg-[#030712]/90 backdrop-blur-2xl rounded-t-3xl">
          {mobileTabbarItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-1 transition-all ${
                  isActive ? "text-indigo-400 scale-105" : "text-gray-400 hover:text-white"
                }`}
              >
                <div className={`p-1.5 rounded-xl ${isActive ? "bg-indigo-500/15" : ""}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[9px] font-bold tracking-wider">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
