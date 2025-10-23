import { useTimer } from '@/contexts/TimerContext';

interface FocusTimerProps {
  onSessionComplete?: (sessionData: any) => void;
}

export function FocusTimer({ onSessionComplete }: FocusTimerProps) {
  const {
    timeLeft,
    totalDuration,
    isActive,
    isPaused,
    distractions,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    addDistraction,
    completeSession
  } = useTimer();

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
      resumeTimer();
    } else {
      // Start new session
      startTimer(300, 'Focus Session'); // 5 minutes
    }
  };

  // Add distraction
  const handleAddDistraction = () => {
    addDistraction();
  };

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
            onClick={pauseTimer}
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
          onClick={resetTimer}
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
        {timeLeft < totalDuration && (
          <>
            <div>⏱️ {Math.floor((totalDuration - timeLeft) / 60)}m {((totalDuration - timeLeft) % 60)}s elapsed</div>
            {distractions > 0 && <div>💥 {distractions} distraction(s)</div>}
          </>
        )}
      </div>
    </div>
  );
}