import React from "react";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="space-y-8 py-8 max-w-3xl mx-auto text-gray-300">
      <div className="space-y-3 border-b border-white/10 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold">
          <FileText className="w-4 h-4" />
          <span>Terms of Service</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Terms & Conditions</h1>
        <p className="text-xs text-gray-400">Last updated: August 2026</p>
      </div>

      <div className="space-y-6 text-xs leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Acceptance of Terms</h2>
          <p>By accessing or using YATRIK, you agree to comply with and be bound by these Terms. Account registration via Clerk authentication is mandatory to access protected features.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. User Conduct & Community Guidelines</h2>
          <p>Users must not post fraudulent scam alerts, misleading reviews, or inappropriate content. Violations may result in immediate account suspension or termination.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. AI & Safety Disclaimer</h2>
          <p>AI recommendations and safety scores are provided for informational guidance. Travelers are advised to stay vigilant and follow local official safety guidelines.</p>
        </section>
      </div>
    </div>
  );
}
