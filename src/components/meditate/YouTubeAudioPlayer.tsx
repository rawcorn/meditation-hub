'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { Headphones, Pause, Play, Square, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export interface MeditationTrack {
  id: string;
  title: string;
  artist?: string;
  youtubeId: string;
}

// User specified meditation tracks (pure background music / no spoken guide)
export const INITIAL_TRACKS: MeditationTrack[] = [
  {
    id: 'track-1',
    title: 'GOLOV-20',
    artist: 'Dr. Joe Dispenza',
    youtubeId: 'FZXVix4TNOI',
  },
  {
    id: 'track-2',
    title: 'u•inspire•me',
    artist: 'Dr. Joe Dispenza',
    youtubeId: 'ax7GWg6KQbY',
  },
  {
    id: 'track-3',
    title: 'A Heart in Full Bloom',
    artist: 'Dr. Joe Dispenza Live with Mei-lan',
    youtubeId: 'Sbb1iOyPGa4',
  },
  {
    id: 'track-4',
    title: 'Ignite the Heart',
    artist: 'Barry Goldstein',
    youtubeId: '-sSXl90TfpI',
  },
  {
    id: 'track-5',
    title: 'Abundance Rising',
    artist: 'Barry Goldstein',
    youtubeId: 'G2mv2uPezec',
  },
  {
    id: 'track-6',
    title: 'Ascend',
    artist: 'Barry Goldstein',
    youtubeId: 'FWW7eIMwrCg',
  },
];

interface YouTubeAudioPlayerProps {
  onAudioPlayStateChange?: (isPlaying: boolean) => void;
  externalIsMuted?: boolean;
}

// Global declaration for YouTube IFrame API
declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    YT?: any;
  }
}

