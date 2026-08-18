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
  PhoneCall
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
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "👋 Hello traveler! I am **YATRIK AI Guide** powered by Groq. Need trip suggestions, safety metrics, or flight budgets?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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

  // Check AI Health
  const checkHealth = async () => {
    setGroqStatus(prev => ({ ...prev, checking: true }));
    try {
      const res = await fetch("/api/ai/status");
      if (res.ok) {
        const data = await res.json();
        setGroqStatus({
          isOnline: data.isOnline,
          checking: false,
          model: data.model,
          error: data.error
        });
      } else {
        const data = await res.json().catch(() => ({}));
        setGroqStatus({
          isOnline: false,
          checking: false,
          error: data.error || "Groq Service Unavailable"
        });
      }
    } catch {
      setGroqStatus({
        isOnline: false,
        checking: false,
        error: "Network Error"
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
                text: "I am ready to assist with your YATRIK travel plans! How else can I help?",
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
    { label: "Manali Secrets", query: "What are the top secret cafes in Manali?" },
    { label: "Jaipur Safety Check", query: "Jaipur safety guide for solo girls?" },
    { label: "Kerala 4-day Budget", query: "4-day budget route in Kerala under 10k?" },
  ];

  return (
    <>
      {/* Floating Action Trigger Button */}
      <button
        onClick={() => requireAuth(() => setIsOpen(!isOpen))}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white shadow-glow hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 group"
        title="Chat with AI Assistant"
      >
        <div className="relative">
          <Bot className="w-5 h-5 text-white group-hover:rotate-12 transition-transform" />
          <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border-2 border-[#090d16] ${groqStatus.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
        </div>
        
        <span className="font-extrabold text-[10px] uppercase tracking-wider hidden sm:inline">AI Guide</span>
      </button>

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] h-[520px] max-h-[75vh] glass-panel rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">

          {/* Header Bar */}
          <div className="p-4 border-b border-white/5 bg-[#090d16]/95 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-pink-500 p-0.5 shadow-glow">
                <div className="w-full h-full bg-[#030712] rounded-[10px] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
                </div>
              </div>
              
              <div className="text-left">
                <h3 className="text-xs font-extrabold text-white flex items-center gap-1">
                  YATRIK AI
                  <Link href="/assistant" className="text-[8px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/25 hover:bg-indigo-500/25 flex items-center gap-0.5">
                    Full <ExternalLink className="w-2 h-2" />
                  </Link>
                </h3>

                <div className="text-[9px] mt-0.5 flex items-center gap-1 font-bold">
                  {groqStatus.checking ? (
                    <span className="text-amber-400 flex items-center gap-1">
                      <RefreshCw className="w-2.5 h-2.5 animate-spin" /> Syncing...
                    </span>
                  ) : groqStatus.isOnline ? (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Groq Active
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-0.5" title={groqStatus.error}>
                      <AlertTriangle className="w-2.5 h-2.5" /> {groqStatus.error || "Standby"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={checkHealth}
                className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white"
                title="Refresh Status"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${groqStatus.checking ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 border-b border-white/5 bg-white/[0.02] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p.query)}
                className="px-2 py-0.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 text-[9px] font-bold whitespace-nowrap transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Message History list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#090d16]/30 scrollbar-none">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                )}

                <div className="relative group max-w-[85%] text-left">
                  <div
                    className={`px-3 py-2.5 rounded-2xl text-[11px] leading-relaxed ${msg.sender === "user"
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none"
                      : msg.isError
                        ? "bg-rose-500/10 text-rose-300 border border-rose-500/20 rounded-tl-none whitespace-pre-wrap"
                        : "bg-[#090d16]/80 text-gray-200 border border-white/5 rounded-tl-none whitespace-pre-wrap"
                      }`}
                  >
                    {msg.text || (
                      <span className="flex items-center gap-1 text-gray-400 italic">
                        <Sparkles className="w-3 h-3 animate-spin text-indigo-400" /> Streaming response...
                      </span>
                    )}

                    {msg.isError && (
                      <button
                        onClick={handleRetry}
                        className="mt-2 text-[8px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/30 flex items-center gap-1"
                      >
                        <RotateCcw className="w-2.5 h-2.5" /> Retry
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-[8px] text-gray-500 mt-1 px-1">
                    <span>
                      {msg.timestamp}
                    </span>
                    {msg.sender === "ai" && msg.text && !msg.isError && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="opacity-0 group-hover:opacity-100 hover:text-white flex items-center gap-1 transition-opacity"
                        title="Copy text"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-2.5 h-2.5 text-gray-500" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                <span className="text-indigo-200 text-[10px] font-bold pl-1 animate-pulse">Streaming Groq tokens...</span>
                
                <button
                  onClick={handleCancel}
                  className="px-2 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-[9px] font-bold flex items-center gap-1"
                >
                  <Square className="w-2 h-2 fill-current" /> Stop
                </button>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Footer Form */}
          <div className="p-3 border-t border-white/5 bg-[#090d16]/95">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about spots, safety, budgets..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
                className="flex-1 px-3.5 py-2.5 rounded-xl text-xs glass-input focus:outline-none focus:border-indigo-500/50 disabled:opacity-50 text-white"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white disabled:opacity-40 hover:scale-105 transition-transform"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
}
export default FloatingAiChatbot;
