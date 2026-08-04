"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Sparkles,
  RefreshCw,
  ShieldCheck,
  Compass,
  PieChart,
  Trash2,
  Copy,
  Check,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Square,
  RotateCcw
} from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  isError?: boolean;
  responseTimeMs?: number;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "👋 Hello! I am your **YATRIK AI Assistant** powered by Groq. I can help you design custom itineraries, estimate travel budgets, evaluate safety for destinations, and discover hidden local gems. Where would you like to explore?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [status, setStatus] = useState<{
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

  const checkHealth = async () => {
    setStatus(prev => ({ ...prev, checking: true }));
    try {
      const res = await fetch("/api/ai/status");
      if (res.ok) {
        const data = await res.json();
        setStatus({
          isOnline: data.isOnline,
          checking: false,
          model: data.model,
          error: data.error,
        });
      } else {
        const data = await res.json().catch(() => ({}));
        setStatus({
          isOnline: false,
          checking: false,
          error: data.error || "Groq Service Unavailable",
        });
      }
    } catch {
      setStatus({
        isOnline: false,
        checking: false,
        error: "Network Error",
      });
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

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

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: "ai",
        text: "Conversation history cleared! How can I help you plan your next trip?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isTyping) return;

    setLastQuery(query);

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    const aiMsgId = (Date.now() + 1).toString();
    const initialAiMsg: Message = {
      id: aiMsgId,
      sender: "ai",
      text: "",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, initialAiMsg]);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const startTime = performance.now();

    try {
      const conversationHistory = [...messages, userMsg].map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
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
                text: "I am ready to help you plan your travel! What details would you like to refine?",
              }
              : msg
          )
        );
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
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
                text: `⚠️ **${errText}**\n\nPlease check your settings or try again.`,
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

  const quickPrompts = [
    { title: "3-Day Goa Plan", query: "Plan a 3-day budget travel itinerary for North Goa with hidden beach cafes." },
    { title: "Jaipur Women Safety", query: "Is Jaipur safe for solo women travelers at night? Provide key safety tips." },
    { title: "Kerala Budget Hack", query: "How can I optimize a ₹15,000 budget for a 4-day Kerala trip?" },
    { title: "Manali Hidden Gems", query: "Recommend 4 top secret cafes and scenic viewpoints in Manali." }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 animate-in fade-in duration-500">

      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-3">
              <Bot className="w-3.5 h-3.5" />
              <span>Intelligent Travel Companion • Groq API</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              YATRIK <span className="text-gradient">AI Assistant</span>
            </h1>
            <p className="text-sm text-gray-400 mt-1 max-w-xl">
              Ask travel questions, build custom itineraries, analyze budgets, check safety scores, and discover hidden local gems in real time.
            </p>
          </div>

          {/* Connection Status & Actions */}
          <div className="flex items-center gap-3">
            <div className="glass-panel px-4 py-2.5 rounded-2xl border border-white/10 flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${status.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <div>
                <p className="text-xs font-semibold text-white">
                  {status.checking ? "Checking Groq..." : status.isOnline ? "Groq Engine Online" : "Groq API Standby"}
                </p>
                <p className="text-[10px] text-gray-400">
                  {status.isOnline ? (status.model || "llama-3.3-70b-versatile") : (status.error || "Setup Required")}
                </p>
              </div>
              <button
                onClick={checkHealth}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Refresh Status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${status.checking ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleClearHistory}
              className="p-2.5 rounded-2xl glass-panel border border-white/10 text-gray-400 hover:text-rose-400 hover:border-rose-500/30 transition-all"
              title="Clear Conversation History"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="glass-panel rounded-3xl border border-white/10 flex flex-col h-[640px] overflow-hidden shadow-2xl">

        {/* Quick Prompts Bar */}
        <div className="p-3 sm:p-4 border-b border-white/10 bg-white/[0.02] flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-gray-400 flex items-center gap-1 shrink-0 mr-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Prompts:
          </span>
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p.query)}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium whitespace-nowrap transition-all hover:scale-105"
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-dark-bg/40">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5 shadow-glow">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}

              <div className="relative group max-w-[85%] sm:max-w-[78%]">
                <div
                  className={`px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${msg.sender === "user"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-glow rounded-tr-none"
                    : msg.isError
                      ? "bg-rose-500/10 text-rose-200 border border-rose-500/30 rounded-tl-none whitespace-pre-wrap"
                      : "glass-card text-gray-200 border border-white/10 rounded-tl-none whitespace-pre-wrap"
                    }`}
                >
                  {msg.text || (
                    <span className="flex items-center gap-2 text-gray-400 italic">
                      <Sparkles className="w-4 h-4 animate-spin text-indigo-400" /> YATRIK AI is streaming tokens...
                    </span>
                  )}

                  {msg.isError && (
                    <button
                      onClick={handleRetry}
                      className="mt-2.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Retry Request
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-[10px] text-gray-500 mt-1 px-1">
                  <span className="flex items-center gap-2">
                    <span>{msg.timestamp}</span>
                    {msg.responseTimeMs && (
                      <span className="text-[10px] text-indigo-400 font-mono">
                        • Response Time: {msg.responseTimeMs}ms
                      </span>
                    )}
                  </span>
                  {msg.sender === "ai" && msg.text && !msg.isError && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-white flex items-center gap-1"
                      title="Copy message"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center justify-between gap-3 p-3 rounded-2xl glass-card border border-indigo-500/30 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
                <span className="text-gray-300 font-medium">Streaming response from Groq API...</span>
              </div>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Square className="w-3 h-3 fill-current" /> Stop Generation
              </button>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Footer */}
        <div className="p-4 border-t border-white/10 bg-dark-card/90">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              placeholder="Ask YATRIK AI about destinations, safe routes, budget hacks, or secret cafes..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping}
              className="flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm glass-input focus:outline-none focus:border-indigo-500/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs shadow-glow transition-all flex items-center gap-2 disabled:opacity-40"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

      </div>

      {/* Feature Deep Dive Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/plan" className="glass-card p-4 rounded-2xl border border-white/10 hover:border-indigo-500/40 transition-all group flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-indigo-300">AI Trip Planner</h4>
              <p className="text-[10px] text-gray-400">Generate structured itineraries</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link href="/budget" className="glass-card p-4 rounded-2xl border border-white/10 hover:border-indigo-500/40 transition-all group flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-emerald-300">Smart Budget Engine</h4>
              <p className="text-[10px] text-gray-400">Predict & optimize expenses</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link href="/safety" className="glass-card p-4 rounded-2xl border border-white/10 hover:border-indigo-500/40 transition-all group flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white group-hover:text-rose-300">Women's Safety Mode</h4>
              <p className="text-[10px] text-gray-400">Safe routes & live scoring</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

    </div>
  );
}
