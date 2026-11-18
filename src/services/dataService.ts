import {
  Category,
  Intention,
  IntentionCategory,
  IntentionUpdate,
  MeditationSession,
  SessionType,
  SupportMessage,
  User,
} from '@/types';
import {
  DEFAULT_GUEST_USER,
  INITIAL_INTENTIONS,
  INITIAL_JOINED_INTENTION_IDS,
  INITIAL_MEDITATION_SESSIONS,
} from '@/lib/seedData';

const STORAGE_KEYS = {
  INTENTIONS: 'meditation_intentions_prod_v1',
  JOINED_IDS: 'meditation_joined_ids_prod_v1',
  SESSIONS: 'meditation_sessions_prod_v1',
  USER: 'meditation_user_prod_v1',
  AUTH_DISMISSED: 'meditation_auth_dismissed_prod_v1',
  PENDING_OTP: 'meditation_pending_otp_prod_v1',
};

const SAMPLE_INTENTION_IDS = new Set(['int_01', 'int_02', 'int_03', 'int_04', 'int_05', 'int_06', 'int_07']);
const SAMPLE_SESSION_IDS = new Set(['ses_01', 'ses_02', 'ses_03', 'ses_04']);

import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';

export { isSupabaseConfigured };

export class DataService {
  private static isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // Current User
  static getCurrentUser(): User {
    if (!this.isBrowser()) return DEFAULT_GUEST_USER;
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id && parsed.id !== 'usr_curr_771') {
          return {
            ...parsed,
            isGuest: parsed.isGuest ?? (parsed.id === 'usr_guest' || !parsed.email),
          };
        }
      } catch {
        // fallback
      }
    }
    return DEFAULT_GUEST_USER;
  }

  static saveUser(user: User): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }
  }

  static updateCurrentUser(updates: Partial<User>): User {
    const current = this.getCurrentUser();
    const updated = { ...current, ...updates };
    this.saveUser(updated);
    return updated;
  }

  static isAuthDismissed(): boolean {
    if (!this.isBrowser()) return false;
    return localStorage.getItem(STORAGE_KEYS.AUTH_DISMISSED) === 'true';
  }

  static setAuthDismissed(dismissed: boolean): void {
    if (this.isBrowser()) {
      localStorage.setItem(STORAGE_KEYS.AUTH_DISMISSED, dismissed ? 'true' : 'false');
    }
  }

  static async loginWithGoogle(profile?: { name?: string; email?: string; avatarUrl?: string }): Promise<{ error?: string }> {
    if (supabase) {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
        },
      });
      if (error) return { error: error.message };
      return {};
    }

    // Local fallback mock
    const previousUser = this.getCurrentUser();
    const newUser: User = {
      id: `usr_google_${Date.now()}`,
      name: profile?.name || 'Google Practitioner',
      email: profile?.email || 'practitioner@gmail.com',
      avatarUrl:
        profile?.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=280&q=80',
      joinedAt: new Date().toISOString(),
      isCurrentUser: true,
      isGuest: false,
      authProvider: 'google',
    };
    this.migrateGuestDataToUser(previousUser.id, newUser);
    this.saveUser(newUser);
    this.setAuthDismissed(true);
    return {};
  }

  static async sendEmailOtp(email: string): Promise<{ success: boolean; code?: string; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();

    if (supabase) {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
        options: {
          shouldCreateUser: true,
        },
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    }

    // Local demo fallback
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    if (this.isBrowser()) {
      const payload = {
        email: cleanEmail,
        code,
        expiresAt: Date.now() + 15 * 60 * 1000,
      };
      localStorage.setItem(STORAGE_KEYS.PENDING_OTP, JSON.stringify(payload));
    }
    return { success: true, code };
  }

  static async verifyEmailOtp(
    email: string,
    code: string
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    if (supabase) {
      const { data, error } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: cleanCode,
        type: 'email',
      });

      if (error || !data.user) {
        return { success: false, error: error?.message || 'Invalid or expired code. Please try again.' };
      }

      const previousUser = this.getCurrentUser();
      const rawName = data.user.user_metadata?.full_name || cleanEmail.split('@')[0] || 'Practitioner';
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      const newUser: User = {
        id: data.user.id,
        name: formattedName,
        email: cleanEmail,
        avatarUrl: data.user.user_metadata?.avatar_url,
        joinedAt: data.user.created_at || new Date().toISOString(),
        isCurrentUser: true,
        isGuest: false,
        authProvider: 'email-otp',
      };

      this.migrateGuestDataToUser(previousUser.id, newUser);
      this.saveUser(newUser);
      this.setAuthDismissed(true);
      return { success: true, user: newUser };
    }

    // Local demo fallback
    if (this.isBrowser()) {
      const pendingStr = localStorage.getItem(STORAGE_KEYS.PENDING_OTP);
      let isValid = false;

      if (pendingStr) {
        try {
          const pending = JSON.parse(pendingStr);
          if (
            pending.email === cleanEmail &&
            pending.code === cleanCode &&
            Date.now() < pending.expiresAt
          ) {
            isValid = true;
          }
        } catch {
          // ignore
        }
      }

      if (!isValid && cleanCode.length === 6 && /^\d+$/.test(cleanCode)) {
        isValid = true;
      }

      if (!isValid) {
        return { success: false, error: 'Invalid or expired code. Please try again.' };
      }

      const previousUser = this.getCurrentUser();
      const rawName = cleanEmail.split('@')[0] || 'Practitioner';
      const formattedName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      const newUser: User = {
        id: `usr_email_${Date.now()}`,
        name: formattedName,
        email: cleanEmail,
        joinedAt: new Date().toISOString(),
        isCurrentUser: true,
        isGuest: false,
        authProvider: 'email-otp',
      };

      this.migrateGuestDataToUser(previousUser.id, newUser);
      this.saveUser(newUser);
      this.setAuthDismissed(true);
      localStorage.removeItem(STORAGE_KEYS.PENDING_OTP);
      return { success: true, user: newUser };
    }

    return { success: false, error: 'Verification failed.' };
  }

  static continueAsGuest(): User {
    const current = this.getCurrentUser();
    let guestUser = current;
    if (!current.isGuest) {
      guestUser = {
        id: 'usr_guest',
        name: 'Guest Practitioner',
        joinedAt: new Date().toISOString(),
        isCurrentUser: true,
        isGuest: true,
        authProvider: 'guest',
      };
      this.saveUser(guestUser);
    }
    this.setAuthDismissed(true);
    return guestUser;
  }

  static async signOut(): Promise<User> {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase signOut error:', err);
      }
    }
    const guestUser: User = {
      id: 'usr_guest',
      name: 'Guest Practitioner',
      joinedAt: new Date().toISOString(),
      isCurrentUser: true,
      isGuest: true,
      authProvider: 'guest',
    };
    this.saveUser(guestUser);
    return guestUser;
  }

  static migrateGuestDataToUser(fromUserId: string, toUser: User): void {
    if (!this.isBrowser()) return;

    // Migrate intentions created by fromUserId (e.g. usr_guest)
    const storedIntentions = localStorage.getItem(STORAGE_KEYS.INTENTIONS);
    if (storedIntentions) {
      try {
        const intentions: Intention[] = JSON.parse(storedIntentions);
        let changed = false;
        const updated = intentions.map((item) => {
          if (item.creatorId === fromUserId) {
            changed = true;
            return {
              ...item,
              creatorId: toUser.id,
              creatorName: toUser.name,
            };
          }
          return item;
        });
        if (changed) {
          localStorage.setItem(STORAGE_KEYS.INTENTIONS, JSON.stringify(updated));
        }
      } catch {
        // ignore
      }
    }

    // Migrate meditation sessions
    const storedSessions = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (storedSessions) {
      try {
        const sessions: MeditationSession[] = JSON.parse(storedSessions);
        let changed = false;
        const updated = sessions.map((s) => {
          if (s.userId === fromUserId) {
            changed = true;
            return {
              ...s,
              userId: toUser.id,
            };
          }
          return s;
        });
        if (changed) {
          localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(updated));
        }
      } catch {
        // ignore
      }
    }
  }

  // Category normalization helper for backward compatibility
  private static normalizeCategory(cat: string): IntentionCategory {
    const map: Record<string, IntentionCategory> = {
      'Physical Wellbeing': 'Physical',
      'Mental & Emotional Wellbeing': 'Mental & Emotional',
      'Financial Wellbeing': 'Financial',
      'Global Peace': 'World',
    };
    return (map[cat] || cat) as IntentionCategory;
  }

  // Intentions
  static getIntentions(): Intention[] {
    if (!this.isBrowser()) return [];
    const stored = localStorage.getItem(STORAGE_KEYS.INTENTIONS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.INTENTIONS, JSON.stringify([]));
      return [];
    }
    try {
      const parsed: Intention[] = JSON.parse(stored);
      // Clean out any legacy sample / mock intentions
      const clean = parsed.filter(
        (item) => !item.isSample && !SAMPLE_INTENTION_IDS.has(item.id) && item.creatorId !== 'usr_curr_771'
      );
      if (clean.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.INTENTIONS, JSON.stringify(clean));
      }
      return clean;
    } catch {
      return [];
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

    if (supabase) {
      supabase
        .from('intentions')
        .insert({
          id: newIntention.id,
          recipient: newIntention.recipient,
          title: newIntention.title,
          category: newIntention.category,
          description: newIntention.description,
          visualization_prompt: newIntention.visualizationPrompt || null,
          image_url: newIntention.imageUrl || null,
          session_type: newIntention.sessionType,
          scheduled_at: newIntention.scheduledAt || null,
          creator_id: newIntention.creatorId,
          creator_name: newIntention.creatorName,
          participant_count: newIntention.participantCount,
          is_sample: false,
          created_at: newIntention.createdAt,
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase createIntention notice:', error.message);
        });
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

    if (supabase) {
      supabase
        .from('intentions')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.warn('Supabase deleteIntention notice:', error.message);
        });
    }

    return true;
  }

  // Participation (Join/Leave)
  static getJoinedIntentionIds(): string[] {
    if (!this.isBrowser()) return [];
    const stored = localStorage.getItem(STORAGE_KEYS.JOINED_IDS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.JOINED_IDS, JSON.stringify([]));
      return [];
    }
    try {
      const parsed: string[] = JSON.parse(stored);
      const clean = parsed.filter((id) => !SAMPLE_INTENTION_IDS.has(id));
      if (clean.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.JOINED_IDS, JSON.stringify(clean));
      }
      return clean;
    } catch {
      return [];
    }
  }

  static isJoined(intentionId: string): boolean {
    const joined = this.getJoinedIntentionIds();
    return joined.includes(intentionId);
  }

  static joinIntention(intentionId: string): boolean {
    const joined = this.getJoinedIntentionIds();
    const user = this.getCurrentUser();
    if (!joined.includes(intentionId)) {
      const updated = [...joined, intentionId];
      if (this.isBrowser()) {
        localStorage.setItem(STORAGE_KEYS.JOINED_IDS, JSON.stringify(updated));
        
        // Update participant count & list in stored intention
        const all = this.getIntentions();
        const nextAll = all.map((item) => {
          if (item.id === intentionId) {
            const currentList = item.participants || [];
            const isAlreadyInList = currentList.some((p) => p.id === user.id);
            const nextList = isAlreadyInList
              ? currentList
              : [
                  ...currentList,
                  {
                    id: user.id,
                    name: user.name,
                    avatarUrl: user.avatarUrl,
                    joinedAt: new Date().toISOString(),
                    meditatedCount: 1,
                  },
                ];
            return {
              ...item,
              participantCount: item.participantCount + 1,
              participants: nextList,
            };
          }
          return item;
        });
        localStorage.setItem(STORAGE_KEYS.INTENTIONS, JSON.stringify(nextAll));
      }

      if (supabase) {
        supabase
          .from('intention_participants')
          .upsert(
            {
              intention_id: intentionId,
              user_id: user.id,
              name: user.name,
              avatar_url: user.avatarUrl || null,
              joined_at: new Date().toISOString(),
              meditated_count: 1,
            },
            { onConflict: 'intention_id,user_id' }
          )
          .then(({ error }) => {
            if (error) console.warn('Supabase joinIntention notice:', error.message);
          });

        const updatedIntention = this.getIntentionById(intentionId);
        if (updatedIntention) {
          supabase
            .from('intentions')
            .update({ participant_count: updatedIntention.participantCount })
            .eq('id', intentionId)
            .then();
        }
      }

      return true;
    }
    return false;
  }

  static leaveIntention(intentionId: string): boolean {
    const joined = this.getJoinedIntentionIds();
    const user = this.getCurrentUser();
    if (joined.includes(intentionId)) {
      const updated = joined.filter((id) => id !== intentionId);
      if (this.isBrowser()) {
        localStorage.setItem(STORAGE_KEYS.JOINED_IDS, JSON.stringify(updated));
        
        // Update participant count & list in stored intention
        const all = this.getIntentions();
        const nextAll = all.map((item) => {
          if (item.id === intentionId) {
            const currentList = item.participants || [];
            const nextList = currentList.filter((p) => p.id !== user.id);
            return {
              ...item,
              participantCount: Math.max(0, item.participantCount - 1),
              participants: nextList,
            };
          }
          return item;
        });
        localStorage.setItem(STORAGE_KEYS.INTENTIONS, JSON.stringify(nextAll));
      }

      if (supabase) {
        supabase
          .from('intention_participants')
          .delete()
          .match({ intention_id: intentionId, user_id: user.id })
          .then(({ error }) => {
            if (error) console.warn('Supabase leaveIntention notice:', error.message);
          });

        const updatedIntention = this.getIntentionById(intentionId);
        if (updatedIntention) {
          supabase
            .from('intentions')
            .update({ participant_count: updatedIntention.participantCount })
            .eq('id', intentionId)
            .then();
        }
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

    if (supabase) {
      supabase
        .from('intention_updates')
        .insert({
          id: newUpdate.id,
          intention_id: intentionId,
          author_id: newUpdate.authorId,
          author_name: newUpdate.authorName,
          content: newUpdate.content,
          created_at: newUpdate.date,
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase addIntentionUpdate notice:', error.message);
        });
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

    if (supabase) {
      supabase
        .from('support_messages')
        .insert({
          id: newMessage.id,
          intention_id: intentionId,
          author_id: newMessage.authorId,
          author_name: newMessage.authorName,
          author_avatar: newMessage.authorAvatar || null,
          content: newMessage.content,
          reported: false,
          created_at: newMessage.date,
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase addSupportMessage notice:', error.message);
        });
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

    if (supabase) {
      supabase
        .from('support_messages')
        .delete()
        .eq('id', messageId)
        .then(({ error }) => {
          if (error) console.warn('Supabase deleteSupportMessage notice:', error.message);
        });
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

    if (supabase) {
      supabase
        .from('support_messages')
        .update({ reported: true })
        .eq('id', messageId)
        .then(({ error }) => {
          if (error) console.warn('Supabase reportSupportMessage notice:', error.message);
        });
    }

    return true;
  }

  // Meditation Sessions
  static getMeditationSessions(): MeditationSession[] {
    if (!this.isBrowser()) return [];
    const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify([]));
      return [];
    }
    try {
      const parsed: MeditationSession[] = JSON.parse(stored);
      const clean = parsed.filter(
        (s) => !SAMPLE_SESSION_IDS.has(s.id) && s.userId !== 'usr_curr_771'
      );
      if (clean.length !== parsed.length) {
        localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(clean));
      }
      return clean;
    } catch {
      return [];
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

      // Ensure this user is counted as a meditator for this intention
      if (data.intentionId) {
        this.joinIntention(data.intentionId);
        
        // Update user's meditated count on this intention
        const currentIntentions = this.getIntentions();
        const nextIntentions = currentIntentions.map((item) => {
          if (item.id === data.intentionId) {
            const participants = (item.participants || []).map((p) =>
              p.id === user.id ? { ...p, meditatedCount: (p.meditatedCount || 0) + 1 } : p
            );
            return { ...item, participants };
          }
          return item;
        });
        localStorage.setItem(STORAGE_KEYS.INTENTIONS, JSON.stringify(nextIntentions));
      }
    }

    if (supabase) {
      supabase
        .from('meditation_sessions')
        .insert({
          id: newSession.id,
          user_id: newSession.userId,
          intention_id: newSession.intentionId || null,
          intention_title: newSession.intentionTitle || null,
          started_at: newSession.startedAt,
          ended_at: newSession.endedAt,
          active_duration_seconds: newSession.activeDurationSeconds,
          target_duration_minutes: newSession.targetDurationMinutes,
          completed: newSession.completed,
          created_at: new Date().toISOString(),
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase recordMeditationSession notice:', error.message);
        });
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
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear && (s.activeDurationSeconds || 0) >= 60) {
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

  // ----------------------------------------------------
  // Supabase Remote Cloud Sync (Optimistic Offline-First)
  // ----------------------------------------------------
  static async syncFromSupabase(): Promise<boolean> {
    if (!supabase) return false;

    try {
      // 0. Auto-clean any legacy sample/mock data from Supabase if present
      const sampleIds = Array.from(SAMPLE_INTENTION_IDS);
      try {
        await Promise.allSettled([
          supabase.from('intentions').delete().in('id', sampleIds),
          supabase.from('intentions').delete().eq('is_sample', true),
          supabase.from('meditation_sessions').delete().in('id', Array.from(SAMPLE_SESSION_IDS)),
          supabase.from('support_messages').delete().in('id', ['msg_01', 'msg_02', 'msg_03', 'msg_04', 'msg_05', 'msg_06']),
          supabase.from('intention_updates').delete().in('id', ['upd_01', 'upd_02', 'upd_03']),
        ]);
      } catch {
        // notice: ignore if table or column doesn't match
      }

      // 1. Fetch remote intentions
      const { data: remoteIntentions, error: intErr } = await supabase
        .from('intentions')
        .select('*')
        .order('created_at', { ascending: false });

      if (intErr) {
        console.warn('Supabase intentions fetch notice:', intErr.message);
        return false;
      }

      // Filter out any mock/sample items from query results
      const realRemoteIntentions = (remoteIntentions || []).filter(
        (row: { id: string; is_sample?: boolean }) => !row.is_sample && !SAMPLE_INTENTION_IDS.has(row.id)
      );

      // If remote table is completely empty, platform is ready for real users
      if (realRemoteIntentions.length === 0) {
        if (this.isBrowser()) {
          localStorage.setItem(STORAGE_KEYS.INTENTIONS, JSON.stringify([]));
        }
        return true;
      }

      // 2. Fetch updates, messages, and participants in parallel
      const [updatesRes, messagesRes, participantsRes] = await Promise.all([
        supabase.from('intention_updates').select('*'),
        supabase.from('support_messages').select('*'),
        supabase.from('intention_participants').select('*'),
      ]);

      const updatesByIntention: Record<string, IntentionUpdate[]> = {};
      (updatesRes.data || []).forEach((u: { id: string; intention_id: string; author_id: string; author_name: string; created_at: string; content: string }) => {
        if (!updatesByIntention[u.intention_id]) updatesByIntention[u.intention_id] = [];
        updatesByIntention[u.intention_id].push({
          id: u.id,
          intentionId: u.intention_id,
          authorId: u.author_id,
          authorName: u.author_name,
          date: u.created_at,
          content: u.content,
        });
      });

      const messagesByIntention: Record<string, SupportMessage[]> = {};
      (messagesRes.data || []).forEach((m: { id: string; intention_id: string; author_id: string; author_name: string; author_avatar?: string; created_at: string; content: string; reported?: boolean }) => {
        if (!messagesByIntention[m.intention_id]) messagesByIntention[m.intention_id] = [];
        messagesByIntention[m.intention_id].push({
          id: m.id,
          intentionId: m.intention_id,
          authorId: m.author_id,
          authorName: m.author_name,
          authorAvatar: m.author_avatar || undefined,
          date: m.created_at,
          content: m.content,
          reported: m.reported || false,
        });
      });

      const participantsByIntention: Record<string, { id: string; name: string; avatarUrl?: string; joinedAt: string; meditatedCount?: number }[]> = {};
      const userJoinedSet = new Set<string>();
      const currentUser = this.getCurrentUser();

      (participantsRes.data || []).forEach((p: { intention_id: string; user_id: string; name: string; avatar_url?: string; joined_at: string; meditated_count?: number }) => {
        if (!participantsByIntention[p.intention_id]) participantsByIntention[p.intention_id] = [];
        participantsByIntention[p.intention_id].push({
          id: p.user_id,
          name: p.name,
          avatarUrl: p.avatar_url || undefined,
          joinedAt: p.joined_at,
          meditatedCount: p.meditated_count || 1,
        });
        if (currentUser.id && p.user_id === currentUser.id) {
          userJoinedSet.add(p.intention_id);
        }
      });

      const normalizedIntentions: Intention[] = realRemoteIntentions.map((row: { id: string; recipient: string; title: string; category: string; description: string; visualization_prompt?: string; image_url?: string; session_type?: string; scheduled_at?: string; creator_id: string; creator_name: string; created_at: string; participant_count?: number; is_sample?: boolean }) => ({
        id: row.id,
        recipient: row.recipient,
        title: row.title,
        category: this.normalizeCategory(row.category),
        description: row.description,
        visualizationPrompt: row.visualization_prompt || undefined,
        imageUrl: row.image_url || undefined,
        sessionType: (row.session_type as SessionType) || 'scheduled',
        scheduledAt: row.scheduled_at || undefined,
        creatorId: row.creator_id,
        creatorName: row.creator_name,
        createdAt: row.created_at,
        participantCount: row.participant_count || 1,
        isSample: Boolean(row.is_sample),
        updates: updatesByIntention[row.id] || [],
        messages: messagesByIntention[row.id] || [],
        participants: participantsByIntention[row.id] || [],
      }));

      if (this.isBrowser()) {
        localStorage.setItem(STORAGE_KEYS.INTENTIONS, JSON.stringify(normalizedIntentions));
        if (userJoinedSet.size > 0) {
          const currentLocal = this.getJoinedIntentionIds();
          const combined = Array.from(new Set([...currentLocal, ...Array.from(userJoinedSet)]));
          localStorage.setItem(STORAGE_KEYS.JOINED_IDS, JSON.stringify(combined));
        }
      }

      // 3. If user is logged in, sync their remote meditation sessions
      if (!currentUser.isGuest && currentUser.id) {
        const { data: remoteSessions } = await supabase
          .from('meditation_sessions')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('started_at', { ascending: false });

        if (remoteSessions && remoteSessions.length > 0) {
          const mappedSessions: MeditationSession[] = remoteSessions.map((s: { id: string; user_id: string; intention_id?: string; intention_title?: string; started_at: string; ended_at: string; active_duration_seconds: number; target_duration_minutes: number; completed?: boolean; notes?: string }) => ({
            id: s.id,
            userId: s.user_id,
            intentionId: s.intention_id || undefined,
            intentionTitle: s.intention_title || undefined,
            startedAt: s.started_at,
            endedAt: s.ended_at,
            activeDurationSeconds: s.active_duration_seconds,
            targetDurationMinutes: s.target_duration_minutes,
            completed: Boolean(s.completed),
            notes: s.notes || undefined,
          }));

          if (this.isBrowser()) {
            localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(mappedSessions));
          }
        }
      }

      return true;
    } catch (err) {
      console.warn('Supabase sync skipped (offline or network pause):', err);
      return false;
    }
  }

  static async sendContactMessage(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean; error?: string }> {
    const user = this.getCurrentUser();
    const id = `msg_contact_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record = {
      id,
      name: data.name.trim(),
      email: data.email.trim(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      user_id: user.id || null,
      created_at: new Date().toISOString(),
    };

    // Save locally in cache as backup
    if (this.isBrowser()) {
      try {
        const stored = localStorage.getItem('meditation_contact_messages_prod') || '[]';
        const parsed = JSON.parse(stored);
        parsed.unshift(record);
        localStorage.setItem('meditation_contact_messages_prod', JSON.stringify(parsed));
      } catch {
        // ignore
      }
    }

    // Save to Supabase if configured
    if (supabase) {
      try {
        const { error } = await supabase.from('contact_messages').insert({
          id: record.id,
          name: record.name,
          email: record.email,
          subject: record.subject,
          message: record.message,
          user_id: record.user_id,
          created_at: record.created_at,
        });
        if (error) {
          console.warn('Supabase contact_messages notice:', error.message);
        }
      } catch (err) {
        console.warn('Supabase contact_messages network notice:', err);
      }
    }

    // Forward email directly to contact@meditation-hub.org (which ImprovMX forwards to Gmail)
    try {
      await fetch('https://formsubmit.co/ajax/contact@meditation-hub.org', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          Name: record.name,
          Email: record.email,
          Topic: record.subject,
          Message: record.message,
          _replyto: record.email,
          _subject: `[Meditation Hub] ${record.subject} - from ${record.name}`,
          _template: 'table',
          _captcha: 'false',
        }),
      });
    } catch (err) {
      console.warn('Direct email forward notice:', err);
    }

    return { success: true };
  }

  static async seedSupabaseIfEmpty(): Promise<void> {
    // Production mode: do not seed mock data.
    return;
  }
}
