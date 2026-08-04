import React from "react";
import Link from "next/link";
import { 
  Sparkles, 
  Bot, 
  MapPin, 
  ShieldCheck, 
  PieChart, 
  Users, 
  Coins, 
  ArrowRight,
  Compass,
  Lock
} from "lucide-react";

export default function FeaturesPage() {
  const features = [
    {
      icon: Sparkles,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10 border-indigo-500/30",
      title: "AI Trip Planner",
      description: "Generates step-by-step itineraries optimized for time, budget, and travel preferences using Groq Llama 3 AI.",
    },
    {
      icon: Bot,
      color: "text-violet-400",
      bgColor: "bg-violet-500/10 border-violet-500/30",
      title: "AI Assistant",
      description: "Ask questions, get instant destination facts, translation help, and travel advice 24/7.",
    },
    {
      icon: ShieldCheck,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10 border-emerald-500/30",
      title: "Women's Safety Mode & Safe Routes",
      description: "Live safety index, well-lit safe route navigation, SOS emergency dispatcher, and verified area safety scores.",
    },
    {
      icon: PieChart,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10 border-amber-500/30",
      title: "Smart Budget Predictor",
      description: "Estimate costs for flights, hotels, dining, activities, and local transit with breakdown graphs.",
    },
    {
      icon: MapPin,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10 border-pink-500/30",
      title: "Local Hidden Gems",
      description: "Discover off-the-beaten-path cafes, scenic viewpoints, and authentic experiences recommended by locals.",
    },
    {
      icon: Users,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10 border-cyan-500/30",
      title: "Community Intelligence & Scam Alerts",
      description: "Real reviews, community travel hacks, and active scam alerts to keep your trip smooth and stress-free.",
    },
    {
      icon: Coins,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10 border-yellow-500/30",
      title: "YATRIK Passport & Rewards",
      description: "Earn YATRIK Coins for contributing reviews, completing trips, and leveling up your traveler badge.",
    },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Header */}
      <section className="text-center space-y-6 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Compass className="w-4 h-4 text-indigo-400" />
          <span>YATRIK Platform Features</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Everything You Need for a Seamless Journey
        </h1>
        <p className="text-gray-300 text-base leading-relaxed">
          Explore YATRIK's suite of AI and safety tools designed to revolutionize the way you plan, travel, and stay safe.
        </p>
      </section>

      {/* Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div key={idx} className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4 hover:border-indigo-500/40 transition-all group">
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${feature.bgColor}`}>
                <Icon className={`w-6 h-6 ${feature.color}`} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">{feature.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{feature.description}</p>
            </div>
          );
        })}
      </section>

      {/* Auth Banner */}
      <section className="rounded-3xl glass-panel border border-white/10 p-8 text-center space-y-6 bg-hero-gradient">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-extrabold text-white">Sign In Required to Access Features</h2>
        <p className="text-xs text-gray-300 max-w-lg mx-auto">
          Create a free account or log in to launch AI itineraries, safe route navigation, and community rewards.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/sign-in"
            className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs transition-all"
          >
            Login
          </Link>
          <Link
            href="/sign-up"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-glow transition-all"
          >
            Create Account
          </Link>
        </div>
      </section>
    </div>
  );
}
