'use client';

import { useFocusSessions } from '@/hooks/useFocusSessions';
import { useNotes } from '@/hooks/useNotes';
import { motion } from 'framer-motion';
import {
    Activity,
    Award,
    BarChart3,
    Brain, Calendar,
    Clock,
    PieChart as PieChartIcon,
    Target, TrendingUp,
    Zap
} from 'lucide-react';
import { useState } from 'react';

const glassStyle = {
  background: 'rgba(45, 25, 80, 0.25)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37), inset 0 0 0 1px rgba(255, 255, 255, 0.1)'
};

// Helper functions
const getDateRange = (range: 'week' | 'month' | 'all') => {
  const now = new Date();
  switch (range) {
    case 'week':
      return new Date(now.setDate(now.getDate() - 7)).toISOString();
    case 'month':
      return new Date(now.setDate(now.getDate() - 30)).toISOString();
    default:
      return new Date(2020, 0, 1).toISOString(); // All time
  }
};

const groupSessionsByDay = (sessions: any[]) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayMap: { [key: string]: number } = {};
  
  sessions.forEach(session => {
    const day = new Date(session.started_at).getDay();
    const dayName = days[day];
    dayMap[dayName] = (dayMap[dayName] || 0) + session.duration_minutes;
  });
  
  return days.map(day => ({
    day,
    minutes: dayMap[day] || 0
  }));
};

const findBestFocusDay = (sessions: any[]) => {
  if (sessions.length === 0) return 'Monday';
  
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCount: { [key: string]: number } = {};
  
  sessions.forEach(session => {
    const day = days[new Date(session.started_at).getDay()];
    dayCount[day] = (dayCount[day] || 0) + 1;
  });
  
  return Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Monday';
};

const isThisWeek = (date: Date) => {
  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  return date >= startOfWeek;
};

// Types
interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change: string;
  color: string;
}

interface InsightItemProps {
  icon: React.ReactNode;
  text: string;
  type: 'positive' | 'neutral' | 'suggestion';
}

interface ActivityItemProps {
  session: any;
}

