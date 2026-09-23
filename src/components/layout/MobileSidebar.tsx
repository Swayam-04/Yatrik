"use client";

import React from "react";
import Link from "next/link";
import { useUser, SignInButton } from "@clerk/nextjs";
import {
  Menu,
  X,
  Compass,
  ShieldCheck,
  LogIn,
} from "lucide-react";
import { Sidebar } from "./Sidebar";

interface MobileSidebarProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function MobileSidebar({ isOpen, onOpen, onClose }: MobileSidebarProps) {
  const { isSignedIn } = useUser();

  return (
    <>
      {/* 1. Mobile Top Header Bar (md:hidden) */}
      <header className="md:hidden sticky top-0 z-30 h-14 sm:h-16 flex items-center justify-between px-4 bg-[#030712]/90 backdrop-blur-xl border-b border-white/5">
        {/* Left: Hamburger menu toggle */}
        <button
          type="button"
          onClick={onOpen}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
          title="Open Navigation Menu"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5 text-indigo-400" />
        </button>

        {/* Center: Brand Logo */}
        <Link href="/" className="flex items-center gap-2" title="YATRIK">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-glow shrink-0">
            <div className="w-full h-full bg-[#090d16] rounded-[6px] flex items-center justify-center">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
            </div>
          </div>
          <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1">
            YATRIK
            <span className="text-[8px] px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
              AI
            </span>
          </span>
        </Link>

        {/* Right: Quick SOS & Login */}
        <div className="flex items-center gap-2">
          <Link
            href="/safety"
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 border border-rose-500/25 text-rose-300 text-[11px] font-bold shadow-glow-rose"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>SOS</span>
          </Link>

          {!isSignedIn && (
            <SignInButton mode="modal">
              <button className="p-1.5 rounded-lg bg-white/5 text-gray-300 hover:text-white">
                <LogIn className="w-4 h-4" />
              </button>
            </SignInButton>
          )}
        </div>
      </header>

      {/* 2. Slide-in Drawer Overlay & Container (md:hidden) */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative z-50 h-full w-[280px] bg-[#090d16] border-r border-white/10 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out animate-in slide-in-from-left">
            {/* Close button inside drawer header */}
            <div className="absolute top-4 right-3 z-50">
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
                title="Close Navigation"
                aria-label="Close Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sidebar rendered inside drawer */}
            <div className="h-full w-full">
              <Sidebar
                isCollapsed={false}
                onToggleCollapse={onClose}
                onLinkClick={onClose}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
