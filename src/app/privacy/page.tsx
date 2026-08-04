import React from "react";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="space-y-8 py-8 max-w-3xl mx-auto text-gray-300">
      <div className="space-y-3 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold">
          <Shield className="w-4 h-4" />
          <span>Legal & Compliance</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Privacy Policy</h1>
        <p className="text-xs text-gray-400">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 text-xs leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
          <p>We collect information provided directly by you when you create an account via Clerk, save trips, submit reviews, or interact with our AI Assistant and Safe Map features.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Use of Location & Safety Data</h2>
          <p>If you enable Women's Safety Mode or SOS features, location coordinates are strictly processed in real-time to render safe route recommendations and dispatch emergency notifications. We do not sell your location history.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Data Security & Storage</h2>
          <p>Your authentication tokens are secured via Clerk OAuth protocols, and data stored in our PostgreSQL database is encrypted in transit and at rest.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Your Rights</h2>
          <p>You can view, edit, or delete your saved trips, bookmarks, and user profile data at any time from your YATRIK Profile settings.</p>
        </section>
      </div>
    </div>
  );
}
