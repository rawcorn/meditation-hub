'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Mail } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { MobileNavigation } from '@/components/layout/Navigation';
import { WelcomeHero } from '@/components/layout/WelcomeHero';
import { DiscoverView } from '@/components/discover/DiscoverView';
import { MeditateSanctuary } from '@/components/meditate/MeditateSanctuary';
import { MyPracticeView } from '@/components/practice/MyPracticeView';
import { CreateIntentionModal } from '@/components/intentions/CreateIntentionModal';
import { IntentionDetailModal } from '@/components/intentions/IntentionDetailModal';
import { ProfileModal } from '@/components/common/ProfileModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { ContactModal } from '@/components/common/ContactModal';
import { InstallPwaButton } from '@/components/common/InstallPwaButton';
import { NotificationToast } from '@/components/common/NotificationToast';

function MainAppContent() {
  const { activeTab, setIsContactModalOpen, language } = useApp();

  return (
    <div className="min-h-screen bg-[#080B15] text-[#F3F3FA] flex flex-col font-sans selection:bg-[#C7B9FF]/20 selection:text-[#F3F3FA] pb-24 sm:pb-12 relative overflow-x-hidden">
      {/* Halo ambiental cenital unificado y continuo para Header + Hero */}
      {(activeTab === 'intentions' || activeTab === 'discover' || activeTab === 'calendar') && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 right-0 h-[520px] flex items-start justify-center overflow-hidden z-0"
        >
          <div
            className="w-[700px] sm:w-[1100px] h-[520px] -mt-16 rounded-full blur-[85px] pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at center, rgba(168, 150, 255, 0.22) 0%, rgba(55, 80, 155, 0.20) 45%, rgba(8, 11, 21, 0) 80%)',
            }}
          />
        </div>
      )}

      {/* Immersive Meditation Room Overlay */}
      {activeTab === 'meditate' && <MeditateSanctuary />}

      {/* Main App Header with centered Navigation */}
      <Header />

      {/* Welcome Hero Banner (Only shown in intentions and calendar views) */}
      {(activeTab === 'intentions' || activeTab === 'discover' || activeTab === 'calendar') && <WelcomeHero />}

      <main className="flex-1 w-full max-w-5xl mx-auto relative z-10">
        {(activeTab === 'intentions' || activeTab === 'discover' || activeTab === 'calendar') && <DiscoverView />}
        {activeTab === 'practice' && <MyPracticeView />}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation />

      {/* Reusable Modals & Toasts */}
      <CreateIntentionModal />
      <IntentionDetailModal />
      <ProfileModal />
      <AuthModal />
      <ContactModal />
      <NotificationToast />
      <InstallPwaButton />

      {/* Atmospheric Understated Footer */}
      <footer className="mt-auto border-t border-[#242c40]/50 py-8 px-4 text-center text-[11px] text-[#64708D] max-w-4xl mx-auto space-y-3 relative z-10">
        <div className="flex items-center justify-center gap-4 text-xs text-[#A8B1C8]">
          <button
            onClick={() => setIsContactModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#111827] hover:bg-[#151B29] text-[#A8B1C8] hover:text-[#C7B9FF] border border-[#242c40] hover:border-[#C7B9FF]/40 transition-all cursor-pointer shadow-sm active:scale-95"
            title={language === 'es' ? 'Contacto y sugerencias' : 'Contact Us'}
            aria-label={language === 'es' ? 'Contacto y sugerencias' : 'Contact Us'}
          >
            <Mail className="w-3.5 h-3.5 text-[#C7B9FF]" />
            <span>{language === 'es' ? 'Contacto y sugerencias' : 'Contact Us'}</span>
          </button>
        </div>

        <p className="text-[10px] text-[#64708D]/70 max-w-md mx-auto leading-relaxed">
          {language === 'es'
            ? 'Meditation Hub es un espacio de meditación y presencia contemplativa. No ofrece asesoramiento médico, diagnóstico clínico ni promete curas de salud física.'
            : 'Meditation Hub is intended purely as a meditation and contemplative wellbeing practice. It does not offer medical advice, clinical diagnosis, or claim physical health cures.'}
        </p>
      </footer>
    </div>
  );
}

export default function Home() {
  return <MainAppContent />;
}
