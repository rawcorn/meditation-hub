'use client';

import React from 'react';
import { Intention } from '@/types';
import { useApp } from '@/context/AppContext';
import { Check, CheckCircle2, Clock, Heart, MessageSquare, Users, Waves } from 'lucide-react';
import Image from 'next/image';
import { useIsMounted } from '@/lib/useIsMounted';
import { useCurrentTimestamp } from '@/lib/useCurrentTimestamp';

interface IntentionCardProps {
  intention: Intention;
}

export function IntentionCard({ intention }: IntentionCardProps) {
  const {
    joinedIntentionIds,
    joinIntention,
    leaveIntention,
    setSelectedDetailIntention,
    startMeditationForIntention,
    t,
    tCategory,
    language,
  } = useApp();

  const isJoined = joinedIntentionIds.includes(intention.id);
  const isMounted = useIsMounted();
  const nowTimestamp = useCurrentTimestamp();

  // Format scheduled local time with timezone consideration
  const formatScheduledTime = (isoString?: string) => {
    try {
      const date = isoString ? new Date(isoString) : new Date(Date.now() + 24 * 3600 * 1000);
      if (!isMounted) {
        return language === 'es' ? 'Sesión programada (tu hora local)' : 'Scheduled session (your time)';
      }
      const isToday = new Date().toDateString() === date.toDateString();
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (isToday) {
        return language === 'es'
          ? `Hoy a las ${timeStr} (tu hora)`
          : `Today at ${timeStr} (your time)`;
      }
      return language === 'es'
        ? `${date.toLocaleDateString('es', { month: 'short', day: 'numeric' })} a las ${timeStr} (tu hora)`
        : `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr} (your time)`;
    } catch {
      return language === 'es' ? 'Mañana a las 18:00 (tu hora)' : 'Tomorrow at 18:00 (your time)';
    }
  };

  const categoryColorMap: Record<string, string> = {
    'Physical': 'bg-[#15232d] text-[#A8DCC9] border-[#A8DCC9]/30',
    'Mental & Emotional': 'bg-[#221c33] text-[#C7B9FF] border-[#C7B9FF]/30',
    'Love & Relationships': 'bg-[#2c1d28] text-[#FFB9D2] border-[#FFB9D2]/30',
    'Financial': 'bg-[#1a2629] text-[#B9E9FF] border-[#B9E9FF]/30',
    'World': 'bg-[#1b233a] text-[#B9D1FF] border-[#B9D1FF]/30',
    'Global Peace': 'bg-[#1b233a] text-[#B9D1FF] border-[#B9D1FF]/30',
    'Other': 'bg-[#1a1f2c] text-[#A8B1C8] border-[#A8B1C8]/30',
  };

  const isPastSession =
    isMounted &&
    intention.scheduledAt &&
    new Date(intention.scheduledAt).getTime() < (nowTimestamp || (typeof window !== 'undefined' ? Date.now() : 0));

  return (
    <article
      className="group relative rounded-2xl bg-[#111827]/90 border border-[#242c40] hover:border-[#3e4a6b] transition-all duration-300 p-5 sm:p-6 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex flex-col justify-between"
      aria-labelledby={`intention-title-${intention.id}`}
    >
      {/* Clickable Card Body Area (opens intention details) */}
      <div
        onClick={() => setSelectedDetailIntention(intention)}
        className="cursor-pointer focus:outline-none"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setSelectedDetailIntention(intention);
          }
        }}
      >
        {/* Header row: Category & Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                categoryColorMap[intention.category] || 'bg-[#151B29] text-[#A8B1C8] border-[#242c40]'
              }`}
            >
              {tCategory(intention.category)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {intention.isSample && (
              <span className="text-[10px] text-[#64708D] tracking-wider uppercase font-medium">
                {language === 'es' ? 'Ejemplo' : 'Sample'}
              </span>
            )}
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#151B29] border border-[#242c40] text-[11px] text-[#A8B1C8]">
              <Users className="w-3 h-3 text-[#C7B9FF]" />
              <span>
                {intention.participantCount}{' '}
                {language === 'es'
                  ? intention.participantCount === 1
                    ? 'meditador'
                    : 'meditadores'
                  : intention.participantCount === 1
                  ? 'meditator'
                  : 'meditators'}
              </span>
            </span>
          </div>
        </div>

        {/* Content body: Optional image + details */}
        <div className="flex gap-4 sm:gap-5 items-start">
          {intention.imageUrl && (
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 border border-[#242c40] bg-[#151B29]">
              <Image
                src={intention.imageUrl}
                alt={intention.recipient}
                fill
                sizes="(max-width: 640px) 80px, 96px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                unoptimized={Boolean(intention.imageUrl?.startsWith('data:') || intention.imageUrl?.startsWith('http'))}
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium text-[#C7B9FF] tracking-wide uppercase mb-0.5">
              {t('card.for')}: <span className="font-normal text-[#F3F3FA]">{intention.recipient}</span>
            </div>

            <h3
              id={`intention-title-${intention.id}`}
              className="text-base sm:text-lg font-semibold text-[#F3F3FA] group-hover:text-[#C7B9FF] transition-colors leading-snug line-clamp-2"
            >
              {intention.title}
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-[#A8B1C8] leading-relaxed line-clamp-3">
              {intention.description}
            </p>
          </div>
        </div>

        {/* Option B: Group Session schedule banner directly below description and above footer */}
        {intention.scheduledAt && (
          <div className="mt-3.5 pt-2.5 border-t border-[#242c40]/40 flex items-center gap-2 flex-wrap">
            {isPastSession ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111827] border border-[#242c40] text-[#64708D] text-[11px]">
                <CheckCircle2 className="w-3 h-3 text-[#64708D]" />
                <span className="font-medium text-[#8E9AAE]">
                  {language === 'es' ? 'Meditación grupal concluida:' : 'Group Meditation concluded:'}
                </span>
                <span>{formatScheduledTime(intention.scheduledAt)}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#151B29] border border-[#30364A] text-[#A8B1C8] text-[11px]">
                <Clock className="w-3 h-3 text-[#C7B9FF]" />
                <span className="font-medium text-[#C7B9FF]">
                  {language === 'es' ? 'Meditación grupal:' : 'Group Meditation:'}
                </span>
                <span className="text-[#F3F3FA]">{formatScheduledTime(intention.scheduledAt)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer action bar: clean and aligned on a single row */}
      <div className="mt-4 pt-3 border-t border-[#242c40]/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Join/Joined button */}
          <button
            onClick={() => (isJoined ? leaveIntention(intention.id) : joinIntention(intention.id))}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
              isJoined
                ? 'bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/40 shadow-[0_0_8px_rgba(199,185,255,0.15)] hover:border-[#C7B9FF]/80'
                : 'bg-[#151B29] text-[#F3F3FA] border border-[#30364A] hover:border-[#B9D1FF]/60 hover:bg-[#1a2233]'
            }`}
            aria-pressed={isJoined}
          >
            {isJoined ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#C7B9FF]" />
                <span>{t('card.joined')}</span>
              </>
            ) : (
              <>
                <Heart className="w-3.5 h-3.5 text-[#64708D] group-hover:text-[#C7B9FF] transition-colors" />
                <span>{t('card.join')}</span>
              </>
            )}
          </button>

          {/* Single Unified Meditate button */}
          <button
            onClick={() => startMeditationForIntention(intention)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#1b233a] hover:bg-[#253052] text-[#C7B9FF] border border-[#C7B9FF]/40 hover:border-[#C7B9FF] transition-all cursor-pointer shadow-sm active:scale-95"
            title={t('card.meditate')}
          >
            <Waves size={14} strokeWidth={1.5} className="text-violet-200" />
            <span>{t('card.meditate')}</span>
          </button>
        </div>

        {/* Journal */}
        <button
          onClick={() => setSelectedDetailIntention(intention)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#151B29] hover:bg-[#1a2336] text-[#A8B1C8] hover:text-[#F3F3FA] border border-[#242c40] hover:border-[#3e4a6b] transition-all cursor-pointer shadow-sm shrink-0"
          title={language === 'es' ? 'Ver diario y mensajes' : 'Open updates and reflections journal'}
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#A8B1C8]" />
          <span>{language === 'es' ? 'Diario' : 'Journal'}</span>
        </button>
      </div>
    </article>
  );
}
