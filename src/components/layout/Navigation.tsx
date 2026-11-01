'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Compass, UserCheck, Waves } from 'lucide-react';
import { NavigationTab } from '@/types';

export function DesktopNavigation() {
  const { activeTab, setActiveTab } = useApp();

  const tabs: { id: NavigationTab; label: string; renderIcon: (isActive: boolean) => React.ReactNode }[] = [
    {
      id: 'intentions',
      label: 'Intentions',
      renderIcon: (isActive) => (
        <Compass className={`w-4 h-4 transition-colors ${isActive ? 'text-[#C7B9FF]' : 'text-[#64708D]'}`} />
      ),
    },
    {
      id: 'meditate',
      label: 'Meditate',
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
      label: 'My Practice',
      renderIcon: (isActive) => (
        <UserCheck className={`w-4 h-4 transition-colors ${isActive ? 'text-[#C7B9FF]' : 'text-[#64708D]'}`} />
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
              onClick={() => setActiveTab(tab.id)}
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
  const { activeTab, setActiveTab } = useApp();

  const tabs: { id: NavigationTab; label: string; renderIcon: (isActive: boolean) => React.ReactNode }[] = [
    {
      id: 'intentions',
      label: 'Intentions',
      renderIcon: (isActive) => (
        <Compass className={`w-5 h-5 transition-colors ${isActive ? 'text-[#C7B9FF]' : 'text-[#64708D]'}`} />
      ),
    },
    {
      id: 'meditate',
      label: 'Meditate',
      renderIcon: () => (
        <Waves
          size={24}
          strokeWidth={1.5}
          className="text-violet-200"
        />
      ),
    },
    {
      id: 'practice',
      label: 'My Practice',
      renderIcon: (isActive) => (
        <UserCheck className={`w-5 h-5 transition-colors ${isActive ? 'text-[#C7B9FF]' : 'text-[#64708D]'}`} />
      ),
    },
  ];

  return (
    <nav
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080B15]/90 border-t border-[#242c40] backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
      aria-label="Mobile Navigation"
    >
      <div className="grid grid-cols-3 h-16 max-w-md mx-auto items-center px-4">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id || (tab.id === 'intentions' && activeTab === 'discover');
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 py-1 transition-colors ${
                isActive ? 'text-[#C7B9FF]' : 'text-[#64708D] hover:text-[#A8B1C8]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <div className="relative flex items-center justify-center">
                {tab.renderIcon(isActive)}
                {isActive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C7B9FF]" />
                )}
              </div>
              <span className="text-[10px] font-medium tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
