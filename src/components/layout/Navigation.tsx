'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Calendar, Compass, LayoutGrid, Waves } from 'lucide-react';
import { PracticeIcon } from '@/components/common/PracticeIcon';
import { NavigationTab } from '@/types';

export function DesktopNavigation() {
  const { activeTab, setActiveTab, t } = useApp();

  const tabs: { id: NavigationTab; label: string; renderIcon: (isActive: boolean) => React.ReactNode }[] = [
    {
      id: 'intentions',
      label: t('nav.intentions'),
      renderIcon: (isActive) => (
        <Compass className={`w-4 h-4 transition-colors ${isActive ? 'text-[#C7B9FF]' : 'text-[#64708D]'}`} />
      ),
    },
    {
      id: 'meditate',
      label: t('nav.meditationRoom'),
      renderIcon: (isActive) => (
        <Waves
          size={18}
          strokeWidth={1.5}
          className={`transition-colors ${isActive ? 'text-violet-200' : 'text-[#64708D]'}`}
        />
      ),
    },
    {
      id: 'practice',
      label: t('nav.myPractice'),
      renderIcon: (isActive) => (
        <PracticeIcon
          size={18}
          strokeWidth={1.75}
          className={`transition-colors ${isActive ? 'text-[#C7B9FF]' : 'text-[#64708D]'}`}
        />
      ),
    },
  ];

  return (
    <nav className="hidden sm:flex items-center justify-center py-4 bg-transparent" aria-label="Main Navigation">
      <div className="flex items-center p-1 rounded-full bg-[#111827]/80 border border-[#242c40] backdrop-blur-sm shadow-inner">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id || (tab.id === 'intentions' && activeTab === 'discover');
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab.bind(null, tab.id)()}
              className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[#151B29] text-[#F3F3FA] shadow-[0_0_12px_rgba(199,185,255,0.12)] border border-[#3e4a6b]'
                  : 'text-[#A8B1C8] hover:text-[#F3F3FA] hover:bg-[#151B29]/40'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.renderIcon(isActive)}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileNavigation() {
  const { activeTab, setActiveTab, t } = useApp();

  const tabs: {
    id: NavigationTab;
    label: string;
    renderIcon: (isActive: boolean) => React.ReactNode;
  }[] = [
    {
      id: 'intentions',
      label: t('nav.intentions'),
      renderIcon: (isActive) => (
        <LayoutGrid className={`w-4 h-4 transition-colors ${isActive ? 'text-[#C7B9FF]' : 'text-[#64708D]'}`} />
      ),
    },
    {
      id: 'calendar',
      label: t('nav.calendar'),
      renderIcon: (isActive) => (
        <Calendar className={`w-4 h-4 transition-colors ${isActive ? 'text-[#C7B9FF]' : 'text-[#64708D]'}`} />
      ),
    },
    {
      id: 'meditate',
      label: t('nav.meditationRoom'),
      renderIcon: (isActive) => (
        <Waves
          size={16}
          strokeWidth={1.5}
          className={`transition-colors ${isActive ? 'text-[#C7B9FF]' : 'text-[#64708D]'}`}
        />
      ),
    },
    {
      id: 'practice',
      label: t('nav.myPractice'),
      renderIcon: (isActive) => (
        <PracticeIcon
          size={18}
          strokeWidth={1.75}
          className={`transition-colors ${isActive ? 'text-[#C7B9FF]' : 'text-[#64708D]'}`}
        />
      ),
    },
  ];

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080B15]/95 border-t border-[#242c40] backdrop-blur-md pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.5)]"
      aria-label="Mobile Navigation"
    >
      {/* 4 columnas exactamente iguales al 25% del ancho de pantalla para equidistancia matemáticamente perfecta */}
      <div className="w-full h-16 grid grid-cols-4 items-center">
        {tabs.map((tab) => {
          const isActive =
            activeTab === tab.id ||
            (tab.id === 'intentions' && activeTab === 'discover');
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full h-full flex flex-col items-center justify-center py-1 transition-colors cursor-pointer select-none ${
                isActive ? 'text-[#C7B9FF]' : 'text-[#64708D] hover:text-[#A8B1C8]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Slot de icono centrado en su cuadrante */}
              <div className="relative h-6 w-full flex items-center justify-center">
                {tab.renderIcon(isActive)}
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C7B9FF] shadow-[0_0_4px_#C7B9FF]" />
                )}
              </div>

              {/* Slot de texto centrado con padding simétrico */}
              <div className="h-6 w-full flex items-center justify-center px-1 text-center">
                <span className={`text-[10px] leading-tight tracking-tight text-center ${isActive ? 'font-medium text-[#F3F3FA]' : 'font-normal'}`}>
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
