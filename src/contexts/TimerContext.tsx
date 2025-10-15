'use client';

import { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';

interface TimerState {
  timeLeft: number;
  totalDuration: number;
  isActive: boolean;
  isPaused: boolean;
  distractions: number;
  sessionId: string | null;
  startTime: number | null;
}

interface TimerContextType extends TimerState {
  startTimer: (duration: number) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  addDistraction: () => void;
  finishSession: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [timer, setTimer] = useState<TimerState>({
    timeLeft: 0,
    totalDuration: 300, // Default 5 minutes
    isActive: false,
    isPaused: false,
    distractions: 0,
    sessionId: null,
    startTime: null
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load timer state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('amvora-timer');
    if (saved) {
      try {
        const savedTimer = JSON.parse(saved);
        // Calculate remaining time if session was active
        if (savedTimer.isActive && savedTimer.startTime) {
          const elapsedSeconds = Math.floor((Date.now() - savedTimer.startTime) / 1000);
          const newTimeLeft = Math.max(0, savedTimer.timeLeft - elapsedSeconds);
          
          if (newTimeLeft > 0) {
            setTimer({
              ...savedTimer,
              timeLeft: newTimeLeft,
              isActive: true
            });
          } else {
            // Session completed while away
            setTimer({
              timeLeft: 0,
              totalDuration: savedTimer.totalDuration,
              isActive: false,
              isPaused: false,
              distractions: savedTimer.distractions,
              sessionId: null,
              startTime: null
            });
          }
        } else if (savedTimer.isPaused || savedTimer.isActive) {
          // Restore paused or active session
          setTimer(savedTimer);
        }
      } catch (error) {
        console.error('Error loading timer state:', error);
        // Reset to default if corrupted
        localStorage.removeItem('amvora-timer');
      }
    }
  }, []);

  // Save timer state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('amvora-timer', JSON.stringify(timer));
  }, [timer]);

  const startTimer = (duration: number) => {
    const sessionId = Date.now().toString();
    setTimer({
      timeLeft: duration,
      totalDuration: duration,
      isActive: true,
      isPaused: false,
      distractions: 0,
      sessionId,
      startTime: Date.now()
    });
  };

  const pauseTimer = () => {
    setTimer(prev => ({ 
      ...prev, 
      isActive: false, 
      isPaused: true 
    }));
  };

  const resumeTimer = () => {
    setTimer(prev => ({ 
      ...prev, 
      isActive: true, 
      isPaused: false,
      startTime: Date.now() // Reset start time on resume
    }));
  };

  const resetTimer = () => {
    setTimer({
      timeLeft: 0,
      totalDuration: 300,
      isActive: false,
      isPaused: false,
      distractions: 0,
      sessionId: null,
      startTime: null
    });
  };

  const addDistraction = () => {
    setTimer(prev => ({ 
      ...prev, 
      distractions: prev.distractions + 1 
    }));
  };

  const finishSession = () => {
    setTimer(prev => ({ 
      ...prev, 
      isActive: false, 
      isPaused: false,
      timeLeft: 0 
    }));
  };

  // Timer countdown logic
  useEffect(() => {
    if (timer.isActive && timer.timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          const newTimeLeft = prev.timeLeft - 1;
          
          if (newTimeLeft <= 0) {
            // Session completed
            return {
              ...prev,
              timeLeft: 0,
              isActive: false,
              isPaused: false
            };
          }
          
          return {
            ...prev,
            timeLeft: newTimeLeft
          };
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.isActive, timer.timeLeft]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <TimerContext.Provider value={{
      ...timer,
      startTimer,
      pauseTimer,
      resumeTimer,
      resetTimer,
      addDistraction,
      finishSession
    }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}