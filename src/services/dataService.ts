import {
  Category,
  Intention,
  IntentionCategory,
  IntentionUpdate,
  MeditationSession,
  SupportMessage,
  User,
} from '@/types';
import {
  CURRENT_USER,
  INITIAL_INTENTIONS,
  INITIAL_JOINED_INTENTION_IDS,
  INITIAL_MEDITATION_SESSIONS,
} from '@/lib/seedData';

const STORAGE_KEYS = {
  INTENTIONS: 'coherence_intentions_v1',
  JOINED_IDS: 'coherence_joined_ids_v1',
  SESSIONS: 'coherence_sessions_v1',
  USER: 'coherence_user_v1',
};

// Check whether Supabase environment variables are present
export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project.supabase.co'
  );
};

export class DataService {
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // Current User
  static getCurrentUser(): User {
    if (!this.isBrowser()) return CURRENT_USER;
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // fallback
      }
    }
    return CURRENT_USER;
  }

  static updateCurrentUser(updates: Partial<User>): User {
    const current = this.getCurrentUser();
    const updated = { ...current, ...updates };
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
    }
    return updated;
  }

  // Intentions
  static getIntentions(): Intention[] {
    if (!this.isBrowser()) return INITIAL_INTENTIONS;
    const stored = localStorage.getItem(STORAGE_KEYS.INTENTIONS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.INTENTIONS, JSON.stringify(INITIAL_INTENTIONS));
      return INITIAL_INTENTIONS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_INTENTIONS;
    }
  }

  static getFilteredIntentions(category: Category, searchQuery: string = ''): Intention[] {
    const all = this.getIntentions();
    return all.filter((item) => {
      const matchesCategory = category === 'All' || item.category === category;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.recipient.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }

  static getIntentionById(id: string): Intention | undefined {
    const all = this.getIntentions();
    return all.find((item) => item.id === id);
  }

  static createIntention(data: {
    recipient: string;
    title: string;
    category: IntentionCategory;
    description: string;
    visualizationPrompt?: string;
    imageUrl?: string;
    sessionType: 'open' | 'scheduled';
    scheduledAt?: string;
  }): Intention {
    const user = this.getCurrentUser();
    const all = this.getIntentions();

    const newIntention: Intention = {
      id: `int_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      recipient: data.recipient.trim(),
      title: data.title.trim(),
      category: data.category,
      description: data.description.trim(),
      visualizationPrompt: data.visualizationPrompt?.trim() || undefined,
      imageUrl: data.imageUrl?.trim() || undefined,
      sessionType: data.sessionType,
      scheduledAt: data.sessionType === 'scheduled' ? data.scheduledAt : undefined,
      creatorId: user.id,
      creatorName: user.name,
      createdAt: new Date().toISOString(),
      participantCount: 1, // Creator automatically sits for this intention
      updates: [],
      messages: [],
      isSample: false,
    };

    const updated = [newIntention, ...all];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.INTENTIONS, JSON.stringify(updated));
      // Automatically join newly created intention
      this.joinIntention(newIntention.id);
    }

    return newIntention;
  }

  static deleteIntention(id: string): boolean {
    const all = this.getIntentions();
    const filtered = all.filter((item) => item.id !== id);
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.INTENTIONS, JSON.stringify(filtered));
      this.leaveIntention(id);
    }
    return true;
  }

  // Participation (Join/Leave)
  static getJoinedIntentionIds(): string[] {
    if (!this.isBrowser()) return INITIAL_JOINED_INTENTION_IDS;
    const stored = localStorage.getItem(STORAGE_KEYS.JOINED_IDS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.JOINED_IDS, JSON.stringify(INITIAL_JOINED_INTENTION_IDS));
      return INITIAL_JOINED_INTENTION_IDS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_JOINED_INTENTION_IDS;
    }
  }

  static isJoined(intentionId: string): boolean {
    const joined = this.getJoinedIntentionIds();
    return joined.includes(intentionId);
  }

  static joinIntention(intentionId: string): boolean {
    const joined = this.getJoinedIntentionIds();
    if (!joined.includes(intentionId)) {
      const updated = [...joined, intentionId];
      if (this.isBrowser()) {
        localStorage.setItem(STORAGE_KEYS.JOINED_IDS, JSON.stringify(updated));
        
        // Update participant count in stored intention
        const all = this.getIntentions();
        const nextAll = all.map((item) =>
          item.id === intentionId ? { ...item, participantCount: item.participantCount + 1 } : item
        );
        localStorage.setItem(STORAGE_KEYS.INTENTIONS, JSON.stringify(nextAll));
      }
      return true;
    }
    return false;
  }

  static leaveIntention(intentionId: string): boolean {
    const joined = this.getJoinedIntentionIds();
    if (joined.includes(intentionId)) {
      const updated = joined.filter((id) => id !== intentionId);
      if (this.isBrowser()) {
        localStorage.setItem(STORAGE_KEYS.JOINED_IDS, JSON.stringify(updated));
        
        // Update participant count in stored intention
        const all = this.getIntentions();
        const nextAll = all.map((item) =>
          item.id === intentionId ? { ...item, participantCount: Math.max(0, item.participantCount - 1) } : item
        );
        localStorage.setItem(STORAGE_KEYS.INTENTIONS, JSON.stringify(nextAll));
      }
      return true;
    }
    return false;
  }

  // Updates & Journal
  static addIntentionUpdate(intentionId: string, content: string): IntentionUpdate {
    const user = this.getCurrentUser();
    const newUpdate: IntentionUpdate = {
      id: `upd_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      intentionId,
      authorId: user.id,
      authorName: user.name,
      date: new Date().toISOString(),
      content: content.trim(),
    };

    const all = this.getIntentions();
    const nextAll = all.map((item) => {
      if (item.id === intentionId) {
        return {
          ...item,
          updates: [newUpdate, ...item.updates],
        };
      }
      return item;
    });

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.INTENTIONS, JSON.stringify(nextAll));
    }
    return newUpdate;
  }

  // Supportive Messages
  static addSupportMessage(intentionId: string, content: string): SupportMessage {
    const user = this.getCurrentUser();
    const newMessage: SupportMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      intentionId,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatarUrl,
      date: new Date().toISOString(),
      content: content.trim(),
    };

    const all = this.getIntentions();
    const nextAll = all.map((item) => {
      if (item.id === intentionId) {
        return {
          ...item,
          messages: [newMessage, ...item.messages],
        };
      }
      return item;
    });

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.INTENTIONS, JSON.stringify(nextAll));
    }
    return newMessage;
  }

  static deleteSupportMessage(intentionId: string, messageId: string): boolean {
    const all = this.getIntentions();
    const nextAll = all.map((item) => {
      if (item.id === intentionId) {
        return {
          ...item,
          messages: item.messages.filter((m) => m.id !== messageId),
        };
      }
      return item;
    });

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.INTENTIONS, JSON.stringify(nextAll));
    }
    return true;
  }

  static reportSupportMessage(intentionId: string, messageId: string): boolean {
    const all = this.getIntentions();
    const nextAll = all.map((item) => {
      if (item.id === intentionId) {
        return {
          ...item,
          messages: item.messages.map((m) => (m.id === messageId ? { ...m, reported: true } : m)),
        };
      }
      return item;
    });

    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.INTENTIONS, JSON.stringify(nextAll));
    }
    return true;
  }

  // Meditation Sessions
  static getMeditationSessions(): MeditationSession[] {
    if (!this.isBrowser()) return INITIAL_MEDITATION_SESSIONS;
    const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(INITIAL_MEDITATION_SESSIONS));
      return INITIAL_MEDITATION_SESSIONS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_MEDITATION_SESSIONS;
    }
  }

  static recordMeditationSession(data: {
    intentionId?: string;
    intentionTitle?: string;
    startedAt: string;
    endedAt: string;
    activeDurationSeconds: number;
    targetDurationMinutes: number;
    completed: boolean;
  }): MeditationSession {
    const user = this.getCurrentUser();
    const all = this.getMeditationSessions();

    const newSession: MeditationSession = {
      id: `ses_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      userId: user.id,
      intentionId: data.intentionId,
      intentionTitle: data.intentionTitle,
      startedAt: data.startedAt,
      endedAt: data.endedAt,
      activeDurationSeconds: Math.max(1, Math.round(data.activeDurationSeconds)),
      targetDurationMinutes: data.targetDurationMinutes,
      completed: data.completed,
    };

    const updated = [newSession, ...all];
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
    }
    return newSession;
  }

  // Practice Statistics calculations
  static getPracticeStats() {
    const sessions = this.getMeditationSessions();
    const joinedIds = this.getJoinedIntentionIds();

    const totalSeconds = sessions.reduce((acc, curr) => acc + (curr.activeDurationSeconds || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    // Days meditated this month
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const daysSet = new Set<number>();
    sessions.forEach((s) => {
      const d = new Date(s.startedAt);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        daysSet.add(d.getDate());
      }
    });

    const sessionsCompleted = sessions.filter((s) => s.completed).length;

    return {
      totalTimeFormatted: `${hours}h ${minutes}m`,
      totalSeconds,
      intentionsJoinedCount: joinedIds.length,
      daysThisMonthCount: daysSet.size,
      sessionsCompletedCount: sessionsCompleted,
      daysSet,
      sessions,
    };
  }
}
