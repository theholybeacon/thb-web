"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { StudyMode } from "@/app/common/sessionStepCompletion/model/SessionStepCompletion";
import { SessionFull } from "@/app/common/session/model/Session";
import { StudyStep } from "@/app/common/studyStep/model/StudyStep";

interface ModeProgress {
  current: number;
  total: number;
  isComplete: boolean;
}

interface SessionProgressState {
  // Step navigation
  currentStepIndex: number;
  currentChapterInStep: number;
  currentMode: StudyMode;

  // Step completions (optimistic, kept in sync with React Query)
  completedSteps: Map<string, StudyMode[]>;

  // Mode-level progress (reported by active mode component)
  modeProgress: ModeProgress | null;

  // Actions
  setCurrentStepIndex: (index: number) => void;
  setCurrentChapterInStep: (chapter: number) => void;
  setCurrentMode: (mode: StudyMode) => void;
  reportModeProgress: (current: number, total: number, isComplete: boolean) => void;
  markStepCompleted: (stepId: string, mode: StudyMode) => void;
}

const SessionProgressContext = createContext<SessionProgressState | null>(null);

interface SessionProgressProviderProps {
  children: ReactNode;
  initialSession: SessionFull;
  steps: StudyStep[];
  stepCompletions?: { stepId: string; mode: StudyMode }[];
}

export function SessionProgressProvider({
  children,
  initialSession,
  steps,
  stepCompletions,
}: SessionProgressProviderProps) {
  // Find initial step index from session
  const getInitialStepIndex = () => {
    if (!steps.length) return 0;
    const index = steps.findIndex((step) => step.id === initialSession.currentStepId);
    return index === -1 ? 0 : index;
  };

  const [currentStepIndex, setCurrentStepIndex] = useState(getInitialStepIndex);
  const [currentChapterInStep, setCurrentChapterInStep] = useState(1);
  const [currentMode, setCurrentMode] = useState<StudyMode>("read");
  const [completedSteps, setCompletedSteps] = useState<Map<string, StudyMode[]>>(new Map());
  const [modeProgress, setModeProgress] = useState<ModeProgress | null>(null);

  // Sync completedSteps from React Query stepCompletions data
  useEffect(() => {
    if (!stepCompletions) return;
    const map = new Map<string, StudyMode[]>();
    for (const completion of stepCompletions) {
      const existing = map.get(completion.stepId) || [];
      if (!existing.includes(completion.mode)) {
        existing.push(completion.mode);
      }
      map.set(completion.stepId, existing);
    }
    setCompletedSteps(map);
  }, [stepCompletions]);

  // Reset mode progress when step or mode changes
  useEffect(() => {
    setModeProgress(null);
  }, [currentStepIndex, currentMode]);

  const reportModeProgress = useCallback(
    (current: number, total: number, isComplete: boolean) => {
      setModeProgress((prev) => {
        if (prev && prev.current === current && prev.total === total && prev.isComplete === isComplete) {
          return prev;
        }
        return { current, total, isComplete };
      });
    },
    []
  );

  const markStepCompleted = useCallback((stepId: string, mode: StudyMode) => {
    setCompletedSteps((prev) => {
      const next = new Map(prev);
      const existing = next.get(stepId) || [];
      if (!existing.includes(mode)) {
        next.set(stepId, [...existing, mode]);
      }
      return next;
    });
  }, []);

  const value: SessionProgressState = {
    currentStepIndex,
    currentChapterInStep,
    currentMode,
    completedSteps,
    modeProgress,
    setCurrentStepIndex,
    setCurrentChapterInStep,
    setCurrentMode,
    reportModeProgress,
    markStepCompleted,
  };

  return (
    <SessionProgressContext.Provider value={value}>
      {children}
    </SessionProgressContext.Provider>
  );
}

export function useSessionProgress() {
  const context = useContext(SessionProgressContext);
  if (!context) {
    throw new Error("useSessionProgress must be used within a SessionProgressProvider");
  }
  return context;
}

export function useOptionalSessionProgress() {
  return useContext(SessionProgressContext);
}
