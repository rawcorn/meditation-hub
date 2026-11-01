export type Category =
  | 'All'
  | 'Physical Wellbeing'
  | 'Mental & Emotional Wellbeing'
  | 'Love & Relationships'
  | 'Financial Wellbeing'
  | 'Global Peace'
  | 'Other';

export type IntentionCategory = Exclude<Category, 'All'>;

export type SessionType = 'open' | 'scheduled';

export interface User {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  joinedAt: string;
  isCurrentUser?: boolean;
}

export interface IntentionUpdate {
  id: string;
  intentionId: string;
  authorId: string;
  authorName: string;
  date: string;
  content: string;
}

export interface SupportMessage {
  id: string;
  intentionId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  date: string;
  content: string;
  reported?: boolean;
}

export interface Intention {
  id: string;
  recipient: string;
  title: string;
  category: IntentionCategory;
  description: string;
  visualizationPrompt?: string;
  imageUrl?: string;
  sessionType: SessionType;
  scheduledAt?: string; // ISO 8601 UTC
  creatorId: string;
  creatorName: string;
  createdAt: string;
  participantCount: number; // Authentic registered count
  updates: IntentionUpdate[];
  messages: SupportMessage[];
  isSample?: boolean;
}

export interface MeditationSession {
  id: string;
  userId: string;
  intentionId?: string;
  intentionTitle?: string;
  startedAt: string;
  endedAt: string;
  activeDurationSeconds: number;
  targetDurationMinutes: number;
  completed: boolean;
  notes?: string;
}

export type NavigationTab = 'intentions' | 'discover' | 'meditate' | 'practice';

export interface ToastMessage {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'reassure';
  durationMs?: number;
}
