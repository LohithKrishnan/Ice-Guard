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
  ArrowRight,
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
      setActionSuccessMsg("Route applied to navigation autopilot.");
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
      {/* Trigger pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 transition-all hover:opacity-90"
          style={{
            padding: "10px 18px",
            borderRadius: 999,
            background: "#1A1A1A",
            border: "1px solid rgba(184,165,138,0.25)",
            color: "#F2F0EB",
            fontSize: 12,
            fontWeight: 500,
            boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
          }}
        >
          <div className="relative">
            <Bot className="w-4 h-4" style={{ color: "#B8A58A" }} />
            <span
              className="absolute -top-1 -right-1 w-2 h-2 rounded-full animate-pulse-bronze"
              style={{ background: "#4A7C59" }}
            />
          </div>
          <span>ICEGUARD COPILOT</span>
          <span
            className="font-mono"
            style={{
              fontSize: 9,
              padding: "2px 6px",
              borderRadius: 4,
              background: "rgba(184,165,138,0.1)",
              color: "#B8A58A",
              border: "1px solid rgba(184,165,138,0.2)",
              letterSpacing: "0.1em",
            }}
          >
            AI
          </span>
        </button>
      )}

      {/* Chat modal */}
      {isOpen && (
        <div
          className={`flex flex-col transition-all duration-200`}
          style={{
            width: isMinimized ? 320 : 420,
            height: isMinimized ? 48 : 560,
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 10,
            boxShadow: "0 16px 48px rgba(0,0,0,0.8)",
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between select-none flex-shrink-0"
            style={{
              height: 48,
              padding: "0 14px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              background: "#161616",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center rounded"
                style={{
                  width: 26,
                  height: 26,
                  background: "rgba(184,165,138,0.1)",
                  border: "1px solid rgba(184,165,138,0.2)",
                }}
              >
                <Bot className="w-3.5 h-3.5" style={{ color: "#B8A58A" }} />
              </div>
              <div>
                <span className="font-semibold tracking-wider" style={{ color: "#F2F0EB", fontSize: 11, letterSpacing: "0.08em" }}>
                  ICEGUARD COPILOT
                </span>
                <span
                  className="ml-2 font-mono"
                  style={{
                    fontSize: 9,
                    padding: "1px 5px",
                    borderRadius: 3,
                    background: "rgba(74,124,89,0.15)",
                    color: "#4A7C59",
                    border: "1px solid rgba(74,124,89,0.25)",
                    letterSpacing: "0.1em",
                  }}
                >
                  LIVE
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1" style={{ color: "#4A4540" }}>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded transition-colors hover:opacity-80"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded transition-colors hover:opacity-80"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Success toast */}
              {actionSuccessMsg && (
                <div
                  className="flex items-center gap-2 mx-3 mt-2 rounded animate-in fade-in"
                  style={{
                    padding: "8px 12px",
                    background: "rgba(74,124,89,0.12)",
                    border: "1px solid rgba(74,124,89,0.25)",
                    color: "#4A7C59",
                    fontSize: 11,
                  }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{actionSuccessMsg}</span>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3.5" style={{ fontSize: 12 }}>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                  >
                    <div
                      className="max-w-[90%] rounded-lg leading-relaxed"
                      style={{
                        padding: "10px 12px",
                        background:
                          msg.sender === "user"
                            ? "rgba(184,165,138,0.1)"
                            : "#161616",
                        border:
                          msg.sender === "user"
                            ? "1px solid rgba(184,165,138,0.2)"
                            : "1px solid rgba(255,255,255,0.06)",
                        color: msg.sender === "user" ? "#F2F0EB" : "#D5CFBF",
                      }}
                    >
                      <div className="whitespace-pre-line">{msg.text}</div>
                      {msg.actionButton && (
                        <div
                          className="mt-3 pt-2.5"
                          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                        >
                          <button
                            onClick={() => handleAction(msg.actionButton)}
                            className="w-full flex items-center justify-center gap-1.5 rounded font-medium transition-all hover:opacity-90"
                            style={{
                              padding: "7px 12px",
                              background: "rgba(184,165,138,0.12)",
                              border: "1px solid rgba(184,165,138,0.25)",
                              color: "#B8A58A",
                              fontSize: 11,
                            }}
                          >
                            <span>{msg.actionButton.label}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <span
                      className="font-mono mt-1 px-1"
                      style={{ color: "#4A4540", fontSize: 9 }}
                    >
                      {msg.timestamp.slice(11, 16)} UTC
                    </span>
                  </div>
                ))}
                {isLoading && (
                  <div
                    className="flex items-center gap-2 rounded w-fit"
                    style={{
                      padding: "8px 12px",
                      background: "#161616",
                      border: "1px solid rgba(255,255,255,0.06)",
                      color: "#8C8578",
                    }}
                  >
                    <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ color: "#B8A58A" }} />
                    <span style={{ fontSize: 11 }}>Analyzing…</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested queries */}
              <div
                className="overflow-x-auto"
                style={{
                  padding: "8px 12px",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  background: "#0D0D0D",
                }}
              >
                <div className="flex gap-1.5 whitespace-nowrap pb-0.5">
                  {SUGGESTED_QUERIES.map((query, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(query)}
                      disabled={isLoading}
                      className="flex-shrink-0 transition-all hover:opacity-80"
                      style={{
                        padding: "4px 10px",
                        borderRadius: 999,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        color: "#8C8578",
                        fontSize: 10,
                      }}
                    >
                      {query}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input */}
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2 flex-shrink-0"
                style={{
                  padding: "10px 12px",
                  borderTop: "1px solid rgba(255,255,255,0.06)",
                  background: "#161616",
                }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask polar navigator…"
                  disabled={isLoading}
                  className="flex-1 outline-none"
                  style={{
                    background: "#0D0D0D",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 6,
                    padding: "7px 10px",
                    fontSize: 12,
                    color: "#F2F0EB",
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex-shrink-0 transition-all hover:opacity-90 disabled:opacity-30"
                  style={{
                    padding: "7px 10px",
                    borderRadius: 6,
                    background: "rgba(184,165,138,0.12)",
                    border: "1px solid rgba(184,165,138,0.2)",
                    color: "#B8A58A",
                  }}
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
}
