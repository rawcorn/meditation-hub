'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Calendar, LayoutGrid, Waves } from 'lucide-react';
import { PracticeIcon } from '@/components/common/PracticeIcon';

export function WelcomeHero() {
  const { activeTab, setActiveTab, t } = useApp();
  const isScheduleView = activeTab === 'calendar';

  return (
    <section className="relative z-10 w-full bg-transparent border-b-0 sm:border-b sm:border-[#242c40]/50 mb-4 sm:mb-10 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-4 sm:pt-6 sm:pb-10 text-center">
        {/* Título principal - tipografía, tamaño y peso intactos */}
        <h1 className="text-2xl sm:text-4xl font-light tracking-tight text-[#F3F3FA] font-sans">
          {t('hero.title')}
        </h1>

        {/* Subtítulo con separación estrecha y limpia (aprox. 12px) */}
        <p className="mt-3 text-sm sm:text-base text-[#A8B1C8] max-w-lg mx-auto font-light leading-relaxed">
          {t('hero.subtitle')}
        </p>

        {/* Fila de botones de navegación (Desktop) con separación amplia (36px-40px) y gap de 16px */}
        <div className="mt-9 sm:mt-10 hidden sm:flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => setActiveTab('intentions')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
              !isScheduleView
                ? 'bg-[#151B29] text-[#C7B9FF] border border-[#30364A] shadow-sm'
                : 'bg-[#111827]/60 text-[#A8B1C8] hover:text-[#F3F3FA] hover:bg-[#151B29] border border-[#242c40]/70'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{t('hero.allIntentionsBtn')}</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer ${
              isScheduleView
                ? 'bg-[#151B29] text-[#C7B9FF] border border-[#30364A] shadow-sm'
                : 'bg-[#111827]/60 text-[#A8B1C8] hover:text-[#F3F3FA] hover:bg-[#151B29] border border-[#242c40]/70'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t('hero.calendarBtn')}</span>
          </button>

          <button
            onClick={() => setActiveTab('meditate')}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer bg-[#111827]/60 text-[#A8B1C8] hover:text-[#F3F3FA] hover:bg-[#151B29] border border-[#242c40]/70"
          >
            <Waves size={15} strokeWidth={1.5} className="text-violet-200" />
            <span>{t('hero.meditationRoomBtn')}</span>
          </button>

          <button
            onClick={() => setActiveTab('practice')}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer bg-[#111827]/60 text-[#A8B1C8] hover:text-[#F3F3FA] hover:bg-[#151B29] border border-[#242c40]/70"
          >
            <PracticeIcon size={16} strokeWidth={1.75} />
            <span>{t('hero.myPracticeBtn')}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
