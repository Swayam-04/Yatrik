"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Compass,
  Route,
  Luggage,
  Users,
  Bookmark,
  Trophy,
  Sparkles,
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
  { label: "Plan Trip", href: "/plan", icon: Route },
  { label: "My Trips", href: "/dashboard", icon: Luggage },
  { label: "Community", href: "/community", icon: Users },
  { label: "Saved", href: "/bookmarks", icon: Bookmark },
  { label: "Rewards", href: "/rewards", icon: Trophy },
  { label: "AI Assistant", href: "/assistant", icon: Sparkles, badge: "Gemma 4" },
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
                ? "bg-gradient-to-r from-[#0E7490]/30 via-[#14B8A6]/15 to-transparent text-white border-l-2 border-[#14B8A6] shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                : "text-slate-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
            }`}
          >
            {/* Nav Icon */}
            <div className="relative shrink-0 flex items-center justify-center">
              <Icon
                className={`w-4 h-4 transition-transform duration-200 ${
                  isActive
                    ? "text-[#38BDF8] scale-110 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                    : "text-slate-400 group-hover:text-slate-200 group-hover:scale-105"
                }`}
              />
            </div>

            {/* Label and Badge (when expanded) */}
            {!isCollapsed && (
              <div className="flex-1 flex items-center justify-between overflow-hidden">
                <span className="truncate tracking-wide">{item.label}</span>
                {item.badge && (
                  <span className="ml-2 px-1.5 py-0.5 rounded-md bg-[#14B8A6]/15 text-[#38BDF8] border border-[#14B8A6]/30 text-[9px] font-extrabold uppercase tracking-wider shrink-0">
                    {item.badge}
                  </span>
                )}
              </div>
            )}

            {/* Floating Tooltip when collapsed on desktop */}
            {isCollapsed && (
              <div className="absolute left-full ml-3 px-2.5 py-1 rounded-lg bg-[#071A2B] text-white text-[11px] font-bold shadow-2xl border border-[#0E7490]/30 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-150 whitespace-nowrap z-50">
                {item.label}
                {item.badge && (
                  <span className="ml-1.5 text-[9px] text-[#38BDF8]">({item.badge})</span>
                )}
              </div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
