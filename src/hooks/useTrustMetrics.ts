import { supabase } from '@/lib/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

export interface TrustMetric {
  id: string;
  user_id: string;
  suggestion_acceptance_rate: number;
  preferred_session_length: number;
  best_focus_times: string[]; // ['morning', 'afternoon', 'evening']
  disliked_features: string[];
  communication_style: 'direct' | 'encouraging' | 'analytical' | 'casual';
  trust_score: number; // 0-100
  learning_rate: number; // How quickly user preferences change
  created_at: string;
  updated_at: string;
}

export interface UserPreference {
  feature: string;
  preference: 'like' | 'dislike' | 'neutral';
  strength: number; // 0-100
  last_interaction: string;
}

export function useTrustMetrics() {
  const queryClient = useQueryClient();
  const [preferences, setPreferences] = useState<UserPreference[]>([]);

  // Get trust metrics for current user
  const { data: trustMetrics, isLoading } = useQuery({
    queryKey: ['trust-metrics'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('trust_metrics')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
        throw error;
      }
      
      return data as TrustMetric | null;
    },
  });

  // Initialize trust metrics if they don't exist
  const initializeTrustMetrics = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const defaultMetrics: Partial<TrustMetric> = {
        user_id: user.id,
        suggestion_acceptance_rate: 50, // Start neutral
        preferred_session_length: 25,
        best_focus_times: ['morning'],
        disliked_features: [],
        communication_style: 'encouraging',
        trust_score: 50,
        learning_rate: 10,
      };

      const { data, error } = await supabase
        .from('trust_metrics')
        .insert([defaultMetrics])
        .select()
        .single();

      if (error) throw error;
      return data as TrustMetric;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trust-metrics'] });
    },
  });

  // Track suggestion acceptance
  const trackSuggestion = useMutation({
    mutationFn: async ({ accepted, suggestionType }: { accepted: boolean; suggestionType: string }) => {
      if (!trustMetrics) {
        await initializeTrustMetrics.mutateAsync();
        return;
      }

      const newAcceptanceRate = calculateNewAcceptanceRate(
        trustMetrics.suggestion_acceptance_rate,
        accepted
      );

      const { data, error } = await supabase
        .from('trust_metrics')
        .update({
          suggestion_acceptance_rate: newAcceptanceRate,
          trust_score: calculateTrustScore(newAcceptanceRate),
          updated_at: new Date().toISOString(),
        })
        .eq('id', trustMetrics.id)
        .select()
        .single();

      if (error) throw error;
      return data as TrustMetric;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trust-metrics'] });
    },
  });

  // Update user preferences
  const updatePreference = useMutation({
    mutationFn: async ({ feature, preference }: { feature: string; preference: 'like' | 'dislike' | 'neutral' }) => {
      const newPreferences = [...preferences];
      const existingIndex = newPreferences.findIndex(p => p.feature === feature);
      
      if (existingIndex >= 0) {
        newPreferences[existingIndex] = {
          ...newPreferences[existingIndex],
          preference,
          strength: Math.min(100, newPreferences[existingIndex].strength + 20),
          last_interaction: new Date().toISOString(),
        };
      } else {
        newPreferences.push({
          feature,
          preference,
          strength: 30,
          last_interaction: new Date().toISOString(),
        });
      }

      setPreferences(newPreferences);
      
      // Also update in database if trust metrics exist
      if (trustMetrics) {
        const dislikedFeatures = newPreferences
          .filter(p => p.preference === 'dislike' && p.strength > 50)
          .map(p => p.feature);

        await supabase
          .from('trust_metrics')
          .update({
            disliked_features: dislikedFeatures,
            updated_at: new Date().toISOString(),
          })
          .eq('id', trustMetrics.id);
      }

      return newPreferences;
    },
  });

  // Get personalized message based on trust level and style
  const getPersonalizedMessage = (baseMessage: string, context: string = 'general') => {
    if (!trustMetrics) return baseMessage;

    const style = trustMetrics.communication_style;
    const trustLevel = trustMetrics.trust_score;

    // Adjust message based on communication style
    let styledMessage = baseMessage;
    switch (style) {
      case 'direct':
        styledMessage = baseMessage.replace(/!/g, '.').replace(/\b(amazing|awesome|great)\b/gi, 'good');
        break;
      case 'analytical':
        styledMessage = `Based on your patterns: ${baseMessage.toLowerCase()}`;
        break;
      case 'casual':
        styledMessage = `Hey! ${baseMessage} 😊`;
        break;
      case 'encouraging':
      default:
        styledMessage = `Great job! ${baseMessage} 🎉`;
        break;
    }

    // Adjust enthusiasm based on trust level
    if (trustLevel > 80) {
      // High trust - more personalized
      const personalTouches = [
        " I've noticed you're really consistent with this!",
        " This aligns perfectly with your usual patterns.",
        " You've been crushing it lately!",
      ];
      styledMessage += personalTouches[Math.floor(Math.random() * personalTouches.length)];
    } else if (trustLevel < 30) {
      // Low trust - more gentle
      styledMessage = styledMessage.replace(/!/g, '.');
      styledMessage = styledMessage.replace(/\b(crushing|killing|dominating)\b/gi, 'working on');
    }

    return styledMessage;
  };

  // Initialize on mount if needed
  useEffect(() => {
    if (!trustMetrics && !isLoading) {
      initializeTrustMetrics.mutate();
    }
  }, [trustMetrics, isLoading]);

  return {
    trustMetrics: trustMetrics || null,
    isLoading,
    preferences,
    trackSuggestion,
    updatePreference,
    getPersonalizedMessage,
    initializeTrustMetrics,
  };
}

// Helper functions
function calculateNewAcceptanceRate(currentRate: number, accepted: boolean): number {
  const change = accepted ? 5 : -5; // Adjust this based on how quickly you want learning to happen
  return Math.max(0, Math.min(100, currentRate + change));
}

function calculateTrustScore(acceptanceRate: number): number {
  // Trust score is primarily based on acceptance rate, but could include other factors
  return Math.max(10, Math.min(100, acceptanceRate));
}