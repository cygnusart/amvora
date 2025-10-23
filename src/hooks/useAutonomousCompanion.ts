'use client';

import { useTimer } from '@/contexts/TimerContext';
import { useEffect, useState } from 'react';
import { useFocusSessions } from './useFocusSessions';
import { useNotes } from './useNotes';

export interface UserPatterns {
  bestFocusTimes: number[];
  optimalSessionLength: number;
  noteCreationPeakHours: number[];
  averageDistractions: number;
  focusSuccessRate: number;
  needsBreak: boolean;
  goodFocusOpportunity: boolean;
  totalCompletedSessions: number;
  totalNotes: number;
  totalSessions: number;
}

export function useAutonomousCompanion() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [patterns, setPatterns] = useState<UserPatterns | null>(null);
  
  // FIXED: Use the correct hook structure
  const { notes } = useNotes(); // This returns { notes: [], isLoading, ... }
  const { sessions } = useFocusSessions(); // This returns { sessions: [], isLoading, ... }
  const { isActive = false } = useTimer();

  // Calculate user patterns from REAL data
  const calculatePatterns = (): UserPatterns => {
    console.log('🔍 Sessions data:', sessions);
    console.log('🔍 Notes data:', notes);
    
    // Count completed sessions
    const completedSessions = sessions.filter(session => {
      return session.completed === true;
    });
    
    console.log('✅ Completed sessions:', completedSessions.length);
    console.log('📊 Total sessions:', sessions.length);

    // Best focus times
    const hourSuccess: { [key: number]: { total: number; successful: number } } = {};
    completedSessions.forEach(session => {
      try {
        const hour = new Date(session.started_at).getHours();
        const success = (session.focus_score || 0) > 70;
        
        if (!hourSuccess[hour]) {
          hourSuccess[hour] = { total: 0, successful: 0 };
        }
        hourSuccess[hour].total++;
        if (success) hourSuccess[hour].successful++;
      } catch (error) {
        console.log('Error processing session hour:', error);
      }
    });

    const bestFocusTimes = Object.entries(hourSuccess)
      .filter(([_, data]) => data.total >= 1 && data.successful / data.total > 0.6)
      .map(([hour]) => parseInt(hour))
      .sort((a, b) => a - b);

    // Optimal session length
    const durationSuccess: { [key: number]: number } = {};
    completedSessions.forEach(session => {
      try {
        const duration = session.actual_minutes || session.duration_minutes;
        const success = (session.focus_score || 0) > 70;
        if (duration) {
          durationSuccess[duration] = (durationSuccess[duration] || 0) + (success ? 1 : 0);
        }
      } catch (error) {
        console.log('Error processing session duration:', error);
      }
    });

    let optimalSessionLength = 25;
    Object.entries(durationSuccess).forEach(([duration, success]) => {
      const durationNum = parseInt(duration);
      if (success > (durationSuccess[optimalSessionLength] || 0)) {
        optimalSessionLength = durationNum;
      }
    });

    // Note creation patterns
    const noteHours: { [key: number]: number } = {};
    notes.forEach(note => {
      try {
        const hour = new Date(note.created_at).getHours();
        noteHours[hour] = (noteHours[hour] || 0) + 1;
      } catch (error) {
        console.log('Error processing note hour:', error);
      }
    });

    const noteCreationPeakHours = Object.entries(noteHours)
      .filter(([_, count]) => count >= 1)
      .map(([hour]) => parseInt(hour))
      .sort((a, b) => a - b);

    // Average distractions
    const averageDistractions = completedSessions.length > 0 
      ? completedSessions.reduce((sum, session) => sum + (session.distractions || 0), 0) / completedSessions.length
      : 0;

    // Focus success rate
    const focusSuccessRate = completedSessions.length > 0
      ? completedSessions.filter(s => (s.focus_score || 0) > 70).length / completedSessions.length
      : 0;

    // Check if break is needed (using started_at + duration instead of end_time)
    let needsBreak = false;
    if (completedSessions.length > 0) {
      try {
        const lastSession = completedSessions[completedSessions.length - 1];
        // Calculate end time from start time + duration
        const sessionEndTime = new Date(lastSession.started_at).getTime() + 
                             (lastSession.actual_minutes || lastSession.duration_minutes) * 60 * 1000;
        needsBreak = (Date.now() - sessionEndTime) > 2 * 60 * 60 * 1000; // 2 hours
      } catch (error) {
        console.log('Error calculating break time:', error);
      }
    }

    // Good focus opportunity
    const currentHour = new Date().getHours();
    const goodFocusOpportunity = bestFocusTimes.includes(currentHour) && !isActive;

    const patternsResult = {
      bestFocusTimes,
      optimalSessionLength,
      noteCreationPeakHours,
      averageDistractions,
      focusSuccessRate,
      needsBreak,
      goodFocusOpportunity,
      totalCompletedSessions: completedSessions.length,
      totalNotes: notes.length,
      totalSessions: sessions.length
    };

    console.log('📈 Calculated patterns:', patternsResult);
    return patternsResult;
  };

  // Generate intelligent suggestions
  const generateSuggestions = (patterns: UserPatterns): string[] => {
    const currentHour = new Date().getHours();
    const suggestions: string[] = [];

    console.log('💡 Generating suggestions with patterns:', patterns);

    // Session count based suggestions
    if (patterns.totalCompletedSessions === 0 && patterns.totalSessions > 0) {
      suggestions.push(`You have ${patterns.totalSessions} sessions! Complete one to see your patterns! 🎯`);
    } else if (patterns.totalCompletedSessions === 0 && patterns.totalNotes > 0) {
      suggestions.push(`I see ${patterns.totalNotes} notes! Ready for your first focus session? 🚀`);
    } else if (patterns.totalCompletedSessions === 1) {
      suggestions.push(`Great first session! Try another ${patterns.optimalSessionLength}-minute focus? ⭐`);
    } else if (patterns.totalCompletedSessions > 1) {
      suggestions.push(`Amazing! ${patterns.totalCompletedSessions} sessions completed! Keep going? 🏆`);
    }

    // Focus timing suggestions
    if (patterns.goodFocusOpportunity && patterns.totalCompletedSessions > 0) {
      suggestions.push(`It's ${currentHour}:00 - your best focus time! Perfect for ${patterns.optimalSessionLength} minutes! 🎯`);
    }

    // Break suggestions
    if (patterns.needsBreak && !isActive && patterns.totalCompletedSessions > 0) {
      suggestions.push(`You've completed ${patterns.totalCompletedSessions} sessions! Time for a break? ☕`);
    }

    // Note organization
    if (patterns.noteCreationPeakHours.includes(currentHour) && patterns.totalNotes > 0) {
      const untaggedNotes = notes.filter(note => !note.tags || note.tags.length === 0);
      if (untaggedNotes.length > 0) {
        suggestions.push(`You have ${untaggedNotes.length} untagged notes. Organize them? 🏷️`);
      }
    }

    // First session encouragement
    if (patterns.totalSessions === 0 && patterns.totalNotes === 0) {
      suggestions.push("Welcome to Amvora! Start with a focus session or create a note! 🌟");
    }

    return suggestions.slice(0, 3);
  };

// FIX THIS useEffect - add proper dependencies
useEffect(() => {
  try {
    console.log('🔄 Companion updating with sessions:', sessions.length, 'notes:', notes.length);
    const newPatterns = calculatePatterns();
    setPatterns(newPatterns);
    
    if (!isActive) {
      const newSuggestions = generateSuggestions(newPatterns);
      setSuggestions(newSuggestions);
      console.log('💬 New suggestions:', newSuggestions);
    }
  } catch (error) {
    console.log('❌ Companion analysis error:', error);
  }
}, [sessions.length, notes.length, isActive]); // FIXED: Use lengths instead of full arrays

  return { 
    suggestions, 
    patterns,
    hasData: sessions.length > 0 || notes.length > 0,
    sessionStats: {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.completed).length,
      totalNotes: notes.length
    }
  };
}