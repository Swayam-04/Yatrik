import React from "react";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="space-y-12 py-8 max-w-4xl mx-auto">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          <span>Get In Touch</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white">Contact YATRIK Team</h1>
        <p className="text-gray-300 text-sm">Have questions, feedback, or partnership inquiries? Send us a message.</p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
            <div className="flex items-center gap-3 text-indigo-400">
              <Mail className="w-5 h-5" />
              <span className="text-sm font-semibold text-white">support@yatrik.ai</span>
            </div>
            <p className="text-xs text-gray-400">Response time within 24 hours for all general inquiries.</p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
            <div className="flex items-center gap-3 text-emerald-400">
              <Phone className="w-5 h-5" />
              <span className="text-sm font-semibold text-white">+91 1800-YATRIK-SAFE</span>
            </div>
            <p className="text-xs text-gray-400">24/7 Helpline for emergency safety assistance & support.</p>
          </div>

          <div className="p-6 rounded-3xl glass-panel border border-white/10 space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <MapPin className="w-5 h-5" />
              <span className="text-sm font-semibold text-white">Bengaluru & Goa, India</span>
            </div>
            <p className="text-xs text-gray-400">Headquarters & Safety Operations Center.</p>
          </div>
        </div>

        <form className="p-8 rounded-3xl glass-panel border border-white/10 space-y-4 bg-hero-gradient">
          <h3 className="text-lg font-bold text-white mb-2">Send us a message</h3>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Name</label>
            <input type="text" placeholder="Your name" className="w-full px-4 py-2 rounded-xl text-xs glass-input" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Email</label>
            <input type="email" placeholder="you@example.com" className="w-full px-4 py-2 rounded-xl text-xs glass-input" required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300">Message</label>
            <textarea rows={4} placeholder="How can we help?" className="w-full px-4 py-2 rounded-xl text-xs glass-input resize-none" required />
          </div>
          <button type="button" className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-glow transition-all flex items-center justify-center gap-2">
            <Send className="w-4 h-4" />
            <span>Send Message</span>
          </button>
        </form>
      </div>
    </div>
  );
}
