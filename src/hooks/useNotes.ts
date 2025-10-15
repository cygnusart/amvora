import { supabase } from '@/lib/supabase';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Note {
  id: string;
  title: string;
  content: string;
  summary?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export function useNotes() {
  const queryClient = useQueryClient();

  // Get all notes for current user
  const { data: notes, isLoading } = useQuery({
    queryKey: ['notes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Note[];
    },
  });

  // Create new note
  const createNote = useMutation({
    mutationFn: async (note: { title: string; content: string }) => {
      console.log('Creating note with data:', note);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const { data, error } = await supabase
        .from('notes')
        .insert([{ 
          ...note, 
          tags: [],
          user_id: user.id
        }])
        .select()
        .single();
      
      console.log('Supabase response:', { data, error });
      
      if (error) {
        console.error('Supabase error details:', error);
        throw new Error(error.message || 'Failed to create note');
      }
      
      return data as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  // Update note
  const updateNote = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Note> & { id: string }) => {
      const { data, error } = await supabase
        .from('notes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  // Delete note
  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  // AI Summarize note - FIXED IMPORT
  const summarizeNote = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      // Import with different name to avoid conflict
      const { summarizeNote: summarizeWithAI } = await import('@/lib/ai');
      const summary = await summarizeWithAI(content);
      
      const { data, error } = await supabase
        .from('notes')
        .update({ summary })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  // AI Generate tags - FIXED IMPORT
  const generateTags = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      // Import with different name to avoid conflict
      const { generateTags: generateTagsWithAI } = await import('@/lib/ai');
      const tags = await generateTagsWithAI(content);
      
      const { data, error } = await supabase
        .from('notes')
        .update({ tags })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  return {
    notes: notes || [],
    isLoading,
    createNote,
    updateNote,
    deleteNote,
    summarizeNote,
    generateTags,
  };
}