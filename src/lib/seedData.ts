import { Intention, MeditationSession, User } from '@/types';

export const DEFAULT_GUEST_USER: User = {
  id: 'usr_guest',
  name: 'Guest Practitioner',
  joinedAt: '2026-01-01T00:00:00Z',
  isCurrentUser: true,
  isGuest: true,
  authProvider: 'guest',
};

export const INITIAL_INTENTIONS: Intention[] = [];
export const INITIAL_MEDITATION_SESSIONS: MeditationSession[] = [];
export const INITIAL_JOINED_INTENTION_IDS: string[] = [];
