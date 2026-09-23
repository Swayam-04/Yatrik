"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { MobileSidebar } from "./MobileSidebar";
import { Footer } from "./Footer";
import { FloatingAiChatbot } from "@/components/ai/FloatingAiChatbot";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Restore collapsed state from localStorage on mount
  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("yatrik_sidebar_collapsed");
      if (saved === "true") {
        setIsCollapsed(true);
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("yatrik_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Auth pages (sign-in, sign-up) do not render the sidebar
  const isAuthPage =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-4">
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030712] text-gray-100 flex flex-col">
      {/* 1. Mobile Top Header & Drawer (< md) */}
      <MobileSidebar
        isOpen={mobileOpen}
        onOpen={() => setMobileOpen(true)}
        onClose={() => setMobileOpen(false)}
      />

      {/* 2. Desktop Fixed Left Sidebar (>= md) */}
      <div className="hidden md:block">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      </div>

      {/* 3. Main Content Container - Automatically shifts right */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-[margin,width] duration-300 ease-in-out ${
          isCollapsed
            ? "md:ml-[72px] md:w-[calc(100%-72px)]"
            : "md:ml-[260px] md:w-[calc(100%-260px)]"
        } ml-0 w-full`}
      >
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        <Footer />
      </div>

      {/* Global AI Assistant Floating Trigger / Slide-out Sidebar */}
      <FloatingAiChatbot />
    </div>
  );
}

export default AppShell;
