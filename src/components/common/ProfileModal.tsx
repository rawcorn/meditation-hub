'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { isSupabaseConfigured } from '@/services/dataService';
import { Check, Database, Shield, User, X } from 'lucide-react';
import Image from 'next/image';

export function ProfileModal() {
  const { isProfileModalOpen, setIsProfileModalOpen, currentUser, updateUser } = useApp();
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email || '');
  const [isSaved, setIsSaved] = useState(false);

  if (!isProfileModalOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    updateUser({ name: name.trim(), email: email.trim() });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      setIsProfileModalOpen(false);
    }, 800);
  };

  const hasSupabase = isSupabaseConfigured();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080B15]/85 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-title"
    >
      <div className="relative w-full max-w-md bg-[#111827] border border-[#30364A] rounded-3xl p-6 shadow-2xl text-[#F3F3FA]">
        <button
          onClick={() => setIsProfileModalOpen(false)}
          className="absolute right-5 top-5 text-[#64708D] hover:text-[#F3F3FA] transition-colors cursor-pointer"
          aria-label="Close profile"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#C7B9FF]/40 bg-[#151B29] flex items-center justify-center">
            {currentUser.avatarUrl ? (
              <Image src={currentUser.avatarUrl} alt={currentUser.name} fill className="object-cover" />
            ) : (
              <User className="w-5 h-5 text-[#C7B9FF]" />
            )}
          </div>
          <div>
            <h2 id="profile-title" className="text-lg font-light text-[#F3F3FA]">
              {currentUser.name}
            </h2>
            <p className="text-xs text-[#A8B1C8]">Member since {new Date(currentUser.joinedAt).toLocaleDateString([], { month: 'short', year: 'numeric' })}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#A8B1C8] mb-1">Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#151B29] border border-[#242c40] text-xs sm:text-sm text-[#F3F3FA] focus:outline-none focus:border-[#C7B9FF]/60"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A8B1C8] mb-1">Email (Optional)</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="For session reminders & updates"
              className="w-full px-3.5 py-2 rounded-xl bg-[#151B29] border border-[#242c40] text-xs sm:text-sm text-[#F3F3FA] placeholder-[#64708D] focus:outline-none focus:border-[#C7B9FF]/60"
            />
          </div>

          {/* Architecture & Persistence Status Indicator */}
          <div className="p-3.5 rounded-2xl bg-[#151B29]/70 border border-[#242c40] space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-[#C7B9FF] font-medium">
              <Database className="w-3.5 h-3.5" />
              <span>Data & Persistence Layer</span>
            </div>
            <p className="text-[#A8B1C8] text-[11px] leading-relaxed">
              {hasSupabase
                ? 'Connected to remote Supabase database and authentication.'
                : 'Operating in private client storage mode with reactive persistence. All creations, joined intentions, and meditation minutes persist across sessions on this device.'}
            </p>
          </div>

          {/* Privacy & Guidelines */}
          <div className="p-3.5 rounded-2xl bg-[#151B29]/40 border border-[#242c40] text-[11px] text-[#64708D] flex items-start gap-2">
            <Shield className="w-4 h-4 shrink-0 mt-0.5 text-[#B9D1FF]" />
            <span>
              Coherence Hub protects member privacy. Practice data is never sold or used for public competition.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(false)}
              className="px-4 py-2 text-xs text-[#A8B1C8] hover:text-[#F3F3FA] cursor-pointer"
            >
              Close
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#1b233a] hover:bg-[#253052] text-[#C7B9FF] border border-[#C7B9FF]/40 cursor-pointer"
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{isSaved ? 'Saved' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
