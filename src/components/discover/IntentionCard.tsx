'use client';

import React from 'react';
import { Intention } from '@/types';
import { useApp } from '@/context/AppContext';
import { Calendar, Check, Clock, Heart, MessageSquare, Sparkles, Waves } from 'lucide-react';
import Image from 'next/image';

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
  } = useApp();

  const isJoined = joinedIntentionIds.includes(intention.id);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format scheduled local time with timezone consideration
  const formatScheduledTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      if (!isMounted) {
        return 'Scheduled session';
      }
      const isToday = new Date().toDateString() === date.toDateString();
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (isToday) {
        return `Today at ${timeStr} (Local)`;
      }
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr} (Local)`;
    } catch {
      return 'Upcoming session';
    }
  };

  const categoryColorMap: Record<string, string> = {
    'Physical Wellbeing': 'bg-[#15232d] text-[#A8DCC9] border-[#A8DCC9]/30',
    'Mental & Emotional Wellbeing': 'bg-[#221c33] text-[#C7B9FF] border-[#C7B9FF]/30',
    'Love & Relationships': 'bg-[#2c1d28] text-[#FFB9D2] border-[#FFB9D2]/30',
    'Financial Wellbeing': 'bg-[#1a2629] text-[#B9E9FF] border-[#B9E9FF]/30',
    'Global Peace': 'bg-[#1b233a] text-[#B9D1FF] border-[#B9D1FF]/30',
    'Other': 'bg-[#1a1f2c] text-[#A8B1C8] border-[#A8B1C8]/30',
  };

  return (
    <article
      className="group relative rounded-2xl bg-[#111827]/90 border border-[#242c40] hover:border-[#3e4a6b] transition-all duration-300 p-5 sm:p-6 backdrop-blur-sm shadow-[0_4px_20px_rgba(0,0,0,0.25)] flex flex-col justify-between"
      aria-labelledby={`intention-title-${intention.id}`}
    >
      <div>
        {/* Header row: Category & Session Type badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              categoryColorMap[intention.category] || 'bg-[#151B29] text-[#A8B1C8] border-[#242c40]'
            }`}
          >
            {intention.category}
          </span>

          <div className="flex items-center gap-2">
            {intention.isSample && (
              <span className="text-[10px] text-[#64708D] tracking-wider uppercase font-medium">
                Sample
              </span>
            )}
            {intention.sessionType === 'scheduled' ? (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1b233a] text-[#B9D1FF] text-[11px] border border-[#B9D1FF]/30">
                <Calendar className="w-3 h-3" />
                <span>Scheduled Session</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#151B29] text-[#A8B1C8] text-[11px] border border-[#242c40]">
                <span>Open Intention</span>
              </span>
            )}
          </div>
        </div>

        {/* Scheduled time info bar */}
        {intention.sessionType === 'scheduled' && intention.scheduledAt && (
          <div className="flex items-center gap-2 text-xs text-[#B9D1FF] bg-[#151B29]/80 rounded-lg px-3 py-1.5 mb-3 border border-[#242c40]/80">
            <Clock className="w-3.5 h-3.5 shrink-0 text-[#B9D1FF]" />
            <span>Next collective encounter: {formatScheduledTime(intention.scheduledAt)}</span>
          </div>
        )}

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
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-medium text-[#C7B9FF] tracking-wide uppercase mb-0.5">
              Space for: <span className="font-normal text-[#F3F3FA]">{intention.recipient}</span>
            </div>

            <h3
              id={`intention-title-${intention.id}`}
              onClick={() => setSelectedDetailIntention(intention)}
              className="text-base sm:text-lg font-semibold text-[#F3F3FA] hover:text-[#C7B9FF] transition-colors cursor-pointer leading-snug line-clamp-2"
            >
              {intention.title}
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-[#A8B1C8] leading-relaxed line-clamp-3">
              {intention.description}
            </p>
          </div>
        </div>

        {/* Creator reflection summary line */}
        {intention.updates && intention.updates.length > 0 && (
          <div className="mt-4 pt-3 border-t border-[#242c40]/60 flex items-start gap-2 text-xs text-[#A8B1C8]/90">
            <Sparkles className="w-3.5 h-3.5 mt-0.5 text-[#C7B9FF] shrink-0" />
            <p className="line-clamp-1 italic">
              Latest update: &ldquo;{intention.updates[0].content}&rdquo;
            </p>
          </div>
        )}
      </div>

      {/* Footer action bar */}
      <div className="mt-5 pt-3.5 border-t border-[#242c40]/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                <span>Joined</span>
              </>
            ) : (
              <>
                <Heart className="w-3.5 h-3.5 text-[#64708D] group-hover:text-[#C7B9FF] transition-colors" />
                <span>Join Intention</span>
              </>
            )}
          </button>

          {/* If scheduled: Group Meditation button */}
          {intention.sessionType === 'scheduled' && (
            <button
              onClick={() => startMeditationForIntention(intention, true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/50 hover:border-[#C7B9FF]/90 transition-all cursor-pointer shadow-[0_0_10px_rgba(199,185,255,0.15)] active:scale-95"
              title="Enter group collective meditation session"
            >
              <Waves size={15} strokeWidth={1.5} className="text-violet-200" />
              <span>Enter Group Meditation</span>
            </button>
          )}

          {/* Meditate anytime (solo) */}
          <button
            onClick={() => startMeditationForIntention(intention, false)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-transparent hover:bg-[#151B29] text-[#A8B1C8] hover:text-[#B9D1FF] border border-transparent hover:border-[#242c40] transition-colors cursor-pointer"
            title={intention.sessionType === 'scheduled' ? 'Meditate solo outside scheduled time' : 'Meditate for this intention'}
          >
            <Waves size={14} strokeWidth={1.5} className="text-violet-200" />
            <span className="hidden sm:inline">
              {intention.sessionType === 'scheduled' ? 'Meditate Solo' : 'Meditate'}
            </span>
          </button>
        </div>

        {/* View updates / journal count */}
        <button
          onClick={() => setSelectedDetailIntention(intention)}
          className="flex items-center gap-1.5 text-xs text-[#A8B1C8] hover:text-[#F3F3FA] transition-colors cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5 text-[#64708D]" />
          <span>
            {intention.updates.length > 0
              ? `${intention.updates.length} ${intention.updates.length === 1 ? 'update' : 'updates'}`
              : 'View details'}
          </span>
        </button>
      </div>
    </article>
  );
}
