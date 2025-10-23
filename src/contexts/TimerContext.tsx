'use client';

import { FocusSession } from '@/hooks/useFocusSessions';
import { createContext, ReactNode, useContext, useState } from 'react';

interface TimerContextType {
  timeLeft: number;
  isRunning: boolean;
  isActive: boolean;
  isPaused: boolean;
  distractions: number;
  currentSession: FocusSession | null;
  progress: number;
  startTimer: (session: FocusSession) => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  completeSession: () => void;
  addDistraction: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [distractions, setDistractions] = useState<number>(0);
  const [currentSession, setCurrentSession] = useState<FocusSession | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const startTimer = (session: FocusSession) => {
    setCurrentSession(session);
    setTimeLeft(session.duration_minutes * 60);
    setIsRunning(true);
    setIsActive(true);
    setIsPaused(false);
    setDistractions(0);
    setProgress(0);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setIsPaused(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(0);
    setCurrentSession(null);
    setDistractions(0);
    setProgress(0);
  };

  const completeSession = () => {
    setIsRunning(false);
    setIsActive(false);
    setIsPaused(false);
    setProgress(100);
    // Here you would call your completeSession mutation
  };

  const addDistraction = () => {
    setDistractions(prev => prev + 1);
  };

  // Timer countdown logic would go here (useEffect)

  return (
    <TimerContext.Provider
      value={{
        timeLeft,
        isRunning,
        isActive,
        isPaused,
        distractions,
        currentSession,
        progress,
        startTimer,
        pauseTimer,
        resetTimer,
        completeSession,
        addDistraction,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};