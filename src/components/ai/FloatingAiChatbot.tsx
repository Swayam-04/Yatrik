"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Bot,
  X,
  Send,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Square,
  RotateCcw,
  Copy,
  Check,
  Zap,
  Trash2,
  Compass,
  Shield,
  MapPin,
  ChevronRight,
  MessageSquare,
  Maximize2,
} from "lucide-react";
import { useAuthModal } from "@/components/auth/AuthModalContext";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  isError?: boolean;
  responseTimeMs?: number;
}

export function FloatingAiChatbot() {
  const { requireAuth } = useAuthModal();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "👋 Hi! I am **YATRIK AI Assistant** powered by Groq & Gemma 4.\n\nAsk me about secret spots, personalized travel itineraries, local food, or verified women safety routes!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [groqStatus, setGroqStatus] = useState<{
    isOnline: boolean;
    checking: boolean;
    model?: string;
    error?: string;
  }>({
    isOnline: false,
    checking: true,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for Escape key to close the sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Check AI Health
  const checkHealth = async () => {
    setGroqStatus((prev) => ({ ...prev, checking: true }));
    try {
      const res = await fetch("/api/ai/status");
      if (res.ok) {
        const data = await res.json();
        setGroqStatus({
          isOnline: Boolean(data.online ?? data.isOnline),
          checking: false,
          model: data.model,
          error: data.error,
        });
      } else {
        const data = await res.json().catch(() => ({}));
        setGroqStatus({
          isOnline: false,
          checking: false,
          error: data.error || "AI Service Unavailable",
        });
      }
    } catch {
      setGroqStatus({
        isOnline: false,
        checking: false,
        error: "Network Error",
      });
    }
  };

  useEffect(() => {
    if (mounted) {
      checkHealth();
    }
  }, [mounted]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsTyping(false);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: "ai",
        text: "✨ Chat cleared. How can I assist with your next trip?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isTyping) return;

    setLastQuery(query);

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    const aiMsgId = (Date.now() + 1).toString();
    const initialAiMsg: Message = {
      id: aiMsgId,
      sender: "ai",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, initialAiMsg]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const startTime = performance.now();

    try {
      const conversationHistory = [...messages, userMsg].map((m) => ({
        role: m.sender === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversationHistory }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        let errorMsg = "Groq Service Unavailable";
        try {
          const errData = await response.json();
          if (errData.error) errorMsg = errData.error;
        } catch {
          if (response.status === 401) errorMsg = "Invalid API Key";
          else if (response.status === 429) errorMsg = "Rate Limit Reached";
          else if (response.status >= 500) errorMsg = "Groq Service Unavailable";
          else errorMsg = "Network Error";
        }
        throw new Error(errorMsg);
      }

      if (!response.body) {
        throw new Error("Groq Service Unavailable");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamedContent += chunk;

        const elapsedMs = Math.round(performance.now() - startTime);

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId ? { ...msg, text: streamedContent, responseTimeMs: elapsedMs } : msg
          )
        );
      }

      if (!streamedContent.trim()) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId
              ? {
                  ...msg,
                  text: "I am ready to assist with your YATRIK travel plans! How else can I help?",
                }
              : msg
          )
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId
              ? { ...msg, text: msg.text + " *(Generation cancelled)*" }
              : msg
          )
        );
      } else {
        const errText = error instanceof Error ? error.message : "Network Error";
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId
              ? {
                  ...msg,
                  isError: true,
                  text: `⚠️ **${errText}**\n\nPlease check your configuration or try again.`,
                }
              : msg
          )
        );
      }
    } finally {
      abortControllerRef.current = null;
      setIsTyping(false);
    }
  };

  const handleRetry = () => {
    if (lastQuery) {
      handleSend(lastQuery);
    }
  };

  const samplePrompts = [
    { label: "Hidden Gems", icon: "✨", query: "What are top uncrowded hidden gems in Bhubaneswar?" },
    { label: "Solo Women Safety", icon: "🛡️", query: "Give me safe travel tips and safe areas for solo women travelers." },
    { label: "Manali Cafes", icon: "☕", query: "What are the coziest secret cafes in Old Manali with mountain views?" },
    { label: "Budget 4-Day Plan", icon: "💰", query: "Plan a 4-day budget route under ₹12,000 including food and stays." },
  ];

  if (!mounted) return null;

  return (
    <>
      {/* Floating Action Trigger Button (Opens Sidebar) */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 p-3.5 sm:px-4 sm:py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-glow hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2.5 group ${
          isOpen ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        title="Open YATRIK AI Sidebar"
        aria-label="Open AI Travel Assistant"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
          <span
            className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#090d16] ${
              groqStatus.isOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
          />
        </div>

        <div className="hidden sm:flex flex-col text-left">
          <span className="font-extrabold text-[11px] uppercase tracking-wider leading-none">
            AI Assistant
          </span>
          <span className="text-[9px] text-indigo-200 font-medium">Groq & Gemma 4</span>
        </div>
      </button>

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Slide-out AI Assistant Sidebar */}
      <aside
        className={`fixed top-0 right-0 z-50 h-full w-full sm:w-[440px] md:w-[480px] bg-[#090d16]/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
        }`}
        aria-label="YATRIK AI Sidebar"
      >
        {/* Sidebar Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-[#060911]/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-glow shrink-0">
              <div className="w-full h-full bg-[#030712] rounded-[14px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-400 animate-pulse" />
              </div>
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white tracking-tight">
                  YATRIK AI Assistant
                </h3>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold uppercase tracking-wider">
                  Sidebar
                </span>
              </div>

              {/* Status & Model Info */}
              <div className="text-[10px] mt-0.5 flex items-center gap-2 font-medium">
                {groqStatus.checking ? (
                  <span className="text-amber-400 flex items-center gap-1">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Connecting to AI...
                  </span>
                ) : groqStatus.isOnline ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Active ({groqStatus.model || "Groq LLM"})</span>
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1" title={groqStatus.error}>
                    <AlertTriangle className="w-2.5 h-2.5" />
                    <span>{groqStatus.error || "Standby Mode"}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearChat}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-colors"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <Link
              href="/assistant"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-colors"
              title="Open Fullscreen Page"
            >
              <Maximize2 className="w-4 h-4" />
            </Link>

            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-gray-400 hover:text-white transition-colors ml-1"
              title="Close Sidebar (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Suggestions Chips Bar */}
        <div className="px-4 py-2.5 border-b border-white/5 bg-[#090d16]/60 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-pink-400" />
            <span>Try:</span>
          </span>
          {samplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p.query)}
              className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-indigo-600/25 text-gray-300 hover:text-indigo-200 border border-white/10 hover:border-indigo-500/30 text-[11px] font-semibold whitespace-nowrap transition-all flex items-center gap-1"
            >
              <span>{p.icon}</span>
              <span>{p.label}</span>
            </button>
          ))}
        </div>

        {/* Sidebar Messages Body */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar bg-gradient-to-b from-[#090d16] via-[#090d16]/90 to-[#070b12]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="w-7 h-7 rounded-xl bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center shrink-0 mt-0.5 shadow-glow-sm">
                  <Bot className="w-4 h-4 text-indigo-400" />
                </div>
              )}

              <div className="relative group max-w-[86%] text-left">
                <div
                  className={`px-4 py-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-tr-none font-medium"
                      : msg.isError
                      ? "bg-rose-500/10 text-rose-200 border border-rose-500/30 rounded-tl-none whitespace-pre-wrap"
                      : "glass-panel bg-[#0d1527]/80 text-gray-100 border border-white/10 rounded-tl-none whitespace-pre-wrap"
                  }`}
                >
                  {msg.text || (
                    <span className="flex items-center gap-1.5 text-gray-400 italic">
                      <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                      <span>Thinking and synthesizing journey insights...</span>
                    </span>
                  )}

                  {msg.isError && (
                    <button
                      onClick={handleRetry}
                      className="mt-3 text-[10px] font-bold px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" /> Retry Generation
                    </button>
                  )}
                </div>

                {/* Message Timestamp & Copy Action */}
                <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1 px-1">
                  <span>{msg.timestamp}</span>

                  <div className="flex items-center gap-2">
                    {msg.responseTimeMs && (
                      <span className="text-[9px] text-gray-500">
                        ⚡ {msg.responseTimeMs}ms
                      </span>
                    )}

                    {msg.sender === "ai" && msg.text && !msg.isError && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 hover:text-white flex items-center gap-1 transition-opacity text-gray-400"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <span className="text-emerald-400 flex items-center gap-0.5 text-[9px] font-bold">
                            <Check className="w-3 h-3" /> Copied
                          </span>
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-xs">
              <span className="text-indigo-200 text-xs font-bold pl-1 flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>YATRIK AI is generating answer...</span>
              </span>

              <button
                onClick={handleCancel}
                className="px-2.5 py-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
              >
                <Square className="w-2.5 h-2.5 fill-current" /> Stop
              </button>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Sidebar Input Form Footer */}
        <div className="p-4 sm:p-5 border-t border-white/10 bg-[#060911]/95 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ask about places, safety routes, budgets..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
                className="w-full px-4 py-3 rounded-2xl text-xs sm:text-sm bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="p-3 sm:px-4 sm:py-3 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white disabled:opacity-40 hover:scale-105 active:scale-95 transition-all shadow-glow flex items-center gap-1.5 shrink-0 font-bold text-xs"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          <div className="flex items-center justify-between text-[10px] text-gray-500 mt-2 px-1">
            <span>Powered by Groq & Gemma 4 Real Grounding</span>
            <span className="hidden sm:inline">Press Esc to close</span>
          </div>
        </div>
      </aside>
    </>
  );
}

export default FloatingAiChatbot;
export { FloatingAiChatbot as AiSidebar };
