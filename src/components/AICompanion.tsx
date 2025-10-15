'use client';

import { useAutonomousCompanion } from '@/hooks/useAutonomousCompanion';
import { useTrustMetrics } from '@/hooks/useTrustMetrics';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AICompanionProps {
  onSuggestion?: (suggestion: string) => void;
}

export function AICompanion({ onSuggestion }: AICompanionProps) {
  const { trustMetrics, getPersonalizedMessage, trackSuggestion } = useTrustMetrics();
  const { suggestions, patterns, hasData } = useAutonomousCompanion();
  
  const [isVisible, setIsVisible] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [mood, setMood] = useState<'neutral' | 'happy' | 'excited' | 'thoughtful'>('neutral');
  const [showAutonomousSuggestions, setShowAutonomousSuggestions] = useState(true);
  const [currentSuggestionIndex, setCurrentSuggestionIndex] = useState(0);

  // Initial greeting
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setMood('happy');
      
      if (hasData) {
        setCurrentMessage(getPersonalizedMessage("Welcome back! I've been learning your work patterns. Ready to be productive?"));
      } else {
        setCurrentMessage(getPersonalizedMessage("Welcome to Amvora! I'll help you stay focused and organized. Let's get started!"));
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [hasData, getPersonalizedMessage]);

  // Rotate through autonomous suggestions
  useEffect(() => {
    if (showAutonomousSuggestions && suggestions.length > 0 && !currentMessage.includes('?')) {
      const interval = setInterval(() => {
        if (suggestions.length > 0) {
          const nextIndex = (currentSuggestionIndex + 1) % suggestions.length;
          setCurrentSuggestionIndex(nextIndex);
          setCurrentMessage(getPersonalizedMessage(suggestions[nextIndex]));
          setMood('thoughtful');
        }
      }, 15000); // Rotate every 15 seconds

      return () => clearInterval(interval);
    }
  }, [suggestions, currentSuggestionIndex, showAutonomousSuggestions, currentMessage, getPersonalizedMessage]);

  // Show first suggestion when available
  useEffect(() => {
    if (suggestions.length > 0 && showAutonomousSuggestions && !currentMessage.includes('?')) {
      setCurrentMessage(getPersonalizedMessage(suggestions[0]));
      setMood('thoughtful');
    }
  }, [suggestions, showAutonomousSuggestions, currentMessage, getPersonalizedMessage]);

  const handleAcceptSuggestion = () => {
    trackSuggestion.mutate({ accepted: true, suggestionType: 'autonomous_suggestion' });
    setMood('excited');
    setCurrentMessage(getPersonalizedMessage("Awesome! Let's make it happen!"));
    setShowAutonomousSuggestions(false);
    
    // Resume autonomous suggestions after 2 minutes
    setTimeout(() => {
      setShowAutonomousSuggestions(true);
    }, 120000);
  };

  const handleDeclineSuggestion = () => {
    trackSuggestion.mutate({ accepted: false, suggestionType: 'autonomous_suggestion' });
    setMood('neutral');
    setCurrentMessage(getPersonalizedMessage("No problem! I'll come up with something better."));
    setShowAutonomousSuggestions(false);
    
    // Resume autonomous suggestions after 1 minute
    setTimeout(() => {
      setShowAutonomousSuggestions(true);
    }, 60000);
  };

  const handleManualSuggestion = () => {
    if (suggestions.length > 0) {
      const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
      setCurrentMessage(getPersonalizedMessage(randomSuggestion));
      setMood('thoughtful');
    } else {
      setCurrentMessage(getPersonalizedMessage("How about starting with a 25-minute focus session?"));
    }
  };

  // Brand "A" animation variants
  const avatarVariants = {
    neutral: { scale: 1, rotate: 0 },
    happy: { 
      scale: [1, 1.1, 1],
      rotate: [0, -5, 5, 0],
      transition: { duration: 2, repeat: Infinity }
    },
    excited: { 
      scale: [1, 1.2, 1],
      transition: { duration: 1, repeat: Infinity }
    },
    thoughtful: {
      scale: 1,
      rotate: 0,
      opacity: 0.8
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="bg-gradient-to-br from-purple-600 to-blue-700 rounded-2xl p-4 shadow-2xl border border-white/20 max-w-sm">
        {/* Companion Avatar with Brand "A" */}
        <div className="flex items-start gap-3 mb-3">
          <motion.div
            className="relative w-12 h-12 bg-gradient-to-br from-teal-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg overflow-hidden"
            variants={avatarVariants}
            animate={mood}
          >
            {/* Floating particles background */}
            <div className="absolute inset-0">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full"
                  animate={{
                    x: [0, 10, -10, 0],
                    y: [0, -8, 8, 0],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    delay: i * 0.5
                  }}
                  style={{
                    left: `${20 + i * 15}%`,
                    top: `${30 + i * 20}%`,
                  }}
                />
              ))}
            </div>
            
            {/* Brand "A" Logo */}
            <motion.div
              className="relative z-10 text-white font-bold text-lg"
              animate={{
                scale: mood === 'excited' ? [1, 1.1, 1] : 1,
              }}
              transition={{ duration: 0.5 }}
            >
              A
            </motion.div>
          </motion.div>
          
          <div className="flex-1">
            <div className="text-white font-semibold">Amvora Companion</div>
            <div className="text-white/80 text-sm mt-1">
              {trustMetrics?.trust_score ? `Learning your patterns • ${trustMetrics.trust_score}% trust` : 'Learning your patterns...'}
            </div>
          </div>
        </div>

        {/* Message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-white/90 text-sm mb-3 bg-white/10 rounded-lg p-3 min-h-[60px] flex items-center"
          >
            {currentMessage}
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleManualSuggestion}
            className="flex-1 px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span>💡</span>
            Suggest
          </button>
          
          {currentMessage.includes('?') && (
            <>
              <button
                onClick={handleAcceptSuggestion}
                className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                ✅
              </button>
              <button
                onClick={handleDeclineSuggestion}
                className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                ❌
              </button>
            </>
          )}
        </div>

        {/* Trust Indicator */}
        {trustMetrics && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-white/60 mb-1">
              <span>Understanding You</span>
              <span>{trustMetrics.trust_score}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-green-400 to-teal-400 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${trustMetrics.trust_score}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}