'use client';

import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DataService } from '@/services/dataService';
import { Calendar, Plus, UserCheck, Waves } from 'lucide-react';
import { IntentionCard } from '../discover/IntentionCard';

export function MyPracticeView() {
  const {
    currentUser,
    intentions,
    joinedIntentionIds,
    setIsCreateModalOpen,
    startMeditationForIntention,
  } = useApp();

  const [intentionSubTab, setIntentionSubTab] = useState<'joined' | 'created'>('joined');

  const stats = useMemo(() => {
    return DataService.getPracticeStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intentions.length, joinedIntentionIds.length]);

  // Intentions created by user
  const createdIntentions = useMemo(() => {
    return intentions.filter((item) => item.creatorId === currentUser.id);
  }, [intentions, currentUser.id]);

  // Intentions joined by user
  const joinedIntentions = useMemo(() => {
    return intentions.filter((item) => joinedIntentionIds.includes(item.id));
  }, [intentions, joinedIntentionIds]);

  // Calendar rendering for the current month (deferred to client mount to avoid prerender dynamic date restriction)
  const [calendarDays, setCalendarDays] = useState<{
    daysArray: { day: number; hasMeditated: boolean; isToday: boolean }[];
    firstDayIndex: number;
    monthName: string;
  }>({ daysArray: [], firstDayIndex: 0, monthName: '' });

  React.useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun

    const daysArray: { day: number; hasMeditated: boolean; isToday: boolean }[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
      daysArray.push({
        day: i,
        hasMeditated: stats.daysSet.has(i),
        isToday: i === today.getDate(),
      });
    }

    setCalendarDays({
      daysArray,
      firstDayIndex,
      monthName: today.toLocaleString('default', { month: 'long', year: 'numeric' }),
    });
  }, [stats.daysSet]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10 animate-in fade-in duration-300">
      {/* Header Sanctuary Presence */}
      <section className="text-center py-4 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827] border border-[#242c40] text-xs text-[#C7B9FF] mb-3">
          <UserCheck className="w-3.5 h-3.5" />
          <span>Personal Practice Space</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-light text-[#F3F3FA] tracking-tight">
          Quiet consistency.
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-[#A8B1C8] max-w-md mx-auto">
          Every moment of stillness makes space for someone. No scores, no streaks, simply presence.
        </p>
      </section>

      {/* Primary Accumulated Time Highlight Card */}
      <div className="rounded-3xl bg-gradient-to-b from-[#111827] to-[#151B29] border border-[#242c40] p-6 sm:p-8 text-center relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        {/* Soft background ambient gradient */}
        <div className="absolute inset-0 bg-ambient-radial pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest text-[#A8B1C8] font-medium mb-1">
            Time spent in meditation
          </span>
          <div className="text-4xl sm:text-6xl font-light text-[#F3F3FA] tracking-tight font-sans my-2">
            {stats.totalTimeFormatted}
          </div>
          <p className="text-xs text-[#64708D] max-w-xs leading-relaxed">
            Accumulated active presence shared with yourself and the community.
          </p>

          <button
            onClick={() => startMeditationForIntention(null)}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-[#1b233a] hover:bg-[#232c4a] text-[#C7B9FF] border border-[#C7B9FF]/30 hover:border-[#C7B9FF]/60 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Waves size={16} strokeWidth={1.5} className="text-violet-200" />
            <span>Begin Open Meditation</span>
          </button>
        </div>
      </div>

      {/* The 3 Core Calm Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl bg-[#111827]/80 border border-[#242c40] p-5 text-center flex flex-col items-center justify-center">
          <span className="text-xs text-[#A8B1C8] mb-1">Intentions Joined</span>
          <span className="text-2xl sm:text-3xl font-light text-[#F3F3FA]">
            {stats.intentionsJoinedCount}
          </span>
          <span className="text-[11px] text-[#64708D] mt-1">Holding space</span>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl bg-[#111827]/80 border border-[#242c40] p-5 text-center flex flex-col items-center justify-center">
          <span className="text-xs text-[#A8B1C8] mb-1">Days Meditated This Month</span>
          <span className="text-2xl sm:text-3xl font-light text-[#C7B9FF]">
            {stats.daysThisMonthCount}
          </span>
          <span className="text-[11px] text-[#64708D] mt-1">Quiet days</span>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl bg-[#111827]/80 border border-[#242c40] p-5 text-center flex flex-col items-center justify-center">
          <span className="text-xs text-[#A8B1C8] mb-1">Sessions Completed</span>
          <span className="text-2xl sm:text-3xl font-light text-[#B9D1FF]">
            {stats.sessionsCompletedCount}
          </span>
          <span className="text-[11px] text-[#64708D] mt-1">Dedicated sittings</span>
        </div>
      </div>

      {/* Quiet Practice Calendar */}
      <section className="rounded-2xl bg-[#111827]/60 border border-[#242c40] p-5 sm:p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#C7B9FF]" />
            <h3 className="text-sm font-medium text-[#F3F3FA]">
              {calendarDays.monthName}
            </h3>
          </div>
          <span className="text-[11px] text-[#64708D]">
            Presence markers
          </span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-xs">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <span key={d} className="text-[10px] text-[#64708D] font-medium py-1">
              {d}
            </span>
          ))}

          {/* Empty spacer blocks for first day alignment */}
          {Array.from({ length: calendarDays.firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-8 sm:h-9" />
          ))}

          {/* Calendar day tiles */}
          {calendarDays.daysArray.map(({ day, hasMeditated, isToday }) => (
            <div
              key={day}
              className={`h-8 sm:h-9 rounded-lg flex flex-col items-center justify-center relative transition-all ${
                hasMeditated
                  ? 'bg-[#1b233a] border border-[#C7B9FF]/40 text-[#F3F3FA]'
                  : isToday
                  ? 'bg-[#151B29] border border-[#3e4a6b] text-[#F3F3FA]'
                  : 'bg-[#111827]/40 text-[#64708D]'
              }`}
            >
              <span className="text-xs font-light">{day}</span>
              {hasMeditated && (
                <span className="w-1 h-1 rounded-full bg-[#C7B9FF] shadow-[0_0_4px_#C7B9FF] absolute bottom-1" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Your Intentions (Joined vs Created) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#242c40] pb-3">
          <h2 className="text-lg font-light text-[#F3F3FA] flex items-center gap-2">
            <span>Your Intentions</span>
          </h2>

          <div className="flex items-center gap-1 p-1 rounded-full bg-[#111827] border border-[#242c40]">
            <button
              onClick={() => setIntentionSubTab('joined')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                intentionSubTab === 'joined'
                  ? 'bg-[#151B29] text-[#C7B9FF] border border-[#30364A]'
                  : 'text-[#64708D] hover:text-[#A8B1C8]'
              }`}
            >
              Joined ({joinedIntentions.length})
            </button>
            <button
              onClick={() => setIntentionSubTab('created')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                intentionSubTab === 'created'
                  ? 'bg-[#151B29] text-[#C7B9FF] border border-[#30364A]'
                  : 'text-[#64708D] hover:text-[#A8B1C8]'
              }`}
            >
              Created ({createdIntentions.length})
            </button>
          </div>
        </div>

        {/* Intention List */}
        {intentionSubTab === 'joined' ? (
          joinedIntentions.length === 0 ? (
            <div className="rounded-2xl bg-[#111827]/50 border border-[#242c40] p-8 text-center text-xs text-[#A8B1C8]">
              You haven&apos;t joined any intentions yet. Explore the Discover section to hold space for others.
            </div>
          ) : (
            <div className="space-y-4">
              {joinedIntentions.map((item) => (
                <IntentionCard key={item.id} intention={item} />
              ))}
            </div>
          )
        ) : createdIntentions.length === 0 ? (
          <div className="rounded-2xl bg-[#111827]/50 border border-[#242c40] p-8 text-center space-y-3">
            <p className="text-xs text-[#A8B1C8]">
              You haven&apos;t published any intentions yet.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/30 hover:border-[#C7B9FF]/60 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create an Intention</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {createdIntentions.map((item) => (
              <IntentionCard key={item.id} intention={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
