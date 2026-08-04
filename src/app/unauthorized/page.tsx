import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 px-4">
      <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-glow-rose">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-3xl font-extrabold text-white">403 - Access Forbidden</h1>
        <p className="text-sm text-gray-300">
          You do not have permission to view this page. Admin privileges are required to access YATRIK Platform Governance & Moderation tools.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-glow transition-all flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
