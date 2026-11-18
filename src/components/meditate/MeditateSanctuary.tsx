'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { ambientAudio } from '@/lib/audio';
import {
  ArrowLeft,
  Clock,
  Eye,
  EyeOff,
  Heart,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  Waves,
} from 'lucide-react';
import Image from 'next/image';
import { YouTubeAudioPlayer } from './YouTubeAudioPlayer';

const DURATIONS = [
  { label: '5 min', seconds: 5 * 60 },
  { label: '15 min', seconds: 15 * 60 },
  { label: '30 min', seconds: 30 * 60 },
];

export function MeditateSanctuary() {
  const {
    activeIntentionForMeditation,
    isGroupMeditation,
    exitMeditation,
    setActiveTab,
    setSelectedDetailIntention,
    recordCompletedMeditation,
    t,
    language,
  } = useApp();

  // Duration settings (default 15 minutes with 5, 15, 30 min options)
  const [targetSeconds, setTargetSeconds] = useState(15 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Active time tracking (accurate: pauses don't accumulate)
  const [totalActiveSeconds, setTotalActiveSeconds] = useState(0);
  const activeSecondsRef = useRef(0);
  const targetSecondsRef = useRef(15 * 60);
  targetSecondsRef.current = targetSeconds;
  const secondsRemainingRef = useRef(15 * 60);
  secondsRemainingRef.current = secondsRemaining;
  const sessionStartTimeRef = useRef<string>(new Date().toISOString());
  const lastActiveTimestampRef = useRef<number | null>(null);

  // Audio mute state (controls whole sanctuary)
  const [isSiteMuted, setIsSiteMuted] = useState(false);

  // Breath guidance: Synchronized scale state for the halo and text
  const [showBreathGuidance, setShowBreathGuidance] = useState(true);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'exhale'>('inhale');

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Complete session handler
  const handleComplete = useCallback(() => {
    setIsActive(false);
    setIsCompleted(true);
    ambientAudio.playBowlChime(); // Gentle completion chime
    ambientAudio.stopAmbientDrone();

    // Determine actual active duration recorded:
    // If countdown reached natural end (<= 1.0s remaining), record exact target seconds (e.g. 60s for 1 min).
    // Otherwise (ended early), record exact measured active seconds.
    const isNaturalEnd = secondsRemainingRef.current <= 1.0;
    const finalActiveSeconds = isNaturalEnd
      ? targetSecondsRef.current
      : Math.max(1, Math.round(activeSecondsRef.current));

    recordCompletedMeditation({
      intentionId: activeIntentionForMeditation?.id,
      intentionTitle:
        activeIntentionForMeditation?.title ||
        (isGroupMeditation ? 'Collective Group Session' : 'Personal Meditation Room'),
      startedAt: sessionStartTimeRef.current,
      endedAt: new Date().toISOString(),
      activeDurationSeconds: finalActiveSeconds,
      targetDurationMinutes: Math.max(1, Math.round(targetSecondsRef.current / 60)),
      completed: true,
    });
  }, [
    activeIntentionForMeditation?.id,
    activeIntentionForMeditation?.title,
    isGroupMeditation,
    recordCompletedMeditation,
  ]);

  // Handle Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Switch Target Duration
  const selectDuration = (secs: number) => {
    if (isActive) return;
    setTargetSeconds(secs);
    setSecondsRemaining(secs);
    activeSecondsRef.current = 0;
    setTotalActiveSeconds(0);
  };

  // Synchronized Breathing Cycle (5s Inhale expanding, 5s Exhale contracting)
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setBreathPhase((prev) => (prev === 'inhale' ? 'exhale' : 'inhale'));
    }, 5000);

    return () => clearInterval(interval);
  }, [isActive]);

  // Accurate Active Meditation Timer with visibility and pause resilience
  useEffect(() => {
    if (!isActive) return;

    lastActiveTimestampRef.current = Date.now();

    const timer = setInterval(() => {
      const now = Date.now();
      if (lastActiveTimestampRef.current != null) {
        const deltaSeconds = (now - lastActiveTimestampRef.current) / 1000;
        
        // Tab visibility safe: clamp delta so background throttling does not jump wildly
        const safeDelta = Math.min(Math.max(0, deltaSeconds), 1.5);
        
        activeSecondsRef.current += safeDelta;
        setTotalActiveSeconds(activeSecondsRef.current);

        setSecondsRemaining((prev) => {
          const next = prev - safeDelta;
          if (next <= 0) {
            return 0;
          }
          return next;
        });
      }
      lastActiveTimestampRef.current = now;
    }, 200);

    return () => {
      clearInterval(timer);
      lastActiveTimestampRef.current = null;
    };
  }, [isActive]);

  // Trigger completion naturally when timer hits 0
  useEffect(() => {
    if (isActive && secondsRemaining <= 0) {
      handleComplete();
    }
  }, [isActive, secondsRemaining, handleComplete]);

  // Tab visibility change handler
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && isActive) {
        // user switched tabs, keep state consistent
        lastActiveTimestampRef.current = Date.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [isActive]);

  // Start / Resume session
  const handleStartResume = () => {
    if (secondsRemaining <= 0) {
      setSecondsRemaining(targetSeconds);
      activeSecondsRef.current = 0;
      setTotalActiveSeconds(0);
    }
    setBreathPhase('inhale');
    setIsActive(true);
    if (!isActive && activeSecondsRef.current === 0) {
      sessionStartTimeRef.current = new Date().toISOString();
      ambientAudio.playBowlChime(); // Gentle starting chime
    }
  };

  // Pause session
  const handlePause = () => {
    setIsActive(false);
    lastActiveTimestampRef.current = null;
    setBreathPhase('inhale');
  };

  // Manual End Session (Finish button or Exit button)
  const handleEndEarly = () => {
    // If user exits before starting or within 2 seconds of opening, just return to intentions cleanly
    if (activeSecondsRef.current < 2 && !isActive) {
      ambientAudio.stopAmbientDrone();
      exitMeditation('intentions');
      return;
    }

    ambientAudio.stopAmbientDrone();
    setIsActive(false);
    setIsCompleted(true);
    ambientAudio.playBowlChime();

    // Only record in practice if meditated for at least 1 minute (60s)
    if (activeSecondsRef.current >= 60) {
      const finalActiveSeconds = Math.max(1, Math.round(activeSecondsRef.current));
      recordCompletedMeditation({
        intentionId: activeIntentionForMeditation?.id,
        intentionTitle:
          activeIntentionForMeditation?.title ||
          (isGroupMeditation ? 'Collective Group Session' : 'Personal Meditation Room'),
        startedAt: sessionStartTimeRef.current,
        endedAt: new Date().toISOString(),
        activeDurationSeconds: finalActiveSeconds,
        targetDurationMinutes: Math.max(1, Math.round(targetSecondsRef.current / 60)),
        completed: true,
      });
    }
    // If under 1 minute: do NOT record to practice, but show the Thank You screen with option to view practice
  };

  // Reset Timer
  const handleReset = () => {
    setIsActive(false);
    lastActiveTimestampRef.current = null;
    setBreathPhase('inhale');
    activeSecondsRef.current = 0;
    setTotalActiveSeconds(0);
    setSecondsRemaining(targetSeconds);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      ambientAudio.stopAmbientDrone();
    };
  }, []);

  // Format MM:SS
  const formatTime = (secs: number) => {
    const total = Math.max(0, Math.ceil(secs));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-[#080B15] text-[#F3F3FA] flex flex-col justify-between overflow-hidden select-none"
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, #111827 0%, #0d1220 50%, #080B15 100%)',
      }}
    >
      {/* Top minimal navigation & controls */}
      <header className="relative z-20 flex items-center justify-between p-4 sm:p-6 max-w-5xl mx-auto w-full">
        <button
          onClick={handleEndEarly}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#111827]/70 border border-[#242c40] text-xs text-[#A8B1C8] hover:text-[#F3F3FA] hover:border-[#3e4a6b] transition-all cursor-pointer backdrop-blur-md"
          aria-label={t('sanctuary.backToRoom')}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('sanctuary.backToRoom')}</span>
        </button>

        {/* Intention Title badge / Encounter Mode */}
        {activeIntentionForMeditation ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151B29]/90 border border-[#C7B9FF]/30 text-xs text-[#C7B9FF] max-w-[220px] sm:max-w-xs truncate shadow-sm">
            {isGroupMeditation ? (
              <Waves size={15} strokeWidth={1.5} className="text-violet-200 shrink-0" />
            ) : (
              <Heart className="w-3.5 h-3.5 shrink-0 text-[#C7B9FF]" />
            )}
            <span className="truncate">
              {isGroupMeditation
                ? (language === 'es' ? 'Sesión grupal: ' : 'Group Session: ')
                : (language === 'es' ? 'Para ' : 'For ')}
              {activeIntentionForMeditation.recipient}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151B29]/80 border border-[#242c40] text-xs text-[#A8B1C8]">
            <Waves size={16} strokeWidth={1.5} className="text-violet-200" />
            <span>{t('nav.meditationRoom')}</span>
          </div>
        )}

        {/* Right audio & controls */}
        <div className="flex items-center gap-2">
          {/* Mute site audio toggle (controls guided track audio playback) */}
          <button
            onClick={() => setIsSiteMuted((prev) => !prev)}
            className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all cursor-pointer ${
              isSiteMuted
                ? 'bg-[#1b233a] border-[#FFB9D2]/50 text-[#FFB9D2]'
                : 'bg-[#111827]/70 border-[#242c40] text-[#A8B1C8] hover:text-[#F3F3FA]'
            }`}
            title={isSiteMuted ? 'Unmute audio' : 'Mute audio'}
            aria-label={isSiteMuted ? 'Unmute audio' : 'Mute audio'}
          >
            {isSiteMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Guidance visibility toggle */}
          <button
            onClick={() => setShowBreathGuidance((prev) => !prev)}
            className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all cursor-pointer ${
              showBreathGuidance
                ? 'bg-[#151B29]/70 border-[#242c40] text-[#A8B1C8]'
                : 'bg-[#111827]/40 border-[#242c40] text-[#64708D]'
            }`}
            title={showBreathGuidance ? 'Hide breath text' : 'Show breath text'}
            aria-label={showBreathGuidance ? 'Hide breath text' : 'Show breath text'}
          >
            {showBreathGuidance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full bg-[#111827]/70 border border-[#242c40] text-[#64708D] hover:text-[#A8B1C8] transition-colors cursor-pointer"
            title="Toggle fullscreen"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Completion Modal / State */}
      {isCompleted ? (
        <div className="relative z-30 flex-1 flex flex-col items-center justify-center px-4 max-w-md mx-auto text-center animate-in fade-in duration-500">
          <div className="w-16 h-16 rounded-full bg-[#151B29] border border-[#C7B9FF]/40 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(199,185,255,0.15)]">
            <Heart className="w-7 h-7 text-[#C7B9FF] fill-[#C7B9FF]/20" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#F3F3FA] font-sans">
            {language === 'es' ? 'Gracias por tu presencia.' : 'Thank you for being here.'}
          </h2>

          {(() => {
            const isNaturalEnd = secondsRemainingRef.current <= 1.0;
            const isUnderOneMinute = !isNaturalEnd && activeSecondsRef.current < 60;

            if (isUnderOneMinute) {
              return (
                <div className="space-y-1.5 mt-3">
                  <p className="text-sm font-medium text-[#F3F3FA] leading-relaxed">
                    {language === 'es'
                      ? 'Meditaste por menos de 1 minuto.'
                      : 'You meditated for less than 1 minute.'}
                  </p>
                  <p className="text-xs text-[#A8B1C8] leading-relaxed max-w-sm mx-auto">
                    {activeIntentionForMeditation
                      ? language === 'es'
                        ? `Cada instante de presencia por ${activeIntentionForMeditation.recipient} cuenta, aunque las sesiones de menos de 1 minuto no se suman al historial.`
                        : `Every moment of stillness for ${activeIntentionForMeditation.recipient} matters, though sessions under 1 minute are not added to your accumulated practice.`
                      : language === 'es'
                      ? 'Cada breve instante de presencia cuenta, aunque las sesiones de menos de 1 minuto no se suman al historial acumulado.'
                      : 'Every brief moment of presence matters, though sessions under 1 minute are not added to your accumulated practice.'}
                  </p>
                </div>
              );
            }

            const finalSeconds = isNaturalEnd
              ? targetSecondsRef.current
              : Math.max(1, Math.round(activeSecondsRef.current));
            const finalMinutes = isNaturalEnd
              ? Math.max(1, Math.round(targetSecondsRef.current / 60))
              : Math.max(1, Math.floor(finalSeconds / 60));
            const minuteUnit = language === 'es'
              ? finalMinutes === 1 ? 'minuto' : 'minutos'
              : finalMinutes === 1 ? 'minute' : 'minutes';

            return (
              <p className="mt-3 text-sm text-[#A8B1C8] leading-relaxed max-w-sm">
                {activeIntentionForMeditation
                  ? language === 'es'
                    ? `Dedicaste ${finalMinutes} ${minuteUnit} de presencia en silencio por ${activeIntentionForMeditation.recipient}.`
                    : `You dedicated ${finalMinutes} ${minuteUnit} of quiet presence for ${activeIntentionForMeditation.recipient}.`
                  : language === 'es'
                  ? `Dedicaste ${finalMinutes} ${minuteUnit} de presencia en calma y quietud.`
                  : `You rested in ${finalMinutes} ${minuteUnit} of intentional quiet presence.`}
              </p>
            );
          })()}

          <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => {
                exitMeditation('practice');
              }}
              className="flex-1 px-5 py-2.5 rounded-full text-xs font-medium bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/40 hover:border-[#C7B9FF]/80 transition-all cursor-pointer shadow-[0_0_12px_rgba(199,185,255,0.12)]"
            >
              {language === 'es' ? 'Ver Mi práctica' : 'View My Practice'}
            </button>

            <button
              onClick={() => {
                exitMeditation('intentions');
              }}
              className="flex-1 px-5 py-2.5 rounded-full text-xs font-medium bg-[#151B29] text-[#F3F3FA] border border-[#30364A] hover:border-[#B9D1FF]/60 transition-all cursor-pointer shadow-sm"
            >
              {language === 'es' ? 'Volver a intenciones' : 'Return to intentions'}
            </button>
          </div>

          {activeIntentionForMeditation && (
            <button
              onClick={() => {
                setSelectedDetailIntention(activeIntentionForMeditation);
                exitMeditation('intentions');
              }}
              className="mt-3.5 text-xs text-[#A8B1C8] hover:text-[#C7B9FF] transition-colors cursor-pointer"
            >
              {language === 'es'
                ? `Ver notas de ${activeIntentionForMeditation.recipient}`
                : `View notes for ${activeIntentionForMeditation.recipient}`}
            </button>
          )}
        </div>
      ) : (
        /* Main Meditation Room Center Experience */
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 w-full max-w-xl mx-auto text-center">
          {/* Centered Intention Info / Visualization prompt */}
          {activeIntentionForMeditation && (
            <div className="mb-6 max-w-md mx-auto animate-in fade-in duration-300">
              <span className="text-[11px] font-medium tracking-wider uppercase text-[#C7B9FF]/80 block mb-1">
                {isGroupMeditation
                  ? `Synchronous Encounter for ${activeIntentionForMeditation.recipient}`
                  : `Holding intention for ${activeIntentionForMeditation.recipient}`}
              </span>
              <h2 className="text-lg sm:text-xl font-medium text-[#F3F3FA] line-clamp-1">
                {activeIntentionForMeditation.title}
              </h2>
              {isGroupMeditation && activeIntentionForMeditation.scheduledAt && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b233a]/80 text-[11px] text-[#B9D1FF] border border-[#B9D1FF]/25 shadow-sm">
                  <Clock className="w-3 h-3 text-[#C7B9FF]" />
                  <span>
                    {new Date(activeIntentionForMeditation.scheduledAt).toLocaleDateString([], {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    at{' '}
                    {new Date(activeIntentionForMeditation.scheduledAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    (your time)
                  </span>
                </div>
              )}
              {activeIntentionForMeditation.visualizationPrompt && (
                <p className="mt-2 text-xs text-[#A8B1C8]/80 italic line-clamp-2 px-4">
                  &ldquo;{activeIntentionForMeditation.visualizationPrompt}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Organic Breathing Halo & Centered Portrait / Symbol */}
          <div className="relative flex items-center justify-center my-4 sm:my-6">
            {/* Halo Ring 3 - Outer ambient luminous glow (Synchronized: Inhale expands, Exhale contracts) */}
            <div
              className="absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full border border-[#B9D1FF]/15"
              style={{
                background: 'radial-gradient(circle, rgba(185, 209, 255, 0.05) 0%, transparent 70%)',
                transform: isActive
                  ? breathPhase === 'inhale'
                    ? 'scale(1.48)'
                    : 'scale(0.82)'
                  : 'scale(0.88)',
                opacity: isActive
                  ? breathPhase === 'inhale'
                    ? 0.38
                    : 0.15
                  : 0.18,
                transition: isActive
                  ? 'transform 5000ms cubic-bezier(0.4, 0, 0.2, 1), opacity 5000ms cubic-bezier(0.4, 0, 0.2, 1)'
                  : 'transform 800ms ease-out, opacity 800ms ease-out',
                willChange: 'transform, opacity',
              }}
            />

            {/* Halo Ring 2 - Mid luminous pulse (Synchronized: Inhale expands, Exhale contracts) */}
            <div
              className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full border border-[#C7B9FF]/25"
              style={{
                background: 'radial-gradient(circle, rgba(199, 185, 255, 0.07) 0%, transparent 70%)',
                transform: isActive
                  ? breathPhase === 'inhale'
                    ? 'scale(1.32)'
                    : 'scale(0.86)'
                  : 'scale(0.92)',
                opacity: isActive
                  ? breathPhase === 'inhale'
                    ? 0.55
                    : 0.22
                  : 0.25,
                transition: isActive
                  ? 'transform 5000ms cubic-bezier(0.4, 0, 0.2, 1), opacity 5000ms cubic-bezier(0.4, 0, 0.2, 1)'
                  : 'transform 800ms ease-out, opacity 800ms ease-out',
                willChange: 'transform, opacity',
              }}
            />

            {/* Halo Ring 1 - Inner soft glow (Synchronized: Inhale expands, Exhale contracts) */}
            <div
              className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-[#C7B9FF]/40 shadow-[0_0_24px_rgba(199,185,255,0.18)]"
              style={{
                transform: isActive
                  ? breathPhase === 'inhale'
                    ? 'scale(1.18)'
                    : 'scale(0.92)'
                  : 'scale(0.96)',
                opacity: isActive
                  ? breathPhase === 'inhale'
                    ? 0.75
                    : 0.32
                  : 0.35,
                transition: isActive
                  ? 'transform 5000ms cubic-bezier(0.4, 0, 0.2, 1), opacity 5000ms cubic-bezier(0.4, 0, 0.2, 1)'
                  : 'transform 800ms ease-out, opacity 800ms ease-out',
                willChange: 'transform, opacity',
              }}
            />

            {/* Centered Image or Waves Symbol */}
            <div className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-[#C7B9FF]/50 shadow-[0_0_30px_rgba(199,185,255,0.2)] bg-[#111827] flex items-center justify-center">
              {activeIntentionForMeditation?.imageUrl ? (
                <Image
                  src={activeIntentionForMeditation.imageUrl}
                  alt={activeIntentionForMeditation.recipient}
                  fill
                  className="object-cover"
                  unoptimized={Boolean(activeIntentionForMeditation.imageUrl?.startsWith('data:') || activeIntentionForMeditation.imageUrl?.startsWith('http'))}
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-[#C7B9FF]/30 animate-spin-slow" />
                    <Waves
                      size={24}
                      strokeWidth={1.5}
                      className="text-violet-200"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gentle Breath Guidance Text (Fixed height with absolute positioning to prevent ANY layout shift) */}
          <div className="h-8 flex items-center justify-center my-2 relative w-full select-none">
            <span
              className={`text-sm sm:text-base font-light tracking-wide text-[#C7B9FF] transition-opacity duration-300 ${
                showBreathGuidance && isActive ? 'opacity-90' : 'opacity-0 pointer-events-none'
              }`}
            >
              {isActive
                ? breathPhase === 'inhale'
                  ? language === 'es'
                    ? 'Inhala suavemente'
                    : 'Inhale gently'
                  : language === 'es'
                  ? 'Exhala despacio'
                  : 'Exhale slowly'
                : ''}
            </span>
          </div>

          {/* Minimal Timer Display */}
          <div className="mt-3">
            <span className="text-3xl sm:text-5xl font-extralight tracking-widest text-[#F3F3FA] font-mono">
              {formatTime(secondsRemaining)}
            </span>
          </div>

          {/* Duration Selector (Only shown before starting or when paused) */}
          {!isActive && secondsRemaining === targetSeconds && (
            <div className="flex items-center gap-2 mt-4">
              {DURATIONS.map((dur) => (
                <button
                  key={dur.seconds}
                  onClick={() => selectDuration(dur.seconds)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    targetSeconds === dur.seconds
                      ? 'bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/40 shadow-sm'
                      : 'bg-[#111827] text-[#64708D] hover:text-[#A8B1C8] border border-[#242c40]'
                  }`}
                >
                  {dur.label}
                </button>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Bottom controls */}
      {!isCompleted && (
        <footer className="relative z-20 flex flex-col items-center justify-center pb-8 pt-2 px-4 max-w-xl mx-auto w-full space-y-4">
          {/* Main Play/Pause/End Controls (Positioned cleanly ABOVE the music player) */}
          <div className="flex items-center justify-center gap-6">
            {/* Reset */}
            <button
              onClick={handleReset}
              disabled={secondsRemaining === targetSeconds && !isActive}
              className={`p-2 rounded-full border border-[#242c40] transition-colors cursor-pointer ${
                secondsRemaining !== targetSeconds
                  ? 'text-[#A8B1C8] hover:text-[#F3F3FA] bg-[#111827]'
                  : 'text-[#64708D]/40 border-transparent cursor-not-allowed'
              }`}
              title="Reset timer"
              aria-label="Reset timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Play/Pause Primary Button */}
            <button
              onClick={isActive ? handlePause : handleStartResume}
              className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#1b233a] to-[#252a42] text-[#F3F3FA] border border-[#C7B9FF]/40 shadow-[0_0_20px_rgba(199,185,255,0.25)] hover:border-[#C7B9FF]/80 transition-all transform active:scale-95 cursor-pointer"
              aria-label={isActive ? 'Pause meditation' : 'Begin meditation'}
            >
              {isActive ? (
                <Pause className="w-5 h-5 text-[#C7B9FF]" />
              ) : (
                <Play className="w-5 h-5 ml-0.5 text-[#C7B9FF]" />
              )}
            </button>

            {/* End session early */}
            <button
              onClick={handleEndEarly}
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-[#A8B1C8] hover:text-[#F3F3FA] bg-[#111827] border border-[#242c40] hover:border-[#3e4a6b] transition-colors cursor-pointer"
              title={language === 'es' ? 'Finalizar sesión de meditación' : 'Finish meditation session'}
            >
              {language === 'es' ? 'Finalizar' : 'Finish'}
            </button>
          </div>

          {/* Guided Meditation Audio Player (Minimalist YouTube Background Audio) */}
          <div className="w-full flex justify-center pt-2">
            <YouTubeAudioPlayer
              externalIsMuted={isSiteMuted}
              onAudioPlayStateChange={(playing) => {
                if (playing && !isActive) {
                  // Automatically trigger meditation timer if song is started
                  handleStartResume();
                }
              }}
            />
          </div>
        </footer>
      )}
    </div>
  );
}
