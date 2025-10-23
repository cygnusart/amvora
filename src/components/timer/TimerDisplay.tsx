'use client';

import { useTimer } from '@/contexts/TimerContext';
import { cn } from '@/lib/utils';

export function TimerDisplay() {
  const { timeLeft, isRunning, currentSession, progress } = useTimer();

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Circular Progress Timer */}
      <div className="relative">
        <div className="w-80 h-80 rounded-full glass border-2 border-primary/20 flex items-center justify-center">
          {/* Progress Ring */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="hsl(var(--muted))"
              strokeWidth="2"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="hsl(var(--primary))"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={283 - (progress * 283)}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          
          {/* Timer Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-2">
            <div className={cn(
              "text-6xl font-bold font-mono gradient-text",
              isRunning && "pulse-glow"
            )}>
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
            <div className="text-lg text-muted-foreground font-medium">
              {currentSession?.title || 'Focus Session'}
            </div>
            <div className={cn(
              "text-sm px-3 py-1 rounded-full border",
              isRunning 
                ? "border-success text-success bg-success/10" 
                : "border-muted text-muted-foreground"
            )}>
              {isRunning ? 'In Progress' : 'Ready'}
            </div>
          </div>
        </div>
      </div>

      {/* Session Info */}
      {currentSession && (
        <div className="glass rounded-2xl p-6 border border-primary/10 w-full max-w-md">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">Duration</div>
              <div className="font-semibold">{currentSession.duration_minutes} min</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">Focus Score</div>
              <div className="font-semibold text-success">
                {currentSession.focus_score || '--'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}