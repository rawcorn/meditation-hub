'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Header } from '@/components/layout/Header';
import { DesktopNavigation, MobileNavigation } from '@/components/layout/Navigation';
import { DiscoverView } from '@/components/discover/DiscoverView';
import { MeditateSanctuary } from '@/components/meditate/MeditateSanctuary';
import { MyPracticeView } from '@/components/practice/MyPracticeView';
import { CreateIntentionModal } from '@/components/intentions/CreateIntentionModal';
import { IntentionDetailModal } from '@/components/intentions/IntentionDetailModal';
import { ProfileModal } from '@/components/common/ProfileModal';
import { NotificationToast } from '@/components/common/NotificationToast';

function MainAppContent() {
  const { activeTab } = useApp();

  return (
    <div className="min-h-screen bg-[#080B15] text-[#F3F3FA] flex flex-col font-sans selection:bg-[#C7B9FF]/20 selection:text-[#F3F3FA] pb-24 sm:pb-12">
      {/* Immersive Meditation Space Overlay */}
      {activeTab === 'meditate' && <MeditateSanctuary />}

      {/* Main App Layout */}
      <Header />
      <DesktopNavigation />

      <main className="flex-1 w-full max-w-5xl mx-auto">
        {(activeTab === 'intentions' || activeTab === 'discover') && <DiscoverView />}
        {activeTab === 'practice' && <MyPracticeView />}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />

      {/* Reusable Modals & Toasts */}
      <CreateIntentionModal />
      <IntentionDetailModal />
      <ProfileModal />
      <NotificationToast />

      {/* Atmospheric Understated Footer */}
      <footer className="mt-auto border-t border-[#242c40]/50 py-8 px-4 text-center text-[11px] text-[#64708D] max-w-4xl mx-auto space-y-2">
        <p>
          Coherence Hub · A peaceful Meditation Space for collective practice & shared presence.
        </p>
        <p className="text-[10px] text-[#64708D]/70 max-w-md mx-auto leading-relaxed">
          Coherence Hub is intended purely as a meditation and contemplative wellbeing practice. It does not offer medical advice, clinical diagnosis, or claim physical health cures.
        </p>
      </footer>
    </div>
  );
}

export default function Home() {
  return <MainAppContent />;
}
