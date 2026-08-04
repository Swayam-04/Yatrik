"use client";

import { SignIn } from "@clerk/nextjs";
import { Compass, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Brand Header */}
      <div className="text-center space-y-3 mb-8">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-pink-500 p-0.5 shadow-glow group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-dark-bg rounded-[14px] flex items-center justify-center">
              <Compass className="w-7 h-7 text-indigo-400 group-hover:rotate-45 transition-transform duration-500" />
            </div>
          </div>
          <span className="text-3xl font-extrabold tracking-tight text-white">
            YATRIK <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">AI</span>
          </span>
        </Link>
        <p className="text-sm text-gray-400">Sign in to your YATRIK travel ecosystem account</p>
      </div>

      {/* Clerk SignIn Component */}
      <div className="w-full max-w-md flex justify-center">
        <SignIn
          path="/sign-in"
          routing="path"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
        />
      </div>

      {/* Security badge footer */}
      <div className="mt-8 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>End-to-End Encrypted & Secure Authentication</span>
      </div>

    </div>
  );
}
