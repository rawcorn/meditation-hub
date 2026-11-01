'use client';

import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Calendar, Clock, Globe, Heart, Check, Users, Waves } from 'lucide-react';

export function CollectiveScheduleCalendar() {
  const {
    intentions,
    joinedIntentionIds,
    joinIntention,
    leaveIntention,
    startMeditationForIntention,
    setSelectedDetailIntention,
  } = useApp();

  // Detect local timezone & client mount timestamp safely
  const [localTimezone, setLocalTimezone] = useState('UTC');
  const [nowTimestamp, setNowTimestamp] = useState<number | null>(null);

  React.useEffect(() => {
    try {
      setLocalTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC');
    } catch {
      // fallback
    }
    setNowTimestamp(Date.now());
  }, []);

  // Filter only intentions with scheduled sessions, sorted by date asc
  const scheduledIntentions = useMemo(() => {
    return intentions
      .filter((i) => i.sessionType === 'scheduled' && i.scheduledAt)
      .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime());
  }, [intentions]);

  // Group by date (Local date string)
  const groupedSchedule = useMemo(() => {
    const groups: Record<string, typeof scheduledIntentions> = {};
    scheduledIntentions.forEach((item) => {
      const d = new Date(item.scheduledAt!);
      const dateKey = d.toLocaleDateString(undefined, {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });
    return groups;
  }, [scheduledIntentions]);

  const [selectedDateFilter, setSelectedDateFilter] = useState<string>('all');

  const dateKeys = Object.keys(groupedSchedule);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Calendar Header with Timezone Indicator */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#111827] border border-[#242c40] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#C7B9FF] font-medium mb-1">
            <Calendar className="w-4 h-4 text-[#C7B9FF]" />
            <span>Collective Meditation Schedule</span>
          </div>
          <h2 className="text-base sm:text-lg font-light text-[#F3F3FA]">
            Global Encounters & Synchronous Gatherings
          </h2>
        </div>

        {/* Local timezone badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#151B29] border border-[#30364A] text-xs text-[#B9D1FF] self-start sm:self-auto">
          <Globe className="w-3.5 h-3.5 text-[#B9D1FF]" />
          <span>Times shown in your local zone: <strong className="font-medium text-[#F3F3FA]">{localTimezone}</strong></span>
        </div>
      </div>

      {/* Date Filter Chips if multiple days exist */}
      {dateKeys.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setSelectedDateFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedDateFilter === 'all'
                ? 'bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/40 shadow-sm'
                : 'bg-[#111827] text-[#A8B1C8] hover:text-[#F3F3FA] border border-[#242c40]'
            }`}
          >
            All Encounters ({scheduledIntentions.length})
          </button>
          {dateKeys.map((dKey) => (
            <button
              key={dKey}
              onClick={() => setSelectedDateFilter(dKey)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedDateFilter === dKey
                  ? 'bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/40 shadow-sm'
                  : 'bg-[#111827] text-[#A8B1C8] hover:text-[#F3F3FA] border border-[#242c40]'
              }`}
            >
              {dKey} ({groupedSchedule[dKey].length})
            </button>
          ))}
        </div>
      )}

      {/* Empty State */}
      {scheduledIntentions.length === 0 ? (
        <div className="p-8 sm:p-12 text-center rounded-2xl bg-[#111827]/60 border border-[#242c40] space-y-3">
          <Clock className="w-8 h-8 text-[#64708D] mx-auto" />
          <h3 className="text-sm font-medium text-[#F3F3FA]">No upcoming scheduled encounters</h3>
          <p className="text-xs text-[#A8B1C8] max-w-sm mx-auto">
            All intentions are currently available for open meditation at any time. When a member schedules a collective session, it will appear here.
          </p>
        </div>
      ) : (
        /* Schedule Encounters Grouped by Day */
        <div className="space-y-6">
          {dateKeys
            .filter((dKey) => selectedDateFilter === 'all' || selectedDateFilter === dKey)
            .map((dateKey) => {
              const items = groupedSchedule[dateKey];
              return (
                <div key={dateKey} className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-2 h-2 rounded-full bg-[#C7B9FF]" />
                    <h3 className="text-xs sm:text-sm font-medium text-[#F3F3FA] tracking-wide">
                      {dateKey}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {items.map((intention) => {
                      const isJoined = joinedIntentionIds.includes(intention.id);
                      const d = new Date(intention.scheduledAt!);
                      const timeString = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const hoursDiff = nowTimestamp ? (d.getTime() - nowTimestamp) / (1000 * 60 * 60) : 12;

                      let countdownLabel = '';
                      if (hoursDiff < 0) {
                        countdownLabel = 'Past encounter';
                      } else if (hoursDiff < 1) {
                        const mins = Math.max(1, Math.round(hoursDiff * 60));
                        countdownLabel = `Starting in ${mins} minutes`;
                      } else if (hoursDiff < 24) {
                        countdownLabel = `In ${Math.round(hoursDiff)} hours`;
                      } else {
                        const days = Math.round(hoursDiff / 24);
                        countdownLabel = `In ${days} day${days > 1 ? 's' : ''}`;
                      }

                      return (
                        <div
                          key={intention.id}
                          className="p-4 sm:p-5 rounded-2xl bg-[#111827]/90 border border-[#242c40] hover:border-[#3e4a6b] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                        >
                          <div className="flex gap-4 items-start flex-1 min-w-0">
                            {/* Time Tile Square */}
                            <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-[#151B29] border border-[#30364A] shrink-0 text-center p-1">
                              <span className="text-[10px] text-[#A8B1C8] uppercase font-medium">Local</span>
                              <span className="text-sm font-semibold text-[#B9D1FF] tracking-tight">{timeString}</span>
                              <span className="text-[9px] text-[#64708D] truncate max-w-[56px]">
                                {countdownLabel}
                              </span>
                            </div>

                            {/* Intention info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] uppercase font-medium text-[#C7B9FF] tracking-wider">
                                  Space for {intention.recipient}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#151B29] text-[#A8B1C8] border border-[#242c40]">
                                  {intention.category}
                                </span>
                              </div>

                              <h4
                                onClick={() => setSelectedDetailIntention(intention)}
                                className="text-sm sm:text-base font-semibold text-[#F3F3FA] hover:text-[#C7B9FF] transition-colors cursor-pointer truncate"
                              >
                                {intention.title}
                              </h4>

                              <p className="text-xs text-[#A8B1C8] line-clamp-1 mt-0.5">
                                {intention.description}
                              </p>

                              <div className="flex items-center gap-2 text-[11px] text-[#64708D] mt-2">
                                <Users className="w-3.5 h-3.5 text-[#C7B9FF]" />
                                <span>{intention.participantCount} practitioners registered</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Group Meditation + Meditate Anytime + Join */}
                          <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#242c40]/60">
                            {/* Primary Button: Enter Group Meditation */}
                            <button
                              onClick={() => startMeditationForIntention(intention, true)}
                              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium bg-[#1b233a] hover:bg-[#253052] text-[#C7B9FF] border border-[#C7B9FF]/50 hover:border-[#C7B9FF]/90 transition-all cursor-pointer shadow-[0_0_12px_rgba(199,185,255,0.18)] active:scale-95"
                              title="Enter the scheduled collective meditation space"
                            >
                              <Waves size={16} strokeWidth={1.5} className="text-violet-200" />
                              <span>Enter Group Meditation</span>
                            </button>

                            {/* Secondary Button: Meditate Anytime (solo / outside scheduled time) */}
                            <button
                              onClick={() => startMeditationForIntention(intention, false)}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-[#151B29] hover:bg-[#1a2233] text-[#A8B1C8] hover:text-[#F3F3FA] border border-[#242c40] transition-colors cursor-pointer"
                              title="Meditate for this intention anytime outside the scheduled hour"
                            >
                              <span>Meditate Solo</span>
                            </button>

                            {/* Join / Leave toggle */}
                            <button
                              onClick={() => (isJoined ? leaveIntention(intention.id) : joinIntention(intention.id))}
                              className={`p-2 rounded-full border transition-colors cursor-pointer ${
                                isJoined
                                  ? 'bg-[#1b233a] border-[#C7B9FF]/40 text-[#C7B9FF]'
                                  : 'bg-[#151B29] border-[#242c40] text-[#64708D] hover:text-[#C7B9FF]'
                              }`}
                              title={isJoined ? 'Joined this intention' : 'Join intention'}
                              aria-label={isJoined ? 'Joined this intention' : 'Join intention'}
                            >
                              {isJoined ? <Check className="w-4 h-4 text-[#C7B9FF]" /> : <Heart className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
