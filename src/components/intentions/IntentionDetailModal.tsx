'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Calendar,
  Check,
  Clock,
  Flag,
  Heart,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Trash2,
  Waves,
  X,
} from 'lucide-react';
import Image from 'next/image';

export function IntentionDetailModal() {
  const {
    selectedDetailIntention,
    setSelectedDetailIntention,
    currentUser,
    joinedIntentionIds,
    joinIntention,
    leaveIntention,
    startMeditationForIntention,
    deleteIntention,
    addUpdateToIntention,
    addMessageToIntention,
    deleteMessage,
    reportMessage,
  } = useApp();

  const [newUpdateText, setNewUpdateText] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);

  if (!selectedDetailIntention) return null;

  const isJoined = joinedIntentionIds.includes(selectedDetailIntention.id);
  const isCreator = selectedDetailIntention.creatorId === currentUser.id;

  // Format scheduled local time
  const formatScheduledTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `${date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at ${timeStr} (Local Time)`;
    } catch {
      return 'Scheduled session';
    }
  };

  const handlePostUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdateText.trim()) return;
    addUpdateToIntention(selectedDetailIntention.id, newUpdateText);
    setNewUpdateText('');
    setIsAddingUpdate(false);
  };

  const handlePostMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;
    addMessageToIntention(selectedDetailIntention.id, newMessageText);
    setNewMessageText('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#080B15]/90 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detail-title"
    >
      <div className="relative w-full max-w-2xl bg-[#111827] border border-[#30364A] rounded-3xl p-5 sm:p-8 shadow-2xl my-6 text-[#F3F3FA] max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={() => setSelectedDetailIntention(null)}
          className="absolute right-5 top-5 text-[#64708D] hover:text-[#F3F3FA] transition-colors cursor-pointer z-10"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Container */}
        <div className="overflow-y-auto pr-1 space-y-6">
          {/* Header & Category Badge */}
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#151B29] text-[#C7B9FF] border border-[#242c40]">
              {selectedDetailIntention.category}
            </span>

            {selectedDetailIntention.sessionType === 'scheduled' ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1b233a] text-[#B9D1FF] text-xs border border-[#B9D1FF]/30">
                <Calendar className="w-3 h-3" />
                <span>Scheduled Session</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-[#151B29] text-[#A8B1C8] text-xs border border-[#242c40]">
                Open Intention
              </span>
            )}

            {selectedDetailIntention.isSample && (
              <span className="text-[10px] text-[#64708D] uppercase tracking-wider font-medium">
                Sample
              </span>
            )}
          </div>

          {/* Intention Title & Recipient */}
          <div>
            <div className="text-xs uppercase tracking-wider text-[#C7B9FF] font-medium mb-1">
              Holding space for {selectedDetailIntention.recipient}
            </div>
            <h2 id="detail-title" className="text-xl sm:text-2xl font-light tracking-tight text-[#F3F3FA]">
              {selectedDetailIntention.title}
            </h2>
            <div className="text-xs text-[#64708D] mt-1">
              Shared by {selectedDetailIntention.creatorName} · {selectedDetailIntention.participantCount} registered practitioners
            </div>
          </div>

          {/* Optional Visual */}
          {selectedDetailIntention.imageUrl && (
            <div className="relative w-full h-44 sm:h-56 rounded-2xl overflow-hidden border border-[#242c40]">
              <Image
                src={selectedDetailIntention.imageUrl}
                alt={selectedDetailIntention.recipient}
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Scheduled notice */}
          {selectedDetailIntention.sessionType === 'scheduled' && selectedDetailIntention.scheduledAt && (
            <div className="p-3.5 rounded-2xl bg-[#1b233a]/60 border border-[#B9D1FF]/30 flex items-start gap-3 text-xs text-[#B9D1FF]">
              <Clock className="w-4 h-4 shrink-0 mt-0.5 text-[#B9D1FF]" />
              <div>
                <span className="font-semibold block text-sm">Next Collective Sitting</span>
                <span>{formatScheduledTime(selectedDetailIntention.scheduledAt)}</span>
              </div>
            </div>
          )}

          {/* Description & Visualization Prompt */}
          <div className="space-y-3 bg-[#151B29]/60 p-4 sm:p-5 rounded-2xl border border-[#242c40]">
            <p className="text-xs sm:text-sm text-[#A8B1C8] leading-relaxed">
              {selectedDetailIntention.description}
            </p>

            {selectedDetailIntention.visualizationPrompt && (
              <div className="pt-3 border-t border-[#242c40]/80">
                <span className="text-[11px] font-medium text-[#C7B9FF] uppercase tracking-wide block mb-1">
                  Visualization Guide
                </span>
                <p className="text-xs sm:text-sm text-[#F3F3FA]/90 italic leading-relaxed">
                  &ldquo;{selectedDetailIntention.visualizationPrompt}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Primary Action Row: Group Meditation / Solo / Join */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {selectedDetailIntention.sessionType === 'scheduled' ? (
              <>
                <button
                  onClick={() => {
                    setSelectedDetailIntention(null);
                    startMeditationForIntention(selectedDetailIntention, true);
                  }}
                  className="flex-1 min-w-[170px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-[#1b233a] hover:bg-[#253052] text-[#C7B9FF] border border-[#C7B9FF]/50 hover:border-[#C7B9FF]/90 transition-all cursor-pointer shadow-[0_0_15px_rgba(199,185,255,0.2)] active:scale-95"
                >
                  <Waves size={16} strokeWidth={1.5} className="text-violet-200" />
                  <span>Enter Group Meditation</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedDetailIntention(null);
                    startMeditationForIntention(selectedDetailIntention, false);
                  }}
                  className="px-4 py-2.5 rounded-full text-xs font-medium bg-[#151B29] hover:bg-[#1f283d] text-[#A8B1C8] hover:text-[#F3F3FA] border border-[#242c40] transition-colors cursor-pointer"
                >
                  <span>Meditate Solo</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setSelectedDetailIntention(null);
                  startMeditationForIntention(selectedDetailIntention, false);
                }}
                className="flex-1 min-w-[160px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-[#1b233a] hover:bg-[#253052] text-[#C7B9FF] border border-[#C7B9FF]/40 hover:border-[#C7B9FF]/80 transition-all cursor-pointer shadow-[0_0_15px_rgba(199,185,255,0.15)] active:scale-95"
              >
                <Waves size={16} strokeWidth={1.5} className="text-violet-200" />
                <span>Enter Meditation Space</span>
              </button>
            )}

            <button
              onClick={() =>
                isJoined
                  ? leaveIntention(selectedDetailIntention.id)
                  : joinIntention(selectedDetailIntention.id)
              }
              className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                isJoined
                  ? 'bg-[#151B29] text-[#C7B9FF] border border-[#C7B9FF]/30'
                  : 'bg-[#151B29] text-[#F3F3FA] border border-[#30364A] hover:border-[#B9D1FF]/60'
              }`}
            >
              {isJoined ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#C7B9FF]" />
                  <span>Joined</span>
                </>
              ) : (
                <>
                  <Heart className="w-3.5 h-3.5 text-[#64708D]" />
                  <span>Join Intention</span>
                </>
              )}
            </button>

            {isCreator && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you wish to peacefully remove this intention?')) {
                    deleteIntention(selectedDetailIntention.id);
                  }
                }}
                className="p-2.5 rounded-full bg-[#151B29] text-[#64708D] hover:text-[#FFB9D2] border border-[#242c40] transition-colors cursor-pointer"
                title="Remove own intention"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Section: Creator Reflections / Updates Journal */}
          <div className="space-y-4 pt-4 border-t border-[#242c40]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#F3F3FA] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C7B9FF]" />
                <span>Creator Updates & Reflections</span>
              </h3>

              {isCreator && !isAddingUpdate && (
                <button
                  onClick={() => setIsAddingUpdate(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#151B29] text-[#C7B9FF] border border-[#242c40] hover:border-[#C7B9FF]/50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Post Update</span>
                </button>
              )}
            </div>

            {/* Post update form for creator */}
            {isCreator && isAddingUpdate && (
              <form onSubmit={handlePostUpdate} className="p-4 rounded-2xl bg-[#151B29] border border-[#30364A] space-y-3">
                <textarea
                  rows={3}
                  value={newUpdateText}
                  onChange={(e) => setNewUpdateText(e.target.value)}
                  placeholder="Share a reflection, milestone, or heartfelt note with members holding space..."
                  className="w-full p-3 rounded-xl bg-[#111827] border border-[#242c40] text-xs text-[#F3F3FA] placeholder-[#64708D] focus:outline-none focus:border-[#C7B9FF]/50 resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingUpdate(false)}
                    className="px-3 py-1 text-xs text-[#A8B1C8] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/40 cursor-pointer"
                  >
                    Publish Update
                  </button>
                </div>
              </form>
            )}

            {/* Updates list */}
            {selectedDetailIntention.updates.length === 0 ? (
              <p className="text-xs text-[#64708D] italic">
                No reflections posted yet by the creator.
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDetailIntention.updates.map((upd) => (
                  <div key={upd.id} className="p-3.5 rounded-xl bg-[#151B29]/80 border border-[#242c40] text-xs">
                    <div className="flex items-center justify-between text-[#64708D] mb-1.5">
                      <span className="font-medium text-[#C7B9FF]">{upd.authorName}</span>
                      <span>{new Date(upd.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <p className="text-[#F3F3FA] leading-relaxed">{upd.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Supportive Messages */}
          <div className="space-y-4 pt-4 border-t border-[#242c40]">
            <h3 className="text-sm font-medium text-[#F3F3FA] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#B9D1FF]" />
              <span>Words of Support ({selectedDetailIntention.messages.length})</span>
            </h3>

            {/* Message input */}
            <form onSubmit={handlePostMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder="Leave a short, respectful message of support..."
                className="flex-1 px-3.5 py-2 rounded-xl bg-[#151B29] border border-[#242c40] text-xs text-[#F3F3FA] placeholder-[#64708D] focus:outline-none focus:border-[#C7B9FF]/50"
              />
              <button
                type="submit"
                disabled={!newMessageText.trim()}
                className="px-4 py-2 rounded-xl bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/30 disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#C7B9FF]/60 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Messages list */}
            {selectedDetailIntention.messages.length === 0 ? (
              <p className="text-xs text-[#64708D] italic">
                No messages yet. Be the first to share gentle words.
              </p>
            ) : (
              <div className="space-y-2.5">
                {selectedDetailIntention.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 rounded-xl bg-[#151B29]/60 border border-[#242c40] flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-[#F3F3FA]">{msg.authorName}</span>
                        <span className="text-[10px] text-[#64708D]">
                          {new Date(msg.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-[#A8B1C8] leading-relaxed">{msg.content}</p>
                    </div>

                    {/* Moderation actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      {msg.authorId === currentUser.id ? (
                        <button
                          onClick={() => deleteMessage(selectedDetailIntention.id, msg.id)}
                          className="p-1 text-[#64708D] hover:text-[#FFB9D2] cursor-pointer"
                          title="Delete message"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      ) : (
                        <button
                          onClick={() => reportMessage(selectedDetailIntention.id, msg.id)}
                          className="p-1 text-[#64708D] hover:text-[#FFB9D2] cursor-pointer"
                          title="Report inappropriate content"
                        >
                          <Flag className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
