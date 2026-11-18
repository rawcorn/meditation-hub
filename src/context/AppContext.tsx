'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useTransition } from 'react';
import {
  Category,
  Intention,
  IntentionCategory,
  NavigationTab,
  ToastMessage,
  User,
} from '@/types';
import { DataService } from '@/services/dataService';
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient';
import { useLanguage } from '@/context/LanguageContext';
import { Language } from '@/locales';

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
  tCategory: (cat: Category) => string;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  activeIntentionForMeditation: Intention | null;
  isGroupMeditation: boolean;
  startMeditationForIntention: (intention?: Intention | null, isGroup?: boolean) => void;
  exitMeditation: (targetTab?: NavigationTab) => void;
  intentions: Intention[];
  joinedIntentionIds: string[];
  activeCategory: Category;
  setActiveCategory: (cat: Category) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  joinIntention: (id: string) => void;
  leaveIntention: (id: string) => void;
  selectedDetailIntention: Intention | null;
  setSelectedDetailIntention: (item: Intention | null) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isContactModalOpen: boolean;
  setIsContactModalOpen: (open: boolean) => void;
  sendContactMessage: (data: { name: string; email: string; subject: string; message: string }) => Promise<{ success: boolean; error?: string }>;
  currentUser: User;
  updateUser: (updates: Partial<User>) => void;
  loginWithGoogle: () => Promise<void>;
  sendEmailOtp: (email: string) => Promise<{ success: boolean; code?: string; error?: string }>;
  verifyEmailOtp: (email: string, code: string) => Promise<boolean>;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'info' | 'success' | 'reassure') => void;
  createIntention: (data: {
    recipient: string;
    title: string;
    category: IntentionCategory;
    description: string;
    visualizationPrompt?: string;
    imageUrl?: string;
    sessionType: 'open' | 'scheduled';
    scheduledAt?: string;
  }) => Intention;
  deleteIntention: (id: string) => void;
  addUpdateToIntention: (intentionId: string, content: string) => void;
  addMessageToIntention: (intentionId: string, content: string) => void;
  deleteMessage: (intentionId: string, messageId: string) => void;
  reportMessage: (intentionId: string, messageId: string) => void;
  recordCompletedMeditation: (session: {
    intentionId?: string;
    intentionTitle?: string;
    startedAt: string;
    endedAt: string;
    activeDurationSeconds: number;
    targetDurationMinutes: number;
    completed: boolean;
  }) => void;
  sessionsVersion: number;
  refreshData: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, t, tCategory } = useLanguage();
  const [activeTab, setActiveTab] = useState<NavigationTab>('intentions');
  const [activeIntentionForMeditation, setActiveIntentionForMeditation] = useState<Intention | null>(null);
  const [isGroupMeditation, setIsGroupMeditation] = useState(false);
  const [selectedDetailIntention, setSelectedDetailIntention] = useState<Intention | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [joinedIntentionIds, setJoinedIntentionIds] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(DataService.getCurrentUser());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionsVersion, setSessionsVersion] = useState(0);
  const [, startTransition] = useTransition();

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'reassure' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastMessage = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4200);
  }, []);

  const refreshData = useCallback(() => {
    const all = DataService.getIntentions();
    const joined = DataService.getJoinedIntentionIds();
    const user = DataService.getCurrentUser();
    startTransition(() => {
      setIntentions(all);
      setJoinedIntentionIds(joined);
      setCurrentUser(user);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    refreshData();
    if (isSupabaseConfigured()) {
      DataService.syncFromSupabase().then((synced) => {
        if (synced) {
          refreshData();
        }
      });
    }
  }, [refreshData]);

  // Listen to Supabase auth changes if configured
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const regUser: User = {
          id: u.id,
          name:
            u.user_metadata?.full_name ||
            u.user_metadata?.name ||
            u.email?.split('@')[0] ||
            'Practitioner',
          email: u.email,
          avatarUrl: u.user_metadata?.avatar_url,
          joinedAt: u.created_at || new Date().toISOString(),
          isCurrentUser: true,
          isGuest: false,
          authProvider: u.app_metadata?.provider === 'google' ? 'google' : 'email-otp',
        };
        DataService.saveUser(regUser);
        setCurrentUser(regUser);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user && (event === 'SIGNED_IN' || event === 'USER_UPDATED')) {
        const u = session.user;
        const regUser: User = {
          id: u.id,
          name:
            u.user_metadata?.full_name ||
            u.user_metadata?.name ||
            u.email?.split('@')[0] ||
            'Practitioner',
          email: u.email,
          avatarUrl: u.user_metadata?.avatar_url,
          joinedAt: u.created_at || new Date().toISOString(),
          isCurrentUser: true,
          isGuest: false,
          authProvider: u.app_metadata?.provider === 'google' ? 'google' : 'email-otp',
        };
        DataService.migrateGuestDataToUser(DataService.getCurrentUser().id, regUser);
        DataService.saveUser(regUser);
        setCurrentUser(regUser);
        setIsAuthModalOpen(false);
        DataService.syncFromSupabase().then(() => {
          refreshData();
        });
      } else if (event === 'SIGNED_OUT') {
        const guestUser = DataService.continueAsGuest();
        setCurrentUser(guestUser);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const sendContactMessage = useCallback(async (data: { name: string; email: string; subject: string; message: string }) => {
    return DataService.sendContactMessage(data);
  }, []);

  const loginWithGoogle = useCallback(async () => {
    const res = await DataService.loginWithGoogle();
    if (res.error) {
      showToast(res.error, 'info');
    } else if (!supabase) {
      refreshData();
      setIsAuthModalOpen(false);
      showToast('Welcome. You are signed in with Google.', 'success');
    }
  }, [refreshData, showToast]);

  const sendEmailOtp = useCallback(async (email: string) => {
    const result = await DataService.sendEmailOtp(email);
    if (result.success) {
      if (result.code) {
        showToast(`Login code sent. Demo code: ${result.code}`, 'info');
      } else {
        showToast(`Login code sent to ${email}. Please check your inbox.`, 'info');
      }
    } else if (result.error) {
      showToast(result.error, 'info');
    }
    return result;
  }, [showToast]);

  const verifyEmailOtp = useCallback(async (email: string, code: string) => {
    const result = await DataService.verifyEmailOtp(email, code);
    if (result.success && result.user) {
      refreshData();
      setIsAuthModalOpen(false);
      showToast(`Welcome, ${result.user.name}. Practice safely synced.`, 'success');
      return true;
    } else {
      showToast(result.error || 'Invalid code. Please try again.', 'info');
      return false;
    }
  }, [refreshData, showToast]);

  const continueAsGuest = useCallback(() => {
    DataService.continueAsGuest();
    refreshData();
    setIsAuthModalOpen(false);
    showToast('Browsing as guest. Practice is saved on this device.', 'info');
  }, [refreshData, showToast]);

  const signOut = useCallback(async () => {
    await DataService.signOut();
    refreshData();
    setIsProfileModalOpen(false);
    showToast('Signed out. You are now in guest mode.', 'info');
  }, [refreshData, showToast]);

  const joinIntention = useCallback((id: string) => {
    const target = DataService.getIntentionById(id);
    const success = DataService.joinIntention(id);
    if (success) {
      refreshData();
      showToast(
        target ? `Holding space for ${target.recipient}. Intention added to your practice.` : 'Joined intention.',
        'reassure'
      );
    }
  }, [refreshData, showToast]);

  const leaveIntention = useCallback((id: string) => {
    const target = DataService.getIntentionById(id);
    const success = DataService.leaveIntention(id);
    if (success) {
      refreshData();
      showToast(
        target ? `Stepped back from ${target.recipient}. You can rejoin anytime.` : 'Participation removed.',
        'info'
      );
    }
  }, [refreshData, showToast]);

  const startMeditationForIntention = useCallback((intention?: Intention | null, isGroup: boolean = false) => {
    if (intention) {
      // Ensure the user is registered as a meditator for this intention
      DataService.joinIntention(intention.id);
      refreshData();
    }
    setActiveIntentionForMeditation(intention || null);
    setIsGroupMeditation(isGroup);
    setActiveTab('meditate');
  }, [refreshData]);

  const exitMeditation = useCallback((targetTab: NavigationTab = 'intentions') => {
    setActiveIntentionForMeditation(null);
    setIsGroupMeditation(false);
    setActiveTab(targetTab);
  }, []);

  const createIntention = useCallback((data: {
    recipient: string;
    title: string;
    category: IntentionCategory;
    description: string;
    visualizationPrompt?: string;
    imageUrl?: string;
    sessionType: 'open' | 'scheduled';
    scheduledAt?: string;
  }) => {
    const created = DataService.createIntention(data);
    refreshData();
    showToast(`Intention created for ${created.recipient}. Thank you for sharing space.`, 'success');
    return created;
  }, [refreshData, showToast]);

  const deleteIntention = useCallback((id: string) => {
    DataService.deleteIntention(id);
    if (selectedDetailIntention?.id === id) {
      setSelectedDetailIntention(null);
    }
    refreshData();
    showToast('Intention removed peacefully.', 'info');
  }, [refreshData, selectedDetailIntention, showToast]);

  const addUpdateToIntention = useCallback((intentionId: string, content: string) => {
    DataService.addIntentionUpdate(intentionId, content);
    refreshData();
    const updated = DataService.getIntentionById(intentionId);
    if (updated && selectedDetailIntention?.id === intentionId) {
      setSelectedDetailIntention(updated);
    }
    showToast('Your reflection update has been published.', 'success');
  }, [refreshData, selectedDetailIntention, showToast]);

  const addMessageToIntention = useCallback((intentionId: string, content: string) => {
    DataService.addSupportMessage(intentionId, content);
    refreshData();
    const updated = DataService.getIntentionById(intentionId);
    if (updated && selectedDetailIntention?.id === intentionId) {
      setSelectedDetailIntention(updated);
    }
    showToast('Your note was shared with kindness.', 'reassure');
  }, [refreshData, selectedDetailIntention, showToast]);

  const deleteMessage = useCallback((intentionId: string, messageId: string) => {
    DataService.deleteSupportMessage(intentionId, messageId);
    refreshData();
    const updated = DataService.getIntentionById(intentionId);
    if (updated && selectedDetailIntention?.id === intentionId) {
      setSelectedDetailIntention(updated);
    }
    showToast('Note deleted.', 'info');
  }, [refreshData, selectedDetailIntention, showToast]);

  const reportMessage = useCallback((intentionId: string, messageId: string) => {
    DataService.reportSupportMessage(intentionId, messageId);
    refreshData();
    const updated = DataService.getIntentionById(intentionId);
    if (updated && selectedDetailIntention?.id === intentionId) {
      setSelectedDetailIntention(updated);
    }
    showToast('Thank you. Message flagged for community safety and hidden.', 'info');
  }, [refreshData, selectedDetailIntention, showToast]);

  const recordCompletedMeditation = useCallback((sessionData: {
    intentionId?: string;
    intentionTitle?: string;
    startedAt: string;
    endedAt: string;
    activeDurationSeconds: number;
    targetDurationMinutes: number;
    completed: boolean;
  }) => {
    DataService.recordMeditationSession(sessionData);
    setSessionsVersion((v) => v + 1);
    refreshData();
  }, [refreshData]);

  const updateUser = useCallback((updates: Partial<User>) => {
    const updated = DataService.updateCurrentUser(updates);
    setCurrentUser(updated);
    showToast('Profile updated.', 'info');
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        tCategory,
        activeTab,
        setActiveTab,
        activeIntentionForMeditation,
        isGroupMeditation,
        startMeditationForIntention,
        exitMeditation,
        intentions,
        joinedIntentionIds,
        activeCategory,
        setActiveCategory,
        searchQuery,
        setSearchQuery,
        joinIntention,
        leaveIntention,
        selectedDetailIntention,
        setSelectedDetailIntention,
        isCreateModalOpen,
        setIsCreateModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isContactModalOpen,
        setIsContactModalOpen,
        sendContactMessage,
        currentUser,
        updateUser,
        loginWithGoogle,
        sendEmailOtp,
        verifyEmailOtp,
        continueAsGuest,
        signOut,
        toasts,
        showToast,
        createIntention,
        deleteIntention,
        addUpdateToIntention,
        addMessageToIntention,
        deleteMessage,
        reportMessage,
        recordCompletedMeditation,
        sessionsVersion,
        refreshData,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
