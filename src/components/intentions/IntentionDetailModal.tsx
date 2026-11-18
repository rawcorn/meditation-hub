'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Heart,
  MessageSquare,
  Plus,
  Send,
  Trash2,
  Waves,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useCurrentTimestamp } from '@/lib/useCurrentTimestamp';

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
    t,
    tCategory,
    language,
  } = useApp();

  const [newUpdateText, setNewUpdateText] = useState('');
  const [newMessageText, setNewMessageText] = useState('');
  const [isAddingUpdate, setIsAddingUpdate] = useState(false);
  const nowTimestamp = useCurrentTimestamp();

  if (!selectedDetailIntention) return null;

  const isJoined = joinedIntentionIds.includes(selectedDetailIntention.id);
  const isCreator = selectedDetailIntention.creatorId === currentUser.id;

  // Format scheduled local time
  const formatScheduledTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return language === 'es'
        ? `${date.toLocaleDateString('es-ES', { weekday: 'short', month: 'short', day: 'numeric' })} a las ${timeStr} (tu hora)`
        : `${date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at ${timeStr} (your time)`;
    } catch {
      return language === 'es' ? 'Sesión programada' : 'Scheduled session';
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
              {tCategory(selectedDetailIntention.category)}
            </span>

            {selectedDetailIntention.sessionType === 'scheduled' ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1b233a] text-[#B9D1FF] text-xs border border-[#B9D1FF]/30">
                <Calendar className="w-3 h-3" />
                <span>{language === 'es' ? 'Sesión grupal programada' : 'Scheduled Session'}</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full bg-[#151B29] text-[#A8B1C8] text-xs border border-[#242c40]">
                {language === 'es' ? 'Intención abierta' : 'Open Intention'}
              </span>
            )}

            {selectedDetailIntention.isSample && (
              <span className="text-[10px] text-[#64708D] uppercase tracking-wider font-medium">
                {language === 'es' ? 'Ejemplo' : 'Sample'}
              </span>
            )}
          </div>

          {/* Intention Title & Recipient */}
          <div>
            <div className="text-xs uppercase tracking-wider text-[#C7B9FF] font-medium mb-1">
              {t('card.for')}: {selectedDetailIntention.recipient}
            </div>
            <h2 id="detail-title" className="text-xl sm:text-2xl font-light tracking-tight text-[#F3F3FA]">
              {selectedDetailIntention.title}
            </h2>
            <div className="text-xs text-[#64708D] mt-1">
              {t('card.sharedBy')} {selectedDetailIntention.creatorName} · {selectedDetailIntention.participantCount}{' '}
              {language === 'es' ? 'practicantes unidos' : 'registered practitioners'}
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
                unoptimized={Boolean(selectedDetailIntention.imageUrl?.startsWith('data:') || selectedDetailIntention.imageUrl?.startsWith('http'))}
              />
            </div>
          )}

          {/* Scheduled notice */}
          {selectedDetailIntention.sessionType === 'scheduled' && selectedDetailIntention.scheduledAt && (
            new Date(selectedDetailIntention.scheduledAt).getTime() < (nowTimestamp || Date.now()) ? (
              <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#242c40] flex items-start gap-3 text-xs text-[#8E9AAE]">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#8E9AAE]" />
                <div>
                  <span className="font-semibold block text-sm text-[#F3F3FA]">
                    {language === 'es' ? 'Meditación grupal concluida' : 'Group Meditation Concluded'}
                  </span>
                  <span>
                    {language === 'es'
                      ? `Realizada el ${formatScheduledTime(selectedDetailIntention.scheduledAt)}. Aún puedes meditar y escribir en el diario.`
                      : `Held on ${formatScheduledTime(selectedDetailIntention.scheduledAt)}. You can still meditate and follow or post notes in the Journal.`}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-[#1b233a]/60 border border-[#B9D1FF]/30 flex items-start gap-3 text-xs text-[#B9D1FF]">
                <Clock className="w-4 h-4 shrink-0 mt-0.5 text-[#B9D1FF]" />
                <div>
                  <span className="font-semibold block text-sm">
                    {language === 'es' ? 'Meditación grupal' : 'Group Meditation'}
                  </span>
                  <span>{formatScheduledTime(selectedDetailIntention.scheduledAt)}</span>
                </div>
              </div>
            )
          )}

          {/* Description & Visualization Prompt */}
          <div className="space-y-3 bg-[#151B29]/60 p-4 sm:p-5 rounded-2xl border border-[#242c40]">
            <p className="text-xs sm:text-sm text-[#A8B1C8] leading-relaxed">
              {selectedDetailIntention.description}
            </p>

            {selectedDetailIntention.visualizationPrompt && (
              <div className="pt-3 border-t border-[#242c40]/80">
                <span className="text-[11px] font-medium text-[#C7B9FF] uppercase tracking-wide block mb-1">
                  {t('detail.visualizationSuggestion')}
                </span>
                <p className="text-xs sm:text-sm text-[#F3F3FA]/90 italic leading-relaxed">
                  &ldquo;{selectedDetailIntention.visualizationPrompt}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* Primary Action Row: Join Intention FIRST, then single Meditate button */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* 1. Join / Leave Button */}
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
                  <span>{t('card.joined')}</span>
                </>
              ) : (
                <>
                  <Heart className="w-3.5 h-3.5 text-[#64708D]" />
                  <span>{t('card.join')}</span>
                </>
              )}
            </button>

            {/* 2. Single Unified Meditate Button */}
            <button
              onClick={() => {
                setSelectedDetailIntention(null);
                startMeditationForIntention(selectedDetailIntention);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-medium bg-[#1b233a] hover:bg-[#253052] text-[#C7B9FF] border border-[#C7B9FF]/50 hover:border-[#C7B9FF]/90 transition-all cursor-pointer shadow-[0_0_15px_rgba(199,185,255,0.2)] active:scale-95"
            >
              <Waves size={16} strokeWidth={1.5} className="text-violet-200" />
              <span>{t('card.meditate')}</span>
            </button>

            {/* 3. Delete own intention (if creator) */}
            {isCreator && (
              <button
                onClick={() => {
                  if (confirm(t('detail.deleteIntentionConfirm'))) {
                    deleteIntention(selectedDetailIntention.id);
                  }
                }}
                className="p-2.5 rounded-full bg-[#151B29] text-[#64708D] hover:text-[#FFB9D2] border border-[#242c40] transition-colors cursor-pointer ml-auto"
                title={t('common.delete')}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Section: Creator Notes */}
          <div className="space-y-4 pt-4 border-t border-[#242c40]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#F3F3FA] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#C7B9FF]" />
                <span>{t('detail.updatesTitle')}</span>
              </h3>

              {isCreator && !isAddingUpdate && (
                <button
                  onClick={() => setIsAddingUpdate(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[#151B29] text-[#C7B9FF] border border-[#242c40] hover:border-[#C7B9FF]/50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('detail.addUpdateBtn')}</span>
                </button>
              )}
            </div>

            {/* Post note form for creator */}
            {isCreator && isAddingUpdate && (
              <form onSubmit={handlePostUpdate} className="p-4 rounded-2xl bg-[#151B29] border border-[#30364A] space-y-3">
                <textarea
                  rows={3}
                  value={newUpdateText}
                  onChange={(e) => setNewUpdateText(e.target.value)}
                  placeholder={t('detail.postUpdatePlaceholder')}
                  className="w-full p-3 rounded-xl bg-[#111827] border border-[#242c40] text-xs text-[#F3F3FA] placeholder-[#64708D] focus:outline-none focus:border-[#C7B9FF]/50 resize-none"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingUpdate(false)}
                    className="px-3 py-1 text-xs text-[#A8B1C8] cursor-pointer"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#1b233a] text-[#C7B9FF] border border-[#C7B9FF]/40 cursor-pointer"
                  >
                    {t('detail.postUpdateSubmit')}
                  </button>
                </div>
              </form>
            )}

            {/* Notes list */}
            {selectedDetailIntention.updates.length === 0 ? (
              <p className="text-xs text-[#64708D] italic">
                {t('detail.noUpdatesYet')}
              </p>
            ) : (
              <div className="space-y-3">
                {selectedDetailIntention.updates.map((upd) => (
                  <div key={upd.id} className="p-3.5 rounded-xl bg-[#151B29]/80 border border-[#242c40] text-xs">
                    <div className="flex items-center justify-between text-[#64708D] mb-1.5">
                      <span className="font-medium text-[#C7B9FF]">{upd.authorName}</span>
                      <span>{new Date(upd.date).toLocaleDateString(language === 'es' ? 'es-ES' : [], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <p className="text-[#F3F3FA] leading-relaxed">{upd.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Community Notes */}
          <div className="space-y-4 pt-4 border-t border-[#242c40]">
            <h3 className="text-sm font-medium text-[#F3F3FA] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#B9D1FF]" />
              <span>{t('detail.messagesTitle')} ({selectedDetailIntention.messages.length})</span>
            </h3>

            {/* Message input */}
            <form onSubmit={handlePostMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                placeholder={t('detail.addMessagePlaceholder')}
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
                {t('detail.noMessagesYet')}
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
                          {new Date(msg.date).toLocaleDateString(language === 'es' ? 'es-ES' : [], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className="text-[#A8B1C8] leading-relaxed">{msg.content}</p>
                    </div>

                    {/* Delete note (own message only) */}
                    {msg.authorId === currentUser.id && (
                      <div className="shrink-0">
                        <button
                          onClick={() => deleteMessage(selectedDetailIntention.id, msg.id)}
                          className="p-1 text-[#64708D] hover:text-[#FFB9D2] cursor-pointer transition-colors"
                          title={t('common.delete')}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
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
