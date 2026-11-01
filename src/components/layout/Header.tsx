'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Plus, User as UserIcon } from 'lucide-react';
import Image from 'next/image';

export function Header() {
  const { currentUser, setIsProfileModalOpen, setIsCreateModalOpen } = useApp();

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-md bg-[#080B15]/80 border-b border-[#242c40]/60 transition-all">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo / Orbital Symbol */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-[#111827] border border-[#3e4a6b]/60 shadow-[0_0_15px_rgba(199,185,255,0.08)]">
            {/* Concentric orbital rings */}
            <div className="absolute inset-1 rounded-full border border-[#C7B9FF]/20 animate-spin-slow" />
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-[#C7B9FF] to-[#B9D1FF] shadow-[0_0_8px_rgba(199,185,255,0.6)]" />
          </div>
          <div>
            <span className="font-medium tracking-wide text-base text-[#F3F3FA] flex items-center gap-1.5">
              Coherence Hub
            </span>
          </div>
        </div>

        {/* Community indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[#111827]/60 border border-[#242c40]/80 text-xs text-[#A8B1C8]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#A8DCC9] animate-pulse" />
          <span>Connected through shared practice</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-full bg-[#151B29] hover:bg-[#1f283d] text-[#C7B9FF] border border-[#30364A] transition-all hover:border-[#C7B9FF]/40 cursor-pointer shadow-sm active:scale-95"
            aria-label="Create new intention"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create Intention</span>
            <span className="sm:hidden">Create</span>
          </button>

          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="relative flex items-center justify-center w-8 h-8 rounded-full bg-[#151B29] border border-[#30364A] overflow-hidden hover:border-[#B9D1FF]/50 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C7B9FF]/40"
            aria-label={`Profile settings for ${currentUser.name}`}
          >
            {currentUser.avatarUrl ? (
              <Image
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="w-4 h-4 text-[#A8B1C8]" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
