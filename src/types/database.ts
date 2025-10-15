export interface FocusSession {
  id: string;
  user_id: string;
  title: string;
  duration_minutes: number;
  actual_minutes?: number;
  completed: boolean;
  started_at: string;
  end_time?: string;
  distractions: number;
  notes?: string;
  focus_score?: number;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface TrustMetrics {
  user_id: string;
  trust_score: number;
  suggestions_accepted: number;
  suggestions_declined: number;
  total_interactions: number;
  created_at: string;
  updated_at: string;
}