export function YouTubeAudioPlayer({ onAudioPlayStateChange, externalIsMuted }: YouTubeAudioPlayerProps) {
  const { language, t } = useLanguage();
  const [tracks] = useState<MeditationTrack[]>(INITIAL_TRACKS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(60);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isOpenTrackMenu, setIsOpenTrackMenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const trackMenuRef = useRef<HTMLDivElement>(null);
  const volumeMenuRef = useRef<HTMLDivElement>(null);

  // Close track and volume menus when clicking anywhere outside
  useEffect(() => {
    if (!isOpenTrackMenu && !showVolumeSlider) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const targetNode = event.target as Node;
      if (isOpenTrackMenu && trackMenuRef.current && !trackMenuRef.current.contains(targetNode)) {
        setIsOpenTrackMenu(false);
      }
      if (showVolumeSlider && volumeMenuRef.current && !volumeMenuRef.current.contains(targetNode)) {
        setShowVolumeSlider(false);
      }
    };

    document.addEventListener('pointerdown', handleClickOutside, true);
    document.addEventListener('click', handleClickOutside, true);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside, true);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isOpenTrackMenu, showVolumeSlider]);

  // Audio track progress & duration
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playerRef = useRef<any>(null);
  const uniqueId = useId();
  const containerId = `yt-player-${uniqueId.replace(/[^a-zA-Z0-9_-]/g, '')}`;

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  // Load YouTube IFrame API script
  useEffect(() => {
    let isCancelled = false;

    const initPlayer = () => {
      if (isCancelled || !window.YT || !window.YT.Player) return;

      const element = document.getElementById(containerId);
      if (!element) return;

      try {
        playerRef.current = new window.YT.Player(containerId, {
          height: '1',
          width: '1',
          videoId: currentTrack.youtubeId,
          playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
          },
          events: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onReady: (event: any) => {
              if (isCancelled) return;
              setIsPlayerReady(true);
              event.target.setVolume(volume);
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onStateChange: (event: any) => {
              if (isCancelled) return;
              // YT.PlayerState: PLAYING = 1, PAUSED = 2, BUFFERING = 3, CUED = 5, ENDED = 0
              if (event.data === 1) {
                setIsPlaying(true);
                setIsBuffering(false);
                onAudioPlayStateChange?.(true);
              } else if (event.data === 2 || event.data === 0) {
                setIsPlaying(false);
                setIsBuffering(false);
                onAudioPlayStateChange?.(false);
              } else if (event.data === 3) {
                setIsBuffering(true);
              }
            },
          },
        });
      } catch {
        // Player setup fallback
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      // Load script if not already on page
      const existingScript = document.getElementById('youtube-iframe-api-script');
      if (!existingScript) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }

    return () => {
      isCancelled = true;
      try {
        if (playerRef.current) {
          if (typeof playerRef.current.stopVideo === 'function') {
            playerRef.current.stopVideo();
          }
          if (typeof playerRef.current.destroy === 'function') {
            playerRef.current.destroy();
          }
          playerRef.current = null;
        }
      } catch {
        // ignore cleanup error
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Progress tracking interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying && !isSeeking) {
      interval = setInterval(() => {
        if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
          try {
            const cur = playerRef.current.getCurrentTime() || 0;
            const dur = playerRef.current.getDuration() || 0;
            setCurrentTime(cur);
            if (dur > 0 && dur !== duration) {
              setDuration(dur);
            }
          } catch {
            // ignore
          }
        }
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, isSeeking, duration]);

  // Synchronize player with mute state
  const effectiveIsMuted = Boolean(externalIsMuted || isMuted);

  useEffect(() => {
    if (playerRef.current && isPlayerReady) {
      try {
        if (effectiveIsMuted) {
          playerRef.current.mute();
        } else {
          playerRef.current.unMute();
          playerRef.current.setVolume(volume);
        }
      } catch {
        // ignore
      }
    }
  }, [effectiveIsMuted, volume, isPlayerReady]);

  // Handle Seek
  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetSec = parseFloat(e.target.value);
    setCurrentTime(targetSec);
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
  };

  const handleSeekEnd = (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
    setIsSeeking(false);
    const targetSec = parseFloat((e.target as HTMLInputElement).value);
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(targetSec, true);
      } catch {
        // ignore
      }
    }
  };

  const formatTrackTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Play/Pause
  const togglePlay = () => {
    if (!playerRef.current || !isPlayerReady) return;

    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
      } else {
        playerRef.current.playVideo();
      }
    } catch {
      // Fallback
    }
  };

  // Handle Stop
  const stopAudio = () => {
    if (!playerRef.current || !isPlayerReady) return;
    try {
      if (typeof playerRef.current.stopVideo === 'function') {
        playerRef.current.stopVideo();
      } else {
        playerRef.current.pauseVideo();
      }
      setIsPlaying(false);
      setIsBuffering(false);
      onAudioPlayStateChange?.(false);
    } catch {
      // Fallback
    }
  };

  // Handle Volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setVolume(val);
    if (isMuted && val > 0) {
      setIsMuted(false);
    }
    if (playerRef.current && typeof playerRef.current.setVolume === 'function') {
      try {
        playerRef.current.unMute();
        playerRef.current.setVolume(val);
      } catch {
        // Fallback
      }
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    if (!playerRef.current) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(volume);
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch {
      // Fallback
    }
  };

  // Select Track
  const handleSelectTrack = (index: number) => {
    setCurrentTrackIndex(index);
    setIsOpenTrackMenu(false);
    const newTrack = tracks[index];

    if (playerRef.current && isPlayerReady) {
      try {
        if (isPlaying) {
          playerRef.current.loadVideoById(newTrack.youtubeId);
        } else {
          playerRef.current.cueVideoById(newTrack.youtubeId);
        }
      } catch {
        // Fallback
      }
    }
  };

  return (
    <div className="relative">
      {/* 
        VISUALLY HIDDEN YOUTUBE IFRAME CONTAINER
        The iframe is placed completely out of the visual flow, 0 opacity, non-interactive,
        while maintaining DOM presence so YouTube API can render audio seamlessly.
      */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-9999px',
          left: '-9999px',
          width: '1px',
          height: '1px',
          opacity: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: -1,
        }}
      >
        <div id={containerId} />
      </div>

      {/* MINIMALIST NATIVE AUDIO PLAYER UI */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-full bg-[#111827]/90 border border-[#2e374e] backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.3)] text-xs text-[#F3F3FA]">
        {/* Track Selector Dropdown Button */}
        <div className="relative" ref={trackMenuRef}>
          <button
            type="button"
            onClick={() => setIsOpenTrackMenu((prev) => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#151B29] hover:bg-[#1a2336] border border-[#242c40] text-xs text-[#C7B9FF] transition-colors cursor-pointer max-w-[160px] sm:max-w-[200px]"
            title="Choose guided meditation track"
          >
            <Headphones className={`w-3.5 h-3.5 shrink-0 ${isPlaying ? 'text-[#C7B9FF] animate-pulse' : 'text-[#A8B1C8]'}`} />
            <span className="truncate text-left font-medium">{currentTrack.title}</span>
            <ChevronDown className="w-3 h-3 shrink-0 text-[#64708D]" />
          </button>

          {/* Track Dropdown Menu */}
          {isOpenTrackMenu && (
            <>
              {/* Screen-wide backdrop overlay to close dropdown on any outside click */}
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setIsOpenTrackMenu(false)}
                aria-hidden="true"
              />
              <div className="absolute left-0 bottom-full mb-2 w-64 rounded-2xl bg-[#111827] border border-[#3e4a6b] shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold text-[#64708D] uppercase tracking-wider border-b border-[#242c40]/80">
                  {t('sanctuary.guidedTracks')}
                </div>
                <div className="py-1 space-y-0.5">
                  {tracks.map((t, idx) => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTrack(idx)}
                      className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                        idx === currentTrackIndex
                          ? 'bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/30'
                          : 'text-[#A8B1C8] hover:bg-[#151B29] hover:text-[#F3F3FA]'
                      }`}
                    >
                      <div className="truncate">
                        <div className="text-xs font-medium truncate">{t.title}</div>
                        {t.artist && <div className="text-[10px] text-[#64708D] truncate">{t.artist}</div>}
                      </div>
                      {idx === currentTrackIndex && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#C7B9FF] shrink-0 shadow-[0_0_6px_#C7B9FF]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Native Play / Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all cursor-pointer transform active:scale-95 ${
            isPlaying
              ? 'bg-[#1b233a] border-[#C7B9FF]/60 text-[#C7B9FF] shadow-[0_0_12px_rgba(199,185,255,0.25)]'
              : 'bg-[#151B29] border-[#30364A] text-[#F3F3FA] hover:border-[#C7B9FF]/50'
          }`}
          title={isPlaying ? 'Pause audio' : 'Play audio'}
          aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        >
          {isBuffering ? (
            <div className="w-3.5 h-3.5 rounded-full border border-t-[#C7B9FF] border-transparent animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5 ml-0.5" />
          )}
        </button>

        {/* Native Stop Button */}
        <button
          type="button"
          onClick={stopAudio}
          disabled={!isPlaying && !isBuffering}
          className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all cursor-pointer transform active:scale-95 ${
            isPlaying || isBuffering
              ? 'bg-[#151B29] border-[#30364A] text-[#A8B1C8] hover:text-[#FFB9D2] hover:border-[#FFB9D2]/40'
              : 'bg-[#151B29]/40 border-transparent text-[#64708D]/40 cursor-not-allowed'
          }`}
          title="Stop audio"
          aria-label="Stop audio"
        >
          <Square className="w-3 h-3 fill-current" />
        </button>

        {/* Audio Seek Track Progress Bar (Adelantar / Atrasar) */}
        <div className="flex items-center gap-1.5 px-1 min-w-[110px] sm:min-w-[150px]">
          <span className="text-[10px] text-[#64708D] font-mono select-none w-7 text-right">
            {formatTrackTime(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration > 0 ? duration : 100}
            step={1}
            value={currentTime}
            onChange={handleSeekChange}
            onMouseDown={handleSeekStart}
            onTouchStart={handleSeekStart}
            onMouseUp={handleSeekEnd}
            onTouchEnd={handleSeekEnd}
            className="w-full h-1 bg-[#242c40] rounded-lg appearance-none cursor-pointer accent-[#C7B9FF]"
            title="Seek audio track"
            aria-label="Seek audio track position"
          />
          <span className="text-[10px] text-[#64708D] font-mono select-none w-7">
            {formatTrackTime(duration)}
          </span>
        </div>

        {/* Volume Control (Speaker icon toggles popup volume slider like YouTube) */}
        <div className="relative flex items-center" ref={volumeMenuRef}>
          <button
            type="button"
            onClick={() => setShowVolumeSlider((prev) => !prev)}
            onDoubleClick={toggleMute}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              showVolumeSlider || effectiveIsMuted
                ? 'text-[#C7B9FF] bg-[#1b233a]'
                : 'text-[#64708D] hover:text-[#A8B1C8] hover:bg-[#151B29]'
            }`}
            title="Volume control (Click to show slider, double click to mute)"
            aria-label="Volume control"
          >
            {effectiveIsMuted || volume === 0 ? (
              <VolumeX className="w-3.5 h-3.5 text-[#FFB9D2]" />
            ) : (
              <Volume2 className="w-3.5 h-3.5" />
            )}
          </button>

          {/* YouTube-style Popout Volume Slider */}
          {showVolumeSlider && (
            <>
              {/* Screen-wide backdrop overlay to close volume popup on any outside click */}
              <div
                className="fixed inset-0 z-40 bg-transparent"
                onClick={() => setShowVolumeSlider(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 bottom-full mb-2 p-2.5 rounded-2xl bg-[#111827] border border-[#3e4a6b] shadow-2xl flex flex-col items-center gap-2 z-50 animate-in fade-in zoom-in-95">
                <span className="text-[10px] text-[#64708D] font-mono">{effectiveIsMuted ? 'Muted' : `${volume}%`}</span>
                <div className="h-24 flex items-center justify-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="h-20 w-1 bg-[#242c40] rounded-lg appearance-none cursor-pointer accent-[#C7B9FF] [writing-mode:vertical-lr] [direction:rtl]"
                    aria-label="Volume slider"
                  />
                </div>
                <button
                  type="button"
                  onClick={toggleMute}
                  className="text-[10px] text-[#A8B1C8] hover:text-[#F3F3FA] cursor-pointer pt-1"
                >
                  {isMuted ? t('sanctuary.unmute') : t('sanctuary.mute')}
                </button>
              </div>
            </>
          )}
        </div>

      </div>

      {/* Official YouTube Channel & Copyright Disclaimer */}
      <div className="mt-2 text-center">
        <p className="text-[10px] text-[#64708D] max-w-md mx-auto leading-tight">
          {t('sanctuary.audioRightsDisclaimer')}
        </p>
      </div>
    </div>
  );
}
