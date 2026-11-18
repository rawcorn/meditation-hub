'use client';

import React, { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { LogIn, Plus, User as UserIcon } from 'lucide-react';
import Image from 'next/image';
import { QuantumCoherenceLogo } from '@/components/common/QuantumCoherenceLogo';

export function Header() {
  const {
    currentUser,
    setIsProfileModalOpen,
    setIsCreateModalOpen,
    setIsAuthModalOpen,
    setActiveTab,
    language,
    setLanguage,
    t,
  } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-30 w-full transition-all duration-200 ${
        isScrolled
          ? 'backdrop-blur-md bg-[#080B15]/90 border-b border-[#242c40]/60 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo / Quantum Coherence Symbol - Clickable to return to Intentions (Home) */}
        <button
          onClick={() => setActiveTab('intentions')}
          className="flex items-center gap-2 shrink-0 text-left cursor-pointer focus:outline-none group"
          title="Return to All Intentions"
        >
          <div className="relative flex items-center justify-center transition-transform group-hover:scale-105">
            <QuantumCoherenceLogo size={19} />
          </div>
          <div>
            <span className="font-medium tracking-wide text-base text-[#F3F3FA] flex items-center gap-1.5 group-hover:text-[#C7B9FF] transition-colors">
              Meditation Hub
            </span>
          </div>
        </button>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Language Toggle */}
          <div className="flex items-center rounded-full bg-[#111827]/90 border border-[#242c40] p-0.5 text-[11px] font-medium" role="group" aria-label="Select language">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-[#1b233a] text-[#C7B9FF] font-semibold shadow-xs'
                  : 'text-[#64708D] hover:text-[#A8B1C8]'
              }`}
              title="English"
              aria-pressed={language === 'en'}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('es')}
              className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                language === 'es'
                  ? 'bg-[#1b233a] text-[#C7B9FF] font-semibold shadow-xs'
                  : 'text-[#64708D] hover:text-[#A8B1C8]'
              }`}
              title="Español"
              aria-pressed={language === 'es'}
            >
              ES
            </button>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 text-xs font-medium rounded-full bg-[#151B29] hover:bg-[#1f283d] text-[#C7B9FF] border border-[#30364A] transition-all hover:border-[#C7B9FF]/40 cursor-pointer shadow-sm active:scale-95"
            aria-label={t('common.createIntention')}
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('common.createIntention')}</span>
            <span className="sm:hidden">{t('common.intention')}</span>
          </button>

          {currentUser.isGuest ? (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-full bg-[#1b233a] hover:bg-[#253052] text-[#F3F3FA] border border-[#C7B9FF]/40 hover:border-[#C7B9FF] transition-all cursor-pointer shadow-sm active:scale-95"
              title={t('common.signIn')}
            >
              <LogIn className="w-3.5 h-3.5 text-[#C7B9FF]" />
              <span>{t('common.signIn')}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#151B29] border border-[#30364A] overflow-hidden hover:border-[#B9D1FF]/50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C7B9FF]/40"
              aria-label={`Profile settings for ${currentUser.name}`}
              title={`Logged in as ${currentUser.name}`}
            >
              {currentUser.avatarUrl ? (
                <Image
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  width={32}
                  height={32}
                  className="w-full h-full object-cover"
                  unoptimized={Boolean(currentUser.avatarUrl?.startsWith('data:') || currentUser.avatarUrl?.startsWith('http'))}
                />
              ) : (
                <span className="text-xs font-medium text-[#C7B9FF]">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
