'use client';

import { AICompanion } from '@/components/AICompanion';
import { HourglassTimer } from '@/components/HourglassTimer';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useTimer } from '@/contexts/TimerContext';
import { useFocusSessions } from '@/hooks/useFocusSessions';
import { useNotes } from '@/hooks/useNotes';
import { supabase } from '@/lib/supabase';
import { AnimatePresence, motion } from 'framer-motion';
import { BarChart3, Clock, Edit3, FileText, Plus, Sparkles, Tag, Target, Trash2, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Updated glass style with your colors
const glassStyle = {
  background: 'rgba(12, 4, 32, 0.4)', // #0C0420 with opacity
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(159, 100, 150, 0.2)', // #9F6496 with opacity
  boxShadow: '0 8px 32px 0 rgba(93, 60, 100, 0.2), inset 0 0 0 1px rgba(255, 255, 255, 0.05)'
};

// Glowing button style
const glowButtonStyle = {
  background: 'linear-gradient(135deg, hsl(292 36% 50% / 0.9), hsl(330 45% 67% / 0.7))',
  boxShadow: '0 0 20px hsl(292 36% 50% / 0.5), 0 0 40px hsl(292 36% 50% / 0.3)',
  backdropFilter: 'blur(10px)',
  border: '1px solid hsl(292 36% 50% / 0.3)'
};

function calculateFocusScore(distractions: number, actualMinutes: number): number {
  let baseScore = 100;
  baseScore -= distractions * 8;
  if (actualMinutes >= 45) baseScore += 10;
  else if (actualMinutes >= 30) baseScore += 5;
  else if (actualMinutes >= 15) baseScore += 2;
  return Math.max(50, Math.min(100, baseScore));
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateNote, setShowCreateNote] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [editingNote, setEditingNote] = useState<any>(null);
  const router = useRouter();
  
  const { notes, isLoading, createNote, updateNote, deleteNote, summarizeNote, generateTags } = useNotes();
  const { sessions, startSession, completeSession } = useFocusSessions();
  const { timeLeft, isActive, isPaused, distractions } = useTimer();

  const completedSessions = sessions.filter(session => session.completed);
  const totalSessions = completedSessions.length;
  const totalFocusTime = completedSessions.reduce((total, session) => 
    total + (session.actual_minutes || session.duration_minutes || 0), 0);
  const averageScore = completedSessions.length > 0 
    ? Math.round(completedSessions.reduce((total, session) => total + (session.focus_score || 0), 0) / completedSessions.length)
    : 0;
  const todayDistractions = completedSessions
    .filter(session => new Date(session.started_at).toDateString() === new Date().toDateString())
    .reduce((total, session) => total + (session.distractions || 0), 0);
  const averageSessionTime = completedSessions.length > 0 
    ? Math.round(totalFocusTime / completedSessions.length)
    : 0;
  const totalDistractions = completedSessions.reduce((total, session) => 
    total + (session.distractions || 0), 0);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }
      setUser(user);
      setLoading(false);
    };
    
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleCreateNote = async () => {
    if (!newNote.title.trim()) return;
    
    try {
      await createNote.mutateAsync(newNote);
      setNewNote({ title: '', content: '' });
      setShowCreateNote(false);
    } catch (error: any) {
      console.error('Error creating note:', error);
      alert('Failed to create note: ' + (error.message || 'Unknown error'));
    }
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
  };

  const handleUpdateNote = async () => {
    if (!editingNote?.title.trim()) return;
    
    try {
      await updateNote.mutateAsync(editingNote);
      setEditingNote(null);
    } catch (error: any) {
      console.error('Error updating note:', error);
      alert('Failed to update note: ' + error.message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0C0420] via-[#5D3C64] to-[#7B466A]">
      {/* Header */}
      <header style={glassStyle} className="border-b border-[#9F6496]/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white glow-text">Amvora</h1>
          <div className="flex items-center gap-4">
            <span className="text-[#D391B0]">Welcome, {user?.email}</span>
            
            {/* Active Timer Indicator */}
            {(isActive || isPaused) && (
              <div className="flex items-center gap-2 px-3 py-1 bg-[#BAGE8F]/20 border border-[#BAGE8F]/30 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[#BAGE8F] animate-pulse' : 'bg-[#D391B0]'}`}></div>
                <span className="text-[#BAGE8F] text-sm">
                  {isActive ? 'Focusing' : 'Paused'} - {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
            
            {/* ANALYTICS BUTTON */}
            <button
              onClick={() => router.push('/analytics')}
              style={glowButtonStyle}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:shadow-lg hover:shadow-[#9F6496]/30 transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </button>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            style={glassStyle}
            className="p-6 rounded-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-[#BAGE8F] mr-3" />
              <div>
                <h3 className="text-white font-semibold">Total Notes</h3>
                <p className="text-3xl text-[#BAGE8F] font-bold">{notes.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            style={glassStyle}
            className="p-6 rounded-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-[#D391B0] mr-3" />
              <div>
                <h3 className="text-white font-semibold">Today</h3>
                <p className="text-3xl text-[#D391B0] font-bold">
                  {notes.filter(note => 
                    new Date(note.created_at).toDateString() === new Date().toDateString()
                  ).length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            style={glassStyle}
            className="p-6 rounded-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center">
              <Zap className="w-8 h-8 text-[#9F6496] mr-3" />
              <div>
                <h3 className="text-white font-semibold">Focus Sessions</h3>
                <p className="text-3xl text-[#9F6496] font-bold">{totalSessions}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            style={glassStyle}
            className="p-6 rounded-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <button 
              onClick={() => setShowCreateNote(true)}
              className="w-full flex items-center justify-center p-4 border-2 border-dashed border-[#9F6496]/30 rounded-xl hover:border-[#9F6496]/50 transition group"
            >
              <Plus className="w-8 h-8 text-[#9F6496] group-hover:rotate-90 transition-transform" />
              <span className="text-[#9F6496] font-semibold ml-2">New Note</span>
            </button>
          </motion.div>
        </div>

        {/* Focus Sessions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* HOURGLASS TIMER */}
          <HourglassTimer />

          {/* Focus Stats */}
          <div style={glassStyle} className="p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-6 h-6 text-[#BAGE8F]" />
              <h3 className="text-white font-semibold text-lg">Focus Analytics</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#D391B0]">Sessions Completed</span>
                <span className="text-white font-semibold">{totalSessions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#D391B0]">Total Focus Time</span>
                <span className="text-white font-semibold">{totalFocusTime}m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#D391B0]">Avg Session Time</span>
                <span className="text-[#BAGE8F] font-semibold">
                  {averageSessionTime > 0 ? `${averageSessionTime}m` : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#D391B0]">Average Focus Score</span>
                <span className="text-[#BAGE8F] font-semibold">
                  {averageScore > 0 ? `${averageScore}%` : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#D391B0]">Total Distractions</span>
                <span className="text-white font-semibold">{totalDistractions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#D391B0]">Today's Distractions</span>
                <span className="text-white font-semibold">{todayDistractions}</span>
              </div>
            </div>

            <div className="mt-6 p-3 bg-[#BAGE8F]/10 border border-[#BAGE8F]/20 rounded-lg">
              <p className="text-[#BAGE8F] text-sm font-medium">
                {totalSessions > 0 ? `Real Progress! 🚀` : 'Ready to focus? 🚀'}
              </p>
              <p className="text-[#BAGE8F]/80 text-xs mt-1">
                {totalSessions > 0 
                  ? `You've focused for ${totalFocusTime} minutes across ${totalSessions} sessions.`
                  : 'Start a focus session to begin tracking your productivity.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {notes.map((note, index) => (
              <motion.div
                key={note.id}
                style={glassStyle}
                className="p-6 rounded-2xl group hover:border-[#9F6496]/30 border border-white/10 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-white font-semibold text-lg line-clamp-2">
                    {note.title}
                  </h3>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button 
                      onClick={() => summarizeNote.mutate({ id: note.id, content: note.content })}
                      disabled={summarizeNote.isPending}
                      className="p-1 hover:bg-white/10 rounded disabled:opacity-50"
                      title="AI Summarize"
                    >
                      <Sparkles className="w-4 h-4 text-[#BAGE8F]" />
                    </button>
                    
                    <button 
                      onClick={() => generateTags.mutate({ id: note.id, content: note.content })}
                      disabled={generateTags.isPending}
                      className="p-1 hover:bg-white/10 rounded disabled:opacity-50"
                      title="AI Generate Tags"
                    >
                      <Tag className="w-4 h-4 text-[#D391B0]" />
                    </button>
                    
                    <button 
                      onClick={() => handleEditNote(note)}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <Edit3 className="w-4 h-4 text-[#D391B0]" />
                    </button>
                    <button 
                      onClick={() => deleteNote.mutate(note.id)}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                
                <p className="text-[#D391B0]/80 text-sm line-clamp-3 mb-3">
                  {note.content || 'No content yet...'}
                </p>

                {note.summary && (
                  <div className="mb-3 p-2 bg-[#BAGE8F]/10 border border-[#BAGE8F]/20 rounded-lg">
                    <p className="text-[#BAGE8F] text-xs font-medium">🤖 AI Summary</p>
                    <p className="text-[#BAGE8F]/80 text-xs mt-1 whitespace-pre-wrap break-words">
                      {note.summary}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-xs text-[#D391B0]/60">
                  <span>{formatDate(note.created_at)}</span>
                  
                  {note.tags && note.tags.length > 0 ? (
                    <div className="flex gap-1">
                      {note.tags.slice(0, 2).map((tag, tagIndex) => (
                        <span key={tagIndex} className="bg-[#9F6496]/20 px-1 rounded text-[#D391B0]">
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span>+{note.tags.length - 2}</span>
                      )}
                    </div>
                  ) : (
                    <span>No tags</span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {notes.length === 0 && !isLoading && (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FileText className="w-16 h-16 text-[#9F6496]/40 mx-auto mb-4" />
            <h3 className="text-white text-xl mb-2">No notes yet</h3>
            <p className="text-[#D391B0]/80 mb-6">Create your first note to get started</p>
            <button
              onClick={() => setShowCreateNote(true)}
              style={glowButtonStyle}
              className="px-6 py-3 text-white rounded-lg hover:shadow-lg hover:shadow-[#9F6496]/30 transition-all"
            >
              Create Your First Note
            </button>
          </motion.div>
        )}

        {/* Create Note Modal */}
        <AnimatePresence>
          {showCreateNote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setShowCreateNote(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={glassStyle}
                className="p-6 rounded-2xl w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-white mb-4">Create New Note</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Note title..."
                    value={newNote.title}
                    onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-[#9F6496]/20 rounded-xl text-white placeholder-[#D391B0]/60 focus:outline-none focus:ring-2 focus:ring-[#9F6496]/50"
                    autoFocus
                  />
                  <textarea
                    placeholder="Start writing your thoughts..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-[#9F6496]/20 rounded-xl text-white placeholder-[#D391B0]/60 focus:outline-none focus:ring-2 focus:ring-[#9F6496]/50 resize-none"
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowCreateNote(false)}
                      className="px-4 py-2 text-[#D391B0] hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateNote}
                      disabled={!newNote.title.trim() || createNote.isPending}
                      style={glowButtonStyle}
                      className="px-6 py-2 text-white rounded-lg hover:shadow-lg hover:shadow-[#9F6496]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createNote.isPending ? 'Creating...' : 'Create Note'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Edit Note Modal */}
        <AnimatePresence>
          {editingNote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setEditingNote(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={glassStyle}
                className="p-6 rounded-2xl w-full max-w-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold text-white mb-4">Edit Note</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Note title..."
                    value={editingNote.title}
                    onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
                    className="w-full px-4 py-3 bg-white/5 border border-[#9F6496]/20 rounded-xl text-white placeholder-[#D391B0]/60 focus:outline-none focus:ring-2 focus:ring-[#9F6496]/50"
                    autoFocus
                  />
                  <textarea
                    placeholder="Note content..."
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-[#9F6496]/20 rounded-xl text-white placeholder-[#D391B0]/60 focus:outline-none focus:ring-2 focus:ring-[#9F6496]/50 resize-none"
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setEditingNote(null)}
                      className="px-4 py-2 text-[#D391B0] hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateNote}
                      disabled={!editingNote.title.trim() || updateNote.isPending}
                      style={glowButtonStyle}
                      className="px-6 py-2 text-white rounded-lg hover:shadow-lg hover:shadow-[#9F6496]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updateNote.isPending ? 'Updating...' : 'Update Note'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Companion */}
      <AICompanion onSuggestion={(suggestion) => {
        console.log('AI Suggestion:', suggestion);
      }} />
    </div>
  );
}