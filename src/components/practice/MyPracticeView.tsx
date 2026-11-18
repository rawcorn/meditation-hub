'use client';

import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DataService } from '@/services/dataService';
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Leaf,
  Plus,
  Waves,
} from 'lucide-react';
import { IntentionCard } from '../discover/IntentionCard';
import { useIsMounted } from '@/lib/useIsMounted';

export function MyPracticeView() {
  const {
    currentUser,
    intentions,
    joinedIntentionIds,
    sessionsVersion,
    setIsCreateModalOpen,
    setIsAuthModalOpen,
    startMeditationForIntention,
    setSelectedDetailIntention,
    setActiveTab,
    t,
    language,
  } = useApp();

  const [intentionSubTab, setIntentionSubTab] = useState<'joined' | 'created'>('joined');

  const stats = useMemo(() => {
    return DataService.getPracticeStats();
  }, [intentions.length, joinedIntentionIds.length, sessionsVersion]);

  // Intentions created by user
  const createdIntentions = useMemo(() => {
    return intentions.filter((item) => item.creatorId === currentUser.id);
  }, [intentions, currentUser.id]);

  // Intentions joined by user
  const joinedIntentions = useMemo(() => {
    return intentions.filter((item) => joinedIntentionIds.includes(item.id));
  }, [intentions, joinedIntentionIds]);

  const isMounted = useIsMounted();

  // Calendar month view date & selected day state
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(() => {
    return typeof window !== 'undefined' ? new Date().getDate() : 1;
  });

  const goToPrevMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    setViewDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const goToToday = () => {
    const now = new Date();
    setViewDate(now);
    setSelectedDay(now.getDate());
  };

  const isViewingCurrentMonth = useMemo(() => {
    if (!isMounted) return true;
    const now = new Date();
    return viewDate.getFullYear() === now.getFullYear() && viewDate.getMonth() === now.getMonth();
  }, [viewDate, isMounted]);

  // Calendar rendering (guarded by isMounted to avoid prerender dynamic date restriction)
  const calendarDays = useMemo(() => {
    if (!isMounted) {
      return {
        daysArray: [],
        firstDayIndex: 0,
        monthName: '',
        year: 2026,
        month: 0,
        sessionsByDay: {} as Record<number, typeof joinedIntentions>,
      };
    }
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sun

    // Map of joined scheduled sessions for this month: day -> Intention[]
    const sessionsByDay: Record<number, typeof joinedIntentions> = {};
    joinedIntentions.forEach((item) => {
      if (item.scheduledAt) {
        const itemDate = new Date(item.scheduledAt);
        if (itemDate.getFullYear() === year && itemDate.getMonth() === month) {
          const dNum = itemDate.getDate();
          if (!sessionsByDay[dNum]) sessionsByDay[dNum] = [];
          sessionsByDay[dNum].push(item);
        }
      }
    });

    const isCurrentMonthView = today.getFullYear() === year && today.getMonth() === month;

    const daysArray: {
      day: number;
      hasActivity: boolean;
      sessionCount: number;
      hasMeditated: boolean;
      isToday: boolean;
      isPast: boolean;
      isFuture: boolean;
    }[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const scheduledList = sessionsByDay[i] || [];
      const hasMeditated = isCurrentMonthView ? stats.daysSet.has(i) : false;
      const hasActivity = hasMeditated || scheduledList.length > 0;
      const dayDate = new Date(year, month, i);
      const isPast = dayDate.getTime() < todayStart;
      const isToday = isCurrentMonthView && i === today.getDate();
      const isFuture = dayDate.getTime() > todayStart && !isToday;

      daysArray.push({
        day: i,
        hasActivity,
        sessionCount: scheduledList.length + (hasMeditated ? 1 : 0),
        hasMeditated,
        isToday,
        isPast,
        isFuture,
      });
    }

    const localeStr = language === 'es' ? 'es-ES' : 'default';
    const rawMonthName = viewDate.toLocaleString(localeStr, { month: 'long', year: 'numeric' });
    const monthName = rawMonthName.charAt(0).toUpperCase() + rawMonthName.slice(1);

    return {
      daysArray,
      firstDayIndex,
      monthName,
      year,
      month,
      sessionsByDay,
    };
  }, [isMounted, viewDate, stats.daysSet, joinedIntentions, language]);

  // Format scheduled time helper
  const formatSessionTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return `${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (your time)`;
    } catch {
      return '';
    }
  };

  // Selected Day Details
  const selectedDayData = useMemo(() => {
    if (!selectedDay || !isMounted) return null;
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const year = calendarDays.year;
    const month = calendarDays.month;
    const isCurrentMonthView = today.getFullYear() === year && today.getMonth() === month;
    const isToday = isCurrentMonthView && selectedDay === today.getDate();
    const dayDate = new Date(year, month, selectedDay);
    const isPast = dayDate.getTime() < todayStart;
    const isFuture = dayDate.getTime() > todayStart && !isToday;

    const formattedDate = dayDate.toLocaleDateString(language === 'es' ? 'es-ES' : undefined, {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });

    const sessions = (calendarDays.sessionsByDay && calendarDays.sessionsByDay[selectedDay]) || [];
    
    // Calculate meditated minutes for the selected day from completed sessions
    const daySessions = (stats.sessions || []).filter((curr) => {
      const d = new Date(curr.startedAt);
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === selectedDay
      );
    });
    const meditatedSecondsOnDay = daySessions.reduce((acc, curr) => acc + (curr.activeDurationSeconds || 0), 0);
    const meditatedMinutes = Math.floor(meditatedSecondsOnDay / 60);
    const hasMeditated = meditatedMinutes >= 1;

    return {
      day: selectedDay,
      formattedDate,
      isToday,
      isPast,
      isFuture,
      sessions,
      hasMeditated,
      meditatedMinutes,
    };
  }, [selectedDay, isMounted, calendarDays, stats.daysSet, stats.sessions]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-6 animate-in fade-in duration-300">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setActiveTab('intentions')}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#A8B1C8] hover:text-[#F3F3FA] bg-[#111827] border border-[#242c40] hover:border-[#3e4a6b] transition-all cursor-pointer shadow-sm group"
          title={language === 'es' ? 'Volver a Intenciones' : 'Return to Intentions'}
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#C7B9FF] group-hover:-translate-x-0.5 transition-transform" />
          <span>{language === 'es' ? 'Volver a Intenciones' : 'Back to Intentions'}</span>
        </button>
      </div>

      {/* Guest Mode Practice Notice Banner */}
      {currentUser.isGuest && (
        <div className="rounded-2xl bg-gradient-to-r from-[#111827] via-[#151B29] to-[#141226] border border-[#C7B9FF]/25 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[#1b233a] border border-[#C7B9FF]/30 flex items-center justify-center shrink-0 mt-0.5">
              <Leaf className="w-4 h-4 text-[#C7B9FF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-medium text-[#F3F3FA]">
                  {language === 'es' ? 'Práctica en modo invitado' : 'Guest Practice Active'}
                </h4>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#151B29] text-[#A8B1C8] border border-[#242c40]">
                  {language === 'es' ? 'Solo en este dispositivo' : 'This Device Only'}
                </span>
              </div>
              <p className="text-xs text-[#A8B1C8] mt-1 max-w-xl leading-relaxed">
                {language === 'es'
                  ? 'Tus sesiones de meditación, intenciones y notas se guardan en este navegador. Inicia sesión para sincronizar entre tus dispositivos y resguardar tu historial.'
                  : 'Your meditation sessions, intentions, and journal reflections are saved in this browser. Sign in or register passwordless to sync across your devices and safeguard your practice history.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="shrink-0 px-4 py-2 rounded-full text-xs font-medium bg-[#1b233a] hover:bg-[#253052] text-[#C7B9FF] border border-[#C7B9FF]/40 hover:border-[#C7B9FF]/80 transition-all cursor-pointer shadow-sm active:scale-95 whitespace-nowrap"
          >
            {language === 'es' ? 'Iniciar sesión y sincronizar' : 'Sign In & Sync'}
          </button>
        </div>
      )}

      {/* Primary Accumulated Time Highlight Card */}
      <div className="rounded-3xl bg-gradient-to-b from-[#111827] to-[#151B29] border border-[#242c40] p-6 sm:p-8 text-center relative overflow-hidden shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        {/* Soft background ambient gradient */}
        <div className="absolute inset-0 bg-ambient-radial pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center">
          <span className="text-xs uppercase tracking-widest text-[#A8B1C8] font-medium mb-1">
            {language === 'es' ? 'Tiempo dedicado a meditar' : 'Time spent in meditation'}
          </span>
          <div className="text-4xl sm:text-6xl font-light text-[#F3F3FA] tracking-tight font-sans my-2">
            {stats.totalTimeFormatted}
          </div>
          <p className="text-xs text-[#64708D] max-w-xs leading-relaxed">
            {language === 'es'
              ? 'Horas acumuladas de meditación personal y grupal.'
              : 'Accumulated hours of personal and group meditation.'}
          </p>

          <button
            onClick={() => startMeditationForIntention(null)}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-[#1b233a] hover:bg-[#232c4a] text-[#C7B9FF] border border-[#C7B9FF]/30 hover:border-[#C7B9FF]/60 transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Waves size={16} strokeWidth={1.5} className="text-violet-200" />
            <span>{language === 'es' ? 'Comenzar meditación' : 'Begin Meditation'}</span>
          </button>
        </div>
      </div>

      {/* The 3 Core Calm Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="rounded-2xl bg-[#111827]/80 border border-[#242c40] p-5 text-center flex flex-col items-center justify-center">
          <span className="text-xs text-[#A8B1C8] mb-1">
            {language === 'es' ? 'Intenciones que sigo' : 'Intentions Joined'}
          </span>
          <span className="text-2xl sm:text-3xl font-light text-[#F3F3FA]">
            {stats.intentionsJoinedCount}
          </span>
          <span className="text-[11px] text-[#64708D] mt-1">
            {language === 'es' ? 'Sosteniendo espacio' : 'Holding space'}
          </span>
        </div>

        {/* Metric 2 */}
        <div className="rounded-2xl bg-[#111827]/80 border border-[#242c40] p-5 text-center flex flex-col items-center justify-center">
          <span className="text-xs text-[#A8B1C8] mb-1">
            {language === 'es' ? 'Días meditados este mes' : 'Days Meditated This Month'}
          </span>
          <span className="text-2xl sm:text-3xl font-light text-[#C7B9FF]">
            {stats.daysThisMonthCount}
          </span>
          <span className="text-[11px] text-[#64708D] mt-1">
            {language === 'es' ? 'Días en quietud' : 'Quiet days'}
          </span>
        </div>

        {/* Metric 3 */}
        <div className="rounded-2xl bg-[#111827]/80 border border-[#242c40] p-5 text-center flex flex-col items-center justify-center">
          <span className="text-xs text-[#A8B1C8] mb-1">
            {language === 'es' ? 'Sesiones completadas' : 'Sessions Completed'}
          </span>
          <span className="text-2xl sm:text-3xl font-light text-[#B9D1FF]">
            {stats.sessionsCompletedCount}
          </span>
          <span className="text-[11px] text-[#64708D] mt-1">
            {language === 'es' ? 'Prácticas dedicadas' : 'Dedicated sittings'}
          </span>
        </div>
      </div>

      {/* Interactive Practice Calendar with Clear Past/Future Visual Hierarchy */}
      <section className="rounded-2xl bg-[#111827]/60 border border-[#242c40] p-5 sm:p-6 backdrop-blur-sm space-y-4">
        {/* Calendar Header with Month Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#151B29] border border-[#242c40] flex items-center justify-center text-[#C7B9FF]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-medium text-[#F3F3FA]">
                {calendarDays.monthName}
              </h3>
              <p className="text-[11px] text-[#64708D]">
                {language === 'es' ? 'Sesiones y práctica de meditación' : 'Sessions and meditation practice'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {!isViewingCurrentMonth && (
              <button
                onClick={goToToday}
                className="px-2.5 py-1 text-xs rounded-full bg-[#151B29] border border-[#242c40] text-[#C7B9FF] hover:text-[#F3F3FA] transition-colors cursor-pointer mr-1"
                title={language === 'es' ? 'Ir al mes actual' : 'Go to current month'}
              >
                {language === 'es' ? 'Hoy' : 'Today'}
              </button>
            )}
            <button
              onClick={goToPrevMonth}
              className="p-1.5 rounded-full bg-[#151B29] hover:bg-[#1f283d] text-[#A8B1C8] hover:text-[#F3F3FA] border border-[#242c40] transition-colors cursor-pointer"
              aria-label={language === 'es' ? 'Mes anterior' : 'Previous month'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1.5 rounded-full bg-[#151B29] hover:bg-[#1f283d] text-[#A8B1C8] hover:text-[#F3F3FA] border border-[#242c40] transition-colors cursor-pointer"
              aria-label={language === 'es' ? 'Mes siguiente' : 'Next month'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quiet Minimal Legend */}
        <div className="flex items-center justify-between text-[11px] text-[#A8B1C8] px-1 pt-1 border-t border-[#242c40]/50 flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C7B9FF]" />
              <span>{language === 'es' ? 'Sesión en este día' : 'Session on this day'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2 rounded bg-[#0B0F19] border border-transparent" />
              <span className="text-[#64708D]">{language === 'es' ? 'Días pasados' : 'Past days'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2 rounded bg-[#151B29] border border-[#242c40]" />
              <span className="text-[#A8B1C8]">{language === 'es' ? 'Próximos' : 'Upcoming'}</span>
            </div>
          </div>
          <span className="text-[#64708D] text-[10px]">
            {language === 'es' ? 'Toca cualquier día para ver detalles' : 'Tap any day to see details'}
          </span>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center text-xs">
          {(language === 'es'
            ? ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
            : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
          ).map((d) => (
            <span key={d} className="text-[10px] text-[#64708D] font-medium py-1">
              {d}
            </span>
          ))}

          {/* Empty spacer blocks for first day alignment */}
          {Array.from({ length: calendarDays.firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-10 sm:h-11" />
          ))}

          {/* Calendar day tiles: uniform layout and clear past/present/future distinction */}
          {calendarDays.daysArray.map(({ day, hasActivity, isToday, isPast }) => {
            const isSelected = selectedDay === day;

            let tileStyle = '';

            if (isSelected) {
              tileStyle = 'bg-[#1e2740] ring-2 ring-[#C7B9FF] text-[#FFFFFF] font-medium shadow-md z-10';
            } else if (isToday) {
              tileStyle = 'bg-[#1b233a] border-2 border-[#C7B9FF] text-[#F3F3FA] font-medium shadow-sm';
            } else if (isPast) {
              // Past days: consistent dark flat tile with muted gray number
              tileStyle = 'bg-[#0B0F19]/80 border border-transparent text-[#55607A] hover:bg-[#111827] hover:text-[#8E99B4]';
            } else {
              // Future days: clear visible card surface with crisp light text
              tileStyle = hasActivity
                ? 'bg-[#182136] border border-[#C7B9FF]/50 text-[#F3F3FA] hover:border-[#C7B9FF] font-medium'
                : 'bg-[#151B29] border border-[#242c40] text-[#E2E8F0] hover:text-[#FFFFFF] hover:border-[#3e4a6b]';
            }

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`h-10 sm:h-11 rounded-xl flex flex-col items-center justify-center relative transition-all cursor-pointer ${tileStyle}`}
                aria-label={`Day ${day}`}
              >
                <span className="text-xs sm:text-sm">{day}</span>

                {/* Matte Lavender indicator dot (sin brillo/luz) */}
                {hasActivity && (
                  <span
                    className={`w-1.5 h-1.5 rounded-full absolute bottom-1.5 ${
                      isPast ? 'bg-[#C7B9FF]/50' : 'bg-[#C7B9FF]'
                    }`}
                    title="Session"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Day Inspector / Agenda Drawer (Apple Calendar style) */}
        {selectedDayData && (
          <div className="mt-4 pt-4 border-t border-[#242c40]/80 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C7B9FF]" />
                <h4 className="text-xs sm:text-sm font-medium text-[#F3F3FA]">
                  {selectedDayData.formattedDate}
                </h4>
                {selectedDayData.isToday && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/40 font-medium">
                    {language === 'es' ? 'Hoy' : 'Today'}
                  </span>
                )}
                {selectedDayData.isPast && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0E1320] text-[#64708D] border border-[#242c40]">
                    {language === 'es' ? 'Pasado' : 'Past'}
                  </span>
                )}
                {selectedDayData.isFuture && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#151B29] text-[#A8B1C8] border border-[#242c40]">
                    {language === 'es' ? 'Próximo' : 'Upcoming'}
                  </span>
                )}
              </div>

              <div className="text-[11px] text-[#A8B1C8]">
                {selectedDayData.sessions.length > 0 || selectedDayData.hasMeditated
                  ? (language === 'es' ? 'Detalles de sesiones' : 'Session details')
                  : (language === 'es' ? 'Sin sesiones' : 'No sessions')}
              </div>
            </div>

            {/* Practice presence note */}
            {selectedDayData.hasMeditated && (
              <div className="p-2.5 rounded-xl bg-[#151B29] border border-[#242c40] flex items-center gap-2.5 text-xs text-[#A8B1C8]">
                <Check className="w-4 h-4 shrink-0 text-[#C7B9FF]" />
                <span>
                  {selectedDayData.isToday
                    ? language === 'es'
                      ? `Meditaste hoy por ${selectedDayData.meditatedMinutes} ${selectedDayData.meditatedMinutes === 1 ? 'minuto' : 'minutos'}.`
                      : `You meditated today for ${selectedDayData.meditatedMinutes} ${selectedDayData.meditatedMinutes === 1 ? 'minute' : 'minutes'}.`
                    : language === 'es'
                    ? `Meditaste en este día por ${selectedDayData.meditatedMinutes} ${selectedDayData.meditatedMinutes === 1 ? 'minuto' : 'minutos'}.`
                    : `You meditated on this day for ${selectedDayData.meditatedMinutes} ${selectedDayData.meditatedMinutes === 1 ? 'minute' : 'minutes'}.`}
                </span>
              </div>
            )}

            {/* Scheduled Sessions list for this day */}
            {selectedDayData.sessions.length > 0 ? (
              <div className="space-y-2.5 pt-1">
                {selectedDayData.sessions.map((session) => (
                  <div
                    key={session.id}
                    className="p-3 sm:p-4 rounded-xl bg-[#151B29] border border-[#242c40] hover:border-[#3e4a6b] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-medium text-[#C7B9FF] flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatSessionTime(session.scheduledAt)}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#111827] text-[#A8B1C8] border border-[#242c40]">
                          {session.category}
                        </span>
                      </div>
                      <h5 className="text-sm font-medium text-[#F3F3FA] truncate">
                        {session.title}
                      </h5>
                      <p className="text-xs text-[#64708D] truncate">
                        {t('card.for')}: {session.recipient} · {t('card.sharedBy')} {session.creatorName}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedDetailIntention(session)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium text-[#A8B1C8] hover:text-[#F3F3FA] bg-[#111827] border border-[#242c40] hover:border-[#3e4a6b] transition-colors cursor-pointer"
                      >
                        {language === 'es' ? 'Ver intención' : 'View Intention'}
                      </button>
                      <button
                        onClick={() => startMeditationForIntention(session)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-[#C7B9FF] bg-[#1b233a] hover:bg-[#253052] border border-[#C7B9FF]/40 hover:border-[#C7B9FF] transition-all cursor-pointer shadow-sm active:scale-95"
                      >
                        <Waves size={13} strokeWidth={1.5} className="text-violet-200" />
                        <span>{t('card.meditate')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : !selectedDayData.hasMeditated ? (
              <div className="py-4 text-center space-y-1">
                <p className="text-xs text-[#A8B1C8]">
                  {language === 'es' ? 'No hay sesiones programadas para este día.' : 'No sessions scheduled for this day.'}
                </p>
                <p className="text-[11px] text-[#64708D]">
                  {language === 'es'
                    ? 'Puedes meditar en cualquier momento o sumarte a una sesión en el calendario.'
                    : 'You can sit in meditation anytime or join an upcoming session in the calendar.'}
                </p>
              </div>
            ) : null}
          </div>
        )}
      </section>

      {/* Your Intentions (Joined vs Created) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#242c40] pb-3">
          <h2 className="text-lg font-light text-[#F3F3FA] flex items-center gap-2">
            <span>{language === 'es' ? 'Tus intenciones' : 'Your Intentions'}</span>
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
              {language === 'es'
                ? `Que sigo (${joinedIntentions.length})`
                : `Joined (${joinedIntentions.length})`}
            </button>
            <button
              onClick={() => setIntentionSubTab('created')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                intentionSubTab === 'created'
                  ? 'bg-[#151B29] text-[#C7B9FF] border border-[#30364A]'
                  : 'text-[#64708D] hover:text-[#A8B1C8]'
              }`}
            >
              {language === 'es'
                ? `Creadas (${createdIntentions.length})`
                : `Created (${createdIntentions.length})`}
            </button>
          </div>
        </div>

        {/* Intention List */}
        {intentionSubTab === 'joined' ? (
          joinedIntentions.length === 0 ? (
            <div className="rounded-2xl bg-[#111827]/50 border border-[#242c40] p-8 text-center text-xs text-[#A8B1C8]">
              {language === 'es'
                ? 'Aún no te has unido a ninguna intención. Explora la sección de intenciones para apoyar a otros.'
                : "You haven't joined any intentions yet. Explore the Discover section to hold space for others."}
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
              {language === 'es'
                ? 'Aún no has compartido intenciones.'
                : "You haven't published any intentions yet."}
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/30 hover:border-[#C7B9FF]/60 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t('common.createIntention')}</span>
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
