"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Send,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  ChevronDown,
  Compass,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { CopilotMessage } from "@/services/types";
import { askCopilot } from "@/services/copilotService";
import { useSimulation } from "@/context/SimulationContext";
import { useNavigation } from "@/context/NavigationContext";

const INITIAL_MESSAGES: CopilotMessage[] = [
  {
    id: "init-1",
    sender: "assistant",
    timestamp: "2026-09-05T05:20:00Z",
    text: `**ICEGUARD COPILOT INITIALIZED**\n\nI am your maritime intelligence reasoning co-pilot. I analyze SAR satellite telemetry, PINN iceberg kinematics, and bathymetric risk corridors.\n\nHow can I support bridge operations today?`,
  },
];

const SUGGESTED_QUERIES = [
  "Is my current route safe?",
  "Which iceberg is closest to the vessel?",
  "Predict A23A movement for 72 hours.",
  "Find the safest route.",
  "What areas have rapidly increasing sea ice?",
];

export default function AICopilot() {
  const router = useRouter();
  const { setActiveRouteId } = useSimulation();
  const { setSelectedIcebergId } = useNavigation();

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input.trim();
    if (!textToSend || isLoading) return;

    const userMsg: CopilotMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      timestamp: new Date().toISOString(),
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInput("");
    setIsLoading(true);

    try {
      const response = await askCopilot(textToSend, messages);
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (actionButton: CopilotMessage["actionButton"]) => {
    if (!actionButton) return;

    if (actionButton.actionType === "APPLY_ROUTE") {
      setActiveRouteId(actionButton.payload);
      setActionSuccessMsg("Balanced AI Route successfully loaded into navigation autopilot!");
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } else if (actionButton.actionType === "VIEW_MAP") {
      setSelectedIcebergId(actionButton.payload);
      router.push("/");
    } else if (actionButton.actionType === "NAVIGATE") {
      router.push(actionButton.payload);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {/* Minimized / Closed Floating Trigger Pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-semibold text-xs shadow-cyan-glow border border-cyan-300/40 transition-all transform hover:scale-105"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          </div>
          <span>ICEGUARD COPILOT</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-900/60 border border-cyan-400/30 text-cyan-200">
            AI
          </span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={`bg-polar-950/95 backdrop-blur-xl border border-cyan-500/40 rounded-xl shadow-2xl flex flex-col transition-all duration-200 ${
            isMinimized ? "w-80 h-12" : "w-88 sm:w-[420px] h-[580px]"
          }`}
        >
          {/* Copilot Header */}
          <div className="h-12 px-4 border-b border-polar-750 flex items-center justify-between bg-polar-900/80 rounded-t-xl select-none">
            <div className="flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <span className="font-mono font-bold text-white text-xs">
                  ICEGUARD COPILOT
                </span>
                <span className="ml-2 text-[9px] px-1.5 py-0.2 rounded font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
                  FASTAPI LIVE
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-1 text-slate-400">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 hover:text-white rounded"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:text-white rounded"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Action Success Toast */}
              {actionSuccessMsg && (
                <div className="mx-3 mt-2 p-2 rounded bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span className="font-mono text-[11px]">{actionSuccessMsg}</span>
                </div>
              )}

              {/* Messages Container */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[90%] rounded-lg p-3 text-xs leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-cyan-600/30 border border-cyan-500/50 text-cyan-100 font-medium"
                          : "bg-polar-900/90 border border-polar-750 text-slate-200"
                      }`}
                    >
                      <div className="whitespace-pre-line prose prose-invert prose-xs">
                        {msg.text}
                      </div>

                      {/* Optional Action Button embedded in response */}
                      {msg.actionButton && (
                        <div className="mt-3 pt-2.5 border-t border-polar-750">
                          <button
                            onClick={() => handleAction(msg.actionButton)}
                            className="w-full py-1.5 px-3 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-cyan-glow"
                          >
                            <span>{msg.actionButton.label}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">
                      {msg.timestamp.slice(11, 16)} UTC
                    </span>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center space-x-2 p-2.5 rounded-lg bg-polar-900 border border-polar-800 text-cyan-300 font-mono text-xs w-fit">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing bathymetry & radar kinematics...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Query Chips */}
              <div className="px-3 py-1.5 border-t border-polar-800 bg-polar-950/60 overflow-x-auto">
                <div className="flex space-x-1.5 whitespace-nowrap scrollbar-none pb-0.5">
                  {SUGGESTED_QUERIES.map((query, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(query)}
                      disabled={isLoading}
                      className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-polar-900 hover:bg-polar-800 border border-polar-750 text-slate-300 hover:text-cyan-300 transition-colors flex-shrink-0"
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input Field */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="p-2.5 border-t border-polar-750 bg-polar-900/90 rounded-b-xl flex items-center space-x-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask polar navigator..."
                  disabled={isLoading}
                  className="flex-1 bg-polar-950 border border-polar-750 rounded-md px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2 rounded-md bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white transition-colors"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
