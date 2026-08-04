import React from "react";
import Link from "next/link";
import { Compass, ShieldCheck, Heart, Globe, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full glass-panel border-t border-white/10 bg-dark-bg mt-20 text-gray-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-pink-500 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-wide">YATRIK</span>
            </Link>
            <p className="text-gray-400 leading-relaxed">
              Your All-in-one Travel Recommendation & Itinerary Kit. Plan smart, travel safe, and explore local gems together.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-medium text-[11px]">Women Safety Certified Ecosystem</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Company & Info</h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-indigo-400 transition-colors">About YATRIK</Link></li>
              <li><Link href="/features" className="hover:text-indigo-400 transition-colors">Features Overview</Link></li>
              <li><Link href="/pricing" className="hover:text-indigo-400 transition-colors">Pricing & Plans</Link></li>
              <li><Link href="/contact" className="hover:text-indigo-400 transition-colors">Contact Support</Link></li>
              <li><Link href="/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-indigo-400 transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Protected Modules */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Protected Modules</h4>
            <ul className="space-y-2">
              <li><Link href="/assistant" className="hover:text-indigo-400 transition-colors">AI Assistant Chat</Link></li>
              <li><Link href="/plan" className="hover:text-indigo-400 transition-colors">AI Trip Planner</Link></li>
              <li><Link href="/budget" className="hover:text-indigo-400 transition-colors">Smart Budget Predictor</Link></li>
              <li><Link href="/safety" className="hover:text-indigo-400 transition-colors">Women Safety Mode</Link></li>
              <li><Link href="/community" className="hover:text-indigo-400 transition-colors">Community Directory</Link></li>
              <li><Link href="/rewards" className="hover:text-indigo-400 transition-colors">Rewards & Badges</Link></li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm">Connect With Us</h4>
            <p className="text-gray-400 text-xs mb-3">
              Join our global community of smart travelers and explorers.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-600/20 hover:text-indigo-400 transition-all">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-600/20 hover:text-indigo-400 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-600/20 hover:text-indigo-400 transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} YATRIK Inc. All rights reserved.</p>
          <div className="flex items-center gap-1 text-gray-500">
            <span>Crafted for modern global explorers</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline mx-1" />
          </div>
        </div>
      </div>
    </footer>
  );
}
