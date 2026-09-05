"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SimulationStep } from "@/services/types";
import { getSimulationSnapshot, SimulationSnapshot } from "@/services/simulationService";

interface SimulationContextType {
  currentStep: SimulationStep;
  setStep: (step: SimulationStep) => void;
  isPlaying: boolean;
  togglePlay: () => void;
  play: () => void;
  pause: () => void;
  reset: () => void;
  stepForward: () => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  snapshot: SimulationSnapshot;
  activeRouteId: string;
  setActiveRouteId: (id: string) => void;
}

const STEPS: SimulationStep[] = ["T+0", "T+24h", "T+48h", "T+72h", "T+7d"];

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export function SimulationProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState<SimulationStep>("T+0");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeRouteId, setActiveRouteId] = useState<string>("route-balanced");

  const [snapshot, setSnapshot] = useState<SimulationSnapshot>(() =>
    getSimulationSnapshot("T+0", "route-balanced")
  );

  useEffect(() => {
    setSnapshot(getSimulationSnapshot(currentStep, activeRouteId));
  }, [currentStep, activeRouteId]);

  const stepForward = useCallback(() => {
    setCurrentStep((prev) => {
      const idx = STEPS.indexOf(prev);
      const nextIdx = (idx + 1) % STEPS.length;
      return STEPS[nextIdx];
    });
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep("T+0");
  }, []);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);
  const togglePlay = useCallback(() => setIsPlaying((p) => !p), []);

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(1200 / playbackSpeed, 500);
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        const idx = STEPS.indexOf(prev);
        if (idx >= STEPS.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return STEPS[idx + 1];
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  return (
    <SimulationContext.Provider
      value={{
        currentStep,
        setStep: setCurrentStep,
        isPlaying,
        togglePlay,
        play,
        pause,
        reset,
        stepForward,
        playbackSpeed,
        setPlaybackSpeed,
        snapshot,
        activeRouteId,
        setActiveRouteId,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
}