// Metric Card Component
function MetricCard({ icon, title, value, change, color }: MetricCardProps) {
  return (
    <motion.div 
      style={glassStyle}
      className="p-6 rounded-2xl"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-purple-200 text-sm">{title}</p>
          <p className={`text-2xl font-bold ${color} mt-1`}>{value}</p>
          <p className="text-green-400 text-xs mt-1">{change}</p>
        </div>
        <div className={`p-3 rounded-xl bg-white/10 ${color}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

// Insight Item Component
function InsightItem({ icon, text, type }: InsightItemProps) {
  const typeColors = {
    positive: 'text-green-400',
    neutral: 'text-blue-400',
    suggestion: 'text-purple-400'
  };
  
  const color = typeColors[type]; // TypeScript now knows this is safe
  
  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
      <div className={`p-2 rounded-lg bg-white/10 ${color}`}>
        {icon}
      </div>
      <p className="text-white text-sm">{text}</p>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ session }: ActivityItemProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
      <div>
        <p className="text-white font-medium">{session.title}</p>
        <p className="text-purple-200 text-sm">
          {session.duration_minutes}min • {session.focus_score}% focus
        </p>
      </div>
      <div className="text-right">
        <p className="text-purple-200 text-sm">{formatTime(session.completed_at)}</p>
        <p className="text-teal-400 text-xs">{session.distractions} distractions</p>
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { sessions } = useFocusSessions();
  const { notes } = useNotes();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week');

// Calculate real analytics data - USE ACTUAL MINUTES
const completedSessions = sessions.filter(session => session.completed);
const totalSessions = completedSessions.length;
  
  // Weekly focus data
  const weeklyFocusData = groupSessionsByDay(
    completedSessions.filter(session => 
      new Date(session.started_at) >= new Date(getDateRange(timeRange))
    )
  );

  // Key metrics
const totalFocusTime = completedSessions.reduce((total, session) => 
  total + (session.actual_minutes || session.duration_minutes), 0);
  const averageScore = completedSessions.length > 0 
  ? Math.round(completedSessions.reduce((total, session) => total + (session.focus_score || 0), 0) / completedSessions.length)
  : 0;
  const todayDistractions = completedSessions
  .filter(session => new Date(session.started_at).toDateString() === new Date().toDateString())
  .reduce((total, session) => total + session.distractions, 0);
  const averageSessionTime = completedSessions.length > 0 
  ? Math.round(totalFocusTime / completedSessions.length)
  : 0;

  const sessionsThisWeek = completedSessions.filter(session => 
    isThisWeek(new Date(session.started_at))
  ).length;

  const bestDay = findBestFocusDay(completedSessions);
  const averageSessionLength = completedSessions.length > 0 
    ? Math.round(totalFocusTime / completedSessions.length)
    : 0;

  // Simple score distribution
  const scoreDistribution = [
    { name: '90-100%', value: completedSessions.filter(s => (s.focus_score || 0) >= 90).length },
    { name: '70-89%', value: completedSessions.filter(s => (s.focus_score || 0) >= 70 && (s.focus_score || 0) < 90).length },
    { name: '<70%', value: completedSessions.filter(s => (s.focus_score || 0) < 70).length }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Productivity Analytics</h1>
            <p className="text-purple-200">Deep insights into your focus patterns and productivity</p>
          </div>
          <div className="flex gap-2">
            {['week', 'month', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-4 py-2 rounded-lg transition ${
                  timeRange === range 
                    ? 'bg-teal-500 text-white' 
                    : 'bg-white/10 text-purple-200 hover:bg-white/20'
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            icon={<Zap className="w-8 h-8" />}
            title="Focus Sessions"
            value={completedSessions.length}
            change="+12%"
            color="text-orange-400"
          />
          <MetricCard
            icon={<Clock className="w-8 h-8" />}
            title="Total Focus Time"
            value={`${Math.round(totalFocusTime / 60)}h`}
            change="+8%"
            color="text-teal-400"
          />
          <MetricCard
            icon={<Target className="w-8 h-8" />}
            title="Average Score"
            value={`${averageScore}%`}
            change="+5%"
            color="text-purple-400"
          />
          <MetricCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="This Week"
            value={sessionsThisWeek}
            change="+2"
            color="text-green-400"
          />
        </div>

        {/* Charts Grid - SIMPLIFIED WITHOUT RECHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Focus Time Chart */}
          <div style={glassStyle} className="p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-6 h-6 text-teal-400" />
              <h3 className="text-white font-semibold text-lg">Daily Focus Time (Minutes)</h3>
            </div>
            <div className="space-y-2">
              {weeklyFocusData.map((dayData) => (
                <div key={dayData.day} className="flex items-center justify-between">
                  <span className="text-purple-200 text-sm w-12">{dayData.day}</span>
                  <div className="flex-1 mx-4">
                    <div 
                      className="bg-teal-500 rounded-full h-4 transition-all duration-500"
                      style={{ width: `${Math.min(100, (dayData.minutes / 60) * 100)}%` }}
                    />
                  </div>
                  <span className="text-white text-sm w-12 text-right">{dayData.minutes}m</span>
                </div>
              ))}
            </div>
          </div>

          {/* Focus Score Distribution */}
          <div style={glassStyle} className="p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <PieChartIcon className="w-6 h-6 text-purple-400" />
              <h3 className="text-white font-semibold text-lg">Focus Score Distribution</h3>
            </div>
            <div className="space-y-3">
              {scoreDistribution.map((item, index) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="text-purple-200 text-sm">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-teal-500 rounded-full h-2 transition-all duration-500"
                        style={{ 
                          width: `${completedSessions.length > 0 ? (item.value / completedSessions.length) * 100 : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-white text-sm w-8">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div style={glassStyle} className="p-6 rounded-2xl mb-8">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="w-6 h-6 text-teal-400" />
            <h3 className="text-white font-semibold text-lg">AI Insights & Recommendations</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pattern Insights */}
            <div>
              <h4 className="text-white font-semibold mb-4">Your Patterns</h4>
              <div className="space-y-3">
                <InsightItem
                  icon={<Calendar className="w-4 h-4" />}
                  text={`Your best focus day is ${bestDay}`}
                  type="positive"
                />
                <InsightItem
                  icon={<Clock className="w-4 h-4" />}
                  text={`Average session: ${averageSessionLength} minutes`}
                  type="neutral"
                />
                <InsightItem
                  icon={<Activity className="w-4 h-4" />}
                  text={`${completedSessions.length} sessions completed total`}
                  type="positive"
                />
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="text-white font-semibold mb-4">Recommendations</h4>
              <div className="space-y-3">
                <InsightItem
                  icon={<Target className="w-4 h-4" />}
                  text="Try 50-minute sessions for deeper focus"
                  type="suggestion"
                />
                <InsightItem
                  icon={<Award className="w-4 h-4" />}
                  text="You're building great focus habits!"
                  type="positive"
                />
                <InsightItem
                  icon={<Zap className="w-4 h-4" />}
                  text="Schedule focus time based on your best days"
                  type="suggestion"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={glassStyle} className="p-6 rounded-2xl">
          <h3 className="text-white font-semibold text-lg mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {completedSessions.slice(0, 5).map((session) => (
              <ActivityItem key={session.id} session={session} />
            ))}
            {completedSessions.length === 0 && (
              <p className="text-purple-200 text-center py-4">No focus sessions completed yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}