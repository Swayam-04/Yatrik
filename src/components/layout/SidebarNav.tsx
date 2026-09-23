"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Compass,
  Sparkles,
  Home,
  Users,
  Bookmark,
  Award,
  Bot,
  Shield,
} from "lucide-react";

interface NavItemConfig {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItemConfig[] = [
  { label: "Explore", href: "/explore", icon: Compass },
  { label: "Plan Trip", href: "/plan", icon: Sparkles },
  { label: "My Trips", href: "/dashboard", icon: Home },
  { label: "Community", href: "/community", icon: Users },
  { label: "Saved", href: "/bookmarks", icon: Bookmark },
  { label: "Rewards", href: "/rewards", icon: Award },
  { label: "AI Assistant", href: "/assistant", icon: Bot, badge: "Gemma 4" },
  { label: "Admin Dashboard", href: "/admin", icon: Shield, adminOnly: true },
];

interface SidebarNavProps {
  isCollapsed?: boolean;
  onItemClick?: () => void;
}

export function SidebarNav({ isCollapsed = false, onItemClick }: SidebarNavProps) {
  const pathname = usePathname();
  const { user } = useUser();

  const userEmail = user?.primaryEmailAddress?.emailAddress || "";
  const role = user?.publicMetadata?.role;
  const isAdmin =
    userEmail.toLowerCase().includes("admin") ||
    role === "admin" ||
    role === "ADMIN";

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    return true;
  });

  return (
    <nav className="space-y-1.5 px-3 py-2" aria-label="Main Navigation">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onItemClick}
            title={isCollapsed ? item.label : undefined}
            className={`group relative flex items-center gap-3.5 rounded-xl transition-all duration-200 text-xs font-semibold select-none ${
              isCollapsed
                ? "justify-center p-3"
                : "px-3.5 py-2.5"
            } ${
              isActive
                ? "bg-gradient-to-r from-indigo-600/20 via-purple-600/15 to-transparent text-white border-l-2 border-indigo-500 shadow-glow-sm"
                : "text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
            }`}
          >
            {/* Nav Icon */}
            <div className="relative shrink-0 flex items-center justify-center">
              <Icon
                className={`w-4 h-4 transition-transform duration-200 ${
                  isActive
                    ? "text-indigo-400 scale-110"
                    : "text-gray-400 group-hover:text-gray-200 group-hover:scale-105"
                }`}
              />
            </div>

            {/* Label and Badge (when expanded) */}
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between overflow-hidden">
                <span className="truncate tracking-wide">{item.label}</span>
                {item.badge && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-md bg-pink-500/15 text-pink-300 border border-pink-500/25 text-[9px] font-extrabold uppercase tracking-wider shrink-0 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
            )}

            {/* Floating Tooltip when collapsed on desktop */}
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[#0e1424] text-white text-[11px] font-bold shadow-xl border border-white/10 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 whitespace-nowrap z-50">
                {item.label}
                {item.badge && (
                  <span className="ml-1.5 text-[9px] text-pink-300">({item.badge})</span>
                )}
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
