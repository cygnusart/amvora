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

// Add this CSS to your globals.css or use inline styles
const glassStyle = {
  background: 'rgba(45, 25, 80, 0.25)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
};

// Helper function for focus score calculation
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

  // Calculate real analytics data - USING ACTUAL MINUTES
  const completedSessions = sessions.filter(session => session.completed);
  const totalSessions = completedSessions.length;
  
  // USE actual_minutes INSTEAD OF duration_minutes for real focus time
  const totalFocusTime = completedSessions.reduce((total, session) => 
    total + (session.actual_minutes || session.duration_minutes || 0), 0);

  const averageScore = completedSessions.length > 0 
    ? Math.round(completedSessions.reduce((total, session) => total + (session.focus_score || 0), 0) / completedSessions.length)
    : 0;

  const todayDistractions = completedSessions
    .filter(session => new Date(session.started_at).toDateString() === new Date().toDateString())
    .reduce((total, session) => total + (session.distractions || 0), 0);

  // ADD average actual session time
  const averageSessionTime = completedSessions.length > 0 
    ? Math.round(totalFocusTime / completedSessions.length)
    : 0;

  // Total distractions across all sessions
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header */}
      <header style={glassStyle} className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Amvora</h1>
          <div className="flex items-center gap-4">
            <span className="text-purple-200">Welcome, {user?.email}</span>
            
            {/* Active Timer Indicator */}
            {(isActive || isPaused) && (
              <div className="flex items-center gap-2 px-3 py-1 bg-teal-500/20 border border-teal-400/30 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`}></div>
                <span className="text-teal-300 text-sm">
                  {isActive ? 'Focusing' : 'Paused'} - {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
            
            {/* ANALYTICS BUTTON */}
            <button
              onClick={() => router.push('/analytics')}
              className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
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
              <FileText className="w-8 h-8 text-teal-400 mr-3" />
              <div>
                <h3 className="text-white font-semibold">Total Notes</h3>
                <p className="text-3xl text-teal-400 font-bold">{notes.length}</p>
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
              <Clock className="w-8 h-8 text-purple-400 mr-3" />
              <div>
                <h3 className="text-white font-semibold">Today</h3>
                <p className="text-3xl text-purple-400 font-bold">
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
              <Zap className="w-8 h-8 text-orange-400 mr-3" />
              <div>
                <h3 className="text-white font-semibold">Focus Sessions</h3>
                <p className="text-3xl text-orange-400 font-bold">{totalSessions}</p>
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
              className="w-full flex items-center justify-center p-4 border-2 border-dashed border-teal-400/30 rounded-xl hover:border-teal-400/50 transition group"
            >
              <Plus className="w-8 h-8 text-teal-400 group-hover:rotate-90 transition-transform" />
              <span className="text-teal-400 font-semibold ml-2">New Note</span>
            </button>
          </motion.div>
        </div>

        {/* Focus Sessions Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* HOURGLASS TIMER */}
          <HourglassTimer />

          {/* Focus Stats - UPDATED WITH REAL DATA */}
          <div style={glassStyle} className="p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-6 h-6 text-teal-400" />
              <h3 className="text-white font-semibold text-lg">Focus Analytics</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-purple-200">Sessions Completed</span>
                <span className="text-white font-semibold">{totalSessions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-200">Total Focus Time</span>
                <span className="text-white font-semibold">{totalFocusTime}m</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-200">Avg Session Time</span>
                <span className="text-teal-400 font-semibold">
                  {averageSessionTime > 0 ? `${averageSessionTime}m` : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-200">Average Focus Score</span>
                <span className="text-teal-400 font-semibold">
                  {averageScore > 0 ? `${averageScore}%` : '-'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-200">Total Distractions</span>
                <span className="text-white font-semibold">{totalDistractions}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-200">Today's Distractions</span>
                <span className="text-white font-semibold">{todayDistractions}</span>
              </div>
            </div>

            <div className="mt-6 p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg">
              <p className="text-teal-300 text-sm font-medium">
                {totalSessions > 0 ? `Real Progress! 🚀` : 'Ready to focus? 🚀'}
              </p>
              <p className="text-teal-200/80 text-xs mt-1">
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
                className="p-6 rounded-2xl group hover:border-teal-400/30 border border-white/10 transition-all duration-300"
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
                      <Sparkles className="w-4 h-4 text-teal-400" />
                    </button>
                    
                    <button 
                      onClick={() => generateTags.mutate({ id: note.id, content: note.content })}
                      disabled={generateTags.isPending}
                      className="p-1 hover:bg-white/10 rounded disabled:opacity-50"
                      title="AI Generate Tags"
                    >
                      <Tag className="w-4 h-4 text-purple-400" />
                    </button>
                    
                    <button 
                      onClick={() => handleEditNote(note)}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <Edit3 className="w-4 h-4 text-purple-300" />
                    </button>
                    <button 
                      onClick={() => deleteNote.mutate(note.id)}
                      className="p-1 hover:bg-white/10 rounded"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                
                <p className="text-purple-200/80 text-sm line-clamp-3 mb-3">
                  {note.content || 'No content yet...'}
                </p>

                {note.summary && (
                  <div className="mb-3 p-2 bg-teal-500/10 border border-teal-500/20 rounded-lg">
                    <p className="text-teal-300 text-xs font-medium">🤖 AI Summary</p>
                    <p className="text-teal-200/80 text-xs mt-1 whitespace-pre-wrap break-words">
                      {note.summary}
                    </p>
                  </div>
                )}
                
                <div className="flex justify-between items-center text-xs text-purple-300/60">
                  <span>{formatDate(note.created_at)}</span>
                  
                  {note.tags && note.tags.length > 0 ? (
                    <div className="flex gap-1">
                      {note.tags.slice(0, 2).map((tag, tagIndex) => (
                        <span key={tagIndex} className="bg-purple-500/20 px-1 rounded text-purple-300">
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
            <FileText className="w-16 h-16 text-purple-400/40 mx-auto mb-4" />
            <h3 className="text-white text-xl mb-2">No notes yet</h3>
            <p className="text-purple-200/80 mb-6">Create your first note to get started</p>
            <button
              onClick={() => setShowCreateNote(true)}
              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    autoFocus
                  />
                  <textarea
                    placeholder="Start writing your thoughts..."
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none"
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setShowCreateNote(false)}
                      className="px-4 py-2 text-purple-200 hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateNote}
                      disabled={!newNote.title.trim() || createNote.isPending}
                      className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                    autoFocus
                  />
                  <textarea
                    placeholder="Note content..."
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                    rows={6}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none"
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => setEditingNote(null)}
                      className="px-4 py-2 text-purple-200 hover:text-white transition"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleUpdateNote}
                      disabled={!editingNote.title.trim() || updateNote.isPending}
                      className="px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* AI Companion - ADDED AT THE BOTTOM */}
      <AICompanion onSuggestion={(suggestion) => {
        console.log('AI Suggestion:', suggestion);
        // You can show this in a toast or notification later
      }} />
    </div>
  );
}