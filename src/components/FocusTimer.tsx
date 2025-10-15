import { supabase } from '@/lib/supabase';
import { useEffect, useRef, useState } from 'react';

interface FocusTimerProps {
  onSessionComplete?: (sessionData: any) => void;
}

export function FocusTimer({ onSessionComplete }: FocusTimerProps) {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [distractions, setDistractions] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start or Resume timer
  const handleStartResume = () => {
    if (isPaused) {
      // Resume from paused state
      setIsPaused(false);
      setIsActive(true);
    } else {
      // Start new session
      setIsActive(true);
      setIsPaused(false);
      setDistractions(0);
    }
  };

  // Pause timer
  const handlePause = () => {
    setIsActive(false);
    setIsPaused(true);
  };

  // Reset timer
  const handleReset = () => {
    setIsActive(false);
    setIsPaused(false);
    setTimeLeft(300); // Reset to 5 minutes
    setDistractions(0);
  };

  // Add distraction
  const handleAddDistraction = () => {
    setDistractions(prev => prev + 1);
  };

  // Complete session and save to database
  const completeSession = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const actualMinutes = 5 - Math.ceil(timeLeft / 60);
      const focusScore = calculateFocusScore(distractions, actualMinutes);

      // Save session to database
      const { error } = await supabase
        .from('focus_sessions')
        .insert([
          {
            user_id: user.id,
            planned_duration: 5,
            actual_duration: actualMinutes,
            status: 'completed',
            start_time: new Date(Date.now() - (300 - timeLeft) * 1000).toISOString(),
            end_time: new Date().toISOString(),
            distractions: distractions,
            focus_score: focusScore,
          }
        ]);

      if (error) throw error;

      // Call completion callback
      if (onSessionComplete) {
        onSessionComplete({
          actual_duration: actualMinutes,
          distractions: distractions,
          focus_score: focusScore
        });
      }

    } catch (error) {
      console.error('Error saving focus session:', error);
    }
  };

  // Calculate focus score
  const calculateFocusScore = (distractions: number, actualMinutes: number): number => {
    let baseScore = 100;
    baseScore -= distractions * 8;
    if (actualMinutes >= 4) baseScore += 10;
    else if (actualMinutes >= 3) baseScore += 5;
    else if (actualMinutes >= 2) baseScore += 2;
    return Math.max(50, Math.min(100, baseScore));
  };

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            completeSession();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      // Session completed
      setIsActive(false);
      setIsPaused(false);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  // Get timer color based on state
  const getTimerColor = () => {
    if (isActive) return 'bg-gradient-to-br from-emerald-500 to-green-600';
    if (isPaused) return 'bg-gradient-to-br from-amber-500 to-orange-600';
    return 'bg-gradient-to-br from-purple-600 to-blue-700';
  };

  return (
    <div className={`focus-timer ${getTimerColor()} rounded-2xl shadow-2xl p-6 max-w-md mx-auto border border-white/20 transition-colors duration-500`}>
      <div className="timer-display text-6xl font-bold text-center text-white mb-6 font-mono drop-shadow-lg">
        {formatTime(timeLeft)}
      </div>
      
      <div className="timer-controls flex gap-3 justify-center mb-4">
        {!isActive && !isPaused ? (
          // Not started - Show Start button
          <button 
            onClick={handleStartResume}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg border border-white/30"
          >
            Start Focus
          </button>
        ) : isActive ? (
          // Active - Show Pause button
          <button 
            onClick={handlePause}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg border border-white/30"
          >
            Pause
          </button>
        ) : (
          // Paused - Show Resume button
          <button 
            onClick={handleStartResume}
            className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg border border-white/30"
          >
            Resume
          </button>
        )}
        
        {/* Distraction button - show when active or paused */}
        {(isActive || isPaused) && (
          <button 
            onClick={handleAddDistraction}
            className="px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            💥 {distractions}
          </button>
        )}
      </div>

      {/* Reset button - show when active or paused */}
      {(isActive || isPaused) && (
        <button 
          onClick={handleReset}
          className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all duration-300 mb-4 border border-white/20"
        >
          Reset Session
        </button>
      )}

      {/* Session status */}
      <div className="session-status text-center text-white/90 font-medium text-lg">
        {isActive && '🎯 Focusing... Stay in the zone!'}
        {isPaused && '⏸️ Paused - Click Resume to continue'}
        {!isActive && !isPaused && '💡 Ready to focus? Click Start!'}
      </div>

      {/* Progress info */}
      <div className="text-center text-white/70 text-sm mt-4 space-y-1">
        {timeLeft < 300 && (
          <>
            <div>⏱️ {Math.floor((300 - timeLeft) / 60)}m {((300 - timeLeft) % 60)}s elapsed</div>
            {distractions > 0 && <div>💥 {distractions} distraction(s)</div>}
          </>
        )}
      </div>
    </div>
  );
}