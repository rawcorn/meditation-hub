'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useApp } from '@/context/AppContext';
import { ambientAudio } from '@/lib/audio';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Heart,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
  Waves,
} from 'lucide-react';
import Image from 'next/image';

type BreathPhase = 'inhale' | 'rest-in' | 'exhale' | 'rest-out';

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
  } = useApp();

  // Duration settings
  const [targetSeconds, setTargetSeconds] = useState(15 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // Active time tracking (accurate: pauses don't accumulate)
  const [totalActiveSeconds, setTotalActiveSeconds] = useState(0);
  const sessionStartTimeRef = useRef<string>(new Date().toISOString());
  const lastActiveTimestampRef = useRef<number | null>(null);

  // Breath guidance
  const [showBreathGuidance, setShowBreathGuidance] = useState(true);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [breathCycleSeconds] = useState(10); // 4.5s inhale, 0.5s rest, 4.5s exhale, 0.5s rest

  // Audio state
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Complete session handler
  const handleComplete = useCallback(() => {
    setIsActive(false);
    setIsCompleted(true);
    ambientAudio.playBowlChime(); // Gentle completion chime
    ambientAudio.stopAmbientDrone();
    setIsAudioPlaying(false);

    const roundedActiveDuration = Math.max(1, Math.round(totalActiveSeconds));

    recordCompletedMeditation({
      intentionId: activeIntentionForMeditation?.id,
      intentionTitle:
        activeIntentionForMeditation?.title ||
        (isGroupMeditation ? 'Collective Group Encounter' : 'Personal Meditation Space'),
      startedAt: sessionStartTimeRef.current,
      endedAt: new Date().toISOString(),
      activeDurationSeconds: roundedActiveDuration,
      targetDurationMinutes: Math.round(targetSeconds / 60),
      completed: true,
    });
  }, [
    activeIntentionForMeditation?.id,
    activeIntentionForMeditation?.title,
    isGroupMeditation,
    recordCompletedMeditation,
    targetSeconds,
    totalActiveSeconds,
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
  };

  // Breath phase calculation loop
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const cyclePos = (now % (breathCycleSeconds * 1000)) / 1000;

      if (cyclePos < 4.5) {
        setBreathPhase('inhale');
      } else if (cyclePos < 5.0) {
        setBreathPhase('rest-in');
      } else if (cyclePos < 9.5) {
        setBreathPhase('exhale');
      } else {
        setBreathPhase('rest-out');
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isActive, breathCycleSeconds]);

  // Accurate Active Meditation Timer with visibility and pause resilience
  useEffect(() => {
    if (!isActive || secondsRemaining <= 0) return;

    lastActiveTimestampRef.current = Date.now();

    const timer = setInterval(() => {
      const now = Date.now();
      if (lastActiveTimestampRef.current) {
        const deltaSeconds = (now - lastActiveTimestampRef.current) / 1000;
        
        // Tab visibility safe: clamp delta so background throttling does not jump wildly
        const safeDelta = Math.min(deltaSeconds, 2.0);
        
        setTotalActiveSeconds((prev) => prev + safeDelta);
        setSecondsRemaining((prev) => {
          const next = prev - safeDelta;
          if (next <= 0) {
            handleComplete();
            return 0;
          }
          return next;
        });
      }
      lastActiveTimestampRef.current = now;
    }, 250);

    return () => {
      clearInterval(timer);
      lastActiveTimestampRef.current = null;
    };
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

  // Audio Play/Pause Toggle
  const toggleAudio = () => {
    if (isAudioPlaying) {
      ambientAudio.stopAmbientDrone();
      setIsAudioPlaying(false);
    } else {
      ambientAudio.setVolume(volume);
      ambientAudio.playAmbientDrone();
      setIsAudioPlaying(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    ambientAudio.setVolume(newVol);
  };

  // Start / Resume session
  const handleStartResume = () => {
    if (secondsRemaining <= 0) {
      setSecondsRemaining(targetSeconds);
    }
    setIsActive(true);
    if (!isActive && totalActiveSeconds === 0) {
      sessionStartTimeRef.current = new Date().toISOString();
      ambientAudio.playBowlChime(); // Gentle starting chime
    }
  };

  // Pause session
  const handlePause = () => {
    setIsActive(false);
  };

  // Manual End Session
  const handleEndEarly = () => {
    if (totalActiveSeconds >= 30) {
      handleComplete();
    } else {
      ambientAudio.stopAmbientDrone();
      setIsAudioPlaying(false);
      exitMeditation();
    }
  };

  // Reset Timer
  const handleReset = () => {
    setIsActive(false);
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

  // Guidance Text Map
  const guidanceTextMap: Record<BreathPhase, string> = {
    'inhale': 'Inhale gently',
    'rest-in': 'Breathe naturally',
    'exhale': 'Exhale slowly',
    'rest-out': 'Rest in this moment',
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
          aria-label="Exit Meditation Space"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Meditation Space</span>
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
              {isGroupMeditation ? 'Group Encounter: ' : 'For '}
              {activeIntentionForMeditation.recipient}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#151B29]/80 border border-[#242c40] text-xs text-[#A8B1C8]">
            <Waves size={16} strokeWidth={1.5} className="text-violet-200" />
            <span>Meditation Space</span>
          </div>
        )}

        {/* Right audio & controls */}
        <div className="flex items-center gap-2">
          {/* Audio toggle */}
          <button
            onClick={toggleAudio}
            className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all cursor-pointer ${
              isAudioPlaying
                ? 'bg-[#1b233a] border-[#C7B9FF]/50 text-[#C7B9FF]'
                : 'bg-[#111827]/70 border-[#242c40] text-[#64708D] hover:text-[#A8B1C8]'
            }`}
            title={isAudioPlaying ? 'Mute ambient sound' : 'Enable ambient sound'}
            aria-label={isAudioPlaying ? 'Mute ambient sound' : 'Enable ambient sound'}
          >
            {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
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
            <Sparkles className="w-7 h-7 text-[#C7B9FF]" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#F3F3FA] font-sans">
            Thank you for being here.
          </h2>

          <p className="mt-3 text-sm text-[#A8B1C8] leading-relaxed max-w-sm">
            {activeIntentionForMeditation
              ? `You dedicated ${Math.max(1, Math.round(totalActiveSeconds / 60))} minutes of quiet presence for ${activeIntentionForMeditation.recipient}.`
              : `You rested in ${Math.max(1, Math.round(totalActiveSeconds / 60))} minutes of intentional quiet presence.`}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={() => {
                exitMeditation();
              }}
              className="flex-1 px-5 py-2.5 rounded-full text-xs font-medium bg-[#151B29] text-[#F3F3FA] border border-[#30364A] hover:border-[#B9D1FF]/60 transition-all cursor-pointer shadow-sm"
            >
              Return to intentions
            </button>

            {activeIntentionForMeditation ? (
              <button
                onClick={() => {
                  setSelectedDetailIntention(activeIntentionForMeditation);
                  exitMeditation();
                }}
                className="flex-1 px-5 py-2.5 rounded-full text-xs font-medium bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/40 hover:border-[#C7B9FF]/80 transition-all cursor-pointer shadow-[0_0_12px_rgba(199,185,255,0.12)]"
              >
                View intention updates
              </button>
            ) : (
              <button
                onClick={() => {
                  setActiveTab('practice');
                  exitMeditation();
                }}
                className="flex-1 px-5 py-2.5 rounded-full text-xs font-medium bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/40 hover:border-[#C7B9FF]/80 transition-all cursor-pointer"
              >
                View My Practice
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Main Meditation Space Center Experience */
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
              {activeIntentionForMeditation.visualizationPrompt && (
                <p className="mt-2 text-xs text-[#A8B1C8]/80 italic line-clamp-2 px-4">
                  &ldquo;{activeIntentionForMeditation.visualizationPrompt}&rdquo;
                </p>
              )}
            </div>
          )}

          {/* Organic Breathing Halo & Centered Portrait / Symbol */}
          <div className="relative flex items-center justify-center my-4 sm:my-6">
            {/* Halo Ring 3 - Outer ambient luminous glow */}
            <div
              className={`absolute w-72 h-72 sm:w-88 sm:h-88 rounded-full border border-[#B9D1FF]/15 transition-transform duration-1000 ease-in-out ${
                isActive ? 'animate-halo-3' : 'scale-90 opacity-20'
              }`}
              style={{
                background: 'radial-gradient(circle, rgba(185, 209, 255, 0.05) 0%, transparent 70%)',
              }}
            />

            {/* Halo Ring 2 - Mid luminous pulse */}
            <div
              className={`absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full border border-[#C7B9FF]/25 transition-transform duration-1000 ease-in-out ${
                isActive ? 'animate-halo-2' : 'scale-95 opacity-30'
              }`}
              style={{
                background: 'radial-gradient(circle, rgba(199, 185, 255, 0.07) 0%, transparent 70%)',
              }}
            />

            {/* Halo Ring 1 - Inner soft glow */}
            <div
              className={`absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-[#C7B9FF]/40 shadow-[0_0_24px_rgba(199,185,255,0.18)] transition-transform duration-1000 ease-in-out ${
                isActive ? 'animate-halo-1' : 'scale-100 opacity-40'
              }`}
            />

            {/* Centered Image or Waves Symbol */}
            <div className="relative z-10 w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-[#C7B9FF]/50 shadow-[0_0_30px_rgba(199,185,255,0.2)] bg-[#111827] flex items-center justify-center">
              {activeIntentionForMeditation?.imageUrl ? (
                <Image
                  src={activeIntentionForMeditation.imageUrl}
                  alt={activeIntentionForMeditation.recipient}
                  fill
                  className="object-cover"
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

          {/* Gentle Breath Guidance Text */}
          {showBreathGuidance && (
            <div className="h-8 flex items-center justify-center my-2">
              <span
                key={breathPhase}
                className={`text-sm sm:text-base font-light tracking-wide text-[#C7B9FF] transition-opacity duration-1000 ${
                  isActive ? 'opacity-90' : 'opacity-60'
                }`}
              >
                {isActive ? guidanceTextMap[breathPhase] : 'Rest in this moment'}
              </span>
            </div>
          )}

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
        <footer className="relative z-20 flex flex-col items-center justify-center pb-8 pt-4 px-4 max-w-md mx-auto w-full space-y-4">
          {/* Main Play/Pause/End Controls */}
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
              title="Finish meditation session"
            >
              Finish
            </button>
          </div>

          {/* Volume slider when audio is playing */}
          {isAudioPlaying && (
            <div className="flex items-center gap-2 text-xs text-[#A8B1C8] animate-in fade-in">
              <Volume2 className="w-3.5 h-3.5 text-[#C7B9FF]" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-1 bg-[#242c40] rounded-lg appearance-none cursor-pointer accent-[#C7B9FF]"
                aria-label="Ambient volume"
              />
            </div>
          )}
        </footer>
      )}
    </div>
  );
}
