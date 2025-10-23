import { supabase } from '@/lib/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

export interface FocusSession {
  id: string;
  title: string;
  duration_minutes: number;
  actual_minutes: number;
  completed: boolean;
  distractions: number;
  focus_score?: number;
  notes?: string;
  started_at: string;
  completed_at?: string;
}

export function useFocusSessions() {
  const queryClient = useQueryClient();

  // Get all focus sessions for current user
  const { data: sessions, isLoading, error } = useQuery({
    queryKey: ['focus-sessions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Return empty array if no user (instead of throwing error)
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('focus_sessions')
        .select('*')
        .order('started_at', { ascending: false });
      
      if (error) {
        console.error('Failed to fetch sessions:', error.message);
        return []; // Return empty array instead of throwing
      }
      
      return data as FocusSession[];
    },
  });

  // ADD REAL-TIME SUBSCRIPTIONS
  useEffect(() => {
    const subscription = supabase
      .channel('focus_sessions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'focus_sessions',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['focus-sessions'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  // Start new focus session
  const startSession = useMutation({
    mutationFn: async (session: { title: string; duration_minutes?: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('focus_sessions')
        .insert([{ 
          ...session, 
          user_id: user.id,
          duration_minutes: session.duration_minutes || 25,
          actual_minutes: 0,
          completed: false,
          distractions: 0
        }])
        .select()
        .single();
      
      if (error) throw new Error(`Failed to start session: ${error.message}`);
      return data as FocusSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-sessions'] });
    },
  });

  // Complete focus session
  const completeSession = useMutation({
    mutationFn: async ({ 
      id, 
      distractions, 
      notes, 
      actual_minutes 
    }: { 
      id: string; 
      distractions: number; 
      notes?: string;
      actual_minutes: number;
    }) => {
      const validatedActualMinutes = Math.max(0, actual_minutes);
      
      const { data, error } = await supabase
        .from('focus_sessions')
        .update({ 
          completed: true,
          completed_at: new Date().toISOString(),
          distractions: Math.max(0, distractions),
          notes: notes || '',
          actual_minutes: validatedActualMinutes,
          focus_score: calculateFocusScore(distractions, validatedActualMinutes)
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw new Error(`Failed to complete session: ${error.message}`);
      return data as FocusSession;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['focus-sessions'] });
    },
    onError: (error) => {
      console.error('Complete session error:', error);
    }
  });

  return {
    sessions: sessions || [],
    isLoading,
    error,
    startSession,
    completeSession,
  };
}

function calculateFocusScore(distractions: number, actualMinutes: number): number {
  let baseScore = 100;
  baseScore -= Math.min(40, distractions * 8);
  
  if (actualMinutes >= 45) baseScore += 10;
  else if (actualMinutes >= 30) baseScore += 5;
  else if (actualMinutes >= 15) baseScore += 2;
  
  return Math.max(50, Math.min(100, baseScore));
}