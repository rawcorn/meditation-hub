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

interface AppContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  activeIntentionForMeditation: Intention | null;
  isGroupMeditation: boolean;
  startMeditationForIntention: (intention?: Intention | null, isGroup?: boolean) => void;
  exitMeditation: () => void;
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
  currentUser: User;
  updateUser: (updates: Partial<User>) => void;
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
  refreshData: () => void;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<NavigationTab>('intentions');
  const [activeIntentionForMeditation, setActiveIntentionForMeditation] = useState<Intention | null>(null);
  const [isGroupMeditation, setIsGroupMeditation] = useState(false);
  const [selectedDetailIntention, setSelectedDetailIntention] = useState<Intention | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [joinedIntentionIds, setJoinedIntentionIds] = useState<string[]>([]);
  const [currentUser, setCurrentUser] = useState<User>(DataService.getCurrentUser());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
  }, [refreshData]);

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
    setActiveIntentionForMeditation(intention || null);
    setIsGroupMeditation(isGroup);
    setActiveTab('meditate');
  }, []);

  const exitMeditation = useCallback(() => {
    setActiveIntentionForMeditation(null);
    setIsGroupMeditation(false);
    setActiveTab('intentions');
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
    showToast('Your words of support were shared with kindness.', 'reassure');
  }, [refreshData, selectedDetailIntention, showToast]);

  const deleteMessage = useCallback((intentionId: string, messageId: string) => {
    DataService.deleteSupportMessage(intentionId, messageId);
    refreshData();
    const updated = DataService.getIntentionById(intentionId);
    if (updated && selectedDetailIntention?.id === intentionId) {
      setSelectedDetailIntention(updated);
    }
    showToast('Message deleted.', 'info');
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
        currentUser,
        updateUser,
        toasts,
        showToast,
        createIntention,
        deleteIntention,
        addUpdateToIntention,
        addMessageToIntention,
        deleteMessage,
        reportMessage,
        recordCompletedMeditation,
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
