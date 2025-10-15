'use client';

import { useTimer } from '@/contexts/TimerContext';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

export function HourglassTimer() {
  const {
    timeLeft,
    isActive,
    isPaused,
    distractions,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    addDistraction,
    finishSession
  } = useTimer();

  const [customMinutes, setCustomMinutes] = useState(25);
  const [showDurationPicker, setShowDurationPicker] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const totalDuration = timeLeft + (300 - timeLeft); // Calculate total from timeLeft
  const sandFillPercentage = ((totalDuration - timeLeft) / totalDuration) * 100;

  // Generate unique sand particles
  const sandParticles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    duration: 2 + Math.random() * 2,
    x: Math.random() * 16 - 8
  }));

  const getStatusMessage = () => {
    if (isActive) return 'Deep in the flow... Time is flying! ✨';
    if (isPaused) return 'Taking a breather? Ready when you are! 💫';
    if (timeLeft === 0) return 'Mission accomplished! Well done! 🏆';
    return 'Ready to unlock your potential? Let\'s begin! 🚀';
  };

  const handleStartWithDuration = (minutes: number) => {
    startTimer(minutes * 60); // Convert minutes to seconds
    setShowDurationPicker(false);
  };

  const quickStartOptions = [5, 15, 25, 45, 60];

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-violet-900 rounded-3xl shadow-2xl border border-white/10 max-w-md mx-auto">
      
      {/* Timer Display */}
      <div className="text-5xl font-mono font-bold text-white mb-6 text-center drop-shadow-lg">
        {formatTime(timeLeft)}
      </div>

      {/* Duration Picker */}
      <AnimatePresence>
        {showDurationPicker && !isActive && !isPaused && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="mb-6 w-full"
          >
            <div className="text-white text-center mb-3 font-medium">Choose Focus Duration</div>
            
            {/* Quick Start Buttons */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              {quickStartOptions.map((minutes) => (
                <motion.button
                  key={minutes}
                  onClick={() => handleStartWithDuration(minutes)}
                  className="px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {minutes}m
                </motion.button>
              ))}
            </div>

            {/* Custom Duration */}
            <div className="flex gap-2 items-center">
              <input
                type="number"
                min="1"
                max="120"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(Number(e.target.value))}
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center"
                placeholder="Custom minutes"
              />
              <motion.button
                onClick={() => handleStartWithDuration(customMinutes)}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hourglass Container */}
      <div className="relative mb-6">
        {/* Hourglass Stand - Top */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-gradient-to-b from-amber-800 to-amber-900 rounded-t-lg z-10 shadow-lg"></div>
        
        {/* Hourglass Glass */}
        <div className="relative w-40 h-56">
          {/* Glass Outline */}
          <div className="absolute inset-0 border-2 border-amber-200/30 rounded-full bg-gradient-to-br from-blue-500/5 to-purple-500/5 backdrop-blur-sm overflow-hidden">
            
            {/* Top Sand Chamber */}
            <div className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden rounded-t-full">
              <motion.div 
                className="absolute bottom-0 left-0 right-0 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 rounded-t-full"
                initial={{ height: '100%' }}
                animate={{ height: `${100 - sandFillPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
            
            {/* Bottom Sand Chamber */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden rounded-b-full">
              <motion.div 
                className="absolute top-0 left-0 right-0 bg-gradient-to-t from-amber-400 via-amber-500 to-amber-600 rounded-b-full"
                initial={{ height: '0%' }}
                animate={{ height: `${sandFillPercentage}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
              
              {/* Accumulated Sand Pile */}
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-amber-500 rounded-b-full"></div>
            </div>

            {/* Hourglass Neck */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-amber-300 rounded-full border border-amber-400 z-20 shadow-inner"></div>
            
            {/* Falling Sand Animation */}
            <AnimatePresence>
              {isActive && sandParticles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className="absolute w-1 h-1 bg-amber-300 rounded-full z-10"
                  style={{
                    left: `calc(50% + ${particle.x}px)`,
                    top: '45%'
                  }}
                  initial={{ y: 0, opacity: 0, scale: 0 }}
                  animate={{ 
                    y: 25, 
                    opacity: [0, 1, 1, 0],
                    scale: [0, 1, 1, 0.5]
                  }}
                  transition={{ 
                    duration: particle.duration,
                    delay: particle.delay,
                    repeat: Infinity,
                    ease: "easeIn"
                  }}
                />
              ))}
            </AnimatePresence>

            {/* Glass Shine Effects */}
            <div className="absolute top-3 left-4 w-6 h-3 bg-white/30 rounded-full blur-sm opacity-60"></div>
            <div className="absolute bottom-3 right-4 w-6 h-3 bg-white/20 rounded-full blur-sm opacity-40"></div>
          </div>
        </div>

        {/* Hourglass Stand - Bottom */}
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-gradient-to-t from-amber-800 to-amber-900 rounded-b-lg z-10 shadow-lg"></div>
      </div>

      {/* Status Message */}
      <div className="text-center text-white/90 font-medium text-sm mb-4 min-h-[40px] flex items-center justify-center">
        {getStatusMessage()}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {/* Main Control Buttons */}
        <div className="flex gap-3 justify-center">
          {!isActive && !isPaused ? (
            <>
              {!showDurationPicker ? (
                <motion.button
                  onClick={() => setShowDurationPicker(true)}
                  className="flex-1 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold shadow-lg border border-teal-400 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="text-lg">⏳</span>
                  Start Focus
                </motion.button>
              ) : (
                <motion.button
                  onClick={() => setShowDurationPicker(false)}
                  className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-semibold shadow-lg border border-slate-500 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  ← Back
                </motion.button>
              )}
            </>
          ) : isActive ? (
            <>
              <motion.button
                onClick={pauseTimer}
                className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold shadow-lg border border-amber-400 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ⏸️ Pause
              </motion.button>
              <motion.button
                onClick={finishSession}
                className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-lg border border-emerald-400 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ✅ Finish
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                onClick={resumeTimer}
                className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold shadow-lg border border-green-400 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ▶️ Resume
              </motion.button>
              <motion.button
                onClick={finishSession}
                className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold shadow-lg border border-emerald-400 flex items-center justify-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                ✅ Finish
              </motion.button>
            </>
          )}
          
          {/* Distraction Button */}
          {(isActive || isPaused) && (
            <motion.button
              onClick={addDistraction}
              className="px-4 py-3 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-semibold shadow-lg border border-rose-400 flex items-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-lg">💥</span>
              {distractions}
            </motion.button>
          )}
        </div>

        {/* Reset Button */}
        {(isActive || isPaused) && (
          <motion.button
            onClick={resetTimer}
            className="w-full py-2 bg-slate-700 hover:bg-slate-800 text-white/90 rounded-lg font-medium shadow border border-slate-600 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <span>🔄</span>
            Reset Session
          </motion.button>
        )}
      </div>

      {/* Progress Info */}
      <div className="text-center text-slate-300 text-sm mt-4 space-y-1">
        <div>⏱️ {Math.floor((totalDuration - timeLeft) / 60)}m {((totalDuration - timeLeft) % 60)}s of focus</div>
        {distractions > 0 && <div>💥 {distractions} moment{distractions > 1 ? 's' : ''} of distraction</div>}
        <div>🎯 {Math.round(sandFillPercentage)}% of journey complete</div>
        {timeLeft <= 30 && timeLeft > 0 && (
          <motion.div 
            className="text-amber-300 font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            ⚡ Final stretch! Almost there!
          </motion.div>
        )}
        {timeLeft === 0 && (
          <motion.div 
            className="text-green-300 font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            🏆 Journey complete! You did it!
          </motion.div>
        )}
      </div>
    </div>
  );
}